# 🎤 Speech-to-Text Feature Guide

## Overview
The Gmail-Calendar AI Agent now includes voice input functionality, allowing users to interact with the application using speech-to-text conversion.

## Features
- **Voice Input**: Click the microphone button to start voice recording
- **Real-time Feedback**: Visual indicators show when recording is active
- **Automatic Conversion**: Speech is automatically converted to text and populated in the input field
- **Browser-based**: Uses the browser's built-in Web Speech API (no backend required)
- **Smart Integration**: Appends to existing text in the input field

## How to Use

### 1. Start Voice Input
- Click the 🎤 microphone button beside the send button
- Grant microphone permissions when prompted by your browser
- The button will turn red and show a pulsing animation when recording

### 2. Speak Your Message
- Speak clearly into your microphone
- You'll see interim results as you speak (live preview)
- The system will capture your speech automatically

### 3. Complete Input
- The recording stops automatically when you finish speaking
- Your speech is converted to text and added to the input field
- You can edit the text if needed, then send your message

## Browser Compatibility
- ✅ **Chrome**: Full support
- ✅ **Edge**: Full support  
- ✅ **Safari**: Full support
- ⚠️ **Firefox**: Limited support
- ❌ **Internet Explorer**: Not supported

## Usage Examples

### Voice Commands You Can Use
- "Create a draft reply to my fifth email"
- "Show me my calendar events for tomorrow"
- "Schedule a meeting with John next Tuesday at 3 PM"
- "Check my unread emails"

### Best Practices
1. **Speak Clearly**: Enunciate words for better accuracy
2. **Quiet Environment**: Use in a quiet space for best results
3. **Natural Pace**: Speak at a normal, conversational pace
4. **Short Phrases**: Break long requests into shorter phrases if needed

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure your microphone is connected and working
- Try refreshing the page and granting permissions again

### Poor Recognition Accuracy
- Check that you're speaking clearly
- Ensure good internet connection
- Move closer to your microphone
- Reduce background noise

### Browser Not Supported
- Try using Chrome, Safari, or Edge
- Update your browser to the latest version
- Some browsers require HTTPS for speech recognition

## Technical Details

### Files Added
- `src/hooks/useSpeechRecognition.ts` - Speech recognition hook
- `src/components/MicrophoneButton.tsx` - Microphone button component
- CSS styles added to `ChatInterface.css`

### API Used
- **Web Speech API**: Browser-native speech recognition
- **SpeechRecognition**: For speech-to-text conversion
- **MediaDevices**: For microphone access

### Security & Privacy
- ✅ **No Data Storage**: Speech processing happens in the browser
- ✅ **No Server Upload**: Audio never leaves your device
- ✅ **User Control**: You control when recording starts/stops
- ✅ **Permission-based**: Requires explicit microphone permission

## Integration Notes
- The feature is fully frontend-based
- No backend changes were required
- Core chat functionality remains unchanged
- Clean separation of concerns maintained

---

**Note**: This feature requires a modern browser with Web Speech API support and microphone permissions. 