"""
Google Gemini LLM integration for Project Co-Pilot
Enhanced for real-time conversation points and proactive suggestions
"""

import asyncio
import aiohttp
import json
import os
from typing import Optional, Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiLLM:
    """Google Gemini LLM integration with enhanced conversation analysis"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if not self.api_key:
            print("[Gemini] Warning: GOOGLE_GEMINI_API_KEY not found in environment")
        self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    
    async def get_summary_and_suggestion(self, conversation_text: str) -> Optional[str]:
        """Get AI summary and suggestions based on conversation"""
        if not self.api_key:
            print("[Gemini] Error: No API key configured")
            return None
            
        try:
            prompt = f"""
            You are an AI meeting assistant. Analyze this conversation and provide:
            1. A brief summary of the key points discussed (crisp, bullet points, max 3)
            2. Action items or next steps (crisp, bullet points, max 3)
            3. Suggestions for improving the discussion (crisp, bullet points, max 2)
            
            Conversation: {conversation_text}
            
            Please provide a concise, helpful response. Use bullet points. Be direct and to the point.
            """
            
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Extract the response text
                        if "candidates" in result and len(result["candidates"]) > 0:
                            candidate = result["candidates"][0]
                            if "content" in candidate and "parts" in candidate["content"]:
                                parts = candidate["content"]["parts"]
                                if len(parts) > 0 and "text" in parts[0]:
                                    return parts[0]["text"]
                        
                        print(f"[Gemini] Unexpected response format: {result}")
                        return None
                    else:
                        error_text = await response.text()
                        print(f"[Gemini] API error: {response.status} - {error_text}")
                        return None
                        
        except Exception as e:
            print(f"[Gemini] Error: {e}")
            return None

    async def get_conversation_points(self, conversation_text: str, context: List[str] = None) -> Dict[str, any]:
        """Get real-time conversation points and suggestions"""
        if not self.api_key:
            print("[Gemini] Error: No API key configured")
            return None
            
        try:
            # Build context-aware prompt
            context_text = ""
            if context:
                context_text = f"\n\nPrevious relevant context:\n" + "\n".join(context[-3:])  # Last 3 relevant pieces
            
            prompt = f"""
            You are an AI meeting assistant providing real-time conversation insights. 
            Analyze this conversation and provide structured feedback in JSON format.
            
            Current conversation: {conversation_text}{context_text}
            
            Please respond with a JSON object containing:
            {{
                "summary": "1-2 sentence summary of key points discussed (crisp, direct)",
                "action_items": ["max 3, bullet points, actionable, crisp"],
                "talking_points": ["max 3, bullet points, crisp, what to discuss next"],
                "questions": ["max 2, crisp, relevant questions to ask"],
                "insights": "one key insight or observation (crisp)",
                "suggestions": ["max 2, proactive, crisp suggestions for improvement"]
            }}
            
            Keep responses concise, actionable, and to the point. Use bullet points where possible.
            """
            
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 512
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=15) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Extract the response text
                        if "candidates" in result and len(result["candidates"]) > 0:
                            candidate = result["candidates"][0]
                            if "content" in candidate and "parts" in candidate["content"]:
                                parts = candidate["content"]["parts"]
                                if len(parts) > 0 and "text" in parts[0]:
                                    response_text = parts[0]["text"]
                                    
                                    # Try to parse as JSON
                                    try:
                                        # Clean up the response text to extract JSON
                                        json_start = response_text.find('{')
                                        json_end = response_text.rfind('}') + 1
                                        if json_start != -1 and json_end != 0:
                                            json_text = response_text[json_start:json_end]
                                            parsed_response = json.loads(json_text)
                                            return parsed_response
                                        else:
                                            # Fallback: return structured text response
                                            return {
                                                "summary": response_text[:200] + "..." if len(response_text) > 200 else response_text,
                                                "action_items": [],
                                                "talking_points": [],
                                                "questions": [],
                                                "insights": "Analysis complete",
                                                "suggestions": []
                                            }
                                    except json.JSONDecodeError:
                                        # Fallback: return structured text response
                                        return {
                                            "summary": response_text[:200] + "..." if len(response_text) > 200 else response_text,
                                            "action_items": [],
                                            "talking_points": [],
                                            "questions": [],
                                            "insights": "Analysis complete",
                                            "suggestions": []
                                        }
                        
                        print(f"[Gemini] Unexpected response format: {result}")
                        return None
                    else:
                        error_text = await response.text()
                        print(f"[Gemini] API error: {response.status} - {error_text}")
                        return None
                        
        except Exception as e:
            print(f"[Gemini] Error in get_conversation_points: {e}")
            return None

    async def get_quick_suggestion(self, current_topic: str, conversation_history: List[str]) -> str:
        """Get a quick, context-aware suggestion for what to talk about next"""
        if not self.api_key:
            return "Continue with your current topic."
            
        try:
            # Use recent history for context
            recent_history = " ".join(conversation_history[-5:]) if conversation_history else ""
            
            prompt = f"""
            You are an AI meeting assistant. The user is currently talking about: "{current_topic}"
            
            Recent conversation context: {recent_history}
            
            Provide ONE specific, actionable suggestion for what they should talk about next. 
            Keep it to 1-2 sentences maximum. Be specific and relevant to their current topic.
            
            Suggestion:
            """
            
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 100
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, timeout=10) as response:
                    if response.status == 200:
                        result = await response.json()
                        if "candidates" in result and result["candidates"]:
                            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
                        else:
                            return "Continue exploring your current topic."
                    else:
                        return "Continue with your current topic."
                        
        except Exception as e:
            print(f"[Gemini] Error in get_quick_suggestion: {e}")
            return "Continue with your current topic."

# Legacy functions for backward compatibility
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
    """Async function to get LLM response with detailed error handling."""
    llm = GeminiLLM()
    return await llm.get_summary_and_suggestion(transcript)

async def get_user_response(question: str):
    """Async function to handle user questions"""
    llm = GeminiLLM()
    return await llm.get_summary_and_suggestion(question)

# Keep the old function for backward compatibility
def get_summary_and_suggestion_sync(transcript: str):
    """Synchronous version for backward compatibility"""
    return asyncio.run(get_summary_and_suggestion(transcript)) 