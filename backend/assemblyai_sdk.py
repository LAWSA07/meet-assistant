"""
AssemblyAI Real-time Speech-to-Text using Official SDK
"""

import asyncio
import os
from typing import Optional, Callable
from dotenv import load_dotenv
import assemblyai as aai

# Load environment variables
load_dotenv()

# Get API key from environment
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
if not ASSEMBLYAI_API_KEY:
    print("[AssemblyAI] Warning: ASSEMBLYAI_API_KEY not found in environment")

class AssemblyAIRealtimeSTT:
    """
    AssemblyAI Real-time Speech-to-Text using Official SDK
    """
    
    def __init__(self, on_transcript: Optional[Callable] = None):
        self.api_key = ASSEMBLYAI_API_KEY
        self.on_transcript = on_transcript
        self.transcriber = None
        self._is_connected = False
        
    @property
    def is_connected(self):
        return self._is_connected and self.transcriber is not None
    
    async def connect(self):
        """Connect to AssemblyAI using official SDK"""
        if not self.api_key:
            print("[AssemblyAI] Error: No API key configured")
            return False
            
        try:
            # Configure the transcriber
            aai.settings.api_key = self.api_key
            
            # Create transcriber with real-time configuration
            self.transcriber = aai.RealtimeTranscriber(
                sample_rate=16000,
                on_data=self._on_data,
                on_error=self._on_error,
                on_open=self._on_open,
                on_close=self._on_close
            )
            
            # Start the connection
            await self.transcriber.connect()
            self._is_connected = True
            
            print("[AssemblyAI] Connected using official SDK")
            return True
            
        except Exception as e:
            print(f"[AssemblyAI] Connection error: {e}")
            return False
    
    def _on_data(self, transcript):
        """Handle incoming transcript data"""
        if transcript.text and self.on_transcript:
            asyncio.create_task(self.on_transcript(transcript.text))
        print(f"[AssemblyAI] Transcript: {transcript.text}")
    
    def _on_error(self, error):
        """Handle errors"""
        print(f"[AssemblyAI] Error: {error}")
        self._is_connected = False
    
    def _on_open(self, session_id):
        """Handle connection open"""
        print(f"[AssemblyAI] Session opened: {session_id}")
        self._is_connected = True
    
    def _on_close(self):
        """Handle connection close"""
        print("[AssemblyAI] Session closed")
        self._is_connected = False
    
    async def send_audio(self, audio_chunk: bytes):
        """Send audio chunk to AssemblyAI"""
        if not self.is_connected:
            print("[AssemblyAI] Error: Transcriber not connected")
            return False
            
        try:
            # Send audio data to the transcriber
            self.transcriber.stream(audio_chunk)
            return True
            
        except Exception as e:
            print(f"[AssemblyAI] Send audio error: {e}")
            return False
    
    async def close(self):
        """Close the connection"""
        if self.transcriber:
            try:
                await self.transcriber.close()
            except Exception as e:
                print(f"[AssemblyAI] Close error: {e}")
            finally:
                self.transcriber = None
                self._is_connected = False 