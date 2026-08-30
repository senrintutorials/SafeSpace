import React, { useState } from 'react';
import { 
  Sparkles, Heart, Star, Smile, Frown, Meh, Sun, Moon, MapPin, 
  Send, X, CheckCircle2, ShieldCheck, Radio, MessageSquare, AlertCircle,
  FileText, FileSpreadsheet, Download
} from 'lucide-react';
import { UserProfile, getUserDisplayName } from '../types/auth';
import { saveStudentCheckIn, StudentCheckInEntry } from '../utils/studentCheckInStore';
import { useLocationTracker } from '../utils/locationTracker';
import { downloadStudentCheckInPdf, downloadStudentCheckInCsv } from '../utils/pdfExport';

interface StudentCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSubmitted?: () => void;
}

const RATING_SCALES = [
  { level: 1, label: 'Very Tough / Overwhelmed', emoji: '😞', color: 'bg-rose-500 text-white', border: 'border-rose-400' },
  { level: 2, label: 'Rough Day', emoji: '😟', color: 'bg-rose-400 text-white', border: 'border-rose-300' },
  { level: 3, label: 'Low Energy & Stressed', emoji: '😕', color: 'bg-amber-500 text-white', border: 'border-amber-400' },
  { level: 4, label: 'A Bit Down', emoji: '😐', color: 'bg-amber-400 text-slate-900', border: 'border-amber-300' },
  { level: 5, label: 'Okay / Neutral', emoji: '🙂', color: 'bg-yellow-400 text-slate-900', border: 'border-yellow-300' },
  { level: 6, label: 'Fair & Manageable', emoji: '😊', color: 'bg-emerald-400 text-slate-900', border: 'border-emerald-300' },
  { level: 7, label: 'Good & Productive', emoji: '😃', color: 'bg-emerald-500 text-white', border: 'border-emerald-400' },
  { level: 8, label: 'Very Good & Energetic', emoji: '😄', color: 'bg-teal-500 text-white', border: 'border-teal-400' },
  { level: 9, label: 'Great Day!', emoji: '🥰', color: 'bg-indigo-500 text-white', border: 'border-indigo-400' },
  { level: 10, label: 'Awesome & Inspiring!', emoji: '🌟', color: 'bg-purple-600 text-white', border: 'border-purple-400' },
];

const PRESET_FEELINGS = [
  { tag: 'Grateful 🌸', category: 'positive' },
  { tag: 'Calm & Peaceful 🍃', category: 'positive' },
  { tag: 'Inspired ✨', category: 'positive' },
  { tag: 'Focused 🎯', category: 'positive' },
  { tag: 'Energetic ⚡', category: 'positive' },
  { tag: 'Hopeful 🌈', category: 'positive' },
  { tag: 'Anxious 😰', category: 'challenging' },
  { tag: 'Overwhelmed 🌊', category: 'challenging' },
  { tag: 'Tired / Sleepy 😴', category: 'challenging' },
  { tag: 'Stressed 💥', category: 'challenging' },
  { tag: 'Lonely 🎈', category: 'challenging' },
  { tag: 'Academic Pressure 📚', category: 'challenging' },
];

export default function StudentCheckInModal({
  isOpen,
  onClose,
  currentUser,
  onSubmitted
}: StudentCheckInModalProps) {
  const { location: trackerLocation } = useLocationTracker();

  const [rating, setRating] = useState<number>(8);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>(['Grateful 🌸', 'Focused 🎯']);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<StudentCheckInEntry | null>(null);

  // Exclusivity guard: check if user is student
  if (!isOpen || !currentUser || currentUser.role !== 'student') return null;

  const currentScale = RATING_SCALES.find(s => s.level === rating) || RATING_SCALES[7];

  const toggleFeeling = (tag: string) => {
    if (selectedFeelings.includes(tag)) {
      setSelectedFeelings(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedFeelings(prev => [...prev, tag]);
    }
  };

  const currentPayload: StudentCheckInEntry = {
    id: 'chk-temp',
    studentId: currentUser.id,
    studentName: getUserDisplayName(currentUser),
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rating,
    ratingLabel: currentScale.label,
    ratingEmoji: currentScale.emoji,
    feelingTags: selectedFeelings,
    notes: notes.trim(),
    location: trackerLocation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saved = saveStudentCheckIn({
      studentId: currentUser.id,
      studentName: getUserDisplayName(currentUser),
      rating,
      ratingLabel: currentScale.label,
      ratingEmoji: currentScale.emoji,
      feelingTags: selectedFeelings,
      notes: notes.trim(),
      location: trackerLocation
    });

    setLastSaved(saved);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      if (onSubmitted) onSubmitted();
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-indigo-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  Student Sign-in Check-in
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                Rate Your Day & Share Feelings
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-10 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Check-in Saved to Your Student Dashboard!
            </h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              Thank you for taking a moment to reflect today, {currentUser.fullName.split(' ')[0]}. Your check-in history is securely logged.
            </p>

            {/* Quick Export Options on Check-in Completion */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => downloadStudentCheckInPdf(lastSaved || currentPayload)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>
              <button
                type="button"
                onClick={() => downloadStudentCheckInCsv(lastSaved || currentPayload)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download CSV File</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
            {/* Student Welcome Greeting */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  Welcome back, {getUserDisplayName(currentUser)} 👋
                </span>
                <span className="text-[11px] text-indigo-700 block">
                  How are you feeling as you log into SafeSpace today?
                </span>
              </div>
            </div>

            {/* FORM 1: Rate Your Day */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 1. Rate Your Day (1 to 10)
                </span>
                <span className="text-xs font-extrabold text-indigo-600">
                  {rating}/10
                </span>
              </label>

              {/* Selected Mood Preview Box */}
              <div className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${currentScale.border} bg-slate-50`}>
                <span className="text-4xl shrink-0">{currentScale.emoji}</span>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Rating {rating} of 10</div>
                  <div className="text-base font-extrabold text-slate-900">{currentScale.label}</div>
                </div>
              </div>

              {/* Interactive Rating Pills */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                {RATING_SCALES.map((scale) => {
                  const isSelected = scale.level === rating;
                  return (
                    <button
                      key={scale.level}
                      type="button"
                      onClick={() => setRating(scale.level)}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center gap-0.5 border ${
                        isSelected 
                          ? `${scale.color} ${scale.border} ring-2 ring-indigo-400 scale-105 shadow-md`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-base">{scale.emoji}</span>
                      <span className="text-[10px] font-mono">{scale.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FORM 2: Share Your Feelings */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-indigo-900">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-400" /> 2. Share Your Feelings & Mood
              </label>

              {/* Preset Emotion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_FEELINGS.map(({ tag, category }) => {
                  const isSelected = selectedFeelings.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFeeling(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? category === 'positive'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Free Text Reflections */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your feelings... What went well today? What's on your mind or weighing on your heart? (Optional)"
                rows={3}
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
              />
            </div>

            {/* Auto-Tracked Location Footer Attachment */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-teal-400 font-extrabold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-teal-400 animate-pulse" /> Auto GPS Telemetry Attached
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {trackerLocation.latitude}° N, {trackerLocation.longitude}° E
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{trackerLocation.address}</span>
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => downloadStudentCheckInPdf(currentPayload)}
                  className="flex-1 sm:flex-none px-3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download draft check-in as PDF report"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>PDF Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadStudentCheckInCsv(currentPayload)}
                  className="flex-1 sm:flex-none px-3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download draft check-in as CSV file"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV File</span>
                </button>
              </div>

              <button
                type="submit"
                className="flex-1 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Save Check-in to Student Dashboard</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
