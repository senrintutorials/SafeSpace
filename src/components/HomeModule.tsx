import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Mic, Book, Wind, ChevronRight, Video, MessageSquare, ShieldAlert, 
  User, Shield, Sparkles, LogIn, Heart, AlertTriangle, PhoneCall, ArrowRight,
  FileText, CheckCircle2, Lock, HeartHandshake, Search, Grid, Filter, ShieldCheck,
  Play, Pause, Download, Brain, BarChart3, Clock, Calendar, ChevronDown, ChevronUp,
  Image as ImageIcon, FileAudio, Smile, Award, RotateCcw, RefreshCw, Trash2,
  MessageCircle, Send, Users, UserPlus, X, Palette, Music, Sun, Gamepad2
} from 'lucide-react';
import { UserProfile, ROLE_CONFIGS, getRolePermissions, getUserDisplayName } from '../types/auth';
import { 
  getRecordedEntries, refreshAllRecordedEntries, deleteRecordedEntry, 
  addCommentToEntry, deleteCommentFromEntry, shareEntryWithFriend, unshareEntryWithFriend,
  RecordedActivityEntry 
} from '../utils/recordedEntriesStore';
import { downloadRecordedEntryPdf, downloadRecordedEntryCsv } from '../utils/pdfExport';
import { playAudibleRecording } from '../utils/audioPlayback';
import StudentDashboardCheckInWidget from './StudentDashboardCheckInWidget';
import DailyAffirmationCard from './DailyAffirmationCard';
import DashboardEmotionalTrendChart from './DashboardEmotionalTrendChart';

export default function HomeModule({ 
  setActiveModule, 
  currentUser, 
  onOpenAuth,
  onOpenCheckInModal
}: { 
  setActiveModule: (module: string) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onOpenCheckInModal?: () => void;
}) {
  const currentRoleCfg = currentUser ? ROLE_CONFIGS[currentUser.role] : null;
  const permissions = getRolePermissions(currentUser?.role || 'student');

  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Recorded Entries & Report Analysis State
  const [recordedEntries, setRecordedEntries] = useState<RecordedActivityEntry[]>([]);
  const [selectedRecordedFilter, setSelectedRecordedFilter] = useState<string>('all');
  const [entriesSearchKeyword, setEntriesSearchKeyword] = useState<string>('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [expandedChatTranscriptId, setExpandedChatTranscriptId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState<boolean>(false);
  const [refreshToastMsg, setRefreshToastMsg] = useState<string>('');
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [shareInputs, setShareInputs] = useState<Record<string, string>>({});

  const handleShareWithFriend = (entryId: string) => {
    const friendName = shareInputs[entryId]?.trim();
    if (!friendName) return;
    const updated = shareEntryWithFriend(entryId, friendName);
    setRecordedEntries(updated);
    setShareInputs(prev => ({ ...prev, [entryId]: '' }));
    const formatted = friendName.startsWith('@') ? friendName : `@${friendName}`;
    setRefreshToastMsg(`✨ Entry successfully shared with SafeSpace Friend ${formatted}!`);
    setTimeout(() => setRefreshToastMsg(''), 3500);
  };

  const handleUnshareWithFriend = (entryId: string, friendName: string) => {
    const updated = unshareEntryWithFriend(entryId, friendName);
    setRecordedEntries(updated);
    setRefreshToastMsg(`Removed sharing with ${friendName}`);
    setTimeout(() => setRefreshToastMsg(''), 2500);
  };

  const handleAddComment = (entryId: string) => {
    const text = commentInputs[entryId]?.trim();
    if (!text) return;
    const author = currentUser ? getUserDisplayName(currentUser) : 'User Reflection';
    addCommentToEntry(entryId, text, author);
    setCommentInputs(prev => ({ ...prev, [entryId]: '' }));
    setRefreshToastMsg('💬 Comment successfully added to entry!');
    setTimeout(() => setRefreshToastMsg(''), 3000);
  };

  const handleDeleteComment = (entryId: string, commentId: string) => {
    deleteCommentFromEntry(entryId, commentId);
    setRefreshToastMsg('🗑️ Comment deleted!');
    setTimeout(() => setRefreshToastMsg(''), 3000);
  };

  const handleDeleteItem = (id: string) => {
    deleteRecordedEntry(id);
    setDeletingEntryId(null);
    setRefreshToastMsg('🗑️ History item successfully deleted!');
    setTimeout(() => setRefreshToastMsg(''), 3500);
  };

  const handleRefreshHistory = async () => {
    setIsRefreshingHistory(true);
    refreshAllRecordedEntries();

    try {
      const res = await fetch('/api/admin/alerts');
      if (res.ok) {
        const data = await res.json();
        setActiveAlerts(data.alerts || []);
      }
    } catch (e) {}

    setTimeout(() => {
      setIsRefreshingHistory(false);
      setRefreshToastMsg('✨ All history entries & clinical logs re-synchronized!');
      setTimeout(() => setRefreshToastMsg(''), 3500);
    }, 500);
  };

  useEffect(() => {
    setRecordedEntries(getRecordedEntries());
    const handleRecordedUpdate = () => {
      setRecordedEntries(getRecordedEntries());
    };
    window.addEventListener('recorded_entries_updated', handleRecordedUpdate);
    return () => window.removeEventListener('recorded_entries_updated', handleRecordedUpdate);
  }, []);

  const activePlaybackStopRef = useRef<(() => void) | null>(null);

  const togglePlayRecordedAudio = (entry: RecordedActivityEntry) => {
    if (activePlaybackStopRef.current) {
      activePlaybackStopRef.current();
      activePlaybackStopRef.current = null;
    }

    if (playingAudioId === entry.id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(entry.id);
      const stop = playAudibleRecording({
        audioUrl: entry.mediaUrl,
        textFallback: entry.excerpt || entry.title || 'Recorded Voice Note',
        onEnd: () => setPlayingAudioId(null)
      });
      activePlaybackStopRef.current = stop;
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
          setActiveAlerts(data.alerts || []);
        }
      } catch (err) {
        // Silent catch
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);

    const handleSafetyAlert = (event: any) => {
      const newAlert = event?.detail;
      if (newAlert) {
        setActiveAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
      }
    };

    window.addEventListener('safety_alert_created', handleSafetyAlert);

    return () => {
      clearInterval(interval);
      window.removeEventListener('safety_alert_created', handleSafetyAlert);
    };
  }, []);

  const unresolvedAlerts = activeAlerts.filter(a => a.status === 'UNRESOLVED');
  const criticalSuicideAlerts = unresolvedAlerts.filter(a => 
    a.category === 'SUICIDE_SELF_HARM' || 
    a.severity === 'CRITICAL' ||
    (a.triggerReason && a.triggerReason.toLowerCase().includes('suicide')) ||
    (a.triggerReason && a.triggerReason.toLowerCase().includes('self-harm'))
  );

  const hasCriticalAlert = criticalSuicideAlerts.length > 0;
  const hasUnresolvedAlerts = unresolvedAlerts.length > 0;
  const isAuthorityOrParent = permissions.canAccessAdminAlerts || currentUser?.role === 'parent';

  // Tile modules definition with prominent custom anime-inspired logo badges
  const allTileModules = [
    {
      id: 'chat',
      title: 'Your Friend SaFie',
      tagline: '24/7 AI Student Counselor',
      animeBadge: '✨ SaFie AI',
      category: 'counseling',
      categoryLabel: 'AI Guidance',
      description: 'Talk privately with your AI counselor SaFie for non-judgmental emotional support, stress relief, and gentle study advice.',
      icon: MessageSquare,
      logoGradient: 'from-purple-500 via-indigo-500 to-pink-500',
      logoBg: 'bg-purple-50 border-purple-300 text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      accentColor: 'group-hover:border-purple-500 group-hover:shadow-purple-200',
      actionText: 'Start Talking',
      popular: true
    },
    {
      id: 'video',
      title: 'Share Your Video',
      tagline: 'Private Video Journaling',
      animeBadge: '🌸 Time Capsule',
      category: 'expression',
      categoryLabel: 'Personal Video',
      description: 'Record private video reflections to look back on your personal growth throughout the school year.',
      icon: Video,
      logoGradient: 'from-pink-500 via-rose-500 to-amber-400',
      logoBg: 'bg-pink-50 border-pink-300 text-pink-700',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      accentColor: 'group-hover:border-pink-500 group-hover:shadow-pink-200',
      actionText: 'Record Video',
      popular: false
    },
    {
      id: 'audio',
      title: 'Share your Voice',
      tagline: 'Voice Recording & Tone Analysis',
      animeBadge: '🎤 Voice Note',
      category: 'expression',
      categoryLabel: 'Voice Reflection',
      description: 'Record short audio reflections to analyze vocal tone, emotional valence, and calm pitch rhythms.',
      icon: Mic,
      logoGradient: 'from-indigo-500 via-purple-500 to-violet-600',
      logoBg: 'bg-indigo-50 border-indigo-300 text-indigo-700',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      accentColor: 'group-hover:border-indigo-500 group-hover:shadow-indigo-200',
      actionText: 'Record Voice',
      popular: false
    },
    {
      id: 'multimodal',
      title: 'Share your Feelings',
      tagline: 'Visual Mood & Text Insights',
      animeBadge: '🎨 Mood Canvas',
      category: 'expression',
      categoryLabel: 'Expression',
      description: 'Upload mood notes, study art, or photos to get empathetic AI insights into your current emotional state.',
      icon: Activity,
      logoGradient: 'from-sky-400 via-blue-500 to-teal-400',
      logoBg: 'bg-sky-50 border-sky-300 text-sky-700',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
      accentColor: 'group-hover:border-sky-500 group-hover:shadow-sky-200',
      actionText: 'Share Feelings',
      popular: false
    },
    {
      id: 'share-art',
      title: 'Share your Arts',
      tagline: 'Online Creative Drawing & Art Therapy',
      animeBadge: '🎨 Art Therapy',
      category: 'expression',
      categoryLabel: 'Art Therapy',
      description: 'Draw online using pencils, smooth brushes, calligraphy highlighters, spray airbrushes, paint buckets, and anti-stress mandalas.',
      icon: Palette,
      logoGradient: 'from-amber-400 via-rose-400 to-indigo-500',
      logoBg: 'bg-amber-50 border-amber-300 text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentColor: 'group-hover:border-amber-500 group-hover:shadow-amber-200',
      actionText: 'Start Drawing',
      popular: true
    },
    {
      id: 'sing-along',
      title: 'Sing Along',
      tagline: 'Karaoke & Vocal Pitch Rating',
      animeBadge: '🎤 Karaoke Studio',
      category: 'wellness',
      categoryLabel: 'Music Therapy',
      description: 'Sing inspiring famous songs, follow live synchronized lyrics, and receive real-time vocal pitch ratings and feedback.',
      icon: Music,
      logoGradient: 'from-pink-500 via-rose-500 to-purple-600',
      logoBg: 'bg-pink-50 border-pink-300 text-pink-700',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      accentColor: 'group-hover:border-pink-500 group-hover:shadow-pink-200',
      actionText: 'Start Karaoke',
      popular: true
    },
    {
      id: 'create-avatar',
      title: 'Create Avatar',
      tagline: 'Anime & Chibi Sticker Creator',
      animeBadge: '✨ Avatar Studio',
      category: 'expression',
      categoryLabel: 'Avatar Studio',
      description: 'Snap a photo or choose a style to create your custom anime hero, kawaii chibi, or studio avatar sticker stamp.',
      icon: Smile,
      logoGradient: 'from-pink-400 via-purple-500 to-indigo-600',
      logoBg: 'bg-pink-50 border-pink-300 text-pink-700',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      accentColor: 'group-hover:border-pink-500 group-hover:shadow-pink-200',
      actionText: 'Design Avatar',
      popular: true
    },
    {
      id: 'inspiring-media',
      title: 'Inspiring Media',
      tagline: 'Uplifting Quotes, Videos, Podcasts & Books',
      animeBadge: '✨ Inspiration Hub',
      category: 'wellness',
      categoryLabel: 'Media Library',
      description: 'Explore quote graphics, short motivational videos, student mental health podcasts, curated novels, and build your own mixed media creations.',
      icon: Sparkles,
      logoGradient: 'from-purple-500 via-violet-500 to-indigo-600',
      logoBg: 'bg-purple-50 border-purple-300 text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      accentColor: 'group-hover:border-purple-500 group-hover:shadow-purple-200',
      actionText: 'Explore Media',
      popular: true
    },
    {
      id: 'journaling',
      title: 'Your Journal',
      tagline: 'Private Daily Reflection Desk',
      animeBadge: '📖 Private Space',
      category: 'wellness',
      categoryLabel: 'Writing Space',
      description: 'Write daily reflective entries with helpful student prompts. Keep your thoughts private and organized.',
      icon: Book,
      logoGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      logoBg: 'bg-emerald-50 border-emerald-300 text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      accentColor: 'group-hover:border-emerald-500 group-hover:shadow-emerald-200',
      actionText: 'Open Journal',
      popular: true
    },
    {
      id: 'meditations',
      title: 'Breathing Helps',
      tagline: 'Guided Breathing & Focus',
      animeBadge: '🍃 Healing Flow',
      category: 'wellness',
      categoryLabel: 'Mindfulness',
      description: 'Practice 4-7-8 rhythmic breathing exercises and calming audio timers to relax before exams or speeches.',
      icon: Wind,
      logoGradient: 'from-teal-400 via-emerald-500 to-sky-400',
      logoBg: 'bg-teal-50 border-teal-300 text-teal-700',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      accentColor: 'group-hover:border-teal-500 group-hover:shadow-teal-200',
      actionText: 'Start Breathing',
      popular: true
    },
    {
      id: 'report-incident',
      title: 'Report Incident',
      tagline: 'Confidential Incident Dispatch',
      animeBadge: '🛡️ Private Guard',
      category: 'safety',
      categoryLabel: 'Urgent Safety',
      description: 'Directly and confidentially report bullying, safety concerns, or emergency incidents to school guidance officers.',
      icon: AlertTriangle,
      logoGradient: 'from-amber-400 via-orange-500 to-rose-500',
      logoBg: 'bg-amber-50 border-amber-300 text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      accentColor: 'group-hover:border-amber-500 group-hover:shadow-amber-200',
      actionText: 'File Report',
      popular: true
    },
    {
      id: 'authority-chat',
      title: 'Alert Lines',
      tagline: 'Direct Guidance Line',
      animeBadge: '☎️ Hotline SOS',
      category: 'safety',
      categoryLabel: 'Direct Line',
      description: 'Connect directly with school counselors, guidance heads, or social workers for confidential 1-on-1 assistance.',
      icon: PhoneCall,
      logoGradient: 'from-rose-500 via-red-500 to-pink-600',
      logoBg: 'bg-rose-50 border-rose-300 text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      accentColor: 'group-hover:border-rose-500 group-hover:shadow-rose-200',
      actionText: 'Open Line',
      popular: false
    },
    {
      id: 'parent-monitoring',
      title: 'Parent & Child Portal',
      tagline: 'Family Safety Oversight',
      category: 'safety',
      categoryLabel: 'Family Safety',
      description: 'Enables parents and guardians to monitor real-time safety alerts, counselor check-ins, and emotional trends.',
      icon: Heart,
      logoGradient: 'from-emerald-600 to-green-700',
      logoBg: 'bg-green-50 border-green-200 text-green-700',
      badgeBg: 'bg-green-100 text-green-800 border-green-200',
      accentColor: 'group-hover:border-green-400',
      actionText: 'View Portal',
      popular: false
    },
    {
      id: 'admin-alerts',
      title: 'Admin Safety Desk',
      tagline: 'Role-Based Incident Response',
      category: 'safety',
      categoryLabel: 'Admin Safety',
      description: 'Centralized safety desk for guidance heads and administrators to triage high-risk alerts and dispatch support.',
      icon: ShieldAlert,
      logoGradient: 'from-rose-600 to-red-700',
      logoBg: 'bg-rose-50 border-rose-200 text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      accentColor: 'group-hover:border-rose-400',
      actionText: 'Manage Desk',
      popular: false
    }
  ];

  // Filter visible modules based on permissions
  const visibleModules = allTileModules.filter(m => permissions.allowedNavModules.includes(m.id as any));

  // Category search filter
  const filteredModules = visibleModules.filter(m => {
    const matchesCategory = selectedCategoryFilter === 'all' || m.category === selectedCategoryFilter;
    const matchesQuery = searchQuery.trim() === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full pt-3 sm:pt-6 pb-20 space-y-10 sm:space-y-12 lg:space-y-16">
          
          {/* Active User Account Header Banner - Crisp White Style */}
          {currentUser && currentRoleCfg && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${currentRoleCfg.badgeBg} ${currentRoleCfg.badgeText} border ${currentRoleCfg.border} flex items-center justify-center shrink-0 shadow-xs`}>
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Student Portal User:</span>
                    <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full ${currentRoleCfg.badgeBg} ${currentRoleCfg.badgeText} border ${currentRoleCfg.border} uppercase tracking-wider`}>
                      {currentRoleCfg.label}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">{getUserDisplayName(currentUser)}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={handleRefreshHistory}
                  disabled={isRefreshingHistory}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Refresh and re-synchronize all history logs"
                >
                  <RotateCcw className={`w-4 h-4 text-white ${isRefreshingHistory ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingHistory ? 'Refreshing...' : 'Refresh History'}</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 hover:border-emerald-500 hover:text-emerald-800"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Switch / Sign In Role</span>
                </button>
              </div>
            </div>
          )}

          {/* RED FLAG CRISIS ALERT SIGN ON DASHBOARD FOR AUTHORITIES & PARENTS */}
          {isAuthorityOrParent && hasUnresolvedAlerts && (
            <div className={`p-6 sm:p-7 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all duration-300 ${
              hasCriticalAlert 
                ? 'bg-rose-50 border-rose-500' 
                : 'bg-amber-50 border-amber-500'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-rose-200 pb-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    hasCriticalAlert ? 'bg-rose-600 text-white border-2 border-rose-400 animate-pulse' : 'bg-amber-500 text-white'
                  }`}>
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs ${
                        hasCriticalAlert ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        <span>🚩 RED FLAG ALERT</span>
                      </span>
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                        {hasCriticalAlert ? 'CRITICAL SAFETY DISPATCH' : 'HIGH RISK INCIDENT'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {hasCriticalAlert 
                        ? '🚨 URGENT: Safety Trigger Activated in Live Session' 
                        : '⚠️ Safety Incident Triggered Requiring Official Response'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-3xl leading-relaxed font-medium">
                      An automated safety keyword or sentiment trigger was recorded. Institutional guidance officers and guardians have been notified.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveModule(permissions.canAccessAdminAlerts ? 'admin-alerts' : 'parent-monitoring')}
                    className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      hasCriticalAlert 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                    }`}
                  >
                    <span>View Safety Desk ({unresolvedAlerts.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXCLUSIVE STUDENT DAILY CHECK-IN WIDGET (Rate your Day & Share feelings) */}
          {currentUser?.role === 'student' && (
            <div className="space-y-6">
              <StudentDashboardCheckInWidget 
                currentUser={currentUser} 
                onOpenCheckInModal={onOpenCheckInModal || (() => {})} 
              />
              <DailyAffirmationCard 
                onOpenJournal={() => setActiveModule('journaling')} 
                onOpenAffirmationHub={() => setActiveModule('daily-affirmations')}
              />
            </div>
          )}

          {/* Student Welcome Header & Search/Filter Controls */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  SafeSpace Student Portal
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Choose a Tool or Express Yourself
                </h1>

              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tools or options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-extrabold">
              {[
                { id: 'all', label: 'All Options', icon: Grid },
                { id: 'counseling', label: 'AI Counseling', icon: MessageSquare },
                { id: 'safety', label: 'Safety & Reporting', icon: ShieldCheck },
                { id: 'expression', label: 'Self Expression', icon: Activity },
                { id: 'wellness', label: 'Mindfulness & Journal', icon: Book }
              ].map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-yellow-300 border-emerald-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-yellow-300' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* MANDATORY MEDICAL & PROFESSIONAL DISCLAIMER BANNER FOR HOMEPAGE / DASHBOARD */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-amber-950 block mb-0.5">Medical & Professional Disclaimer</strong>
              Reflections, AI insights, and sentiment feedback in <strong>SafeSpace</strong> are provided for personal self-awareness, emotional tracking, and mindful reflection only. They do <strong>NOT</strong> represent or substitute for actual medical, psychological, or clinical consultation, diagnosis, or treatment with licensed doctors or mental health professionals.
            </div>
          </div>

          {/* ANIME-INSPIRED TILES GRID WITH PROMINENT LOGOS & JAPANESE SUBTEXT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-8">
            {filteredModules.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden h-full ${mod.accentColor}`}
                >
                  {/* Manga / Anime Background Subtle Dots Effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />

                  {/* Top Bar with Category & Sparkle for uniform top offset */}
                  <div className="w-full flex items-center justify-between z-10 min-h-[24px]">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${mod.badgeBg}`}>
                      {mod.categoryLabel || 'Feature'}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                  </div>

                  {/* Prominent Emblem Logo Box - Fixed Height Container for Perfect Alignment */}
                  <div className="my-4 flex items-center justify-center z-10 relative h-20 w-20 shrink-0">
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-sky-300/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${mod.logoGradient} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                      <ModIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  </div>

                  {/* Clean Title, Anime Badge & Tagline - Flex-1 so bottom button aligns */}
                  <div className="flex-1 w-full z-10 flex flex-col items-center justify-start space-y-1.5 min-h-[90px]">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors tracking-tight flex items-center justify-center gap-1.5">
                      <span>{mod.title}</span>
                      {mod.popular && (
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" title="Popular choice" />
                      )}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide border shadow-2xs ${mod.badgeBg}`}>
                      {mod.animeBadge}
                    </span>
                    {mod.tagline && (
                      <p className="text-xs font-semibold text-slate-500 line-clamp-2 px-1 text-center mt-1">
                        {mod.tagline}
                      </p>
                    )}
                  </div>

                  {/* Minimal Launch Action Indicator - Pinned to bottom */}
                  <div className="mt-4 pt-3 w-full border-t border-slate-100/80 flex items-center justify-center z-10">
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md group-hover:bg-purple-600 group-hover:scale-105">
                      <span>{mod.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 space-y-3">
              <p className="text-sm font-extrabold text-slate-700">No tools found matching your search.</p>
              <button
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-yellow-300 text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* 7-DAY RECHARTS EMOTIONAL VALENCE & AROUSAL TREND CHART */}
          <DashboardEmotionalTrendChart
            currentUser={currentUser}
            recordedEntries={recordedEntries}
            onOpenCheckInModal={onOpenCheckInModal}
          />

          {/* RECORDED JOURNAL ENTRIES & EXPRESSION HISTORY WITH REPORT ANALYSIS */}
          <div className="pt-10 sm:pt-14 border-t border-slate-200/80 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Your Recorded Entries & Report Analyses
                </h2>
              </div>

              {/* Category Filter Pills for Recorded Entries */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                <button
                  onClick={handleRefreshHistory}
                  disabled={isRefreshingHistory}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 font-extrabold transition-all flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Refresh and re-synchronize all history logs"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-white ${isRefreshingHistory ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingHistory ? 'Refreshing...' : 'Refresh History'}</span>
                </button>

                {[
                  { id: 'all', label: 'All History', icon: Activity },
                  { id: 'chat', label: '💬 Counselor Chat', icon: MessageSquare },
                  { id: 'journal', label: '📖 Journal', icon: Book },
                  { id: 'avatar', label: '✨ Avatar Studio', icon: Smile },
                  { id: 'sing-along', label: '🎤 Sing Along', icon: Music },
                  { id: 'inspiring-media', label: '✨ Inspiring Media', icon: Sparkles },
                  { id: 'video', label: '🌸 Share Video', icon: Video },
                  { id: 'audio', label: '🎤 Share Voice', icon: Mic },
                  { id: 'affirmation', label: '☀️ Affirmations', icon: Sun },
                  { id: 'circle', label: '👥 Circles', icon: Users },
                  { id: 'game', label: '🎮 Zen Games', icon: Gamepad2 },
                  { id: 'multimodal', label: '🎨 Share Feelings', icon: Sparkles },
                  { id: 'share-art', label: '🖼️ Share Arts', icon: Palette },
                  { id: 'meditation', label: '🍃 Breathing', icon: Wind },
                  { id: 'incident', label: '🛡️ SafeReport Incident', icon: ShieldAlert },
                  { id: 'authority-chat', label: '☎️ Alert Lines', icon: PhoneCall },
                  { id: 'parent-monitoring', label: '❤️ Parent Portal', icon: Heart },
                  { id: 'feature-usage', label: '📊 Feature Usage Stats', icon: BarChart3 }
                ].map((f) => {
                  const FIcon = f.icon;
                  const isSelected = selectedRecordedFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedRecordedFilter(f.id)}
                      className={`px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-900 text-white border-purple-900 shadow-sm font-extrabold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <FIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-300' : 'text-slate-500'}`} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Refresh Toast Notification */}
            {refreshToastMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2.5 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{refreshToastMsg}</span>
              </div>
            )}

            {/* SEARCH OPTION ASSISTING IN FINDING SPECIFIC ENTRY BASED ON TYPED KEYWORDS */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="entries-search-input" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>Search Entries & Report Analyses</span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  Showing {
                    recordedEntries
                      .filter(e => selectedRecordedFilter === 'all' || e.type === selectedRecordedFilter)
                      .filter(e => {
                        if (!entriesSearchKeyword.trim()) return true;
                        const q = entriesSearchKeyword.toLowerCase().trim();
                        return (
                          (e.title && e.title.toLowerCase().includes(q)) ||
                          (e.excerpt && e.excerpt.toLowerCase().includes(q)) ||
                          (e.typeLabel && e.typeLabel.toLowerCase().includes(q)) ||
                          (e.reportAnalysis?.dominantEmotion && e.reportAnalysis.dominantEmotion.toLowerCase().includes(q)) ||
                          (e.reportAnalysis?.copingSuggestion && e.reportAnalysis.copingSuggestion.toLowerCase().includes(q)) ||
                          (e.sharedWithFriends && e.sharedWithFriends.some(f => f.toLowerCase().includes(q))) ||
                          (e.comments && e.comments.some(c => c.content.toLowerCase().includes(q) || c.author.toLowerCase().includes(q))) ||
                          (e.chatTranscript && e.chatTranscript.some(c => c.content.toLowerCase().includes(q)))
                        );
                      }).length
                  } of {recordedEntries.length} entries
                </span>
              </div>

              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="entries-search-input"
                  type="text"
                  value={entriesSearchKeyword}
                  onChange={(e) => setEntriesSearchKeyword(e.target.value)}
                  placeholder="Type keywords to search entries (e.g. emotion, title, reflection, friend @name, or topic)..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
                />
                {entriesSearchKeyword ? (
                  <button
                    onClick={() => setEntriesSearchKeyword('')}
                    className="absolute right-2.5 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                ) : (
                  <span className="absolute right-3 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Keyword Search
                  </span>
                )}
              </div>
            </div>

            {/* Recorded Entries Display List */}
            <div className="grid grid-cols-1 gap-6">
              {recordedEntries
                .filter(e => selectedRecordedFilter === 'all' || e.type === selectedRecordedFilter)
                .filter(e => {
                  if (!entriesSearchKeyword.trim()) return true;
                  const q = entriesSearchKeyword.toLowerCase().trim();
                  return (
                    (e.title && e.title.toLowerCase().includes(q)) ||
                    (e.excerpt && e.excerpt.toLowerCase().includes(q)) ||
                    (e.typeLabel && e.typeLabel.toLowerCase().includes(q)) ||
                    (e.reportAnalysis?.dominantEmotion && e.reportAnalysis.dominantEmotion.toLowerCase().includes(q)) ||
                    (e.reportAnalysis?.copingSuggestion && e.reportAnalysis.copingSuggestion.toLowerCase().includes(q)) ||
                    (e.sharedWithFriends && e.sharedWithFriends.some(f => f.toLowerCase().includes(q))) ||
                    (e.comments && e.comments.some(c => c.content.toLowerCase().includes(q) || c.author.toLowerCase().includes(q))) ||
                    (e.chatTranscript && e.chatTranscript.some(c => c.content.toLowerCase().includes(q)))
                  );
                })
                .map((entry) => {
                  const isPlayingThisAudio = playingAudioId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Entry Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
                            {entry.typeLabel}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Report Analysis Verified
                          </span>

                          {/* Delete Item Button */}
                          {deletingEntryId === entry.id ? (
                            <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl animate-fadeIn">
                              <span className="text-[10px] font-extrabold text-rose-900 px-1">Delete item?</span>
                              <button
                                onClick={() => handleDeleteItem(entry.id)}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-xs"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingEntryId(null)}
                                className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingEntryId(entry.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                              title="Delete this history item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Entry Title & Content */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          {entry.title}
                        </h3>

                        {/* Media Display Component */}
                        {entry.type === 'video' && entry.mediaUrl && (
                          <div className="p-2 bg-slate-950 rounded-2xl my-2 max-w-md aspect-video overflow-hidden">
                            {entry.mediaUrl.includes('youtube') || entry.mediaUrl.includes('youtu.be') ? (
                              <iframe
                                src={entry.mediaUrl.includes('/embed/') ? entry.mediaUrl : `https://www.youtube.com/embed/${entry.mediaUrl.split('v=')[1]?.split('&')[0] || ''}`}
                                title={entry.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full rounded-xl border-0"
                              />
                            ) : (
                              <video
                                src={entry.mediaUrl}
                                controls
                                playsInline
                                className="w-full h-full rounded-xl object-cover bg-black"
                              />
                            )}
                          </div>
                        )}

                        {entry.type === 'audio' && (
                          <div className="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => togglePlayRecordedAudio(entry)}
                                className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-sm shrink-0 ${
                                  isPlayingThisAudio ? 'bg-indigo-700 ring-2 ring-indigo-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {isPlayingThisAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <div>
                                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                  <FileAudio className="w-4 h-4 text-indigo-600" />
                                  Recorded Voice File
                                </div>
                                <div className="text-[10px] text-indigo-700 font-mono mt-0.5">
                                  {isPlayingThisAudio ? 'Playing voice audio...' : `Duration: ${entry.audioDuration || 14}s • Click to play audio`}
                                </div>
                              </div>
                            </div>

                            {/* Soundwave graphic */}
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-100/80 border border-indigo-200">
                              {[10, 18, 14, 22, 12, 20, 16, 24, 10, 16].map((h, i) => (
                                <div
                                  key={i}
                                  style={{ height: `${h}px` }}
                                  className={`w-1 rounded-full transition-all duration-300 ${
                                    isPlayingThisAudio ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {(entry.type === 'multimodal' || entry.type === 'share-art' || entry.type === 'avatar' || entry.type === 'inspiring-media') && entry.mediaUrl && (
                          <div className="relative max-w-xs sm:max-w-md my-2 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-50 p-1">
                            <img
                              src={entry.mediaUrl}
                              alt={entry.title}
                              className="w-full max-h-56 object-contain rounded-xl bg-white"
                            />
                          </div>
                        )}

                        {/* Chat Transcript View Component */}
                        {entry.type === 'chat' && entry.chatTranscript && entry.chatTranscript.length > 0 && (
                          <div className="my-2 space-y-2">
                            <button
                              onClick={() => setExpandedChatTranscriptId(prev => prev === entry.id ? null : entry.id)}
                              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                              <span>
                                {expandedChatTranscriptId === entry.id 
                                  ? 'Hide Full Chat Transcript' 
                                  : `📜 View Full Chat Transcript (${entry.chatTranscript.length} messages)`}
                              </span>
                              {expandedChatTranscriptId === entry.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {expandedChatTranscriptId === entry.id && (
                              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3 text-xs max-h-80 overflow-y-auto custom-scrollbar animate-fadeIn">
                                <div className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider border-b border-purple-200 pb-1.5">
                                  Recorded Counselor Chat Transcript with SaFie
                                </div>
                                {entry.chatTranscript.map((chatMsg, msgIdx) => (
                                  <div
                                    key={msgIdx}
                                    className={`flex gap-2.5 p-2.5 rounded-xl text-xs leading-relaxed ${
                                      chatMsg.role === 'user'
                                        ? 'bg-purple-600 text-white ml-6 shadow-xs'
                                        : 'bg-white text-slate-800 border border-purple-100 shadow-2xs mr-6'
                                    }`}
                                  >
                                    <span className="font-extrabold shrink-0">
                                      {chatMsg.role === 'user' ? 'Student:' : 'Counselor SaFie:'}
                                    </span>
                                    <span>{chatMsg.content}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Excerpt text */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium leading-relaxed italic">
                          "{entry.excerpt}"
                        </div>
                      </div>

                      {/* COMPLETE REPORT ANALYSIS PANEL */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-md space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            <span className="font-extrabold text-sm text-white">SafeSpace Observation & Sentiment Analysis Report</span>
                          </div>

                          <div className="flex flex-row items-center gap-2 sm:gap-2.5 shrink-0">
                            <button
                              onClick={() => downloadRecordedEntryCsv(entry)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                              title="Download complete report as CSV"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download CSV Report</span>
                            </button>
                            <button
                              onClick={() => downloadRecordedEntryPdf(entry)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                              title="Download complete report as PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Report PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* PROMINENT HIGHLIGHTED WELLNESS GUIDELINES & SUPPORT MEASURES BANNER AT TOP OF ANALYSIS */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-600/20 border-2 border-amber-400/80 text-amber-100 shadow-md flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 shrink-0 border border-amber-400/50 shadow-xs mt-0.5">
                            <ShieldCheck className="w-5 h-5 text-amber-300" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-xs sm:text-sm text-amber-200 tracking-tight uppercase">
                                🌟 Wellness Guidelines & Support Measures
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide shadow-xs">
                                Essential Notice
                              </span>
                            </div>
                            <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                              All personal entries, voice recordings, and AI reflection analyses are protected under student privacy guidelines and provided strictly for self-awareness and reflective exploration.
                            </p>
                            <p className="text-[11px] text-amber-200/80 leading-normal font-sans pt-1 border-t border-amber-500/30 mt-1">
                              <strong>Important Disclaimer:</strong> This automated report does <strong>NOT</strong> substitute for consultation, diagnosis, or treatment with medical or healthcare professionals. For immediate counseling or emergency support, please visit the <strong>Student Authority Desk</strong> or <strong>Parent Portal</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Sentiment Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Dominant Emotion</div>
                            <div className="text-sm font-black text-indigo-300 mt-0.5">{entry.reportAnalysis.dominantEmotion}</div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Valence / Sentiment</div>
                            <div className="text-sm font-black text-emerald-400 mt-0.5">
                              +{(entry.reportAnalysis.valenceScore * 100).toFixed(0)}% ({entry.reportAnalysis.sentimentLabel})
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">ACTIVITY / ENERGY</div>
                            <div className="text-sm font-black text-purple-300 mt-0.5">
                              {(entry.reportAnalysis.arousalScore * 100).toFixed(0)}% Balanced
                            </div>
                          </div>
                        </div>

                        {/* Summary Observation */}
                        <div className="text-xs text-slate-200 leading-relaxed font-sans bg-white/5 p-3 rounded-xl border border-white/10">
                          <strong className="text-indigo-300">SafeSpace Observation: </strong>
                          {entry.reportAnalysis.summaryObservation}
                        </div>

                        {/* SafeSpace Insights List */}
                        <div className="space-y-1.5 text-xs text-slate-300">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SafeSpace Insights:</div>
                          <ul className="space-y-1 pl-1">
                            {entry.reportAnalysis.psychologistInsights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* SafeSpace Counselor Note */}
                        <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-xs text-indigo-200 flex items-start gap-2">
                          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white">SafeSpace Counselor Note: </span>
                            {entry.reportAnalysis.guidanceNote}
                          </div>
                        </div>
                      </div>

                      {/* SHARE TO A FRIEND SECTION BOX */}
                      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs space-y-3 text-slate-800">
                        <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                              Share to a Friend
                            </span>
                            {entry.sharedWithFriends && entry.sharedWithFriends.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-2xs">
                                Shared ({entry.sharedWithFriends.length})
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-indigo-700 font-medium">Type SafeSpace account name</span>
                        </div>

                        {/* Shared Friends Chips List */}
                        {entry.sharedWithFriends && entry.sharedWithFriends.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] font-bold text-indigo-900">Shared with:</span>
                            {entry.sharedWithFriends.map((friend) => (
                              <span
                                key={friend}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-indigo-900 border border-indigo-200 shadow-2xs"
                              >
                                <User className="w-3 h-3 text-indigo-600" />
                                <span>{friend}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUnshareWithFriend(entry.id, friend)}
                                  className="ml-0.5 text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                                  title={`Remove sharing with ${friend}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Share Input Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleShareWithFriend(entry.id);
                          }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={shareInputs[entry.id] || ''}
                            onChange={(e) => setShareInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            placeholder="Type SafeSpace account name (e.g. @maya_san or Alex)"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                          />
                          <button
                            type="submit"
                            disabled={!shareInputs[entry.id]?.trim()}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Share to Friend</span>
                          </button>
                        </form>
                      </div>

                      {/* USER COMMENTS / REFLECTION SECTION BOX */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3 text-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-purple-600" />
                            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                              Entry Comments & Reflection ({entry.comments?.length || 0})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Add reflection on this entry</span>
                        </div>

                        {/* Comments List */}
                        {entry.comments && entry.comments.length > 0 ? (
                          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                            {entry.comments.map((comment) => (
                              <div key={comment.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-purple-900">{comment.authorName || 'User Reflection'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 font-medium">
                                      {new Date(comment.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteComment(entry.id, comment.id)}
                                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm transition-colors cursor-pointer"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic py-1">
                            No comments yet. Write your thoughts or follow-up notes on this entry below.
                          </div>
                        )}

                        {/* Comment Input Box */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddComment(entry.id);
                          }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={commentInputs[entry.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            placeholder="Write a comment or personal reflection..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
                          />
                          <button
                            type="submit"
                            disabled={!commentInputs[entry.id]?.trim()}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Post Comment</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Bottom Student Safety Guarantee */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900">Student Privacy & Confidentiality Protection</div>
                <div className="text-slate-500 font-medium mt-0.5">
                  All personal journals, voice notes, and AI conversations are protected under student privacy guidelines.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-600 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DepEd & Anti-Bullying Compliant</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



