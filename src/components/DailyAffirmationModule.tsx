import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Volume2, Heart, RefreshCw, Share2, Check, Copy, Plus, 
  BookOpen, Star, Flame, Compass, MessageSquare, Award, ArrowLeft, Lightbulb
} from 'lucide-react';
import { DAILY_AFFIRMATIONS, AffirmationItem } from './DailyAffirmationCard';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';

export interface CustomAffirmation {
  id: string;
  category: string;
  text: string;
  author: string;
  bgGradient: string;
  createdAt: string;
}

const CATEGORIES = [
  'All',
  'Self-Belief',
  'Exam Peace',
  'Inner Strength',
  'Calm Mind',
  'Friendship & Love',
  'Custom'
] as const;

const GRADIENT_OPTIONS = [
  { label: 'Sunset Glow', value: 'from-amber-500/20 via-orange-500/10 to-rose-500/20', border: 'border-amber-300' },
  { label: 'Ocean Calm', value: 'from-teal-500/20 via-cyan-500/10 to-blue-500/20', border: 'border-teal-300' },
  { label: 'Lavender Dreams', value: 'from-purple-500/20 via-pink-500/10 to-indigo-500/20', border: 'border-purple-300' },
  { label: 'Emerald Serenity', value: 'from-emerald-500/20 via-teal-500/10 to-lime-500/20', border: 'border-emerald-300' },
  { label: 'Rose Gold', value: 'from-pink-500/20 via-rose-500/10 to-amber-500/20', border: 'border-pink-300' },
];

export default function DailyAffirmationModule({
  onBackToDashboard
}: {
  onBackToDashboard?: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('safie_affirmation_streak');
      return stored ? parseInt(stored, 10) : 3;
    } catch {
      return 3;
    }
  });

  // Saved affirmations list
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('safie_saved_affirmations');
      return stored ? JSON.parse(stored) : ['aff-1', 'aff-3'];
    } catch {
      return ['aff-1', 'aff-3'];
    }
  });

  // Custom user affirmations
  const [customAffirmations, setCustomAffirmations] = useState<CustomAffirmation[]>(() => {
    try {
      const stored = localStorage.getItem('safie_custom_affirmations');
      return stored ? JSON.parse(stored) : [
        {
          id: 'cust-1',
          category: 'Inner Strength',
          text: 'I am taking small steps every day toward my dreams. I trust my pace.',
          author: 'Me (My Affirmation)',
          bgGradient: 'from-purple-500/20 via-pink-500/10 to-indigo-500/20',
          createdAt: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  // New affirmation modal form state
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Self-Belief');
  const [newGradient, setNewGradient] = useState<string>(GRADIENT_OPTIONS[0].value);
  const [reflectionInput, setReflectionInput] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(false);

  // Combine default + custom for display
  const allAffirmations: AffirmationItem[] = [
    ...DAILY_AFFIRMATIONS,
    ...customAffirmations.map(c => ({
      id: c.id,
      category: c.category as any,
      text: c.text,
      author: c.author,
      color: 'text-purple-700 border-purple-300 bg-purple-50',
      bgGradient: c.bgGradient
    }))
  ];

  const filteredAffirmations = allAffirmations.filter(a => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Custom') return a.id.startsWith('cust-');
    return a.category === selectedCategory;
  });

  const activeAffirmation = filteredAffirmations[currentIndex % (filteredAffirmations.length || 1)] || DAILY_AFFIRMATIONS[0];
  const isSaved = savedIds.includes(activeAffirmation?.id);

  const handleNext = () => {
    if (filteredAffirmations.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredAffirmations.length);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePrev = () => {
    if (filteredAffirmations.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredAffirmations.length) % filteredAffirmations.length);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !activeAffirmation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeAffirmation.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSave = (id: string) => {
    let updated: string[];
    if (savedIds.includes(id)) {
      updated = savedIds.filter(i => i !== id);
    } else {
      updated = [...savedIds, id];
    }
    setSavedIds(updated);
    try {
      localStorage.setItem('safie_saved_affirmations', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopy = () => {
    if (!activeAffirmation) return;
    navigator.clipboard.writeText(`"${activeAffirmation.text}" — ${activeAffirmation.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newObj: CustomAffirmation = {
      id: `cust-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
      author: 'My Custom Affirmation',
      bgGradient: newGradient,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newObj, ...customAffirmations];
    setCustomAffirmations(updated);
    try {
      localStorage.setItem('safie_custom_affirmations', JSON.stringify(updated));
    } catch (e) {}

    // Auto save
    handleToggleSave(newObj.id);
    setNewText('');
    setIsCreating(false);
    setSelectedCategory('Custom');
    setCurrentIndex(0);
  };

  const handleSaveReflection = () => {
    if (!reflectionInput.trim()) return;

    saveRecordedEntry({
      type: 'affirmation',
      typeLabel: '☀️ Daily Affirmations',
      title: `Affirmation Reflection: "${activeAffirmation?.text || 'Daily Affirmation'}"`,
      excerpt: `Student Reflection: "${reflectionInput.trim()}" • Spoken Affirmation: "${activeAffirmation?.text || ''}"`,
      reportAnalysis: {
        dominantEmotion: 'Self-Acceptance & Empowerment',
        valenceScore: 0.89,
        arousalScore: 0.32,
        sentimentLabel: 'Positive Self-Talk',
        summaryObservation: 'Student completed daily affirmation reflection exercise.',
        psychologistInsights: [
          'Repetitive self-affirmation strengthens emotional resilience pathways.',
          'Reflection notes demonstrate positive cognitive reframing.'
        ],
        guidanceNote: 'Affirmation reflection saved to Dashboard history.',
        safetyStatus: 'SAFE'
      }
    });

    setReflectionSaved(true);
    setTimeout(() => {
      setReflectionInput('');
      setReflectionSaved(false);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-black shadow-lg">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Mindful Positivity Hub
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Affirmations</h1>
          </div>
        </div>

        {/* Streak Counter & Create Button */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-amber-900 shadow-2xs">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 block leading-none">Positivity Streak</span>
              <span className="text-sm font-black">{streakCount} Days Strong 🔥</span>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Affirmation</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-md scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat === 'All' ? '✨ All Categories' : cat === 'Custom' ? '✏️ My Custom' : cat}
          </button>
        ))}
      </div>

      {/* Main Affirmation Spotlight Card */}
      {activeAffirmation ? (
        <div className={`p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${activeAffirmation.bgGradient} bg-white border-2 border-slate-200/90 shadow-lg relative overflow-hidden transition-all duration-300`}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-600" /> {activeAffirmation.category}
            </span>
            
            <button
              onClick={() => handleToggleSave(activeAffirmation.id)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isSaved ? 'bg-pink-100 text-pink-700 border-pink-300 scale-110' : 'bg-white/80 text-slate-500 border-slate-200 hover:bg-white'
              }`}
              title={isSaved ? "Saved to Favorites" : "Save to Favorites"}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-pink-600 text-pink-600' : ''}`} />
            </button>
          </div>

          <div className="my-6 text-center max-w-2xl mx-auto space-y-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug tracking-tight italic">
              "{activeAffirmation.text}"
            </p>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              — {activeAffirmation.author}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSpeak}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Pause Voice' : 'Listen Safie Voice'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Next ({currentIndex + 1}/{filteredAffirmations.length})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
          <p className="text-slate-500 font-bold">No affirmations found in this category.</p>
        </div>
      )}

      {/* Reflection Journal Prompt */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-black text-slate-900">Affirmation Reflection Note</h3>
        </div>
        <p className="text-xs text-slate-600 font-medium">
          How does this affirmation resonate with your day or current thoughts? Write a quick personal reflection to lock in positivity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={reflectionInput}
            onChange={(e) => setReflectionInput(e.target.value)}
            placeholder="e.g., Today I will remind myself to take a deep breath before my science exam..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSaveReflection}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            {reflectionSaved ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            <span>{reflectionSaved ? 'Saved Reflection!' : 'Save Reflection'}</span>
          </button>
        </div>
      </div>

      {/* Saved Favorites Grid */}
      {savedIds.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
              Saved Affirmations ({savedIds.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAffirmations.filter(a => savedIds.includes(a.id)).map((item) => (
              <div key={item.id} className={`p-5 rounded-2xl bg-gradient-to-br ${item.bgGradient} bg-white border border-slate-200 shadow-2xs relative`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-white/80 px-2 py-0.5 rounded-full border border-purple-200">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleToggleSave(item.id)}
                    className="text-pink-600 hover:text-pink-700 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-pink-600" />
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                  "{item.text}"
                </p>
                <p className="text-[10px] font-extrabold text-slate-400 text-right mt-2">
                  — {item.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Custom Affirmation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black text-slate-900">Create Custom Affirmation</h2>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Self-Belief">Self-Belief</option>
                  <option value="Exam Peace">Exam Peace</option>
                  <option value="Inner Strength">Inner Strength</option>
                  <option value="Calm Mind">Calm Mind</option>
                  <option value="Friendship & Love">Friendship & Love</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                  Your Positive Statement
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. I am capable of overcoming any academic challenge with patience and clarity..."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Card Theme Gradient
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_OPTIONS.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setNewGradient(g.value)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-extrabold flex items-center justify-between cursor-pointer transition-all ${
                        newGradient === g.value ? 'bg-purple-100 border-purple-500 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{g.label}</span>
                      {newGradient === g.value && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Save & Add Affirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
