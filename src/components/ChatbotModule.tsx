import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles, HeartHandshake, ShieldCheck, Eye, Edit3, X, Smile, Sticker, Mic, MicOff, ChevronDown, ChevronUp, Volume2, VolumeX, Play, Pause, Square, Radio, AudioLines, RotateCcw, BookmarkPlus, CheckCircle2, BookOpen, Plus, Trash2, HelpCircle } from 'lucide-react';
import { saveOrUpdateChatSessionEntry } from '../utils/recordedEntriesStore';
import { playAudibleRecording, getSupportedAudioMimeType } from '../utils/audioPlayback';

interface Message {
  role: 'user' | 'model';
  content: string;
  isVoiceNote?: boolean;
  audioUrl?: string;
  duration?: number;
}

export default function ChatbotModule() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello there! I'm SaFie, your SafeSpace Counselor and Friend. I'm here with an open heart to listen to whatever is on your mind today — whether it's school stress, family, relationships, or just needing someone to talk to. Take a deep breath... how are you holding up today?" }
  ]);
  const [input, setInput] = useState('');
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers'>('emojis');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showMoodStickers, setShowMoodStickers] = useState<boolean>(false);
  const [showGuidanceStarters, setShowGuidanceStarters] = useState<boolean>(false);
  const [showSafetyTriggers, setShowSafetyTriggers] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveToastMsg, setSaveToastMsg] = useState<string>('');
  const [speakWithSafieMode, setSpeakWithSafieMode] = useState<boolean>(false);
  const [showSpeakWithSafiePanel, setShowSpeakWithSafiePanel] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [speechPitch, setSpeechPitch] = useState<number>(1.06);
  const [showVoiceCustomizerModal, setShowVoiceCustomizerModal] = useState<boolean>(false);

  // Custom Daily Prompt states
  const DEFAULT_SAVED_PROMPTS = [
    "What is one positive moment or win I experienced today?",
    "How am I feeling about my school workload and how can I take care of myself?",
    "What is something that made me feel anxious today, and how can Counselor SaFie help me reframe it?",
    "What is a boundary or healthy habit I want to practice tomorrow?"
  ];
  const [showCustomDailyPromptModal, setShowCustomDailyPromptModal] = useState<boolean>(false);
  const [customDailyPromptText, setCustomDailyPromptText] = useState<string>('');
  const [customDailyPromptCategory, setCustomDailyPromptCategory] = useState<string>('🌱 Self-Reflection');
  const [savedCustomPrompts, setSavedCustomPrompts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('custom_daily_prompts_list');
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_PROMPTS;
    } catch (err) {
      return DEFAULT_SAVED_PROMPTS;
    }
  });

  const handleSaveCustomPrompt = () => {
    if (!customDailyPromptText.trim()) return;
    const newPrompt = customDailyPromptText.trim();
    if (!savedCustomPrompts.includes(newPrompt)) {
      const updated = [newPrompt, ...savedCustomPrompts];
      setSavedCustomPrompts(updated);
      try {
        localStorage.setItem('custom_daily_prompts_list', JSON.stringify(updated));
      } catch (e) {}
      setSaveToastMsg("✨ Custom Daily Prompt saved to your personal prompt library!");
      setTimeout(() => setSaveToastMsg(''), 3500);
    }
  };

  const handleDeleteCustomPrompt = (promptToDelete: string) => {
    const updated = savedCustomPrompts.filter(p => p !== promptToDelete);
    setSavedCustomPrompts(updated);
    try {
      localStorage.setItem('custom_daily_prompts_list', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRecordToDashboard = () => {
    if (messages.length === 0) return;
    saveOrUpdateChatSessionEntry(messages);
    setSaveToastMsg("✨ Chat messages with Friend SaFie successfully recorded in your Dashboard history!");
    setTimeout(() => setSaveToastMsg(''), 4500);
  };

  // Voice message & Audio states
  const [speakingMessageIdx, setSpeakingMessageIdx] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState<boolean>(false);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedVoiceTranscript, setRecordedVoiceTranscript] = useState<string>('');
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [playingVoiceNoteIdx, setPlayingVoiceNoteIdx] = useState<number | null>(null);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseVoiceTextRef = useRef<string>('');
  const voiceInputStreamRef = useRef<MediaStream | null>(null);
  const voiceInputMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceInputAudioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Helper to format text into human-like warm counselor speech cadence
  const cleanCounselorSpeechText = (rawText: string) => {
    if (!rawText) return '';
    let t = rawText;

    // Remove code blocks and URLs
    t = t.replace(/```[\s\S]*?```/g, ' ');
    t = t.replace(/https?:\/\/\S+/g, ' ');

    // Expand abbreviations into natural warm spoken English
    t = t.replace(/\be\.g\.,?\b/gi, 'for example,');
    t = t.replace(/\bi\.e\.,?\b/gi, 'that is,');
    t = t.replace(/\betc\.\b/gi, 'and so on.');
    t = t.replace(/\bvs\.\b/gi, 'versus');
    t = t.replace(/\bw\/\b/gi, 'with');
    t = t.replace(/\bSaFie\b/gi, 'Sah-Fee');
    t = t.replace(/\bRGC\b/gi, 'R G C');
    t = t.replace(/\bPH\b/gi, 'Philippines');

    // Remove markdown formatting symbols
    t = t.replace(/[*_#~`]/g, '');

    // Convert bullet points and numbered list markers into gentle conversational pauses
    t = t.replace(/^\s*[-*•]\s+/gm, ', ');
    t = t.replace(/^\s*\d+\.\s+/gm, ', ');

    // Strip all emojis so TTS does not read out unicode symbol names
    t = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    // Convert line breaks and paragraph gaps into natural sentence pauses
    t = t.replace(/\n+/g, '. ');
    t = t.replace(/\s+/g, ' ').trim();

    return t;
  };

  // Helper to pick the warmest Filipina/Philippine counselor voice available
  const getFilipinaCounselorVoice = (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Look for explicit Philippine English / Tagalog / Filipino voices
    const phVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.includes('en-ph') ||
        l.includes('tl-ph') ||
        l.includes('fil-ph') ||
        n.includes('philippines') ||
        n.includes('filipino') ||
        n.includes('tagalog') ||
        n.includes('rosa') ||
        n.includes('zaria') ||
        n.includes('blessica') ||
        n.includes('mahi')
      );
    });
    if (phVoice) return phVoice;

    // 2. Look for high quality warm female natural/neural voices
    const warmFemaleVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.startsWith('en') &&
        (n.includes('natural') ||
         n.includes('neural') ||
         n.includes('samantha') ||
         n.includes('siri') ||
         n.includes('karen') ||
         n.includes('google us english') ||
         n.includes('google uk english female') ||
         n.includes('female') ||
         n.includes('victoria') ||
         n.includes('jenny'))
      );
    });
    if (warmFemaleVoice) return warmFemaleVoice;

    // 3. Fallback to any English voice
    return voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  };

  // Ensure speech synthesis voices are pre-loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        if (vList && vList.length > 0) {
          setAvailableVoices(vList);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Unlock mobile browser speech synthesis on user interaction
  const unlockAudioForMobile = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  };

  // Speak text using SpeechSynthesis with warm Filipina counselor tone or custom user voice
  const speakText = (text: string, msgIdx: number) => {
    if (!('speechSynthesis' in window)) return;
    unlockAudioForMobile();

    if (isSpeaking && speakingMessageIdx === msgIdx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = cleanCounselorSpeechText(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1.0;

    let chosenVoice: SpeechSynthesisVoice | null = null;
    if (selectedVoiceURI && availableVoices.length > 0) {
      chosenVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI) || null;
    }
    if (!chosenVoice) {
      chosenVoice = getFilipinaCounselorVoice();
    }
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageIdx(msgIdx);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play voice note
  const activeVoiceStopRef = useRef<(() => void) | null>(null);

  const playVoiceNote = (msg: Message, idx: number) => {
    if (activeVoiceStopRef.current) {
      activeVoiceStopRef.current();
      activeVoiceStopRef.current = null;
    }

    if (playingVoiceNoteIdx === idx) {
      setPlayingVoiceNoteIdx(null);
      return;
    }

    setPlayingVoiceNoteIdx(idx);

    const stop = playAudibleRecording({
      audioUrl: msg.audioUrl,
      textFallback: msg.content,
      durationSec: msg.duration || 4,
      onEnd: () => {
        setPlayingVoiceNoteIdx(null);
        activeVoiceStopRef.current = null;
      }
    });

    activeVoiceStopRef.current = stop;
  };

  // Start voice note recording
  const startVoiceNoteRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingDuration(0);
      setRecordedVoiceTranscript('');
      setIsRecordingVoiceNote(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setRecordedAudioBlob(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            stopVoiceNoteRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      // Parallel speech-to-text transcription for voice note caption
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.onresult = (event: any) => {
            let tr = '';
            for (let i = 0; i < event.results.length; i++) {
              tr += event.results[i][0].transcript;
            }
            if (tr.trim()) setRecordedVoiceTranscript(tr.trim());
          };
          recognition.onerror = () => {};
          recognition.start();
          (mediaRecorder as any)._recog = recognition;
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Microphone access simulated or restricted:", err);
      setIsRecordingVoiceNote(true);
      setRecordingDuration(0);
      setRecordedVoiceTranscript("I wanted to share that I'm taking deep breaths and talking through my feelings.");
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => (prev < 15 ? prev + 1 : 15));
      }, 1000);
    }
  };

  const stopVoiceNoteRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if ((mediaRecorderRef.current as any)._recog) {
        try { (mediaRecorderRef.current as any)._recog.stop(); } catch (_) {}
      }
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
  };

  const cancelVoiceNoteRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    setIsRecordingVoiceNote(false);
    setRecordedAudioBlob(null);
    setRecordedVoiceTranscript('');
    setRecordingDuration(0);
  };

  const sendRecordedVoiceNote = () => {
    let capturedBlob: Blob | undefined = undefined;
    if (audioChunksRef.current.length > 0) {
      capturedBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0].type || 'audio/webm' });
    } else if (recordedAudioBlob) {
      capturedBlob = recordedAudioBlob;
    }
    stopVoiceNoteRecording();
    const duration = recordingDuration || 4;
    const transcript = recordedVoiceTranscript.trim() || `[Voice Message • 0:${duration < 10 ? '0' : ''}${duration}]`;
    handleSendVoiceNote(capturedBlob, transcript, duration);
  };

  const handleSendVoiceNote = async (audioBlob?: Blob, transcript?: string, durationSec?: number) => {
    const duration = durationSec || recordingDuration || 4;
    const contentText = transcript?.trim() || `[Voice Message • 0:${duration < 10 ? '0' : ''}${duration}]`;
    let audioUrl: string | undefined = undefined;
    if (audioBlob && audioBlob.size > 0) {
      audioUrl = URL.createObjectURL(audioBlob);
    }

    const voiceMsg: Message = {
      role: 'user',
      content: contentText,
      isVoiceNote: true,
      audioUrl,
      duration
    };

    setMessages(prev => [...prev, voiceMsg]);
    setIsRecordingVoiceNote(false);
    setRecordedAudioBlob(null);
    setRecordedVoiceTranscript('');
    setRecordingDuration(0);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: contentText }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.details || 'Failed to get response');
      }

      const data = await res.json();
      
      if (data.safetyAlertTriggered && data.alertDetails) {
        window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
      }

      const newReply = data.reply;
      setMessages(prev => {
        const updated = [...prev, { role: 'model', content: newReply }];
        saveOrUpdateChatSessionEntry(updated);
        if (autoPlayVoice) {
          setTimeout(() => speakText(newReply, updated.length - 1), 300);
        }
        return updated;
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = "I received your voice message. I am here listening with care and support. How are you feeling right now?";
      setMessages(prev => {
        const updated = [...prev, { role: 'model', content: errorMessage }];
        saveOrUpdateChatSessionEntry(updated);
        if (autoPlayVoice) {
          setTimeout(() => speakText(errorMessage, updated.length - 1), 300);
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (voiceInputMediaRecorderRef.current && voiceInputMediaRecorderRef.current.state !== 'inactive') {
        try {
          voiceInputMediaRecorderRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    baseVoiceTextRef.current = input;
    voiceInputAudioChunksRef.current = [];

    // Attempt to acquire microphone stream for audio backup & visualizer
    let micStream: MediaStream | null = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceInputStreamRef.current = micStream;

      if (typeof MediaRecorder !== 'undefined') {
        const mr = new MediaRecorder(micStream);
        voiceInputMediaRecorderRef.current = mr;
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) voiceInputAudioChunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
          }
          // If no recognition text was captured or user is on browser without webkitSpeechRecognition
          if (!input.trim() || input === baseVoiceTextRef.current) {
            if (voiceInputAudioChunksRef.current.length > 0) {
              const audioBlob = new Blob(voiceInputAudioChunksRef.current, { type: 'audio/webm' });
              if (audioBlob.size > 300) {
                setIsTranscribingVoice(true);
                try {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    const res = await fetch('/api/transcribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.transcript && data.transcript.trim()) {
                        const exact = data.transcript.trim();
                        const base = baseVoiceTextRef.current ? baseVoiceTextRef.current.trim() + ' ' : '';
                        const combined = (base + exact).trim();
                        setInput(combined);
                        if (showPreview) setPreviewText(combined);
                      }
                    }
                    setIsTranscribingVoice(false);
                  };
                  reader.readAsDataURL(audioBlob);
                } catch (e) {
                  console.warn("Audio fallback transcription error:", e);
                  setIsTranscribingVoice(false);
                }
              }
            }
          }
        };
        mr.start(250);
      }
    } catch (micErr) {
      console.warn("Mic stream warning:", micErr);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const chunk = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTranscript += chunk + ' ';
          } else {
            interimTranscript += chunk;
          }
        }

        const exactSpoken = (finalTranscript + interimTranscript).trim();
        if (exactSpoken) {
          const base = baseVoiceTextRef.current ? baseVoiceTextRef.current.trim() + ' ' : '';
          const combined = (base + exactSpoken).trim();
          setInput(combined);
          if (showPreview) {
            setPreviewText(combined);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted' || event.error === 'no-speech') {
          return;
        }
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceInputMediaRecorderRef.current && voiceInputMediaRecorderRef.current.state !== 'inactive') {
          try {
            voiceInputMediaRecorderRef.current.stop();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Speech recognition initialization:', err);
      setIsListening(false);
    }
  };

  const EMOTICONS = [
    '😊', '🤗', '💖', '🌿', '🌟', '🙏', '🌸', '☕', 
    '💙', '✨', '🧘', '💪', '🌈', '☁️', '☀️', '🍃', 
    '🌻', '🕊️', '📖', '💡', '💬', '🎉', '🧸', '💌',
    '🥺', '😌', '🥰', '🌱', '🎈', '🎨', '🏖️', '🌙',
    '🫂', '🌧️', '⚡', '🔥', '🌊', '🤝', '🦋', '💜'
  ];

  const STICKERS = [
    { id: 'hug', emoji: '🫂', title: 'Sending Warm Hugs', category: 'support', text: '🫂 Sending warm hugs and comfort right now!' },
    { id: 'anxious', emoji: '🌧️', title: 'Feeling Anxious', category: 'mind', text: '🌧️ I am feeling quite anxious and overwhelmed today.' },
    { id: 'rest', emoji: '😴', title: 'Need Rest', category: 'calm', text: '😴 Need a peaceful pause and rest from everything.' },
    { id: 'proud', emoji: '🌟', title: 'Proud of Myself', category: 'wins', text: '🌟 I took a small step forward today and I feel proud!' },
    { id: 'breath', emoji: '🍃', title: 'Taking a Deep Breath', category: 'calm', text: '🍃 Pause and deep breath: 4-7-8 calming breath in progress...' },
    { id: 'stress', emoji: '📚', title: 'Exam / School Stress', category: 'school', text: '📚 Struggling with heavy school requirements, assignments, and exams.' },
    { id: 'safe', emoji: '🛡️', title: 'Seeking Safe Space', category: 'support', text: '🛡️ Thankful for this safe, confidential space to talk.' },
    { id: 'grateful', emoji: '💖', title: 'Grateful Today', category: 'wins', text: '💖 Logging a moment of gratitude and positivity today.' },
    { id: 'coffee', emoji: '☕', title: 'Cozy Self-Care Pause', category: 'calm', text: '☕ Taking 5 minutes for warm self-care and tea/coffee.' },
    { id: 'overthinking', emoji: '🧠', title: 'Overthinking Mind', category: 'mind', text: '🧠 My thoughts are racing fast and I need help slowing down.' },
    { id: 'hope', emoji: '🌈', title: 'Hope & Light', category: 'support', text: '🌈 Reminding myself that tough days will pass and better days are ahead.' },
    { id: 'friends', emoji: '🤝', title: 'Friendship Drama', category: 'social', text: '🤝 Dealing with conflict and communication trouble with friends.' },
    { id: 'vent', emoji: '💬', title: 'Safe Vent Space', category: 'support', text: '💬 Just need to vent about what happened today without judgment.' },
    { id: 'grounding', emoji: '🧘', title: '5-4-3-2-1 Grounding', category: 'calm', text: '🧘 Help me ground my mind with the 5-4-3-2-1 sensory technique.' },
    { id: 'motivation', emoji: '🎯', title: 'Need Study Motivation', category: 'school', text: '🎯 Seeking motivation and focus to complete my tasks today.' },
    { id: 'family', emoji: '🏠', title: 'Family Expectations', category: 'social', text: '🏠 Feeling high pressure and strict expectations from family.' }
  ];

  const handleInsertEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    if (showPreview) {
      setPreviewText(prev => (prev || '') + emoji);
    }
  };

  const handleInsertSticker = (stickerText: string) => {
    setInput(prev => (prev ? prev + ' ' + stickerText : stickerText));
    if (showPreview) {
      setPreviewText(prev => (prev ? prev + ' ' + stickerText : stickerText));
    }
    setShowPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    if (!messageText) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.details || 'Failed to get response');
      }

      const data = await res.json();
      
      // If a safety keyword was triggered in the backend, silently broadcast to Parent Portal & Authorities
      if (data.safetyAlertTriggered && data.alertDetails) {
        window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
      }

      setMessages(prev => {
        const updated = [...prev, { role: 'model', content: data.reply }];
        saveOrUpdateChatSessionEntry(updated);
        if (autoPlayVoice || speakWithSafieMode) {
          setTimeout(() => speakText(data.reply, updated.length - 1), 300);
        }
        return updated;
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message?.includes('429') || error.message?.includes('Quota') 
        ? "I am here with you and listening. Even when things feel overwhelming, take a gentle breath. How are you feeling right now?"
        : "I'm so sorry, I had a brief hiccup listening. Please tell me again, I am right here for you.";
      setMessages(prev => {
        const updated = [...prev, { role: 'model', content: errorMessage }];
        saveOrUpdateChatSessionEntry(updated);
        if (autoPlayVoice || speakWithSafieMode) {
          setTimeout(() => speakText(errorMessage, updated.length - 1), 300);
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (text: string) => {
    if (!text.trim()) return;
    setInput(text);
    setPreviewText(text.trim());
    setShowPreview(true);
  };

  const [selectedTopicCategory, setSelectedTopicCategory] = useState<string>('all');

  const counselorTopics = [
    // School & Academic Growth
    { category: 'school', label: '📚 Study Strategies & Exam Prep', text: 'What are effective study techniques and time management strategies for preparing for exams?' },
    { category: 'school', label: '🎯 Goal Setting & Daily Focus', text: 'How can I set realistic daily academic goals and maintain my focus while studying?' },
    { category: 'school', label: '💡 Group Projects & Learning', text: 'Can we discuss tips for collaborating smoothly on class projects and presentations?' },
    
    // Mind & Balance
    { category: 'mind', label: '🌱 Daily Reflection & Healthy Habits', text: 'What daily habits can help me maintain positive motivation and balanced energy throughout the week?' },
    { category: 'mind', label: '🧠 Study Breaks & Mental Balance', text: 'How often should I take study breaks, and what are good activities to recharge my mind?' },
    { category: 'mind', label: '😴 Sleep Routines & Wind-Down', text: 'What are recommended evening routines for getting restful sleep before school days?' },
    
    // Social & Campus Life
    { category: 'social', label: '🤝 Positive Friendships & Support', text: 'How can I build strong, positive friendships and practice active listening with classmates?' },
    { category: 'social', label: '💬 Effective Communication', text: 'What are good ways to express my ideas clearly during class discussions and group work?' },
    { category: 'social', label: '✨ Campus Clubs & Hobbies', text: 'How can participating in school clubs and hobbies contribute to a well-rounded student life?' },

    // Calming & Focus Techniques
    { category: 'calm', label: '🍃 Guided 4-7-8 Calming Breath', text: 'Can you guide me through a 2-minute calming 4-7-8 breathing exercise?' },
    { category: 'calm', label: '🧘 5-4-3-2-1 Sensory Grounding', text: 'Can we try the 5-4-3-2-1 sensory grounding exercise together to improve focus?' },
    { category: 'calm', label: '🕊️ Releasing Daily Study Tension', text: 'What are simple physical stretches and breathing techniques to release muscle tension during study sessions?' },

    // Reflections & Achievements
    { category: 'wins', label: '🌟 Celebrating Daily Milestones', text: 'I completed an important assignment today and wanted to share my progress with you!' },
    { category: 'wins', label: '💖 Daily Gratitude & Mindset', text: 'I want to share 3 things I am grateful for today to maintain a positive outlook.' },
    { category: 'wins', label: '✨ Open Reflection Space', text: 'I would like to have a positive conversation about my goals and daily experiences.' }
  ];

  const filteredTopics = selectedTopicCategory === 'all' 
    ? counselorTopics 
    : counselorTopics.filter(t => t.category === selectedTopicCategory);

  const sampleKeywords = [
    { label: '📚 Study Planning', text: 'What are good ways to structure a study timetable for my upcoming exams?' },
    { label: '🌱 Daily Routine', text: 'How can I balance school assignments, activities, and personal downtime effectively?' },
    { label: '🤝 Group Collaboration', text: 'What are best practices for communicating respectfully in group assignments?' },
    { label: '🍃 Mindful Breathing', text: 'Can you guide me through a quick 2-minute relaxation break?' },
    { label: '🌟 Personal Goals', text: 'How can I track my personal growth and academic progress each week?' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <div className="h-14 sm:h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            <HeartHandshake className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base text-slate-900 font-semibold flex items-center gap-2">
              Your Friend SaFie
            </h2>
            <p className="text-[11px] text-purple-700 font-medium">Caring, empathetic, & non-judgmental support</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              const nextMode = !speakWithSafieMode;
              setSpeakWithSafieMode(nextMode);
              if (nextMode) {
                setAutoPlayVoice(true);
                speakText("Hello my dear friend! I am right here listening with an open heart. Choose any topic below or speak into the microphone, and I will answer back to you!", 0);
              } else {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
              speakWithSafieMode
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-md animate-pulse'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 hover:opacity-90 shadow-2xs'
            }`}
            title="Speak with SaFie • Warm friend counselor voice mode"
          >
            <Mic className="w-3.5 h-3.5 text-yellow-300" />
            <span>{speakWithSafieMode ? '🎙️ Speaking with SaFie (ON)' : 'Speak with SaFie'}</span>
          </button>

          <button
            type="button"
            onClick={handleRecordToDashboard}
            className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Record this chat conversation to your Dashboard History"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Record in Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoPlayVoice(!autoPlayVoice)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoPlayVoice
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title={autoPlayVoice ? "Auto-speak counselor responses: ON" : "Auto-speak counselor responses: OFF"}
          >
            {autoPlayVoice ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Voice Audio: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Voice Audio: OFF</span>
              </>
            )}
          </button>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-medium border-l border-slate-200 pl-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe & Confidential Space
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToastMsg && (
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveToastMsg}</span>
          </div>
          <button
            onClick={() => setSaveToastMsg('')}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full custom-scrollbar flex flex-col gap-4 sm:gap-6 bg-slate-50">
        
        {/* Speak with SaFie Interactive Voice Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-purple-500/40 relative overflow-hidden shrink-0 space-y-4">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/30 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-md shrink-0">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-300">🎙️ Speak with SaFie</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/30 text-pink-200 border border-pink-400/40">
                    Warm Friend Counselor Voice
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                  Talk or Choose a Topic — SaFie Answers Back with Voice
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowVoiceCustomizerModal(true)}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Configure voice actor, speech speed, pitch, and natural counselor tones"
              >
                <Volume2 className="w-4 h-4 text-pink-300" />
                <span>Voice Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !speakWithSafieMode;
                  setSpeakWithSafieMode(next);
                  if (next) {
                    setAutoPlayVoice(true);
                    speakText("Hello my friend! I am right here listening with an open heart. What conversation topic would you like to speak about today?", 0);
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  speakWithSafieMode
                    ? 'bg-pink-500 text-white border border-pink-300 shadow-md animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span>{speakWithSafieMode ? 'Voice Mode Active' : 'Enable Voice Mode'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-purple-100 font-medium leading-relaxed">
            Select a topic below or speak into the microphone. Counselor SaFie will listen empathetically and answer you back directly in a warm, caring voice based on your chosen topic.
          </p>

          {/* Quick Topic Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            {[
              { label: '📚 Study Planning', text: 'Can you help me organize a balanced study schedule and time management plan?' },
              { label: '🎯 Exam Prep Focus', text: 'What are effective study techniques for focusing during exam preparation?' },
              { label: '🌱 Daily Reflection', text: 'How can I practice positive daily reflection and maintain a balanced mindset?' },
              { label: '🤝 Teamwork & Projects', text: 'What are good communication tips for working smoothly on group school projects?' },
              { label: '🌿 Rest & Wind-down', text: 'What are simple wind-down routines for getting restful sleep on school nights?' },
              { label: '🍃 4-7-8 Breathing', text: 'Can you guide me through a 2-minute calming 4-7-8 breathing exercise?' },
              { label: '🧘 Sensory Grounding', text: 'Can we try the 5-4-3-2-1 sensory grounding exercise together to improve focus?' },
              { label: '💖 Daily Goal Check-in', text: 'I would like to share how my day went and reflect on my daily goals.' }
            ].map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!speakWithSafieMode) {
                    setSpeakWithSafieMode(true);
                    setAutoPlayVoice(true);
                  }
                  handlePreview(topic.text);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-pink-500/30 hover:border-pink-300 text-white border border-white/15 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <div className={`flex gap-3 sm:gap-4 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-1 border border-purple-300 shadow-sm">
                  <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
              <div className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                {/* Voice Note Bubble (User Voice Message) */}
                {msg.isVoiceNote ? (
                  <div className="flex flex-col gap-2 min-w-[220px] sm:min-w-[260px]">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-indigo-700/80 border border-indigo-400/30 shadow-inner">
                      <button
                        type="button"
                        onClick={() => playVoiceNote(msg, idx)}
                        className="w-8 h-8 rounded-full bg-white text-indigo-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                        title={playingVoiceNoteIdx === idx ? "Pause voice message" : "Play voice message"}
                      >
                        {playingVoiceNoteIdx === idx ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-100">
                          <span className="flex items-center gap-1">
                            <Mic className="w-3 h-3 text-indigo-300" />
                            <span>Voice Message</span>
                          </span>
                          <span className="font-mono text-[10px] text-indigo-200">
                            0:{msg.duration && msg.duration < 10 ? `0${msg.duration}` : msg.duration || '04'}
                          </span>
                        </div>
                        {/* Audio waveform visualization */}
                        <div className="flex items-center gap-0.5 h-4">
                          {[40, 70, 90, 60, 30, 80, 100, 75, 45, 85, 95, 60, 50, 80, 65, 90, 40, 70].map((h, barIdx) => (
                            <div
                              key={barIdx}
                              className={`flex-1 rounded-full transition-all duration-200 ${
                                playingVoiceNoteIdx === idx 
                                  ? 'bg-amber-300 animate-pulse' 
                                  : 'bg-indigo-300/80'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {msg.content && (
                      <p className="text-xs text-indigo-100 italic border-t border-indigo-500/40 pt-1.5 leading-normal">
                        "{msg.content}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* Voice Message Playback Controls for Counselor SaFie */}
                {msg.role === 'model' && (
                  <div className="pt-2 mt-0.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => speakText(msg.content, idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        speakingMessageIdx === idx && isSpeaking
                          ? 'bg-purple-600 text-white shadow-xs animate-pulse'
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-900 border border-purple-200'
                      }`}
                      title={speakingMessageIdx === idx && isSpeaking ? "Stop Voice Playback" : "Listen to Counselor SaFie's warm, kind voiceover"}
                    >
                      {speakingMessageIdx === idx && isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Voice</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Listen to Voice Message</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1 border border-indigo-200">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
            </div>

          </React.Fragment>
        ))}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 max-w-[80%]">
             <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-1 border border-purple-200">
                <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-purple-800 rounded-tl-none flex items-center gap-2 text-xs sm:text-sm shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Listening with care & formulating guidance...
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>



      {/* Bottom Chat Input Bar - Enlarged & Roomier Space with Emoticons & Stickers */}
      <form onSubmit={(e) => e.preventDefault()} className="p-5 sm:p-7 md:p-8 border-t border-slate-200 bg-white max-w-4xl mx-auto w-full shrink-0 shadow-lg transition-all rounded-t-3xl">
        {/* Message Preview Box */}
        {showPreview && previewText && (
          <div className="mb-4 p-4.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300">
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-white">Message Preview (Review before sending)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Draft preview
                </span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewText(null);
                }}
                className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-2.5 p-4 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm leading-relaxed border border-indigo-400/40 shadow-inner">
              <div className="text-[10px] text-indigo-200 font-mono mb-1.5 flex items-center justify-between border-b border-indigo-400/30 pb-1">
                <span>Receiver: Counselor SaFie</span>
                <span>{previewText.length} characters • Encrypted</span>
              </div>
              <p className="whitespace-pre-wrap font-medium">{previewText}</p>
            </div>

            <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 italic">
                Check for accuracy before dispatching to counselor.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSend(previewText);
                    setShowPreview(false);
                    setPreviewText(null);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm & Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Voice Message Recording Drawer */}
        {isRecordingVoiceNote && (
          <div className="mb-4 p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <span className="text-xs font-bold text-rose-300">
                  Recording voice message
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold border border-slate-700">
                  0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration} / 01:00
                </span>
              </div>
              <button
                type="button"
                onClick={cancelVoiceNoteRecording}
                className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Cancel Voice Message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live sound waveform animation */}
            <div className="flex items-center justify-center gap-1.5 h-12 py-2 bg-slate-950 rounded-xl border border-slate-800 mb-3 px-4">
              {[25, 60, 90, 45, 100, 75, 40, 85, 95, 65, 30, 80, 100, 70, 45, 90, 60, 35, 80, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-rose-400 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(15, (h * (Math.sin((recordingDuration * 4) + i) + 1.2)) / 2.2)}%`,
                    animationDelay: `${(i % 5) * 100}ms`
                  }}
                />
              ))}
            </div>

            {recordedVoiceTranscript && (
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 italic mb-3">
                <span className="text-[10px] text-indigo-300 not-italic font-bold block mb-0.5">Live Voice Transcription:</span>
                "{recordedVoiceTranscript}"
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={cancelVoiceNoteRecording}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={sendRecordedVoiceNote}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice Message</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Emoticons & Expressive Stickers Popover Drawer */}
        {showPicker && (
          <div className="mb-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('emojis')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'emojis'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emoticons</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stickers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'stickers'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sticker className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Expressive Stickers</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tab Content */}
            {activeTab === 'emojis' ? (
              <div>
                <p className="text-[11px] text-slate-400 mb-2 font-medium">Click any emoticon to insert into your message:</p>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                  {EMOTICONS.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="p-2 text-xl rounded-xl hover:bg-slate-800 hover:scale-125 transition-all text-center flex items-center justify-center active:scale-95"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-slate-400 mb-2 font-medium">Click an expressive sticker to insert a warm wellness message:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {STICKERS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleInsertSticker(st.text)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500 text-left transition-all flex items-center gap-2.5 group active:scale-98"
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-slate-900 group-hover:scale-110 transition-transform">{st.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">{st.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{st.text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roomier & Bigger Text Input Area */}
        <div className="relative flex flex-col gap-2 bg-slate-50 border border-slate-300 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200 rounded-2xl p-3 sm:p-4 transition-all shadow-sm">
          {/* Active Voice Listening Banner */}
          {(isListening || isTranscribingVoice) && (
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>
                  {isTranscribingVoice 
                    ? "Transcribing your exact spoken words verbatim..." 
                    : "Voice Text listening in real-time... Speak clearly into your microphone to transcribe text directly here."}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-rose-700 font-bold hover:underline text-[11px] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer shrink-0 ml-2"
              >
                {isTranscribingVoice ? "Transcribing..." : "Done / Stop"}
              </button>
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (showPreview) {
                setPreviewText(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (showPreview && previewText) {
                  handleSend(previewText);
                  setShowPreview(false);
                  setPreviewText(null);
                } else if (input.trim()) {
                  setPreviewText(input.trim());
                  setShowPreview(true);
                }
              }
            }}
            rows={3}
            placeholder="Voice text or type here... Share what's on your mind with Counselor SaFie (Click 'Voice Text' below to record, Press Enter to preview/send)"
            className="w-full bg-transparent resize-none text-slate-900 placeholder-slate-400 focus:outline-none text-xs sm:text-sm min-h-[84px] sm:min-h-[96px] leading-relaxed p-1"
          />

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Record Voice Note / Voice Message Option */}
              <button
                type="button"
                onClick={() => {
                  if (isRecordingVoiceNote) {
                    sendRecordedVoiceNote();
                  } else {
                    startVoiceNoteRecording();
                  }
                }}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isRecordingVoiceNote
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
                title={isRecordingVoiceNote ? "Send Voice Message" : "Record & Send Voice Message"}
              >
                <Radio className={`w-4 h-4 ${isRecordingVoiceNote ? 'text-white animate-pulse' : 'text-indigo-600'}`} />
                <span>{isRecordingVoiceNote ? "Recording Voice..." : "Voice Message"}</span>
              </button>

              {/* Speech-to-Text Voice Dictation */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs'
                    : 'text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200'
                }`}
                title={isListening ? "Stop Voice Recording" : "Voice Text (Speech-to-Text)"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-white" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-slate-600" />
                    <span>Voice Text</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (showPicker && activeTab === 'emojis') {
                    setShowPicker(false);
                  } else {
                    setShowPicker(true);
                    setActiveTab('emojis');
                  }
                }}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  showPicker && activeTab === 'emojis'
                    ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50 border-slate-200'
                }`}
                title="Open Emoticons Picker"
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Emoticons</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (showPicker && activeTab === 'stickers') {
                    setShowPicker(false);
                  } else {
                    setShowPicker(true);
                    setActiveTab('stickers');
                  }
                }}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  showPicker && activeTab === 'stickers'
                    ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50 border-slate-200'
                }`}
                title="Open Expressive Stickers"
              >
                <Sticker className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Stickers</span>
              </button>

              {/* Type Custom Daily Prompt Option Button */}
              <button
                type="button"
                onClick={() => setShowCustomDailyPromptModal(true)}
                className="p-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 transition-colors cursor-pointer shadow-2xs shrink-0"
                title="Add a personal prompt for Counselor SaFie"
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Add personal prompt</span>
              </button>

              <span className="text-[10px] text-slate-400 font-mono pl-1">
                {input.length} characters
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (input.trim()) {
                    setPreviewText(input.trim());
                    setShowPreview(true);
                  }
                }}
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-purple-200 shadow-xs"
                title="Preview message first"
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (showPreview && previewText) {
                    handleSend(previewText);
                    setShowPreview(false);
                    setPreviewText(null);
                  } else if (input.trim()) {
                    setPreviewText(input.trim());
                    setShowPreview(true);
                  }
                }}
                disabled={(!input.trim() && !showPreview) || isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                aria-label="Send message"
                title={showPreview ? "Confirm and Send" : "Preview before sending"}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Express Your Mood: Expressive Stickers (Attached below text input box) */}
        <div 
          id="counselor-mood-stickers-bar"
          className={`mt-2.5 px-3 sm:px-4 rounded-2xl border transition-all duration-300 ease-in-out w-full overflow-hidden ${
            showMoodStickers 
              ? 'py-2.5 bg-purple-50/90 border-purple-200 shadow-xs max-h-48' 
              : 'py-1.5 bg-slate-100/80 hover:bg-purple-50/50 border-slate-200 shadow-2xs max-h-9'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowMoodStickers(prev => !prev)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer focus:outline-none"
          >
            <span className="text-[11px] font-bold text-slate-700 hover:text-purple-800 flex items-center gap-1.5 transition-colors">
              <Sticker className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Express Your Mood: Stickers</span>
              <span className="text-[9px] text-purple-600 font-normal tracking-normal">
                {showMoodStickers ? '(click to collapse)' : '(click to reveal stickers)'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              {showMoodStickers ? (
                <ChevronUp className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </div>
          </button>
          {showMoodStickers && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-2 pb-1 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
              {STICKERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertSticker(st.text);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-600 hover:text-white text-slate-700 border border-purple-200 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer group"
                  title={st.text}
                >
                  <span className="text-base">{st.emoji}</span>
                  <span className="group-hover:text-white whitespace-nowrap">{st.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Guidance Starters & Prompt Suggestions (Attached below text input box) */}
        <div 
          id="counselor-guidance-starters-bar"
          className={`mt-2 px-3 sm:px-4 rounded-2xl border transition-all duration-300 ease-in-out w-full overflow-hidden ${
            showGuidanceStarters 
              ? 'py-3 bg-purple-50/95 border-purple-200 shadow-xs max-h-72' 
              : 'py-1.5 bg-slate-100/80 hover:bg-purple-50/60 border-slate-200 shadow-2xs max-h-9'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowGuidanceStarters(prev => !prev)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer focus:outline-none"
          >
            <span className="text-[11px] font-bold text-slate-700 hover:text-purple-800 flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Today's Conversation Prompts with Counselor SaFie</span>
              <span className="text-[9px] text-purple-600 font-normal tracking-normal">
                {showGuidanceStarters ? '(click to collapse)' : '(click to reveal all topics)'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              {showGuidanceStarters ? (
                <ChevronUp className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </div>
          </button>
          {showGuidanceStarters && (
            <div className="pt-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-1 flex flex-col gap-2">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {[
                  { id: 'all', label: '🌱 All Topics' },
                  { id: 'school', label: '📚 School & Exams' },
                  { id: 'mind', label: '💭 Stress & Mind' },
                  { id: 'social', label: '🤝 Friends & Family' },
                  { id: 'calm', label: '🧘 Calming & Rest' },
                  { id: 'wins', label: '🌟 Wins & Gratitude' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedTopicCategory(cat.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedTopicCategory === cat.id
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-white/80 hover:bg-white text-purple-900 border border-purple-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Topics Horizontal Scroll / Grid */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-0.5 pb-1">
                <button
                  type="button"
                  onClick={() => setShowCustomDailyPromptModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white border border-purple-800 text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>✍️ Add personal topic</span>
                </button>
                {filteredTopics.map((item, topicIdx) => (
                  <button
                    key={topicIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(item.text);
                    }}
                    disabled={isLoading}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <Eye className="w-3 h-3 text-purple-500 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Type Your Custom Daily Prompt Interactive Modal */}
      {showCustomDailyPromptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-purple-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Add Personal Topic
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Create a custom question or reflection topic for Counselor SaFie
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDailyPromptModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Select Topic Category
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {[
                  '🌱 Self-Reflection',
                  '📚 Academic Balance',
                  '💭 Emotional State',
                  '🧘 Calming & Rest',
                  '🌟 Wins & Gratitude'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCustomDailyPromptCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      customDailyPromptCategory === cat
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input for Custom Daily Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Your Custom Daily Prompt
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {customDailyPromptText.length}/300
                </span>
              </div>
              <textarea
                value={customDailyPromptText}
                onChange={(e) => setCustomDailyPromptText(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="e.g. What made me feel proud of myself today, and how can I carry that positive energy forward?"
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-purple-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all leading-relaxed"
              />
            </div>

            {/* Quick Inspiration Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">
                💡 Quick Inspiration Prompts (Click to fill):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "What is something kind I did for myself today?",
                  "How can I better manage my stress before my upcoming exams?",
                  "What emotion am I holding onto right now that I want to let go?",
                  "What is one goal I want to accomplish with a calm mind tomorrow?"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomDailyPromptText(sample)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all text-left cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Custom Daily Prompts Section */}
            {savedCustomPrompts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  📚 Your Saved Daily Prompts ({savedCustomPrompts.length})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {savedCustomPrompts.map((savedPrompt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between gap-2 group hover:border-purple-300 transition-all"
                    >
                      <span className="font-medium line-clamp-2 italic">"{savedPrompt}"</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCustomDailyPromptText(savedPrompt)}
                          className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[10px] cursor-pointer"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomPrompt(savedPrompt)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete prompt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSaveCustomPrompt}
                disabled={!customDailyPromptText.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 disabled:opacity-40 text-purple-800 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Save to Library</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (customDailyPromptText.trim()) {
                      setInput(customDailyPromptText.trim());
                      setShowCustomDailyPromptModal(false);
                    }
                  }}
                  disabled={!customDailyPromptText.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Insert into Textbox
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (customDailyPromptText.trim()) {
                      const promptToSend = `${customDailyPromptCategory}: ${customDailyPromptText.trim()}`;
                      handleSend(promptToSend);
                      setShowCustomDailyPromptModal(false);
                      setCustomDailyPromptText('');
                    }
                  }}
                  disabled={!customDailyPromptText.trim() || isLoading}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to SaFie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* VOICE CUSTOMIZATION & SPEECH SETTINGS MODAL */}
      {showVoiceCustomizerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">SaFie Voice & Speech Studio</h3>
                  <p className="text-xs text-slate-500">Customize voice tone, pacing, pitch, and natural speech rate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceCustomizerModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Counselor Voice Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '🌸 Warm Counselor', rate: 0.88, pitch: 1.06 },
                  { label: '🍃 Unhurried Zen', rate: 0.78, pitch: 0.98 },
                  { label: '💖 Upbeat Peer', rate: 1.0, pitch: 1.15 }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSpeechRate(preset.rate);
                      setSpeechPitch(preset.pitch);
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-extrabold transition-all cursor-pointer ${
                      speechRate === preset.rate && speechPitch === preset.pitch
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Voices Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                Select Installed System Voice ({availableVoices.length} detected)
              </label>
              <select
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="">✨ Automatic Recommended (Filipina / Warm Natural Female)</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.default ? '• Default' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Speech Speed / Pacing</span>
                <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {speechRate.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.4"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Slow & Empathetic (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Brisk (1.4x)</span>
              </div>
            </div>

            {/* Speech Pitch Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Voice Pitch / Softness</span>
                <span className="font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  {speechPitch.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-pink-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Deeper & Calming</span>
                <span>Natural</span>
                <span>Higher & Friendly</span>
              </div>
            </div>

            {/* Test Voice Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => speakText("Kumusta! Hello my friend, this is your customized voice test with SaFie.", 9999)}
                className="px-4 py-2.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-pink-800" />
                <span>Test Voice Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVoiceCustomizerModal(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


