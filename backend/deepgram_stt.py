import asyncio
import json
import base64
import websockets
import logging
from typing import Optional, Callable
import os

logger = logging.getLogger(__name__)

class DeepgramSTT:
    """Real-time speech-to-text using Deepgram's WebSocket API"""
    
    def __init__(self, api_key: str = None):
        if api_key is None:
            api_key = os.getenv("DEEPGRAM_API_KEY", "")
        self.api_key = api_key
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.deepgram_ws: Optional[websockets.WebSocketClientProtocol] = None
        self.is_connected = False
        self.on_transcript: Optional[Callable] = None
        self.audio_queue = asyncio.Queue()
        
    async def connect(self, websocket: websockets.WebSocketServerProtocol, on_transcript: Callable):
        """Connect to Deepgram and set up real-time transcription"""
        self.websocket = websocket
        self.on_transcript = on_transcript
        
        try:
            # Connect to Deepgram WebSocket API with proper parameters
            deepgram_url = "wss://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate=16000&channels=1&punctuate=true&smart_format=true&interim_results=true"
            
            print("🔗 Connecting to Deepgram WebSocket API...")
            print(f"🔗 Deepgram URL: {deepgram_url}")
            # print(f"🔗 API Key: {self.api_key[:10]}...")
            
            self.deepgram_ws = await websockets.connect(
                deepgram_url,
                extra_headers=[("Authorization", f"Token {self.api_key}")]
            )
            
            self.is_connected = True
            print("✅ Connected to Deepgram successfully")
            
            # Send initial silence to keep connection alive
            initial_silence = b'\x00' * 1024
            await self.deepgram_ws.send(initial_silence)
            print("✅ Sent initial audio data to Deepgram")
            
            # Start listening for Deepgram responses
            asyncio.create_task(self._listen_to_deepgram())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to connect to Deepgram: {repr(e)}")
            print(f"❌ Error type: {type(e).__name__}")
            self.is_connected = False
            return False
    
    async def _listen_to_deepgram(self):
        """Listen for transcription results from Deepgram"""
        try:
            print("🎧 Started listening for Deepgram responses...")
            async for message in self.deepgram_ws:
                print(f"📨 Raw message from Deepgram: {message[:200]}...")
                
                try:
                    data = json.loads(message)
                    print(f"📨 Parsed Deepgram response: {json.dumps(data, indent=2)[:300]}...")
                    
                    # Handle metadata messages
                    if data.get("type") == "Metadata":
                        print(f"📊 Deepgram metadata: {data.get('request_id', 'unknown')}")
                        continue
                    
                    # Handle transcript messages
                    if "channel" in data and "alternatives" in data["channel"]:
                        transcript = data["channel"]["alternatives"][0].get("transcript", "")
                        is_final = data.get("is_final", False)
                        
                        print(f"📝 Deepgram transcript: '{transcript}' (final: {is_final})")
                        
                        if transcript.strip() and is_final:
                            print(f"✅ Final transcript: {transcript}")
                            
                            # Send transcript back to client
                            if self.on_transcript:
                                await self.on_transcript(transcript)
                    
                    # Handle errors
                    elif "error" in data:
                        print(f"❌ Deepgram error: {data['error']}")
                    
                    # Handle other message types
                    else:
                        print(f"📨 Unknown Deepgram message type: {data.get('type', 'no type')}")
                        
                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse Deepgram message: {e}")
                    print(f"❌ Raw message: {message}")
                    
        except websockets.exceptions.ConnectionClosed as e:
            print(f"🔌 Deepgram connection closed: {e.code} {e.reason}")
            if e.code == 1011:
                print("⚠️ Deepgram timeout - no audio data received within timeout window")
        except Exception as e:
            print(f"❌ Error listening to Deepgram: {repr(e)}")
            print(f"❌ Error type: {type(e).__name__}")
        finally:
            self.is_connected = False
    
    async def process_audio(self, audio_data: bytes):
        """Send audio data to Deepgram for transcription"""
        if not self.is_connected or not self.deepgram_ws:
            print("⚠️ Not connected to Deepgram")
            return False
        
        try:
            # Ensure audio data is in correct format (16-bit PCM)
            if len(audio_data) % 2 != 0:
                print("⚠️ Audio data length must be even (16-bit samples)")
                return False
            
            # Send audio data to Deepgram immediately
            await self.deepgram_ws.send(audio_data)
            print(f"📤 Sent {len(audio_data)} bytes to Deepgram")
            return True
            
        except Exception as e:
            print(f"❌ Error sending audio to Deepgram: {repr(e)}")
            self.is_connected = False
            return False
    
    async def disconnect(self):
        """Close the Deepgram connection"""
        self.is_connected = False
        
        if self.deepgram_ws:
            try:
                await self.deepgram_ws.close()
                logger.info("🔌 Disconnected from Deepgram")
            except Exception as e:
                logger.error(f"❌ Error closing Deepgram connection: {repr(e)}")
        
        self.deepgram_ws = None 