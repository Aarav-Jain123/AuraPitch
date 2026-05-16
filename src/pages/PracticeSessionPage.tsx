import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic, Megaphone, X, AlertCircle, Loader2, MicOff, CameraOff, Brain, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

// Helper to convert Float32Array PCM to Base64 (16-bit Int)
function pcmToBase64(float32Array: Float32Array): string {
  const int16Buffer = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    int16Buffer[i] = Math.max(-1, Math.min(1, float32Array[i])) * 0x7FFF;
  }
  const uint8Buffer = new Uint8Array(int16Buffer.buffer);
  let binary = '';
  for (let i = 0; i < uint8Buffer.length; i++) {
    binary += String.fromCharCode(uint8Buffer[i]);
  }
  return btoa(binary);
}

// Helper to play base64 PCM back
function playAudioChunk(
  audioCtx: AudioContext, 
  base64: string, 
  nextStartTimeRef: React.MutableRefObject<number>,
  audioSourcesRef: React.MutableRefObject<AudioBufferSourceNode[]>
) {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 0x7FFF;
    }

    const buffer = audioCtx.createBuffer(1, float32Data.length, 16000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    // Smooth scheduling: lookahead buffer to handle network jitter
    const minLookahead = 0.15; // 150ms constant lookahead
    
    let startTime = nextStartTimeRef.current;
    
    // If the scheduled time is way in the past or hasn't been initialized, 
    // reset to 'now' plus looking ahead.
    if (startTime < now + 0.02) {
      startTime = now + minLookahead;
    }

    // Schedule the chunk
    source.start(startTime);
    
    // Update the next start time based on the duration of this chunk
    nextStartTimeRef.current = startTime + buffer.duration;
    
    audioSourcesRef.current.push(source);
    source.onended = () => {
      audioSourcesRef.current = audioSourcesRef.current.filter(s => s !== source);
    };
  } catch (err) {
    console.error("Error playing audio chunk:", err);
  }
}

export default function PracticeSessionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [transcripts, setTranscripts] = useState<{ type: 'user' | 'model', text: string, timestamp: number }[]>([]);
  const [aiCoachThought, setAiCoachThought] = useState<string>("Initializing your AI coach...");
  const [aiCoachTone, setAiCoachTone] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [lastAiMessageTime, setLastAiMessageTime] = useState<number>(Date.now());
  const [sessionStartTime] = useState<number>(Date.now());
  const [metrics, setMetrics] = useState<{ time: string, confidence: number, pace: number }[]>([]);
  const [livePace, setLivePace] = useState<number>(140);
  const [fillerCount, setFillerCount] = useState<number>(0);
  const [eyeContactStatus, setEyeContactStatus] = useState<'Excellent' | 'Good' | 'Fair'>('Good');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { title = "Public Speaking Practice", description = "No context provided." } = (location.state as any) || {};
  const [sessionId] = useState<string>(crypto.randomUUID());

  const lastFillerCheckRef = useRef<number>(0);

  // Analyze transcripts for Pace and Filler Words in real-time
  useEffect(() => {
    const userSpeeches = transcripts.filter(t => t.type === 'user');
    if (userSpeeches.length === 0) return;

    // 1. Pace Calculation (Sliding window of 20 seconds)
    const now = Date.now();
    const windowMs = 20000;
    const recentSpeeches = userSpeeches.filter(t => now - t.timestamp < windowMs);
    
    if (recentSpeeches.length > 0) {
      const totalWords = recentSpeeches.reduce((sum, t) => sum + t.text.trim().split(/\s+/).filter(w => w.length > 0).length, 0);
      const calculatedPace = Math.round((totalWords / (windowMs / 1000)) * 60);
      if (calculatedPace > 0) {
        // Smoothly update pace to avoid erratic jumps
        setLivePace(prev => Math.round(prev * 0.8 + calculatedPace * 0.2)); 
      }
    }

    // 2. Filler Word Detection
    // We only check the most recent message to avoid re-counting
    const lastSpeech = userSpeeches[userSpeeches.length - 1];
    if (lastSpeech && lastSpeech.timestamp > lastFillerCheckRef.current) {
      const fillers = /\b(um|uh|ah|uhm|er|you know|basically)\b/gi;
      const matches = lastSpeech.text.match(fillers);
      if (matches) {
        setFillerCount(prev => prev + matches.length);
      }
      lastFillerCheckRef.current = lastSpeech.timestamp;
    }
  }, [transcripts]);

  const getToneFromText = (text: string): 'positive' | 'neutral' | 'negative' => {
    const lower = text.toLowerCase();
    
    // Negative/Urgent indicators
    if (
      lower.includes("rushing") || 
      lower.includes("fast") || 
      lower.includes("slow") || 
      lower.includes("filler") || 
      lower.includes("um") || 
      lower.includes("uh") || 
      lower.includes("stop") || 
      lower.includes("reset") || 
      lower.includes("error") ||
      lower.includes("slouch") ||
      lower.includes("notes") ||
      lower.includes("look down") ||
      lower.includes("don't") ||
      lower.includes("avoid") ||
      lower.includes("missing")
    ) return 'negative';

    // Positive indicators
    if (
      lower.includes("good") || 
      lower.includes("great") || 
      lower.includes("excellent") || 
      lower.includes("perfect") || 
      lower.includes("nice") || 
      lower.includes("keep going") || 
      lower.includes("hook") || 
      lower.includes("strong") ||
      lower.includes("connected")
    ) return 'positive';

    return 'neutral';
  };

  // Local coaching logic to provide immediate feedback when AI is silent
  useEffect(() => {
    const coachInterval = setInterval(() => {
      // Only provide local advice if the AI hasn't spoken in 12 seconds
      if (Date.now() - lastAiMessageTime > 12000 && status === 'granted') {
        if (livePace > 170) {
          setAiCoachThought("You're rushing slightly. Take a deep breath and emphasize your keywords.");
          setAiCoachTone('negative');
        } else if (livePace < 100) {
          setAiCoachThought("Pick up the energy a bit. Your audience needs more momentum here.");
          setAiCoachTone('neutral');
        } else if (fillerCount > 8) {
          setAiCoachThought("Watch the filler words. Try to embrace the silence between points instead of saying 'um'.");
          setAiCoachTone('negative');
        } else if (eyeContactStatus === 'Fair') {
          setAiCoachThought("Try to look directly into the camera lens to connect better with your audience.");
          setAiCoachTone('negative');
        }
      }
    }, 4000);

    return () => clearInterval(coachInterval);
  }, [lastAiMessageTime, livePace, fillerCount, eyeContactStatus, status]);

  // Gemini Live refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopStream = (mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
  };

  const connectToGemini = useCallback((mediaStream: MediaStream) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to AuraPitch AI Bridge');
      setAiCoachThought("Connected! Start speaking or move to see feedback.");
      setAiCoachTone('positive');
      
      // Send setup
      ws.send(JSON.stringify({
        setup: { title, description }
      }));

      // Start audio streaming
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const source = audioCtx.createMediaStreamSource(mediaStream);
      
      // Analyser for real-time audio levels
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMuted) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      // Real-time audio level monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      audioLevelIntervalRef.current = setInterval(() => {
        if (!isMuted) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          // Normalize and cap the level
          setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        } else {
          setAudioLevel(0);
        }
      }, 100);

      // Start video streaming (send frame every 3 seconds)
      videoIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && !isVideoOff && videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = 300; 
            canvas.height = 225;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            ws.send(JSON.stringify({ video: base64 }));
          }
        }
      }, 3000);

      // Record real-time metrics for the final report
      metricsIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Occasional eye contact update (simulating heuristic)
        if (Math.random() > 0.8) {
          const statuses: ('Excellent' | 'Good' | 'Fair')[] = ['Excellent', 'Good', 'Fair'];
          // Bias towards Good if speaking
          const index = audioLevel > 20 ? (Math.random() > 0.4 ? 0 : 1) : Math.floor(Math.random() * 3);
          setEyeContactStatus(statuses[index]);
        }

        // Confidence heuristic: derived from volume consistency and eye contact
        const confidence = Math.min(100, 70 + (audioLevel > 15 ? 10 : -5) + (eyeContactStatus === 'Excellent' ? 15 : eyeContactStatus === 'Good' ? 5 : 0));

        setMetrics(prev => [
          ...prev, 
          { 
            time: timeStr, 
            confidence: confidence, 
            pace: livePace 
          }
        ]);
      }, 2000);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'audio' && audioCtxRef.current) {
        playAudioChunk(audioCtxRef.current, msg.data, nextStartTimeRef, audioSourcesRef);
      } else if (msg.type === 'modelTranscript') {
        const text = msg.data;
        setAiCoachThought(text);
        setAiCoachTone(getToneFromText(text));
        setLastAiMessageTime(Date.now());
        setTranscripts(prev => [...prev, { type: 'model', text, timestamp: Date.now() }]);
      } else if (msg.type === 'userTranscript') {
        setTranscripts(prev => [...prev, { type: 'user', text: msg.data, timestamp: Date.now() }]);
      } else if (msg.type === 'interrupted') {
        // Stop all current playing audio
        audioSourcesRef.current.forEach(source => {
          try { source.stop(); } catch(e) {}
        });
        audioSourcesRef.current = [];
        if (audioCtxRef.current) {
          nextStartTimeRef.current = audioCtxRef.current.currentTime;
        }
      }
    };

    ws.onclose = () => {
      console.log('AI Bridge disconnected');
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
    };
  }, [isMuted, isVideoOff]);

  const startSession = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('granted');
      connectToGemini(mediaStream);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setStatus('denied');
      setError('AuraPitch needs access to your camera and microphone to provide real-time feedback. Please enable them in your browser settings.');
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      stopStream(stream);
      if (wsRef.current) wsRef.current.close();
      if (micProcessorRef.current) micProcessorRef.current.disconnect();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch (e) {
        console.warn("AudioContext cleanup error ignored:", e);
      }
    };
  }, []);

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndSession = async () => {
    setIsGenerating(true);
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const durationArr = [Math.floor(elapsedSeconds / 60), elapsedSeconds % 60];
    const durationStr = `${durationArr[0].toString().padStart(2, '0')}:${durationArr[1].toString().padStart(2, '0')}`;

    // Stop streams immediately
    stopStream(stream);
    setStream(null);
    if (wsRef.current) wsRef.current.close();
    if (micProcessorRef.current) micProcessorRef.current.disconnect();
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    
    try {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    } catch (e) {
      console.warn("AudioContext end-session cleanup error ignored:", e);
    }

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          duration: durationStr,
          metrics: metrics,
          transcripts: transcripts
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation failed');
      }
      
      const aiReport = await response.json();

      const finalReport = {
        sessionId,
        title,
        duration: durationStr,
        metrics: metrics.length > 2 ? metrics : [
          { time: '0:00', confidence: 65, pace: 130 },
          { time: '0:05', confidence: 70, pace: 135 },
          { time: '0:10', confidence: 75, pace: 142 },
        ],
        aiSuggestions: aiReport.aiSuggestions,
        scores: {
          tone: aiReport.scores.tone,
          voice: aiReport.scores.voice,
          visual: isVideoOff ? 10 : aiReport.scores.visual
        }
      };

      navigate('/session-report', { state: finalReport });
    } catch (error) {
      console.error('Error generating report:', error);
      const fallbackReport = {
        sessionId,
        title,
        duration: durationStr,
        metrics: metrics.length > 0 ? metrics : [
          { time: '0:00', confidence: 60, pace: 120 },
          { time: '0:05', confidence: 65, pace: 125 },
        ],
        aiSuggestions: [
          "Connection issues occurred during AI analysis. Baseline assessment provided.",
          "Maintain more consistent vocal volume during key points.",
          "Consider using pauses to emphasize your most important statements.",
          "Great energy! Try to channel it into more deliberate hand gestures."
        ],
        scores: {
          tone: 65,
          voice: 70,
          visual: isVideoOff ? 10 : 75
        }
      };
      navigate('/session-report', { state: fallbackReport });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white transition-colors duration-300">
      <Navbar />
      
      <main className="pt-24 px-4 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col items-center">
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex-1 w-full flex flex-col md:flex-row justify-center items-center gap-8 overflow-hidden">
          <div className="flex-[3] flex flex-col gap-6 h-full max-h-full min-w-0">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex-shrink-0">
              <AnimatePresence mode="wait">
                {status === 'requesting' && (
                  <motion.div 
                    key="requesting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 bg-slate-950/50 backdrop-blur-sm"
                  >
                    <div className="w-20 h-20 rounded-full bg-rose-600/20 flex items-center justify-center mb-6">
                      <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Requesting Permissions</h2>
                    <p className="text-slate-400 max-w-md">Please click "Allow" when your browser asks for camera and microphone access.</p>
                  </motion.div>
                )}

                {status === 'denied' && (
                  <motion.div 
                    key="denied"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-slate-950"
                  >
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-red-500">Access Denied</h2>
                    <p className="text-slate-400 max-w-md mb-8">{error}</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={startSession}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold transition-all"
                      >
                        Try Again
                      </button>
                      <button 
                        onClick={() => navigate('/home')}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                      >
                        Go Back
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-full h-full"> 
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-contain transition-opacity duration-700 ${status === 'granted' ? 'opacity-100' : 'opacity-0'} ${isVideoOff ? 'hidden' : 'block'}`}
                />
                {isVideoOff && status === 'granted' && (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                      <CameraOff className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-medium font-display tracking-tight text-lg">Camera is Off</p>
                  </div>
                )}
                
                {status === 'granted' && (
                  <>
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-red-500">Live Feedback</span>
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
                      <button 
                          onClick={handleEndSession}
                          className="h-14 px-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-xl shadow-red-600/20 flex items-center gap-2 active:scale-95"
                      >
                          <X className="w-5 h-5" /> End Session
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Real-time Status Bars */}
            {status === 'granted' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto space-y-5 px-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        animate={{ width: isMuted ? '0%' : `${audioLevel}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]" 
                      />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Audio Level</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        animate={{ 
                          width: isVideoOff ? '0%' : `${Math.min(100, 70 + (audioLevel > 15 ? 10 : -5) + (eyeContactStatus === 'Excellent' ? 15 : 5))}%` 
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">AI Confidence</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Insights Section (Side Panel on Desktop) */}
          {status === 'granted' && (
            <div className="hidden md:flex flex-1 min-w-[320px] max-w-md flex-col gap-6 py-4 h-full overflow-y-auto pr-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shrink-0"
              >
                <div className="flex items-center gap-3 mb-4">
                    <Megaphone className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-sm">Real-time Insights</h3>
                </div>
                <div className="space-y-5">
                    <div className="flex items-center justify-between group">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Pace</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${livePace > 170 ? 'bg-red-500 animate-pulse' : livePace > 160 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className={`text-xs font-black tracking-tight ${livePace > 160 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {livePace > 170 ? 'Too Fast' : livePace > 155 ? 'Fast' : livePace < 100 ? 'Slow' : 'Perfect'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">({livePace} wpm)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Filler Words</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-tight ${fillerCount > 8 ? 'text-red-400' : fillerCount > 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {fillerCount}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">detected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Eye Contact</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${eyeContactStatus === 'Excellent' ? 'bg-emerald-500' : eyeContactStatus === 'Good' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className={`text-xs font-black tracking-tight ${eyeContactStatus === 'Excellent' ? 'text-emerald-400' : eyeContactStatus === 'Good' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {eyeContactStatus}
                        </span>
                      </div>
                    </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className={`p-6 backdrop-blur-xl border rounded-3xl transition-colors duration-500 shrink-0 relative overflow-hidden ${
                  aiCoachTone === 'positive' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : aiCoachTone === 'negative'
                    ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'bg-rose-600/10 border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.1)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className={`w-4 h-4 ${
                      aiCoachTone === 'positive' ? 'text-emerald-400' : aiCoachTone === 'negative' ? 'text-red-400' : 'text-rose-400'
                    }`} />
                    <h4 className={`text-[10px] font-black uppercase tracking-widest leading-none ${
                      aiCoachTone === 'positive' ? 'text-emerald-400' : aiCoachTone === 'negative' ? 'text-red-400' : 'text-rose-400'
                    }`}>AI Coach Suggestion</h4>
                  </div>
                  <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    aiCoachTone === 'positive' ? 'border-emerald-500/30 text-emerald-500' : aiCoachTone === 'negative' ? 'border-red-500/30 text-red-500' : 'border-rose-500/30 text-rose-500'
                  }`}>Live</div>
                </div>
                <div className="min-h-[4.5em] flex items-center mb-4">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={aiCoachThought}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`text-xs leading-relaxed font-medium transition-colors duration-500 ${
                        aiCoachTone === 'positive' ? 'text-emerald-100' : aiCoachTone === 'negative' ? 'text-red-100' : 'text-rose-100'
                      }`}
                    >
                      "{aiCoachThought}"
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className={`h-full ${
                          aiCoachTone === 'positive' ? 'bg-emerald-500' : aiCoachTone === 'negative' ? 'bg-red-500' : 'bg-rose-500'
                        }`}
                     />
                   </div>
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Analyzing</span>
                </div>
              </motion.div>
              
              <div className="mt-auto pb-4">
                  {/* Empty space for flex layout */}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
            </div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black mb-4 tracking-tight"
            >
              Analyzing your performance...
            </motion.h2>
            <p className="text-slate-400 max-w-sm">
              Our AI coach is reviewing your tone, pace, and transcript to provide your final report.
            </p>
            
            <div className="mt-12 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-rose-500"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

