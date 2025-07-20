import aiohttp
import asyncio
import os

GOOGLE_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is required")

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"

SUMMARY_PROMPT = """
You are an AI meeting assistant. Given the following transcript, provide:
1. A concise, running summary (2-3 bullet points)
2. One proactive, context-aware suggestion for what the user should talk about next
Transcript:
"""

USER_QUERY_PROMPT = """
You are an AI meeting assistant. A user has asked you a question. Please provide a helpful, concise response.
User question: {question}
"""

async def get_summary_and_suggestion(transcript: str):
    """Async function to get LLM response"""
    try:
        prompt = SUMMARY_PROMPT + transcript
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 256
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(GEMINI_API_URL, json=data, timeout=10) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    return text
                else:
                    print(f"[Gemini] API error: {resp.status}")
                    return "I'm processing the audio. Please wait a moment..."
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return "I'm processing the audio. Please wait a moment..."

async def get_user_response(question: str):
    """Async function to handle user questions"""
    try:
        prompt = USER_QUERY_PROMPT.format(question=question)
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 512
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(GEMINI_API_URL, json=data, timeout=10) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    return text
                else:
                    print(f"[Gemini] API error: {resp.status}")
                    return "I'm processing your question. Please wait a moment..."
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return "I'm processing your question. Please wait a moment..."

# Keep the old function for backward compatibility
def get_summary_and_suggestion_sync(transcript: str):
    """Synchronous version for backward compatibility"""
    return asyncio.run(get_summary_and_suggestion(transcript)) 