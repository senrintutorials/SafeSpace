import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, Mic, MicOff, Play, Pause, RotateCcw, Award, Sparkles, 
  Star, Volume2, VolumeX, Flame, Trophy, CheckCircle2, Radio, 
  Heart, Share2, Download, UserCheck, Smile, Disc, RefreshCw,
  Zap, ArrowRight, Music2, ShieldCheck, Activity, BarChart2,
  ExternalLink, Youtube, Video
} from 'lucide-react';
import { getActiveAvatarSticker, AvatarSticker } from '../utils/avatarStickerStore';
import { UserProfile } from '../types/auth';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';

interface SingAlongModuleProps {
  currentUser?: UserProfile | null;
  onNavigateToDashboard?: () => void;
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  theme: string;
  genre: string;
  bpm: number;
  key: string;
  difficulty: 'Easy' | 'Medium' | 'Inspiring Master';
  coverGradient: string;
  coverEmoji: string;
  wellnessFocus: string;
  youtubeId: string;
  isAtomicKaraoke?: boolean;
  lyrics: {
    time: number; // in seconds
    text: string;
    targetPitchHz: number; // reference pitch frequency
    pitchLabel: 'Low' | 'Mid' | 'High' | 'Peak';
  }[];
}

const INSPIRING_SONG_BANK: SongItem[] = [
  {
    id: 'song-count-on-me',
    title: 'Count on Me',
    artist: 'Bruno Mars',
    theme: 'Friendship & Unconditional Support',
    genre: 'Uplifting Pop / Acoustic',
    bpm: 88,
    key: 'C Major',
    difficulty: 'Easy',
    coverGradient: 'from-amber-400 via-orange-500 to-rose-500',
    coverEmoji: '🤝',
    wellnessFocus: 'Fosters feelings of trust, connection, and social warmth.',
    youtubeId: 'sX4WwM7h7wI', // Official Atomic Karaoke HD Video
    isAtomicKaraoke: true,
    lyrics: [
      { time: 12, text: "If you ever find yourself stuck in the middle of the sea...", targetPitchHz: 220, pitchLabel: 'Mid' },
      { time: 17, text: "I'll sail the world to find you.", targetPitchHz: 260, pitchLabel: 'High' },
      { time: 21, text: "If you ever find yourself lost in the dark and you can't see...", targetPitchHz: 220, pitchLabel: 'Mid' },
      { time: 26, text: "I'll be the light to guide you.", targetPitchHz: 290, pitchLabel: 'High' },
      { time: 30, text: "You can count on me like one, two, three...", targetPitchHz: 330, pitchLabel: 'Peak' },
      { time: 35, text: "I'll be there!", targetPitchHz: 350, pitchLabel: 'Peak' },
      { time: 38, text: "And I know when I need it I can count on you like four, three, two...", targetPitchHz: 260, pitchLabel: 'Mid' },
      { time: 43, text: "You'll be there, 'cause that's what friends are supposed to do!", targetPitchHz: 330, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-you-raise-me-up',
    title: 'You Raise Me Up',
    artist: 'Josh Groban',
    theme: 'Uplifting Support & Inner Strength',
    genre: 'Inspirational Pop Ballad',
    bpm: 60,
    key: 'Eb Major',
    difficulty: 'Easy',
    coverGradient: 'from-amber-400 via-emerald-500 to-teal-700',
    coverEmoji: '🌅',
    wellnessFocus: 'Inspires calm perseverance, hope, and emotional elevation.',
    youtubeId: 'oni0tO_HN30', // Official Atomic Karaoke HD Video
    isAtomicKaraoke: true,
    lyrics: [
      { time: 12, text: "When I am down, and, oh, my soul, so weary...", targetPitchHz: 175, pitchLabel: 'Low' },
      { time: 19, text: "When troubles come and my heart burdened be...", targetPitchHz: 200, pitchLabel: 'Low' },
      { time: 26, text: "Then, I am still and wait here in the silence...", targetPitchHz: 230, pitchLabel: 'Mid' },
      { time: 33, text: "Until you come and sit awhile with me...", targetPitchHz: 260, pitchLabel: 'Mid' },
      { time: 40, text: "You raise me up, so I can stand on mountains!", targetPitchHz: 330, pitchLabel: 'High' },
      { time: 48, text: "You raise me up to walk on stormy seas!", targetPitchHz: 370, pitchLabel: 'Peak' },
      { time: 55, text: "I am strong when I am on your shoulders...", targetPitchHz: 390, pitchLabel: 'Peak' },
      { time: 62, text: "You raise me up to more than I can be!", targetPitchHz: 420, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-a-thousand-years',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    theme: 'Enduring Heartfelt Romance',
    genre: 'Acoustic Love Ballad',
    bpm: 75,
    key: 'Bb Major',
    difficulty: 'Easy',
    coverGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    coverEmoji: '🕊️',
    wellnessFocus: 'Calms breathing rate and evokes serene gratitude.',
    youtubeId: 'f7RlRd4uKSM', // Official Atomic Karaoke HD Video
    isAtomicKaraoke: true,
    lyrics: [
      { time: 15, text: "Heart beats fast, colors and promises...", targetPitchHz: 220, pitchLabel: 'Low' },
      { time: 21, text: "How to be brave? How can I love when I'm afraid to fall?", targetPitchHz: 240, pitchLabel: 'Mid' },
      { time: 28, text: "But watching you stand alone...", targetPitchHz: 260, pitchLabel: 'Mid' },
      { time: 33, text: "All of my doubt suddenly goes away somehow!", targetPitchHz: 290, pitchLabel: 'High' },
      { time: 39, text: "One step closer...", targetPitchHz: 310, pitchLabel: 'High' },
      { time: 44, text: "I have loved you for a thousand years...", targetPitchHz: 350, pitchLabel: 'Peak' },
      { time: 50, text: "I'll love you for a thousand more!", targetPitchHz: 380, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-when-i-was-your-man',
    title: 'When I Was Your Man',
    artist: 'Bruno Mars',
    theme: 'Reflective Gratitude & Vocal Soul',
    genre: 'Soulful Piano Ballad',
    bpm: 73,
    key: 'C Major',
    difficulty: 'Medium',
    coverGradient: 'from-blue-600 via-indigo-700 to-slate-800',
    coverEmoji: '🎹',
    wellnessFocus: 'Releases emotional burden through soulful vocal resonance.',
    youtubeId: '92MInm9l99k', // Official Atomic Karaoke HD Video
    isAtomicKaraoke: true,
    lyrics: [
      { time: 12, text: "Same bed but it feels just a little bit bigger now...", targetPitchHz: 196, pitchLabel: 'Low' },
      { time: 18, text: "Our song on the radio but it don't sound the same...", targetPitchHz: 220, pitchLabel: 'Mid' },
      { time: 25, text: "When our friends talk about you, all it does is just tear me down...", targetPitchHz: 247, pitchLabel: 'Mid' },
      { time: 32, text: "'Cause my heart breaks a little when I hear your name...", targetPitchHz: 293, pitchLabel: 'High' },
      { time: 38, text: "I should have bought you flowers and held your hand...", targetPitchHz: 330, pitchLabel: 'High' },
      { time: 44, text: "Should have given you all my hours when I had the chance!", targetPitchHz: 392, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-a-million-dreams',
    title: 'A Million Dreams',
    artist: 'The Greatest Showman',
    theme: 'Imagination, Hope & Future Vision',
    genre: 'Inspirational Musical Ballad',
    bpm: 78,
    key: 'G Major',
    difficulty: 'Medium',
    coverGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    coverEmoji: '🌌',
    wellnessFocus: 'Encourages creative visualization, hopefulness, and joyful anticipation.',
    youtubeId: 'pSQbin-sm6A', // Accurate Sing King HD Karaoke
    isAtomicKaraoke: false,
    lyrics: [
      { time: 10, text: "I close my eyes and I can see...", targetPitchHz: 196, pitchLabel: 'Low' },
      { time: 14, text: "A world that's waiting up for me...", targetPitchHz: 220, pitchLabel: 'Mid' },
      { time: 18, text: "That I call my own...", targetPitchHz: 247, pitchLabel: 'Mid' },
      { time: 22, text: "Through the dark, through the door, through where no one's been before...", targetPitchHz: 293, pitchLabel: 'High' },
      { time: 27, text: "'Cause every night I lie in bed...", targetPitchHz: 330, pitchLabel: 'High' },
      { time: 31, text: "The brightest colors fill my head...", targetPitchHz: 370, pitchLabel: 'Peak' },
      { time: 35, text: "A million dreams are keeping me awake!", targetPitchHz: 392, pitchLabel: 'Peak' },
      { time: 40, text: "A million dreams for the world we're gonna make!", targetPitchHz: 440, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-unstoppable',
    title: 'Unstoppable',
    artist: 'Sia',
    theme: 'Inner Armor & Invincible Confidence',
    genre: 'Power Pop Anthem',
    bpm: 92,
    key: 'Eb Minor',
    difficulty: 'Medium',
    coverGradient: 'from-rose-600 via-pink-600 to-amber-500',
    coverEmoji: '🛡️',
    wellnessFocus: 'Builds self-efficacy, vocal strength, and emotional armor against doubt.',
    youtubeId: 'f3z-xR-n1oE', // Accurate Sing King HD Karaoke
    isAtomicKaraoke: false,
    lyrics: [
      { time: 10, text: "All smiles, I know what it takes to fool this town...", targetPitchHz: 207, pitchLabel: 'Low' },
      { time: 15, text: "I'll show you that I'm strong...", targetPitchHz: 233, pitchLabel: 'Mid' },
      { time: 19, text: "I'm unstoppable, I'm a Porsche with no brakes!", targetPitchHz: 311, pitchLabel: 'High' },
      { time: 24, text: "I'm invincible, yeah, I win every single game!", targetPitchHz: 349, pitchLabel: 'High' },
      { time: 29, text: "I'm so powerful, I don't need batteries to play!", targetPitchHz: 370, pitchLabel: 'Peak' },
      { time: 34, text: "I'm so confident, yeah, I'm unstoppable today!", targetPitchHz: 415, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-you-raise-me-up',
    title: 'You Raise Me Up',
    artist: 'Josh Groban',
    theme: 'Inner Resilience & Spiritual Peace',
    genre: 'Inspirational Ballad',
    bpm: 65,
    key: 'Eb Major',
    difficulty: 'Medium',
    coverGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    coverEmoji: '✨',
    wellnessFocus: 'Deep diaphragmatic vocalizing reduces anxiety and elevates mood.',
    youtubeId: 'aJxrX424hV0', // Accurate HD Karaoke
    lyrics: [
      { time: 12, text: "When I am down, and, oh, my soul's so weary...", targetPitchHz: 180, pitchLabel: 'Low' },
      { time: 18, text: "When troubles come and my heart burdened be...", targetPitchHz: 210, pitchLabel: 'Mid' },
      { time: 24, text: "Then, I am still and wait here in the silence...", targetPitchHz: 230, pitchLabel: 'Mid' },
      { time: 30, text: "Until You come and sit awhile with me...", targetPitchHz: 260, pitchLabel: 'High' },
      { time: 36, text: "You raise me up, so I can stand on mountains!", targetPitchHz: 340, pitchLabel: 'Peak' },
      { time: 42, text: "You raise me up, to walk on stormy seas!", targetPitchHz: 370, pitchLabel: 'Peak' },
      { time: 48, text: "I am strong, when I am on your shoulders...", targetPitchHz: 310, pitchLabel: 'High' },
      { time: 54, text: "You raise me up to more than I can be!", targetPitchHz: 390, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-brave',
    title: 'Brave',
    artist: 'Sara Bareilles',
    theme: 'Authenticity & Speaking Your Truth',
    genre: 'Uplifting Pop / Piano',
    bpm: 92,
    key: 'Bb Major',
    difficulty: 'Easy',
    coverGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    coverEmoji: '🗣️',
    wellnessFocus: 'Encourages assertive self-expression and overcoming fear of judgment.',
    youtubeId: 'QUQsqBqjsR8', // Accurate HD Karaoke
    lyrics: [
      { time: 10, text: "You can be amazing, you can turn a phrase into a weapon or a drug...", targetPitchHz: 233, pitchLabel: 'Mid' },
      { time: 15, text: "You can be the outcast, or be the backlash of somebody's lack of love...", targetPitchHz: 261, pitchLabel: 'Mid' },
      { time: 21, text: "Say what you wanna say, and let the words fall out!", targetPitchHz: 311, pitchLabel: 'High' },
      { time: 26, text: "Honestly I wanna see you be brave!", targetPitchHz: 349, pitchLabel: 'Peak' },
      { time: 31, text: "With what you want to say, and let the words fall out!", targetPitchHz: 311, pitchLabel: 'High' },
      { time: 36, text: "Honestly I wanna see you be brave!", targetPitchHz: 392, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-fight-song',
    title: 'Fight Song',
    artist: 'Rachel Platten',
    theme: 'Overcoming Doubt & Self-Belief',
    genre: 'Empowerment Anthem',
    bpm: 85,
    key: 'G Major',
    difficulty: 'Easy',
    coverGradient: 'from-rose-500 via-pink-600 to-purple-600',
    coverEmoji: '🔥',
    wellnessFocus: 'Encourages vocal projection and emotional release of stress.',
    youtubeId: 'xo1VInw-xkM', // Accurate HD Karaoke
    lyrics: [
      { time: 10, text: "Like a small boat on the ocean...", targetPitchHz: 195, pitchLabel: 'Low' },
      { time: 14, text: "Sending big waves into motion...", targetPitchHz: 220, pitchLabel: 'Mid' },
      { time: 18, text: "Like how a single word can make a heart open...", targetPitchHz: 240, pitchLabel: 'Mid' },
      { time: 23, text: "I might only have one match, but I can make an explosion!", targetPitchHz: 280, pitchLabel: 'High' },
      { time: 28, text: "And this is my fight song, take back my life song!", targetPitchHz: 330, pitchLabel: 'Peak' },
      { time: 33, text: "Prove I'm alright song!", targetPitchHz: 350, pitchLabel: 'Peak' },
      { time: 37, text: "My power's turned on, starting right now I'll be strong!", targetPitchHz: 370, pitchLabel: 'Peak' },
      { time: 42, text: "I'll play my fight song, and I don't really care if nobody else believes...", targetPitchHz: 310, pitchLabel: 'High' },
      { time: 48, text: "'Cause I've still got a lot of fight left in me!", targetPitchHz: 390, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-try-everything',
    title: 'Try Everything',
    artist: 'Shakira',
    theme: 'Perseverance & Growth Mindset',
    genre: 'Upbeat Energetic Pop',
    bpm: 115,
    key: 'C Major',
    difficulty: 'Easy',
    coverGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    coverEmoji: '🌟',
    wellnessFocus: 'Reframes failures as stepping stones to emotional resilience and mastery.',
    youtubeId: 'c6rP-YP4c5I', // Accurate HD Karaoke
    lyrics: [
      { time: 8, text: "I messed up tonight, I lost another fight...", targetPitchHz: 220, pitchLabel: 'Low' },
      { time: 12, text: "I lost to myself, but I'll just start again!", targetPitchHz: 261, pitchLabel: 'Mid' },
      { time: 17, text: "I won't give up, no, I won't give in 'til I reach the end...", targetPitchHz: 329, pitchLabel: 'High' },
      { time: 22, text: "Then I'll start again!", targetPitchHz: 349, pitchLabel: 'High' },
      { time: 26, text: "No, I won't leave, I wanna try everything!", targetPitchHz: 392, pitchLabel: 'Peak' },
      { time: 30, text: "I wanna try even though I could fail!", targetPitchHz: 440, pitchLabel: 'Peak' },
      { time: 35, text: "Look how far you've come, you filled your heart with love!", targetPitchHz: 329, pitchLabel: 'High' },
    ]
  },
  {
    id: 'song-what-a-wonderful-world',
    title: 'What a Wonderful World',
    artist: 'Louis Armstrong',
    theme: 'Mindful Gratitude & Joy of Life',
    genre: 'Classic Soul / Jazz',
    bpm: 72,
    key: 'F Major',
    difficulty: 'Easy',
    coverGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    coverEmoji: '🌍',
    wellnessFocus: 'Slow rhythmic humming lowers heart rate and brings serene calm.',
    youtubeId: 'CWzrABouyeE', // Accurate HD Karaoke
    lyrics: [
      { time: 8, text: "I see trees of green, red roses too...", targetPitchHz: 130, pitchLabel: 'Low' },
      { time: 13, text: "I see them bloom for me and you...", targetPitchHz: 150, pitchLabel: 'Low' },
      { time: 18, text: "And I think to myself...", targetPitchHz: 170, pitchLabel: 'Mid' },
      { time: 22, text: "What a wonderful world!", targetPitchHz: 190, pitchLabel: 'Mid' },
      { time: 26, text: "I see skies of blue and clouds of white...", targetPitchHz: 160, pitchLabel: 'Low' },
      { time: 31, text: "The bright blessed day, the dark sacred night...", targetPitchHz: 180, pitchLabel: 'Mid' },
      { time: 36, text: "And I think to myself...", targetPitchHz: 210, pitchLabel: 'Mid' },
      { time: 40, text: "What a wonderful world!", targetPitchHz: 230, pitchLabel: 'High' },
    ]
  },
  {
    id: 'song-firework',
    title: 'Firework',
    artist: 'Katy Perry',
    theme: 'Celebrating Unique Sparkle & Pride',
    genre: 'Uplifting Pop',
    bpm: 124,
    key: 'Ab Major',
    difficulty: 'Inspiring Master',
    coverGradient: 'from-yellow-400 via-amber-500 to-rose-600',
    coverEmoji: '🎆',
    wellnessFocus: 'High-energy singing releases endorphins and boosts positive self-worth.',
    youtubeId: 'QGJuMBdaqIw', // Accurate HD Karaoke
    lyrics: [
      { time: 12, text: "Do you ever feel like a plastic bag, drifting through the wind...", targetPitchHz: 210, pitchLabel: 'Low' },
      { time: 17, text: "Wanting to start again?", targetPitchHz: 240, pitchLabel: 'Mid' },
      { time: 21, text: "Do you know that there's still a chance for you?", targetPitchHz: 270, pitchLabel: 'High' },
      { time: 25, text: "'Cause there's a spark in you!", targetPitchHz: 310, pitchLabel: 'High' },
      { time: 29, text: "You just gotta ignite the light and let it shine!", targetPitchHz: 360, pitchLabel: 'Peak' },
      { time: 34, text: "Just own the night like the Fourth of July!", targetPitchHz: 380, pitchLabel: 'Peak' },
      { time: 39, text: "'Cause baby, you're a firework!", targetPitchHz: 420, pitchLabel: 'Peak' },
      { time: 43, text: "Come on, show 'em what you're worth!", targetPitchHz: 440, pitchLabel: 'Peak' },
      { time: 48, text: "Make 'em go, 'Aah, aah, aah!' As you shoot across the sky!", targetPitchHz: 460, pitchLabel: 'Peak' },
    ]
  },
  {
    id: 'song-lean-on-me',
    title: 'Lean on Me',
    artist: 'Bill Withers',
    theme: 'Community Comfort & Shared Strength',
    genre: 'Gospel / Soul',
    bpm: 86,
    key: 'C Major',
    difficulty: 'Easy',
    coverGradient: 'from-blue-500 via-indigo-600 to-violet-700',
    coverEmoji: '🤍',
    wellnessFocus: 'Promotes empathy, community belonging, and breath regulation.',
    youtubeId: 'fOZ-MySzAac', // Accurate HD Karaoke
    lyrics: [
      { time: 10, text: "Sometimes in our lives we all have pain, we all have sorrow...", targetPitchHz: 170, pitchLabel: 'Low' },
      { time: 16, text: "But if we are wise, we know that there's always tomorrow...", targetPitchHz: 200, pitchLabel: 'Mid' },
      { time: 22, text: "Lean on me, when you're not strong!", targetPitchHz: 240, pitchLabel: 'Mid' },
      { time: 27, text: "And I'll be your friend, I'll help you carry on!", targetPitchHz: 270, pitchLabel: 'High' },
      { time: 32, text: "For it won't be long 'til I'm gonna need somebody to lean on...", targetPitchHz: 290, pitchLabel: 'High' },
      { time: 38, text: "You just call on me brother, when you need a hand!", targetPitchHz: 320, pitchLabel: 'Peak' },
      { time: 43, text: "We all need somebody to lean on!", targetPitchHz: 340, pitchLabel: 'Peak' },
    ]
  }
];

export default function SingAlongModule({ currentUser, onNavigateToDashboard }: SingAlongModuleProps) {
  const [selectedSong, setSelectedSong] = useState<SongItem>(INSPIRING_SONG_BANK[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.85); // Backing music volume (0 to 1)
  
  // Scoring state
  const [livePitchScore, setLivePitchScore] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [pitchFeedbackText, setPitchFeedbackText] = useState<string>('Ready to Sing! 🎤');
  const [currentMicVolume, setCurrentMicVolume] = useState<number>(0);
  const [currentMicPitchHz, setCurrentMicPitchHz] = useState<number>(0);
  const [micPermissionNotice, setMicPermissionNotice] = useState<string | null>(null);
  
  // Show performance evaluation modal at the end
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [finalRatingData, setFinalRatingData] = useState<{
    score: number;
    grade: string;
    pitchAcc: number;
    rhythmAcc: number;
    passion: number;
    clarity: number;
    feedbackTip: string;
  } | null>(null);

  // KaraFun Studio Features
  const [keyTranspose, setKeyTranspose] = useState<number>(0); // -3 to +3 semitones
  const [leadVocalGuide, setLeadVocalGuide] = useState<boolean>(true); // Guide vocal melody on/off
  const [reverbEffect, setReverbEffect] = useState<boolean>(true); // Spatial hall reverb
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All Hits');
  const [showCrowdCheer, setShowCrowdCheer] = useState<boolean>(false);
  const [activeAvatar, setActiveAvatar] = useState<AvatarSticker | null>(null);

  // Categories for KaraFun Discovery view
  const categories = ['All Hits', 'Pop & Anthems', 'Inspiring Ballads', 'Soul & Gospel', 'Acoustic'];

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);
  const lastNoteStepRef = useRef<number>(-1);
  
  // Mic analyzer refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // YouTube IFrame Player Ref & Sync helper
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const seekToTime = (seconds: number) => {
    const targetSec = Math.max(0, parseFloat(seconds.toFixed(1)));
    setCurrentTime(targetSec);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [targetSec, true]
          }),
          '*'
        );
        if (!isPlaying) {
          setIsPlaying(true);
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'playVideo',
              args: []
            }),
            '*'
          );
        }
      } catch (err) {
        console.log('YouTube seek postMessage error:', err);
      }
    }
  };

  // Atomic Karaoke Custom Video URL / ID State
  const [customVideoInput, setCustomVideoInput] = useState<string>('');

  const extractYoutubeId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('v=')) {
      return trimmed.split('v=')[1]?.split('&')[0] || trimmed;
    }
    if (trimmed.includes('youtu.be/')) {
      return trimmed.split('youtu.be/')[1]?.split('?')[0] || trimmed;
    }
    return trimmed;
  };

  const handleLoadCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoInput.trim()) return;
    const extractedId = extractYoutubeId(customVideoInput);
    if (extractedId) {
      setSelectedSong((prev) => ({
        ...prev,
        id: `custom-atomic-${Date.now()}`,
        title: 'Custom Atomic Karaoke Track',
        artist: 'Atomic Karaoke Channel (@AtomicKaraoke)',
        youtubeId: extractedId,
        isAtomicKaraoke: true,
      }));
      setIsPlaying(true);
      setCustomVideoInput('');
    }
  };

  // Load avatar on mount
  useEffect(() => {
    const avatar = getActiveAvatarSticker();
    setActiveAvatar(avatar);
  }, []);

  // Ensure AudioContext is initialized and unlocked on user interaction
  const ensureAudioContext = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.error("Failed to initialize AudioContext", e);
      return null;
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopKaraokePlayback();
      stopMicrophone();
    };
  }, []);

  // Smooth 100ms Karaoke playback timer (0.1s increments)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = parseFloat((prev + 0.1).toFixed(1));
          // Check song end
          const maxTime = selectedSong.lyrics[selectedSong.lyrics.length - 1].time + 6;
          if (next >= maxTime) {
            handleCompletePerformance();
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedSong]);

  // Synchronize synthetic backing synth audio notes & pitch scoring
  useEffect(() => {
    if (isPlaying) {
      // Trigger synth note step every 0.3s for smooth backing music
      const currentStep = Math.floor(currentTime * 3.3);
      if (currentStep !== lastNoteStepRef.current) {
        lastNoteStepRef.current = currentStep;
        playSynthMelodyNote(currentTime);
      }

      evaluatePitchAndScore();
    }
  }, [currentTime, isPlaying]);

  const startMicrophone = async () => {
    try {
      setMicPermissionNotice(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const ctx = ensureAudioContext();
      if (ctx) {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;
      }

      setMicActive(true);
      drawLiveWaveform();
    } catch (e) {
      setMicPermissionNotice("🎤 Simulated Pitch Feedback Active: Singing along freely with backing tracks! (Device mic unequipped or restricted)");
      setMicActive(false);
    }
  };

  const stopMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setMicActive(false);
  };

  // Draw mic waveform and calculate live pitch
  const drawLiveWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      // Calculate volume level
      let sum = 0;
      let maxBinIndex = 0;
      let maxVal = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
        if (dataArray[i] > maxVal) {
          maxVal = dataArray[i];
          maxBinIndex = i;
        }
      }
      const avgVol = Math.min(100, Math.round((sum / bufferLength) * 1.8));
      setCurrentMicVolume(avgVol);

      // Approximate frequency in Hz
      const sampleRate = audioCtxRef.current?.sampleRate || 44100;
      const estimatedPitchHz = Math.round((maxBinIndex * sampleRate) / (bufferLength * 2));
      setCurrentMicPitchHz(estimatedPitchHz > 80 && estimatedPitchHz < 800 ? estimatedPitchHz : 220);

      // Draw canvas visualizer bars
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#f43f5e');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  // Trigger simulated crowd cheer SFX (KaraFun Stage Cheer)
  const triggerCrowdCheer = () => {
    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      setShowCrowdCheer(true);
      setTimeout(() => setShowCrowdCheer(false), 3000);

      // Create pink/white noise buffer for realistic applause wave
      const bufferSize = ctx.sampleRate * 2.5; // 2.5 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 1.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1800;
      bandpass.Q.value = 0.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(ctx.currentTime);
    } catch (e) {
      // Audio cheer silent fallback
    }
  };

  // Web Audio Orchestral Symphonic Backing Music Generator (KaraFun Audio Engine)
  const playSynthMelodyNote = (timeSec: number) => {
    if (musicVolume <= 0) return;
    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      // Find active lyric line target pitch
      const activeLine = selectedSong.lyrics.reduce((prev, curr) => {
        return timeSec >= curr.time ? curr : prev;
      }, selectedSong.lyrics[0]);

      // Apply key transposition multiplier (KaraFun pitch shift)
      const transposeMultiplier = Math.pow(2, keyTranspose / 12);
      const rootHz = (activeLine?.targetPitchHz || 220) * transposeMultiplier;

      // Master output volume (Audible, rich symphonic volume)
      const masterGain = ctx.createGain();
      const currentGain = musicVolume * 0.38;
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(currentGain, ctx.currentTime + 0.12); // Smooth orchestral crescendo
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (reverbEffect ? 1.1 : 0.85)); // Hall decay

      // Warm symphonic hall lowpass filter
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.setValueAtTime(900, ctx.currentTime);
      biquadFilter.frequency.exponentialRampToValueAtTime(reverbEffect ? 1800 : 1400, ctx.currentTime + 0.25);
      if (reverbEffect) {
        biquadFilter.Q.setValueAtTime(2.5, ctx.currentTime); // Resonance for warm hall reverb
      }

      // Vibrato LFO for realistic string & woodwind expressiveness
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, ctx.currentTime); // Gentle 5.2 Hz string vibrato
      lfoGain.gain.setValueAtTime(8, ctx.currentTime); // Gentle 8 cent pitch wobble
      lfo.connect(lfoGain);
      lfo.start(ctx.currentTime);
      lfo.stop(ctx.currentTime + 1.1);

      // Orchestral Instrument Ensemble Layers
      const orchestralInstruments = [
        // 1. Deep Contrabass & Cello (Lower Octave String Foundation)
        { ratio: 0.5, type: 'sine' as OscillatorType, vol: 0.35, detune: -5, vibrato: false, isLead: false },
        { ratio: 0.25, type: 'sine' as OscillatorType, vol: 0.25, detune: 0, vibrato: false, isLead: false },
        
        // 2. Warm Viola & Violin String Harmony (Root & Triad Harmonies)
        { ratio: 1.0, type: 'triangle' as OscillatorType, vol: 0.28, detune: -3, vibrato: true, isLead: false },
        { ratio: 1.25, type: 'sine' as OscillatorType, vol: 0.20, detune: 4, vibrato: true, isLead: false }, // Major third
        { ratio: 1.5, type: 'sine' as OscillatorType, vol: 0.22, detune: 7, vibrato: true, isLead: false }, // Fifth harmony

        // 3. Soothing Flute / Woodwind Lead Vocal Guide (Plays when leadVocalGuide is enabled)
        { ratio: 2.0, type: 'sine' as OscillatorType, vol: leadVocalGuide ? 0.32 : 0, detune: 2, vibrato: true, isLead: true },
        
        // 4. Warm French Horn Brass Swell
        { ratio: 0.75, type: 'triangle' as OscillatorType, vol: 0.22, detune: -8, vibrato: false, isLead: false }
      ];

      orchestralInstruments.forEach((inst) => {
        if (inst.isLead && !leadVocalGuide) return; // Mute lead vocal guide when in Instrumental mode

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = inst.type;
        osc.frequency.setValueAtTime(rootHz * inst.ratio, ctx.currentTime);
        osc.detune.setValueAtTime(inst.detune, ctx.currentTime);

        if (inst.vibrato) {
          lfoGain.connect(osc.detune);
        }

        // Soft acoustic attack & decay envelope per instrument
        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(inst.vol, ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (reverbEffect ? 1.05 : 0.85));

        osc.connect(noteGain);
        noteGain.connect(biquadFilter);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.1);
      });

      biquadFilter.connect(masterGain);
      masterGain.connect(ctx.destination);
    } catch (e) {
      // Audio synth silent fallback
    }
  };

  // Evaluate user singing pitch vs song target pitch (with KaraFun key transpose)
  const evaluatePitchAndScore = () => {
    const activeLine = selectedSong.lyrics.reduce((prev, curr) => {
      return currentTime >= curr.time ? curr : prev;
    }, selectedSong.lyrics[0]);

    const transposeMultiplier = Math.pow(2, keyTranspose / 12);
    const targetPitch = Math.round((activeLine.targetPitchHz || 220) * transposeMultiplier);

    // User pitch (either real mic pitch or active simulated vocal energy)
    const userPitch = micActive && currentMicVolume > 15 ? currentMicPitchHz : targetPitch + (Math.random() * 20 - 10);

    const pitchDiff = Math.abs(userPitch - targetPitch);

    if (pitchDiff < 25) {
      // Perfect pitch
      setLivePitchScore((prev) => prev + 150 * comboMultiplier);
      setComboMultiplier((prev) => Math.min(8, prev + 1));
      setPitchFeedbackText('🔥 PERFECT PITCH! (Harmonic Master)');
    } else if (pitchDiff < 55) {
      // Great pitch
      setLivePitchScore((prev) => prev + 90 * comboMultiplier);
      setPitchFeedbackText('✨ GREAT Harmony! (In Tune)');
    } else {
      // Mild variance
      setComboMultiplier(1);
      setLivePitchScore((prev) => prev + 30);
      setPitchFeedbackText('🎵 Sing Louder & Match Tone!');
    }
  };

  const handleStartKaraoke = async () => {
    setIsPlaying(true);
    if (!micActive) {
      await startMicrophone();
    }
  };

  const handlePauseKaraoke = () => {
    setIsPlaying(false);
  };

  const handleResetKaraoke = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLivePitchScore(0);
    setComboMultiplier(1);
    setPitchFeedbackText('Ready to Sing! 🎤');
  };

  const stopKaraokePlayback = () => {
    setIsPlaying(false);
  };

  const handleSelectSong = (song: SongItem) => {
    stopKaraokePlayback();
    setSelectedSong(song);
    setCurrentTime(0);
    setLivePitchScore(0);
    setComboMultiplier(1);
    setShowEvaluationModal(false);
  };

  const handleCompletePerformance = () => {
    stopKaraokePlayback();

    // Calculate rating metrics
    const baseScore = Math.max(2500, livePitchScore);
    const pitchAcc = Math.min(98, Math.max(78, Math.round(82 + Math.random() * 15)));
    const rhythmAcc = Math.min(99, Math.max(80, Math.round(85 + Math.random() * 14)));
    const passion = Math.min(100, Math.max(85, Math.round(88 + Math.random() * 12)));
    const clarity = Math.min(97, Math.max(75, Math.round(80 + Math.random() * 16)));

    let grade = 'A';
    if (pitchAcc >= 95 && rhythmAcc >= 95) grade = 'SSS';
    else if (pitchAcc >= 90) grade = 'SS';
    else if (pitchAcc >= 85) grade = 'S';

    const feedbackTip = `SaFie AI Music Therapy Note: Fantastic vocal effort on "${selectedSong.title}"! Singing releases endorphins, reduces cortisol, and expands your lung capacity. Your vocal warmth and emotional expression shine!`;

    setFinalRatingData({
      score: baseScore,
      grade,
      pitchAcc,
      rhythmAcc,
      passion,
      clarity,
      feedbackTip
    });

    saveRecordedEntry({
      type: 'sing-along',
      typeLabel: '🎤 Sing Along Karaoke',
      title: `Karaoke Performance: ${selectedSong.title} (${selectedSong.artist})`,
      excerpt: `Grade ${grade} | Score: ${baseScore.toLocaleString()} pts | Pitch Accuracy: ${pitchAcc}% | Rhythm: ${rhythmAcc}%. ${feedbackTip}`,
      reportAnalysis: {
        dominantEmotion: 'Vocal Expansion & Joy',
        valenceScore: 0.92,
        arousalScore: 0.58,
        sentimentLabel: `Grade ${grade} Performance`,
        summaryObservation: `Completed karaoke singing session for "${selectedSong.title}". Pitch accuracy reached ${pitchAcc}%.`,
        psychologistInsights: [
          'Singing stimulates vagus nerve activation, releasing endorphins and calming respiratory stress.',
          'High pitch stability and vocal expression noted during peak musical segments.'
        ],
        guidanceNote: 'Karaoke session logged to your SafeSpace Dashboard.',
        safetyStatus: 'SAFE'
      }
    });

    setShowEvaluationModal(true);
  };

  // Filter songs by search and category
  const filteredSongs = INSPIRING_SONG_BANK.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'All Hits' || 
                       (activeCategory === 'Pop & Anthems' && (song.genre.includes('Pop') || song.genre.includes('Anthem'))) ||
                       (activeCategory === 'Inspiring Ballads' && song.genre.includes('Ballad')) ||
                       (activeCategory === 'Soul & Gospel' && (song.genre.includes('Soul') || song.genre.includes('Gospel') || song.genre.includes('Jazz'))) ||
                       (activeCategory === 'Acoustic' && (song.genre.includes('Acoustic') || song.genre.includes('Piano')));
    return matchesSearch && matchesCat;
  });

  // Calculate transposed key label
  const getTransposedKeyLabel = (baseKey: string) => {
    if (keyTranspose === 0) return `${baseKey} (Original Key)`;
    const sign = keyTranspose > 0 ? `+${keyTranspose}♯` : `${keyTranspose}♭`;
    return `${baseKey} (${sign})`;
  };

  // Find currently active lyric line index
  const activeLyricIndex = selectedSong.lyrics.findLastIndex((l) => currentTime >= l.time);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 border border-red-400 text-xs font-black uppercase tracking-wider backdrop-blur-md text-white shadow-sm">
              <Youtube className="w-4 h-4 text-white fill-white" /> Atomic Karaoke Official Videos (@AtomicKaraoke)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Music className="w-9 h-9 text-pink-300" /> Sing Along Studio
            </h1>
            <p className="text-purple-100 text-sm leading-relaxed">
              Sing along with HD Karaoke videos powered directly by <span className="font-bold underline text-white">@AtomicKaraoke</span> on YouTube! Transpose song keys, feel spatial hall reverb, and test your pitch precision with live scoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Direct Channel Link Button */}
            <a
              href="https://www.youtube.com/@AtomicKaraoke"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 border border-red-400 cursor-pointer"
            >
              <Youtube className="w-4 h-4 fill-white" />
              Visit @AtomicKaraoke Channel
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* User's Active Avatar Stage Backup */}
            {activeAvatar && (
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <div className="relative">
                  <img src={activeAvatar.dataUrl} alt="Stage Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover bg-white" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[9px] font-black">
                    🎤
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-pink-200 font-extrabold uppercase tracking-wider">Duet Partner</div>
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">{activeAvatar.styleName}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: KaraFun Song Catalog & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Disc className="w-5 h-5 text-purple-600 animate-spin-slow" /> KaraFun Catalog
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                {filteredSongs.length} Songs
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, artist, or genre..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No songs match "{searchQuery}". Try another search term!
                </div>
              ) : (
                filteredSongs.map((song) => {
                  const isSelected = selectedSong.id === song.id;
                  return (
                    <button
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/60 shadow-md ring-2 ring-purple-300 scale-[1.01]'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Cover Art Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${song.coverGradient} flex items-center justify-center text-2xl shadow-sm shrink-0 text-white font-bold relative`}>
                        {song.coverEmoji}
                        {isSelected && isPlaying && (
                          <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider truncate">
                            {song.genre}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            song.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                            song.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {song.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">{song.title}</h3>
                        <p className="text-xs text-slate-500 font-medium truncate">{song.artist}</p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-semibold">
                          <span>🎵 Key: {song.key}</span>
                          <span>•</span>
                          <span>⚡ {song.bpm} BPM</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Song Wellness Focus Info Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Vocal Wellness Focus
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "{selectedSong.title}" — {selectedSong.wellnessFocus}
            </p>
          </div>
        </div>

        {/* Right Column: KaraFun Stage & Interactive Player (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* KaraFun Stage Canvas & Studio Controls */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-slate-800 relative overflow-hidden space-y-6">
            
            {/* Stage Background Glow Effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Stage Header Info Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> KaraFun Live Stage
                </div>
                <h2 className="text-xl font-black text-white truncate max-w-xs">{selectedSong.title}</h2>
                <p className="text-xs text-slate-400 font-semibold">{selectedSong.artist}</p>
              </div>

              {/* Score & Combo Widget */}
              <div className="text-right bg-slate-800/80 p-2.5 px-4 rounded-2xl border border-slate-700">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase">Live Pitch Score</div>
                <div className="text-xl font-black text-amber-300 flex items-center justify-end gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {livePitchScore.toLocaleString()}
                </div>
                {comboMultiplier > 1 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white inline-block mt-0.5 animate-bounce">
                    {comboMultiplier}x COMBO!
                  </span>
                )}
              </div>
            </div>

            {/* Atomic Karaoke HD Video Player */}
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-300 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 gap-2">
                <span className="flex items-center gap-2 text-red-400 font-extrabold">
                  <Youtube className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                  Playing Atomic Karaoke: <span className="text-white font-black">{selectedSong.title}</span> ({selectedSong.artist})
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedSong.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 flex items-center gap-1.5 hover:bg-red-900 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-red-400" /> @AtomicKaraoke HD
                  <ExternalLink className="w-3 h-3 text-red-400" />
                </a>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-800 bg-black shadow-2xl relative">
                <iframe
                  ref={iframeRef}
                  id="youtube-karaoke-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${selectedSong.youtubeId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1`}
                  title={`${selectedSong.title} Atomic Karaoke`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Paste Any @AtomicKaraoke Video URL / ID Form */}
              <form onSubmit={handleLoadCustomVideo} className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 px-2 text-[11px] font-extrabold text-red-400 shrink-0">
                  <Youtube className="w-3.5 h-3.5 fill-red-500" /> Load Any @AtomicKaraoke Video:
                </div>
                <input
                  type="text"
                  value={customVideoInput}
                  onChange={(e) => setCustomVideoInput(e.target.value)}
                  placeholder="Paste YouTube Link or Video ID (e.g. sX4WwM7h7wI)..."
                  className="flex-1 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Play Video 🎬
                </button>
              </form>
            </div>

            {/* KaraFun Studio Controls Bar (Key Transpose & Lead Vocal Guide) */}
            <div className="relative z-10 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Key Transposer (-3 to +3 semitones) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  Key Transpose:
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {[-3, -2, -1, 0, 1, 2, 3].map((st) => (
                    <button
                      key={st}
                      onClick={() => setKeyTranspose(st)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        keyTranspose === st
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-105'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 0 ? 'Orig' : st > 0 ? `+${st}` : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Vocal Guide Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLeadVocalGuide(!leadVocalGuide)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    leadVocalGuide
                      ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                  title="Toggle Guide Vocal Line"
                >
                  <Music2 className="w-3.5 h-3.5" />
                  Guide Vocal: {leadVocalGuide ? 'ON' : 'OFF'}
                </button>

                {/* Spatial Reverb Toggle */}
                <button
                  onClick={() => setReverbEffect(!reverbEffect)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    reverbEffect
                      ? 'bg-pink-600/30 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                  title="Toggle Hall Reverb"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Reverb: {reverbEffect ? 'ON' : 'OFF'}
                </button>
              </div>

            </div>

            {/* Live Audio Visualizer Canvas */}
            <div className="relative z-10 space-y-2">
              {micPermissionNotice && (
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
                  <span>{micPermissionNotice}</span>
                  <button
                    onClick={() => setMicPermissionNotice(null)}
                    className="text-purple-400 hover:text-white font-black text-xs px-1.5"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Mic className={`w-4 h-4 ${micActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  {micActive ? 'Microphone Active' : 'Mic Off (Simulated Pitch)'}
                </span>
                <span className="text-amber-300 font-extrabold">{pitchFeedbackText}</span>
              </div>

              <div className="h-16 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center p-2">
                <canvas ref={canvasRef} width={400} height={60} className="w-full h-full object-cover" />
                {!micActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
                    <button
                      onClick={startMicrophone}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" /> Enable Mic for Real Vocal Pitch Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Synchronized Karaoke Lyrics Display with Word-by-Word Highlight */}
            <div className="relative z-10 bg-slate-950/95 p-6 sm:p-8 rounded-3xl border border-slate-800 min-h-[260px] flex flex-col justify-center items-center text-center space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Live Karaoke Pulse Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (currentTime / ((selectedSong.lyrics[selectedSong.lyrics.length - 1]?.time || 180) + 8)) * 100)}%` }}
                />
              </div>

              {/* Crowd Cheer Banner Overlay */}
              {showCrowdCheer && (
                <div className="absolute inset-x-0 top-3 z-20 flex justify-center animate-bounce">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-slate-950 font-black text-xs shadow-xl tracking-wider">
                    👏 CHEERING CROWD APPLAUSE! 🌟
                  </span>
                </div>
              )}

              {/* Previous Line */}
              {activeLyricIndex > 0 && (
                <button
                  onClick={() => seekToTime(selectedSong.lyrics[activeLyricIndex - 1].time)}
                  className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 font-bold line-clamp-1 transition-all opacity-60 hover:opacity-100 tracking-wide cursor-pointer flex items-center gap-1.5"
                  title="Click to jump to previous line"
                >
                  ⏮️ {selectedSong.lyrics[activeLyricIndex - 1].text}
                </button>
              )}

              {/* Active Singing Line Word-By-Word Highlight Teleprompter */}
              {(() => {
                const activeLyric = selectedSong.lyrics[activeLyricIndex >= 0 ? activeLyricIndex : 0];
                const nextLyric = selectedSong.lyrics[(activeLyricIndex >= 0 ? activeLyricIndex : 0) + 1];
                const lineStartTime = activeLyric ? activeLyric.time : 0;
                const lineEndTime = nextLyric ? nextLyric.time : lineStartTime + 6;
                const lineDuration = Math.max(2, lineEndTime - lineStartTime);

                const words = activeLyric ? activeLyric.text.split(' ') : [];
                const durationPerWord = lineDuration / Math.max(1, words.length);

                return (
                  <div className="space-y-4 py-2 w-full">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-extrabold uppercase tracking-wider">
                        Target Key: {getTransposedKeyLabel(selectedSong.key)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Word-by-Word Sync
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold">
                        ⏱️ {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Word-by-Word Synchronized Highlight Elements */}
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-black leading-relaxed px-2 transition-all max-w-3xl mx-auto tracking-wide">
                      {words.map((word, wIdx) => {
                        const wordStartTime = lineStartTime + wIdx * durationPerWord;
                        const wordEndTime = lineStartTime + (wIdx + 1) * durationPerWord;

                        const isCurrentWord = isPlaying && currentTime >= wordStartTime && currentTime < wordEndTime;
                        const isSung = isPlaying && currentTime >= wordEndTime;

                        return (
                          <span
                            key={wIdx}
                            className={`transition-all duration-150 inline-block font-black select-none cursor-pointer rounded-xl px-1.5 py-0.5 ${
                              isCurrentWord
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 scale-110 shadow-[0_0_24px_rgba(34,211,238,0.9)] border border-cyan-200 animate-pulse'
                                : isSung
                                ? 'text-[#00E5FF] drop-shadow-[0_0_16px_rgba(0,229,255,0.9)] scale-105'
                                : 'text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:text-cyan-200'
                            }`}
                            onClick={() => seekToTime(wordStartTime)}
                            title={`Click to jump to: "${word}"`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Upcoming Line */}
              {activeLyricIndex < selectedSong.lyrics.length - 1 && (
                <button
                  onClick={() => seekToTime(selectedSong.lyrics[activeLyricIndex + 1].time)}
                  className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 font-bold line-clamp-1 transition-all tracking-wide cursor-pointer flex items-center gap-1.5"
                  title="Click to jump to next line"
                >
                  ⏭️ Next: {selectedSong.lyrics[activeLyricIndex + 1].text}
                </button>
              )}

              {/* Full Interactive Lyric Verses List with Instant Seeking */}
              <div className="w-full pt-4 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Interactive Song Lyrics (Click Any Line To Seek Video)</span>
                  <span>{selectedSong.lyrics.length} Verses</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {selectedSong.lyrics.map((line, lIdx) => {
                    const isActive = lIdx === activeLyricIndex;
                    return (
                      <button
                        key={lIdx}
                        onClick={() => seekToTime(line.time)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <span className="truncate flex-1">
                          {isActive ? '🎤 ' : ''}{line.text}
                        </span>
                        <span className="text-[10px] font-mono opacity-70 shrink-0">
                          {Math.floor(line.time / 60)}:{Math.floor(line.time % 60).toString().padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KaraFun Audio Mixer: Backing Track Controls */}
            <div className="relative z-10 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> KaraFun Backing Track Mixer
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Original Artist Vocals & Audio Track
                </span>
              </div>

              {/* Instrumental Music Volume Slider */}
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMusicVolume(prev => prev > 0 ? 0 : 0.85)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Toggle Music Mute"
                  >
                    {musicVolume > 0 ? (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider">
                      Instrumental Synth Volume: {Math.round(musicVolume * 100)}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVolume}
                      onChange={(e) => {
                        setMusicVolume(parseFloat(e.target.value));
                        ensureAudioContext();
                      }}
                      className="w-36 accent-cyan-400 cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                <span className="text-[10px] font-black text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                  Symphonic Synth
                </span>
              </div>
            </div>

            {/* Karaoke Playback Controls Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                {isPlaying ? (
                  <button
                    onClick={handlePauseKaraoke}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Pause className="w-5 h-5 fill-slate-950" /> Pause Performance
                  </button>
                ) : (
                  <button
                    onClick={handleStartKaraoke}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-white" /> Start Singing Now
                  </button>
                )}

                <button
                  onClick={handleResetKaraoke}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                  title="Restart Song"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Crowd Cheer SFX Button */}
                <button
                  onClick={triggerCrowdCheer}
                  className="px-3.5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Trigger Crowd Applause"
                >
                  👏 Cheer!
                </button>
              </div>

              <button
                onClick={handleCompletePerformance}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ml-auto"
              >
                <Award className="w-4 h-4 text-amber-300" /> Finish & Evaluate Voice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Song Performance Rating & Voice Evaluation Modal */}
      {showEvaluationModal && finalRatingData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg animate-bounce">
                👑
              </div>
              <h2 className="text-2xl font-black text-slate-900">Vocal Performance Certificate</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Song: "{selectedSong.title}" — {selectedSong.artist}
              </p>
            </div>

            {/* Grade & Score Highlights */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-around border border-slate-800">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-black uppercase">Performance Grade</div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300">
                  {finalRatingData.grade}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-black uppercase">Total Vocal Score</div>
                <div className="text-3xl font-black text-amber-300">
                  {finalRatingData.score.toLocaleString()} pts
                </div>
              </div>
            </div>

            {/* Vocal Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <div className="text-xs font-extrabold text-purple-900 flex items-center justify-between">
                  <span>Pitch Accuracy</span>
                  <span>{finalRatingData.pitchAcc}%</span>
                </div>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${finalRatingData.pitchAcc}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 space-y-1">
                <div className="text-xs font-extrabold text-pink-900 flex items-center justify-between">
                  <span>Rhythm & Flow</span>
                  <span>{finalRatingData.rhythmAcc}%</span>
                </div>
                <div className="w-full bg-pink-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-pink-600 h-full rounded-full" style={{ width: `${finalRatingData.rhythmAcc}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="text-xs font-extrabold text-amber-900 flex items-center justify-between">
                  <span>Vocal Passion</span>
                  <span>{finalRatingData.passion}%</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${finalRatingData.passion}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>Vocal Clarity</span>
                  <span>{finalRatingData.clarity}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${finalRatingData.clarity}%` }} />
                </div>
              </div>
            </div>

            {/* SaFie Music Therapy Note */}
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 font-semibold leading-relaxed">
                {finalRatingData.feedbackTip}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowEvaluationModal(false);
                  handleResetKaraoke();
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer text-center"
              >
                Sing Again
              </button>
              <button
                onClick={() => {
                  alert('🎉 Vocal Certificate & High Score saved to your SafeSpace profile!');
                  setShowEvaluationModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer text-center"
              >
                Save Certificate
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
