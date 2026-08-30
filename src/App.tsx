import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Activity, Shield, Code, PlayCircle, Users, BarChart3, Presentation,
  UploadCloud, ArrowRight, CheckCircle2, ChevronRight, X, Image as ImageIcon,
  MessageSquare, Loader2, Sparkles, Smile, Frown, Meh, Video, Mic, Phone,
  ArrowLeft, MoreVertical, Share2, Settings, Play, Pause, Square, Volume2, VolumeX, Book, Wind, Upload, Camera, ShieldAlert, PhoneCall, Menu, HeartHandshake, BookOpen, LogIn, User, Heart, AlertTriangle, Download, FileText, Palette, Radio, Music, Sun, Gamepad2
} from 'lucide-react';

import { downloadAudioReportPdf } from './utils/pdfExport';
import { saveRecordedEntry } from './utils/recordedEntriesStore';
import { getSupportedAudioMimeType } from './utils/audioPlayback';

import JournalingModule from './components/JournalingModule';
import MeditationsModule from './components/MeditationsModule';
import ShareYourArtsModule from './components/ShareYourArtsModule';
import InspiringMediaModule from './components/InspiringMediaModule';
import SingAlongModule from './components/SingAlongModule';
import HomeModule from './components/HomeModule';
import ChatbotModule from './components/ChatbotModule';
import AdminAlertsModule from './components/AdminAlertsModule';
import ParentMonitoringModule from './components/ParentMonitoringModule';
import AuthorityMessagingModule from './components/AuthorityMessagingModule';
import ReportIncidentModule from './components/ReportIncidentModule';
import TopAuthorityMessageBanner from './components/TopAuthorityMessageBanner';
import AudioValenceArousalTimeline from './components/AudioValenceArousalTimeline';
import AuthModal from './components/AuthModal';
import LocationTrackerBadge from './components/LocationTrackerBadge';
import StudentCheckInModal from './components/StudentCheckInModal';
import SafieMascot from './components/SafieMascot';
import CreateAvatarModule from './components/CreateAvatarModule';
import DailyAffirmationModule from './components/DailyAffirmationModule';
import ConnectCirclesModule from './components/ConnectCirclesModule';
import SafeSpaceGamesModule from './components/SafeSpaceGamesModule';
import { DEMO_USERS, UserProfile, ROLE_CONFIGS, UserRole, getRolePermissions, getUserDisplayName } from './types/auth';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [initialModule, setInitialModule] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isStudentCheckInOpen, setIsStudentCheckInOpen] = useState<boolean>(false);

  const handleLaunch = (module: string = 'home') => {
    setInitialModule(module as any);
    setView('dashboard');
  };

  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setIsStudentCheckInOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20">
      {view === 'landing' ? (
        <LandingPage 
          onLaunch={handleLaunch} 
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <Dashboard 
          onBack={() => setView('landing')} 
          initialModule={initialModule} 
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCheckInModal={() => setIsStudentCheckInOpen(true)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleUserLogin}
      />

      <StudentCheckInModal
        isOpen={isStudentCheckInOpen}
        onClose={() => setIsStudentCheckInOpen(false)}
        currentUser={currentUser}
      />

      <SafieMascot
        currentUser={currentUser}
        onNavigate={(mod) => handleLaunch(mod)}
        onOpenCheckInModal={() => setIsStudentCheckInOpen(true)}
      />
    </div>
  );
}

function LandingPage({ 
  onLaunch, 
  currentUser, 
  onOpenAuth 
}: { 
  onLaunch: (module?: string) => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
}) {
  const roleCfg = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left group"
          title="Go to Homepage"
          aria-label="SafeSpace Homepage"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">SafeSpace</span>
        </button>

        <div className="flex items-center gap-3">
          {/* User Role Badge */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:border-indigo-500/50 transition-all text-xs text-slate-700 hover:text-slate-900"
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
            <span className="font-semibold">{getUserDisplayName(currentUser)}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleCfg.badgeBg} ${roleCfg.badgeText} border ${roleCfg.border}`}>
              {roleCfg.shortLabel}
            </span>
          </button>

          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 rounded-full bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sign In / Register</span>
          </button>

          <button 
            onClick={() => onLaunch()}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-95 transition-opacity shadow-sm"
          >
            Launch Portal
          </button>
        </div>
      </nav>

      <section className="relative px-6 py-24 lg:px-12 lg:py-32 flex flex-col items-center text-center overflow-hidden bg-slate-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium mb-8">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Multimodal Emotion Recognition</span>
        </div>
        
        <h1 className="font-bold tracking-tight mb-6 max-w-4xl text-slate-900">
          <span className="text-5xl lg:text-7xl block font-extrabold tracking-tight">This is your Safe Space</span>
          <span className="text-3xl lg:text-5xl text-indigo-900 font-semibold mt-2 block">Share your True Feelings</span>
          <span className="text-3xl lg:text-5xl text-indigo-900 font-semibold mt-1 block">Share your Real Voice</span>
        </h1>
        
        <p className="text-lg text-slate-600 mb-20 sm:mb-24 max-w-2xl leading-relaxed">
          SafeSpace is your app to navigate the ups and downs of academic life with guided reflections to help you thrive both in and out of the classroom.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7 lg:gap-8 w-full max-w-5xl mx-auto">
          {/* Row 1 */}
          <button onClick={() => onLaunch('chat')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">Your Friend SaFie</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-purple-100 text-purple-900 border-purple-300 shadow-2xs">
                 ✨ SaFie AI
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('video')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-rose-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Video className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-rose-700 transition-colors">Share Your Video</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-pink-100 text-pink-900 border-pink-300 shadow-2xs">
                 🌸 Time Capsule
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('audio')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-indigo-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-indigo-700 transition-colors">Share Voice</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-indigo-100 text-indigo-900 border-indigo-300 shadow-2xs">
                 🎤 Voice Note
               </span>
             </div>
          </button>

          {/* Row 2 */}
          <button onClick={() => onLaunch('multimodal')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-sky-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-sky-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-teal-400 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Activity className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-sky-700 transition-colors">Share your feelings</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-sky-100 text-sky-900 border-sky-300 shadow-2xs">
                 🎨 Mood Canvas
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('share-art')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-amber-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400 via-rose-400 to-indigo-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Palette className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">Share your Arts</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-amber-100 text-amber-900 border-amber-300 shadow-2xs">
                 🎨 Art Therapy
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('sing-along')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-pink-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Music className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-pink-700 transition-colors">Sing Along</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-pink-100 text-pink-900 border-pink-300 shadow-2xs">
                 🎤 Karaoke Studio
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('create-avatar')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Smile className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">Create Avatar</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-pink-100 text-pink-900 border-pink-300 shadow-2xs">
                 ✨ Avatar Studio
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('inspiring-media')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">Inspiring Media</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-purple-100 text-purple-900 border-purple-300 shadow-2xs">
                 ✨ Inspiration Hub
               </span>
             </div>
          </button>

          {/* Row 3 */}
          <button onClick={() => onLaunch('journaling')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Book className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors">Your Journal</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs">
                 📖 Private Space
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('meditations')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-teal-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-teal-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-400 via-emerald-500 to-sky-400 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <Wind className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-teal-700 transition-colors">Breathing Helps</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-teal-100 text-teal-900 border-teal-300 shadow-2xs">
                 🍃 Healing Flow
               </span>
             </div>
          </button>

          <button onClick={() => onLaunch('report-incident')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-amber-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">Report Incident</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-amber-100 text-amber-900 border-amber-300 shadow-2xs">
                 🛡️ Private Guard
               </span>
             </div>
          </button>

          {/* Row 4 */}
          <button onClick={() => onLaunch('authority-chat')} className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-rose-500 hover:-translate-y-1.5 transition-all flex flex-col items-center justify-between text-center gap-3 group relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
             <div className="w-full flex items-center justify-end z-10">
               <Sparkles className="w-3.5 h-3.5 text-rose-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
             </div>
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
               <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10" />
             </div>
             <div className="z-10 flex flex-col items-center gap-1.5">
               <div className="font-black text-slate-900 text-base group-hover:text-rose-700 transition-colors">Alert Lines</div>
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-rose-100 text-rose-900 border-rose-300 shadow-2xs">
                 ☎️ Hotline SOS
               </span>
             </div>
          </button>
        </div>
      </section>

      <section id="platform" className="px-6 py-24 lg:px-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">Core Capabilities</h2>
            <p className="text-slate-600 max-w-2xl">A complete, confidential, AI-powered mental wellness & emergency response architecture built for students, families, and schools.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
                title: 'Counselor SaFie AI Assistant',
                desc: '24/7 empathetic conversational guidance for students feeling stressed, overwhelmed, or anxious with non-judgmental listening & coping tools.'
              },
              {
                icon: <Activity className="w-6 h-6 text-indigo-600" />,
                title: 'Multimodal Emotional Check-ins',
                desc: 'Captures text sentiment, audio vocal tone, and video self-reflections to analyze valence & activity levels for deep self-awareness.'
              },
              {
                icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
                title: 'Alert Lines Protocol',
                desc: 'Automatic trigger-keyword identification with instant confidential notifications dispatched to guidance counselors & parents for urgent support.'
              },
              {
                icon: <HeartHandshake className="w-6 h-6 text-emerald-600" />,
                title: 'Encrypted Privacy & Role Security',
                desc: 'Role-segregated access across 9 stakeholder groups (Students, Parents, Counselors, Admins, Social Workers) protecting sensitive student data.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="px-6 py-24 lg:px-12 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">Ecosystem of Support</h2>
            <p className="text-slate-600 max-w-2xl">SafeSpace connects every guardian, educator, and support specialist around student well-being.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <User />, title: 'Students & Youth', desc: 'A safe place to express feelings, journal, practice breathing exercises, and chat anytime with Friend SaFie.' },
              { icon: <Heart />, title: 'Parents & Guardians', desc: 'Real-time wellness alerts, sentiment trend summaries, and direct communication channels with school guidance.' },
              { icon: <BookOpen />, title: 'Counselors & Teachers', desc: 'Centralized safety desk to monitor alert lines, send gentle outreach, and schedule in-person support.' },
              { icon: <PhoneCall />, title: 'Crisis Hotlines & Authorities', desc: 'Integrated emergency hotline connections (Hopeline 177, NCMH 1553, WCPD) for immediate crisis coordination.' }
            ].map((useCase, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-200">
                  {React.cloneElement(useCase.icon as React.ReactElement, { className: 'w-8 h-8' })}
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900">{useCase.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>

          {/* MEDICAL & PROFESSIONAL DISCLAIMER BANNER FOR HOMEPAGE */}
          <div className="mt-12 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-amber-950 block mb-0.5 text-sm">Medical & Professional Disclaimer</strong>
              Reflections, AI insights, and sentiment feedback in <strong>SafeSpace</strong> are provided for personal self-awareness, emotional tracking, and mindful reflection only. They do <strong>NOT</strong> represent or substitute for actual medical, psychological, or clinical consultation, diagnosis, or treatment with licensed doctors or mental health professionals.
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 text-center text-sm text-slate-500 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} SafeSpace Replica. Demonstration platform.
      </footer>
    </div>
  );
}

// --- Dashboard Component ---

function Dashboard({ 
  onBack, 
  initialModule = 'home',
  currentUser,
  onOpenAuth,
  onOpenCheckInModal
}: { 
  onBack: () => void; 
  initialModule?: string;
  currentUser?: UserProfile;
  onOpenAuth?: () => void;
  onOpenCheckInModal?: () => void;
}) {
  const userRole = currentUser?.role || 'student';
  const permissions = getRolePermissions(userRole);

  const [activeModule, setActiveModule] = useState<string>(
    (initialModule === 'admin-alerts' && !permissions.canAccessAdminAlerts) ? 'home' : initialModule
  );

  useEffect(() => {
    if (initialModule) {
      setActiveModule((initialModule === 'admin-alerts' && !permissions.canAccessAdminAlerts) ? 'home' : initialModule);
    }
  }, [initialModule, permissions.canAccessAdminAlerts]);
  const [selectedAlertForChat, setSelectedAlertForChat] = useState<{
    alertId?: string;
    studentLrn?: string;
    category?: string;
    triggerReason?: string;
    flaggedContent?: string;
  } | null>(null);

  const [unresolvedAlertCount, setUnresolvedAlertCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleOpenAuthorityChatFromAlert = (alert: any) => {
    setSelectedAlertForChat({
      alertId: alert.id,
      studentLrn: alert.userSessionId || '109283748291',
      category: alert.category,
      triggerReason: alert.triggerReason,
      flaggedContent: alert.flaggedContent
    });
    setActiveModule('authority-chat');
  };

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
          setUnresolvedAlertCount(data.unresolvedCount || 0);
        }
      } catch (e) {
        // Silent catch
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const allNavItems = [
    { id: 'home', label: 'Dashboard Flashback', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-600/10' },
    { id: 'chat', label: 'Ask Safie', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-600/10' },
    { id: 'create-avatar', label: 'Create Avatar', icon: Smile, color: 'text-pink-500', bg: 'bg-pink-600/10' },
    { id: 'video', label: 'Share Your Video', icon: Video, color: 'text-rose-500', bg: 'bg-rose-600/10' },
    { id: 'audio', label: 'Share Voice', icon: Mic, color: 'text-indigo-500', bg: 'bg-indigo-600/10' },
    { id: 'multimodal', label: 'Share Feelings', icon: Activity, color: 'text-sky-500', bg: 'bg-sky-600/10' },
    { id: 'share-art', label: 'Share your Arts', icon: Palette, color: 'text-amber-500', bg: 'bg-amber-600/10' },
    { id: 'sing-along', label: 'Sing Along', icon: Music, color: 'text-pink-500', bg: 'bg-pink-600/10' },
    { id: 'inspiring-media', label: 'Inspiring Media', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-600/10' },
    { id: 'daily-affirmations', label: 'Daily Affirmations', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-600/10' },
    { id: 'connect-circles', label: 'Connect with Circles', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-600/10' },
    { id: 'safespace-games', label: 'SafeSpace Games', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-600/10' },
    { id: 'journaling', label: 'Your Journal', icon: Book, color: 'text-emerald-500', bg: 'bg-emerald-600/10' },
    { id: 'meditations', label: 'Breathing Helps', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-600/10' },
    { id: 'report-incident', label: 'Report Incident', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-600/10' },
    { id: 'authority-chat', label: 'Alert Lines', icon: PhoneCall, color: 'text-rose-600', bg: 'bg-rose-600/10' },
    { id: 'parent-monitoring', label: 'Parent & Child Safety Portal', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-600/10' },
  ];

  // Filter navigation items based on user designation permissions
  const navItems = allNavItems.filter(item => permissions.allowedNavModules.includes(item.id as any));

  const roleCfg = currentUser ? ROLE_CONFIGS[currentUser.role] : null;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/20">
      {/* Top Floating High-Priority Authority / Parent Message Banner */}
      <TopAuthorityMessageBanner
        currentUser={currentUser}
        onOpenAuthorityChat={() => setActiveModule('authority-chat')}
      />

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
          <button 
            onClick={() => setActiveModule('home')} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group text-left cursor-pointer"
            title="Go to Home"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">SafeSpace</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <LocationTrackerBadge compact />

          {currentUser && roleCfg && (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
              <span className="truncate max-w-[110px]">{getUserDisplayName(currentUser)}</span>
              <span className={`px-1.5 py-0.2 rounded-full ${roleCfg.badgeBg} ${roleCfg.badgeText}`}>
                {roleCfg.shortLabel}
              </span>
            </button>
          )}

          {permissions.canAccessAdminAlerts && (
            <button
              onClick={() => {
                setActiveModule('admin-alerts');
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 min-h-[44px] transition-all ${
                unresolvedAlertCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${unresolvedAlertCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>Safety Desk</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                unresolvedAlertCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {unresolvedAlertCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
            <button 
              onClick={() => {
                setActiveModule('home');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">SafeSpace Menu</span>
                <span className="text-[10px] text-slate-500">Tap to return Home</span>
              </div>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-slate-50">
            {currentUser && roleCfg && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 mb-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Logged In User:</div>
                  <div className="text-sm font-bold text-slate-900">{getUserDisplayName(currentUser)}</div>
                  <div className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded-full ${roleCfg.badgeBg} ${roleCfg.badgeText} mt-1`}>
                    {roleCfg.label}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold"
                >
                  Switch Role
                </button>
              </div>
            )}

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Navigation Modules</div>
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-start text-left gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                    isActive 
                      ? `${item.bg} ${item.color} border border-slate-200 shadow-sm font-bold` 
                      : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <ItemIcon className={`w-5 h-5 shrink-0 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {permissions.canAccessAdminAlerts && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveModule('admin-alerts');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] border ${
                    activeModule === 'admin-alerts'
                      ? unresolvedAlertCount > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <ShieldAlert className={`w-5 h-5 shrink-0 ${unresolvedAlertCount > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`} />
                    <span>Admin Safety Desk</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    unresolvedAlertCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {unresolvedAlertCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBack();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm border border-slate-200 min-h-[44px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Landing Page
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        onBack={onBack} 
        unresolvedAlertCount={unresolvedAlertCount} 
        navItems={navItems}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative bg-slate-50 custom-scrollbar">
         {/* Global Urgent Safety Alert Banner - visible ONLY to authorized Authority roles */}
         {permissions.canAccessAdminAlerts && unresolvedAlertCount > 0 && activeModule !== 'admin-alerts' && (
           <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 border-b border-rose-500/40 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-rose-200 shrink-0 shadow-lg animate-pulse">
             <div className="flex items-center gap-3">
               <span className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300 border border-rose-500/50 shrink-0">
                 <ShieldAlert className="w-4 h-4 animate-bounce" />
               </span>
               <div>
                 <span className="font-bold text-white uppercase tracking-wider">CRISIS & SAFETY ALERT ({unresolvedAlertCount}):</span>{" "}
                 <span className="text-rose-200">Automatic safety alert triggered for suicide, crime, or illegal activity insinuation.</span>
               </div>
             </div>
             <button
               onClick={() => setActiveModule('admin-alerts')}
               className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow transition-colors flex items-center justify-center gap-1.5 shrink-0 min-h-[40px]"
             >
               Review Admin Desk <ArrowRight className="w-3 h-3" />
             </button>
           </div>
         )}

         {activeModule === 'home' && (
           <HomeModule 
             setActiveModule={setActiveModule} 
             currentUser={currentUser} 
             onOpenAuth={onOpenAuth}
             onOpenCheckInModal={onOpenCheckInModal}
           />
         )}
         {activeModule === 'report-incident' && (
           <ReportIncidentModule
             currentUser={currentUser}
             onBackToDashboard={() => setActiveModule('home')}
             onOpenAuthorityChat={() => setActiveModule('authority-chat')}
           />
         )}
         {activeModule === 'parent-monitoring' && <ParentMonitoringModule currentUser={currentUser} />}
         {activeModule === 'multimodal' && <MultimodalEngine onBack={onBack} />}
         {activeModule === 'audio' && <AudioEngine />}
         {activeModule === 'video' && <VideoEngine />}
         {activeModule === 'daily-affirmations' && <DailyAffirmationModule onBackToDashboard={() => setActiveModule('home')} />}
         {activeModule === 'connect-circles' && <ConnectCirclesModule currentUser={currentUser} onBackToDashboard={() => setActiveModule('home')} />}
         {activeModule === 'safespace-games' && <SafeSpaceGamesModule onBackToDashboard={() => setActiveModule('home')} />}
         {activeModule === 'journaling' && <JournalingModule />}
         {activeModule === 'meditations' && <MeditationsModule />}
         {activeModule === 'create-avatar' && <CreateAvatarModule currentUser={currentUser} onNavigateToDashboard={() => setActiveModule('home')} />}
          {activeModule === 'share-art' && <ShareYourArtsModule currentUser={currentUser} onNavigateToDashboard={() => setActiveModule('home')} />}
         {activeModule === 'inspiring-media' && <InspiringMediaModule currentUser={currentUser} onNavigateToDashboard={() => setActiveModule('home')} />}
          {activeModule === 'chat' && <ChatbotModule />}
         {activeModule === 'admin-alerts' && (
           <AdminAlertsModule 
             currentUser={currentUser} 
             onOpenAuthorityChat={handleOpenAuthorityChatFromAlert}
            />
          )}
          {activeModule === 'sing-along' && <SingAlongModule currentUser={currentUser} onNavigateToDashboard={() => setActiveModule('home')} />}
         {activeModule === 'authority-chat' && (
           <AuthorityMessagingModule
             currentUser={currentUser}
             initialAlertId={selectedAlertForChat?.alertId}
             initialStudentLrn={selectedAlertForChat?.studentLrn}
             initialRedFlagCategory={selectedAlertForChat?.category}
             initialTriggerReason={selectedAlertForChat?.triggerReason}
             initialFlaggedContent={selectedAlertForChat?.flaggedContent}
             onBackToDashboard={() => setActiveModule('home')}
           />
         )}
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 6px;
        }
      `}} />
    </div>
  );
}

function Sidebar({ activeModule, setActiveModule, onBack, unresolvedAlertCount = 0, navItems = [], currentUser, onOpenAuth }: any) {
  const userRole = currentUser?.role || 'student';
  const permissions = getRolePermissions(userRole);
  const roleCfg = currentUser ? ROLE_CONFIGS[currentUser.role as UserRole] : null;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex shrink-0 shadow-sm">
      <button 
        onClick={() => {
          if (activeModule === 'home' && typeof onBack === 'function') {
            onBack();
          } else {
            setActiveModule('home');
          }
        }} 
        className="p-4 border-b border-slate-200 flex items-center gap-3 w-full text-left hover:bg-indigo-50/60 active:bg-indigo-100/80 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        title="Go to Homepage"
        aria-label="Go to Homepage"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-transform">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight flex items-center gap-1">
            SafeSpace
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mental Wellness Portal</span>
        </div>
      </button>

      {/* Auto Location Tracker Header Pill */}
      <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-teal-600 animate-pulse" /> Live GPS Tracker
          </span>
          <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-mono text-[9px] font-bold border border-teal-200">
            ACTIVE
          </span>
        </div>
        <LocationTrackerBadge />
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Navigation</div>
        <nav className="space-y-1 mb-6">
          {navItems.map((item: any) => {
            const ItemIcon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-start text-left gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? `${item.bg} ${item.color} font-bold border border-slate-200/60 shadow-xs` 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ItemIcon className={`w-4 h-4 shrink-0 ${item.color}`} /> 
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {permissions.canAccessAdminAlerts && (
            <button 
              onClick={() => setActiveModule('admin-alerts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeModule === 'admin-alerts' 
                  ? unresolvedAlertCount > 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShieldAlert className={`w-4 h-4 shrink-0 transition-colors ${
                  unresolvedAlertCount > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'
                }`} /> Admin Safety Desk
              </span>
              {unresolvedAlertCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                  {unresolvedAlertCount}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  0
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* User Role Profile Card in Sidebar */}
      {currentUser && roleCfg && (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg ${roleCfg.badgeBg} ${roleCfg.badgeText} flex items-center justify-center shrink-0 border border-slate-200`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{getUserDisplayName(currentUser)}</div>
              <div className="text-[10px] text-slate-500 truncate">{roleCfg.label}</div>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <LogIn className="w-3 h-3 text-indigo-600" />
            <span>Switch Account (9 Roles)</span>
          </button>
        </div>
      )}

      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={onBack}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Site
        </button>
      </div>
    </aside>
  );
}

function MultimodalEngine({ onBack }: { onBack: () => void }) {
  const [textInput, setTextInput] = useState('');
  
  // Capture Image State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Upload Image State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSourceTile, setActiveSourceTile] = useState<'text' | 'capture' | 'upload' | null>(null);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError('');
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let msg = 'Camera unavailable or in use. You can upload an image file directly instead.';
      if (err?.name === 'NotReadableError' || String(err?.message || '').toLowerCase().includes('in use') || err?.name === 'TrackStartError') {
        msg = '📷 Camera is currently in use by another program or tab. Please close other camera apps or upload an image file directly.';
      } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = '🔒 Camera permission denied. Please grant permission in browser or upload an image.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!cameraVideoRef.current) return;
    const video = cameraVideoRef.current;
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysisForTile = async (source: 'text' | 'capture' | 'upload') => {
    let payload: any = { sourceModule: 'Share Feelings (Multimodal)' };

    if (source === 'text') {
      if (!textInput.trim()) return;
      payload.text = textInput;
    } else if (source === 'capture') {
      if (!capturedImage) return;
      payload.imageBase64 = capturedImage;
      payload.mimeType = 'image/jpeg';
    } else if (source === 'upload') {
      if (!uploadedImage) return;
      payload.imageBase64 = uploadedImage;
      payload.mimeType = uploadedFile?.type || 'image/jpeg';
    }

    setIsAnalyzing(true);
    setActiveSourceTile(source);
    setError('');
    setResults(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Analysis failed.');
      }
      const data = await res.json();
      if (data?.safetyAlertTriggered && data?.alertDetails) {
        window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
      }
      setResults(data);

      saveRecordedEntry({
        type: 'multimodal',
        typeLabel: '🎨 Recorded "Share Feelings"',
        title: source === 'text' ? 'Feelings Reflection Note' : 'Visual Mood & Photo Canvas',
        excerpt: source === 'text' ? textInput : 'Uploaded visual mood photo for emotional signal analysis.',
        mediaUrl: source === 'text' ? undefined : (source === 'capture' ? capturedImage || undefined : uploadedImage || undefined),
        reportAnalysis: {
          dominantEmotion: data.overallSentiment || 'Empathetic Reflection',
          valenceScore: 0.85,
          arousalScore: 0.40,
          sentimentLabel: data.overallSentiment || 'Balanced',
          summaryObservation: data.summary || 'Multimodal emotional analysis complete.',
          psychologistInsights: data.insights || ['Visual or text expression reflects open emotional awareness.'],
          guidanceNote: data.guidanceCounselorNote || 'Your feelings canvas has been recorded securely.',
          safetyStatus: data.safetyAlertTriggered ? 'FLAGGED' : 'SAFE'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('distress') || s.includes('crisis') || s.includes('stress') || s.includes('anxiet') || s.includes('grief') || s.includes('sad') || s.includes('fear') || s.includes('overwhelmed') || s.includes('pain') || s.includes('negative') || s.includes('fatigue') || s.includes('risk') || s.includes('concern')) {
      return <Frown className="w-6 h-6 text-rose-500 shrink-0" />;
    }
    if (s.includes('positive') || s.includes('joy') || s.includes('calm') || s.includes('hope') || s.includes('proud') || s.includes('happy') || s.includes('optimis') || s.includes('enthusias') || s.includes('serene') || s.includes('peace') || s.includes('vibrant') || s.includes('tranquil')) {
      return <Smile className="w-6 h-6 text-emerald-500 shrink-0" />;
    }
    return <Sparkles className="w-6 h-6 text-indigo-500 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
      <header className="h-14 border-b border-slate-200 px-6 flex items-center bg-white/80 sticky top-0 z-10 backdrop-blur-md md:hidden">
        <button onClick={onBack} className="mr-4 text-slate-600"><ArrowRight className="w-5 h-5 rotate-180"/></button>
        <span className="font-medium text-sm text-slate-900">New Analysis</span>
      </header>

      <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Multimodal Analysis Engine</h1>
          <p className="text-slate-600 text-sm">Input text, snap a camera snapshot, or upload an image to analyze emotional dimensions.</p>
        </div>

        {/* 3 Symmetrical Top Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Tile 1: Text */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between h-[460px] relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-900 text-base">Text</span>
              </div>
              <span className="text-xs text-slate-500 block mb-3">Analyze text & sentiment</span>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste text to analyze emotional tone..."
                className="w-full h-[270px] bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs leading-relaxed outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none text-slate-800"
              />
            </div>
            <button
              onClick={() => runAnalysisForTile('text')}
              disabled={isAnalyzing || !textInput.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs mt-2"
            >
              {isAnalyzing && activeSourceTile === 'text' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isAnalyzing && activeSourceTile === 'text' ? 'Analyzing...' : 'Analyze Text'}</span>
            </button>
          </div>

          {/* Tile 2: Capture Image */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between h-[460px] relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Camera className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-slate-900 text-base">Capture Image</span>
              </div>
              <span className="text-xs text-slate-500 block mb-3">Snap photo via webcam</span>
              
              <div className="w-full h-[270px] bg-slate-900/5 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
                {capturedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={capturedImage} alt="Captured Snapshot" className="max-w-full max-h-[250px] object-contain rounded border border-slate-200 shadow-xs" />
                    <button
                      onClick={() => { setCapturedImage(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
                      title="Retake Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isCameraActive ? (
                  <div className="w-full h-full flex flex-col items-center justify-between p-2 relative bg-slate-950">
                    <video
                      ref={(el) => {
                        cameraVideoRef.current = el;
                        if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                          el.srcObject = cameraStreamRef.current;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-[205px] object-contain rounded border border-slate-800"
                    />
                    <div className="flex items-center gap-2 w-full justify-center py-1 bg-slate-900/80 rounded">
                      <button
                        onClick={capturePhoto}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Capture Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <Camera className="w-10 h-10 text-rose-500 mb-2 opacity-80" />
                    <span className="text-xs text-slate-700 mb-1 font-semibold">Live Camera View</span>
                    <span className="text-[11px] text-slate-500 mb-3 max-w-[200px]">Turn on camera to see your live preview frame</span>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Turn On Camera
                    </button>
                    {cameraError && (
                      <div className="text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 mt-2 text-center">
                        {cameraError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => runAnalysisForTile('capture')}
              disabled={isAnalyzing || !capturedImage}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs mt-2"
            >
              {isAnalyzing && activeSourceTile === 'capture' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isAnalyzing && activeSourceTile === 'capture' ? 'Analyzing...' : 'Analyze Snapshot'}</span>
            </button>
          </div>

          {/* Tile 3: Upload Image */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between h-[460px] relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-900 text-base">Upload Image</span>
              </div>
              <span className="text-xs text-slate-500 block mb-3">Upload JPG, PNG, WEBP file</span>
              
              <div 
                onClick={() => !uploadedImage && uploadInputRef.current?.click()}
                className={`w-full h-[270px] rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden transition-colors ${!uploadedImage ? 'cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40' : 'bg-slate-50'}`}
              >
                {uploadedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img src={uploadedImage} alt="Uploaded Preview" className="max-w-full max-h-[250px] object-contain rounded border border-slate-200 shadow-xs" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setUploadedFile(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
                      title="Remove File"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <UploadCloud className="w-10 h-10 text-emerald-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-700">Click to upload file</span>
                    <span className="text-[10px] text-slate-500 mt-1">Supports JPEG, PNG, WEBP</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={uploadInputRef} 
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <button
              onClick={() => runAnalysisForTile('upload')}
              disabled={isAnalyzing || !uploadedImage}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs mt-2"
            >
              {isAnalyzing && activeSourceTile === 'upload' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isAnalyzing && activeSourceTile === 'upload' ? 'Analyzing...' : 'Analyze Image'}</span>
            </button>
          </div>

        </div>

        {/* Bigger Tile Below for Results */}
        <div className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-6 min-h-[380px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Multimodal Emotional Signal Results
            </h3>
            {results && (
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-200">
                Source: {activeSourceTile === 'text' ? 'Text Input' : activeSourceTile === 'capture' ? 'Camera Snapshot' : 'Uploaded Image'}
              </span>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm border border-rose-200 my-auto">
              {error}
            </div>
          )}

          {!results && !isAnalyzing && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm text-center py-12 max-w-sm mx-auto">
              <Activity className="w-10 h-10 mb-3 opacity-30 text-indigo-500" />
              <span className="font-semibold text-slate-700 mb-1">Awaiting Emotional Signals</span>
              <p className="text-xs text-slate-500">Select any tile above (Text, Capture Image, or Upload Image) and click "Analyze" to extract emotional dimensions.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-indigo-600 space-y-4 py-12">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <div className="text-base font-bold text-slate-900 animate-pulse">Running Multimodal Emotional Signal Inference...</div>
              <p className="text-xs text-slate-500">Analyzing facial micro-expressions, posture, and semantic signals.</p>
            </div>
          )}

          {results && !isAnalyzing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 border border-indigo-100/80 shadow-2xs">
                <div className="flex flex-col gap-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-700 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" />
                      Primary Sentiment & Emotional State
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 shrink-0">
                      1-Liner Analysis
                    </span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                    {results.overallSentiment || 'Gently introspective state with balanced mental clarity and calm focus'}
                  </span>
                </div>
                {getSentimentIcon(results.overallSentiment || '')}
              </div>

              <div className="space-y-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Detected Emotion Signals</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.emotions?.map((emotion: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{emotion.name}</span>
                        <span className="text-indigo-600 font-bold">{emotion.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                          style={{ width: `${emotion.score}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Contextual Summary & Observation
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{results.summary}</p>
              </div>

              {results.healthRecommendations && results.healthRecommendations.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> SafeSpace Health Recommendations
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc list-inside">
                    {results.healthRecommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <PhilippinesHotlines />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoEngine() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const liveTranscriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Full video+audio camera access failed, trying video only fallback:", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (fallbackErr: any) {
        let msg = 'Camera or microphone is busy or access was denied. You can upload a recorded video file below instead.';
        if (fallbackErr?.name === 'NotReadableError' || String(fallbackErr?.message || '').toLowerCase().includes('in use') || fallbackErr?.name === 'TrackStartError') {
          msg = '📹 Camera or microphone is currently in use by another application or tab. Please close other camera programs or upload a video file directly.';
        } else if (fallbackErr?.name === 'NotAllowedError' || fallbackErr?.name === 'PermissionDeniedError') {
          msg = '🔒 Camera or microphone permission was denied. Please check browser settings or upload a recorded video file directly.';
        }
        setError(msg);
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    setVideoUrl(null);
    setResults(null);
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    recordedBlobRef.current = null;
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    // Start Web Speech API live speech-to-text in parallel
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          setLiveTranscript(currentText);
          liveTranscriptRef.current = currentText;
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('SpeechRecognition failed to start during video recording:', recErr);
      }
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      recordedBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      recordedBlobRef.current = file;
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setResults(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!videoUrl) return;
    setIsAnalyzing(true);
    setError('');

    try {
      let blob = recordedBlobRef.current;
      if (!blob && videoUrl) {
        blob = await fetch(videoUrl).then(res => res.blob());
      }
      if (!blob) {
        throw new Error('No recorded video file available.');
      }

      // Convert video blob to Base64 safely
      const videoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read video content as Base64.'));
          }
        };
        reader.onerror = () => reject(new Error('File reading error.'));
        reader.readAsDataURL(blob!);
      });

      // Capture a still frame as backup image
      let imageBase64 = '';
      const sourceVideo = playbackVideoRef.current || videoRef.current;
      if (sourceVideo && sourceVideo.videoWidth > 0 && sourceVideo.videoHeight > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = sourceVideo.videoWidth;
          canvas.height = sourceVideo.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg');
          }
        } catch (e) {
          console.warn('Frame capture skipped:', e);
        }
      }

      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64,
          imageBase64,
          mimeType: blob.type || 'video/webm',
          liveTranscript: liveTranscriptRef.current || liveTranscript,
          sourceModule: 'Share Your Video'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || 'Video analysis failed on server.');
      }

      const data = await res.json();
      if (data?.safetyAlertTriggered && data?.alertDetails) {
        window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
      }
      setResults(data);

      saveRecordedEntry({
        type: 'video',
        typeLabel: '🌸 Recorded "Share Your Video"',
        title: data.title || 'Personal Video Reflection Capsule',
        excerpt: data.summary || liveTranscript || 'Recorded video reflection analyzing facial micro-expressions and speech posture.',
        mediaUrl: videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        reportAnalysis: {
          dominantEmotion: data.dominantEmotion || 'Pride & Resilience',
          valenceScore: data.valenceScore ?? 0.88,
          arousalScore: data.arousalScore ?? 0.52,
          sentimentLabel: data.overallSentiment || 'High Resilience',
          summaryObservation: data.summary || 'Facial micro-expression analysis indicates relaxed eye focus and vocal resonance.',
          psychologistInsights: data.insights || ['Duchenne smile indicators detected alongside confident vocal cadence.'],
          guidanceNote: data.guidanceCounselorNote || 'Looking back at past video reflections reinforces personal resilience.',
          safetyStatus: data.safetyAlertTriggered ? 'FLAGGED' : 'SAFE'
        }
      });
    } catch (err: any) {
      console.error('Video analysis error:', err);
      setError(err.message || 'Video analysis failed. Please re-record or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-rose-600" />
          Share Your Video (Video Emotional Signal Analysis)
        </h2>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="video/*" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" /> Upload Video
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" /> Live Webcam Feed
              </h3>
              <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200 relative">
                 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                 {isRecording && (
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-rose-500/40">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-medium text-white">Recording Visual & Speech Signals...</span>
                   </div>
                 )}
              </div>

              {liveTranscript && (
                <div className="w-full mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono line-clamp-2">
                  <span className="text-indigo-600 font-bold">Live Transcript: </span>"{liveTranscript}"
                </div>
              )}

              <div className="mt-6">
                {!isRecording ? (
                  <button onClick={startRecording} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-md">
                    <Play className="w-4 h-4 fill-current" /> Start Recording Entry
                  </button>
                ) : (
                  <button onClick={stopRecording} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-md">
                     <span className="w-3 h-3 rounded-sm bg-rose-500" /> Stop Recording
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Playback & Signal Extraction
              </h3>
              <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                {videoUrl ? (
                   <video 
                     ref={playbackVideoRef} 
                     src={videoUrl} 
                     controls 
                     playsInline 
                     onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
                     onLoadedMetadata={(e) => setPlaybackDuration(e.currentTarget.duration)}
                     className="w-full h-full object-contain" 
                   />
                ) : (
                   <div className="text-slate-400 flex flex-col items-center gap-2">
                     <Video className="w-8 h-8 opacity-60 text-slate-400" />
                     <span className="text-sm">Record or upload a video entry to begin</span>
                   </div>
                )}
              </div>
              <div className="mt-6 flex flex-col items-center gap-4 w-full">
                 <button 
                   onClick={handleAnalyze} 
                   disabled={!videoUrl || isAnalyzing}
                   className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                 >
                   {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Sparkles className="w-5 h-5 text-indigo-100" />}
                   {isAnalyzing ? 'Extracting Facial & Vocal Signals...' : 'Analyze Video Emotional Signals'}
                 </button>
                 {error && <div className="text-rose-700 text-sm text-center bg-rose-50 p-2.5 rounded-lg border border-rose-200 w-full font-sans">{error}</div>}
              </div>
            </div>
          </div>

          {results && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                 <div>
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <Activity className="w-6 h-6 text-indigo-600 animate-pulse" /> Multimodal Video Emotional Signal Assessment
                   </h3>
                   <p className="text-xs text-slate-500">
                     Synchronized analysis of facial micro-expressions, posture, eye gaze, and vocal acoustic resonance
                   </p>
                 </div>

                 <div className="flex items-center gap-2 flex-wrap">
                   <div className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 border ${
                     results.overallSentiment === 'Negative' || results.safetyAlertTriggered
                       ? 'bg-rose-50 text-rose-700 border-rose-300'
                       : results.overallSentiment === 'Positive'
                       ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                       : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                   }`}>
                     <span>Sentiment: {results.overallSentiment}</span>
                   </div>

                   {results.confidenceScore && (
                     <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-emerald-700 border border-emerald-300 font-mono text-xs font-bold">
                       {results.confidenceScore}% Signal Precision
                     </div>
                   )}
                 </div>
               </div>

               {/* Facial Cues & Vocal Signals Split Display */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Facial Cues Card */}
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                   <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                     <span className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                       <Smile className="w-4 h-4 text-indigo-600" /> Visual Facial Signals & Posture
                     </span>
                     <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                       Computer Vision
                     </span>
                   </div>

                   <div className="space-y-2 text-xs text-slate-700">
                     <div>
                       <span className="text-slate-500 font-medium">Eye Contact & Gaze: </span>
                       <span className="text-slate-900 font-medium">{results.facialSignals?.eyeContact || 'Direct, attentive gaze'}</span>
                     </div>
                     <div>
                       <span className="text-slate-500 font-medium">Facial Muscle Tension: </span>
                       <span className="text-slate-900 font-medium">{results.facialSignals?.facialTension || 'Normal muscle tone'}</span>
                     </div>
                     <div>
                       <span className="text-slate-500 font-medium">Posture Alignment: </span>
                       <span className="text-slate-900 font-medium">{results.facialSignals?.postureAndGaze || 'Upright, centered alignment'}</span>
                     </div>

                     {results.facialSignals?.microExpressions && results.facialSignals.microExpressions.length > 0 && (
                       <div className="pt-2 border-t border-slate-200">
                         <span className="text-[11px] text-slate-500 block mb-1.5">Micro-expressions Detected:</span>
                         <div className="flex flex-wrap gap-1.5">
                           {results.facialSignals.microExpressions.map((micro: string, idx: number) => (
                             <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                               ✨ {micro}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Vocal & Acoustic Signals Card */}
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                   <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                     <span className="font-bold text-sm text-purple-900 flex items-center gap-2">
                       <Mic className="w-4 h-4 text-purple-600" /> Acoustic & Vocal Signals
                     </span>
                     <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                       Prosody
                     </span>
                   </div>

                   <div className="space-y-2 text-xs text-slate-700">
                     <div>
                       <span className="text-slate-500 font-medium">Speech Tempo & Pace: </span>
                       <span className="text-slate-900 font-medium">{results.vocalSignals?.speechPace || 'Steady cadence'}</span>
                     </div>
                     <div>
                       <span className="text-slate-500 font-medium">Pitch Variability: </span>
                       <span className="text-slate-900 font-medium">{results.vocalSignals?.pitchVariability || 'Natural pitch inflection'}</span>
                     </div>
                     <div>
                       <span className="text-slate-500 font-medium">Vocal Tone & Resonance: </span>
                       <span className="text-slate-900 font-medium">{results.vocalSignals?.vocalTremorOrTone || 'Clear, balanced resonance'}</span>
                     </div>

                     {results.valenceArousal?.quadrant && (
                       <div className="pt-2 border-t border-slate-200">
                         <span className="text-[11px] text-slate-500 block mb-1">Circumplex Quadrant:</span>
                         <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-xs inline-block">
                           🧭 {results.valenceArousal.quadrant}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* Key Cues Badges */}
               {results.keyCuesObserved && results.keyCuesObserved.length > 0 && (
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                     🔍 Key Observable Behavioral & Acoustic Cues
                   </span>
                   <div className="flex flex-wrap gap-2">
                     {results.keyCuesObserved.map((cue: string, idx: number) => (
                       <span key={idx} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-medium flex items-center gap-1.5 shadow-2xs">
                         <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                         {cue}
                       </span>
                     ))}
                   </div>
                 </div>
               )}

               {/* Recharts Valence & Arousal Timeline Chart for Video */}
               <AudioValenceArousalTimeline
                 results={results}
                 currentTime={playbackTime}
                 duration={playbackDuration}
                 onSeekToTime={(secs) => {
                   if (playbackVideoRef.current) {
                     playbackVideoRef.current.currentTime = secs;
                     setPlaybackTime(secs);
                   }
                 }}
               />

               {/* Detected Emotion Cards */}
               <div className="space-y-2">
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                   📊 Emotion & Affect Confidence Scores
                 </span>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {results.emotions?.map((emotion: any, idx: number) => (
                     <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                       <div className="flex items-center justify-between text-xs">
                         <span className="text-slate-500 uppercase font-semibold">{emotion.name}</span>
                         {emotion.category && (
                           <span className="text-[10px] text-indigo-600 font-mono font-bold">{emotion.category}</span>
                         )}
                       </div>
                       <div className="text-2xl font-extrabold text-slate-900">{emotion.score}%</div>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                           style={{ width: `${Math.min(100, emotion.score)}%` }} 
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Detailed Behavioral Summary */}
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                 <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                   <Activity className="w-3.5 h-3.5 text-indigo-600" /> Detailed Observational Summary
                 </div>
                 <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{results.summary}</p>
               </div>

               {/* Speech Transcript Section for Share Your Video */}
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                 <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                   <FileText className="w-3.5 h-3.5 text-indigo-600" /> Speech Transcript (Audio Recording)
                 </div>
                 {Array.isArray(results.transcript) && results.transcript.length > 0 ? (
                   <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                     {results.transcript.map((t: any, i: number) => (
                       <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5">
                         <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                           <span>{t.speaker || 'User'} [{t.time || '00:00'}]</span>
                           {t.emotion && <span className="text-slate-500 font-normal">Emotion: {t.emotion}</span>}
                         </div>
                         <p className="text-slate-800 leading-relaxed font-medium">"{t.text}"</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 italic">
                     <span className="font-bold text-indigo-900 not-italic block mb-0.5">Spoken Speech Transcript:</span>
                     "{liveTranscript || results.summary || 'Spoken message recorded and processed for emotional analysis.'}"
                   </div>
                 )}
               </div>

               {/* Health Recommendations */}
               {results.healthRecommendations && results.healthRecommendations.length > 0 && (
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                   <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                     <Heart className="w-3.5 h-3.5 text-rose-600" /> Wellness Guidelines & Support Measures
                   </div>
                   <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc list-inside">
                     {results.healthRecommendations.map((rec: string, i: number) => (
                       <li key={i}>{rec}</li>
                     ))}
                   </ul>
                 </div>
               )}

               {/* MANDATORY MEDICAL & PROFESSIONAL DISCLAIMER BANNER */}
               <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
                 <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                 <div>
                   <strong className="font-extrabold text-amber-950 block mb-0.5">Medical & Professional Disclaimer</strong>
                   This analysis in <strong>Share Your Video</strong> is generated for educational and reflective self-awareness purposes only. It does <strong>NOT</strong> represent or substitute for actual consultation, diagnosis, or treatment with medical doctors, licensed psychologists, or mental health professionals.
                 </div>
               </div>

               <PhilippinesHotlines />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function AudioEngine() {
  const [subTab, setSubTab] = useState<'transcript' | 'voice' | 'timeline' | 'summary' | 'psychologist'>('voice');
  const [activeFilter, setActiveFilter] = useState('View All');
  const [emotionScope, setEmotionScope] = useState<'current' | 'entire'>('current');
  const [showPsychologistModal, setShowPsychologistModal] = useState(false);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const liveTranscriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio Level Detection & Silence Auto-Pause State & Refs
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [silenceDuration, setSilenceDuration] = useState<number>(0);
  const [isSilenceAutoPaused, setIsSilenceAutoPaused] = useState<boolean>(false);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState<boolean>(true);
  
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const levelMonitorIntervalRef = useRef<any>(null);
  const silenceStartRef = useRef<number | null>(null);
  const recordedStreamRef = useRef<MediaStream | null>(null);

  const stopAudioLevelMonitoring = () => {
    if (levelMonitorIntervalRef.current) {
      clearInterval(levelMonitorIntervalRef.current);
      levelMonitorIntervalRef.current = null;
    }
    if (micAudioContextRef.current && micAudioContextRef.current.state !== 'closed') {
      try { micAudioContextRef.current.close(); } catch (e) {}
      micAudioContextRef.current = null;
    }
    micAnalyserRef.current = null;
    silenceStartRef.current = null;
    setAudioLevel(0);
  };

  const resumeRecordingFromSilence = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsSilenceAutoPaused(false);
      setSilenceDuration(0);
      silenceStartRef.current = Date.now();
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedStreamRef.current = stream;
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setLiveTranscript('');
      liveTranscriptRef.current = '';
      setIsSilenceAutoPaused(false);
      setSilenceDuration(0);

      // --- Setup Audio Level Analyser ---
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        micAudioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        micAnalyserRef.current = analyser;

        const micSource = ctx.createMediaStreamSource(stream);
        micSource.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        silenceStartRef.current = Date.now();

        levelMonitorIntervalRef.current = setInterval(() => {
          if (!micAnalyserRef.current || mediaRecorderRef.current?.state === 'paused') return;

          micAnalyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const currentVol = Math.min(100, Math.round((avg / 80) * 100));
          setAudioLevel(currentVol);

          const SILENCE_THRESHOLD = 5;
          if (currentVol < SILENCE_THRESHOLD) {
            if (silenceStartRef.current === null) {
              silenceStartRef.current = Date.now();
            }
            const silentSecs = Math.floor((Date.now() - silenceStartRef.current) / 1000);
            setSilenceDuration(silentSecs);

            if (silentSecs >= 4 && autoPauseEnabled && mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.pause();
              setIsSilenceAutoPaused(true);
              if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
              }
            }
          } else {
            silenceStartRef.current = Date.now();
            setSilenceDuration(0);

            if (isSilenceAutoPaused && mediaRecorderRef.current?.state === 'paused') {
              mediaRecorderRef.current.resume();
              setIsSilenceAutoPaused(false);
              if (recognitionRef.current) {
                try { recognitionRef.current.start(); } catch (e) {}
              }
            }
          }
        }, 150);
      } catch (audioCtxErr) {
        console.warn("Audio level analyser initialization failed:", audioCtxErr);
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let currentText = '';
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript + ' ';
            }
            setLiveTranscript(currentText);
            liveTranscriptRef.current = currentText;
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition error:", e);
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopAudioLevelMonitoring();
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
        const mime = mediaRecorder.mimeType || getSupportedAudioMimeType();
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const ext = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([audioBlob], `recording.${ext}`, { type: mime });
        const createdUrl = URL.createObjectURL(file);
        setAudioFile(file);
        setAudioUrl(createdUrl);
        analyzeAudio(file, liveTranscriptRef.current, createdUrl);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure you have granted permissions.");
    }
  };

  const stopRecording = () => {
    stopAudioLevelMonitoring();
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsSilenceAutoPaused(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioUrl(url);
      analyzeAudio(file, '', url);
    }
  };

  const analyzeAudio = async (file: File, liveTextHint: string = '', directMediaUrl?: string) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const res = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: file.type || 'audio/webm',
          liveTranscript: liveTextHint || liveTranscript,
          sourceModule: 'Share Voice (Audio)'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Analysis failed.');
      }
      const data = await res.json();
      if (data?.safetyAlertTriggered && data?.alertDetails) {
        window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
      }
      setResults(data);

      const mediaUrlToSave = directMediaUrl || audioUrl || 'simulated-voice-note';

      saveRecordedEntry({
        type: 'audio',
        typeLabel: '🎤 Recorded "Share Voice"',
        title: data.title || 'Voice Note & Acoustic Reflection',
        excerpt: data.summary || liveTextHint || liveTranscript || 'Recorded audio reflection analyzing pitch cadence and vocal resonance.',
        mediaUrl: mediaUrlToSave,
        audioDuration: 14,
        reportAnalysis: {
          dominantEmotion: data.overallEmotion?.dominantEmotion || 'Calm Focus & Stability',
          valenceScore: data.overallEmotion?.valence ?? 0.65,
          arousalScore: data.overallEmotion?.arousal ?? 0.45,
          sentimentLabel: 'Vocal Cadence Stabilized',
          summaryObservation: data.summary || 'Acoustic pitch tracking indicates pitch normalization and relaxed conversational cadence.',
          psychologistInsights: data.insights || ['Pacing stabilized from rapid speech down to clear, steady cadence.'],
          guidanceNote: data.guidanceCounselorNote || 'Demonstrates active mastery over performance anxiety.',
          safetyStatus: data.safetyAlertTriggered ? 'FLAGGED' : 'SAFE'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Set actual canvas size based on display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.fillStyle = `rgba(59, 130, 246, 0.8)`; // bg-blue-500 equivalent
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    draw();
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.muted = false;

        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
          }
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
        } catch (e) {
          console.warn("Web Audio context connect note:", e);
        }

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
            drawVisualizer();
          }).catch(err => {
            console.warn("Audio element play error, attempting speech synthesis fallback:", err);
            const textToSpeak = liveTranscript || (results?.transcript ? results.transcript.map((t: any) => t.text).join(' ') : 'Playback of recorded audio statement.');
            if (window.speechSynthesis && textToSpeak) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.onend = () => setIsPlaying(false);
              utterance.onerror = () => setIsPlaying(false);
              window.speechSynthesis.speak(utterance);
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          });
        }
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getActiveTranscript = () => {
    if (!Array.isArray(results?.transcript)) return null;
    return results.transcript.find((t: any) => {
      if (!t.time) return false;
      const [startStr, endStr] = t.time.split(' - ');
      const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const parts = timeStr.trim().split(':');
        if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        }
        return 0;
      };
      const start = parseTime(startStr);
      const end = parseTime(endStr);
      return currentTime >= start && currentTime <= end;
    });
  };

  const activeTranscript = getActiveTranscript();

  if (!results && !isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 p-8 gap-6">
         <div className="w-full max-w-2xl grid grid-cols-2 gap-5 items-stretch">
             <div 
               onClick={isRecording ? undefined : startRecording}
               className={`min-h-[350px] h-auto border-2 ${isRecording ? (isSilenceAutoPaused ? 'border-amber-500 bg-amber-50/70 text-amber-900' : 'border-emerald-500 bg-emerald-50/40 text-slate-800') : 'border-dashed border-slate-300 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50'} rounded-xl flex flex-col items-center ${isRecording ? 'justify-between' : 'justify-center'} transition-all p-5 text-center shadow-xs overflow-hidden cursor-pointer`}
             >
               {isRecording ? (
                  <div className="w-full flex flex-col items-center justify-between h-full" onClick={(e) => e.stopPropagation()}>
                    {/* Header & Auto-Pause Toggle */}
                    <div className="w-full flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isSilenceAutoPaused ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {isSilenceAutoPaused ? 'Auto-Paused (No Voice)' : 'Recording Voice'}
                        </span>
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={autoPauseEnabled} 
                          onChange={(e) => setAutoPauseEnabled(e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Auto-Pause</span>
                      </label>
                    </div>

                    {/* Audio Level Meter with Microphone Icon & Decibel Progress Bar */}
                    <div className="w-full flex flex-col items-center my-2 gap-1.5">
                      <div className="flex items-center justify-between w-full px-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full transition-colors ${audioLevel > 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Mic className={`w-4 h-4 ${audioLevel > 5 ? 'animate-pulse' : ''}`} />
                          </div>
                          <div className="flex flex-col gap-0.5 text-left">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                              <span>Mic Level:</span>
                              <strong className={audioLevel > 5 ? 'text-emerald-600' : 'text-slate-500'}>
                                {Math.round(-60 + (audioLevel / 100) * 60)} dB ({audioLevel}%)
                              </strong>
                            </div>
                            {/* Decibel Input Level Progress Bar */}
                            <div className="w-28 sm:w-36 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/80 shadow-inner">
                              <div 
                                style={{ width: `${isSilenceAutoPaused ? 0 : audioLevel}%` }}
                                className={`h-full transition-all duration-100 rounded-full ${
                                  audioLevel > 70 ? 'bg-amber-500' : audioLevel > 5 ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {silenceDuration > 0 ? (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${silenceDuration >= 3 ? 'bg-amber-200 text-amber-900 font-bold border border-amber-300' : 'bg-slate-100 text-slate-600'}`}>
                            Silence: {silenceDuration}s
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            🎙️ Voice Active
                          </span>
                        )}
                      </div>

                      {/* Dynamic Soundwave Equalizer */}
                      <div className="w-full h-10 bg-slate-900 rounded-lg p-1.5 flex items-end justify-between gap-1 border border-slate-800 overflow-hidden shadow-inner">
                        {Array.from({ length: 22 }).map((_, idx) => {
                          const pseudoFactor = Math.sin((idx + 1) * 0.7) * 0.4 + 0.6;
                          const barHeightPercent = isSilenceAutoPaused 
                            ? 8 
                            : Math.max(8, Math.min(100, Math.round(audioLevel * pseudoFactor * 1.3)));
                          const isHigh = barHeightPercent > 60;
                          return (
                            <div 
                              key={idx}
                              style={{ height: `${barHeightPercent}%` }}
                              className={`flex-1 rounded-xs transition-all duration-100 ${
                                isSilenceAutoPaused 
                                  ? 'bg-slate-600' 
                                  : isHigh 
                                    ? 'bg-amber-400' 
                                    : audioLevel > 5 
                                      ? 'bg-emerald-400' 
                                      : 'bg-slate-500'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Silence Auto-Paused Warning Banner */}
                    {isSilenceAutoPaused && (
                      <div className="w-full bg-amber-100 border border-amber-300 text-amber-950 p-2 rounded-lg text-xs flex items-center justify-between my-1 shadow-xs">
                        <span className="flex items-center gap-1 font-medium text-left">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>No voice detected for 4s. Auto-paused.</span>
                        </span>
                        <button
                          onClick={resumeRecordingFromSilence}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer shrink-0 ml-1"
                        >
                          Resume
                        </button>
                      </div>
                    )}

                    {/* Live Transcript Stream */}
                    {liveTranscript && (
                      <div className="text-xs text-slate-700 max-h-16 overflow-y-auto italic bg-white p-2 rounded w-full border border-slate-200 text-left my-1">
                        "{liveTranscript}"
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-slate-200/80">
                      {isSilenceAutoPaused ? (
                        <button
                          onClick={resumeRecordingFromSilence}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Resume Voice
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                              mediaRecorderRef.current.pause();
                              setIsSilenceAutoPaused(true);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                      )}

                      <button
                        onClick={stopRecording}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop & Analyze
                      </button>
                    </div>
                  </div>
               ) : (
                  <>
                     <Mic className="w-10 h-10 mb-3 text-indigo-600" />
                     <span className="text-lg font-bold text-slate-900 mb-1">Live Record</span>
                     <span className="text-sm text-slate-500">Use microphone to record & transcribe</span>
                  </>
               )}
             </div>

             <div 
               onClick={() => fileInputRef.current?.click()}
               className="min-h-[350px] h-auto border-2 border-dashed border-slate-300 bg-white rounded-xl flex flex-col items-center justify-center text-slate-600 cursor-pointer hover:border-indigo-500 hover:text-indigo-600 transition-colors hover:bg-indigo-50/50 shadow-xs p-5 text-center"
             >
               <UploadCloud className="w-10 h-10 mb-4 text-indigo-600" />
               <span className="text-lg font-bold text-slate-900 mb-2">Upload Audio</span>
               <span className="text-sm text-slate-500">MP3, WAV, M4A up to 50MB</span>
             </div>
         </div>
         
         <input 
           type="file" 
           accept="audio/*" 
           className="hidden" 
           ref={fileInputRef} 
           onChange={handleAudioUpload}
         />
         {error && <div className="mt-4 text-rose-600 text-sm font-semibold">{error}</div>}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 text-indigo-600 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <div className="text-lg font-bold animate-pulse text-slate-900">Analyzing Audio & Transcribing Speech...</div>
        <p className="text-sm text-slate-500">Processing acoustic signals and generating Psychologist's Review.</p>
      </div>
    );
  }

  const reviewData = results?.psychologistReview || {
    summaryObservation: results?.summary || "Audio speech analysis complete.",
    emotionalAssessment: `Primary emotional valence detected: ${results?.overallEmotion?.dominantEmotion || 'Calm'}.`,
    clinicalInsights: results?.insights || ["Audio speech pattern indicates authentic self-expression."],
    recommendedCopingStrategies: results?.healthRecommendations || ["Engage in regular mindfulness sessions."],
    guidanceCounselorNote: "Keep continuing your mental wellness self-checkups and reach out to your school guidance office if you ever need additional support."
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
       <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white shadow-xs">
         <div className="flex items-center gap-4">
           <button 
             onClick={() => {setResults(null); setAudioUrl(null); setAudioFile(null);}} 
             className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium"
           >
             <ArrowLeft className="w-5 h-5" /> Back
           </button>
           <h2 className="text-lg text-slate-900 font-bold ml-2">{results?.title || 'Audio Analysis'}</h2>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => downloadAudioReportPdf(results, reviewData, audioFile?.name)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm active:scale-95 cursor-pointer"
              title="Download full analysis and insights as a PDF report"
            >
               <Download className="w-4 h-4 text-white" /> Download Report as PDF
            </button>
            <button 
              onClick={() => { setShowPsychologistModal(true); setSubTab('psychologist'); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
               <Brain className="w-4 h-4 text-white" /> SafeSpace Observation
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><MoreVertical className="w-5 h-5" /></button>
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><Share2 className="w-5 h-5" /></button>
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><Settings className="w-5 h-5" /></button>
         </div>
       </div>

       <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white relative min-h-[400px]">
             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {/* Psychologist's Review Banner Card */}
                <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 mb-6">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                         <Brain className="w-5 h-5 text-indigo-600" /> SafeSpace Observation & Assessment
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => downloadAudioReportPdf(results, reviewData, audioFile?.name)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                        >
                           <Download className="w-3.5 h-3.5 text-white" /> Download PDF
                        </button>
                        <button 
                          onClick={() => setShowPsychologistModal(true)}
                          className="text-xs text-indigo-700 hover:text-indigo-900 underline font-semibold"
                        >
                           Open Full Clinical Report
                        </button>
                      </div>
                   </div>
                   <p className="text-slate-800 text-sm leading-relaxed mb-3">
                      {reviewData.summaryObservation}
                   </p>
                   <div className="text-xs text-indigo-800 bg-white px-3 py-2 rounded-lg border border-indigo-200 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{reviewData.guidanceCounselorNote}</span>
                   </div>
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Speech Transcript</h3>
                {!Array.isArray(results?.transcript) || results.transcript.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-2 border border-slate-200 rounded-xl bg-slate-50">
                    <p>No speech detected in this audio recording.</p>
                  </div>
                ) : (
                  results.transcript.filter((msg: any) => activeFilter === 'View All' || msg.speaker === activeFilter).map((msg: any, i: number) => (
                    <TranscriptMessage 
                      key={i}
                      speaker={msg.speaker} 
                      color={msg.color || "text-emerald-700"} 
                      time={msg.time} 
                      text={msg.text} 
                    />
                  ))
                )}
             </div>

             <div className="h-48 border-t border-slate-200 bg-slate-50 flex flex-col p-4 shrink-0">
                <div className="flex-1 flex items-center justify-center mb-2 overflow-hidden px-4 opacity-80">
                   <canvas ref={canvasRef} className="w-full h-12 rounded-sm" />
                </div>
                <div className="flex items-center gap-4 text-slate-600 text-sm">
                   <audio 
                     ref={audioRef} 
                     src={audioUrl || ''} 
                     onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                     onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                     onEnded={() => {
                       setIsPlaying(false);
                       if (animationFrameRef.current) {
                         cancelAnimationFrame(animationFrameRef.current);
                       }
                       if (canvasRef.current) {
                         const ctx = canvasRef.current.getContext('2d');
                         if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                       }
                     }}
                     className="hidden" 
                   />
                   <button onClick={togglePlay} className="text-slate-800 hover:text-indigo-600 transition-colors">
                     {isPlaying ? <span className="w-6 h-6 flex items-center justify-center font-bold">||</span> : <Play className="w-6 h-6 fill-current" />}
                   </button>
                   <button className="hover:text-slate-900 transition-colors"><Volume2 className="w-5 h-5" /></button>
                   <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative cursor-pointer" onClick={(e) => {
                     if (audioRef.current) {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const pos = (e.clientX - rect.left) / rect.width;
                       audioRef.current.currentTime = pos * duration;
                     }
                   }}>
                      <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow border border-slate-300 cursor-pointer" style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 7px)` }}></div>
                   </div>
                   <span className="font-mono text-slate-700">{formatTime(currentTime)}/{formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm font-medium">
                   {['View All', ...(Array.isArray(results?.transcript) ? Array.from(new Set(results.transcript.map((t: any) => t.speaker))).filter(Boolean) : ['Speaker 1', 'Speaker 2'])].map(f => (
                     <button 
                       key={f as string}
                       onClick={() => setActiveFilter(f as string)}
                       className={`px-4 py-1.5 rounded-md ${activeFilter === f ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                     >
                       {f as string}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="w-full lg:w-[460px] xl:w-[500px] flex flex-col shrink-0 bg-white">
             <div className="flex h-14 shrink-0">
                <button 
                  className="flex-1 font-bold text-lg bg-indigo-600 text-white rounded-tl-lg"
                >
                  Audio Analysis
                </button>
             </div>

             <div className="flex gap-4 px-4 sm:px-6 pt-5 border-b border-slate-200 shrink-0 bg-white overflow-x-auto custom-scrollbar flex-nowrap">
               {[
                 { id: 'transcript', label: 'Transcript' },
                 { id: 'voice', label: 'Voice' },
                 { id: 'timeline', label: 'Timeline Chart' },
                 { id: 'summary', label: 'Summary' },
                 { id: 'psychologist', label: "SafeSpace Observation" }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   className={`pb-3 font-bold text-[14px] whitespace-nowrap shrink-0 ${subTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                   onClick={() => setSubTab(tab.id as any)}
                 >
                   {tab.label}
                 </button>
               ))}
             </div>

             <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
                {subTab === 'voice' && (
                  <>
                     <EmotionWheel 
                        overallEmotion={results?.overallEmotion} 
                        activeEmotionName={emotionScope === 'current' ? activeTranscript?.emotion : undefined} 
                        psychologistReview={results?.psychologistReview}
                      />
                     
                     <div className="w-full mt-10 space-y-4">
                        <div className="flex justify-between text-[15px]">
                           <span className="text-slate-600">Activation: <strong className="text-slate-900">{typeof results?.overallEmotion?.arousal === 'number' ? results.overallEmotion.arousal.toFixed(2) : '0.00'}</strong></span>
                           <span className="text-slate-600">Valence: <strong className="text-slate-900">{typeof results?.overallEmotion?.valence === 'number' ? results.overallEmotion.valence.toFixed(2) : '0.00'}</strong></span>
                           <span className="text-slate-600">Intensity: <strong className="text-slate-900">{typeof results?.overallEmotion?.intensity === 'number' ? results.overallEmotion.intensity.toFixed(2) : '0.00'}</strong></span>
                        </div>
                        <div className="flex justify-between text-[15px]">
                           <span className="text-slate-600">Speaker: <strong className="text-slate-900">{emotionScope === 'current' ? (activeTranscript?.speaker || "-") : "All Speakers"}</strong></span>
                           <span className="text-slate-600">{emotionScope === 'current' ? 'Active Segment Emotion:' : 'Overall Emotion:'} <strong className="text-slate-900">{emotionScope === 'current' ? (activeTranscript?.emotion || "-") : results?.overallEmotion?.dominantEmotion}</strong></span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-8">
                           <span className="text-[15px] text-slate-600 font-medium">Emotions:</span>
                           <div className="flex rounded-md overflow-hidden border border-slate-300">
                             <button onClick={() => setEmotionScope('current')} className={`px-5 py-2 ${emotionScope === 'current' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-100'} text-sm font-medium border-r border-slate-300 transition-colors`}>Current Segment</button>
                             <button onClick={() => setEmotionScope('entire')} className={`px-5 py-2 ${emotionScope === 'entire' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-100'} text-sm font-medium transition-colors`}>Entire Transcript</button>
                           </div>
                        </div>

                        {/* Valence & Arousal Recharts Timeline Component */}
                        <div className="w-full mt-8 pt-6 border-t border-slate-200">
                          <AudioValenceArousalTimeline
                            results={results}
                            currentTime={currentTime}
                            duration={duration}
                            onSeekToTime={(secs) => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = secs;
                                setCurrentTime(secs);
                              }
                            }}
                          />
                        </div>
                     </div>
                  </>
                )}
                {subTab === 'timeline' && (
                  <div className="w-full">
                    <AudioValenceArousalTimeline
                      results={results}
                      currentTime={currentTime}
                      duration={duration}
                      onSeekToTime={(secs) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = secs;
                          setCurrentTime(secs);
                        }
                      }}
                    />
                  </div>
                )}
                {subTab === 'transcript' && (
                   <div className="w-full text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {!Array.isArray(results?.transcript) || results.transcript.length === 0 ? "No speech detected in this audio." : results.transcript.map((t: any) => `${t.speaker} [${t.time}]: ${t.text}`).join('\n\n')}
                   </div>
                )}
                {subTab === 'summary' && (
                   <div className="w-full text-slate-800 text-[15px] leading-relaxed">
                     {results?.summary}
                   </div>
                )}
                {subTab === 'psychologist' && (
                   <div className="w-full space-y-6">
                      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm">
                         <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                           <Brain className="w-4 h-4 text-indigo-600" /> SafeSpace Observation
                         </div>
                         <p className="text-slate-800 text-sm leading-relaxed">{reviewData.summaryObservation}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm">
                         <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                           <Activity className="w-4 h-4 text-purple-600" /> Emotional Assessment
                         </div>
                         <p className="text-slate-800 text-sm leading-relaxed">{reviewData.emotionalAssessment}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">SafeSpace Insights</div>
                        {reviewData.clinicalInsights.map((insight: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">Coping & Action Plan</div>
                        {reviewData.recommendedCopingStrategies.map((strat: string, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{strat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-sm">
                        <div className="font-bold text-slate-900 mb-1">Counselor's Note</div>
                        <p className="text-slate-800 text-sm">{reviewData.guidanceCounselorNote}</p>
                      </div>
                   </div>
                )}
                
                <div className="w-full mt-10 pt-10 border-t border-slate-200 space-y-6">
                   <div className="space-y-4">
                     <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Key Insights</h4>
                     {!Array.isArray(results?.insights) || results.insights.length === 0 ? (
                        <div className="text-slate-500 text-sm italic">No key insights available.</div>
                     ) : results.insights.map((insight: string, i: number) => (
                       <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                         <Sparkles className="w-4 h-4 text-indigo-600 inline-block mr-2 -mt-0.5" />
                         {insight}
                       </div>
                     ))}
                   </div>
                   {Array.isArray(results?.healthRecommendations) && results.healthRecommendations.length > 0 && (
                     <div className="space-y-4">
                       <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">SafeSpace Health Recommendations</h4>
                       {results.healthRecommendations.map((rec: string, i: number) => (
                         <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                           <Activity className="w-4 h-4 text-emerald-600 inline-block mr-2 -mt-0.5" />
                           {rec}
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Speech Transcript Section for Share Your Video */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" /> Speech Transcript (Audio Recording)
                  </div>
                  {Array.isArray(results.transcript) && results.transcript.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {results.transcript.map((t: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                            <span>{t.speaker || 'User'} [{t.time || '00:00'}]</span>
                            {t.emotion && <span className="text-slate-500 font-normal">Emotion: {t.emotion}</span>}
                          </div>
                          <p className="text-slate-800 leading-relaxed font-medium">"{t.text}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 italic">
                      <span className="font-bold text-indigo-900 not-italic block mb-0.5">Spoken Speech Transcript:</span>
                      "{liveTranscript || results.summary || 'Spoken message recorded and processed for emotional analysis.'}"
                    </div>
                  )}
                </div>

                {/* MANDATORY MEDICAL & PROFESSIONAL DISCLAIMER BANNER */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold text-amber-950 block mb-0.5">Medical & Professional Disclaimer</strong>
                    This audio analysis in <strong>Share Voice</strong> is generated for educational and reflective self-awareness purposes only. It does <strong>NOT</strong> represent or substitute for actual consultation, diagnosis, or treatment with medical doctors, licensed psychologists, or healthcare professionals.
                  </div>
                </div>

                <PhilippinesHotlines />
                </div>
             </div>
          </div>
       </div>

       {/* Psychologist's Review Modal Dialog */}
       {showPsychologistModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 lg:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
               <button 
                 onClick={() => setShowPsychologistModal(false)}
                 className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                     <Brain className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-900">SafeSpace Observation & Assessment</h3>
                     <p className="text-xs text-slate-500">SafeSpace emotion evaluation & SafeSpace Counselor findings</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">SafeSpace Observation</h4>
                     <p className="text-slate-800 text-sm leading-relaxed">{reviewData.summaryObservation}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Emotional Assessment</h4>
                     <p className="text-slate-800 text-sm leading-relaxed">{reviewData.emotionalAssessment}</p>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Insights</h4>
                     <div className="space-y-2">
                        {reviewData.clinicalInsights.map((insight: string, idx: number) => (
                           <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <span>{insight}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Coping Strategies</h4>
                     <div className="space-y-2">
                        {reviewData.recommendedCopingStrategies.map((strat: string, idx: number) => (
                           <div key={idx} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{strat}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-sm">
                     <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-400" /> SafeSpace Counselor Note
                     </h4>
                     <p className="text-slate-300 text-sm">{reviewData.guidanceCounselorNote}</p>
                  </div>

                  {/* Established Clinical References & Frameworks */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-700/60 text-slate-300 text-xs space-y-3">
                     <div className="flex items-center gap-2 font-semibold text-indigo-300 text-sm border-b border-white/10 pb-2">
                        <Book className="w-4 h-4 text-indigo-400" /> Clinical Frameworks & Literature References
                     </div>
                     <p className="text-slate-400 leading-relaxed text-[13px]">
                        The psychological analysis, valence-activation mapping, and coping strategies provided in this report are grounded in established clinical psychology literature and counseling standards:
                     </p>
                     <ul className="space-y-2.5 text-slate-300 list-disc list-inside text-[12px] leading-relaxed pl-1">
                        <li>
                           <strong className="text-white">Circumplex Model of Affect (Valence & Activation Mapping):</strong><br />
                           <span className="text-slate-400 italic">Russell, J. A. (1980). A circumplex model of affect. Journal of Personality and Social Psychology, 39(6), 1161–1178.</span>
                        </li>
                        <li>
                           <strong className="text-white">Cognitive Behavioral Therapy (CBT) & Reframing:</strong><br />
                           <span className="text-slate-400 italic">Beck, A. T., et al. (1979). Cognitive Therapy of Depression. Guilford Press. | Burns, D. D. (1980). Feeling Good: The New Mood Therapy.</span>
                        </li>
                        <li>
                           <strong className="text-white">Facial Action Coding System (FACS) & Micro-Expressions:</strong><br />
                           <span className="text-slate-400 italic">Ekman, P., & Friesen, W. V. (1978). Facial Action Coding System. Consulting Psychologists Press.</span>
                        </li>
                        <li>
                           <strong className="text-white">Emotion Regulation & Mindfulness-Based Stress Reduction (MBSR):</strong><br />
                           <span className="text-slate-400 italic">Gross, J. J. (1998). The emerging field of emotion regulation. Review of General Psychology. | Kabat-Zinn, J. (1990). Full Catastrophe Living.</span>
                        </li>
                        <li>
                           <strong className="text-white">Guidance Counseling Standards & Culturally Sensitive Support:</strong><br />
                           <span className="text-slate-400 italic">ASCA National Model (2019) & Philippine Republic Act 9258 (Guidance and Counseling Act of 2004).</span>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button 
                    onClick={() => downloadAudioReportPdf(results, reviewData, audioFile?.name)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                  >
                     <Download className="w-4 h-4 text-white" /> Download Report as PDF
                  </button>
                  <button 
                    onClick={() => setShowPsychologistModal(false)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
                  >
                     Close Review
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}

function TranscriptMessage({ speaker, color, time, text }: any) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors">
       <div className="flex justify-between items-center mb-2">
         <span className={`font-bold text-[15px] ${color}`}>{speaker}</span>
         <span className="text-xs text-slate-500 font-mono">{time}</span>
       </div>
       <p className="text-slate-800 text-[15px] leading-relaxed">{text}</p>
    </div>
  )
}

function EmotionWheel({ 
  overallEmotion, 
  activeEmotionName, 
  psychologistReview 
}: { 
  overallEmotion?: { arousal?: number, valence?: number, intensity?: number, dominantEmotion?: string }, 
  activeEmotionName?: string,
  psychologistReview?: any
}) {
  const emotionPoints = [
    // Positive Quadrants
    { name: 'Surprise', x: 0.3, y: 0.95 },
    { name: 'Curiosity', x: 0.15, y: 0.75 },
    { name: 'Excitement', x: 0.45, y: 0.75 },
    { name: 'Desire', x: 0.8, y: 0.8 },
    { name: 'Admiration', x: 0.9, y: 0.6 },
    { name: 'Optimism', x: 0.55, y: 0.45 },
    { name: 'Love', x: 0.7, y: 0.35 },
    { name: 'Pride', x: 0.8, y: 0.25 },
    { name: 'Caring', x: 0.4, y: 0.25 },
    { name: 'Amusement', x: 0.7, y: 0.05 },
    { name: 'Joy', x: 0.85, y: -0.1 },
    { name: 'Approval', x: 0.8, y: -0.3 },
    { name: 'Gratitude', x: 0.8, y: -0.5 },
    { name: 'Relief', x: 0.6, y: -0.8 },
    { name: 'Calm', x: 0.4, y: -0.6 },

    // Negative High-Arousal (Upper-Left)
    { name: 'Fear', x: -0.4, y: 0.85 },
    { name: 'Panic', x: -0.65, y: 0.90 },
    { name: 'Anger', x: -0.6, y: 0.55 },
    { name: 'Annoyance', x: -0.3, y: 0.45 },
    { name: 'Anxiety', x: -0.5, y: 0.50 },
    { name: 'Stress', x: -0.55, y: 0.45 },
    { name: 'Overwhelmed', x: -0.65, y: 0.65 },
    { name: 'Frustration', x: -0.45, y: 0.40 },
    { name: 'Worry', x: -0.35, y: 0.35 },
    { name: 'Nervousness', x: -0.3, y: 0.25 },
    { name: 'Disgust', x: -0.8, y: 0.25 },
    { name: 'Distress', x: -0.7, y: 0.60 },

    // Negative Low-Arousal (Lower-Left)
    { name: 'Remorse', x: -0.8, y: 0.15 },
    { name: 'Disappointment', x: -0.7, y: -0.3 },
    { name: 'Disapproval', x: -0.3, y: -0.3 },
    { name: 'Sadness', x: -0.7, y: -0.5 },
    { name: 'Depression', x: -0.75, y: -0.65 },
    { name: 'Grief', x: -0.6, y: -0.7 },
    { name: 'Loneliness', x: -0.65, y: -0.45 },
    { name: 'Embarrassment', x: -0.2, y: -0.6 },
    { name: 'Confusion', x: -0.2, y: -0.9 },
    { name: 'Realization', x: 0.2, y: -0.1 },
  ];

  const currentLabel = activeEmotionName || overallEmotion?.dominantEmotion || 'Emotion';

  const reviewText = `${psychologistReview?.summaryObservation || ''} ${psychologistReview?.emotionalAssessment || ''} ${currentLabel}`;
  const isNegativeEmotion = /negative|sad|anxi|stress|fear|depress|grief|pain|distress|overwhelm|frustrat|annoy|disappoint|upset|worr|lonely|hurt|struggle|panic|vulnerab/i.test(reviewText);

  let v = typeof overallEmotion?.valence === 'number' ? overallEmotion.valence : 0;
  let a = typeof overallEmotion?.arousal === 'number' ? overallEmotion.arousal : 0;

  const matchedPt = emotionPoints.find(p => p.name.toLowerCase() === currentLabel.toLowerCase() || currentLabel.toLowerCase().includes(p.name.toLowerCase()));
  if (matchedPt) {
    v = matchedPt.x;
    a = matchedPt.y;
  } else if (isNegativeEmotion && v >= 0) {
    v = -0.55;
    if (a === 0) a = 0.35;
  }

  const dotLeft = Math.max(8, Math.min(92, 50 + (v * 50)));
  const dotTop = Math.max(8, Math.min(92, 50 - (a * 50)));

  const isNegativeDot = v < 0;

  return (
    <div className="relative w-[340px] h-[340px] mt-8 shrink-0">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 text-amber-600 font-bold text-[15px]">Exciting</div>
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-6 text-indigo-600 font-bold text-[15px]">Calming</div>
       <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-16 text-rose-600 font-bold text-[15px]">Negative</div>
       <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16 text-emerald-600 font-bold text-[15px]">Positive</div>

       <div className="absolute inset-0 rounded-full border border-slate-300 bg-slate-100/50"></div>
       
       <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-300"></div>
       <div className="absolute left-1/2 top-0 h-full w-[1px] bg-slate-300"></div>

       {/* Active Indicator Dot with Label */}
       <div 
         className={`absolute w-5 h-5 rounded-full z-30 border-2 border-white flex items-center justify-center transition-all duration-700 ease-out ${
           isNegativeDot 
             ? 'bg-rose-600 shadow-md' 
             : 'bg-indigo-600 shadow-md'
         }`}
         style={{ left: `${dotLeft}%`, top: `${dotTop}%`, transform: 'translate(-50%, -50%)' }}
       >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          <div className={`absolute whitespace-nowrap text-xs font-bold px-2.5 py-1 rounded-md border shadow-lg z-40 ${
            isNegativeDot 
              ? 'bg-rose-50 text-rose-800 border-rose-300 -top-8' 
              : 'bg-indigo-50 text-indigo-800 border-indigo-300 -top-8'
          }`}>
            {currentLabel}
          </div>
       </div>

       {emotionPoints.map(pt => {
         const left = 50 + (pt.x * 50);
         const top = 50 - (pt.y * 50);
         const isRight = pt.x >= 0;
         return (
           <div 
             key={pt.name}
             className="absolute w-1.5 h-1.5 rounded-full bg-slate-400 z-10"
             style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
           >
              <span 
                className={`absolute text-[10px] text-slate-500 top-1/2 -translate-y-1/2 whitespace-nowrap font-medium ${isRight ? 'left-2.5' : 'right-2.5'}`}
              >
                {pt.name}
              </span>
           </div>
         )
       })}
    </div>
  )
}
function PhilippinesHotlines() {
  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="text-xs text-rose-600 uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-rose-600" /> Support & Emergency Hotlines (Philippines)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <a href="tel:09178882233" className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center hover:bg-slate-100 transition-colors cursor-pointer group shadow-2xs">
          <div className="flex justify-between items-start mb-1">
            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">School Head (Principal)</div>
            <div className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1"><Phone className="w-3 h-3" /> 0917-888-2233</div>
          </div>
          <div className="text-xs text-slate-500">Dr. Alejandro V. Ramos — RMHS Office</div>
        </a>
        <a href="tel:09194445566" className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center hover:bg-slate-100 transition-colors cursor-pointer group shadow-2xs">
          <div className="flex justify-between items-start mb-1">
            <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">School Guidance Counselor</div>
            <div className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1"><Phone className="w-3 h-3" /> 0919-444-5566</div>
          </div>
          <div className="text-xs text-slate-500">Mrs. Josefina Castro, RGC — RMHS Guidance</div>
        </a>
        <a href="tel:117" className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center hover:bg-slate-100 transition-colors cursor-pointer group shadow-2xs">
          <div className="flex justify-between items-start mb-1">
             <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">PNP Emergency</div>
             <div className="text-xs font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1"><Phone className="w-3 h-3" /> 117 / 911</div>
          </div>
          <div className="text-xs text-slate-500">Philippine National Police</div>
        </a>
        <a href="tel:163" className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center hover:bg-slate-100 transition-colors cursor-pointer group shadow-2xs">
          <div className="flex justify-between items-start mb-1">
             <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Bantay Bata 163</div>
             <div className="text-xs font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1"><Phone className="w-3 h-3" /> 163</div>
          </div>
          <div className="text-xs text-slate-500">Child protection and welfare</div>
        </a>
        <a href="tel:1553" className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center md:col-span-2 hover:bg-slate-100 transition-colors cursor-pointer group shadow-2xs">
          <div className="flex justify-between items-start mb-1">
             <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">NCMH Crisis Hotline</div>
             <div className="text-xs font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1"><Phone className="w-3 h-3" /> 1553</div>
          </div>
          <div className="text-xs text-slate-500">National Center for Mental Health</div>
        </a>
      </div>
    </div>
  );
}
