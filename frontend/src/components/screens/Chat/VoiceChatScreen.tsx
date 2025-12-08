"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mic, MicOff, Phone } from "lucide-react"
import ChatPersonaCard from "@/components/ChatPersonaCard"
import { Persona } from "@/types/persona"

interface VoiceSessionConfig {
  signedUrl: string;
  agentId: string;
  sessionId: string;
  maxDurationSeconds: number;
  persona: {
    name: string;
    voice_name?: string;
  };
}

interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const VoiceChatScreen = () => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isPersonaLoading, setIsPersonaLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elevenLabsConversationId, setElevenLabsConversationId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const conversationId = searchParams ? searchParams.get('conversationId') : null;
  const personaId = searchParams ? searchParams.get('personaId') : null;
  const scenarioId = searchParams ? searchParams.get('scenarioId') : null;
  const router = useRouter();
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionConfigRef = useRef<VoiceSessionConfig | null>(null);
  const isInitializingRef = useRef(false); // Prevent duplicate initialization
  const initializationKeyRef = useRef<string | null>(null); // Track unique initialization
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null); // AudioWorklet for low-latency streaming

  // Fetch persona data
  useEffect(() => {
    const fetchPersona = async () => {
      if (!personaId) return;
      
      try {
        setIsPersonaLoading(true);
        const response = await axios.get<Persona>(`/api/persona/${personaId}`);
        setPersona(response.data);
      } catch (error) {
        console.error('Error fetching persona:', error);
        setError('Failed to load persona');
      } finally {
        setIsPersonaLoading(false);
      }
    };

    fetchPersona();
  }, [personaId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up voice chat component...');
      disconnectVoiceAgent();
    };
  }, []);

  // Initialize voice session
  useEffect(() => {
    const initVoiceSession = async () => {
      if (!conversationId || !personaId || !scenarioId) {
        setError('Missing required parameters');
        setIsConnecting(false);
        return;
      }

      // Create unique key for this initialization attempt
      const initKey = `${conversationId}-${personaId}-${scenarioId}`;
      
      // Prevent duplicate initialization (React StrictMode protection)
      if (isInitializingRef.current) {
        console.log('🚫 Voice session already initializing, skipping...');
        return;
      }

      // Check if we've already initialized this exact combination
      if (initializationKeyRef.current === initKey) {
        console.log('🚫 Voice session already initialized for this combination, skipping...');
        return;
      }

      // Additional check - if we already have a session config, don't reinitialize
      if (sessionConfigRef.current) {
        console.log('🚫 Voice session already configured, skipping...');
        console.log('🔍 Existing session config:', {
          agentId: sessionConfigRef.current.agentId,
          sessionId: sessionConfigRef.current.sessionId,
          personaName: sessionConfigRef.current.persona.name
        });
        return;
      }

      isInitializingRef.current = true;
      initializationKeyRef.current = initKey;
      console.log('🎙️ Starting voice session initialization...');
      console.log('🎯 Session parameters:', {
        conversationId,
        personaId,
        scenarioId,
        initKey,
        timestamp: new Date().toISOString()
      });

      try {
        // Start voice session and get WebSocket URL
        const response = await axios.post<VoiceSessionConfig & { isDuplicate?: boolean }>('/api/voice/start-session', {
          conversationId,
          personaId,
          scenarioId
        });

        // Check if this is a duplicate request that found an existing session
        if (response.status === 202 && response.data.isDuplicate) {
          console.log('🔄 Duplicate request detected - another instance already created the session');
          console.log('🚫 Skipping WebSocket connection to prevent duplicate connections');
          
          // Reset initialization flags but don't connect
          isInitializingRef.current = false;
          initializationKeyRef.current = null;
          setIsConnecting(false);
          
          // Don't show an error - this is normal behavior in development mode
          // The first request will handle the connection
          console.log('✅ Voice session handled by primary request');
          return;
        }

        sessionConfigRef.current = response.data;
        console.log('✅ Voice session created successfully:', {
          agentId: response.data.agentId,
          sessionId: response.data.sessionId,
          personaName: response.data.persona.name,
          maxDurationSeconds: response.data.maxDurationSeconds
        });
        
        // Connect to WebSocket
        await connectToVoiceAgent(response.data.signedUrl);
        
      } catch (error) {
        console.error('Error initializing voice session:', error);
        
        // Handle duplicate request gracefully - server should now handle this automatically
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.log('🔄 Duplicate request detected - this should not happen with new server logic');
          setError('Multiple requests detected. Please refresh and try again.');
          setIsConnecting(false);
          isInitializingRef.current = false;
          initializationKeyRef.current = null;
          return;
        }
        
        setError('Failed to start voice session. Please try again.');
        setIsConnecting(false);
        isInitializingRef.current = false; // Reset on error
        initializationKeyRef.current = null; // Reset key on error
      }
    };

    // Only initialize if we have all required params and haven't initialized yet
    if (conversationId && personaId && scenarioId && !isInitializingRef.current && !sessionConfigRef.current) {
      initVoiceSession();
    }

    // Cleanup on unmount
    return () => {
      disconnectVoiceAgent();
      isInitializingRef.current = false; // Reset on cleanup
      initializationKeyRef.current = null; // Reset key on cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, personaId, scenarioId]);

  const connectToVoiceAgent = async (signedUrl: string) => {
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Test microphone levels
      console.log('🎤 Microphone stream tracks:', stream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        label: track.label
      })));
      
      // Test if stream is active
      console.log('🎤 Stream active:', stream.active, 'Track count:', stream.getTracks().length);
      
      mediaStreamRef.current = stream;

      // Connect to WebSocket
      const ws = new WebSocket(signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setIsListening(true);
        
        // Send initial message to keep connection alive
        console.log('📤 Sending initial connection message...');
        
        // Start streaming audio
        startAudioStreaming(stream, ws);
        
        // ElevenLabs handles keepalive with their own ping/pong mechanism
        // We don't need to send our own keepalive - just respond to their pings
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          // If not JSON, might be binary audio data
          console.log('🎵 Received binary data, length:', event.data.length);
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Connection error occurred');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        // Common WebSocket close codes
        const closeReasons: Record<number, string> = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1006: 'Abnormal closure',
          1008: 'Policy violation - Invalid message format (ElevenLabs expects binary audio data only)',
          1011: 'Server error',
          1012: 'Service restart',
          1013: 'Try again later',
          1014: 'Bad gateway',
          1015: 'TLS handshake failure'
        };
        
        if (event.code === 1000) {
          // Normal closure - not an error
          console.log('🔌 WebSocket closed normally');
        } else {
          // Unexpected closure - log as error
          console.error('🔌 WebSocket closed unexpectedly:', {
            code: event.code,
            reason: event.reason || 'No reason provided',
            wasClean: event.wasClean,
            timestamp: new Date().toISOString()
          });
          console.error('🔍 Close code meaning:', closeReasons[event.code] || 'Unknown code');
          setError(`Connection lost: ${closeReasons[event.code] || 'Unknown error'} (${event.code})`);
        }
        
        setIsConnected(false);
        setIsListening(false);
      };

    } catch (error) {
      console.error('Error connecting to voice agent:', error);
      setError('Failed to connect. Please ensure microphone access is granted.');
      setIsConnecting(false);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    // Only log important message types to reduce noise
    if (['conversation_initiation_metadata', 'user_transcript', 'agent_response', 'interruption', 'agent_response_start', 'agent_response_end'].includes(message.type)) {
      console.log('🔄 Handling message type:', message.type);
    }
    
    switch (message.type) {
      case 'conversation_initiation_metadata':
        console.log('🚀 Conversation initiated:', message.conversation_initiation_metadata_event);
        // ElevenLabs agent will automatically speak its first_message, no need to trigger manually
        console.log('👋 Agent will speak first automatically via first_message config');
        
        // Capture the ElevenLabs conversation ID for transcript syncing
        if (message.conversation_initiation_metadata_event?.conversation_id) {
          setElevenLabsConversationId(message.conversation_initiation_metadata_event.conversation_id);
          console.log('📝 Captured ElevenLabs conversation ID:', message.conversation_initiation_metadata_event.conversation_id);
        }
        break;
        
      case 'ping':
        // Respond to ElevenLabs ping with pong (no logging to reduce noise)
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const pongResponse = {
            type: 'pong',
            event_id: message.ping_event?.event_id
          };
          wsRef.current.send(JSON.stringify(pongResponse));
        }
        break;
        
      case 'audio':
        // Play AI voice response (minimal logging)
        if (message.audio_event && message.audio_event.audio_base_64) {
          playAudioChunk(message.audio_event.audio_base_64);
        } else {
          console.warn('⚠️ Audio message missing audio_base_64 data');
        }
        break;
      
      case 'user_transcript':
        // ElevenLabs sends user transcripts - log full details for debugging
        console.log('📝 User transcript received:', JSON.stringify(message, null, 2));
        
        // Try multiple possible field locations for the transcript
        const userTranscriptEvent = message.user_transcript_event || message.user_transcription_event || message;
        const userText = userTranscriptEvent?.user_transcript || 
                        userTranscriptEvent?.transcript || 
                        userTranscriptEvent?.text ||
                        message.transcript ||
                        message.text;
        
        if (userText) {
          // Check if this is a final transcript
          // ElevenLabs uses "is_final" field - if not present, treat as final
          const isFinal = userTranscriptEvent.is_final !== false;
          console.log('📝 User transcript details:', {
            text: userText,
            is_final: userTranscriptEvent.is_final,
            treating_as_final: isFinal
          });
          
          if (isFinal) {
            setTranscript(prev => [...prev, {
              role: 'user',
              content: userText,
              timestamp: Date.now()
            }]);
            console.log('✅ Added user transcript to conversation');
          } else {
            console.log('📝 Skipping partial transcript (is_final: false)');
          }
        } else {
          console.warn('⚠️ User transcript message received but no text found:', message);
        }
        break;
        
      case 'agent_response':
        // ElevenLabs may send multiple agent_response events - only add final ones
        console.log('🤖 Agent response received:', message);
        if (message.agent_response_event && message.agent_response_event.agent_response) {
          const isFinal = message.agent_response_event.is_final !== false; // Default to true if not specified
          if (isFinal) {
            setTranscript(prev => [...prev, {
              role: 'assistant',
              content: message.agent_response_event.agent_response,
              timestamp: Date.now()
            }]);
          } else {
            console.log('🤖 Skipping partial agent response (is_final: false)');
          }
        }
        break;
      
      case 'interruption':
        console.log('⛔ Interruption message received');
        stopAudioPlayback();
        break;
        
      case 'agent_response_start':
        console.log('🗣️ Agent response start');
        setIsSpeaking(true);
        setIsListening(false);
        break;
        
      case 'agent_response_end':
        console.log('✅ Agent response end');
        setIsSpeaking(false);
        setIsListening(true);
        break;
        
      case 'vad_score':
        // Voice Activity Detection score (no logging to reduce noise)
        break;
        
      case 'internal_tentative_agent_response':
        // Tentative agent response (no logging to reduce noise)
        break;
        
      case 'agent_response_correction':
        // Agent response correction - ignore to avoid duplicates
        console.log('🔄 Agent response correction (ignored for transcript):', message);
        break;
        
      default:
        console.log('❓ Unknown message type:', message.type, 'Message:', message);
        break;
    }
  };

  const startAudioStreaming = async (stream: MediaStream, ws: WebSocket) => {
    if (!audioContextRef.current) {
      console.error('❌ No audio context for streaming');
      return;
    }

    console.log('🎙️ Starting audio streaming with AudioWorklet (low latency)...');
    console.log('🎙️ AudioContext state:', audioContextRef.current.state);
    console.log('🎙️ Stream tracks for processing:', stream.getTracks().length);
    
    try {
      // Resume audio context if suspended (required by modern browsers)
      if (audioContextRef.current.state === 'suspended') {
        console.log('🎙️ Resuming suspended audio context...');
        await audioContextRef.current.resume();
        console.log('✅ Audio context resumed, state:', audioContextRef.current?.state);
      }

      // Load AudioWorklet module
      await audioContextRef.current.audioWorklet.addModule('/audio-worklet-processor.js');
      console.log('✅ AudioWorklet module loaded');

      // Create media stream source
      const source = audioContextRef.current.createMediaStreamSource(stream);
      console.log('🎙️ Media stream source created');
      
      // Create AudioWorklet node (much lower latency than ScriptProcessor)
      const workletNode = new AudioWorkletNode(audioContextRef.current, 'voice-stream-processor');
      audioWorkletNodeRef.current = workletNode;
      console.log('🎙️ AudioWorklet node created (128 samples = ~8ms latency at 16kHz)');

      // Listen for audio data from the worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio' && ws.readyState === WebSocket.OPEN) {
          const audioBuffer = event.data.buffer;
          
          // Convert to PCM16 and encode as base64 for ElevenLabs
          const pcm16 = convertToPCM16(audioBuffer);
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16)));
          
          // Send in ElevenLabs expected format
          const audioMessage = {
            user_audio_chunk: base64Audio
          };
          ws.send(JSON.stringify(audioMessage));
        }
      };

      // Connect: source -> worklet -> destination (muted)
      source.connect(workletNode);
      
      // Create a gain node with zero gain to prevent audio feedback
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0; // Mute the output
      workletNode.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      console.log('🎙️ AudioWorklet connected with muted output');
      console.log('✅ Low-latency audio streaming setup complete (~8ms buffer vs 256ms with ScriptProcessor)');
    } catch (error) {
      console.error('❌ Error setting up AudioWorklet streaming:', error);
      console.error('❌ Falling back to legacy ScriptProcessor...');
      
      // Fallback to ScriptProcessor if AudioWorklet fails
      startAudioStreamingLegacy(stream, ws);
    }
  };

  // Legacy fallback for browsers that don't support AudioWorklet
  const startAudioStreamingLegacy = (stream: MediaStream, ws: WebSocket) => {
    if (!audioContextRef.current) {
      console.error('❌ No audio context for streaming');
      return;
    }

    console.log('🎙️ Using legacy ScriptProcessor (higher latency)...');
    
    try {
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const hasAudio = inputData.some(sample => Math.abs(sample) > 0.001);
          
          if (hasAudio) {
            const pcm16 = convertToPCM16(inputData);
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16)));
            
            const audioMessage = {
              user_audio_chunk: base64Audio
            };
            ws.send(JSON.stringify(audioMessage));
          }
        }
      };

      source.connect(processor);
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0;
      processor.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      console.log('✅ Legacy ScriptProcessor setup complete');
    } catch (error) {
      console.error('❌ Error setting up legacy audio streaming:', error);
    }
  };

  const convertToPCM16 = (float32Array: Float32Array): ArrayBuffer => {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm16.buffer;
  };

  const playAudioChunk = async (audioData: string) => {
    if (!audioContextRef.current) {
      console.error('❌ No audio context available for playback');
      return;
    }

    try {
      // Decode base64 to get raw PCM16 data
      const binaryString = atob(audioData);
      const pcm16Data = new Int16Array(binaryString.length / 2);
      
      // Convert binary string to Int16Array (PCM16)
      for (let i = 0; i < pcm16Data.length; i++) {
        const byte1 = binaryString.charCodeAt(i * 2);
        const byte2 = binaryString.charCodeAt(i * 2 + 1);
        pcm16Data[i] = (byte2 << 8) | byte1; // Little-endian
      }
      
      // Create AudioBuffer from PCM16 data
      const sampleRate = 16000; // ElevenLabs uses 16kHz
      const audioBuffer = audioContextRef.current.createBuffer(1, pcm16Data.length, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert Int16 to Float32 for Web Audio API
      for (let i = 0; i < pcm16Data.length; i++) {
        channelData[i] = pcm16Data[i] / 32768.0; // Normalize to [-1, 1]
      }
      
      audioQueueRef.current.push(audioBuffer);
      
      if (!isPlayingRef.current) {
        playNextAudioBuffer();
      }
    } catch (error) {
      console.error('❌ Error playing audio chunk:', error);
    }
  };

  const playNextAudioBuffer = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      // Reset isSpeaking when all audio is finished playing
      setIsSpeaking(false);
      setIsListening(true);
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextAudioBuffer();
    source.start();
  };

  const stopAudioPlayback = () => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const disconnectVoiceAgent = () => {
    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect AudioWorklet node
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current.port.close();
      audioWorkletNodeRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close(1000, 'User ended session'); // Normal closure
      wsRef.current = null;
    }

    // Close audio context (check if it's not already closed)
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(error => {
        console.warn('AudioContext already closed:', error);
      });
      audioContextRef.current = null;
    }
  };

  const handleEndChat = () => {
    setIsEndChatModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEndChatModalOpen(false);
  };

  const handleConfirmEndChat = async () => {
    setIsEndChatModalOpen(false);
    
    // Disconnect voice agent
    disconnectVoiceAgent();
    
    // End session on backend and sync transcript
    try {
      console.log('🔚 Ending voice session and syncing transcript...');
      console.log('📝 Using ElevenLabs conversation ID:', elevenLabsConversationId);
      
      const response = await axios.post('/api/voice/end-session', {
        conversationId,
        elevenLabsConversationId: elevenLabsConversationId // Use the actual conversation ID, not agent ID
      });
      
      console.log('✅ Voice session ended successfully:', response.data);
    } catch (error) {
      console.error('Error ending voice session:', error);
    }
    
    // Navigate to feedback
    router.push(`/feedback?conversationId=${conversationId}`);
  };

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-4 pb-32">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 pb-32">
      {/* Persona Card */}
      <ChatPersonaCard persona={persona} isLoading={isPersonaLoading} />
      
      {/* Voice Chat Interface */}
      <div className="mt-8 flex flex-col items-center justify-center min-h-[500px]">
        {isConnecting && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Connecting to voice agent...</p>
            <p className="text-sm text-gray-500 mt-2">Please allow microphone access</p>
          </div>
        )}

        {isConnected && (
          <>
            {/* Status Indicator */}
            <div className="mb-8 text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                isSpeaking ? 'bg-blue-100 text-blue-800' : 
                isListening ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {isSpeaking && (
                  <>
                    <div className="animate-pulse w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                    AI is speaking...
                  </>
                )}
                {isListening && !isSpeaking && (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Listening...
                  </>
                )}
              </div>
            </div>

            {/* Microphone Visualization */}
            <div className="mb-8">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isListening ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
              }`}>
                {isListening ? (
                  <Mic className="w-16 h-16 text-green-600" />
                ) : (
                  <MicOff className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="w-full max-w-2xl bg-gray-50 rounded-lg p-6 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversation Transcript</h3>
                <div className="space-y-3">
                  {transcript.map((msg, idx) => (
                    <div key={idx} className={`text-sm ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <span className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-slate-200 text-gray-900'
                          : 'bg-primary text-white'
                      }`}>
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* End Chat Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white max-w-[1200px] mx-auto">
        <div className="max-w-[1200px] mx-auto p-4 flex justify-center">
          <Button
            onClick={handleEndChat}
            className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
            disabled={!isConnected}
          >
            <Phone className="w-4 h-4" />
            End Call
          </Button>
        </div>
      </div>

      {/* End Chat Confirmation Modal */}
      <Dialog open={isEndChatModalOpen} onOpenChange={setIsEndChatModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Voice Chat</DialogTitle>
            <DialogDescription>Are you sure you want to end this voice conversation?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              No
            </Button>
            <Button onClick={handleConfirmEndChat}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceChatScreen;
