import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, Clock, RefreshCw, Send, PhoneCall, 
  Filter, Sparkles, AlertOctagon, UserX, FileText, Check, Award, Eye, Lock, 
  ShieldCheck, GraduationCap, HeartHandshake, BookOpen, Briefcase, Users,
  Building2, UserCheck, Shield, MapPin, Landmark, MessageSquare,
  Mic, Volume2, Play, Pause, Square, Radio, RotateCcw, FileAudio, X, Image as ImageIcon, Film, Maximize2
} from 'lucide-react';
import { UserProfile, UserRole, ROLE_CONFIGS, getRolePermissions, getUserDisplayName } from '../types/auth';
import { playAudibleRecording } from '../utils/audioPlayback';

export interface AttachedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size?: string;
}

export interface AdminSafetyAlert {
  id: string;
  timestamp: string;
  category: 'SUICIDE_SELF_HARM' | 'CRIMINAL_ACTIVITY' | 'ILLEGAL_ACT' | 'BULLYING_HARASSMENT' | 'UNTOWARD_BEHAVIOR' | 'OTHER_CONCERN';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  sourceModule: string;
  flaggedContent: string;
  triggerReason: string;
  status: 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';
  recommendedActions: string[];
  userSessionId: string;
  location?: string;
  involved?: string;
  audioUrl?: string;
  audioDuration?: number;
  attachedMedia?: AttachedMedia[];
}

export type InstitutionalRole = 
  | 'school_admin'
  | 'guidance_counselor'
  | 'department_head'
  | 'teacher_adviser'
  | 'school_guard'
  | 'non_teaching_staff'
  | 'sdo_admin'
  | 'pnp_authority'
  | 'brgy_official'
  | 'city_official';

export interface HierarchyRoleConfig {
  id: InstitutionalRole;
  title: string;
  shortLabel: string;
  clearanceLevel: string;
  badgeColor: string;
  allowedCategories: Array<AdminSafetyAlert['category']>;
  description: string;
  icon: any;
  actionProtocols: {
    ackLabel: string;
    resolveLabel: string;
    specialDispatchLabel?: string;
  };
}

export const HIERARCHY_ROLES: HierarchyRoleConfig[] = [
  {
    id: 'school_admin',
    title: 'School Administrator (School Head / Asst. Head)',
    shortLabel: 'School Admin',
    clearanceLevel: 'Level 6 Executive Clearance',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
    description: 'Full executive system oversight, division reporting, incident clearance authority, and emergency policy enforcement.',
    icon: Building2,
    actionProtocols: {
      ackLabel: 'Executive Acknowledge',
      resolveLabel: 'Administrative Case Resolution',
      specialDispatchLabel: 'Endorse to DepEd Division Office'
    }
  },
  {
    id: 'guidance_counselor',
    title: 'School Guidance Counselor',
    shortLabel: 'Counselor',
    clearanceLevel: 'Level 5 Student Welfare Clearance',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'UNTOWARD_BEHAVIOR', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT'],
    description: 'Direct student crisis response, suicide intervention (Hopeline PH 177), and Anti-Bullying Act (RA 10627) protocol dispatch.',
    icon: HeartHandshake,
    actionProtocols: {
      ackLabel: 'Counselor Logged & Contacted',
      resolveLabel: 'Case Resolved with Student Session',
      specialDispatchLabel: 'Dispatch Hopeline / NCMH 1553 Hotline'
    }
  },
  {
    id: 'department_head',
    title: 'School Department Head',
    shortLabel: 'Dept Head',
    clearanceLevel: 'Level 4 Academic Oversight Clearance',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
    description: 'Oversees department student safety, academic environment incidents, faculty advisory actions, and departmental endorsements.',
    icon: GraduationCap,
    actionProtocols: {
      ackLabel: 'Department Acknowledged',
      resolveLabel: 'Resolved at Department Level',
      specialDispatchLabel: 'Escalate to Guidance / Admin'
    }
  },
  {
    id: 'teacher_adviser',
    title: 'School Teacher / Class Adviser',
    shortLabel: 'Teacher / Adviser',
    clearanceLevel: 'Level 5 Classroom Advisory Clearance',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'UNTOWARD_BEHAVIOR'],
    description: 'Monitors advisory class behavioral indicators, classroom bullying incidents, student welfare check-ins, and parent notifications.',
    icon: BookOpen,
    actionProtocols: {
      ackLabel: 'Adviser Logged',
      resolveLabel: 'Resolved in Advisory Class',
      specialDispatchLabel: 'Refer to Guidance Office & Parent'
    }
  },
  {
    id: 'school_guard',
    title: 'School Guard / Campus Security',
    shortLabel: 'School Guard',
    clearanceLevel: 'Level 3 Campus Security Clearance',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
    description: 'Monitors physical campus security threats, suicide/self-harm crisis dispatch, violence, illegal items/weapons, and emergency response.',
    icon: ShieldCheck,
    actionProtocols: {
      ackLabel: 'Security Guard Responding',
      resolveLabel: 'Secured & Incident Logged',
      specialDispatchLabel: 'Dispatch Campus Security / 911 PNP'
    }
  },
  {
    id: 'non_teaching_staff',
    title: 'School Non-Teaching Staff (Nurse/Clinic)',
    shortLabel: 'Staff',
    clearanceLevel: 'Level 3 Staff & Clinic Clearance',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'UNTOWARD_BEHAVIOR', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT'],
    description: 'School clinic medical emergency referrals, suicide/crisis first response, facility incident verification, and clinic safety dispatch.',
    icon: UserCheck,
    actionProtocols: {
      ackLabel: 'Staff Verified',
      resolveLabel: 'Facility Log Cleared',
      specialDispatchLabel: 'Refer to Clinic / Safety Officer'
    }
  },
  {
    id: 'sdo_admin',
    title: 'SDO Administrator (Schools Division Office)',
    shortLabel: 'SDO Admin',
    clearanceLevel: 'Level 7 Division Superintendent Regional Clearance',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    allowedCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
    description: 'Division-wide mental health policy oversight, multi-school incident coordination, and division escalation.',
    icon: Award,
    actionProtocols: {
      ackLabel: 'Division Superintendent Logged',
      resolveLabel: 'Division Resolution Approved',
      specialDispatchLabel: 'Dispatch SDO Regional Rapid Response'
    }
  },
  {
    id: 'pnp_authority',
    title: 'PNP National Authority (Police & WCPD)',
    shortLabel: 'PNP / Police',
    clearanceLevel: 'Level 8 National Police & Emergency Response Clearance',
    badgeColor: 'bg-red-600/30 text-red-200 border-red-500/50',
    allowedCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'SUICIDE_SELF_HARM'],
    description: 'National police crisis dispatch desk for active violence, severe criminal threats, and WCPD child safety intervention.',
    icon: ShieldAlert,
    actionProtocols: {
      ackLabel: 'PNP Unit Dispatched',
      resolveLabel: 'Police Precinct Intervention Completed',
      specialDispatchLabel: 'Dispatch WCPD Mobile Crisis Unit'
    }
  },
  {
    id: 'brgy_official',
    title: 'Barangay Official (BVAWC & Community Protection)',
    shortLabel: 'Brgy Official',
    clearanceLevel: 'Level 9 Local Barangay BVAWC Protection Clearance',
    badgeColor: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50',
    allowedCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT', 'SUICIDE_SELF_HARM'],
    description: 'Local barangay youth welfare monitoring, BVAWC (Violence Against Women & Children) desk response, and community child safety patrol.',
    icon: MapPin,
    actionProtocols: {
      ackLabel: 'Barangay Patrol Dispatched',
      resolveLabel: 'Barangay BVAWC Resolution Signed',
      specialDispatchLabel: 'Dispatch Barangay Tanod & BVAWC Desk'
    }
  },
  {
    id: 'city_official',
    title: 'City / LGU Official (CSWDO & Youth Office)',
    shortLabel: 'City / LGU Official',
    clearanceLevel: 'Level 10 City LGU CSWDO Executive Clearance',
    badgeColor: 'bg-blue-600/30 text-blue-200 border-blue-500/50',
    allowedCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT', 'SUICIDE_SELF_HARM', 'UNTOWARD_BEHAVIOR'],
    description: 'City-wide youth welfare oversight, CSWDO (City Social Welfare) intervention, and municipal emergency response desk.',
    icon: Landmark,
    actionProtocols: {
      ackLabel: 'City CSWDO Worker Assigned',
      resolveLabel: 'Municipal Welfare Case Closed',
      specialDispatchLabel: 'Dispatch City Social Worker & Youth Emergency Desk'
    }
  }
];

export default function AdminAlertsModule({ 
  currentUser,
  onOpenAuthorityChat 
}: { 
  currentUser?: UserProfile | null;
  onOpenAuthorityChat?: (alert: AdminSafetyAlert) => void;
}) {
  const userRole = currentUser?.role || 'student';
  const permissions = getRolePermissions(userRole);

  const [alerts, setAlerts] = useState<AdminSafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<InstitutionalRole>(
    (permissions.canAccessAdminAlerts ? userRole : 'school_admin') as InstitutionalRole
  );
  const [strictRoleVisibility, setStrictRoleVisibility] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('UNRESOLVED');
  
  // Test alert generator state
  const [testContent, setTestContent] = useState('');
  const [testCategory, setTestCategory] = useState<'SUICIDE_SELF_HARM' | 'CRIMINAL_ACTIVITY' | 'ILLEGAL_ACT' | 'BULLYING_HARASSMENT'>('SUICIDE_SELF_HARM');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Keep activeRole synced if user changes role
  useEffect(() => {
    if (permissions.canAccessAdminAlerts) {
      setActiveRole(userRole as InstitutionalRole);
    }
  }, [userRole]);

  // If user is a student or parent, show restricted access banner
  if (!permissions.canAccessAdminAlerts) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 border border-rose-300 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Restricted Access Module</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              The <span className="text-rose-600 font-semibold">Admin Safety Desk</span> is restricted to designated School Administrators, Guidance Counselors, Campus Security, Division Officials, and Emergency Authorities.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Active Designation:</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{getUserDisplayName(currentUser)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${permissions.badgeColor}`}>
                {currentUser ? ROLE_CONFIGS[currentUser.role].label : 'Student'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] pt-1">
              If you are facing a personal crisis or need immediate help, please talk with your counselor on <span className="text-indigo-600 font-semibold">SaFie AI Counselor</span> or contact Hopeline PH at <span className="text-rose-600 font-bold">177</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeRoleConfig = HIERARCHY_ROLES.find(r => r.id === activeRole) || HIERARCHY_ROLES[0];

  // Image Lightbox & Card Audio State
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);
  const [playingCardAudioId, setPlayingCardAudioId] = useState<string | null>(null);
  const cardAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeCardPlaybackStopRef = useRef<(() => void) | null>(null);
  const activeModalPlaybackStopRef = useRef<(() => void) | null>(null);

  const togglePlayCardAudio = (alertId: string, url?: string, textFallback?: string) => {
    if (activeCardPlaybackStopRef.current) {
      activeCardPlaybackStopRef.current();
      activeCardPlaybackStopRef.current = null;
    }

    if (playingCardAudioId === alertId) {
      setPlayingCardAudioId(null);
    } else {
      setPlayingCardAudioId(alertId);
      const stop = playAudibleRecording({
        audioUrl: url,
        textFallback: textFallback || "Attached incident voice recording log statement.",
        onEnd: () => setPlayingCardAudioId(null)
      });
      activeCardPlaybackStopRef.current = stop;
    }
  };

  // Voice Reply Modal State
  const [voiceModalAlert, setVoiceModalAlert] = useState<AdminSafetyAlert | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceRecordingSec, setVoiceRecordingSec] = useState<number>(0);
  const [voiceModalAudioUrl, setVoiceModalAudioUrl] = useState<string | null>(null);
  const [voiceModalCaption, setVoiceModalCaption] = useState<string>('');
  const [isVoiceModalPlaying, setIsVoiceModalPlaying] = useState<boolean>(false);

  const voiceMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const startModalVoiceRecording = async () => {
    setVoiceModalAudioUrl(null);
    setVoiceRecordingSec(0);
    voiceChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        voiceMediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) voiceChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setVoiceModalAudioUrl(url);
          stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        setIsVoiceRecording(true);

        voiceTimerRef.current = setInterval(() => {
          setVoiceRecordingSec(prev => prev + 1);
        }, 1000);
      } else {
        setIsVoiceRecording(true);
        voiceTimerRef.current = setInterval(() => {
          setVoiceRecordingSec(prev => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn('Voice recording fallback in AdminAlertsModule:', err);
      setIsVoiceRecording(true);
      voiceTimerRef.current = setInterval(() => {
        setVoiceRecordingSec(prev => prev + 1);
      }, 1000);
    }
  };

  const stopModalVoiceRecording = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (voiceMediaRecorderRef.current && voiceMediaRecorderRef.current.state !== 'inactive') {
      voiceMediaRecorderRef.current.stop();
    } else if (!voiceModalAudioUrl) {
      setVoiceModalAudioUrl('simulated-authority-voice-note');
    }
    setIsVoiceRecording(false);
  };

  const cancelModalVoiceRecording = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (voiceMediaRecorderRef.current && voiceMediaRecorderRef.current.state !== 'inactive') {
      voiceMediaRecorderRef.current.stop();
    }
    setIsVoiceRecording(false);
    setVoiceModalAudioUrl(null);
    setVoiceRecordingSec(0);
  };

  const togglePlayModalAudio = () => {
    if (activeModalPlaybackStopRef.current) {
      activeModalPlaybackStopRef.current();
      activeModalPlaybackStopRef.current = null;
    }

    if (isVoiceModalPlaying) {
      setIsVoiceModalPlaying(false);
    } else {
      setIsVoiceModalPlaying(true);
      const stop = playAudibleRecording({
        audioUrl: voiceModalAudioUrl,
        textFallback: voiceModalCaption || "Dispatching official authority voice note response.",
        onEnd: () => setIsVoiceModalPlaying(false)
      });
      activeModalPlaybackStopRef.current = stop;
    }
  };

  const handleDispatchVoiceResponse = async () => {
    if (!voiceModalAlert) return;

    const duration = voiceRecordingSec || 12;
    const caption = voiceModalCaption || `🎙️ Official Voice Response Note from ${activeRoleConfig.shortLabel}`;

    handleUpdateStatus(voiceModalAlert.id, 'ACKNOWLEDGED', `🎙️ Voice Note (${duration}s) Dispatched`);

    const voiceMsg = {
      id: 'msg-voice-alert-' + Date.now(),
      chatId: 'chat-' + voiceModalAlert.id,
      alertId: voiceModalAlert.id,
      senderId: currentUser ? currentUser.id : 'auth-admin',
      senderName: currentUser ? getUserDisplayName(currentUser) : activeRoleConfig.shortLabel,
      senderRole: currentUser ? currentUser.role : 'school_admin',
      text: caption,
      timestamp: new Date().toISOString(),
      messageType: 'voice',
      audioUrl: voiceModalAudioUrl || 'simulated-authority-voice-note',
      audioDuration: duration
    };

    window.dispatchEvent(new CustomEvent('authority_message_created', { detail: voiceMsg }));

    showToast(`🎙️ Voice Message Response dispatched to Alert #${voiceModalAlert.id}!`);
    setVoiceModalAlert(null);
    cancelModalVoiceRecording();
  };


  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/alerts');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000); // Auto refresh every 4s
    
    const handleSafetyAlert = () => {
      fetchAlerts();
    };

    window.addEventListener('safety_alert_created', handleSafetyAlert);
    return () => {
      clearInterval(interval);
      window.removeEventListener('safety_alert_created', handleSafetyAlert);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'ACKNOWLEDGED' | 'RESOLVED', actionNote?: string) => {
    try {
      const res = await fetch('/api/admin/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        showToast(`[${activeRoleConfig.shortLabel}] Alert #${id} marked as ${newStatus}${actionNote ? ` (${actionNote})` : ''}`);
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  const handleClearResolved = async () => {
    try {
      const res = await fetch('/api/admin/alerts/clear', { method: 'POST' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        fetchAlerts();
        showToast('Resolved alerts cleared from system log');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateAlert = async (presetText?: string, presetCat?: 'SUICIDE_SELF_HARM' | 'CRIMINAL_ACTIVITY' | 'ILLEGAL_ACT' | 'BULLYING_HARASSMENT') => {
    const textToSubmit = presetText || testContent;
    const catToSubmit = presetCat || testCategory;

    if (!textToSubmit.trim()) return;
    setIsSubmittingTest(true);

    try {
      const res = await fetch('/api/admin/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: catToSubmit,
          content: textToSubmit,
          module: `${activeRoleConfig.shortLabel} Simulation`
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        setTestContent('');
        await fetchAlerts();
        showToast(`⚡ Incident alert triggered under scope category "${catToSubmit}"`);
      }
    } catch (err) {
      console.error('Failed to submit test alert:', err);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  // Filter alerts by Account Hierarchy Scope & UI Filters
  const visibleAlertsByHierarchy = alerts.filter(alert => {
    // Check hierarchy role scope
    if (strictRoleVisibility && !activeRoleConfig.allowedCategories.includes(alert.category)) {
      return false;
    }
    // Check Category dropdown filter
    if (filterCategory !== 'ALL' && alert.category !== filterCategory) {
      return false;
    }
    // Check Status dropdown filter
    if (filterStatus !== 'ALL' && alert.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const totalAlerts = alerts.length;
  const criticalSuicideCount = alerts.filter(a => a.category === 'SUICIDE_SELF_HARM' && a.status === 'UNRESOLVED').length;
  const bullyingCount = alerts.filter(a => a.category === 'BULLYING_HARASSMENT' && a.status === 'UNRESOLVED').length;
  const crimeIllegalCount = alerts.filter(a => (a.category === 'CRIMINAL_ACTIVITY' || a.category === 'ILLEGAL_ACT') && a.status === 'UNRESOLVED').length;
  const totalUnresolved = alerts.filter(a => a.status === 'UNRESOLVED').length;
  const roleAccessibleCount = visibleAlertsByHierarchy.filter(a => a.status === 'UNRESOLVED').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto custom-scrollbar">
      {/* Top Console Header */}
      <div className="border-b border-slate-200 bg-white p-4 sm:p-6 md:p-8 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Hierarchy Visibility Admin Monitoring System</h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm">
              Role-Based Safety & Incident Management with strict category authorization across school accounts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={fetchAlerts}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 flex items-center gap-2 transition-colors min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Feed
            </button>
            <button
              onClick={handleClearResolved}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium border border-slate-300 transition-colors min-h-[44px] shadow-sm"
            >
              Clear Resolved Logs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Toast Notification */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-md">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* --- HIERARCHY ROLE SWITCHER BAR --- */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" /> Institutional Account Hierarchy Switcher
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                Active Session Account: <span className="text-indigo-800">{activeRoleConfig.title}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-300 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={strictRoleVisibility}
                  onChange={(e) => setStrictRoleVisibility(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-white"
                />
                <span className="flex items-center gap-1.5">
                  {strictRoleVisibility ? <Lock className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
                  {strictRoleVisibility ? 'Strict Hierarchy Authorization Filter' : 'All System Logs (Superuser View)'}
                </span>
              </label>
            </div>
          </div>

          {/* 6 Institutional Account Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {HIERARCHY_ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = activeRole === role.id;
              
              // Count unhandled incidents for this specific role's clearance scope
              const rolePendingCount = alerts.filter(a => 
                a.status === 'UNRESOLVED' && role.allowedCategories.includes(a.category)
              ).length;

              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`p-3 sm:p-3.5 rounded-xl text-left transition-all relative flex flex-col justify-between border min-h-[76px] ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-md ring-1 ring-indigo-500/50'
                      : rolePendingCount > 0
                        ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-slate-900'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      {rolePendingCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 ${
                          isSelected ? 'bg-rose-600 text-white animate-pulse shadow' : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        }`}>
                          <span>🚩 RED FLAG ({rolePendingCount})</span>
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs leading-snug line-clamp-2 text-slate-900">{role.shortLabel}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span>{role.allowedCategories.length} Cats</span>
                    {isSelected && <span className="text-indigo-700 font-bold">Active</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Detailed Scope Card */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${activeRoleConfig.badgeColor}`}>
                  {activeRoleConfig.clearanceLevel}
                </span>
                <span className="text-slate-500">• Scope: {activeRoleConfig.allowedCategories.length} Categories Authorized</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{activeRoleConfig.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Visible Categories:</span>
              {activeRoleConfig.allowedCategories.map(cat => (
                <span key={cat} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono text-indigo-800 shadow-sm">
                  {cat === 'SUICIDE_SELF_HARM' && 'Suicide/Self-Harm'}
                  {cat === 'BULLYING_HARASSMENT' && 'Bullying/Harassment'}
                  {cat === 'CRIMINAL_ACTIVITY' && 'Criminal Activity'}
                  {cat === 'ILLEGAL_ACT' && 'Illegal Acts'}
                  {cat === 'UNTOWARD_BEHAVIOR' && 'Untoward Behavior'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Hotline Protocol Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-950/90 via-slate-900 to-indigo-950/90 border border-rose-500/40 shadow-2xl flex flex-col gap-5 w-full overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2 flex-wrap">
                Emergency Hotline & Crisis Dispatch Center
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">Active Protocol</span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                If a critical suicide, bullying, or active violence alert is detected, dispatch immediate contact to verified response lines:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-indigo-200 text-center flex flex-col justify-center min-h-[64px] transition-all hover:bg-slate-100">
              <div className="text-indigo-800 font-bold">School Head (Principal)</div>
              <div className="text-slate-900 font-mono text-xs font-semibold mt-0.5">Dr. Alejandro Ramos</div>
              <a href="tel:09178882233" className="text-indigo-700 font-mono text-xs font-bold hover:underline">0917-888-2233</a>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-purple-200 text-center flex flex-col justify-center min-h-[64px] transition-all hover:bg-slate-100">
              <div className="text-purple-800 font-bold">Guidance Counselor Desk</div>
              <div className="text-slate-900 font-mono text-xs font-semibold mt-0.5">Mrs. Josefina Castro, RGC</div>
              <a href="tel:09194445566" className="text-purple-700 font-mono text-xs font-bold hover:underline">0919-444-5566</a>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-rose-200 text-center flex flex-col justify-center min-h-[64px] transition-all hover:bg-slate-100">
              <div className="text-rose-800 font-bold">Hopeline PH (24/7)</div>
              <div className="text-slate-900 font-mono text-xs font-semibold mt-1">177 / 0917-558-4673</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-cyan-200 text-center flex flex-col justify-center min-h-[64px] transition-all hover:bg-slate-100">
              <div className="text-cyan-800 font-bold">NCMH Crisis Line</div>
              <div className="text-slate-900 font-mono text-xs font-semibold mt-1">1553 / 0917-899-8727</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-amber-200 text-center flex flex-col justify-center min-h-[64px] transition-all hover:bg-slate-100">
              <div className="text-amber-800 font-bold">Emergency Services</div>
              <div className="text-slate-900 font-mono text-xs font-semibold mt-1">911</div>
            </div>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Role Authorized Alerts</div>
              <div className="text-xl font-bold text-slate-900 font-mono">{visibleAlertsByHierarchy.length} <span className="text-[10px] text-indigo-600 font-normal">({roleAccessibleCount} Pending)</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-rose-800 font-medium uppercase tracking-wider mb-0.5">Suicide Insinuations</div>
              <div className="text-xl font-bold text-rose-700 font-mono">{criticalSuicideCount} <span className="text-[10px] text-rose-600 font-normal">Pending</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-300">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-orange-800 font-medium uppercase tracking-wider mb-0.5">Bullying & Harassment</div>
              <div className="text-xl font-bold text-orange-700 font-mono">{bullyingCount} <span className="text-[10px] text-orange-600 font-normal">Pending</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-700 border border-orange-300">
              <UserX className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-amber-800 font-medium uppercase tracking-wider mb-0.5">Crime & Illegal Threats</div>
              <div className="text-xl font-bold text-amber-700 font-mono">{crimeIllegalCount} <span className="text-[10px] text-amber-600 font-normal">Pending</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] text-purple-800 font-medium uppercase tracking-wider mb-0.5">Unresolved System Total</div>
              <div className="text-xl font-bold text-purple-800 font-mono">{totalUnresolved}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Test Alert Simulator Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Simulate & Trigger Insinuation Incident Alert</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Current Role: {activeRoleConfig.shortLabel}</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Submit sample phrases containing suicide insinuations, bullying/harassment, or criminal threats to test the automatic alert trigger mechanism and hierarchy filtering:
          </p>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleSimulateAlert('I feel completely hopeless and want to end my life.', 'SUICIDE_SELF_HARM')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-medium transition-colors"
            >
              ⚡ Test: Suicide Insinuation ("ending my life")
            </button>
            <button
              onClick={() => handleSimulateAlert('Everyone in class is bullying me and spreading rumors online.', 'BULLYING_HARASSMENT')}
              className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 text-xs font-medium transition-colors"
            >
              ⚡ Test: Bullying / Cyberbullying ("bullying me")
            </button>
            <button
              onClick={() => handleSimulateAlert('I am planning to seek revenge and I want to hurt others who wronged me.', 'CRIMINAL_ACTIVITY')}
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-medium transition-colors"
            >
              ⚡ Test: Revenge & Hurt Others ("revenge & hurt others")
            </button>
            <button
              onClick={() => handleSimulateAlert('I am planning to break into the building and steal money.', 'CRIMINAL_ACTIVITY')}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-medium transition-colors"
            >
              ⚡ Test: Criminal Threat ("break into")
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <select
              value={testCategory}
              onChange={(e: any) => setTestCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="SUICIDE_SELF_HARM">Category: Suicide / Self-Harm</option>
              <option value="BULLYING_HARASSMENT">Category: Bullying / Cyber-Harassment</option>
              <option value="CRIMINAL_ACTIVITY">Category: Criminal Activity</option>
              <option value="ILLEGAL_ACT">Category: Illegal / Untoward Act</option>
              <option value="OTHER_CONCERN">Category: Other Concern</option>
            </select>

            <input
              type="text"
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter custom incident text (e.g. 'ako na lang mamatay', 'pinupuntirya ako ng bullies')..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSimulateAlert()}
            />

            <button
              onClick={() => handleSimulateAlert()}
              disabled={isSubmittingTest || !testContent.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Trigger Alert
            </button>
          </div>
        </div>

        {/* Incident Alerts Stream & Filter Control Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Authorized Safety Incident Feed
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-normal border border-slate-200">
                  {visibleAlertsByHierarchy.length} Items Displayed
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtered strictly by <span className="text-indigo-700 font-semibold">{activeRoleConfig.title}</span> authorization scope.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Authorized Categories</option>
                  <option value="SUICIDE_SELF_HARM">Suicide & Self-Harm</option>
                  <option value="BULLYING_HARASSMENT">Bullying & Harassment</option>
                  <option value="CRIMINAL_ACTIVITY">Criminal Activity</option>
                  <option value="ILLEGAL_ACT">Illegal / Untoward Acts</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNRESOLVED">Unresolved Only</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="RESOLVED">Resolved Log</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Incident Cards */}
          {visibleAlertsByHierarchy.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-slate-900 font-medium text-base">No active incidents under {activeRoleConfig.shortLabel} scope</h4>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                No unresolved safety or insinuation logs were found matching category filters for this account level.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleAlertsByHierarchy.map((alert) => {
                const isCritical = alert.severity === 'CRITICAL' || alert.category === 'SUICIDE_SELF_HARM';

                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
                      alert.status === 'UNRESOLVED'
                        ? isCritical
                          ? 'bg-rose-50 border-rose-300'
                          : alert.category === 'BULLYING_HARASSMENT'
                          ? 'bg-orange-50 border-orange-300'
                          : 'bg-amber-50 border-amber-300'
                        : alert.status === 'ACKNOWLEDGED'
                        ? 'bg-slate-50 border-slate-300 opacity-90'
                        : 'bg-white border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Incident Card Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Severity Tag */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCritical 
                            ? 'bg-rose-600 text-white animate-pulse shadow-sm' 
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {alert.severity} SEVERITY
                        </span>

                        {/* Category Badge */}
                        <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-300 text-[11px] font-medium shadow-sm">
                          {alert.category === 'SUICIDE_SELF_HARM' && '🚨 Suicide / Self-Harm Insinuation'}
                          {alert.category === 'BULLYING_HARASSMENT' && '🛑 Bullying / Cyber-Harassment'}
                          {alert.category === 'CRIMINAL_ACTIVITY' && '⚠️ Criminal Intent / Violence'}
                          {alert.category === 'ILLEGAL_ACT' && '⛔ Illegal / Untoward Activity'}
                          {alert.category === 'UNTOWARD_BEHAVIOR' && '⚠️ Behavioral Insinuation'}
                          {alert.category === 'OTHER_CONCERN' && '💬 Other Concern / Unclassified'}
                        </span>

                        {/* Module Source */}
                        <span className="text-xs text-slate-500 font-mono">
                          Source: <span className="text-slate-800 font-semibold">{alert.sourceModule}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-slate-400">#{alert.id}</span>
                      </div>
                    </div>

                    {/* Location & Involved Context */}
                    {(alert.location || alert.involved) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {alert.location && (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium flex items-center gap-1.5 shadow-2xs">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            Location: <strong className="text-slate-900">{alert.location}</strong>
                          </span>
                        )}
                        {alert.involved && (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium flex items-center gap-1.5 shadow-2xs">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            Involved: <strong className="text-slate-900">{alert.involved}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Flagged Text Narrative & Trigger Reason */}
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 font-sans leading-relaxed shadow-2xs space-y-1.5">
                        <div className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" /> Attached Incident Text Narrative:
                        </div>
                        <div className="text-slate-900 font-medium text-xs sm:text-sm whitespace-pre-wrap pl-1 border-l-2 border-indigo-500">
                          "{alert.flaggedContent}"
                        </div>
                      </div>

                      {/* Attached Voice Audio Player */}
                      {(alert.audioUrl || alert.flaggedContent.includes('Voice Recording Attached')) && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePlayCardAudio(alert.id, alert.audioUrl, alert.flaggedContent)}
                              className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-sm shrink-0 ${
                                playingCardAudioId === alert.id ? 'bg-purple-700 ring-2 ring-purple-400 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
                              }`}
                            >
                              {playingCardAudioId === alert.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <div>
                              <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                                <FileAudio className="w-4 h-4 text-purple-600" />
                                🎙️ Attached Incident Voice Statement
                              </div>
                              <div className="text-[10px] text-purple-700 font-mono mt-0.5">
                                {playingCardAudioId === alert.id ? 'Playing audio recording...' : `Duration: ${alert.audioDuration || 10} seconds • Click play to listen`}
                              </div>
                            </div>
                          </div>

                          {/* Sound wave visualizer bars */}
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-100/80 border border-purple-200">
                            {[12, 20, 16, 24, 10, 18, 22, 14, 26, 12].map((h, i) => (
                              <div
                                key={i}
                                style={{ height: `${h}px` }}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  playingCardAudioId === alert.id ? 'bg-purple-600 animate-pulse' : 'bg-purple-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attached Images & Video Evidence Grid */}
                      {alert.attachedMedia && alert.attachedMedia.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                          <div className="text-[11px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                            Attached Evidence Files ({alert.attachedMedia.length}):
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {alert.attachedMedia.map((media) => (
                              <div key={media.id} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all">
                                {media.type === 'image' ? (
                                  <div className="relative">
                                    <img
                                      src={media.url}
                                      alt={media.name}
                                      className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    <button
                                      onClick={() => setPreviewImageModalUrl(media.url)}
                                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold"
                                    >
                                      <Maximize2 className="w-4 h-4" /> Inspect Photo
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-2 bg-slate-900 rounded-xl">
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full h-32 rounded-lg object-cover bg-black"
                                    />
                                  </div>
                                )}
                                <div className="p-2 text-[10px] text-slate-600 truncate font-mono bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                  <span className="truncate">{media.name}</span>
                                  <span className="font-bold text-indigo-600 uppercase shrink-0 ml-1">{media.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-amber-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Trigger Analysis: {alert.triggerReason}</span>
                      </div>
                    </div>

                    {/* Recommended Action Checklist */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Recommended Institutional Protocols:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {alert.recommendedActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Role-Specific Action Dispatch Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Status:</span>
                        <span className={`font-semibold ${
                          alert.status === 'UNRESOLVED' ? 'text-rose-700' : alert.status === 'ACKNOWLEDGED' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Red Flag Direct Student Outreach Chat Button */}
                        {onOpenAuthorityChat && (
                          <button
                            onClick={() => onOpenAuthorityChat(alert)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-white animate-pulse" />
                            💬 Chat Student / Red Flag Outreach
                          </button>
                        )}

                        {/* Reply with Voice Note Button */}
                        <button
                          onClick={() => {
                            setVoiceModalAlert(alert);
                            setVoiceModalCaption(`🎙️ Official Voice Note from ${activeRoleConfig.shortLabel}: We received your report and are providing guidance.`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Mic className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
                          🎙️ Reply with Voice Note
                        </button>

                        {/* Custom Role Special Dispatch Button */}
                        {activeRoleConfig.actionProtocols.specialDispatchLabel && (
                          <button
                            onClick={() => {
                              showToast(`[${activeRoleConfig.shortLabel}] Dispatched: ${activeRoleConfig.actionProtocols.specialDispatchLabel} for Alert #${alert.id}`);
                              handleUpdateStatus(alert.id, 'ACKNOWLEDGED', activeRoleConfig.actionProtocols.specialDispatchLabel);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                            {activeRoleConfig.actionProtocols.specialDispatchLabel}
                          </button>
                        )}

                        {alert.status === 'UNRESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'ACKNOWLEDGED')}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-medium transition-colors"
                          >
                            {activeRoleConfig.actionProtocols.ackLabel}
                          </button>
                        )}

                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {activeRoleConfig.actionProtocols.resolveLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Authority Critical Voice Note Response Modal */}
      {voiceModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white border border-purple-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setVoiceModalAlert(null);
                cancelModalVoiceRecording();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400 animate-pulse" /> Official Authority Voice Note Response
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Alert #{voiceModalAlert.id} Response Desk
              </h3>
              <p className="text-xs text-slate-400">
                Record or preview an official voice note from <span className="text-purple-300 font-semibold">{activeRoleConfig.shortLabel}</span> to dispatch directly to the student thread.
              </p>
            </div>

            {/* Alert Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Insinuation / Flagged Content:</div>
              <p className="text-slate-200 font-mono italic">"{voiceModalAlert.flaggedContent}"</p>
              <div className="text-[10px] text-amber-400 pt-1">Source: {voiceModalAlert.sourceModule} | Category: {voiceModalAlert.category}</div>
            </div>

            {/* Quick Voice Note Presets */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Select Quick Pre-recorded Voice Note or Record Live:</div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  onClick={() => {
                    setVoiceModalAudioUrl('simulated-authority-voice-note');
                    setVoiceRecordingSec(14);
                    setVoiceModalCaption(`🎙️ Guidance Reassurance (${activeRoleConfig.shortLabel}): "Hi, I received your alert. We are here to keep you safe and supported. Please know you are not alone."`);
                  }}
                  className="p-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-purple-200">🎙️ Reassurance Voice Note (14s)</div>
                    <div className="text-[11px] text-slate-400">"Hi, we received your alert. You are completely safe with us..."</div>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-1 rounded text-purple-300">14s</span>
                </button>

                <button
                  onClick={() => {
                    setVoiceModalAudioUrl('simulated-authority-voice-note');
                    setVoiceRecordingSec(18);
                    setVoiceModalCaption(`🎙️ Office Counseling Invitation (${activeRoleConfig.shortLabel}): "Hello! I would like to invite you for a gentle, confidential chat at the office today anytime you feel ready."`);
                  }}
                  className="p-3 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-500/40 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-indigo-200">🎙️ Guidance Office Invitation (18s)</div>
                    <div className="text-[11px] text-slate-400">"Hello! I invite you for a gentle chat at the office today..."</div>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-500/20 px-2 py-1 rounded text-indigo-300">18s</span>
                </button>
              </div>
            </div>

            {/* Live Recording Controller */}
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className={`w-4 h-4 ${isVoiceRecording ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                  {isVoiceRecording ? 'Recording Live Microphone...' : voiceModalAudioUrl ? 'Voice Note Ready' : 'Record Custom Microphone Response'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {voiceRecordingSec}s
                </span>
              </div>

              {!isVoiceRecording && !voiceModalAudioUrl && (
                <button
                  onClick={startModalVoiceRecording}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Mic className="w-4 h-4 text-white animate-pulse" /> Start Live Recording
                </button>
              )}

              {isVoiceRecording && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-rose-300 font-mono animate-pulse">🔴 Recording audio...</span>
                  <button
                    onClick={stopModalVoiceRecording}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop & Preview
                  </button>
                </div>
              )}

              {!isVoiceRecording && voiceModalAudioUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <button
                      onClick={togglePlayModalAudio}
                      className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md"
                    >
                      {isVoiceModalPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">
                        {isVoiceModalPlaying ? '🔊 Playing Voice Note...' : 'Click play to review voice message'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Duration: {voiceRecordingSec} seconds</div>
                    </div>
                    <button
                      onClick={startModalVoiceRecording}
                      className="text-xs text-slate-400 hover:text-white p-1"
                      title="Re-record"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={voiceModalCaption}
                    onChange={(e) => setVoiceModalCaption(e.target.value)}
                    placeholder="Add an optional text caption or guidance note..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setVoiceModalAlert(null);
                  cancelModalVoiceRecording();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDispatchVoiceResponse();
                  if (onOpenAuthorityChat && voiceModalAlert) {
                    onOpenAuthorityChat(voiceModalAlert);
                  }
                }}
                disabled={!voiceModalAudioUrl}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" /> Dispatch Voice Note to Alert Lines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Evidence Image Lightbox Modal */}
      {previewImageModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-900 border border-slate-700 rounded-3xl p-4 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewImageModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={previewImageModalUrl}
              alt="Evidence Full Preview"
              className="max-h-[80vh] w-auto object-contain rounded-2xl border border-slate-800 shadow-xl"
            />

            <div className="mt-3 text-xs text-slate-400 font-mono flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Full High-Resolution Attached Evidence Image Inspection</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
