# Tech Context

## Technology Stack
- **Frontend:** Chrome extension (HTML, CSS, JavaScript; optional React for overlay UI)
- **Backend:** Python (FastAPI)
- **Real-Time Communication:** WebSocket (client and server)
- **STT:** Open-source (Whisper, DeepSpeech, Wav2Vec 2.0, RealtimeSTT) or free-tier APIs (Deepgram, Google STT)
- **LLM:** Free-tier APIs (Gemini, Claude, OpenRouter, Hugging Face) or open-source models (BART, T5, LLaMA, Gemma, Falcon) via Ollama/LM Studio/Jan
- **Hosting:** PythonAnywhere, Google App Engine, HelioHost (free tiers)
- **Database:** Optional for MVP; file-based or in-memory, with future support for PostgreSQL or vector DB (FAISS, Pinecone)

## Development Setup
- Python 3.9+
- Node.js (for extension build tooling, if needed)
- Git for version control

## Technical Constraints
- Must run on free or open-source services
- No vendor lock-in; easy migration from API to self-hosted models
- Privacy-first: all user data encrypted in transit and at rest

## Dependencies
- FastAPI, WebSockets, pydantic (backend)
- Whisper/DeepSpeech/Wav2Vec/RealtimeSTT (STT)
- Hugging Face Transformers, Ollama, or LM Studio (LLM)
- Chrome Extension APIs (frontend) 