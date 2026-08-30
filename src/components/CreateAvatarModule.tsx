import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Sparkles, Smile, Image as ImageIcon, Download, Check, 
  Trash2, RefreshCw, Layers, Sliders, ShieldCheck, Heart, Star, 
  Crown, Glasses, Headphones, Zap, Film, Flame, Award, Palette,
  Send, User, ArrowLeft, CheckCircle2, Play, CircleDot, Volume2, 
  Activity, Radio, Compass, MessageCircle, Trophy, Wand2, Sparkle,
  TrendingUp, BarChart2, RefreshCcw, SmilePlus, Scissors, Shirt, Eye
} from 'lucide-react';
import { 
  AvatarSticker, AvatarStyle, getSavedAvatarStickers, saveAvatarSticker, 
  deleteAvatarSticker, getActiveAvatarSticker, setActiveAvatarSticker 
} from '../utils/avatarStickerStore';
import { UserProfile, getUserDisplayName } from '../types/auth';
import { getRecordedEntries, saveRecordedEntry } from '../utils/recordedEntriesStore';
import { getStudentCheckIns } from '../utils/studentCheckInStore';

interface CreateAvatarModuleProps {
  currentUser?: UserProfile | null;
  onNavigateToDashboard?: () => void;
}

export interface DashboardMoodData {
  score: number; // 0 to 100 percentage
  label: string;
  expressionId: string;
  expressionLabel: string;
  blushId: string;
  tagline: string;
  bgGradient: string;
  motionId: string;
  dominantEmotion: string;
  recentEntriesCount: number;
}

export function calculateDashboardMoodData(customScore?: number): DashboardMoodData {
  const entries = getRecordedEntries();
  const checkIns = getStudentCheckIns();

  let totalValence = 0;
  let count = 0;
  let dominantEmotion = 'Mindful Joy';

  if (entries.length > 0) {
    entries.forEach(e => {
      if (e.reportAnalysis?.valenceScore !== undefined) {
        totalValence += Math.round(e.reportAnalysis.valenceScore * 100);
        count++;
      }
    });
    if (entries[0].reportAnalysis?.dominantEmotion) {
      dominantEmotion = entries[0].reportAnalysis.dominantEmotion;
    }
  }

  if (checkIns.length > 0) {
    checkIns.forEach(c => {
      totalValence += Math.round((c.rating / 10) * 100);
      count++;
    });
    if (checkIns[0].ratingLabel) {
      dominantEmotion = checkIns[0].ratingLabel;
    }
  }

  const calculatedScore = count > 0 ? Math.round(totalValence / count) : 84;
  const score = customScore !== undefined ? customScore : calculatedScore;

  if (score >= 85) {
    return {
      score,
      label: 'Radiant Joy ✨',
      expressionId: 'sparkle_eyes',
      expressionLabel: 'Sparkle Eyes ✨',
      blushId: 'star_stamps',
      tagline: '✨ Radiant Joy & Mindful Energy',
      bgGradient: 'pink_purple',
      motionId: 'bounce',
      dominantEmotion,
      recentEntriesCount: count
    };
  } else if (score >= 70) {
    return {
      score,
      label: 'Serene Positivity 🌸',
      expressionId: 'heart_eyes',
      expressionLabel: 'Heart Eyes 😍',
      blushId: 'pink_blush',
      tagline: '💖 Positively Mindful & Serene',
      bgGradient: 'sunset',
      motionId: 'pulse',
      dominantEmotion,
      recentEntriesCount: count
    };
  } else if (score >= 55) {
    return {
      score,
      label: 'Balanced Calm 🌿',
      expressionId: 'wink_smile',
      expressionLabel: 'Cute Wink 😉',
      blushId: 'kitty_whiskers',
      tagline: '😉 Peaceful & Balanced Focus',
      bgGradient: 'emerald',
      motionId: 'wiggle',
      dominantEmotion,
      recentEntriesCount: count
    };
  } else if (score >= 40) {
    return {
      score,
      label: 'Reflective Chill 😎',
      expressionId: 'cool_shades',
      expressionLabel: 'Cool Shades 😎',
      blushId: 'pink_blush',
      tagline: '😎 Reflective & Deep Chill',
      bgGradient: 'cyberpunk',
      motionId: 'spin_slow',
      dominantEmotion,
      recentEntriesCount: count
    };
  } else {
    return {
      score,
      label: 'Self-Care Healing 🥺',
      expressionId: 'tears_of_joy',
      expressionLabel: 'Happy Tears 🥺',
      blushId: 'heart_stamps',
      tagline: '🥺 Gentle Self-Care & Healing',
      bgGradient: 'galaxy',
      motionId: 'pulse',
      dominantEmotion,
      recentEntriesCount: count
    };
  }
}

// Art Styles Configuration
const STICKER_STYLES: { id: AvatarStyle; label: string; icon: any; color: string; bg: string; desc: string }[] = [
  { id: 'chibi', label: 'Chibi.pics Nendoroid', icon: Smile, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-300', desc: 'Signature style — oversized kawaii head, shiny eyes & cute cheek blush.' },
  { id: 'chibi_3d', label: '3D Clay Chibi', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-300', desc: 'Soft 3D clay look with glossy pastel highlights and sticker outline.' },
  { id: 'anime', label: 'Kawaii Anime Chibi', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-300', desc: 'Cel-shaded anime chibi with glowing magical aura and sailor/hero uniform.' },
  { id: 'action_star', label: 'Heroic Action Chibi', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-300', desc: 'Cinematic chibi with action energy aura, hero cape, and sparkles.' },
  { id: 'movie_star', label: 'Pixel Retro Chibi', icon: Film, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-300', desc: 'Retro 8-bit kawaii pixel chibi with floating heart particles & arcade frame.' },
];

const CHIBI_HAIRSTYLES = [
  { id: 'twin_tails', label: 'Twin Tails 👧', icon: '👧' },
  { id: 'chibi_bob', label: 'Cute Bob Cut 👩', icon: '👩' },
  { id: 'spiky_hero', label: 'Spiky Hero 🧑', icon: '🧑' },
  { id: 'curly_buns', label: 'Curly Buns 🍥', icon: '🍥' },
  { id: 'cute_bangs', label: 'Anime Bangs 🎀', icon: '🎀' },
  { id: 'pixie_cut', label: 'Pixie Cut 💇', icon: '💇' },
];

const HAIR_COLORS = [
  { hex: '#ec4899', name: 'Pastel Pink 🌸' },
  { hex: '#3b82f6', name: 'Hero Blue 💙' },
  { hex: '#1e293b', name: 'Raven Black 🖤' },
  { hex: '#eab308', name: 'Golden Blonde 💛' },
  { hex: '#a855f7', name: 'Lavender 💜' },
  { hex: '#06b6d4', name: 'Aqua Cyan 🩵' },
  { hex: '#78350f', name: 'Chestnut 🤎' },
  { hex: '#f43f5e', name: 'Fire Red ❤️' },
  { hex: '#f8fafc', name: 'Platinum White 🤍' },
];

const SKIN_TONES = [
  { hex: '#ffe4c4', name: 'Fair Ivory' },
  { hex: '#f5d0c5', name: 'Warm Peach' },
  { hex: '#e0ac69', name: 'Golden Tan' },
  { hex: '#c68642', name: 'Rich Caramel' },
  { hex: '#8d5524', name: 'Deep Bronze' },
];

const CHIBI_EYES_EXPRESSIONS = [
  { id: 'sparkle_eyes', label: 'Sparkle Eyes ✨ (85-100% Radiant)', icon: Sparkles, color: 'text-amber-500', particles: ['✨', '⭐', '💖'] },
  { id: 'heart_eyes', label: 'Heart Eyes 😍 (70-84% Serene)', icon: Heart, color: 'text-pink-500', particles: ['💖', '💕', '🌸'] },
  { id: 'wink_smile', label: 'Cute Wink 😉 (55-69% Balanced)', icon: Smile, color: 'text-purple-500', particles: ['😉', '✨', '🌟'] },
  { id: 'cool_shades', label: 'Cool Shades 😎 (40-54% Reflective)', icon: Glasses, color: 'text-cyan-500', particles: ['😎', '⚡', '🎵'] },
  { id: 'tears_of_joy', label: 'Happy Tears 🥺 (0-39% Self-Care)', icon: Heart, color: 'text-sky-500', particles: ['🥺', '💧', '✨'] },
];

const EYE_COLORS = [
  { hex: '#3b82f6', name: 'Sapphire Blue' },
  { hex: '#ec4899', name: 'Ruby Pink' },
  { hex: '#10b981', name: 'Emerald Green' },
  { hex: '#8b5cf6', name: 'Amethyst Purple' },
  { hex: '#f59e0b', name: 'Amber Gold' },
  { hex: '#0f172a', name: 'Obsidian Black' },
];

const CHIBI_OUTFITS = [
  { id: 'sailor_uniform', label: 'Sailor Uniform ⚓', icon: '⚓' },
  { id: 'hero_hoodie', label: 'Hero Hoodie 🧥', icon: '🧥' },
  { id: 'wizard_cape', label: 'Wizard Cape 🧙', icon: '🧙' },
  { id: 'kimono', label: 'Floral Kimono 👘', icon: '👘' },
  { id: 'graphic_tee', label: 'Casual Tee 👕', icon: '👕' },
];

const OUTFIT_COLORS = [
  { hex: '#ec4899', name: 'Kawaii Pink' },
  { hex: '#3b82f6', name: 'Hero Blue' },
  { hex: '#10b981', name: 'Zen Emerald' },
  { hex: '#8b5cf6', name: 'Royal Purple' },
  { hex: '#f59e0b', name: 'Amber Gold' },
  { hex: '#0f172a', name: 'Midnight Black' },
];

const CHIBI_ACCESSORIES = [
  { id: 'cat_ears', label: 'Cat Ears 🐱', icon: Crown },
  { id: 'bunny_ears', label: 'Bunny Ears 🐰', icon: Heart },
  { id: 'golden_crown', label: 'Golden Crown 👑', icon: Crown },
  { id: 'star_aura', label: 'Star Aura ✨', icon: Star },
  { id: 'gamer_headset', label: 'Gamer Headset 🎧', icon: Headphones },
  { id: 'none', label: 'None', icon: CircleDot },
];

const CHIBI_BLUSH_STAMPS = [
  { id: 'pink_blush', label: 'Soft Pink Blush 🌸', color: 'rgba(244, 63, 94, 0.45)' },
  { id: 'kitty_whiskers', label: 'Kitty Whiskers 🐾', color: 'rgba(168, 85, 247, 0.45)' },
  { id: 'star_stamps', label: 'Star Stamps ⭐', color: 'rgba(251, 191, 36, 0.55)' },
  { id: 'heart_stamps', label: 'Heart Stamps 💖', color: 'rgba(236, 72, 153, 0.55)' },
];

const ANIMATION_MOTIONS = [
  { id: 'bounce', label: 'Chibi Bobbing', css: 'animate-bounce' },
  { id: 'pulse', label: 'Breathing Pulse', css: 'animate-pulse' },
  { id: 'spin_slow', label: 'Glow Aura Spin', css: 'animate-[spin_10s_linear_infinite]' },
  { id: 'wiggle', label: 'Playful Wiggle', css: 'hover:rotate-6 transition-transform' },
  { id: 'none', label: 'Static Stamp', css: '' },
];

const BORDER_STYLES = [
  { id: 'white_cutout', label: 'Chibi.pics White Outline ⚪', color: '#ffffff', strokeWidth: 16 },
  { id: 'glowing_neon', label: 'Glowing Neon Ring 💖', color: '#f43f5e', strokeWidth: 12 },
  { id: 'holographic_stamp', label: 'Holographic Gold Stamp ✨', color: '#fbbf24', strokeWidth: 12 },
  { id: 'circular_pill', label: 'Pastel Teal Frame 🩵', color: '#2dd4bf', strokeWidth: 10 },
];

const BACKGROUND_GRADIENTS = [
  { id: 'pink_purple', label: 'Chibi.pics Pastel 🌸', colors: ['#f472b6', '#c084fc', '#818cf8'] },
  { id: 'cyberpunk', label: 'Cyberpunk Neon ⚡', colors: ['#f43f5e', '#9333ea', '#06b6d4'] },
  { id: 'sunset', label: 'Sunset Glow 🌅', colors: ['#fbbf24', '#f43f5e', '#a855f7'] },
  { id: 'galaxy', label: 'Deep Galaxy 🌌', colors: ['#312e81', '#581c87', '#0f172a'] },
  { id: 'emerald', label: 'Zen Emerald 🍃', colors: ['#34d399', '#2dd4bf', '#22d3ee'] },
];

const PRESET_CHARACTER_SETS = [
  {
    id: 'magical_girl',
    name: '🌸 Magical Chibi Girl',
    style: 'chibi' as AvatarStyle,
    hair: 'twin_tails',
    hairColor: '#ec4899',
    eyes: 'sparkle_eyes',
    eyeColor: '#3b82f6',
    outfit: 'sailor_uniform',
    outfitColor: '#ec4899',
    accessory: 'cat_ears',
    blush: 'pink_blush',
    border: 'white_cutout',
    bg: 'pink_purple',
    tagline: '✨ Magical Chibi Girl'
  },
  {
    id: 'cyber_hero',
    name: '⚡ Cyberpunk Hero',
    style: 'chibi_3d' as AvatarStyle,
    hair: 'spiky_hero',
    hairColor: '#06b6d4',
    eyes: 'cool_shades',
    eyeColor: '#06b6d4',
    outfit: 'hero_hoodie',
    outfitColor: '#3b82f6',
    accessory: 'gamer_headset',
    blush: 'kitty_whiskers',
    border: 'glowing_neon',
    bg: 'cyberpunk',
    tagline: '⚡ Cyberpunk Hero'
  },
  {
    id: 'zen_monk',
    name: '🌿 Zen Scholar',
    style: 'anime' as AvatarStyle,
    hair: 'curly_buns',
    hairColor: '#1e293b',
    eyes: 'wink_smile',
    eyeColor: '#10b981',
    outfit: 'kimono',
    outfitColor: '#10b981',
    accessory: 'star_aura',
    blush: 'star_stamps',
    border: 'circular_pill',
    bg: 'emerald',
    tagline: '🌿 Zen Mindful Mode'
  },
  {
    id: 'royal_star',
    name: '⭐ Royal Chibi Star',
    style: 'action_star' as AvatarStyle,
    hair: 'cute_bangs',
    hairColor: '#eab308',
    eyes: 'heart_eyes',
    eyeColor: '#ec4899',
    outfit: 'wizard_cape',
    outfitColor: '#8b5cf6',
    accessory: 'golden_crown',
    blush: 'heart_stamps',
    border: 'holographic_stamp',
    bg: 'sunset',
    tagline: '⭐ Stardom Chibi Royal'
  }
];

const SAMPLE_PORTRAITS = [
  { id: 'sample_1', label: 'Chibi Model 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { id: 'sample_2', label: 'Chibi Model 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { id: 'sample_3', label: 'Chibi Model 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { id: 'sample_4', label: 'Chibi Model 4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' }
];

export default function CreateAvatarModule({ currentUser, onNavigateToDashboard }: CreateAvatarModuleProps) {
  // Studio Tabs
  const [activeTab, setActiveTab] = useState<'base' | 'hair_eyes' | 'wardrobe' | 'mood_effects' | 'border_tagline'>('base');

  // Camera & Photo State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(SAMPLE_PORTRAITS[0].url);

  // Avatar Customization States
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('chibi');
  const [selectedHair, setSelectedHair] = useState<string>('twin_tails');
  const [hairColor, setHairColor] = useState<string>('#ec4899');
  const [skinTone, setSkinTone] = useState<string>('#ffe4c4');
  const [selectedExpression, setSelectedExpression] = useState<string>('sparkle_eyes');
  const [eyeColor, setEyeColor] = useState<string>('#3b82f6');
  const [selectedOutfit, setSelectedOutfit] = useState<string>('sailor_uniform');
  const [outfitColor, setOutfitColor] = useState<string>('#ec4899');
  const [selectedAccessory, setSelectedAccessory] = useState<string>('cat_ears');
  const [selectedBlush, setSelectedBlush] = useState<string>('pink_blush');
  const [selectedBorder, setSelectedBorder] = useState<string>('white_cutout');
  const [selectedBg, setSelectedBg] = useState<string>('pink_purple');
  const [selectedMotion, setSelectedMotion] = useState<string>('bounce');
  const [moodTagline, setMoodTagline] = useState<string>('✨ Chibi.pics Hero');
  const [previewTab, setPreviewTab] = useState<'preview' | 'action_test'>('preview');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Dashboard Mood State & Auto-Sync
  const [dashboardMood, setDashboardMood] = useState<DashboardMoodData>(() => calculateDashboardMoodData());
  const [autoSyncMood, setAutoSyncMood] = useState<boolean>(true);
  const [currentMoodScore, setCurrentMoodScore] = useState<number>(dashboardMood.score);

  // Sticker Library State
  const [savedStickers, setSavedStickers] = useState<AvatarSticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<AvatarSticker | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply mood configuration
  const applyMoodDataToAvatar = (moodData: DashboardMoodData) => {
    setSelectedExpression(moodData.expressionId);
    setSelectedBlush(moodData.blushId);
    setMoodTagline(moodData.tagline);
    setSelectedBg(moodData.bgGradient);
    setSelectedMotion(moodData.motionId);
  };

  // Sync mood when mounted or when mood score updates
  useEffect(() => {
    const data = calculateDashboardMoodData(currentMoodScore);
    setDashboardMood(data);
    if (autoSyncMood) {
      applyMoodDataToAvatar(data);
    }
  }, [autoSyncMood, currentMoodScore]);

  // Load saved stickers
  useEffect(() => {
    const list = getSavedAvatarStickers();
    setSavedStickers(list);
    const active = getActiveAvatarSticker();
    setActiveSticker(active);
  }, []);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Real-time canvas rendering trigger
  useEffect(() => {
    renderCanvasToRef();
  }, [
    photoCaptured, selectedStyle, selectedHair, hairColor, skinTone,
    selectedExpression, eyeColor, selectedOutfit, outfitColor,
    selectedAccessory, selectedBlush, selectedBorder, selectedBg, moodTagline
  ]);

  // Sound generator
  const playSoundEffect = (type: 'shutter' | 'victory') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'shutter') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.09);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + idx * 0.09 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.25);
        });
      }
    } catch (e) {
      console.warn('Audio effects unavailable:', e);
    }
  };

  const handleSpeakTagline = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const textToSpeak = moodTagline || 'Chibi.pics Avatar is ready!';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.pitch = 1.3;
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 640, facingMode: 'user' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      alert('Camera access unavailable or blocked. You can upload a photo or select a sample image!');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    playSoundEffect('shutter');
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.translate(400, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoCaptured(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSoundEffect('shutter');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoCaptured(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // HIGH-PRECISION VECTOR & IMAGE CANVAS DRAWING ENGINE
  const drawAvatarToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, imgElement?: HTMLImageElement) => {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.44;

    // 1. Draw Background Outer Circle Gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    const bgCfg = BACKGROUND_GRADIENTS.find(b => b.id === selectedBg) || BACKGROUND_GRADIENTS[0];
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bgCfg.colors[0]);
    grad.addColorStop(0.5, bgCfg.colors[1]);
    grad.addColorStop(1, bgCfg.colors[2]);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Background Floating Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const starCoords = [
      { x: cx - 180, y: cy - 140, r: 12 },
      { x: cx + 180, y: cy - 120, r: 16 },
      { x: cx - 190, y: cy + 100, r: 14 },
      { x: cx + 190, y: cy + 110, r: 10 },
    ];
    starCoords.forEach(st => {
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Outer Border Outline
    const borderCfg = BORDER_STYLES.find(b => b.id === selectedBorder) || BORDER_STYLES[0];
    ctx.lineWidth = borderCfg.strokeWidth;
    ctx.strokeStyle = borderCfg.color;
    ctx.stroke();

    // Clip Inner Circle for Head & Body Portrait
    ctx.beginPath();
    ctx.arc(cx, cy - 15, radius - borderCfg.strokeWidth / 2 - 4, 0, Math.PI * 2);
    ctx.clip();

    // 2. Base Face & Body Background
    if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
      ctx.save();
      if (selectedStyle === 'chibi') {
        ctx.filter = 'saturate(160%) contrast(110%) brightness(112%)';
      } else if (selectedStyle === 'chibi_3d') {
        ctx.filter = 'saturate(140%) brightness(115%) sepia(8%)';
      } else if (selectedStyle === 'anime') {
        ctx.filter = 'contrast(125%) saturate(140%) brightness(105%)';
      } else if (selectedStyle === 'action_star') {
        ctx.filter = 'contrast(140%) saturate(130%) sepia(20%)';
      } else {
        ctx.filter = 'contrast(120%) saturate(120%)';
      }
      ctx.drawImage(imgElement, cx - 240, cy - 250, 480, 480);
      ctx.restore();
    } else {
      // Draw Chibi Base Head Shape if no image loaded
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 160, 150, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Selected Outfit Overlays
    ctx.save();
    const outfitY = cy + 120;
    ctx.fillStyle = outfitColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;

    if (selectedOutfit === 'sailor_uniform') {
      // Sailor collar & shirt
      ctx.beginPath();
      ctx.moveTo(cx - 180, outfitY + 120);
      ctx.lineTo(cx - 100, outfitY);
      ctx.lineTo(cx + 100, outfitY);
      ctx.lineTo(cx + 180, outfitY + 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White inner shirt V-neck
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 50, outfitY);
      ctx.lineTo(cx, outfitY + 60);
      ctx.lineTo(cx + 50, outfitY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red Sailor Ribbon Tie
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(cx, outfitY + 45, 14, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (selectedOutfit === 'hero_hoodie') {
      // Hoodie shoulders & collar
      ctx.beginPath();
      ctx.roundRect(cx - 160, outfitY - 20, 320, 160, 30);
      ctx.fill();
      ctx.stroke();

      // Zipper & drawstrings
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, outfitY - 20);
      ctx.lineTo(cx, outfitY + 130);
      ctx.stroke();

      // Hero emblem
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx - 70, outfitY + 40, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (selectedOutfit === 'wizard_cape') {
      // Dark wizard cape
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(cx - 190, outfitY + 140);
      ctx.lineTo(cx - 80, outfitY - 30);
      ctx.lineTo(cx + 80, outfitY - 30);
      ctx.lineTo(cx + 190, outfitY + 140);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Star brooch
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, outfitY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (selectedOutfit === 'kimono') {
      // Kimono cross robe
      ctx.beginPath();
      ctx.moveTo(cx - 170, outfitY + 140);
      ctx.lineTo(cx + 40, outfitY - 10);
      ctx.lineTo(cx + 170, outfitY + 140);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Obi Sash
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(cx - 120, outfitY + 40, 240, 45);
      ctx.strokeRect(cx - 120, outfitY + 40, 240, 45);
    } else {
      // Graphic Tee
      ctx.beginPath();
      ctx.roundRect(cx - 140, outfitY, 280, 150, 20);
      ctx.fill();
      ctx.stroke();

      // Mascot print
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, outfitY + 50, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Draw Cheek Blush Stamps
    const currentBlush = CHIBI_BLUSH_STAMPS.find(b => b.id === selectedBlush);
    const blushColor = currentBlush?.color || 'rgba(244, 63, 94, 0.45)';
    ctx.save();
    if (selectedBlush === 'kitty_whiskers') {
      ctx.strokeStyle = blushColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      // Left whiskers
      ctx.beginPath();
      ctx.moveTo(cx - 170, cy + 30); ctx.lineTo(cx - 120, cy + 25);
      ctx.moveTo(cx - 175, cy + 45); ctx.lineTo(cx - 120, cy + 45);
      ctx.stroke();
      // Right whiskers
      ctx.beginPath();
      ctx.moveTo(cx + 170, cy + 30); ctx.lineTo(cx + 120, cy + 25);
      ctx.moveTo(cx + 175, cy + 45); ctx.lineTo(cx + 120, cy + 45);
      ctx.stroke();
    } else if (selectedBlush === 'star_stamps') {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('⭐', cx - 140, cy + 40);
      ctx.fillText('⭐', cx + 115, cy + 40);
    } else if (selectedBlush === 'heart_stamps') {
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('💖', cx - 140, cy + 40);
      ctx.fillText('💖', cx + 115, cy + 40);
    } else {
      ctx.fillStyle = blushColor;
      ctx.beginPath();
      ctx.ellipse(cx - 120, cy + 35, 30, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 120, cy + 35, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Draw Eye Expressions & Eye Color Overlays
    ctx.save();
    const lx = cx - 75;
    const rx = cx + 75;
    const ey = cy - 10;

    if (selectedExpression === 'cool_shades') {
      // Sunglasses frame
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cx - 130, ey - 30, 120, 60, 15);
      ctx.roundRect(cx + 10, ey - 30, 120, 60, 15);
      ctx.fill();
      ctx.stroke();

      // Sunglasses shine
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 110, ey + 15); ctx.lineTo(cx - 40, ey - 20);
      ctx.moveTo(cx + 30, ey + 15); ctx.lineTo(cx + 100, ey - 20);
      ctx.stroke();
    } else if (selectedExpression === 'heart_eyes') {
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('😍', lx, ey + 15);
      ctx.fillText('😍', rx, ey + 15);
    } else if (selectedExpression === 'wink_smile') {
      // Left eye open
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(lx, ey, 24, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lx - 8, ey - 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Right eye wink arc
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(rx, ey, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (selectedExpression === 'tears_of_joy') {
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(lx, ey, 25, 30, 0, 0, Math.PI * 2);
      ctx.ellipse(rx, ey, 25, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tear droplets
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(lx - 30, ey + 30, 10, 0, Math.PI * 2);
      ctx.arc(rx + 30, ey + 30, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sparkle eyes (default)
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(lx, ey, 26, 32, 0, 0, Math.PI * 2);
      ctx.ellipse(rx, ey, 26, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle white highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lx - 8, ey - 10, 10, 0, Math.PI * 2);
      ctx.arc(rx - 8, ey - 10, 10, 0, Math.PI * 2);
      ctx.arc(lx + 8, ey + 10, 5, 0, Math.PI * 2);
      ctx.arc(rx + 8, ey + 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 6. Draw Vector Hairstyle Layer
    ctx.save();
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    const hairY = cy - 110;

    if (selectedHair === 'twin_tails') {
      // Twin Pigtails Left & Right
      ctx.beginPath();
      ctx.ellipse(cx - 160, hairY + 40, 45, 110, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + 160, hairY + 40, 45, 110, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair ties
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx - 130, hairY - 30, 14, 0, Math.PI * 2);
      ctx.arc(cx + 130, hairY - 30, 14, 0, Math.PI * 2);
      ctx.fill();

      // Front Anime Bangs
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(cx, hairY - 20, 130, Math.PI * 1.05, Math.PI * 1.95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (selectedHair === 'chibi_bob') {
      // Rounded Bob Helmet Hair
      ctx.beginPath();
      ctx.arc(cx, hairY + 10, 140, Math.PI * 0.9, Math.PI * 2.1);
      ctx.lineTo(cx + 140, hairY + 130);
      ctx.lineTo(cx - 140, hairY + 130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (selectedHair === 'spiky_hero') {
      // Spiky anime hair tufts
      ctx.beginPath();
      ctx.moveTo(cx - 140, hairY + 60);
      ctx.lineTo(cx - 120, hairY - 70);
      ctx.lineTo(cx - 60, hairY - 20);
      ctx.lineTo(cx, hairY - 90);
      ctx.lineTo(cx + 60, hairY - 20);
      ctx.lineTo(cx + 120, hairY - 70);
      ctx.lineTo(cx + 140, hairY + 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (selectedHair === 'curly_buns') {
      // Space Buns
      ctx.beginPath();
      ctx.arc(cx - 110, hairY - 60, 50, 0, Math.PI * 2);
      ctx.arc(cx + 110, hairY - 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair line
      ctx.beginPath();
      ctx.arc(cx, hairY, 130, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      ctx.stroke();
    } else if (selectedHair === 'cute_bangs') {
      // Full straight anime bangs
      ctx.beginPath();
      ctx.arc(cx, hairY - 10, 135, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      ctx.stroke();
      // Side locks
      ctx.fillRect(cx - 140, hairY - 10, 30, 160);
      ctx.fillRect(cx + 110, hairY - 10, 30, 160);
    } else {
      // Pixie cut
      ctx.beginPath();
      ctx.arc(cx, hairY, 125, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 7. Draw Accessories (Headset, Crown, Cat Ears, Bunny Ears)
    ctx.save();
    if (selectedAccessory === 'cat_ears') {
      ctx.fillStyle = hairColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      // Left Ear
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 120);
      ctx.lineTo(cx - 80, cy - 220);
      ctx.lineTo(cx - 30, cy - 130);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Right Ear
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy - 130);
      ctx.lineTo(cx + 80, cy - 220);
      ctx.lineTo(cx + 130, cy - 120);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Inner pink ear
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(cx - 115, cy - 130);
      ctx.lineTo(cx - 80, cy - 195);
      ctx.lineTo(cx - 45, cy - 135);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy - 135);
      ctx.lineTo(cx + 80, cy - 195);
      ctx.lineTo(cx + 115, cy - 130);
      ctx.fill();
    } else if (selectedAccessory === 'bunny_ears') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx - 70, cy - 200, 25, 75, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 70, cy - 200, 25, 75, 0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Inner Pink
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(cx - 70, cy - 200, 12, 55, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 70, cy - 200, 12, 55, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (selectedAccessory === 'golden_crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 75, cy - 130);
      ctx.lineTo(cx - 90, cy - 210);
      ctx.lineTo(cx - 30, cy - 160);
      ctx.lineTo(cx, cy - 225);
      ctx.lineTo(cx + 30, cy - 160);
      ctx.lineTo(cx + 90, cy - 210);
      ctx.lineTo(cx + 75, cy - 130);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (selectedAccessory === 'gamer_headset') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 160, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      // Ear cups
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(cx - 175, cy - 60, 35, 90, 15);
      ctx.roundRect(cx + 140, cy - 60, 35, 90, 15);
      ctx.fill();
    }
    ctx.restore();

    // 8. Draw Bottom Tagline Banner Pill
    if (moodTagline.trim()) {
      ctx.save();
      const pillWidth = 480;
      const pillHeight = 70;
      const pillX = cx - pillWidth / 2;
      const pillY = height - 110;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 35);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'black 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(moodTagline, cx, pillY + pillHeight / 2);
      ctx.restore();
    }
  };

  // Render to Live Canvas Ref
  const renderCanvasToRef = () => {
    if (!liveCanvasRef.current) return;
    const canvas = liveCanvasRef.current;
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (photoCaptured) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = photoCaptured;
      img.onload = () => {
        drawAvatarToCanvas(ctx, 640, 640, img);
      };
      img.onerror = () => {
        drawAvatarToCanvas(ctx, 640, 640);
      };
    } else {
      drawAvatarToCanvas(ctx, 640, 640);
    }
  };

  // Generate PNG data URL for saving
  const renderAvatarStickerCanvas = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      if (photoCaptured) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = photoCaptured;
        img.onload = () => {
          drawAvatarToCanvas(ctx, 640, 640, img);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          drawAvatarToCanvas(ctx, 640, 640);
          resolve(canvas.toDataURL('image/png'));
        };
      } else {
        drawAvatarToCanvas(ctx, 640, 640);
        resolve(canvas.toDataURL('image/png'));
      }
    });
  };

  const handleGenerateAndSave = async () => {
    setIsGenerating(true);
    const dataUrl = await renderAvatarStickerCanvas();
    if (dataUrl) {
      playSoundEffect('victory');
      const styleName = STICKER_STYLES.find(s => s.id === selectedStyle)?.label || 'Chibi Avatar';
      const newSticker: AvatarSticker = {
        id: `chibi-avatar-${Date.now()}`,
        style: selectedStyle,
        styleName,
        dataUrl,
        originalPhotoUrl: photoCaptured || undefined,
        createdAt: new Date().toISOString(),
        moodTagline,
        borderStyle: selectedBorder,
        bgGradient: selectedBg,
        accessory: selectedAccessory
      };
      const updated = saveAvatarSticker(newSticker);
      setSavedStickers(updated);
      setActiveSticker(newSticker);

      saveRecordedEntry({
        type: 'avatar',
        typeLabel: '✨ Create Avatar Studio',
        title: `Chibi Avatar Created: ${styleName}`,
        excerpt: `Designed 640x640 vector HD PNG Chibi Sticker with ${selectedHair} hair, ${selectedBorder} border outline, and tagline: "${moodTagline || 'Chibi Hero'}".`,
        mediaUrl: dataUrl,
        reportAnalysis: {
          dominantEmotion: 'Creative Joy & Identity',
          valenceScore: 0.94,
          arousalScore: 0.45,
          sentimentLabel: 'High Self-Expression',
          summaryObservation: `User rendered and saved a custom Chibi Avatar sticker (${styleName}). High digital identity engagement.`,
          psychologistInsights: [
            'Personal avatar creation fosters positive self-concept and agency.',
            'Reflects constructive creative play and joyful self-expression.'
          ],
          guidanceNote: 'Avatar sticker saved to your SafeSpace profile and logged in your Dashboard activity history.',
          safetyStatus: 'SAFE'
        }
      });
    }
    setIsGenerating(false);
  };

  const handleDeleteSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteAvatarSticker(id);
    setSavedStickers(updated);
    setActiveSticker(getActiveAvatarSticker());
  };

  const handleSelectActive = (sticker: AvatarSticker) => {
    playSoundEffect('shutter');
    setActiveSticker(sticker);
    setActiveAvatarSticker(sticker);
  };

  const handleDownloadSticker = (stickerUrl: string) => {
    const a = document.createElement('a');
    a.href = stickerUrl;
    a.download = `chibi-pics-avatar-sticker-${Date.now()}.png`;
    a.click();
  };

  const activeParticles = CHIBI_EYES_EXPRESSIONS.find(e => e.id === selectedExpression)?.particles || ['✨', '⭐'];
  const activeMotionClass = ANIMATION_MOTIONS.find(m => m.id === selectedMotion)?.css || '';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner - Chibi.pics Kawaii Theme */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" /> Chibi.pics Studio Customizer
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              Chibi Avatar & Sticker Maker
            </h1>
            <p className="text-pink-100 text-sm max-w-xl leading-relaxed font-medium">
              Create cute <strong>Chibi.pics</strong> anime avatar stickers! Accurately customize hairstyles, hair colors, glossy eyes, outfit costumes, cheek blush stamps, and cutout outlines.
            </p>
          </div>
          
          {activeSticker && (
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
              <img src={activeSticker.dataUrl} alt="Active Avatar" className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-white animate-pulse" />
              <div>
                <div className="text-[10px] text-pink-200 font-extrabold uppercase tracking-wider">Active Chibi Signature</div>
                <div className="text-sm font-bold text-white truncate max-w-[140px]">{activeSticker.styleName}</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold inline-block mt-0.5">
                  ✓ Active Signature
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Character Quick-Loader Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Wand2 className="w-4 h-4 text-pink-500" /> Quick Character Sets (Instant Preset Loader)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_CHARACTER_SETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                playSoundEffect('shutter');
                setSelectedStyle(preset.style);
                setSelectedHair(preset.hair);
                setHairColor(preset.hairColor);
                setSelectedExpression(preset.eyes);
                setEyeColor(preset.eyeColor);
                setSelectedOutfit(preset.outfit);
                setOutfitColor(preset.outfitColor);
                setSelectedAccessory(preset.accessory);
                setSelectedBlush(preset.blush);
                setSelectedBorder(preset.border);
                setSelectedBg(preset.bg);
                setMoodTagline(preset.tagline);
              }}
              className="px-3 py-2 rounded-2xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-xs font-bold text-slate-800 hover:text-pink-700 transition-all cursor-pointer text-center"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Mood Expressions Sync Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-emerald-400/50 shadow-xl text-white space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Dashboard Mood Expression Sync
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  Live Dashboard Mood
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Dynamically updates facial expressions, cheek blush, tagline, and aura based on your mood score.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase">Dashboard Mood Score</div>
              <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                {currentMoodScore}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <div className="text-xs font-bold text-white">{dashboardMood.label}</div>
              <div className="text-[10px] text-emerald-300 font-semibold">{dashboardMood.expressionLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <BarChart2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Retrieved from <strong className="text-white">{dashboardMood.recentEntriesCount} recent entry reflections & check-ins</strong> (Dominant: <span className="text-emerald-300 font-bold">{dashboardMood.dominantEmotion}</span>).
            </span>
          </div>

          <button
            onClick={() => {
              playSoundEffect('shutter');
              const nextSync = !autoSyncMood;
              setAutoSyncMood(nextSync);
              if (nextSync) {
                const fresh = calculateDashboardMoodData();
                setCurrentMoodScore(fresh.score);
                setDashboardMood(fresh);
                applyMoodDataToAvatar(fresh);
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              autoSyncMood 
                ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${autoSyncMood ? 'animate-spin' : ''}`} />
            {autoSyncMood ? '⚡ Auto-Sync Active' : 'Manual Mode (Click to Sync)'}
          </button>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-slate-300 flex items-center gap-1">
              <SmilePlus className="w-3.5 h-3.5 text-pink-400" />
              Test Dynamic Facial Expressions across Mood Scores:
            </span>
            <span className="text-emerald-400 font-black">{currentMoodScore}% Positivity Score</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={currentMoodScore}
            onChange={(e) => {
              const newScore = parseInt(e.target.value, 10);
              setCurrentMoodScore(newScore);
              const data = calculateDashboardMoodData(newScore);
              setDashboardMood(data);
              applyMoodDataToAvatar(data);
            }}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Categorized Studio Studio Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Studio Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'base', label: '🎨 Base & Photo', icon: Camera },
              { id: 'hair_eyes', label: '💇 Hair & Eyes', icon: Scissors },
              { id: 'wardrobe', label: '👗 Wardrobe', icon: Shirt },
              { id: 'mood_effects', label: '🌸 Kawaii Mood', icon: Sparkles },
              { id: 'border_tagline', label: '✨ Frame & Badge', icon: Star },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playSoundEffect('shutter');
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 ring-1 ring-pink-500' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: BASE & PHOTO CAPTURE */}
          {activeTab === 'base' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>1. Photo Capture & Skin Tone Base</span>
                <span className="text-xs text-pink-600 font-extrabold">Chibi.pics Camera</span>
              </h2>

              <div className="relative aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-inner flex items-center justify-center group">
                {cameraActive ? (
                  <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" autoPlay playsInline />
                ) : photoCaptured ? (
                  <img src={photoCaptured} alt="Captured portrait" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <Camera className="w-12 h-12 mx-auto text-slate-500" />
                    <p className="text-xs font-semibold">No photo captured yet</p>
                  </div>
                )}

                {cameraActive && (
                  <div className="absolute inset-0 border-4 border-dashed border-pink-400/80 rounded-3xl pointer-events-none flex items-center justify-center animate-pulse">
                    <span className="text-xs text-pink-100 bg-slate-900/85 px-3.5 py-1.5 rounded-full backdrop-blur-md font-bold">
                      ✨ Center Your Smile Here
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {cameraActive ? (
                  <button
                    onClick={capturePhotoFromCamera}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo Now 📸
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-pink-400" /> Open Live Camera
                  </button>
                )}

                <label className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-all flex items-center gap-2 cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Upload Picture
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Skin Tone Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chibi Base Skin Tone:</label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TONES.map(skin => (
                    <button
                      key={skin.hex}
                      onClick={() => setSkinTone(skin.hex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        skinTone === skin.hex ? 'border-pink-500 ring-2 ring-pink-300 bg-pink-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400" style={{ backgroundColor: skin.hex }} />
                      {skin.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Selector */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Or Choose Sample Model:</div>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_PORTRAITS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        playSoundEffect('shutter');
                        setPhotoCaptured(sample.url);
                        stopCamera();
                      }}
                      className={`p-1 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                        photoCaptured === sample.url ? 'border-pink-500 ring-2 ring-pink-300 scale-105' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-14 object-cover rounded-xl" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HAIR & EYES */}
          {activeTab === 'hair_eyes' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-pink-500" />
                2. Hairstyle & Eye Expression Controls
              </h2>

              {/* Hairstyles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chibi Hairstyle:</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHIBI_HAIRSTYLES.map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => setSelectedHair(hair.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedHair === hair.id ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{hair.icon}</span> {hair.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Hair Color Palette:</label>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setHairColor(c.hex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        hairColor === c.hex ? 'border-pink-500 ring-2 ring-pink-300 bg-pink-50 text-slate-900 font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Expression */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chibi Eye Expression:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHIBI_EYES_EXPRESSIONS.map((exp) => {
                    const ExpIcon = exp.icon;
                    const isSelected = selectedExpression === exp.id;
                    return (
                      <button
                        key={exp.id}
                        onClick={() => setSelectedExpression(exp.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs ring-2 ring-purple-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <ExpIcon className={`w-4 h-4 ${exp.color}`} />
                        {exp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eye Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Iris & Eye Color Palette:</label>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setEyeColor(c.hex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        eyeColor === c.hex ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50 text-slate-900 font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WARDROBE & ACCESSORIES */}
          {activeTab === 'wardrobe' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-indigo-500" />
                3. Wardrobe Costumes & Headwear Accessories
              </h2>

              {/* Outfits */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Outfit & Costume:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHIBI_OUTFITS.map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => setSelectedOutfit(outfit.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedOutfit === outfit.id ? 'bg-indigo-100 border-indigo-400 text-indigo-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Costume Main Accent Color:</label>
                <div className="flex flex-wrap gap-2">
                  {OUTFIT_COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setOutfitColor(c.hex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        outfitColor === c.hex ? 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50 text-slate-900 font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Headwear & Accessory Overlay:</label>
                <div className="flex flex-wrap gap-2">
                  {CHIBI_ACCESSORIES.map(acc => {
                    const AccIcon = acc.icon;
                    const isSelected = selectedAccessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccessory(acc.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <AccIcon className="w-3.5 h-3.5" />
                        {acc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KAWAII MOOD & EFFECTS */}
          {activeTab === 'mood_effects' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                4. Kawaii Blush Stamps & Animation Motion
              </h2>

              {/* Blush Cheek Stamps */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Kawaii Blush Cheek Stamp:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHIBI_BLUSH_STAMPS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBlush(b.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedBlush === b.id ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-xs font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Live Animation Motion Effect:</label>
                <div className="flex flex-wrap gap-2">
                  {ANIMATION_MOTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMotion(m.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedMotion === m.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Art Style Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chibi Art Style Rendering Filter:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STICKER_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        selectedStyle === style.id ? `${style.bg} border-2` : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>{style.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FRAME & TAGLINE BADGE */}
          {activeTab === 'border_tagline' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                5. Cutout Frame, Aura Pattern & Tagline
              </h2>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chibi Mood Tagline Signature:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={moodTagline}
                    onChange={(e) => setMoodTagline(e.target.value)}
                    placeholder="e.g. ✨ Chibi.pics Hero, 🌸 Zen Mode"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-slate-900 font-semibold"
                    maxLength={28}
                  />
                  <button
                    onClick={handleSpeakTagline}
                    disabled={isSpeaking}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-purple-200 shrink-0"
                    title="Hear Chibi Voice"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-pink-600' : ''}`} />
                    {isSpeaking ? 'Speaking...' : 'Chibi Voice'}
                  </button>
                </div>
              </div>

              {/* Border Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Sticker Cutout Border Outline:</label>
                <div className="grid grid-cols-2 gap-2">
                  {BORDER_STYLES.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBorder(b.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                        selectedBorder === b.id ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Gradient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chibi.pics Background Pattern Aura:</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {BACKGROUND_GRADIENTS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      className={`p-2 rounded-xl text-[11px] font-extrabold text-white bg-gradient-to-r ${bg.id === 'pink_purple' ? 'from-pink-400 to-indigo-400' : bg.id === 'cyberpunk' ? 'from-rose-500 to-cyan-500' : bg.id === 'sunset' ? 'from-amber-400 to-purple-500' : bg.id === 'galaxy' ? 'from-indigo-900 to-slate-900' : 'from-emerald-400 to-cyan-500'} transition-all cursor-pointer text-center truncate ${
                        selectedBg === bg.id ? 'ring-2 ring-offset-2 ring-pink-500 scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live HD Canvas Preview & Saved Library (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live High-Res Canvas Preview Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg sticky top-6 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    previewTab === 'preview' ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✨ Chibi.pics Studio
                </button>
                <button
                  onClick={() => setPreviewTab('action_test')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    previewTab === 'action_test' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🏆 Placement Test
                </button>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[10px]">
                HD PNG Sticker
              </span>
            </div>

            {previewTab === 'preview' ? (
              <>
                <div className="py-4 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-slate-900/5 border border-slate-100">
                  {/* Floating Animated Sparkle Particles */}
                  <div className="absolute top-3 left-4 text-xl animate-bounce duration-1000">
                    {activeParticles[0]}
                  </div>
                  <div className="absolute top-4 right-5 text-xl animate-pulse duration-700">
                    {activeParticles[1]}
                  </div>

                  {/* Real-time HTML5 Canvas Render */}
                  <div className={`relative w-64 h-64 flex items-center justify-center transform transition-all duration-300 ${activeMotionClass}`}>
                    <canvas
                      ref={liveCanvasRef}
                      className="w-64 h-64 object-contain rounded-full drop-shadow-xl"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateAndSave}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Rendering High-Res Chibi Sticker...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" /> Save Chibi Sticker to Library
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Placement Test Mode */
              <div className="space-y-4 py-2 text-left">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-pink-500" /> Peer Discussion Reply Preview
                  </div>
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                    <img src={photoCaptured || SAMPLE_PORTRAITS[0].url} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-pink-400" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{getUserDisplayName(currentUser)} <span className="text-[10px] text-pink-600 font-bold ml-1">{moodTagline}</span></div>
                      <p className="text-[11px] text-slate-600 leading-snug mt-0.5">"Thank you for sharing this breathing exercise, it really helped me today!"</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" /> Certificate Signature Stamp Preview
                  </div>
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                    <img src={photoCaptured || SAMPLE_PORTRAITS[0].url} alt="Badge" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
                    <div>
                      <div className="text-xs font-black text-slate-900">Certificate of Mindfulness</div>
                      <div className="text-[10px] text-slate-500">Stamped by {moodTagline}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-snug font-medium">
              Saving makes your Chibi avatar sticker available as a signature stamp on drawings, journal entries, and comment replies!
            </p>
          </div>

          {/* Saved Avatar Stickers Library Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-600" />
                Chibi Sticker Library ({savedStickers.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Click to set active</span>
            </div>

            {savedStickers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Smile className="w-10 h-10 text-slate-400 mx-auto animate-bounce" />
                <p className="text-xs text-slate-500 font-medium">No saved Chibi stickers yet. Create your first one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {savedStickers.map((sticker) => {
                  const isActive = activeSticker?.id === sticker.id;
                  return (
                    <div
                      key={sticker.id}
                      onClick={() => handleSelectActive(sticker)}
                      className={`p-2.5 rounded-2xl border-2 bg-slate-50 transition-all cursor-pointer flex flex-col items-center text-center relative group ${
                        isActive ? 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/30 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}

                      <img src={sticker.dataUrl} alt={sticker.styleName} className="w-20 h-20 object-contain rounded-xl drop-shadow-sm mb-1.5" />
                      <div className="text-[11px] font-bold text-slate-800 truncate w-full">{sticker.styleName}</div>
                      <div className="text-[9px] text-slate-500 truncate w-full">{sticker.moodTagline || 'Chibi Sticker'}</div>

                      <div className="flex items-center gap-1 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSticker(sticker.dataUrl);
                          }}
                          className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-[10px] font-semibold cursor-pointer"
                          title="Download PNG"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSticker(sticker.id, e)}
                          className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-semibold cursor-pointer"
                          title="Delete Sticker"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
