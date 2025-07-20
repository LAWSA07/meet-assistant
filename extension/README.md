# Chrome Extension (Overlay UI)

This directory contains the Chrome extension for Project Co-Pilot.

## Purpose
- Captures tab audio using chrome.tabCapture
- Injects a transparent, draggable overlay UI into meeting pages
- Streams audio to the backend via WebSocket
- Receives and displays real-time summaries and suggestions

## Core Features
- Non-intrusive, semi-transparent overlay
- Real-time, glanceable summary and talking points
- Minimalist controls (start/stop, transparency, minimize)

## Initial Setup
1. Load the extension in Chrome (Developer Mode > Load unpacked)
2. Click the extension icon to activate the overlay
3. Start a meeting and test audio capture/overlay

## Architecture
- Content script injects overlay UI
- Background script manages tab audio capture and WebSocket connection
- Isolated CSS/JS to prevent conflicts with host page 