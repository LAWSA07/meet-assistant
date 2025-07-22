"""
Mock Transcription Service for Testing
"""

import asyncio
import random
import time
from typing import Optional, Callable

class MockTranscriber:
    """
    Mock transcription service for testing audio flow
    """
    
    def __init__(self, on_transcript: Optional[Callable] = None):
        self.on_transcript = on_transcript
        self._is_connected = False
        self._audio_buffer = b""
        self._processing_task = None
        
    @property
    def is_connected(self):
        return self._is_connected
    
    async def connect(self):
        """Simulate connection"""
        self._is_connected = True
        print("[MockTranscriber] Connected successfully")
        return True
    
    async def send_audio(self, audio_chunk: bytes):
        """Simulate audio processing"""
        if not self.is_connected:
            print("[MockTranscriber] Error: Not connected")
            return False
            
        try:
            # Accumulate audio data
            self._audio_buffer += audio_chunk
            
            # Simulate processing delay
            await asyncio.sleep(0.1)
            
            # Generate mock transcript every few chunks
            if len(self._audio_buffer) > 8000:  # Every ~1 second of audio
                await self._generate_mock_transcript()
                self._audio_buffer = b""  # Reset buffer
                
            return True
            
        except Exception as e:
            print(f"[MockTranscriber] Send audio error: {e}")
            return False
    
    async def _generate_mock_transcript(self):
        """Generate a mock transcript"""
        mock_phrases = [
            "Hello, how are you today?",
            "This is a test of the transcription system.",
            "The audio is being processed successfully.",
            "We can hear you clearly.",
            "Please continue speaking.",
            "The meeting is going well.",
            "Thank you for your input.",
            "Let's discuss this further.",
            "I understand your point.",
            "That's a great idea."
        ]
        
        # Select a random phrase
        transcript = random.choice(mock_phrases)
        
        if self.on_transcript:
            await self.on_transcript(transcript)
        
        print(f"[MockTranscriber] Generated transcript: {transcript}")
    
    async def close(self):
        """Close the connection"""
        self._is_connected = False
        if self._processing_task:
            self._processing_task.cancel()
        print("[MockTranscriber] Connection closed") 