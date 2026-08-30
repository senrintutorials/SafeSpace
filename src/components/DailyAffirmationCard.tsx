import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, Heart, RefreshCw, BookOpen, Share2, Check, Copy } from 'lucide-react';

export interface AffirmationItem {
  id: string;
  category: 'Self-Belief' | 'Exam Peace' | 'Inner Strength' | 'Calm Mind' | 'Friendship & Love';
  text: string;
  author: string;
  color: string;
  bgGradient: string;
}

export const DAILY_AFFIRMATIONS: AffirmationItem[] = [
  {
    id: 'aff-1',
    category: 'Self-Belief',
    text: "I am worthy of kindness, growth, and joy today. I believe in my gentle journey.",
    author: "Safie Wellness Guide",
    color: "text-amber-600 border-amber-300 bg-amber-50",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10"
  },
  {
    id: 'aff-2',
    category: 'Calm Mind',
    text: "I release worries about what I cannot control and focus on this calm present moment.",
    author: "Safie Mindful Counselor",
    color: "text-teal-600 border-teal-300 bg-teal-50",
    bgGradient: "from-teal-500/10 via-emerald-500/5 to-cyan-500/10"
  },
  {
    id: 'aff-3',
    category: 'Exam Peace',
    text: "My intelligence is not defined by one test. I am prepared, focused, and capable.",
    author: "Safie Academic Mentor",
    color: "text-purple-600 border-purple-300 bg-purple-50",
    bgGradient: "from-purple-500/10 via-indigo-500/5 to-violet-500/10"
  },
  {
    id: 'aff-4',
    category: 'Inner Strength',
    text: "I have survived every difficult day so far. I possess deep resilience inside me.",
    author: "Safie SafeSpace Guide",
    color: "text-pink-600 border-pink-300 bg-pink-50",
    bgGradient: "from-pink-500/10 via-rose-500/5 to-red-500/10"
  },
  {
    id: 'aff-5',
    category: 'Friendship & Love',
    text: "I bring light and empathy to those around me, and I deserve genuine care in return.",
    author: "Safie Peer Friend",
    color: "text-sky-600 border-sky-300 bg-sky-50",
    bgGradient: "from-sky-500/10 via-blue-500/5 to-cyan-500/10"
  }
];

export default function DailyAffirmationCard({
  onOpenJournal,
  onOpenAffirmationHub
}: {
  onOpenJournal?: () => void;
  onOpenAffirmationHub?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      return dayOfYear % DAILY_AFFIRMATIONS.length;
    } catch (e) {
      return 0;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedAffirmations, setSavedAffirmations] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('safie_saved_affirmations');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const currentAffirmation = DAILY_AFFIRMATIONS[currentIndex];
  const isSaved = savedAffirmations.includes(currentAffirmation.id);

  const handleNextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeakAffirmation = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentAffirmation.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSave = () => {
    let updated: string[];
    if (isSaved) {
      updated = savedAffirmations.filter(id => id !== currentAffirmation.id);
    } else {
      updated = [...savedAffirmations, currentAffirmation.id];
    }
    setSavedAffirmations(updated);
    try {
      localStorage.setItem('safie_saved_affirmations', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`"${currentAffirmation.text}" — ${currentAffirmation.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentAffirmation.bgGradient} bg-white border border-slate-200/90 shadow-sm relative overflow-hidden transition-all duration-300`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Daily Wellness Boost</span>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Daily Affirmation</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentAffirmation.color}`}>
            ✨ {currentAffirmation.category}
          </span>
          {onOpenAffirmationHub && (
            <button
              onClick={onOpenAffirmationHub}
              className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-2xs transition-all cursor-pointer"
            >
              Open Hub →
            </button>
          )}
        </div>
      </div>

      <div className="my-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-2xs relative">
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed italic text-center sm:text-left">
          "{currentAffirmation.text}"
        </p>
        <div className="mt-2 text-right">
          <span className="text-xs font-extrabold text-slate-400">— {currentAffirmation.author}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSpeakAffirmation}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Pause Audio' : 'Listen Safie Voice'}</span>
          </button>

          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isSaved
                ? 'bg-pink-100 text-pink-800 border-pink-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-600 text-pink-600' : 'text-slate-500'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={handleNextAffirmation}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Next Affirmation</span>
        </button>
      </div>
    </div>
  );
}
