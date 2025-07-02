# Gmail-Calendar AI Assistant Frontend

A modern React-based chat interface for the Gmail-Calendar AI Agent system, featuring real-time WebSocket communication and a ChatGPT-like user experience.

## Features

- 🚀 **Real-time Communication**: WebSocket-based for instant responses
- 💬 **ChatGPT-like Interface**: Familiar and intuitive chat experience
- 🎨 **Modern Dark Theme**: Easy on the eyes with smooth animations
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔄 **Auto-reconnection**: Maintains connection stability
- 📝 **Markdown Support**: Rich text formatting in responses

## Prerequisites

- Node.js 16+ and npm
- The backend server running on `http://localhost:8000`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure backend URL (if different from default):**
   
   Edit `src/context/WebSocketContext.tsx` and update the WebSocket URL:
   ```typescript
   ws.current = new WebSocket(`ws://localhost:8000/ws/${sessionId}`);
   ```

## Running the Application

1. **Start the backend server first:**
   ```bash
   cd ../UI-gmail-calendar-agent
   python backend_server.py
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatInterface    # Main chat interface
│   ├── MessageList      # Message display component
│   └── Sidebar         # Navigation sidebar
├── context/            # React contexts
│   ├── ChatContext     # Chat state management
│   └── WebSocketContext # WebSocket connection
├── App.tsx            # Main app component
└── App.css           # Global styles
```

## Usage

1. **Starting a conversation:** Type your query in the input field and press Enter
2. **New chat:** Click the "New Chat" button in the sidebar
3. **Example queries:** Check the sidebar for common query examples
4. **Connection status:** Monitor the connection indicator in the header

## WebSocket Protocol

The frontend communicates with the backend using the following message types:

### Outgoing Messages:
```json
{
  "type": "chat",
  "message": "User's message"
}
```

### Incoming Messages:
- **Connection**: `{"type": "connection", "message": "Connected...", "session_id": "..."}`
- **Status**: `{"type": "status", "message": "thinking", "agent": "supervisor"}`
- **Response**: `{"type": "response", "message": "AI response", "timestamp": "..."}`
- **Error**: `{"type": "error", "message": "Error description"}`

## Customization

### Theming
Edit the CSS files in `src/components/` to customize colors and styles.

### Adding Features
1. Create new components in `src/components/`
2. Update contexts in `src/context/` for state management
3. Modify WebSocket handlers for new message types

## Troubleshooting

### Connection Issues
- Ensure the backend server is running on port 8000
- Check browser console for WebSocket errors
- Verify CORS settings in the backend

### Build Issues
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## License

[Same as parent project]
