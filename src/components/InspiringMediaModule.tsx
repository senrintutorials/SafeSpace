import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Quote, Video, Mic, Headphones, Sparkles, Plus, Heart, Share2, 
  Download, Play, Pause, Volume2, VolumeX, Bookmark, Search, Filter, 
  CheckCircle2, Image as ImageIcon, Music, Palette, Layers, Send, Star, 
  Eye, X, ChevronRight, Clock, User, Copy, Check, MessageSquare, Book, Sparkle, ArrowRight, RefreshCw, Wand2,
  Camera, VideoOff, MicOff, StopCircle, RotateCcw, Volume1, PlayCircle, FastForward, Rewind, MessageCircle,
  Maximize, SkipBack, SkipForward, Subtitles, ExternalLink, ListVideo
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';

interface InspiringMediaModuleProps {
  currentUser?: UserProfile;
  onNavigateToDashboard?: () => void;
}

// TYPES
export type MediaCategory = 'all' | 'quotes' | 'videos' | 'playlists' | 'podcasts' | 'books' | 'my-creations' | 'creator';

export interface QuoteImageItem {
  id: string;
  quote: string;
  author: string;
  category: 'Resilience' | 'Peace & Calm' | 'Self-Love' | 'Hope' | 'Growth';
  bgGradient: string;
  textColor: string;
  bgPattern: string;
  likes: number;
}

export interface VideoItem {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
  youtubeUrl?: string;
  watchUrl?: string;
  summary: string;
  takeaways: string[];
  isPlaylist?: boolean;
}

export interface PodcastItem {
  id: string;
  title: string;
  host: string;
  episodeNumber: number;
  duration: string;
  category: string;
  audioUrl: string;
  youtubeUrl?: string;
  watchUrl?: string;
  summary: string;
  keyInsights: string[];
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  pages: number;
  genre: string;
  rating: number;
  coverGradient: string;
  coverIcon: string;
  summary: string;
  keyLesson: string;
  sampleExcerpt: string;
}

export interface CustomMixedMedia {
  id: string;
  title: string;
  quote: string;
  author: string;
  bgGradient: string;
  fontStyle: 'serif' | 'sans' | 'script' | 'bold';
  badge: string;
  ambientMood: string;
  recordedVideoUrl?: string;
  recordedAudioUrl?: string;
  createdAt: string;
  likes: number;
}

export interface MediaComment {
  id: string;
  author: string;
  avatarBg: string;
  text: string;
  time: string;
  likes: number;
}

// SAMPLE DATA
const SAMPLE_QUOTES: QuoteImageItem[] = [
  {
    id: 'q-1',
    quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
    category: "Peace & Calm",
    bgGradient: "from-blue-600 via-indigo-600 to-purple-700",
    textColor: "text-white",
    bgPattern: "radial",
    likes: 342,
  },
  {
    id: 'q-2',
    quote: "Rock bottom became the solid foundation on which I rebuilt my life.",
    author: "J.K. Rowling",
    category: "Resilience",
    bgGradient: "from-amber-500 via-rose-500 to-indigo-600",
    textColor: "text-white",
    bgPattern: "mesh",
    likes: 518,
  },
  {
    id: 'q-3',
    quote: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "Peace & Calm",
    bgGradient: "from-emerald-500 via-teal-600 to-cyan-700",
    textColor: "text-white",
    bgPattern: "waves",
    likes: 289,
  },
  {
    id: 'q-4',
    quote: "Talk to yourself like you would to someone you love.",
    author: "Brené Brown",
    category: "Self-Love",
    bgGradient: "from-pink-500 via-rose-500 to-purple-600",
    textColor: "text-white",
    bgPattern: "dots",
    likes: 412,
  },
  {
    id: 'q-5',
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Hope",
    bgGradient: "from-indigo-900 via-slate-900 to-purple-950",
    textColor: "text-amber-200",
    bgPattern: "stars",
    likes: 625,
  },
  {
    id: 'q-6',
    quote: "Growth is painful. Change is painful. But nothing is as painful as staying stuck where you don't belong.",
    author: "Mandy Hale",
    category: "Growth",
    bgGradient: "from-teal-600 via-emerald-600 to-slate-800",
    textColor: "text-white",
    bgPattern: "radial",
    likes: 380,
  },
];

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'v-1',
    title: '5 Minutes to Reset Your Nervous System (Somatic Breathwork)',
    speaker: 'SafeSpace Grounding Series',
    duration: '5 mins',
    category: 'Anxiety & Panic Relief',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/bcKTPbF0STo',
    watchUrl: 'https://www.youtube.com/watch?v=bcKTPbF0STo',
    summary: 'A fast guided somatic grounding practice utilizing 4-7-8 box breathing and vagus nerve stimulation to immediately ease physical panic and heart palpitations.',
    takeaways: [
      'Inhale slowly for 4 seconds through your nose.',
      'Hold gently for 7 seconds to balance blood oxygen levels.',
      'Exhale completely for 8 seconds through your mouth to trigger vagal calm.'
    ]
  },
  {
    id: 'v-2',
    title: 'The Power of Vulnerability & Emotional Courage',
    speaker: 'Dr. Brené Brown (TED Talk)',
    duration: '20 mins',
    category: 'Self-Love & Healing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/iCvmsMzlF7o',
    watchUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    summary: 'Renowned researcher Brené Brown explores vulnerability as the true origin of connection, empathy, self-worth, and authentic belonging.',
    takeaways: [
      'Vulnerability is not weakness; it is our most accurate measure of courage.',
      'To feel deep connection, we must allow ourselves to be truly seen.',
      'Practicing self-compassion protects us from perfectionism and shame.'
    ]
  },
  {
    id: 'v-3',
    title: 'How to Stop Overthinking & Silence Intrusive Thoughts',
    speaker: 'Mel Robbins',
    duration: '14 mins',
    category: 'Mental Clarity',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/kmSinPMVU2U',
    watchUrl: 'https://www.youtube.com/watch?v=kmSinPMVU2U',
    summary: 'Learn actionable neuro-hacks and cognitive reframing techniques to interrupt runaway worry loops before they spiral into anxiety.',
    takeaways: [
      'Use the 5-second countdown rule to interrupt cognitive worry spirals.',
      'Name your anxious thoughts as mental weather that will naturally pass.',
      'Shift your focus from "What if it fails?" to "What if it works out?"'
    ]
  },
  {
    id: 'v-4',
    title: '3-Minute Emergency Grounding for Acute Panic & Stress',
    speaker: 'Mindful Wellness Practice',
    duration: '3 mins',
    category: 'Anxiety & Panic Relief',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/ExEXOfe81Nc',
    watchUrl: 'https://www.youtube.com/watch?v=ExEXOfe81Nc',
    summary: 'An emergency somatic reset combining 5-4-3-2-1 sensory orientation and double-inhale physiological sighs for immediate relief.',
    takeaways: [
      'Identify 5 visible objects, 4 physical textures, 3 ambient sounds, 2 scents, and 1 taste.',
      'Take two quick inhales through nose followed by a long sigh exhale.',
      'Remind yourself: "I am safe right here in this present moment."'
    ]
  },
  {
    id: 'v-5',
    title: 'Managing Academic Stress, ADHD & Exam Anxiety',
    speaker: 'Dr. Julie Smith',
    duration: '12 mins',
    category: 'Academic & Focus',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/7ZPYWFPQL5g',
    watchUrl: 'https://www.youtube.com/watch?v=7ZPYWFPQL5g',
    summary: 'Clinical advice tailored for students and young adults handling academic burnout, exam jitters, and focus fatigue.',
    takeaways: [
      'Break daunting assignments into 15-minute bite-sized micro-tasks.',
      'Separate self-worth from test scores or external academic metrics.',
      'Take 5-minute movement breaks between study blocks.'
    ]
  },
  {
    id: 'v-6',
    title: 'Self-Compassion: The Secret to Quiet Your Inner Critic',
    speaker: 'Dr. Kristin Neff',
    duration: '16 mins',
    category: 'Self-Love & Healing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/xEb8KVAwy3M',
    watchUrl: 'https://www.youtube.com/watch?v=xEb8KVAwy3M',
    summary: 'Dr. Kristin Neff presents the three core components of self-compassion: self-kindness, common humanity, and mindfulness.',
    takeaways: [
      'Treat yourself with the same gentle patience you give a close friend.',
      'Remember that struggle and imperfection are part of the human journey.',
      'Place a comforting hand over your chest when experiencing grief.'
    ]
  },
  {
    id: 'v-7',
    title: 'Deep Sleep Guided Relaxation & Muscle Release',
    speaker: 'Nocturnal Calm Institute',
    duration: '22 mins',
    category: 'Sleep & Rest',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/z2FdMogMVdA',
    watchUrl: 'https://www.youtube.com/watch?v=z2FdMogMVdA',
    summary: 'Soothing evening body scan meditation guiding your mind away from nocturnal worries into deep, restorative sleep.',
    takeaways: [
      'Progressively tense and release forehead, jaw, shoulders, and feet.',
      'Allow thoughts to float away like peaceful leaves on a stream.',
      'Breathe slowly with extended soft exhales.'
    ]
  },
  {
    id: 'v-8',
    title: 'Emotional Resilience & Overcoming Hardship',
    speaker: 'Dr. Resilience Science',
    duration: '18 mins',
    category: 'Growth & Resilience',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/3-s0UIYc66U',
    watchUrl: 'https://www.youtube.com/watch?v=3-s0UIYc66U',
    summary: 'Discover how to cultivate emotional stamina, reframe setbacks, and bounce back stronger during times of upheaval.',
    takeaways: [
      'Resilience is a skill built through daily practice, not an inherent trait.',
      'Focus on what you can control while accepting what you cannot.',
      'Reach out to trusted mentors and peer support networks.'
    ]
  }
];

const SAMPLE_PLAYLISTS: VideoItem[] = [
  {
    id: 'pl-1',
    title: 'Mindfulness & Guided Meditation Series',
    speaker: 'Mindful Practice Channel',
    duration: 'Full Playlist Series',
    category: 'Guided Meditations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/z-IR48Mb3W0?list=PLJicmE8fK0EgFqcHoA4ufzsPD6VQThV5S',
    watchUrl: 'https://www.youtube.com/watch?v=z-IR48Mb3W0&list=PLJicmE8fK0EgFqcHoA4ufzsPD6VQThV5S',
    summary: 'A curated playlist of guided meditations, breathing practices, and somatic grounding routines for daily peace and anxiety relief.',
    takeaways: [
      'Access multiple guided sessions in sequence.',
      'Includes short 5-minute resets and full 20-minute meditations.',
      'Perfect for daily morning and evening wellness routines.'
    ],
    isPlaylist: true
  },
  {
    id: 'pl-2',
    title: 'Deep Calm Soundscapes & Soothing Ambient Music',
    speaker: 'Ambient Wellness Station',
    duration: 'Continuous Radio',
    category: 'Soundscapes & Radio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/tPMFAbhlDbU?list=RDEMjC2J7G6Brgc5YaVgKJR4fw',
    watchUrl: 'https://www.youtube.com/watch?v=tPMFAbhlDbU&list=RDEMjC2J7G6Brgc5YaVgKJR4fw',
    summary: 'Non-stop soothing ambient music, soft acoustic harmonies, and relaxing atmospheric soundscapes for studying or deep rest.',
    takeaways: [
      'Continuous soothing music without interruption.',
      'Helps lower stress hormone cortisol during intense work or study.',
      'Ideal background audio for journaling and meditation.'
    ],
    isPlaylist: true
  },
  {
    id: 'pl-3',
    title: 'Emotional Resilience & Stress Mastery Playlist',
    speaker: 'Wellness & Healing Collection',
    duration: 'Curated Playlist',
    category: 'Emotional Resilience',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/O08_VpUfNUk?list=PLrjo8kFr6wuyzLWEeqAGc6KMPWSWQsYy7',
    watchUrl: 'https://www.youtube.com/watch?v=O08_VpUfNUk&list=PLrjo8kFr6wuyzLWEeqAGc6KMPWSWQsYy7',
    summary: 'Comprehensive video playlist focusing on emotional regulation, overcoming anxiety, and building unshakeable confidence.',
    takeaways: [
      'Explore multi-speaker insights on emotional intelligence.',
      'Practical tools for handling panic, burnout, and emotional fatigue.',
      'Actionable advice for healthy boundaries and self-care.'
    ],
    isPlaylist: true
  },
  {
    id: 'pl-4',
    title: 'Official SafeSpace Mindful Channel Uploads',
    speaker: 'SafeSpace Wellness Channel',
    duration: 'Channel Uploads',
    category: 'Official Channel Playlist',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/videoseries?list=UUMOlHVl2N3jPEbkNJVx-ItQIQ',
    watchUrl: 'https://www.youtube.com/playlist?list=UUMOlHVl2N3jPEbkNJVx-ItQIQ',
    summary: 'Official continuous uploads playlist featuring guided meditations, mental health masterclasses, and mindfulness practices.',
    takeaways: [
      'Access all official channel uploads in a continuous stream.',
      'Automatically updated with newly added video guides.',
      'High quality audio-visual somatic and breathing exercises.'
    ],
    isPlaylist: true
  }
];

const SAMPLE_PODCASTS: PodcastItem[] = [
  {
    id: 'p-1',
    title: 'Ep 01: How to Stop Overthinking & Master Your Mind',
    host: 'Dr. Julie Smith / Mindset Podcast',
    episodeNumber: 1,
    duration: '16 mins',
    category: 'Overthinking & Mindset',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_01.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/tLRCS48Ens4',
    watchUrl: 'https://www.youtube.com/watch?v=tLRCS48Ens4',
    summary: 'An inspiring audio episode on interrupting negative thought loops, untangling intrusive worries, and restoring mental clarity.',
    keyInsights: [
      'Recognize that thoughts are mental events, not objective facts.',
      'Use somatic grounding to step out of high-velocity worry loops.',
      'Practice 5-minute cognitive check-ins during moments of distress.'
    ]
  },
  {
    id: 'p-2',
    title: 'Ep 02: Rewiring Your Brain for Calmness & Anxiety Relief',
    host: 'Huberman Lab / Neuroscience & Mindful Living',
    episodeNumber: 2,
    duration: '20 mins',
    category: 'Neuroscience & Calm',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_02.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/dDaqsLS25DA',
    watchUrl: 'https://www.youtube.com/watch?v=dDaqsLS25DA',
    summary: 'Discover how daily neuroplasticity exercises, physiological sighs, and slow exhales shift your nervous system into restful calm.',
    keyInsights: [
      'Daily 10-minute mindfulness shifts amygdala reactivity over time.',
      'Double inhales followed by long mouth exhales stimulate vagal tone.',
      'Consistency builds long-term neural pathways for peace.'
    ]
  },
  {
    id: 'p-3',
    title: 'Ep 03: Self-Compassion & Healing Emotional Burnout',
    host: 'Dr. Kristin Neff / Healing Thoughts Podcast',
    episodeNumber: 3,
    duration: '24 mins',
    category: 'Self-Care & Healing',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_03.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/BJITXsmXeZg',
    watchUrl: 'https://www.youtube.com/watch?v=BJITXsmXeZg',
    summary: 'A comforting podcast on honoring your emotional limits, healing from burnout, and speaking softly to yourself.',
    keyInsights: [
      'Rest is an essential human requirement, not a reward for productivity.',
      'Replace harsh self-judgment with curious, compassionate self-inquiry.',
      'Celebrate small daily steps of self-preservation.'
    ]
  },
  {
    id: 'p-4',
    title: 'Ep 04: How to Quiet a Racing Mind Before Sleep',
    host: 'Dr. Andrew Huberman',
    episodeNumber: 4,
    duration: '18 mins',
    category: 'Sleep & Relaxation',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_04.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/nm1gR-Jp3p0',
    watchUrl: 'https://www.youtube.com/watch?v=nm1gR-Jp3p0',
    summary: 'Practical light hygiene, physiological sighs, and cognitive shuffle techniques to calm nocturnal anxiety and drift off into sleep.',
    keyInsights: [
      'Do two quick inhales through the nose followed by an extended mouth exhale.',
      'Dim overhead lights 1 hour before sleeping.',
      'Avoid checking notification feeds while lying in bed.'
    ]
  },
  {
    id: 'p-5',
    title: 'Ep 05: Navigating Friendships, Boundaries & Social Battery',
    host: 'Nedra Glover Tawwab',
    episodeNumber: 5,
    duration: '22 mins',
    category: 'Relationships & Boundaries',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_01.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/86YLFOog4GM',
    watchUrl: 'https://www.youtube.com/watch?v=86YLFOog4GM',
    summary: 'Setting gentle, healthy boundaries with peers, family, and social media without guilt or fear of rejection.',
    keyInsights: [
      'Clear is kind: Communicate needs calmly without over-explaining.',
      'It is okay to take quiet days when your social battery is low.',
      'Boundaries preserve relationships rather than destroying them.'
    ]
  },
  {
    id: 'p-6',
    title: 'Ep 06: Turning Stress into Fuel for Focus & Resilience',
    host: 'Dr. Kelly McGonigal',
    episodeNumber: 6,
    duration: '15 mins',
    category: 'Stress Mastery',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_02.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/inpok4MKVLM',
    watchUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    summary: 'Re-evaluating the stress response as your body energizing you to meet a meaningful challenge rather than a harmful reaction.',
    keyInsights: [
      'A pounding heart prepares your brain with oxygen and alertness.',
      'Oxytocin released during stress encourages seeking support.',
      'Focusing on what matters transforms threat into challenge.'
    ]
  },
  {
    id: 'p-7',
    title: 'Ep 07: Daily Morning Mindset & Mindful Habits',
    host: 'Jay Shetty / On Purpose',
    episodeNumber: 7,
    duration: '19 mins',
    category: 'Growth & Habits',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_03.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/tLRCS48Ens4',
    watchUrl: 'https://www.youtube.com/watch?v=tLRCS48Ens4',
    summary: 'Inspirational guidance on setting morning intentions, building mental clarity, and cultivating daily gratitude.',
    keyInsights: [
      'Start your day with 3 minutes of gratitude before opening social feeds.',
      'Focus on internal purpose rather than external validation.',
      'Small daily habits compound into massive emotional resilience.'
    ]
  },
  {
    id: 'p-8',
    title: 'Ep 08: Overcoming Imposter Syndrome & Fear of Failure',
    host: 'The Mindful Youth Podcast',
    episodeNumber: 8,
    duration: '17 mins',
    category: 'Self-Esteem & Confidence',
    audioUrl: 'https://ia800201.us.archive.org/24/items/GuidedMeditation_201602/Guided_Meditation_04.mp3',
    youtubeUrl: 'https://www.youtube-nocookie.com/embed/dDaqsLS25DA',
    watchUrl: 'https://www.youtube.com/watch?v=dDaqsLS25DA',
    summary: 'A supportive audio session exploring why high achievers feel like frauds and how to embrace self-worth.',
    keyInsights: [
      'Imposter feelings often mean you are stepping into new growth.',
      'Keep a "wins & gratitude journal" to remind yourself of achievements.',
      'Failure is feedback, not a reflection of your identity.'
    ]
  }
];

const SAMPLE_BOOKS: BookItem[] = [
  {
    id: 'b-1',
    title: 'The Boy, the Mole, the Fox and the Horse',
    author: 'Charlie Mackesy',
    pages: 128,
    genre: 'Illustrated Wisdom & Healing',
    rating: 4.9,
    coverGradient: 'from-amber-600 via-orange-500 to-amber-700',
    coverIcon: 'Heart',
    summary: 'A heartwarming journey of four unlikely friends exploring life\'s important lessons: kindness, hope, friendship, and vulnerability.',
    keyLesson: '"Asking for help isn\'t giving up," said the horse. "It\'s refusing to give up."',
    sampleExcerpt: '"What is the bravest thing you\'ve ever said?" asked the boy. "Help," said the horse. "Asking for help isn\'t giving up, it\'s refusing to give up."\n\n"Nothing beats kindness," said the horse. "It sits quietly behind all things."'
  },
  {
    id: 'b-2',
    title: 'Man\'s Search for Meaning',
    author: 'Viktor E. Frankl',
    pages: 165,
    genre: 'Psychology & Existential Hope',
    rating: 4.8,
    coverGradient: 'from-slate-800 via-indigo-900 to-blue-950',
    coverIcon: 'Sparkles',
    summary: 'Psychiatrist Viktor Frankl\'s memoir of survival in concentration camps, detailing how finding purpose enables humans to endure any obstacle.',
    keyLesson: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    sampleExcerpt: 'Everything can be taken from a man but one thing: the last of the human freedoms—to choose one\'s attitude in any given set of circumstances, to choose one\'s own way.\n\nThose who have a \'why\' to live, can bear with almost any \'how\'.'
  },
  {
    id: 'b-3',
    title: 'Atomic Habits for Young Adults',
    author: 'James Clear',
    pages: 280,
    genre: 'Personal Growth & Habits',
    rating: 4.9,
    coverGradient: 'from-blue-600 via-cyan-600 to-teal-700',
    coverIcon: 'BookOpen',
    summary: 'An easy, proven framework for improving 1% every day through tiny habits, environment design, and identity-based change.',
    keyLesson: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    sampleExcerpt: 'Habits are the compound interest of self-improvement. Getting 1 percent better every day counts for a lot in the long-run.\n\nFocus on who you want to become, rather than what you want to achieve.'
  },
  {
    id: 'b-4',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    pages: 208,
    genre: 'Inspirational Fiction',
    rating: 4.7,
    coverGradient: 'from-amber-500 via-yellow-600 to-amber-700',
    coverIcon: 'Compass',
    summary: 'The enchanting story of Santiago, an Andalusian shepherd boy who journeys to the Egyptian desert in search of a treasure and learns to listen to his heart.',
    keyLesson: 'When you want something, all the universe conspires in helping you to achieve it.',
    sampleExcerpt: 'It\'s the possibility of having a dream come true that makes life interesting.\n\nWhen we strive to become better than we are, everything around us becomes better too.'
  },
  {
    id: 'b-5',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    pages: 390,
    genre: 'Nature, Gratitude & Healing',
    rating: 4.9,
    coverGradient: 'from-emerald-700 via-teal-800 to-green-900',
    coverIcon: 'Trees',
    summary: 'An indigenous botanist shows how plants and animals offer us gifts and lessons, calling us to a deeper reciprocal relationship with the Earth.',
    keyLesson: 'Even a speck of dirt is a place where small miracles occur.',
    sampleExcerpt: 'In indigenous ways of knowing, it is understood that if we take care of the land, the land will take care of us. Gratitude is the foundation of balance.'
  },
  {
    id: 'b-6',
    title: 'Grit: The Power of Passion and Perseverance',
    author: 'Angela Duckworth',
    pages: 352,
    genre: 'Resilience & Motivation',
    rating: 4.6,
    coverGradient: 'from-rose-600 via-purple-700 to-indigo-800',
    coverIcon: 'Shield',
    summary: 'Psychologist Angela Duckworth shows that the secret to outstanding achievement is not talent, but a special blend of passion and long-term persistence.',
    keyLesson: 'Enthusiasm is common. Endurance is rare.',
    sampleExcerpt: 'Our potential is one thing. What we do with it is another. Passion and perseverance for long-term goals is what truly transforms lives over time.'
  }
];

const CREATOR_GRADIENTS = [
  { id: 'sunset', name: 'Sunset Warmth', class: 'from-amber-500 via-rose-500 to-indigo-600', textClass: 'text-white' },
  { id: 'ocean', name: 'Deep Ocean Calm', class: 'from-cyan-600 via-blue-700 to-indigo-900', textClass: 'text-white' },
  { id: 'emerald', name: 'Emerald Forest', class: 'from-emerald-600 via-teal-700 to-slate-900', textClass: 'text-white' },
  { id: 'cosmic', name: 'Cosmic Twilight', class: 'from-purple-900 via-indigo-950 to-slate-900', textClass: 'text-amber-200' },
  { id: 'rose', name: 'Soft Rose Blossom', class: 'from-pink-500 via-rose-500 to-purple-600', textClass: 'text-white' },
  { id: 'sunburst', name: 'Golden Hope', class: 'from-amber-400 via-orange-500 to-red-600', textClass: 'text-white' }
];

const CREATOR_BADGES = ['✨ Hope', '🌸 Inner Peace', '⚡ Inner Strength', '🌊 Mindful Flow', '☀️ Daily Sunshine', '🍃 Resilience'];

const INITIAL_COMMENTS: Record<string, MediaComment[]> = {
  'q-1': [
    { id: 'c1', author: 'Maya S.', avatarBg: 'bg-emerald-500', text: 'This quote helped me slow down my breathing during today’s exam!', time: '10 mins ago', likes: 4 },
    { id: 'c2', author: 'Counselor Rita', avatarBg: 'bg-purple-500', text: 'Remembering that we are the observer of our thoughts, not slave to them, is true freedom.', time: '1 hour ago', likes: 8 }
  ],
  'v-1': [
    { id: 'c3', author: 'Jordan K.', avatarBg: 'bg-blue-500', text: 'Adding "YET" to my daily vocabulary completely changed my study mindset!', time: '25 mins ago', likes: 6 }
  ],
  'p-1': [
    { id: 'c4', author: 'Elena V.', avatarBg: 'bg-indigo-500', text: 'The double inhale physiological sigh actually worked for my insomnia last night!', time: '3 hours ago', likes: 11 }
  ],
  'b-1': [
    { id: 'c5', author: 'Sam T.', avatarBg: 'bg-amber-500', text: '"Asking for help is refusing to give up" - favorite line in modern literature!', time: '4 hours ago', likes: 15 }
  ]
};

export default function InspiringMediaModule({ currentUser, onNavigateToDashboard }: InspiringMediaModuleProps) {
  const [activeTab, setActiveTab] = useState<MediaCategory>('all');
  
  // Favorites / Saved state
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(['q-1', 'b-1', 'v-1']));
  const [bookmarkedBookIds, setBookmarkedBookIds] = useState<Set<string>>(new Set(['b-1', 'b-3']));

  // Media Modals
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [activeBookModal, setActiveBookModal] = useState<BookItem | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // Video Player Detailed State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSourceMode, setVideoSourceMode] = useState<'youtube' | 'mp4' | 'voice'>('mp4');
  const [videoVolume, setVideoVolume] = useState<number>(0.9);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState<number>(1.0);
  const [showVideoCaptions, setShowVideoCaptions] = useState<boolean>(true);
  const [isVideoSpeakerNarrating, setIsVideoSpeakerNarrating] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Audio Podcast Player state
  const [activePodcast, setActivePodcast] = useState<PodcastItem | null>(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState<boolean>(false);
  const [podcastVolume, setPodcastVolume] = useState<number>(0.8);
  const [isPodcastMuted, setIsPodcastMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [podcastCurrentTime, setPodcastCurrentTime] = useState<number>(0);
  const [podcastDuration, setPodcastDuration] = useState<number>(0);
  const [isHostVoiceNarrator, setIsHostVoiceNarrator] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<any>(null);

  // Speech Narrator Helper for Podcasts & Videos
  const speakNarrator = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  const stopNarrator = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  };

  // Comment Section State for each item
  const [commentsMap, setCommentsMap] = useState<Record<string, MediaComment[]>>(INITIAL_COMMENTS);
  const [expandedCommentsMap, setExpandedCommentsMap] = useState<Record<string, boolean>>({});
  const [newCommentInputs, setNewCommentInputs] = useState<Record<string, string>>({});

  // Custom Mixed Media Creator State
  const [customTitle, setCustomTitle] = useState<string>('My Morning Affirmation');
  const [customQuote, setCustomQuote] = useState<string>('I am capable of handling whatever today brings with grace and calm focus.');
  const [customAuthor, setCustomAuthor] = useState<string>(currentUser ? currentUser.fullName : 'Mindful Me');
  const [selectedGradient, setSelectedGradient] = useState(CREATOR_GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = useState<'serif' | 'sans' | 'script' | 'bold'>('serif');
  const [selectedBadge, setSelectedBadge] = useState<string>('✨ Hope');
  const [selectedAmbientMood, setSelectedAmbientMood] = useState<string>('Soft Piano & Birdsong');

  // Video Recording State in Creator
  const [isVideoRecording, setIsVideoRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoRecordTime, setVideoRecordTime] = useState<number>(0);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoLiveStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoTimerRef = useRef<any>(null);

  // Voice Recording State in Creator
  const [isAudioRecording, setIsAudioRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioRecordTime, setAudioRecordTime] = useState<number>(0);
  const audioMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioLiveStreamRef = useRef<MediaStream | null>(null);
  const audioTimerRef = useRef<any>(null);

  const [myCreatedMediaList, setMyCreatedMediaList] = useState<CustomMixedMedia[]>([
    {
      id: 'my-1',
      title: 'Daily Strength Reminder',
      quote: 'Breathe through the moment. Tomorrow is a fresh canvas waiting for your colors.',
      author: currentUser ? currentUser.fullName : 'Alex',
      bgGradient: 'from-amber-500 via-rose-500 to-indigo-600',
      fontStyle: 'serif',
      badge: '🌸 Inner Peace',
      ambientMood: 'Ocean Breeze',
      createdAt: '2 hours ago',
      likes: 12
    }
  ]);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [showCreatedSuccessBanner, setShowCreatedSuccessBanner] = useState<boolean>(false);

  // Audio Podcast live sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = podcastVolume;
    }
  }, [playbackSpeed, podcastVolume]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (videoLiveStreamRef.current) {
        videoLiveStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioLiveStreamRef.current) {
        audioLiveStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, []);

  // Toggle Favorites
  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle Bookmarks
  const toggleBookmarkBook = (id: string) => {
    setBookmarkedBookIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy Quote to Clipboard
  const handleCopyQuote = (quoteText: string, authorText: string, id: string) => {
    navigator.clipboard.writeText(`"${quoteText}" — ${authorText}`);
    setCopiedQuoteId(id);
    setTimeout(() => setCopiedQuoteId(null), 2500);
  };

  // Toggle Comment Box
  const toggleCommentsFor = (itemId: string) => {
    setExpandedCommentsMap(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Submit New Comment
  const handleAddComment = (itemId: string) => {
    const text = (newCommentInputs[itemId] || '').trim();
    if (!text) return;

    const newComment: MediaComment = {
      id: `comment-${Date.now()}`,
      author: currentUser ? currentUser.fullName : 'Mindful Peer',
      avatarBg: 'bg-indigo-600',
      text,
      time: 'Just now',
      likes: 1
    };

    setCommentsMap(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newComment]
    }));

    setNewCommentInputs(prev => ({ ...prev, [itemId]: '' }));
  };

  // Start Webcam Video Recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoLiveStreamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      const mediaRecorder = new MediaRecorder(stream);
      videoMediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        if (videoLiveStreamRef.current) {
          videoLiveStreamRef.current.getTracks().forEach(t => t.stop());
          videoLiveStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsVideoRecording(true);
      setVideoRecordTime(0);

      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      videoTimerRef.current = setInterval(() => {
        setVideoRecordTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera or microphone. Please ensure camera and microphone permissions are enabled.');
    }
  };

  // Stop Webcam Video Recording
  const stopVideoRecording = () => {
    if (videoMediaRecorderRef.current && isVideoRecording) {
      videoMediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    }
  };

  // Start Microphone Voice Recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioLiveStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      audioMediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        if (audioLiveStreamRef.current) {
          audioLiveStreamRef.current.getTracks().forEach(t => t.stop());
          audioLiveStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsAudioRecording(true);
      setAudioRecordTime(0);

      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      audioTimerRef.current = setInterval(() => {
        setAudioRecordTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Unable to access microphone. Please check microphone permissions in your browser.');
    }
  };

  // Stop Microphone Voice Recording
  const stopAudioRecording = () => {
    if (audioMediaRecorderRef.current && isAudioRecording) {
      audioMediaRecorderRef.current.stop();
      setIsAudioRecording(false);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
  };

  // Handle Create Custom Mixed Media
  const handleSaveCustomMedia = () => {
    if (!customQuote.trim()) return;
    const newMedia: CustomMixedMedia = {
      id: `my-${Date.now()}`,
      title: customTitle.trim() || 'Untitled Inspiration',
      quote: customQuote.trim(),
      author: customAuthor.trim() || 'Anonymous',
      bgGradient: selectedGradient.class,
      fontStyle: selectedFont,
      badge: selectedBadge,
      ambientMood: selectedAmbientMood,
      recordedVideoUrl: recordedVideoUrl || undefined,
      recordedAudioUrl: recordedAudioUrl || undefined,
      createdAt: 'Just now',
      likes: 1
    };
    setMyCreatedMediaList([newMedia, ...myCreatedMediaList]);

    saveRecordedEntry({
      type: 'inspiring-media',
      typeLabel: '✨ Inspiring Media Hub',
      title: `Inspiring Media Card: ${newMedia.title}`,
      excerpt: `"${newMedia.quote}" — ${newMedia.author}. Created custom visual inspiration card with ${newMedia.ambientMood} theme.`,
      mediaUrl: recordedVideoUrl || recordedAudioUrl || undefined,
      reportAnalysis: {
        dominantEmotion: 'Informed Inspiration & Hope',
        valenceScore: 0.90,
        arousalScore: 0.42,
        sentimentLabel: 'High Cognitive Reinforcement',
        summaryObservation: `User designed and saved a custom mixed-media quote card ("${newMedia.title}").`,
        psychologistInsights: [
          'Creating and curating inspiring media cards strengthens cognitive reframing pathways.',
          'Active creation promotes emotional self-regulation and positive mindset alignment.'
        ],
        guidanceNote: 'Inspiring media card saved to "My Creations" and logged in your Dashboard history.',
        safetyStatus: 'SAFE'
      }
    });

    setShowCreatedSuccessBanner(true);
    setTimeout(() => setShowCreatedSuccessBanner(false), 4000);
    setActiveTab('my-creations');
  };

  // Podcast audio play/pause
  const togglePodcastPlay = (pod: PodcastItem) => {
    if (activePodcast?.id === pod.id) {
      if (isPlayingPodcast) {
        audioRef.current?.pause();
        setIsPlayingPodcast(false);
      } else {
        audioRef.current?.play().then(() => setIsPlayingPodcast(true)).catch(() => {});
      }
    } else {
      setActivePodcast(pod);
      setIsPlayingPodcast(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.volume = podcastVolume;
          audioRef.current.play().then(() => setIsPlayingPodcast(true)).catch(() => {});
        }
      }, 100);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Reusable Comment Box Render
  const renderCommentSection = (itemId: string) => {
    const isExpanded = !!expandedCommentsMap[itemId];
    const commentsList = commentsMap[itemId] || [];
    const currentInput = newCommentInputs[itemId] || '';

    return (
      <div className="mt-4 pt-4 border-t border-slate-200/70 text-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <button
            onClick={() => toggleCommentsFor(itemId)}
            className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer text-xs font-extrabold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Comments ({commentsList.length})</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3.5 space-y-4 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs">
            {/* List of comments */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {commentsList.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-1">No comments yet. Be the first to share an inspiring reflection!</p>
              ) : (
                commentsList.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <div className={`w-5 h-5 rounded-full ${c.avatarBg} text-white flex items-center justify-center text-[10px] font-black`}>
                          {c.author[0]}
                        </div>
                        <span>{c.author}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input form */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setNewCommentInputs(prev => ({ ...prev, [itemId]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(itemId); }}
                placeholder="Write a mindful reflection or comment..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                onClick={() => handleAddComment(itemId)}
                disabled={!currentInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 w-full max-w-full space-y-8 sm:space-y-10 lg:space-y-12 pb-24">
      
      {/* HEADER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-9 text-slate-900 shadow-sm space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>SafeSpace Uplifting Media Sanctuary</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-tight text-slate-900">
              Inspiring Media & Mindful Sanctuary
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore curated uplifting videos, wisdom quotes, playable podcasts, books, comment on inspiring posts, and record your own custom video & voice media.
            </p>
          </div>

          {/* Quick Create CTA Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={() => setActiveTab('creator')}
              className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md hover:shadow-amber-400/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300/80 active:scale-95"
            >
              <Wand2 className="w-4 h-4 text-slate-900" />
              <span>Create Mixed Media</span>
            </button>
            <button
              onClick={() => setActiveTab('my-creations')}
              className="px-4.5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <span>My Saved ({myCreatedMediaList.length})</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION CATEGORY TABS (Short Videos placed FIRST before Quote Images) */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'all', label: 'All Inspiring Media', icon: Sparkle },
            { id: 'videos', label: 'Short Videos', icon: Video },
            { id: 'playlists', label: 'Playlists 🎬', icon: ListVideo },
            { id: 'quotes', label: 'Quote Images', icon: Quote },
            { id: 'podcasts', label: 'Podcasts', icon: Headphones },
            { id: 'books', label: 'Books & Novels', icon: BookOpen },
            { id: 'my-creations', label: 'My Creations', icon: Heart },
            { id: 'creator', label: '✨ Creator Studio (Video & Voice)', icon: Wand2 },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MediaCategory)}
                className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUCCESS BANNER WHEN SAVING CREATION */}
      {showCreatedSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>✨ Your custom inspiring mixed media card (with video & voice) has been saved to "My Creations"!</span>
          </div>
          <button
            onClick={() => setActiveTab('my-creations')}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black cursor-pointer hover:bg-emerald-700 transition-colors"
          >
            View Collection
          </button>
        </div>
      )}

      {/* MAIN CONTENT PANELS ACCORDING TO ACTIVE TAB */}

      {/* ---------------------------------------------------- */}
      {/* 1. CREATOR STUDIO TAB WITH WEBCAM & MICROPHONE RECORDING */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'creator' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-500" /> Create Your Own Inspiring Mixed Media
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Design custom quote cards, record your webcam video message, and record your voice affirmation to empower your peers.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 self-start sm:self-auto">
              SafeSpace Media Studio
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT FORM CONTROLS (7 cols) */}
            <div className="lg:col-span-7 space-y-7 sm:space-y-8">
              
              {/* Card Title */}
              <div className="space-y-2">
                <label htmlFor="custom-media-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Card Title or Theme:
                </label>
                <input
                  id="custom-media-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Morning Affirmation, Exam Peace, Self-Care Note"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all"
                />
              </div>

              {/* Quote / Affirmation Text */}
              <div className="space-y-2">
                <label htmlFor="custom-media-quote" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Inspiring Quote / Words of Wisdom:
                </label>
                <textarea
                  id="custom-media-quote"
                  rows={4}
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="Type your inspiring quote or encouraging message here..."
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs leading-relaxed transition-all"
                />
              </div>

              {/* Author / Attribution */}
              <div className="space-y-2">
                <label htmlFor="custom-media-author" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Author / Attribution:
                </label>
                <input
                  id="custom-media-author"
                  type="text"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  placeholder="e.g. Your Name, Maya Angelou, Unknown Philosopher"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-all"
                />
              </div>

              {/* ------------------------------------------- */}
              {/* VIDEO & VOICE RECORDING STUDIO CONTROLS */}
              {/* ------------------------------------------- */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" /> Record Video & Voice Message
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Browser Recording
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* VIDEO RECORDING BOX */}
                  <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-rose-600" /> Record Video
                      </span>
                      {isVideoRecording && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-600" /> Recording {formatTime(videoRecordTime)}
                        </span>
                      )}
                    </div>

                    {/* Live Video Preview or Recorded Video */}
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                      <video
                        ref={videoPreviewRef}
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${isVideoRecording ? 'block' : 'hidden'}`}
                      />

                      {!isVideoRecording && recordedVideoUrl && (
                        <video
                          src={recordedVideoUrl}
                          controls
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}

                      {!isVideoRecording && !recordedVideoUrl && (
                        <div className="text-center p-3 text-slate-400 text-xs space-y-1">
                          <Camera className="w-6 h-6 mx-auto text-slate-500 opacity-60" />
                          <p>No video recorded yet</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!isVideoRecording ? (
                        <button
                          onClick={startVideoRecording}
                          className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{recordedVideoUrl ? 'Re-record Video' : 'Start Video Record'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopVideoRecording}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs animate-pulse"
                        >
                          <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* VOICE AUDIO RECORDING BOX */}
                  <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-purple-600" /> Record Voice
                      </span>
                      {isAudioRecording && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-purple-600" /> Recording {formatTime(audioRecordTime)}
                        </span>
                      )}
                    </div>

                    {/* Audio Preview Box */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center min-h-[90px] text-center space-y-1">
                      {isAudioRecording ? (
                        <div className="space-y-1 text-purple-700 animate-pulse">
                          <Mic className="w-6 h-6 mx-auto text-purple-600" />
                          <p className="text-xs font-bold">Listening to microphone...</p>
                        </div>
                      ) : recordedAudioUrl ? (
                        <div className="w-full space-y-1">
                          <p className="text-[10px] font-bold text-emerald-700">Voice Note Recorded!</p>
                          <audio src={recordedAudioUrl} controls className="w-full h-8" />
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs space-y-1">
                          <Mic className="w-6 h-6 mx-auto text-slate-400 opacity-60" />
                          <p>No voice note recorded yet</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!isAudioRecording ? (
                        <button
                          onClick={startAudioRecording}
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{recordedAudioUrl ? 'Re-record Voice' : 'Start Voice Record'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopAudioRecording}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs animate-pulse"
                        >
                          <StopCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient & Background Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Background Color Palette:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CREATOR_GRADIENTS.map((grad) => (
                    <button
                      key={grad.id}
                      onClick={() => setSelectedGradient(grad)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        selectedGradient.id === grad.id
                          ? 'border-indigo-600 ring-2 ring-indigo-400 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${grad.class} shrink-0 shadow-xs`} />
                      <span className="text-xs font-bold text-slate-800 truncate">{grad.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Typography Style:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'serif', label: 'Classic Serif', styleClass: 'font-serif' },
                    { id: 'sans', label: 'Modern Sans', styleClass: 'font-sans' },
                    { id: 'script', label: 'Italic Cursive', styleClass: 'font-serif italic' },
                    { id: 'bold', label: 'Heavy Display', styleClass: 'font-black uppercase' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedFont === font.id
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`text-xs ${font.styleClass}`}>{font.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge & Ambient Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-media-badge" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mindful Badge:
                  </label>
                  <select
                    id="custom-media-badge"
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CREATOR_BADGES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="custom-media-ambient" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ambient Sound Tag:
                  </label>
                  <select
                    id="custom-media-ambient"
                    value={selectedAmbientMood}
                    onChange={(e) => setSelectedAmbientMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Soft Piano & Birdsong">🎹 Soft Piano & Birdsong</option>
                    <option value="Ocean Breeze & Waves">🌊 Ocean Breeze & Waves</option>
                    <option value="Gentle Rain Chimes">🌧️ Gentle Rain Chimes</option>
                    <option value="Lo-Fi Mindful Beats">🎧 Lo-Fi Mindful Beats</option>
                  </select>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                onClick={handleSaveCustomMedia}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Save to My Inspiring Creations</span>
              </button>

            </div>

            {/* RIGHT LIVE PREVIEW CARD (5 cols) */}
            <div className="lg:col-span-5 space-y-3 sticky top-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" /> Live Canvas Card Preview:
              </div>

              <div className={`p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${selectedGradient.class} ${selectedGradient.textClass} shadow-xl relative overflow-hidden min-h-[360px] flex flex-col justify-between transition-all duration-300 border border-white/20`}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Badge & Ambient Tag */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold border border-white/30 shadow-xs">
                    {selectedBadge}
                  </span>
                  <span className="text-[10px] font-bold opacity-80 flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-md">
                    <Music className="w-3 h-3" /> {selectedAmbientMood}
                  </span>
                </div>

                {/* Quote Content */}
                <div className="my-6 z-10 space-y-3">
                  <Quote className="w-8 h-8 opacity-40" />
                  <p className={`text-lg sm:text-xl leading-relaxed ${
                    selectedFont === 'serif' ? 'font-serif' :
                    selectedFont === 'sans' ? 'font-sans font-semibold' :
                    selectedFont === 'script' ? 'font-serif italic text-xl sm:text-2xl' :
                    'font-black uppercase tracking-wide text-base sm:text-lg'
                  }`}>
                    "{customQuote || 'Your inspiring quote text...'}"
                  </p>
                  <p className="text-xs font-bold opacity-90 text-right font-mono">
                    — {customAuthor || 'Author'}
                  </p>
                </div>

                {/* Embedded Video/Voice Recording Tags in Preview */}
                {(recordedVideoUrl || recordedAudioUrl) && (
                  <div className="z-10 p-2.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 space-y-2">
                    {recordedVideoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Recorded Video Message Attached
                        </span>
                        <video src={recordedVideoUrl} controls playsInline className="w-full rounded-lg max-h-36 object-cover" />
                      </div>
                    )}
                    {recordedAudioUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Recorded Voice Affirmation Attached
                        </span>
                        <audio src={recordedAudioUrl} controls className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Footer Brand */}
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-[10px] opacity-75 z-10">
                  <span className="font-extrabold tracking-tight">SafeSpace Inspiring Media</span>
                  <span>{customTitle || 'Affirmation'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. INSPIRING SHORT VIDEOS TAB (Placed FIRST before Quote Images) */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'videos') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" /> Inspiring Short Videos & Reflections
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Bite-sized video lessons on emotional growth, stress management, and finding daily peace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {SAMPLE_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group p-5 space-y-4"
              >
                {/* Thumbnail Header with Play Button */}
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden cursor-pointer" onClick={() => { setActiveVideoModal(vid); setVideoSourceMode('youtube'); setIsPlayingVideo(true); }}>
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Play Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-600 transition-all">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> {vid.duration}
                  </div>

                  <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-rose-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {vid.category}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Speaker: <span className="text-slate-800 font-bold">{vid.speaker}</span>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {vid.summary}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => { setActiveVideoModal(vid); setVideoSourceMode('youtube'); setIsPlayingVideo(true); }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600" /> Watch Video
                    </button>
                    {(vid.watchUrl || vid.youtubeUrl) && (
                      <a
                        href={vid.watchUrl || vid.youtubeUrl?.replace('/embed/', '/watch?v=')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1 border border-rose-200 cursor-pointer shrink-0"
                        title="Open directly on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Comment Section Box */}
                {renderCommentSection(vid.id)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2.5 CURATED PLAYLISTS TAB */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-indigo-600" /> Curated Mindful Playlists & Radios
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Handpicked YouTube video series, guided meditation collections, and continuous calm music radios.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> {SAMPLE_PLAYLISTS.length} Featured Playlists
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SAMPLE_PLAYLISTS.map((pl) => (
              <div
                key={pl.id}
                className="bg-white border-2 border-indigo-100 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group p-5 space-y-4 relative"
              >
                {/* Thumbnail Header with Playlist Badge */}
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden cursor-pointer" onClick={() => { setActiveVideoModal(pl); setVideoSourceMode('youtube'); setIsPlayingVideo(true); }}>
                  <img
                    src={pl.thumbnailUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  
                  {/* Play Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                      <ListVideo className="w-5 h-5 fill-white" />
                    </div>
                  </div>

                  {/* Playlist Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-indigo-950/90 backdrop-blur-md text-amber-300 text-[9px] font-extrabold flex items-center gap-1 border border-indigo-700/60">
                    <ListVideo className="w-3 h-3 text-amber-300" /> YouTube Playlist
                  </div>

                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-indigo-600/90 text-white text-[9px] font-extrabold uppercase tracking-wider">
                    {pl.category}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Curated by: <span className="text-slate-800 font-bold">{pl.speaker}</span>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {pl.summary}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => { setActiveVideoModal(pl); setVideoSourceMode('youtube'); setIsPlayingVideo(true); }}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" /> Launch Playlist
                    </button>
                    {(pl.watchUrl || pl.youtubeUrl) && (
                      <a
                        href={pl.watchUrl || pl.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 cursor-pointer shrink-0"
                        title="Open playlist directly on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Comment Section Box */}
                {renderCommentSection(pl.id)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. QUOTE IMAGES GALLERY TAB */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'quotes') && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Quote className="w-5 h-5 text-indigo-600" /> Inspiring Quote Cards & Affirmations
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                High-resolution wisdom graphics designed to uplift your mood and foster emotional mindfulness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {SAMPLE_QUOTES.map((q) => {
              const isFav = favoriteIds.has(q.id);
              const isCopied = copiedQuoteId === q.id;
              return (
                <div
                  key={q.id}
                  className={`p-7 sm:p-8 rounded-3xl bg-gradient-to-br ${q.bgGradient} ${q.textColor} shadow-md relative overflow-hidden flex flex-col justify-between min-h-[280px] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/10`}
                >
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider border border-white/30">
                      {q.category}
                    </span>
                    <button
                      onClick={() => toggleFavorite(q.id)}
                      className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isFav ? 'bg-rose-500 text-white shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={isFav ? "Saved to Favorites" : "Save to Favorites"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Main Quote */}
                  <div className="my-5 z-10 space-y-3">
                    <Quote className="w-8 h-8 opacity-40" />
                    <p className="text-base sm:text-lg font-serif font-medium leading-relaxed">
                      "{q.quote}"
                    </p>
                    <p className="text-xs font-bold opacity-80 text-right font-mono">
                      — {q.author}
                    </p>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs z-10">
                    <span className="text-[11px] font-bold opacity-75">
                      ❤️ {q.likes + (isFav ? 1 : 0)} Likes
                    </span>

                    <button
                      onClick={() => handleCopyQuote(q.quote, q.author, q.id)}
                      className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/30"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-200">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Quote</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Comment Section Box */}
                  {renderCommentSection(q.id)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. INSPIRING PODCASTS TAB */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'podcasts') && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-600" /> Inspiring Audio Podcasts & Mental Health Talks
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Listen to soothing audio episodes or watch video podcasts on overthinking, anxiety relief, emotional burnout, and neuroscience.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> {SAMPLE_PODCASTS.length} Audio Episodes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_PODCASTS.map((pod) => {
              const isActivePod = activePodcast?.id === pod.id;
              const isPlaying = isActivePod && isPlayingPodcast;

              return (
                <div
                  key={pod.id}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group hover:shadow-xl ${
                    isActivePod
                      ? 'bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white border-purple-400 shadow-lg ring-2 ring-purple-400'
                      : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm'
                  }`}
                >
                  {/* Decorative Background Glow */}
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-300/40 transition-all" />

                  {/* Header Info */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200/80 shadow-2xs flex items-center gap-1">
                        <Headphones className="w-3 h-3 text-purple-600" /> {pod.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        <Clock className="w-3 h-3 text-purple-600" /> {pod.duration}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-purple-600 tracking-wide uppercase">
                        EPISODE #{pod.episodeNumber || 1}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors mt-0.5 leading-snug">
                        {pod.title}
                      </h3>
                      <p className="text-xs text-purple-900 font-bold mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                        Host: {pod.host}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {pod.summary}
                    </p>
                  </div>

                  {/* Key Takeaways Section */}
                  <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-2 relative z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Key Episode Takeaways:
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {pod.keyInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dual Action Buttons: Audio Player vs Video Modal */}
                  <div className="space-y-2.5 relative z-10">
                    <button
                      onClick={() => togglePodcastPlay(pod)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        isPlaying
                          ? 'bg-purple-600 text-white hover:bg-purple-700 animate-pulse ring-2 ring-purple-300'
                          : 'bg-slate-900 text-white hover:bg-purple-900'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-white" />
                          <span>Pause Audio Episode</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-purple-300" />
                          <span>Listen to Audio Podcast 🎙️</span>
                        </>
                      )}
                    </button>

                    {pod.youtubeUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const podVideo: VideoItem = {
                              id: pod.id,
                              title: pod.title,
                              speaker: pod.host,
                              duration: pod.duration,
                              category: pod.category,
                              thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
                              videoUrl: pod.audioUrl,
                              youtubeUrl: pod.youtubeUrl,
                              watchUrl: pod.watchUrl,
                              summary: pod.summary,
                              takeaways: pod.keyInsights
                            };
                            setActiveVideoModal(podVideo);
                            setVideoSourceMode('youtube');
                            setIsPlayingVideo(true);
                          }}
                          className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Video className="w-4 h-4 text-purple-700" />
                          <span>Watch Video 🎥</span>
                        </button>

                        {(pod.watchUrl || pod.youtubeUrl) && (
                          <a
                            href={pod.watchUrl || pod.youtubeUrl?.replace('/embed/', '/watch?v=')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                            title="Open episode directly on YouTube"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-700" />
                            <span className="hidden sm:inline">YouTube</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Section Box */}
                  {renderCommentSection(pod.id)}
                </div>
              );
            })}
          </div>

          {/* ACTIVE PODCAST AUDIO PLAYER BAR */}
          {activePodcast && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/40">
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-xl bg-purple-600 text-white shrink-0 shadow-md">
                  <Headphones className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">Now Playing Podcast:</span>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-md font-bold">{activePodcast.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{activePodcast.title}</h4>
                  <p className="text-xs text-slate-400">Host: {activePodcast.host} ({activePodcast.duration})</p>
                </div>
              </div>

              {/* Scrub Slider & Time Display */}
              <div className="flex-1 max-w-md flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatTime(podcastCurrentTime)}</span>
                  <span>{formatTime(podcastDuration || 1080)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={podcastDuration || 1080}
                  value={podcastCurrentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value);
                    if (audioRef.current) audioRef.current.currentTime = time;
                    setPodcastCurrentTime(time);
                  }}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Player Control Toolbar */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Skip Back 10s */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 transition-colors cursor-pointer"
                  title="Rewind 10 Seconds"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Skip Forward 10s */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.min(podcastDuration || 1080, audioRef.current.currentTime + 10);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 transition-colors cursor-pointer"
                  title="Fast Forward 10 Seconds"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Mute Toggle */}
                <button
                  onClick={() => {
                    setIsPodcastMuted(!isPodcastMuted);
                    if (audioRef.current) audioRef.current.muted = !isPodcastMuted;
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 transition-colors cursor-pointer"
                  title={isPodcastMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isPodcastMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* AI Voice Narrator Toggle */}
                <button
                  onClick={() => {
                    if (isHostVoiceNarrator) {
                      stopNarrator();
                      setIsHostVoiceNarrator(false);
                    } else {
                      setIsHostVoiceNarrator(true);
                      const speechText = `Episode ${activePodcast.episodeNumber}: ${activePodcast.title}, hosted by ${activePodcast.host}. Summary: ${activePodcast.summary}. Key insights: ${activePodcast.keyInsights.join('. ')}`;
                      speakNarrator(speechText, () => setIsHostVoiceNarrator(false));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isHostVoiceNarrator 
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md animate-pulse' 
                      : 'bg-slate-800 text-purple-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Listen to Host AI Voice Narration"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isHostVoiceNarrator ? 'Narrating Voice' : 'Voice Narrator'}</span>
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={() => togglePodcastPlay(activePodcast)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {isPlayingPodcast ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlayingPodcast ? 'Pause' : 'Play'}</span>
                </button>

                <audio
                  ref={audioRef}
                  src={activePodcast.audioUrl}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setPodcastCurrentTime(audioRef.current.currentTime);
                      setPodcastDuration(audioRef.current.duration || 1080);
                    }
                  }}
                  onError={() => {
                    // Fallback to Narrator if audio file error
                    if (!isHostVoiceNarrator) {
                      setIsHostVoiceNarrator(true);
                      const speechText = `Playing Episode ${activePodcast.episodeNumber}: ${activePodcast.title}, hosted by ${activePodcast.host}. ${activePodcast.summary}. Key takeaways: ${activePodcast.keyInsights.join('. ')}`;
                      speakNarrator(speechText);
                    }
                  }}
                  onEnded={() => setIsPlayingPodcast(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. INSPIRING BOOKS & NOVELS TAB */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'books') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" /> Inspiring Books & Novels to Read
              </h2>
              <p className="text-xs text-slate-500">
                Transformative literature, healing fiction, and classic wisdom books to enrich your inner world.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_BOOKS.map((b) => {
              const isBookmarked = bookmarkedBookIds.has(b.id);
              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  {/* Book Cover Header Card */}
                  <div className={`p-6 rounded-2xl bg-gradient-to-br ${b.coverGradient} text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between gap-2 z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                        {b.genre}
                      </span>
                      <button
                        onClick={() => toggleBookmarkBook(b.id)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          isBookmarked ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title={isBookmarked ? "Bookmarked in Reading List" : "Bookmark Book"}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
                      </button>
                    </div>

                    <div className="z-10 space-y-1">
                      <h3 className="font-serif font-bold text-lg leading-snug group-hover:underline">
                        {b.title}
                      </h3>
                      <p className="text-xs font-mono opacity-90">
                        By {b.author} • {b.pages} Pages
                      </p>
                    </div>
                  </div>

                  {/* Summary & Key Lesson */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{b.rating} / 5.0 Rating</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {b.summary}
                    </p>

                    <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                        ✨ Key Wisdom Lesson:
                      </span>
                      <p className="text-xs font-serif text-slate-800 italic">
                        "{b.keyLesson}"
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setActiveBookModal(b)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" /> Read Excerpt Sample
                  </button>

                  {/* Comment Section Box */}
                  {renderCommentSection(b.id)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. MY CREATED MIXED MEDIA COLLECTION TAB */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'my-creations' || activeTab === 'all') && myCreatedMediaList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600 fill-pink-600" /> My Saved Inspiring Creations ({myCreatedMediaList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Custom mixed media quote cards, recorded video messages, and voice notes created by you.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('creator')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCreatedMediaList.map((m) => (
              <div
                key={m.id}
                className={`p-7 rounded-3xl bg-gradient-to-br ${m.bgGradient} text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[280px] border border-white/20 space-y-4`}
              >
                <div className="flex items-center justify-between gap-2 z-10">
                  <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold border border-white/30">
                    {m.badge}
                  </span>
                  <span className="text-[10px] font-bold opacity-80 font-mono">
                    {m.createdAt}
                  </span>
                </div>

                <div className="my-2 z-10 space-y-2">
                  <Quote className="w-6 h-6 opacity-40" />
                  <p className={`text-base font-serif leading-relaxed ${
                    m.fontStyle === 'script' ? 'italic font-serif text-lg' :
                    m.fontStyle === 'bold' ? 'font-black uppercase tracking-wide' : 'font-serif'
                  }`}>
                    "{m.quote}"
                  </p>
                  <p className="text-xs font-bold text-right opacity-90 font-mono">
                    — {m.author}
                  </p>
                </div>

                {/* Embedded Video or Audio Note Player if present */}
                {(m.recordedVideoUrl || m.recordedAudioUrl) && (
                  <div className="z-10 p-2.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 space-y-2">
                    {m.recordedVideoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                          <Video className="w-3 h-3" /> Recorded Video Message
                        </span>
                        <video src={m.recordedVideoUrl} controls playsInline className="w-full rounded-lg max-h-36 object-cover" />
                      </div>
                    )}

                    {m.recordedAudioUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Recorded Voice Affirmation
                        </span>
                        <audio src={m.recordedAudioUrl} controls className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs z-10">
                  <span className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    <Music className="w-3 h-3" /> {m.ambientMood}
                  </span>
                  <button
                    onClick={() => handleCopyQuote(m.quote, m.author, m.id)}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>

                {/* Comment Section Box */}
                {renderCommentSection(m.id)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIDEO PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden text-white shadow-2xl relative space-y-4 p-5 sm:p-6 my-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                  {activeVideoModal.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeVideoModal.duration}</span>
              </div>

              {/* Source Mode Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                {activeVideoModal.youtubeUrl && (
                  <button
                    onClick={() => {
                      setVideoSourceMode('youtube');
                      stopNarrator();
                      setIsVideoSpeakerNarrating(false);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      videoSourceMode === 'youtube'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>YouTube Video</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setVideoSourceMode('mp4');
                    stopNarrator();
                    setIsVideoSpeakerNarrating(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    videoSourceMode === 'mp4'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Direct MP4 Stream</span>
                </button>
                <button
                  onClick={() => {
                    setVideoSourceMode('voice');
                    setIsVideoSpeakerNarrating(true);
                    const speechText = `${activeVideoModal.title} presented by ${activeVideoModal.speaker}. Summary: ${activeVideoModal.summary}. Key reflection points: ${activeVideoModal.takeaways.join('. ')}`;
                    speakNarrator(speechText, () => setIsVideoSpeakerNarrating(false));
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    videoSourceMode === 'voice'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Summary</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(activeVideoModal.watchUrl || activeVideoModal.youtubeUrl) && (
                  <a
                    href={activeVideoModal.watchUrl || activeVideoModal.youtubeUrl?.replace('/embed/', '/watch?v=')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    title="Open full video directly on YouTube in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Watch on YouTube ↗</span>
                  </a>
                )}
                <button
                  onClick={() => { 
                    setActiveVideoModal(null); 
                    setIsPlayingVideo(false); 
                    stopNarrator();
                    setIsVideoSpeakerNarrating(false);
                    setVideoError(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer self-end sm:self-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Box Container */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-inner group border border-slate-800">
              {/* YOUTUBE EMBED PLAYER */}
              {videoSourceMode === 'youtube' && activeVideoModal.youtubeUrl && (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${activeVideoModal.youtubeUrl}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0 rounded-2xl"
                  />
                  <div className="absolute top-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-300 border border-slate-700/60 flex items-center justify-between gap-2 z-10">
                    <span className="flex items-center gap-1.5 text-rose-300 font-medium truncate">
                      <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">If YouTube restricts iframe embedding in your preview:</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setVideoSourceMode('mp4')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-all cursor-pointer shadow-xs"
                      >
                        Direct MP4
                      </button>
                      <a
                        href={activeVideoModal.watchUrl || activeVideoModal.youtubeUrl?.replace('/embed/', '/watch?v=')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-[10px] flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                      >
                        <span>Open YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* DIRECT MP4 HTML5 PLAYER */}
              {videoSourceMode === 'mp4' && (
                <>
                  <video
                    ref={videoRef}
                    src={activeVideoModal.videoUrl}
                    controls
                    autoPlay={isPlayingVideo}
                    playsInline
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setVideoCurrentTime(videoRef.current.currentTime);
                        setVideoDuration(videoRef.current.duration || 0);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration || 0);
                        videoRef.current.volume = videoVolume;
                        videoRef.current.muted = isVideoMuted;
                        videoRef.current.playbackRate = videoPlaybackSpeed;
                      }
                    }}
                    onPlay={() => setIsPlayingVideo(true)}
                    onPause={() => setIsPlayingVideo(false)}
                    onEnded={() => setIsPlayingVideo(false)}
                    onError={() => {
                      setVideoError(true);
                      if (activeVideoModal.youtubeUrl) setVideoSourceMode('youtube');
                    }}
                    className="w-full h-full object-contain rounded-2xl shadow-xl bg-black focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />

                  {/* Captions Overlay on MP4 Video */}
                  {showVideoCaptions && !videoError && (
                    <div className="absolute bottom-12 left-4 right-4 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-slate-100 text-xs text-center border border-slate-700/60 pointer-events-none transition-all">
                      <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block mb-0.5">
                        💬 Reflection Insight:
                      </span>
                      <p className="font-medium italic">
                        "{activeVideoModal.takeaways[Math.floor((videoCurrentTime / (videoDuration || 1)) * activeVideoModal.takeaways.length) % activeVideoModal.takeaways.length] || activeVideoModal.takeaways[0]}"
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* VOICE SUMMARY MODE */}
              {videoSourceMode === 'voice' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center ring-8 ring-purple-500/10 animate-pulse">
                    <Mic className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">AI Speaker Voice Summary</span>
                    <h4 className="text-base font-extrabold text-white mt-1">{activeVideoModal.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Speaker: {activeVideoModal.speaker}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 text-xs text-slate-300 max-w-lg leading-relaxed italic">
                    "{activeVideoModal.summary}"
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (isVideoSpeakerNarrating) {
                          stopNarrator();
                          setIsVideoSpeakerNarrating(false);
                        } else {
                          setIsVideoSpeakerNarrating(true);
                          const speechText = `${activeVideoModal.title} by speaker ${activeVideoModal.speaker}. ${activeVideoModal.summary}. Key takeaways: ${activeVideoModal.takeaways.join('. ')}`;
                          speakNarrator(speechText, () => setIsVideoSpeakerNarrating(false));
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isVideoSpeakerNarrating ? 'Pause Voice Narration' : 'Play Voice Summary'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Interactive Video Controls Toolbar */}
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlayingVideo) {
                        videoRef.current.pause();
                        setIsPlayingVideo(false);
                      } else {
                        videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => {});
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isPlayingVideo ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlayingVideo ? 'Pause' : 'Play Video'}</span>
                </button>

                {/* Rewind 10s */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  title="Rewind 10 Seconds"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Fast Forward 10s */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 10);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  title="Fast Forward 10 Seconds"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono text-slate-300">
                  {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed selector */}
                <button
                  onClick={() => {
                    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
                    const nextSpeed = speeds[(speeds.indexOf(videoPlaybackSpeed) + 1) % speeds.length];
                    setVideoPlaybackSpeed(nextSpeed);
                    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono font-bold cursor-pointer"
                  title="Change Video Speed"
                >
                  {videoPlaybackSpeed}x
                </button>

                {/* Mute Toggle */}
                <button
                  onClick={() => {
                    setIsVideoMuted(!isVideoMuted);
                    if (videoRef.current) videoRef.current.muted = !isVideoMuted;
                  }}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  title={isVideoMuted ? "Unmute Video" : "Mute Video"}
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Subtitles Toggle */}
                <button
                  onClick={() => setShowVideoCaptions(!showVideoCaptions)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    showVideoCaptions 
                      ? 'bg-rose-600/30 text-rose-300 border-rose-500/50' 
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                  title={showVideoCaptions ? "Hide Captions Overlay" : "Show Captions Overlay"}
                >
                  <Subtitles className="w-4 h-4" />
                </button>

                {/* AI Speaker Voice Narration */}
                <button
                  onClick={() => {
                    if (isVideoSpeakerNarrating) {
                      stopNarrator();
                      setIsVideoSpeakerNarrating(false);
                    } else {
                      setIsVideoSpeakerNarrating(true);
                      const speechText = `${activeVideoModal.title} presented by ${activeVideoModal.speaker}. Summary: ${activeVideoModal.summary}. Key reflection points: ${activeVideoModal.takeaways.join('. ')}`;
                      speakNarrator(speechText, () => setIsVideoSpeakerNarrating(false));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isVideoSpeakerNarrating 
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md animate-pulse' 
                      : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                  }`}
                  title="Listen to Speaker AI Voice Breakdown"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isVideoSpeakerNarrating ? 'Narrating' : 'Voice Breakdown'}</span>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{activeVideoModal.title}</h3>
              <p className="text-xs text-rose-400 font-bold">Featured Speaker: {activeVideoModal.speaker}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{activeVideoModal.summary}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                💡 Key Reflection Takeaways:
              </span>
              <ul className="text-xs text-slate-200 space-y-1 list-disc pl-4">
                {activeVideoModal.takeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* BOOK SAMPLE EXCERPT MODAL */}
      {/* ---------------------------------------------------- */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden text-slate-900 shadow-2xl relative p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {activeBookModal.genre}
                </span>
                <h3 className="text-xl font-serif font-extrabold text-slate-900 mt-2">
                  {activeBookModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">By {activeBookModal.author} • {activeBookModal.pages} Pages</p>
              </div>
              <button
                onClick={() => setActiveBookModal(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 font-serif">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" /> Book Excerpt & Sample Passages:
              </span>
              <p className="text-sm text-slate-800 leading-relaxed italic whitespace-pre-line">
                "{activeBookModal.sampleExcerpt}"
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => toggleBookmarkBook(activeBookModal.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  bookmarkedBookIds.has(activeBookModal.id)
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{bookmarkedBookIds.has(activeBookModal.id) ? "Saved to Reading List" : "Bookmark to Reading List"}</span>
              </button>

              <button
                onClick={() => setActiveBookModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Close Sample
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
