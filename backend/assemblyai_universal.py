"""
AssemblyAI Universal-Streaming Speech-to-Text
"""

import asyncio
import json
import websockets
import os
from typing import Optional, Callable
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
if not ASSEMBLYAI_API_KEY:
    print("[AssemblyAI] Warning: ASSEMBLYAI_API_KEY not found in environment")

class AssemblyAIRealtimeSTT:
    """
    AssemblyAI Universal-Streaming Speech-to-Text
    """
    
    def __init__(self, on_transcript: Optional[Callable] = None):
        self.api_key = ASSEMBLYAI_API_KEY
        self.on_transcript = on_transcript
        self.websocket = None
        self._is_connected = False
        
    @property
    def is_connected(self):
        return self._is_connected and self.websocket is not None and self.websocket.open
    
    async def connect(self):
        """Connect to AssemblyAI Universal-Streaming"""
        if not self.api_key:
            print("[AssemblyAI] Error: No API key configured")
            return False
            
        try:
            # Universal-Streaming endpoint with correct parameters
            url = "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&encoding=pcm_s16le&endpointing=400&punctuate=true&language_code=en"
            
            headers = {
                "Authorization": self.api_key
            }
            
            self.websocket = await websockets.connect(
                url,
                extra_headers=headers
            )
            self._is_connected = True
            
            print("[AssemblyAI] Connected to Universal-Streaming")
            
            # Start listening for messages
            asyncio.create_task(self._listen_for_messages())
            
            return True
            
        except Exception as e:
            print(f"[AssemblyAI] Connection error: {e}")
            return False
    
    async def _listen_for_messages(self):
        """Listen for incoming transcript messages"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                
                # Handle Universal-Streaming message types
                if "text" in data:
                    text = data["text"]
                    if text and self.on_transcript:
                        await self.on_transcript(text)
                    print(f"[AssemblyAI] Transcript: {text}")
                
                elif "message_type" in data:
                    msg_type = data["message_type"]
                    if msg_type == "FinalTranscript":
                        text = data.get("text", "")
                        if text and self.on_transcript:
                            await self.on_transcript(text)
                        print(f"[AssemblyAI] Final: {text}")
                    elif msg_type == "PartialTranscript":
                        text = data.get("text", "")
                        print(f"[AssemblyAI] Partial: {text}")
                
                elif "error" in data:
                    error = data["error"]
                    print(f"[AssemblyAI] Error: {error}")
                    
                elif "session_begins" in data:
                    print("[AssemblyAI] Session started successfully")
                    
                elif "session_terminated" in data:
                    print("[AssemblyAI] Session terminated")
                    self._is_connected = False
                    
        except websockets.exceptions.ConnectionClosed:
            print("[AssemblyAI] WebSocket connection closed")
            self._is_connected = False
        except Exception as e:
            print(f"[AssemblyAI] Message handling error: {e}")
            self._is_connected = False
    
    async def send_audio(self, audio_chunk: bytes):
        """Send audio chunk to AssemblyAI"""
        if not self.is_connected:
            print("[AssemblyAI] Error: WebSocket not connected")
            return False
            
        try:
            # Universal-Streaming expects raw audio bytes
            await self.websocket.send(audio_chunk)
            return True
            
        except Exception as e:
            print(f"[AssemblyAI] Send audio error: {e}")
            return False
    
    async def close(self):
        """Close the WebSocket connection"""
        if self.websocket:
            try:
                await self.websocket.close()
            except Exception as e:
                print(f"[AssemblyAI] Close error: {e}")
            finally:
                self.websocket = None
                self._is_connected = False 