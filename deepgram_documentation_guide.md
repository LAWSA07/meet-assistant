# Deepgram Real-time Streaming API Documentation Guide

## Overview
Deepgram's real-time streaming API allows you to transcribe audio as it's being recorded, providing low-latency transcription results.

## Authentication
- **API Key**: Required for all requests
- **Header Format**: `Authorization: Token YOUR_API_KEY`
- **Rate Limits**: Varies by plan (Pay-as-you-go: 50 concurrent connections)

## WebSocket Connection

### Connection URL
```
wss://api.deepgram.com/v1/listen
```

### Required Query Parameters
- `model`: Speech recognition model (e.g., `nova-3`, `nova-2`, `enhanced`, `base`)
- `encoding`: Audio encoding format (e.g., `linear16`, `mulaw`, `flac`)
- `sample_rate`: Audio sample rate in Hz (e.g., `16000`, `8000`)

### Optional Query Parameters
- `channels`: Number of audio channels (default: 1)
- `punctuate`: Add punctuation (true/false)
- `smart_format`: Format numbers, dates, etc. (true/false)
- `diarize`: Speaker diarization (true/false)
- `interim_results`: Return interim results (true/false)
- `endpointing`: Milliseconds of silence to trigger end of utterance (e.g., 800)

## Connection Headers
```python
headers = {
    "Authorization": "Token YOUR_API_KEY"
}
```

## Audio Format Requirements

### Supported Formats
- **Linear16 (PCM)**: 16-bit signed integer PCM
- **Mulaw**: μ-law encoding
- **FLAC**: Free Lossless Audio Codec

### Sample Rates
- **8000 Hz**: For telephone-quality audio
- **16000 Hz**: For standard quality (recommended)
- **32000 Hz**: For high quality
- **48000 Hz**: For studio quality

### Channel Configuration
- **Mono**: Single channel (recommended for most use cases)
- **Stereo**: Two channels (requires diarization for speaker separation)

## Python Implementation Example

### Basic WebSocket Connection
```python
import asyncio
import websockets
import json

async def connect_to_deepgram():
    # Connection URL with parameters
    url = "wss://api.deepgram.com/v1/listen?model=nova-3&encoding=linear16&sample_rate=16000&channels=1&punctuate=true&smart_format=true&interim_results=true&endpointing=800"
    
    # Headers
    headers = [("Authorization", "Token YOUR_API_KEY")]
    
    try:
        # Connect to Deepgram
        websocket = await websockets.connect(url, extra_headers=headers)
        print("Connected to Deepgram")
        
        # Listen for messages
        async for message in websocket:
            data = json.loads(message)
            
            # Handle transcript
            if "channel" in data and "alternatives" in data["channel"]:
                transcript = data["channel"]["alternatives"][0].get("transcript", "")
                is_final = data.get("is_final", False)
                
                if transcript.strip() and is_final:
                    print(f"Final transcript: {transcript}")
                elif transcript.strip():
                    print(f"Interim transcript: {transcript}")
            
            # Handle errors
            elif "error" in data:
                print(f"Error: {data['error']}")
                
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e.code} {e.reason}")
    except Exception as e:
        print(f"Error: {e}")

# Run the connection
asyncio.run(connect_to_deepgram())
```

### Sending Audio Data
```python
async def send_audio(websocket, audio_data):
    """Send audio data to Deepgram"""
    try:
        await websocket.send(audio_data)
        return True
    except Exception as e:
        print(f"Error sending audio: {e}")
        return False
```

## Common Connection Issues

### 1. Authentication Errors
**Symptoms**: Connection closes immediately with 401 error
**Solutions**:
- Verify API key is correct and active
- Check API key has sufficient quota
- Ensure header format is exactly: `Authorization: Token YOUR_API_KEY`

### 2. Audio Format Issues
**Symptoms**: Connection established but no transcripts returned
**Solutions**:
- Verify audio is in correct format (Linear16, Mulaw, or FLAC)
- Check sample rate matches query parameter
- Ensure audio data is raw bytes, not encoded strings

### 3. Rate Limiting
**Symptoms**: Connection refused or closed with 429 error
**Solutions**:
- Check current usage in Deepgram dashboard
- Reduce number of concurrent connections
- Implement exponential backoff for reconnection

### 4. Network Issues
**Symptoms**: Connection timeout or connection refused
**Solutions**:
- Check firewall settings
- Verify outbound WebSocket connections are allowed
- Try different network (mobile hotspot, etc.)

## Troubleshooting Steps

### 1. Test API Key
```python
import requests

def test_api_key(api_key):
    url = "https://api.deepgram.com/v1/projects"
    headers = {"Authorization": f"Token {api_key}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("API key is valid")
        return True
    else:
        print(f"API key error: {response.status_code} - {response.text}")
        return False
```

### 2. Test Minimal Connection
```python
import asyncio
import websockets

async def test_minimal_connection():
    url = "wss://api.deepgram.com/v1/listen?model=nova-3&encoding=linear16&sample_rate=16000"
    headers = [("Authorization", "Token YOUR_API_KEY")]
    
    try:
        websocket = await websockets.connect(url, extra_headers=headers)
        print("✅ Connection successful")
        
        # Send a small amount of silence
        silence = b'\x00' * 1024
        await websocket.send(silence)
        
        # Wait for any response
        await asyncio.sleep(2)
        
        await websocket.close()
        print("✅ Test completed")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_minimal_connection())
```

### 3. Check Audio Format
```python
def validate_audio_format(audio_data, sample_rate=16000):
    """Validate audio data format"""
    # Check if it's 16-bit PCM
    if len(audio_data) % 2 != 0:
        print("❌ Audio data length must be even (16-bit samples)")
        return False
    
    # Convert to 16-bit samples
    samples = []
    for i in range(0, len(audio_data), 2):
        sample = int.from_bytes(audio_data[i:i+2], byteorder='little', signed=True)
        samples.append(sample)
    
    print(f"✅ Audio format valid: {len(samples)} samples at {sample_rate}Hz")
    return True
```

## Best Practices

### 1. Connection Management
- Reuse connections when possible
- Implement exponential backoff for reconnections
- Handle connection drops gracefully

### 2. Audio Processing
- Send audio in small chunks (1-4KB)
- Maintain consistent sample rate
- Use appropriate encoding for your use case

### 3. Error Handling
- Always handle WebSocket exceptions
- Log connection issues for debugging
- Implement fallback mechanisms

### 4. Performance
- Use appropriate model for your needs
- Enable interim results for real-time feel
- Adjust endpointing based on use case

## Model Selection Guide

| Model | Use Case | Accuracy | Speed | Cost |
|-------|----------|----------|-------|------|
| `nova-3` | General purpose | High | Fast | Low |
| `nova-2` | Legacy support | High | Fast | Low |
| `enhanced` | Specialized vocab | Very High | Medium | High |
| `base` | High volume | Medium | Very Fast | Very Low |

## Rate Limits

| Plan | Concurrent Connections | Requests per Minute |
|------|----------------------|-------------------|
| Pay-as-you-go | 50 | 1000 |
| Growth | 100 | 2000 |
| Enterprise | Custom | Custom |

## Support Resources
- **Documentation**: https://developers.deepgram.com/docs
- **API Reference**: https://developers.deepgram.com/reference
- **Support**: https://support.deepgram.com
- **Status Page**: https://status.deepgram.com 