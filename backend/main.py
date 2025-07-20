from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import uuid
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from assemblyai_stt import AssemblyAIRealtimeSTT
from gemini_llm import get_summary_and_suggestion, get_user_response
from vector_store import get_or_create_session_store, cleanup_session
from embedding_service import get_embedding
from auth_routes import router as auth_router
from database import create_indexes
import asyncio

app = FastAPI(title="Project Co-Pilot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on startup"""
    await create_indexes()

# In-memory store: session_id -> list of transcript chunks
session_store: Dict[str, List[str]] = {}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Project Co-Pilot FastAPI backend running."}

@app.get("/ws-test")
def websocket_test():
    return {"status": "ok", "message": "WebSocket endpoint available at /ws/audio"}

@app.get("/test-llm")
async def test_llm():
    try:
        from gemini_llm import get_user_response
        result = await get_user_response("Hello, how are you?")
        return {"status": "ok", "response": result}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    session_id = None
    stt = None
    vector_store = None
    
    try:
        await websocket.accept()
        session_id = str(uuid.uuid4())
        session_store[session_id] = []
        
        # Initialize vector store for this session
        vector_store = get_or_create_session_store(session_id)
        
        # Initialize STT (but don't connect yet - only when needed)
        stt = AssemblyAIRealtimeSTT()
        
        # Send initial connection message
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": "WebSocket connected successfully!"
        })
        
        print(f"WebSocket connected for session {session_id}")
        
        while True:
            try:
                # Try to receive data (could be text or bytes)
                try:
                    data = await websocket.receive_text()
                    print(f"Received text message: {data[:100]}...")
                    
                    # Handle text messages (like user queries)
                    try:
                        message_data = json.loads(data)
                        if message_data.get("type") == "user_message":
                            user_message = message_data.get("message", "")
                            print(f"Processing user message: {user_message}")
                            
                            # Send immediate acknowledgment
                            await websocket.send_json({
                                "type": "user_response",
                                "summary_and_suggestion": "I'm processing your question. Please wait a moment...",
                                "user_message": user_message
                            })
                            
                            # Process user message with LLM asynchronously
                            try:
                                llm_result = await get_user_response(user_message)
                                await websocket.send_json({
                                    "type": "user_response",
                                    "summary_and_suggestion": llm_result,
                                    "user_message": user_message
                                })
                            except Exception as e:
                                print(f"Error processing user message: {e}")
                                await websocket.send_json({
                                    "type": "user_response",
                                    "summary_and_suggestion": "I'm sorry, I encountered an error. Please try again.",
                                    "user_message": user_message
                                })
                        elif message_data.get("type") == "test":
                            await websocket.send_json({
                                "type": "test_response",
                                "message": "Test message received successfully!"
                            })
                    except json.JSONDecodeError:
                        # Handle plain text messages
                        try:
                            llm_result = await get_user_response(data)
                            await websocket.send_json({
                                "type": "text_response",
                                "summary_and_suggestion": llm_result,
                                "input_text": data
                            })
                        except Exception as e:
                            print(f"Error processing plain text: {e}")
                            await websocket.send_json({
                                "type": "text_response",
                                "summary_and_suggestion": "I'm sorry, I encountered an error. Please try again.",
                                "input_text": data
                            })
                        
                except Exception as text_error:
                    # If text receive fails, try to receive as bytes (audio data)
                    try:
                        data = await websocket.receive_bytes()
                        print(f"Received audio data: {len(data)} bytes")
                        
                        # Only connect STT if we haven't already
                        if not stt.is_connected:
                            await stt.connect()
                            print("STT connected for audio processing")
                        
                        # Send audio chunk to AssemblyAI and get transcript
                        await stt.send_audio(data)
                        transcript_chunk = await stt.receive_transcript() or ""
                        
                        if transcript_chunk.strip():
                            print(f"Transcript: {transcript_chunk}")
                            # Store in session transcript
                            session_store[session_id].append(transcript_chunk)
                            
                            # Generate embedding and add to vector store
                            embedding = get_embedding(transcript_chunk)
                            vector_store.add_text(transcript_chunk, embedding)
                            
                            # Get semantically relevant context for LLM
                            current_embedding = get_embedding(transcript_chunk)
                            relevant_context = vector_store.search_relevant_context(current_embedding, k=5)
                            
                            # Use relevant context for LLM (fallback to all text if vector store is empty)
                            context_for_llm = " ".join(relevant_context) if relevant_context else vector_store.get_all_texts()
                            
                            # Call Gemini for summary and suggestion
                            try:
                                llm_result = await get_summary_and_suggestion(context_for_llm)
                                await websocket.send_json({
                                    "type": "audio_response",
                                    "summary_and_suggestion": llm_result,
                                    "context": context_for_llm,
                                    "transcript_chunk": transcript_chunk
                                })
                            except Exception as e:
                                print(f"Error processing audio with LLM: {e}")
                                await websocket.send_json({
                                    "type": "audio_response",
                                    "summary_and_suggestion": "I'm processing the audio. Please wait a moment...",
                                    "context": context_for_llm,
                                    "transcript_chunk": transcript_chunk
                                })
                    except Exception as audio_error:
                        print(f"Error processing audio data: {audio_error}")
                        # Don't continue the loop if there's a serious error
                        if "disconnect" in str(audio_error).lower():
                            break
                        continue
                        
            except Exception as loop_error:
                print(f"Error in main WebSocket loop: {loop_error}")
                break
                    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"Unexpected error in WebSocket endpoint: {e}")
    finally:
        # Clean up resources
        if stt and hasattr(stt, 'close'):
            try:
                await stt.close()
                print(f"STT connection closed for session {session_id}")
            except Exception as e:
                print(f"Error closing STT: {e}")
        
        if session_id and session_id in session_store:
            try:
                cleanup_session(session_id)
                del session_store[session_id]
                print(f"Session {session_id} cleaned up")
            except Exception as e:
                print(f"Error cleaning up session: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True) 