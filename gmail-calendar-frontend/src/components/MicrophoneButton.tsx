import React, { useEffect } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onTranscript,
  disabled = false,
  className = ''
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'en-US'
  });

  // Handle transcript updates
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  // Handle click to toggle recording
  const handleClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please try Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error('Speech recognition error:', error);
      if (error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (error === 'no-speech') {
        console.log('No speech detected, stopping...');
      } else {
        alert(`Speech recognition error: ${error}`);
      }
    }
  }, [error]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`microphone-button ${isListening ? 'listening' : ''} ${className}`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? (
        (FiMicOff as any)({ size: 20 })
      ) : (
        (FiMic as any)({ size: 20 })
      )}
      {isListening && (
        <div className="recording-indicator">
          <div className="pulse-dot"></div>
        </div>
      )}
      {interimTranscript && (
        <div className="interim-transcript" title={interimTranscript}>
          Listening: {interimTranscript.length > 20 ? 
            `${interimTranscript.substring(0, 20)}...` : 
            interimTranscript
          }
        </div>
      )}
    </button>
  );
};

export default MicrophoneButton; 