import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Star, Heart, Calendar, Plus, MapPin, Radio, 
  Trash2, Smile, Frown, Meh, TrendingUp, BarChart2, CheckCircle2,
  Clock, Award, ShieldCheck, Download, FileText, FileSpreadsheet
} from 'lucide-react';
import { UserProfile, getUserDisplayName } from '../types/auth';
import { getStudentCheckIns, deleteStudentCheckIn, StudentCheckInEntry } from '../utils/studentCheckInStore';
import { downloadStudentCheckInPdf, downloadStudentCheckInCsv } from '../utils/pdfExport';

interface StudentDashboardCheckInWidgetProps {
  currentUser: UserProfile | null;
  onOpenCheckInModal: () => void;
}

export default function StudentDashboardCheckInWidget({
  currentUser,
  onOpenCheckInModal
}: StudentDashboardCheckInWidgetProps) {
  const [checkIns, setCheckIns] = useState<StudentCheckInEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;

    const loadData = () => {
      setCheckIns(getStudentCheckIns(currentUser.id));
    };

    loadData();

    window.addEventListener('student_checkins_updated', loadData);
    return () => window.removeEventListener('student_checkins_updated', loadData);
  }, [currentUser]);

  // Exclusive for Students only
  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  const handleDelete = (id: string) => {
    deleteStudentCheckIn(id);
    setDeletingId(null);
  };

  const totalEntries = checkIns.length;
  const avgRating = totalEntries > 0 
    ? (checkIns.reduce((acc, cur) => acc + cur.rating, 0) / totalEntries).toFixed(1)
    : '8.0';

  const latestCheckIn = checkIns[0];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 space-y-6 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-indigo-800/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              "Rate Your Day" & "Share Your Feelings"
            </h2>
            <p className="text-xs text-indigo-200">
              Your personal daily sign-in reflections, mood tracking, and location-backed wellness history
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {checkIns.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => downloadStudentCheckInPdf(checkIns[0])}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Download PDF report for your latest daily check-in"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>PDF Report</span>
              </button>
              <button
                onClick={() => downloadStudentCheckInCsv(checkIns)}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Download CSV file of all student check-in reflections"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>CSV Report</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenCheckInModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Daily Check-in</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-indigo-950/70 border border-indigo-700/50 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Average Day Rating</span>
            <span className="text-lg font-black text-amber-300">{avgRating} <span className="text-xs font-normal text-indigo-200">/ 10</span></span>
          </div>
        </div>

        <div className="bg-indigo-950/70 border border-indigo-700/50 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Total Logged Check-ins</span>
            <span className="text-lg font-black text-teal-300">{totalEntries} Entries</span>
          </div>
        </div>

        <div className="bg-indigo-950/70 border border-indigo-700/50 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Student Privacy Guard</span>
            <span className="text-xs font-bold text-purple-200">Private & Encrypted</span>
          </div>
        </div>
      </div>

      {/* Recent Check-in Reflections List */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs text-indigo-200 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" /> Saved Student Reflections ({checkIns.length})
          </span>
          <span>Auto-Synced GPS Telemetry</span>
        </div>

        {checkIns.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-indigo-800/40 space-y-3">
            <Smile className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-white">No Check-in Logged Yet Today</h4>
            <p className="text-xs text-indigo-300 max-w-sm mx-auto">
              Rate your day and share how you are feeling to start building your mental wellness history!
            </p>
            <button
              onClick={onOpenCheckInModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Start Check-in Now
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {checkIns.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-800/60 hover:border-indigo-500/60 transition-all space-y-3"
              >
                {/* Entry Top info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-900/90 border border-indigo-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
                      {item.ratingEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">
                          Day Rating: {item.rating}/10
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {item.ratingLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => downloadStudentCheckInPdf(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                      title="Download PDF Report for this entry"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => downloadStudentCheckInCsv(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="Download CSV file for this entry"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirm delete prompt */}
                {deletingId === item.id && (
                  <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs flex items-center justify-between">
                    <span>Delete this reflection?</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Tagged Feeling Chips */}
                {item.feelingTags && item.feelingTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.feelingTags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-900/80 text-indigo-200 border border-indigo-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes Text */}
                {item.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans italic">
                    "{item.notes}"
                  </div>
                )}

                {/* Attached Location */}
                {item.location && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1 text-teal-400 font-bold truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-teal-400" />
                      <span className="truncate">{item.location.campusZone || item.location.address}</span>
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      {item.location.lat?.toFixed(4)}°, {item.location.lng?.toFixed(4)}°
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
