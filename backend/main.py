"""
FastAPI backend for Project Co-Pilot
Real-time AI meeting assistant with speech-to-text and AI summarization
Enhanced with vector storage and real-time conversation points
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import asyncio
from auth_routes import router as auth_router
from deepgram_stt import DeepgramSTT
from gemini_llm import GeminiLLM
import ffmpeg
import tempfile
from database import (
    get_async_client, get_async_database, get_users_collection, get_meeting_sessions_collection,
    test_connection, sync_client
)
from vector_store import get_or_create_session_store, cleanup_session
from sentence_transformers import SentenceTransformer
import numpy as np
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = FastAPI(title="Project Co-Pilot Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

# Load embedding model once
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

@app.get("/")
async def root():
    return {"message": "Project Co-Pilot Backend is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is operational"}

active_connections = {}
session_data = {}
session_stt = {}
session_llm = {}

# Helper: send summary/points to frontend
async def send_gemini_summary(websocket, transcript_text):
    llm = GeminiLLM()
    summary = await llm.get_summary_and_suggestion(transcript_text)
    if summary:
        await websocket.send_text(json.dumps({
            "type": "summary",
            "summary": summary
        }))
    points = await llm.get_conversation_points(transcript_text)
    if points:
        await websocket.send_text(json.dumps({
            "type": "conversation_points",
            **points
        }))

def webm_to_pcm(audio_bytes: bytes) -> bytes:
    # Write the WebM/Opus audio to a temp file
    with tempfile.NamedTemporaryFile(suffix='.webm') as input_file, \
         tempfile.NamedTemporaryFile(suffix='.pcm') as output_file:
        input_file.write(audio_bytes)
        input_file.flush()
        # Use ffmpeg to convert to 16-bit PCM (mono, 16kHz)
        (
            ffmpeg
            .input(input_file.name)
            .output(output_file.name, format='s16le', acodec='pcm_s16le', ac=1, ar='16k')
            .run(quiet=True, overwrite_output=True)
        )
        output_file.seek(0)
        return output_file.read()

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_connections[session_id] = websocket
    session_data[session_id] = {"transcripts": [], "ai_responses": [], "conversation_points": []}
    print(f"🔗 WebSocket connected: {session_id}")
    stt = DeepgramSTT()
    session_stt[session_id] = stt
    transcript_accum = []
    gemini_lock = asyncio.Lock()
    vector_store = get_or_create_session_store(session_id)
    last_gemini_sent = 0
    last_transcript_len = 0
    gemini_task_cancel = False

    async def on_transcript(text):
        session_data[session_id]["transcripts"].append(text)
        await websocket.send_text(json.dumps({
            "type": "transcript",
            "text": text
        }))
        transcript_accum.append(text)
        # Generate embedding and store in vector DB
        embedding = embedding_model.encode(text)
        vector_store.add_text(text, np.array(embedding))

    async def gemini_background_task():
        nonlocal last_gemini_sent, last_transcript_len
        while not gemini_task_cancel:
            await asyncio.sleep(5)
            if len(transcript_accum) > last_transcript_len:
                async with gemini_lock:
                    await send_gemini_summary(websocket, "\n".join(transcript_accum))
                    last_transcript_len = len(transcript_accum)

    gemini_task = asyncio.create_task(gemini_background_task())
    await stt.connect(websocket, on_transcript)
    try:
        await websocket.send_text(json.dumps({
            "type": "connection",
            "status": "connected",
            "session_id": session_id
        }))
        
        # Check if Deepgram connection was successful
        if not stt.is_connected:
            print("❌ Deepgram connection failed - audio will not be transcribed")
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to connect to speech recognition service"
            }))
        
        while True:
            try:
                message = await websocket.receive()
                if 'bytes' in message and message['bytes'] is not None:
                    audio_data = message['bytes']
                    print(f"📦 Received PCM audio chunk: {len(audio_data)} bytes")
                    
                    # Send PCM data directly to Deepgram (no transcoding needed)
                    try:
                        await stt.process_audio(audio_data)
                    except Exception as e:
                        print(f"❌ Deepgram processing error: {e}")
                        
                    await websocket.send_text(json.dumps({
                        "type": "audio_ack",
                        "status": "received",
                        "chunk_size": len(audio_data)
                    }))
                elif 'text' in message and message['text'] is not None:
                    try:
                        data = json.loads(message['text'])
                        msg_type = data.get("type")
                        print(f"📨 Received {msg_type} message from {session_id}")
                        if msg_type == "text":
                            text = data.get("text", "")
                            if text.strip():
                                session_data[session_id]["transcripts"].append(text)
                                await websocket.send_text(json.dumps({
                                    "type": "text_ack",
                                    "status": "received",
                                    "text": text
                                }))
                        elif msg_type == "user_message":
                            # User asked a question: semantic search + Gemini answer
                            question = data.get("message", "")
                            if question.strip():
                                # Embed the question
                                q_embedding = embedding_model.encode(question)
                                # Search vector store
                                context_chunks = vector_store.search_relevant_context(np.array(q_embedding), k=5)
                                context_text = "\n".join(context_chunks)
                                # Compose prompt for Gemini
                                llm = GeminiLLM()
                                prompt = f"Context:\n{context_text}\n\nUser question: {question}\n\nAnswer as a helpful meeting assistant."
                                ai_answer = await llm.get_summary_and_suggestion(prompt)
                                await websocket.send_text(json.dumps({
                                    "type": "ai_answer",
                                    "text": ai_answer or "Sorry, I couldn't find an answer."
                                }))
                        elif msg_type == "ping":
                            await websocket.send_text(json.dumps({
                                "type": "pong",
                                "timestamp": asyncio.get_event_loop().time()
                            }))
                        else:
                            print(f"⚠️ Unknown message type: {msg_type}")
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": f"Unknown message type: {msg_type}"
                            }))
                    except json.JSONDecodeError:
                        print("❌ Invalid JSON received")
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Invalid JSON format"
                        }))
                else:
                    print(f"⚠️ Unknown message format: {message}")
            except Exception as e:
                print(f"❌ Error processing message: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Processing error: {str(e)}"
                }))
    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: {session_id}")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        gemini_task_cancel = True
        if gemini_task:
            gemini_task.cancel()
        if session_id in active_connections:
            del active_connections[session_id]
        if session_id in session_stt:
            await session_stt[session_id].disconnect()
            del session_stt[session_id]
        cleanup_session(session_id)
        await asyncio.sleep(1)
        if session_id in session_data:
            del session_data[session_id]
        print(f"🧹 Cleaned up session: {session_id}")

@app.get("/sessions")
async def get_sessions():
    """Get list of active sessions"""
    return {
        "active_connections": len(active_connections),
        "session_ids": list(active_connections.keys())
    }

@app.get("/session/{session_id}")
async def get_session_data(session_id: str):
    """Get data for a specific session"""
    if session_id in session_data:
        data = session_data[session_id]
        return {
            "session_id": session_id,
            "transcript_count": len(data["transcripts"]),
            "ai_response_count": len(data["ai_responses"]),
            "conversation_points_count": len(data["conversation_points"]),
            "recent_transcripts": data["transcripts"][-5:],  # Last 5 transcripts
            "recent_ai_responses": data["ai_responses"][-3:],  # Last 3 AI responses
            "latest_conversation_points": data["conversation_points"][-1] if data["conversation_points"] else None
        }
    else:
        return {"error": "Session not found"}

@app.get("/stats")
async def get_stats():
    users_collection = app.state.users_collection
    meeting_sessions_collection = app.state.meeting_sessions_collection
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = await users_collection.count_documents({"last_login": {"$gte": thirty_days_ago}})
    total_meetings = await meeting_sessions_collection.count_documents({})
    pipeline = [
        {"$match": {"end_time": {"$ne": None}}},
        {"$project": {"duration": {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 1000 * 60 * 60]}}},
        {"$group": {"_id": None, "total_hours": {"$sum": "$duration"}}}
    ]
    result = await meeting_sessions_collection.aggregate(pipeline).to_list(length=1)
    total_hours = result[0]["total_hours"] if result else 0
    return {
        "active_users": active_users,
        "meetings_transcribed": total_meetings,
        "hours_of_insights": round(total_hours)
    }

@app.on_event("startup")
async def startup_event():
    # Initialize async MongoDB client and collections in app.state
    app.state.async_client = get_async_client()
    app.state.async_database = get_async_database(app.state.async_client)
    app.state.users_collection = get_users_collection(app.state.async_database)
    app.state.meeting_sessions_collection = get_meeting_sessions_collection(app.state.async_database)
    success = await test_connection(
        app.state.async_client,
        sync_client,
        app.state.users_collection,
        app.state.meeting_sessions_collection
    )
    if not success:
        print("❌ MongoDB connection failed at startup. Check your .env and network.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 