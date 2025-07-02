import { useState, useEffect, useRef, useCallback } from 'react';

// Extend the Window interface to include webkitSpeechRecognition for Chrome
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    maxAlternatives = 1
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const isSupported = useRef(false);

  // Check if Speech Recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      isSupported.current = !!SpeechRecognition;
      
      if (isSupported.current) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        // Configure recognition settings
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;
        recognition.maxAlternatives = maxAlternatives;

        // Event handlers
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          console.log('🎤 Speech recognition started');
        };

        recognition.onend = () => {
          setIsListening(false);
          console.log('🎤 Speech recognition ended');
        };

        recognition.onerror = (event: any) => {
          setError(event.error);
          setIsListening(false);
          console.error('🎤 Speech recognition error:', event.error);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptPart = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcriptPart;
            } else {
              interimTranscript += transcriptPart;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
            setInterimTranscript('');
            console.log('🎤 Final transcript:', finalTranscript);
          } else {
            setInterimTranscript(interimTranscript);
            console.log('🎤 Interim transcript:', interimTranscript);
          }
        };
      } else {
        console.warn('🎤 Speech Recognition not supported in this browser');
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
      }
    };
  }, [continuous, interimResults, language, maxAlternatives]);

  const startListening = useCallback(() => {
    if (!isSupported.current) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setError(null);
        setInterimTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start speech recognition');
        console.error('🎤 Error starting recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported: isSupported.current,
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useSpeechRecognition; 