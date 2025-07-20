import os
import asyncio
import websockets
import json
import base64

ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
if not ASSEMBLYAI_API_KEY:
    raise ValueError("ASSEMBLYAI_API_KEY environment variable is required")

ASSEMBLYAI_REALTIME_URL = "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000"

class AssemblyAIRealtimeSTT:
    def __init__(self, api_key=ASSEMBLYAI_API_KEY):
        self.api_key = api_key
        self.ws = None

    @property
    def is_connected(self):
        return self.ws is not None and self.ws.open

    async def connect(self):
        try:
            self.ws = await websockets.connect(
                ASSEMBLYAI_REALTIME_URL,
                extra_headers={"Authorization": self.api_key}
            )
        except Exception as e:
            print(f"[AssemblyAI] Connection error: {e}")
            self.ws = None

    async def send_audio(self, audio_chunk: bytes):
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        try:
            # AssemblyAI expects base64-encoded audio in JSON
            b64_audio = base64.b64encode(audio_chunk).decode("utf-8")
            await self.ws.send(json.dumps({"audio_data": b64_audio}))
        except Exception as e:
            print(f"[AssemblyAI] Send audio error: {e}")
            raise

    async def receive_transcript(self):
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        try:
            response = await self.ws.recv()
            data = json.loads(response)
            return data.get("text", "")
        except Exception as e:
            print(f"[AssemblyAI] Receive transcript error: {e}")
            return ""

    async def close(self):
        if self.ws:
            try:
                await self.ws.close()
            except Exception as e:
                print(f"[AssemblyAI] Close error: {e}")
            self.ws = None

# Usage example (to be integrated in main.py):
# stt = AssemblyAIRealtimeSTT()
# await stt.connect()
# await stt.send_audio(audio_chunk)
# transcript = await stt.receive_transcript()
# await stt.close() 