# Backend (FastAPI)

This directory contains the backend server for Project Co-Pilot, implemented in Python using FastAPI.

## Purpose
- Receives real-time audio streams from the Chrome extension via WebSocket
- Integrates with free/open-source or free-tier STT and LLM services
- Returns live summaries and suggestions to the client
- Manages user sessions, document context, and (optionally) stores meeting data

## Initial Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn websockets pydantic
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

## Architecture
- WebSocket endpoint for real-time audio and text
- Modular integration with STT/LLM providers
- Designed for easy migration from API-based to self-hosted models 