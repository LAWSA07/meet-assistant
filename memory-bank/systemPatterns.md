# System Patterns

## Architecture Overview
- Chrome extension captures tab audio and injects overlay UI
- Audio processed in a Web Worker, streamed to backend via WebSocket
- Backend (Python/FastAPI) routes audio to STT (free/open-source or free-tier API)
- Transcripts and conversation state sent to LLM for summarization and suggestions
- Overlay UI receives updates via WebSocket and displays them in real time

## Key Technical Decisions
- Use of free/open-source models (Whisper, BART, T5, LLaMA, etc.) and free-tier APIs
- WebSocket for low-latency, bidirectional communication
- Web Worker for non-blocking audio processing
- CSS isolation for overlay UI

## Design Patterns
- Rolling summary/map-reduce for LLM context management
- Modular, swappable AI service integration
- Privacy-first: no bot joins, all processing is user-initiated and transparent 