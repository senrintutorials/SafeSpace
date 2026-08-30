import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Sparkles, BookOpen, Music, X, Send, Radio,
  Move, ChevronRight, Wind, Play, Pause, Palette, Check, RefreshCw,
  Volume2, VolumeX, Mic, Sliders, ShieldCheck, CheckCircle2, Zap,
  Compass, Heart, Award, Target, Activity, Flame, Image as ImageIcon
} from 'lucide-react';
import { UserProfile, getUserDisplayName } from '../types/auth';
import { useLocationTracker } from '../utils/locationTracker';

interface SafieMascotProps {
  currentUser?: UserProfile | null;
  onNavigate?: (module: string) => void;
  onOpenCheckInModal?: () => void;
}

export type SafiePose = 'greeting' | 'listening' | 'encouraging' | 'calming';

export interface SafieVoiceProfile {
  id: string;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  gender: 'Female' | 'Male' | 'Neutral';
  sampleText: string;
}

export const SAFIE_HUMAN_VOICES: SafieVoiceProfile[] = [
  {
    id: 'warm_counselor',
    name: '🌸 Natural Warm Counselor (Female)',
    description: 'Soft, empathetic female human tone with natural comforting cadence.',
    pitch: 1.05,
    rate: 0.92,
    gender: 'Female',
    sampleText: "Hello there! I'm Safie. Take a gentle breath—I'm right here to support you."
  },
  {
    id: 'cheerful_buddy',
    name: '🌷 Upbeat Campus Companion (Female)',
    description: 'Bright, motivating female human tone to cheer you on through study sessions.',
    pitch: 1.15,
    rate: 1.00,
    gender: 'Female',
    sampleText: "Hey friend! You've got this today! Let's conquer your goals together."
  },
  {
    id: 'soft_whisper',
    name: '🌙 Gentle Sanctuary Whisper (Female)',
    description: 'Ultra-soft, delicate female human tone for stress reduction and quiet breaks.',
    pitch: 0.95,
    rate: 0.85,
    gender: 'Female',
    sampleText: "Rest your mind for a moment. You deserve this quiet, peaceful break."
  },
  {
    id: 'empowering_hero',
    name: '⚡ Energetic Mentor (Female)',
    description: 'Confident, inspiring female voice to build emotional resilience.',
    pitch: 1.08,
    rate: 0.98,
    gender: 'Female',
    sampleText: "Remember your courage. Every challenge you face makes you stronger."
  },
  {
    id: 'reassuring_male',
    name: '💙 Deep Reassuring Mentor (Male)',
    description: 'Calm, steady male voice providing grounding and protective advice.',
    pitch: 0.78,
    rate: 0.90,
    gender: 'Male',
    sampleText: "Everything is under control. Take things one step at a time."
  },
  {
    id: 'gentle_brother',
    name: '🛡️ Friendly Campus Brother (Male)',
    description: 'Warm, approachable male tone for friendly, supportive guidance.',
    pitch: 0.86,
    rate: 0.96,
    gender: 'Male',
    sampleText: "I'm right here with you. Don't stress, we will figure this out together."
  },
  {
    id: 'mindful_monk',
    name: '🧘 Peaceful Zen Counselor (Male)',
    description: 'Deep, resonant male voice designed for deep breathing & anxiety relief.',
    pitch: 0.72,
    rate: 0.82,
    gender: 'Male',
    sampleText: "Inhale peace... release your thoughts... you are safe and grounded here."
  },
  {
    id: 'dynamic_coach',
    name: '🚀 Inspiring Success Coach (Male)',
    description: 'Clear, confident male motivation to boost your self-confidence.',
    pitch: 0.82,
    rate: 1.02,
    gender: 'Male',
    sampleText: "Keep pushing forward! You have incredible potential within you."
  },
  {
    id: 'zen_guide',
    name: '🌿 Ambient Zen Guide (Neutral)',
    description: 'Balanced, peaceful tone for universal mindfulness and meditation.',
    pitch: 0.90,
    rate: 0.82,
    gender: 'Neutral',
    sampleText: "Focus on your breath... feel the calm flowing through your mind."
  }
];

export interface SafieColorTheme {
  id: string;
  name: string;
  bodyGradient: [string, string, string];
  bodyStroke: string;
  faceGradient: [string, string, string];
  faceStroke: string;
  earMuffGradient: [string, string];
  headsetStroke: string;
  headsetEarFill: string;
  antennaOrbGradient: [string, string, string];
  antennaOrbPing: string;
  glowColor: string;
  accentBadge: string;
}

export const SAFIE_COLOR_THEMES: SafieColorTheme[] = [
  {
    id: 'teal',
    name: 'Teal & Mint',
    bodyGradient: ['#2DD4BF', '#0D9488', '#115E59'],
    bodyStroke: '#134E4A',
    faceGradient: ['#F0FDFA', '#CCFBF1', '#99F6E4'],
    faceStroke: '#0D9488',
    earMuffGradient: ['#FB923C', '#EA580C'],
    headsetStroke: '#0F766E',
    headsetEarFill: '#134E4A',
    antennaOrbGradient: ['#FEF08A', '#FDE047', '#EAB308'],
    antennaOrbPing: '#FDE047',
    glowColor: 'bg-teal-400/30 group-hover:bg-teal-400/50',
    accentBadge: 'bg-teal-500'
  },
  {
    id: 'pink',
    name: 'Cotton Candy',
    bodyGradient: ['#F472B6', '#DB2777', '#831843'],
    bodyStroke: '#701A75',
    faceGradient: ['#FFF1F2', '#FFE4E6', '#FECDD3'],
    faceStroke: '#DB2777',
    earMuffGradient: ['#38BDF8', '#0284C7'],
    headsetStroke: '#9D174D',
    headsetEarFill: '#500724',
    antennaOrbGradient: ['#FEF08A', '#F43F5E', '#BE123C'],
    antennaOrbPing: '#F43F5E',
    glowColor: 'bg-pink-400/30 group-hover:bg-pink-400/50',
    accentBadge: 'bg-pink-500'
  },
  {
    id: 'purple',
    name: 'Cosmic Violet',
    bodyGradient: ['#C084FC', '#9333EA', '#581C87'],
    bodyStroke: '#3B0764',
    faceGradient: ['#FAF5FF', '#F3E8FF', '#E9D5FF'],
    faceStroke: '#9333EA',
    earMuffGradient: ['#A3E635', '#65A30D'],
    headsetStroke: '#7E22CE',
    headsetEarFill: '#4C1D95',
    antennaOrbGradient: ['#F0ABFC', '#E879F9', '#C084FC'],
    antennaOrbPing: '#E879F9',
    glowColor: 'bg-purple-400/30 group-hover:bg-purple-400/50',
    accentBadge: 'bg-purple-500'
  },
  {
    id: 'blue',
    name: 'Ocean Sapphire',
    bodyGradient: ['#60A5FA', '#2563EB', '#1E3A8A'],
    bodyStroke: '#172554',
    faceGradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE'],
    faceStroke: '#2563EB',
    earMuffGradient: ['#FF7849', '#E04818'],
    headsetStroke: '#1D4ED8',
    headsetEarFill: '#1E40AF',
    antennaOrbGradient: ['#A5F3FC', '#22D3EE', '#0891B2'],
    antennaOrbPing: '#22D3EE',
    glowColor: 'bg-blue-400/30 group-hover:bg-blue-400/50',
    accentBadge: 'bg-blue-500'
  },
  {
    id: 'amber',
    name: 'Golden Honey',
    bodyGradient: ['#FBBF24', '#D97706', '#78350F'],
    bodyStroke: '#451A03',
    faceGradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'],
    faceStroke: '#D97706',
    earMuffGradient: ['#34D399', '#059669'],
    headsetStroke: '#B45309',
    headsetEarFill: '#78350F',
    antennaOrbGradient: ['#FEF08A', '#FACC15', '#CA8A04'],
    antennaOrbPing: '#FACC15',
    glowColor: 'bg-amber-400/30 group-hover:bg-amber-400/50',
    accentBadge: 'bg-amber-500'
  },
  {
    id: 'emerald',
    name: 'Emerald Sage',
    bodyGradient: ['#34D399', '#059669', '#064E3B'],
    bodyStroke: '#022C22',
    faceGradient: ['#ECFDF5', '#D1FAE5', '#A7F3D0'],
    faceStroke: '#059669',
    earMuffGradient: ['#F472B6', '#DB2777'],
    headsetStroke: '#047857',
    headsetEarFill: '#065F46',
    antennaOrbGradient: ['#FEF08A', '#FDE047', '#EAB308'],
    antennaOrbPing: '#FDE047',
    glowColor: 'bg-emerald-400/30 group-hover:bg-emerald-400/50',
    accentBadge: 'bg-emerald-500'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    bodyGradient: ['#F43F5E', '#A855F7', '#1E1B4B'],
    bodyStroke: '#4C1D95',
    faceGradient: ['#18181B', '#27272A', '#3F3F46'],
    faceStroke: '#22D3EE',
    earMuffGradient: ['#06B6D4', '#0891B2'],
    headsetStroke: '#9333EA',
    headsetEarFill: '#2E1065',
    antennaOrbGradient: ['#67E8F9', '#22D3EE', '#0284C7'],
    antennaOrbPing: '#22D3EE',
    glowColor: 'bg-rose-500/30 group-hover:bg-rose-500/50',
    accentBadge: 'bg-rose-500'
  }
];

export default function SafieMascot({
  currentUser,
  onNavigate,
  onOpenCheckInModal
}: SafieMascotProps) {
  const { location: trackerLocation } = useLocationTracker();
  
  // Mascot state
  const [pose, setPose] = useState<SafiePose>('greeting');
  const [isOpen, setIsOpen] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string>("Hello! I'm Safie. Drag me anywhere on the page!");
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [isWandering, setIsWandering] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick-chat' | 'voice-command' | 'assistance' | 'voices' | 'breathing' | 'poses' | 'colors'>('quick-chat');
  
  // Voice Command State & Recognition Ref
  const [isSiriListening, setIsSiriListening] = useState<boolean>(false);
  const [siriTranscript, setSiriTranscript] = useState<string>('');
  const [siriStatus, setSiriStatus] = useState<string>('Say "Hey Safie" or speak any voice command below!');
  const [isSiriProcessing, setIsSiriProcessing] = useState<boolean>(false);
  const siriRecognitionRef = useRef<any>(null);
  
  // Human Voice Synthesis & Voice Option State
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('safie_voice_audio_enabled') !== 'false'; } catch (e) { return true; }
  });

  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<SafieVoiceProfile>(() => {
    try {
      const saved = localStorage.getItem('safie_voice_profile_id');
      const found = SAFIE_HUMAN_VOICES.find(v => v.id === saved);
      if (found) return found;
    } catch (e) {}
    return SAFIE_HUMAN_VOICES[0];
  });

  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');

  const [voicePitch, setVoicePitch] = useState<number>(() => {
    try { return Number(localStorage.getItem('safie_voice_pitch')) || selectedVoiceProfile.pitch; } catch (e) { return selectedVoiceProfile.pitch; }
  });

  const [voiceRate, setVoiceRate] = useState<number>(() => {
    try { return Number(localStorage.getItem('safie_voice_rate')) || selectedVoiceProfile.rate; } catch (e) { return selectedVoiceProfile.rate; }
  });

  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedSystemVoice, setSelectedSystemVoice] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fetch device system human voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        setSystemVoices(vList);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speakSafieMessage = (text: string) => {
    if (!isVoiceAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean text of emojis for clear TTS reading
      const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = voicePitch;
      utterance.rate = voiceRate;

      if (selectedSystemVoice) {
        const matchedSys = systemVoices.find(v => v.name === selectedSystemVoice);
        if (matchedSys) utterance.voice = matchedSys;
      } else if (systemVoices.length > 0) {
        let matched: SpeechSynthesisVoice | undefined;
        if (selectedVoiceProfile.gender === 'Female') {
          matched = systemVoices.find(v => 
            v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || 
            v.name.includes('Zira') || v.name.includes('Moira') || v.name.includes('Fiona') || 
            v.name.includes('Veena') || v.name.includes('Google US English') || v.name.toLowerCase().includes('female')
          ) || systemVoices.find(v => v.lang.startsWith('en'));
        } else if (selectedVoiceProfile.gender === 'Male') {
          matched = systemVoices.find(v => 
            v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Alex') || 
            v.name.includes('Fred') || v.name.includes('George') || v.name.includes('Oliver') || 
            v.name.includes('Rishi') || v.name.includes('Google UK English Male') || v.name.toLowerCase().includes('male')
          ) || systemVoices.find(v => v.lang.startsWith('en'));
        } else {
          matched = systemVoices.find(v => v.name.includes('Natural') || v.lang.startsWith('en'));
        }
        if (matched) utterance.voice = matched;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  const handleSelectVoiceProfile = (profile: SafieVoiceProfile) => {
    setSelectedVoiceProfile(profile);
    setVoicePitch(profile.pitch);
    setVoiceRate(profile.rate);
    try {
      localStorage.setItem('safie_voice_profile_id', profile.id);
      localStorage.setItem('safie_voice_pitch', String(profile.pitch));
      localStorage.setItem('safie_voice_rate', String(profile.rate));
    } catch (e) {}
    speakSafieMessage(profile.sampleText);
  };

  const toggleVoiceAudio = () => {
    const nextState = !isVoiceAudioEnabled;
    setIsVoiceAudioEnabled(nextState);
    try { localStorage.setItem('safie_voice_audio_enabled', String(nextState)); } catch (e) {}
    if (nextState) {
      speakSafieMessage("Safie human voice audio activated!");
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };
  
  // Color Customization State with localStorage persistence
  const [selectedTheme, setSelectedTheme] = useState<SafieColorTheme>(() => {
    try {
      const saved = localStorage.getItem('safie_color_theme_id');
      if (saved) {
        const found = SAFIE_COLOR_THEMES.find(t => t.id === saved);
        if (found) return found;
      }
    } catch (e) {
      // ignore fallback
    }
    return SAFIE_COLOR_THEMES[0];
  });

  const handleSelectTheme = (theme: SafieColorTheme) => {
    setSelectedTheme(theme);
    const msg = `Safie styled in ${theme.name}! ✨`;
    setSpeechBubbleText(msg);
    speakSafieMessage(`I love my new ${theme.name} colors!`);
    try {
      localStorage.setItem('safie_color_theme_id', theme.id);
    } catch (e) {
      // ignore
    }
  };

  // Dragging State
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef<{ pointerX: number; pointerY: number; posX: number; posY: number }>({ pointerX: 0, pointerY: 0, posX: 0, posY: 0 });
  const hasDraggedRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: position.x,
      posY: position.y
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;
    
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
    }
    
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore fallback
      }
    }
  };

  const handleResetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setSpeechBubbleText("Safie reset back to default corner! 📍");
    setShowSpeechBubble(true);
  };
  
  // Quick Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'safie'; text: string }>>([
    { sender: 'safie', text: `Hi ${currentUser ? getUserDisplayName(currentUser).split(' ')[0] : 'friend'}! I'm Safie, your AI counselor assistant. How can I help you navigate SafeSpace today?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Breathing Guide State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  // Auto hide speech bubble after 12s if not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowSpeechBubble(false);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle Breathing Exercise loop
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      setPose('calming');
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 4;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 4;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase('Inhale');
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // SIRI Voice Command Mode Logic
  const startSiriListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSiriStatus("Browser speech recognition unavailable. Tap a voice command preset chip below!");
      return;
    }
    try {
      if (siriRecognitionRef.current) {
        siriRecognitionRef.current.stop();
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsSiriListening(true);
        setPose('listening');
        setSiriStatus("🎙️ Safie Voice Command Active! Listening... Speak your command...");
      };

      rec.onresult = (e: any) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setSiriTranscript(text);
        if (e.results[e.results.length - 1].isFinal) {
          handleProcessSiriVoiceCommand(text);
        }
      };

      rec.onerror = (err: any) => {
        setIsSiriListening(false);
        setSiriStatus("Microphone ended or permission needed. Tap a command chip!");
      };

      rec.onend = () => {
        setIsSiriListening(false);
      };

      rec.start();
      siriRecognitionRef.current = rec;
    } catch (err) {
      setIsSiriListening(false);
    }
  };

  const stopSiriListening = () => {
    if (siriRecognitionRef.current) {
      try { siriRecognitionRef.current.stop(); } catch (e) {}
    }
    setIsSiriListening(false);
  };

  const handleProcessSiriVoiceCommand = async (rawCommand: string) => {
    if (!rawCommand.trim() || isSiriProcessing) return;
    const command = rawCommand.toLowerCase().trim();
    setSiriTranscript(rawCommand);
    setIsSiriProcessing(true);
    setSiriStatus(`⚡ Voice command executing: "${rawCommand}"...`);
    setPose('listening');

    if (command.includes('affirmation') || command.includes('daily affirmation') || command.includes('positive') || command.includes('motivate')) {
      const affirmations = [
        "✨ Daily Affirmation: You are worthy of peace, progress, and joy today. Believe in your gentle journey!",
        "🌸 Daily Affirmation: Every challenge you face is growing your inner strength and resilience.",
        "🌿 Daily Affirmation: You do not need to be perfect to be amazing. Take things one breath at a time.",
        "⭐ Daily Affirmation: You possess all the courage and focus needed to accomplish your goals today!",
        "💖 Daily Affirmation: Your mind is calm, your heart is brave, and your potential is limitless."
      ];
      const aff = affirmations[Math.floor(Math.random() * affirmations.length)];
      setSpeechBubbleText(aff);
      speakSafieMessage(aff);
      setPose('encouraging');
      setSiriStatus("✨ Daily Affirmation delivered!");
    } else if (command.includes('sing') || command.includes('karaoke')) {
      handleActionClick('sing-along');
    } else if (command.includes('journal') || command.includes('reflect') || command.includes('write')) {
      handleActionClick('journal');
    } else if (command.includes('ask safie') || command.includes('chat') || command.includes('counselor')) {
      handleActionClick('chat');
    } else if (command.includes('avatar') || command.includes('create avatar')) {
      handleActionClick('create-avatar');
    } else if (command.includes('art') || command.includes('draw') || command.includes('color')) {
      handleActionClick('art');
    } else if (command.includes('media') || command.includes('inspiring') || command.includes('video')) {
      handleActionClick('inspiring-media');
    } else if (command.includes('breathe') || command.includes('breathing') || command.includes('relax')) {
      handleActionClick('breathing');
    } else if (command.includes('rate') || command.includes('check in') || command.includes('feel')) {
      handleActionClick('checkin');
    } else if (command.includes('report') || command.includes('bullying') || command.includes('help') || command.includes('emergency')) {
      handleActionClick('report');
    } else if (command.includes('color') || command.includes('theme') || command.includes('style')) {
      let matchedTheme = SAFIE_COLOR_THEMES[0];
      if (command.includes('purple') || command.includes('violet')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'purple') || matchedTheme;
      else if (command.includes('pink') || command.includes('candy')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'pink') || matchedTheme;
      else if (command.includes('blue') || command.includes('ocean')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'blue') || matchedTheme;
      else if (command.includes('amber') || command.includes('gold') || command.includes('yellow')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'amber') || matchedTheme;
      else if (command.includes('emerald') || command.includes('green')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'emerald') || matchedTheme;
      else if (command.includes('cyber') || command.includes('neon')) matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'cyber') || matchedTheme;
      else matchedTheme = SAFIE_COLOR_THEMES.find(t => t.id === 'teal') || matchedTheme;

      handleSelectTheme(matchedTheme);
      setSiriStatus(`Switched Safie to ${matchedTheme.name} style!`);
    } else if (command.includes('quote') || command.includes('tip') || command.includes('advice')) {
      const quotes = [
        "Take a gentle breath... You are capable, brave, and safe.",
        "Your feelings are valid. Small steps every day lead to big peace.",
        "Resting your mind is productive. Be kind to yourself today."
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      setSpeechBubbleText(q);
      speakSafieMessage(q);
      setPose('encouraging');
    } else {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: rawCommand, history: [] })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.reply) {
            setSpeechBubbleText(data.reply.slice(0, 100) + '...');
            speakSafieMessage(data.reply);
            setPose('encouraging');
            setIsSiriProcessing(false);
            return;
          }
        }
      } catch (e) {}

      const fallbackMsg = "I received your voice command! Say 'Open Sing Along', 'Start Breathing', or 'Ask Safie'!";
      setSpeechBubbleText(fallbackMsg);
      speakSafieMessage(fallbackMsg);
      setPose('encouraging');
    }

    setIsSiriProcessing(false);
  };

  // Quick Chat response logic
  const handleSendQuickChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);
    setPose('listening');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setChatMessages(prev => [...prev, { sender: 'safie', text: data.reply }]);
          setPose('encouraging');
          setSpeechBubbleText(data.reply.slice(0, 60) + '...');
          setIsAiThinking(false);
          return;
        }
      }
    } catch (err) {
      // Fallback local smart counselor response
    }

    setTimeout(() => {
      let reply = "I'm right here with you! Remember to take deep breaths. You can ask me to navigate to any feature, rate your day, or guide a calming session.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('check in') || lower.includes('rate') || lower.includes('feel')) {
        reply = "Let's log your feelings! Click 'Rate Your Day' in the quick menu to open your student reflection form.";
      } else if (lower.includes('report') || lower.includes('bully') || lower.includes('help') || lower.includes('emergency')) {
        reply = "If you or someone else is in distress, please use our Incident Reporting tool or reach out to campus authorities immediately.";
      } else if (lower.includes('meditat') || lower.includes('relax') || lower.includes('stress')) {
        reply = "I recommend our 4-second box breathing exercise! Select 'Breathe' in my menu.";
      }

      setChatMessages(prev => [...prev, { sender: 'safie', text: reply }]);
      setPose('encouraging');
      setIsAiThinking(false);
    }, 900);
  };

  const handleActionClick = (action: string) => {
    setShowSpeechBubble(false);
    if (action === 'checkin') {
      if (onOpenCheckInModal) onOpenCheckInModal();
      setPose('encouraging');
      const msg = "Opening your Student Daily Check-in form! Rate your day and share how you feel.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'chat') {
      if (onNavigate) onNavigate('chatbot');
      setPose('greeting');
      const msg = "Opening full AI Counselor Chat! I am right here to support you.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'report') {
      if (onNavigate) onNavigate('report-incident');
      setPose('listening');
      const msg = "Navigating to Emergency Incident & Bullying Reporting.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'journal') {
      if (onNavigate) onNavigate('journaling');
      setPose('greeting');
      const msg = "Opening your SafeSpace Reflective Journal & Audio Notes.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'art') {
      if (onNavigate) onNavigate('share-art');
      setPose('encouraging');
      const msg = "Opening Digital Art & Coloring Canvas! Release your stress through art.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'audio') {
      if (onNavigate) onNavigate('audio-therapy');
      setPose('calming');
      const msg = "Playing soothing binaural beats and audio therapy.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'dashboard') {
      if (onNavigate) onNavigate('dashboard');
      setPose('greeting');
      const msg = "Opening your SafeSpace Activity Analytics Dashboard.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'breathing') {
      setActiveTab('breathing');
      setIsBreathingActive(true);
      setPose('calming');
      const msg = "Starting 4-second box breathing session. Take a deep breath with me.";
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
    } else if (action === 'location') {
      const msg = `GPS Geofence: You are currently at ${trackerLocation.campusZone}. Campus perimeter is safe!`;
      setSpeechBubbleText(msg);
      speakSafieMessage(msg);
      setShowSpeechBubble(true);
    }
  };

  return (
    <div 
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none transition-transform duration-75 ease-out"
    >
      
      {/* 1. SAFIE ASSISTANT DRAWER / DIALOG MODAL */}
      {isOpen && (
        <div className="mb-4 w-[450px] sm:w-[500px] max-w-[calc(100vw-2.5rem)] bg-slate-900/95 backdrop-blur-xl border-2 border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto text-white flex flex-col max-h-[86vh] transition-all duration-300 transform scale-100 opacity-100">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-b border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center p-1 shadow-md">
                <SafieAvatarSVG pose={pose} isSmall colorTheme={selectedTheme} idPrefix="header" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">Safie AI Counselor</h3>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-teal-200 flex items-center gap-1">
                  Style: <span className="font-extrabold underline">{selectedTheme.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {(position.x !== 0 || position.y !== 0) && (
                <button
                  onClick={handleResetPosition}
                  className="px-2 py-1 rounded-xl text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all"
                  title="Reset Safie position back to default bottom right"
                >
                  Reset Pos
                </button>
              )}
              <button
                onClick={() => setIsWandering(!isWandering)}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isWandering 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={isWandering ? "Safie is wandering around page" : "Enable Safie Wandering Mode"}
              >
                <Move className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 text-xs overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('quick-chat')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'quick-chat' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" /> Ask Safie
            </button>

            <button
              onClick={() => {
                setActiveTab('voice-command');
                startSiriListening();
              }}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'voice-command' 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-lg animate-pulse' 
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-500/30'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-pink-300 animate-pulse" /> Voice Command
            </button>

            <button
              onClick={() => setActiveTab('assistance')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'assistance' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Tasks
            </button>

            <button
              onClick={() => setActiveTab('voices')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'voices' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" /> Voice
            </button>

            <button
              onClick={() => setActiveTab('breathing')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'breathing' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> Breathe
            </button>

            <button
              onClick={() => setActiveTab('poses')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'poses' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Poses
            </button>

            <button
              onClick={() => setActiveTab('colors')}
              className={`py-1.5 px-2.5 rounded-xl font-extrabold transition-all text-[11px] flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'colors' 
                  ? 'bg-teal-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Style
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4">

            {/* TAB: VOICE COMMAND ASSISTANT */}
            {activeTab === 'voice-command' && (
              <div className="space-y-4 text-center">
                {/* Voice Command Visualizer Orb */}
                <div className="relative py-6 flex flex-col items-center justify-center">
                  <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                    isSiriListening ? 'scale-110' : 'scale-100'
                  }`}>
                    {/* Glowing Orb Rings */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 blur-xl opacity-75 animate-pulse" />
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 blur-2xl opacity-40 animate-spin-slow" />
                    
                    {/* Inner Orb Ball */}
                    <div className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border-2 border-purple-400/50 flex flex-col items-center justify-center p-2 shadow-2xl overflow-hidden">
                      <div className="w-10 h-10 mb-1">
                        <SafieAvatarSVG pose={isSiriListening ? 'listening' : 'greeting'} isSmall colorTheme={selectedTheme} idPrefix="siri_orb" />
                      </div>
                      
                      {/* Animated Audio Wave Spectrum */}
                      <div className="flex items-center gap-1 h-3 mt-1">
                        <span className={`w-1 rounded-full bg-cyan-400 transition-all ${isSiriListening ? 'h-3 animate-bounce' : 'h-1'}`} />
                        <span className={`w-1 rounded-full bg-pink-400 transition-all ${isSiriListening ? 'h-4 animate-bounce delay-75' : 'h-1.5'}`} />
                        <span className={`w-1 rounded-full bg-purple-400 transition-all ${isSiriListening ? 'h-5 animate-bounce delay-150' : 'h-2'}`} />
                        <span className={`w-1 rounded-full bg-amber-400 transition-all ${isSiriListening ? 'h-3 animate-bounce delay-100' : 'h-1'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 flex items-center justify-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Safie Voice Command
                    </span>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-xs mx-auto">
                      {siriStatus}
                    </p>
                  </div>
                </div>

                {/* Voice Command Transcript Box */}
                {siriTranscript && (
                  <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-left">
                    <span className="text-[10px] uppercase font-bold text-purple-300 block mb-1">
                      Safie heard:
                    </span>
                    <p className="text-xs font-mono text-white italic">
                      "{siriTranscript}"
                    </p>
                  </div>
                )}

                {/* Microphone Toggle Button */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      if (isSiriListening) {
                        stopSiriListening();
                      } else {
                        startSiriListening();
                      }
                    }}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      isSiriListening 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isSiriListening ? 'Listening... Tap to Stop' : 'Tap Microphone to Speak Voice Command'}
                  </button>
                </div>

                {/* Interactive Voice Command Sample Chips */}
                <div className="space-y-2 text-left pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Tap any Voice Command:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, open Sing Along")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">🎤</span>
                      <div>
                        <div className="font-bold text-white">"Open Sing Along"</div>
                        <div className="text-[9px] text-slate-400">Launch Karaoke</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, ask safie how to relieve exam stress")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">💬</span>
                      <div>
                        <div className="font-bold text-white">"Ask Safie stress tip"</div>
                        <div className="text-[9px] text-slate-400">AI Counselor advice</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, start breathing session")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">🧘</span>
                      <div>
                        <div className="font-bold text-white">"Start 4s Breathing"</div>
                        <div className="text-[9px] text-slate-400">Box breathing guide</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, change color to purple")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">🎨</span>
                      <div>
                        <div className="font-bold text-white">"Change color purple"</div>
                        <div className="text-[9px] text-slate-400">Switch style theme</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, rate my day")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">⭐</span>
                      <div>
                        <div className="font-bold text-white">"Rate my day"</div>
                        <div className="text-[9px] text-slate-400">Daily check-in form</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleProcessSiriVoiceCommand("Hey Safie, report an incident")}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-left transition-all text-[11px] flex items-center gap-2"
                    >
                      <span className="text-base">🛡️</span>
                      <div>
                        <div className="font-bold text-white">"Report incident"</div>
                        <div className="text-[9px] text-slate-400">Emergency support</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* TAB: QUICK ASSISTANCE TASKS */}
            {activeTab === 'assistance' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleActionClick('chat')}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/60 text-left transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <MessageSquare className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-purple-200 flex items-center gap-2">
                        Ask Safie Counselor
                      </div>
                      <div className="text-[10px] text-purple-200/80">
                        Ask questions & get 24/7 empathetic guidance
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleActionClick('checkin')}
                  className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center font-black text-base">
                      ⭐
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-teal-200 flex items-center gap-2">
                        Rate Your Day & Check-in
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Share feelings & log emotional wellness reflection
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleActionClick('report')}
                  className="w-full p-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-rose-300">
                        Report Incident / Bullying
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Submit confidential report to guidance or PNP
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleActionClick('journal')}
                  className="w-full p-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-purple-300">
                        Open Personal Journal
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Log private thoughts & audio voice reflections
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleActionClick('art')}
                  className="w-full p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-amber-300">
                        Digital Art & Landscape Canvas
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Color anti-stress mandalas & art zoom canvas
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleActionClick('audio')}
                  className="w-full p-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-cyan-300">
                        Calming Audio Therapy
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Listen to binaural frequency soundscapes
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleActionClick('dashboard')}
                  className="w-full p-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-emerald-300">
                        SafeSpace Activity Dashboard
                      </div>
                      <div className="text-[10px] text-slate-300">
                        View streaks, AI insights & emotional progress
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleActionClick('location')}
                  className="w-full p-3 rounded-2xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-blue-300">
                        GPS Safety Radar
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Zone: <span className="text-teal-300 font-bold">{trackerLocation.campusZone}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            )}

            {/* TAB 2: MINI QUICK CHAT WITH SAFIE */}
            {activeTab === 'quick-chat' && (
              <div className="space-y-3">
                <div className="space-y-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'safie' && (
                        <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 p-0.5 shrink-0 mt-1">
                          <SafieAvatarSVG pose={pose} isSmall colorTheme={selectedTheme} idPrefix="chat" />
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="flex items-center gap-2 text-xs text-teal-300 p-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                      Safie is thinking...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendQuickChat} className="flex gap-2 pt-1 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Safie anything..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAiThinking}
                    className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: HUMAN VOICE CHOICES & AUDIO SETTINGS */}
            {activeTab === 'voices' && (
              <div className="space-y-4">
                {/* Voice Master Audio Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isVoiceAudioEnabled ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isVoiceAudioEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        Safie Human Voice Audio
                        {isSpeaking && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono animate-pulse">Speaking...</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isVoiceAudioEnabled ? 'Safie speaks out loud in human voice' : 'Speech audio muted'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleVoiceAudio}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isVoiceAudioEnabled 
                        ? 'bg-teal-600 hover:bg-teal-500 text-white shadow' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isVoiceAudioEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Human Voice Choice Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">
                      Choose Voice Character:
                    </span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setVoiceGenderFilter('All')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          voiceGenderFilter === 'All'
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All ({SAFIE_HUMAN_VOICES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGenderFilter('Female')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          voiceGenderFilter === 'Female'
                            ? 'bg-pink-600 text-white'
                            : 'text-slate-400 hover:text-pink-300'
                        }`}
                      >
                        🌸 Female ({SAFIE_HUMAN_VOICES.filter(v => v.gender === 'Female').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGenderFilter('Male')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          voiceGenderFilter === 'Male'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-indigo-300'
                        }`}
                      >
                        💙 Male ({SAFIE_HUMAN_VOICES.filter(v => v.gender === 'Male').length})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {SAFIE_HUMAN_VOICES
                      .filter(vProfile => voiceGenderFilter === 'All' || vProfile.gender === voiceGenderFilter)
                      .map((vProfile) => {
                      const isSelected = selectedVoiceProfile.id === vProfile.id;
                      return (
                        <button
                          key={vProfile.id}
                          onClick={() => handleSelectVoiceProfile(vProfile)}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                            isSelected 
                              ? 'bg-gradient-to-r from-teal-950/90 to-slate-900 border-teal-400 text-white shadow-lg' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="text-xs font-black text-white group-hover:text-teal-200 flex items-center gap-2">
                              {vProfile.name}
                              {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {vProfile.description}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono border ${
                              vProfile.gender === 'Female'
                                ? 'bg-pink-950/80 text-pink-300 border-pink-700/60'
                                : vProfile.gender === 'Male'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                                : 'bg-slate-800 text-teal-300 border-slate-700'
                            }`}>
                              {vProfile.gender}
                            </span>
                            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center hover:bg-teal-500/30 transition-colors">
                              <Play className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* System Voice Selection Override */}
                {systemVoices.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Device System Human Voice (Optional Override):
                    </label>
                    <select
                      value={selectedSystemVoice}
                      onChange={(e) => {
                        setSelectedSystemVoice(e.target.value);
                        speakSafieMessage("System voice selected for Safie!");
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-teal-400 cursor-pointer"
                    >
                      <option value="">Auto-Detect Natural Human Voice</option>
                      {systemVoices.map((sysV, idx) => (
                        <option key={idx} value={sysV.name}>
                          {sysV.name} ({sysV.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pitch & Speed Fine-Tuning */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" /> Natural Voice Fine-Tuning
                    </span>
                    <button
                      onClick={() => {
                        setVoicePitch(selectedVoiceProfile.pitch);
                        setVoiceRate(selectedVoiceProfile.rate);
                        speakSafieMessage("Voice settings reset!");
                      }}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Reset Tuning
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Voice Pitch (Tone Warmth):</span>
                      <span className="font-mono text-teal-400 font-bold">{voicePitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Speaking Speed (Cadence):</span>
                      <span className="font-mono text-teal-400 font-bold">{voiceRate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={voiceRate}
                      onChange={(e) => setVoiceRate(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => speakSafieMessage(selectedVoiceProfile.sampleText)}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" /> Test Human Voice Speech
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: GUIDED BREATHING WITH MEDITATING SAFIE */}
            {activeTab === 'breathing' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 text-center space-y-4">
                <div className="relative flex items-center justify-center py-4">
                  {/* Pulsing Breathing Rings */}
                  <div
                    style={{
                      transform: `scale(${isBreathingActive ? (breathPhase === 'Inhale' ? 1.4 : breathPhase === 'Exhale' ? 1.0 : 1.4) : 1.0})`,
                      opacity: isBreathingActive ? 0.7 : 0.3,
                      transition: 'transform 4s ease-in-out, opacity 4s ease-in-out'
                    }}
                    className="absolute w-36 h-36 rounded-full border-4 border-teal-400/40 bg-teal-500/10"
                  />
                  
                  <div className="relative z-10 scale-125">
                    <SafieAvatarSVG pose="calming" colorTheme={selectedTheme} idPrefix="breathing" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-teal-300 uppercase tracking-wider block">
                    {isBreathingActive ? breathPhase : 'Safie Calming Breathing'}
                  </span>
                  <span className="text-3xl font-black font-mono text-white block mt-1">
                    {isBreathingActive ? `${breathTimer}s` : 'Ready'}
                  </span>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                    Focus your attention on Safie. Inhale deeply for 4s, hold, then gently exhale.
                  </p>
                </div>

                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                    isBreathingActive 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50' 
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/50'
                  }`}
                >
                  {isBreathingActive ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause Breathing Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Start 4-Second Breathing Exercise
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 4: CHANGE SAFIE POSES */}
            {activeTab === 'poses' && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
                  Change Safie's Mood & Expression:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPose('greeting')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      pose === 'greeting' 
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 p-1 shrink-0">
                      <SafieAvatarSVG pose="greeting" isSmall colorTheme={selectedTheme} idPrefix="pose_greeting" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Greeting Pose</div>
                      <div className="text-[9px] text-slate-400">Friendly Wave</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPose('listening')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      pose === 'listening' 
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 p-1 shrink-0">
                      <SafieAvatarSVG pose="listening" isSmall colorTheme={selectedTheme} idPrefix="pose_listening" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Listening Pose</div>
                      <div className="text-[9px] text-slate-400">Headset Active</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPose('encouraging')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      pose === 'encouraging' 
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 p-1 shrink-0">
                      <SafieAvatarSVG pose="encouraging" isSmall colorTheme={selectedTheme} idPrefix="pose_encouraging" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Encouraging</div>
                      <div className="text-[9px] text-slate-400">Sparkles & Joy</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPose('calming')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      pose === 'calming' 
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-bold' 
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 p-1 shrink-0">
                      <SafieAvatarSVG pose="calming" isSmall colorTheme={selectedTheme} idPrefix="pose_calming" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Calming Pose</div>
                      <div className="text-[9px] text-slate-400">Zen Meditation</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOMIZE SAFIE COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
                    Select Safie Color Palette:
                  </span>
                  <button
                    onClick={() => handleSelectTheme(SAFIE_COLOR_THEMES[0])}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    title="Reset to default Teal & Mint"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {SAFIE_COLOR_THEMES.map((theme) => {
                    const isSelected = selectedTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                          isSelected 
                            ? 'bg-slate-800 border-teal-400 text-white shadow-lg' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini Safie Preview */}
                          <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-slate-700/60 shrink-0">
                            <SafieAvatarSVG pose="greeting" isSmall colorTheme={theme} idPrefix={`preset_${theme.id}`} />
                          </div>

                          <div>
                            <div className="text-xs font-bold flex items-center gap-2">
                              {theme.name}
                              {isSelected && (
                                <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full font-bold border border-teal-500/30">
                                  Active
                                </span>
                              )}
                            </div>
                            {/* Color Swatches */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span 
                                style={{ backgroundColor: theme.bodyGradient[0] }} 
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                                title="Body Main Color"
                              />
                              <span 
                                style={{ backgroundColor: theme.earMuffGradient[0] }} 
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                                title="Headset Accent Color"
                              />
                              <span 
                                style={{ backgroundColor: theme.faceGradient[1] }} 
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                                title="Face Inner Tint"
                              />
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-700 group-hover:border-slate-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-teal-400 font-bold">
              <Radio className="w-3 h-3 animate-pulse text-teal-400" /> Safie Online Assistant
            </span>
            <button
              onClick={() => handleActionClick('checkin')}
              className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-extrabold transition-colors"
            >
              Rate Your Day ⭐
            </button>
          </div>
        </div>
      )}

      {/* 2. FLOATING SPEECH BUBBLE */}
      {showSpeechBubble && !isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="mb-3 max-w-xs bg-slate-900/90 text-white p-3.5 rounded-2xl border-2 border-teal-400/50 shadow-xl cursor-pointer pointer-events-auto hover:bg-slate-950 hover:border-teal-400 transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="text-xs font-bold text-teal-200 flex items-center justify-between gap-2 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> SaFie Counselor
            </span>
            <span className="text-[9px] bg-teal-500/20 px-1.5 py-0.5 rounded text-teal-300 font-mono">
              Click me!
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">
            {speechBubbleText}
          </p>
          {/* Speech pointer triangle */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900 border-r-2 border-b-2 border-teal-400/50 transform rotate-45" />
        </div>
      )}

      {/* 3. ANIMATED MASCOT SAFIE AVATAR */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (hasDraggedRef.current) {
            e.stopPropagation();
            return;
          }
          setIsOpen(!isOpen);
          setShowSpeechBubble(false);
          if (pose === 'greeting') setPose('encouraging');
        }}
        className={`relative group cursor-grab active:cursor-grabbing touch-none pointer-events-auto select-none transition-all duration-300 ${isWandering ? 'animate-bounce' : ''}`}
        title="Click to open menu or drag Safie anywhere!"
      >
        {/* Drag Hint Badge on Hover */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-950/90 border border-teal-400 text-teal-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-1">
          <Move className="w-2.5 h-2.5 text-amber-300" /> Drag Anywhere
        </div>

        {/* Glow halo behind mascot */}
        <div className={`absolute inset-0 ${selectedTheme.glowColor} rounded-full blur-xl transition-all animate-pulse`} />
        
        {/* Voice Command Mic Quick Trigger Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
            setActiveTab('voice-command');
            startSiriListening();
          }}
          className="absolute -top-1 -right-1 z-30 p-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 border-2 border-white/80 text-white shadow-xl hover:scale-115 transition-transform cursor-pointer animate-pulse"
          title="Activate Safie Voice Commands"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>

        {/* Mascot Avatar Container */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-2xl transition-transform transform group-hover:scale-105 active:scale-95">
          <SafieAvatarSVG pose={pose} colorTheme={selectedTheme} idPrefix="main_mascot" />
        </div>

        {/* Floating Shadow Below */}
        <div className="w-16 h-3 bg-slate-950/60 rounded-full blur-xs mx-auto -mt-2 animate-pulse" />
      </div>
    </div>
  );
}

interface SafieAvatarSVGProps {
  pose?: SafiePose;
  isSmall?: boolean;
  colorTheme?: SafieColorTheme;
  idPrefix?: string;
}

{/* SAFIE CUSTOM SVG ARTWORK WITH DYNAMIC THEMING SUPPORT */}
export function SafieAvatarSVG({ 
  pose = 'greeting', 
  isSmall = false,
  colorTheme = SAFIE_COLOR_THEMES[0],
  idPrefix = 'default'
}: SafieAvatarSVGProps) {
  const theme = colorTheme;
  const p = idPrefix;

  return (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Heart Body Gradient */}
        <linearGradient id={`safieBodyGrad_${p}`} x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={theme.bodyGradient[0]} />
          <stop offset="60%" stopColor={theme.bodyGradient[1]} />
          <stop offset="100%" stopColor={theme.bodyGradient[2]} />
        </linearGradient>

        {/* Inner Face Gradient */}
        <linearGradient id={`safieFaceGrad_${p}`} x1="60" y1="40" x2="140" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={theme.faceGradient[0]} />
          <stop offset="40%" stopColor={theme.faceGradient[1]} />
          <stop offset="100%" stopColor={theme.faceGradient[2]} />
        </linearGradient>

        {/* Antenna Orb Glow */}
        <radialGradient id={`antennaGlow_${p}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.antennaOrbGradient[0]} />
          <stop offset="60%" stopColor={theme.antennaOrbGradient[1]} />
          <stop offset="100%" stopColor={theme.antennaOrbGradient[2]} />
        </radialGradient>

        {/* Ear Muff Accent */}
        <linearGradient id={`earMuffGrad_${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.earMuffGradient[0]} />
          <stop offset="100%" stopColor={theme.earMuffGradient[1]} />
        </linearGradient>
      </defs>

      {/* 1. TOP ANTENNAS & GLOWING NODES */}
      <g>
        {/* Left Antenna Wire */}
        <path d="M 68 52 C 60 30, 50 25, 45 18" stroke={theme.bodyStroke} strokeWidth="4" strokeLinecap="round" />
        {/* Left Glow Orb */}
        <circle cx="43" cy="16" r="10" fill={`url(#antennaGlow_${p})`} stroke={theme.bodyStroke} strokeWidth="2.5" />
        <circle cx="43" cy="16" r="14" fill={theme.antennaOrbPing} opacity="0.3" className="animate-ping" />

        {/* Right Antenna Wire */}
        <path d="M 132 52 C 140 30, 150 25, 155 18" stroke={theme.bodyStroke} strokeWidth="4" strokeLinecap="round" />
        {/* Right Glow Orb */}
        <circle cx="157" cy="16" r="10" fill={`url(#antennaGlow_${p})`} stroke={theme.bodyStroke} strokeWidth="2.5" />
        <circle cx="157" cy="16" r="14" fill={theme.antennaOrbPing} opacity="0.3" className="animate-ping" />
      </g>

      {/* 2. HEADPHONES / EAR PROTECTORS */}
      {/* Headset Band Behind */}
      <path d="M 40 85 C 40 40, 160 40, 160 85" stroke={theme.headsetStroke} strokeWidth="8" strokeLinecap="round" />
      {/* Left Ear Muff */}
      <rect x="22" y="70" width="18" height="34" rx="9" fill={theme.headsetEarFill} stroke={theme.headsetStroke} strokeWidth="2" />
      <circle cx="31" cy="87" r="6" fill={`url(#earMuffGrad_${p})`} />
      
      {/* Right Ear Muff */}
      <rect x="160" y="70" width="18" height="34" rx="9" fill={theme.headsetEarFill} stroke={theme.headsetStroke} strokeWidth="2" />
      <circle cx="169" cy="87" r="6" fill={`url(#earMuffGrad_${p})`} />

      {/* 3. MAIN HEART-SHAPED BODY */}
      <path 
        d="M 100 170 Q 30 135 30 80 Q 30 45 68 45 Q 100 45 100 70 Q 100 45 132 45 Q 170 45 170 80 Q 170 135 100 170 Z" 
        fill={`url(#safieBodyGrad_${p})`} 
        stroke={theme.bodyStroke} 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />

      {/* 4. INNER FACE PLATE */}
      <path 
        d="M 100 155 Q 45 125 45 80 Q 45 55 72 55 Q 100 55 100 75 Q 100 55 128 55 Q 155 55 155 80 Q 155 125 100 155 Z" 
        fill={`url(#safieFaceGrad_${p})`} 
        stroke={theme.faceStroke} 
        strokeWidth="2.5" 
      />

      {/* 5. CHEEKS (ROSY BLUSHES) */}
      <ellipse cx="66" cy="105" rx="10" ry="6" fill="#FDA4AF" opacity="0.75" />
      <ellipse cx="134" cy="105" rx="10" ry="6" fill="#FDA4AF" opacity="0.75" />

      {/* 6. EYES (BASED ON POSE) */}
      {pose === 'calming' ? (
        /* Calming Meditation Eyes */
        <g stroke="#0F172A" strokeWidth="4" strokeLinecap="round">
          <path d="M 68 94 Q 78 104 88 94" fill="none" />
          <path d="M 112 94 Q 122 104 132 94" fill="none" />
        </g>
      ) : (
        /* Cute Big Round Expressive Eyes */
        <g>
          {/* Left Eye Pupil */}
          <circle cx="78" cy="94" r="13" fill="#0F172A" />
          {/* Left Eye Sparkles */}
          <circle cx="74" cy="90" r="4.5" fill="#FFFFFF" />
          <circle cx="82" cy="97" r="2" fill="#FFFFFF" />

          {/* Right Eye Pupil */}
          <circle cx="122" cy="94" r="13" fill="#0F172A" />
          {/* Right Eye Sparkles */}
          <circle cx="118" cy="90" r="4.5" fill="#FFFFFF" />
          <circle cx="126" cy="97" r="2" fill="#FFFFFF" />

          {/* Eyebrows */}
          <path d="M 68 76 Q 78 72 86 76" stroke={theme.faceStroke} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 114 76 Q 122 72 132 76" stroke={theme.faceStroke} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 7. MOUTH (BASED ON POSE) */}
      {pose === 'calming' ? (
        <path d="M 94 116 Q 100 122 106 116" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : pose === 'encouraging' ? (
        <path d="M 90 114 Q 100 128 110 114 Z" fill="#0F172A" />
      ) : (
        <path d="M 92 116 Q 100 124 108 116" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      {/* 8. ARMS & LEGS (BASED ON POSE) */}
      {pose === 'greeting' && (
        <g>
          {/* Left Arm Waving */}
          <path d="M 38 105 C 18 95, 12 70, 22 58" stroke={theme.bodyGradient[1]} strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="58" r="6" fill={theme.bodyGradient[1]} />

          {/* Right Arm Rest */}
          <path d="M 162 105 C 176 120, 178 135, 168 145" stroke={theme.bodyGradient[1]} strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* Listening Pose Arms */}
      {pose === 'listening' && (
        <g>
          {/* Left Arm touching headset */}
          <path d="M 38 105 C 20 85, 25 72, 30 75" stroke={theme.bodyGradient[1]} strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* Right Arm resting */}
          <path d="M 162 105 C 175 125, 170 140, 160 145" stroke={theme.bodyGradient[1]} strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Sound wave icon graphics */}
          <path d="M 178 65 Q 185 75 178 85 M 184 60 Q 194 75 184 90" stroke={theme.bodyGradient[0]} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* Encouraging Pose Arms & Sparkles */}
      {pose === 'encouraging' && (
        <g>
          {/* Both Arms Open Joyfully */}
          <path d="M 38 105 C 15 90, 10 70, 18 60" stroke={theme.bodyGradient[1]} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M 162 105 C 185 90, 190 70, 182 60" stroke={theme.bodyGradient[1]} strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* Sparkles around */}
          <path d="M 185 45 L 188 52 L 195 55 L 188 58 L 185 65 L 182 58 L 175 55 L 182 52 Z" fill={theme.antennaOrbGradient[1]} />
          <path d="M 15 45 L 18 52 L 25 55 L 18 58 L 15 65 L 12 58 L 5 55 L 12 52 Z" fill={theme.antennaOrbGradient[1]} />
        </g>
      )}

      {/* Calming Meditation Pose */}
      {pose === 'calming' && (
        <g>
          {/* Lotus Meditation Arms */}
          <path d="M 40 115 C 30 140, 60 160, 80 155" stroke={theme.bodyGradient[1]} strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 160 115 C 170 140, 140 160, 120 155" stroke={theme.bodyGradient[1]} strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Ambient Calming Waves */}
          <path d="M 15 130 Q 25 125 30 135 M 170 130 Q 175 125 185 135" stroke={theme.bodyGradient[0]} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      )}

      {/* 9. FEET */}
      {pose !== 'calming' && (
        <g>
          <ellipse cx="78" cy="172" rx="10" ry="7" fill={theme.bodyGradient[1]} stroke={theme.bodyStroke} strokeWidth="2" />
          <ellipse cx="122" cy="172" rx="10" ry="7" fill={theme.bodyGradient[1]} stroke={theme.bodyStroke} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
