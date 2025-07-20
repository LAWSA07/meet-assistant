# Project Co-Pilot 🚀

A real-time AI meeting assistant that provides live transcription, summarization, and intelligent suggestions during meetings.

## Features

- 🎤 **Real-time Audio Capture**: Live microphone input with noise suppression
- 📝 **Speech-to-Text**: Powered by AssemblyAI for accurate transcription
- 🤖 **AI Summarization**: Google Gemini LLM for intelligent meeting insights
- 💡 **Proactive Suggestions**: AI-generated talking points and action items
- 🔄 **Live Updates**: Real-time processing and response generation
- 🎨 **Glassmorphism UI**: Beautiful, modern overlay interface
- 🔐 **User Authentication**: Secure login with OAuth (GitHub, Google)
- 📊 **Session Management**: Persistent meeting history and context

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chrome        │    │   FastAPI       │    │   External      │
│   Extension     │◄──►│   Backend       │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • Audio Capture │    │ • WebSocket     │    │ • AssemblyAI    │
│ • UI Overlay    │    │ • Session Mgmt  │    │ • Google Gemini │
│ • User Input    │    │ • Vector Store  │    │ • MongoDB       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - High-performance web framework
- **WebSocket** - Real-time bidirectional communication
- **AssemblyAI** - Speech-to-text transcription
- **Google Gemini** - Large language model for AI processing
- **MongoDB** - User data and session storage
- **FAISS** - Vector database for semantic search
- **JWT** - Authentication tokens

### Frontend
- **React** - Web application interface
- **Chrome Extension** - Browser overlay with glassmorphism design
- **Web Audio API** - Real-time audio processing
- **WebSocket** - Real-time communication with backend

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Chrome browser
- MongoDB database

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/project-co-pilot.git
   cd project-co-pilot
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Start the backend server**
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd src
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

### Chrome Extension Setup

1. **Load the extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Grant permissions**
   - Allow microphone access when prompted
   - Grant necessary permissions for the extension

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/project_co_pilot
MONGODB_DB_NAME=project_co_pilot

# AssemblyAI (Speech-to-Text)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Google Gemini (LLM)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT Secret
JWT_SECRET_KEY=your_jwt_secret_key_here

# OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Configuration
HOST=127.0.0.1
PORT=8001
DEBUG=True
```

## API Keys Setup

### AssemblyAI
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add to `.env` as `ASSEMBLYAI_API_KEY`

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `GOOGLE_GEMINI_API_KEY`

### MongoDB
1. Set up MongoDB (local or cloud)
2. Create a database for the project
3. Add connection string to `.env` as `MONGODB_URL`

## Usage

### Starting the Application

1. **Start the backend**
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend**
   ```bash
   cd src
   npm start
   ```

3. **Load the Chrome extension**
   - Open any website
   - Click the Project Co-Pilot extension icon
   - The overlay will appear

### Using the Extension

1. **Audio Capture**
   - Click "Start Audio" to begin microphone capture
   - Speak naturally during your meeting
   - AI will transcribe and provide insights in real-time

2. **Text Input**
   - Type questions in the input field
   - Press Enter to get AI responses
   - Ask about meeting context, summaries, or suggestions

3. **Controls**
   - **Start Audio**: Begin/stop microphone capture
   - **Test LLM**: Test AI connection
   - **Clear**: Clear conversation history
   - **Minimize**: Collapse/expand overlay

## API Endpoints

### WebSocket
- `ws://localhost:8001/ws/audio` - Real-time audio processing

### HTTP Endpoints
- `GET /` - Health check
- `GET /ws-test` - WebSocket test
- `GET /test-llm` - LLM connection test
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/oauth/github` - GitHub OAuth
- `GET /auth/oauth/google` - Google OAuth

## Development

### Project Structure
```
project-co-pilot/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── assemblyai_stt.py   # Speech-to-text service
│   ├── gemini_llm.py       # LLM integration
│   ├── vector_store.py     # Vector database
│   ├── auth.py             # Authentication
│   ├── database.py         # Database connection
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend
│   ├── App.js
│   ├── components/
│   └── pages/
├── extension/              # Chrome extension
│   ├── manifest.json
│   ├── contentScript.js
│   ├── background.js
│   └── public/
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Extension not loading**
   - Check Chrome extension permissions
   - Ensure all files are in the correct location
   - Reload the extension

2. **Audio not working**
   - Grant microphone permissions
   - Check browser console for errors
   - Verify backend is running

3. **WebSocket connection failed**
   - Ensure backend is running on port 8001
   - Check firewall settings
   - Verify CORS configuration

4. **API errors**
   - Verify API keys are correct
   - Check API quotas and limits
   - Review error logs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

## Acknowledgments

- AssemblyAI for speech-to-text capabilities
- Google Gemini for AI processing
- FastAPI for the backend framework
- React for the frontend framework 