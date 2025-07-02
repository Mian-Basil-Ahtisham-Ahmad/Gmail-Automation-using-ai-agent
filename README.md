# Gmail-Automation-using-ai-agent
# Gmail-Calendar AI Assistant - Setup Guide

This guide will help you set up and run the Gmail-Calendar AI Assistant with the new React frontend and WebSocket/REST API backend.

## Architecture Overview

```
┌─────────────────────┐     WebSocket/REST     ┌──────────────────┐
│   React Frontend    │ ◄──────────────────► │  FastAPI Backend │
│  (localhost:3000)   │                        │ (localhost:8000)  │
└─────────────────────┘                        └──────────────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │   Supervisor     │
                                               │     System       │
                                               └──────────────────┘
                                                     /        \
                                            ┌────────┐      ┌────────┐
                                            │ Gmail  │      │Calendar│
                                            │ Agent  │      │ Agent  │
                                            └────────┘      └────────┘
```

## Prerequisites

1. Python 3.11+ with virtual environment activated
2. Node.js 16+ and npm
3. Google API credentials configured (`.env` file)

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the automated startup script:**
   ```bash
   python run_app.py
   ```
   This will:
   - Start the backend server on port 8000
   - Start the frontend server on port 3000
   - Open your browser automatically

### Option 2: Manual Setup

#### Step 1: Start Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd UI-gmail-calendar-agent
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```bash
   python backend_server.py
   ```

   The backend will start at `http://localhost:8000`

#### Step 2: Start Frontend Server

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd gmail-calendar-frontend
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The frontend will open automatically at `http://localhost:3000`

## Usage

### Chat Interface

1. **Start a conversation:** Type your query in the chat input
2. **Examples of queries:**
   - "Show me my recent emails"
   - "Create a meeting tomorrow at 3 PM"
   - "Find all unread emails from John"
   - "Check my calendar for next week"
   - "Reply to the latest email from Sarah"

### Features

- **Real-time responses** via WebSocket
- **Persistent sessions** (maintains chat history)
- **Automatic reconnection** on connection loss
- **Markdown support** in AI responses

## API Endpoints

### WebSocket
- **Endpoint:** `ws://localhost:8000/ws/{session_id}`
- **Protocol:** JSON messages with type field

### REST API
- **Chat:** `POST /chat`
- **Sessions:** `GET /sessions`
- **Session Details:** `GET /session/{session_id}`
- **Clear Session:** `DELETE /session/{session_id}/clear`

## Configuration

### Backend Configuration

Edit `UI-gmail-calendar-agent/.env`:
```env
# Google API Credentials
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Optional: Timezone
TIMEZONE=UTC
```

### Frontend Configuration

To change backend URL, edit `gmail-calendar-frontend/src/context/WebSocketContext.tsx`:
```typescript
ws.current = new WebSocket(`ws://your-backend-url/ws/${sessionId}`);
```

## Troubleshooting

### Backend Issues

1. **Port 8000 already in use:**
   ```bash
   # Find process using port 8000
   netstat -ano | findstr :8000  # Windows
   lsof -i :8000                  # Linux/Mac
   
   # Kill the process or use different port
   uvicorn backend_server:app --port 8001
   ```

2. **Module not found errors:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Google API errors:**
   - Check `.env` file configuration
   - Ensure credentials are valid
   - Run authentication flow if needed

### Frontend Issues

1. **npm start fails:**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **WebSocket connection fails:**
   - Ensure backend is running
   - Check browser console for errors
   - Verify CORS settings

3. **Build errors:**
   ```bash
   # Update dependencies
   npm update
   ```

## Development

### Adding New Features

1. **Backend:** Add new endpoints in `backend_server.py`
2. **Frontend:** Create components in `src/components/`
3. **WebSocket:** Add new message types in both backend and frontend

### Production Deployment

1. **Backend:**
   ```bash
   uvicorn backend_server:app --host 0.0.0.0 --port 8000 --workers 4
   ```

2. **Frontend:**
   ```bash
   npm run build
   # Serve the build folder with any static server
   ```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in browser console
3. Check backend server logs
4. Ensure all dependencies are installed correctly

Happy chatting with your AI assistant! 🚀 
