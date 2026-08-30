import React, { useState } from 'react';
import { 
  Heart, ShieldAlert, User, Bell, PhoneCall, MessageSquare, Send, 
  CheckCircle, AlertTriangle, Info, Sparkles, Activity, Clock, RefreshCw, 
  BookOpen, ChevronRight, Phone, Lock, HeartHandshake, Smile, Frown, Meh, Award, Check,
  Mic, MicOff, Square, RotateCcw, Play, Pause, Volume2, FileAudio
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export interface ChildRedFlagAlert {
  id: string;
  childName: string;
  lrn: string;
  timestamp: string;
  severity: 'HIGH_RISK' | 'MODERATE_RISK' | 'WELLNESS_NOTE';
  category: 'HIGH_STRESS' | 'BULLYING_HARASSMENT' | 'ANXIETY' | 'ACADEMIC_BURNOUT' | 'POSITIVE_PROGRESS';
  title: string;
  aiSource: string;
  triggerContext: string;
  suggestedParentAction: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  counselorNotified: boolean;
}

export default function ParentMonitoringModule({ currentUser }: { currentUser?: UserProfile | null }) {
  const childName = '109283748291';

  const [alerts, setAlerts] = useState<ChildRedFlagAlert[]>([
    {
      id: 'pa-001',
      childName: childName,
      lrn: '109283748291',
      timestamp: '25 minutes ago',
      severity: 'HIGH_RISK',
      category: 'ACADEMIC_BURNOUT',
      title: 'Severe Exam Stress & Late-Night Exhaustion Detected',
      aiSource: 'SaFie Voice Reflection & Journaling',
      triggerContext: '"I\'ve been sleeping only 2 hours a night for 3 days straight studying calculus. My head hurts constantly and I feel like crying whenever I walk into school..."',
      suggestedParentAction: 'Have a gentle, non-judgmental check-in with Maria about exam pressure tonight. Encourage adequate rest.',
      isAcknowledged: false,
      counselorNotified: true
    },
    {
      id: 'pa-002',
      childName: childName,
      lrn: '109283748291',
      timestamp: 'Yesterday at 4:15 PM',
      severity: 'MODERATE_RISK',
      category: 'BULLYING_HARASSMENT',
      title: 'Peer Group Exclusion & Anxiety Mention',
      aiSource: 'SaFie AI Counselor Chat Session',
      triggerContext: '"Some group chat members intentionally left me out of the SHS research presentation slides and wouldn\'t reply to my messages..."',
      suggestedParentAction: 'Check if Maria wants to speak with Mrs. Castro (RGC Guidance Counselor) about group project dynamics.',
      isAcknowledged: true,
      acknowledgedAt: 'Yesterday at 6:30 PM',
      counselorNotified: true
    },
    {
      id: 'pa-003',
      childName: childName,
      lrn: '109283748291',
      timestamp: '2 days ago',
      severity: 'WELLNESS_NOTE',
      category: 'POSITIVE_PROGRESS',
      title: 'Completed 4-7-8 Breathing & Expressed Gratitude',
      aiSource: 'SaFie Breathing Helps Module',
      triggerContext: '"Felt much calmer after completing 5 minutes of deep breathing. Logged gratitude for dinner conversation with Mom."',
      suggestedParentAction: 'Praise Maria for taking proactive wellness breaks!',
      isAcknowledged: true,
      acknowledgedAt: '2 days ago',
      counselorNotified: false
    }
  ]);

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [showVoiceNoteModal, setShowVoiceNoteModal] = useState<boolean>(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceRecordingSeconds, setVoiceRecordingSeconds] = useState<number>(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<number>(0);
  const [voiceNoteCaption, setVoiceNoteCaption] = useState<string>('');
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState<boolean>(false);

  const voiceMediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const voiceChunksRef = React.useRef<Blob[]>([]);
  const voiceTimerRef = React.useRef<any>(null);

  const [encouragementNote, setEncouragementNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [counselorNote, setCounselorNote] = useState('');

  const startVoiceRecording = async () => {
    try {
      setRecordedVoiceUrl(null);
      setRecordedVoiceDuration(0);
      setVoiceRecordingSeconds(0);
      voiceChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          voiceChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setRecordedVoiceUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsVoiceRecording(true);

      let secs = 0;
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = setInterval(() => {
        secs += 1;
        setVoiceRecordingSeconds(secs);
        setRecordedVoiceDuration(secs);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error for voice note:", err);
      showToast("❌ Microphone access denied or busy. Please check browser permissions.");
    }
  };

  const stopVoiceRecording = () => {
    if (voiceMediaRecorderRef.current && isVoiceRecording) {
      voiceMediaRecorderRef.current.stop();
      setIsVoiceRecording(false);
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
    }
  };

  const handleSendVoiceNote = async () => {
    if (!recordedVoiceUrl) return;
    setIsSendingVoiceNote(true);

    const captionText = voiceNoteCaption.trim() || `🎤 Parent Voice Message (${recordedVoiceDuration || voiceRecordingSeconds}s)`;

    const voiceMsg = {
      chatId: 'chat-alt-01',
      alertId: 'ALT-1001',
      senderId: currentUser?.id || 'usr-parent-01',
      senderName: 'Parent / Guardian (Maria\'s Parent)',
      senderRole: 'parent_guardian',
      text: captionText,
      messageType: 'voice',
      audioUrl: recordedVoiceUrl,
      audioDuration: recordedVoiceDuration || voiceRecordingSeconds,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'authority_messages'), voiceMsg);
      await setDoc(doc(db, 'authority_chats', 'chat-alt-01'), {
        lastMessage: `🎤 Parent Voice Message (${recordedVoiceDuration || voiceRecordingSeconds}s)`,
        lastUpdated: voiceMsg.timestamp,
        unreadCountStudent: 1
      }, { merge: true });
      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: voiceMsg }));
    } catch (e) {
      console.warn('Firestore write error in parent voice note:', e);
    }

    setIsSendingVoiceNote(false);
    setShowVoiceNoteModal(false);
    setRecordedVoiceUrl(null);
    setVoiceNoteCaption('');
    setVoiceRecordingSeconds(0);
    showToast(`🎤 Your voice message was sent to ${childName}!`);
  };

  // Sync with server alerts and listen for live safety keyword alerts
  React.useEffect(() => {
    const syncServerAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
          const serverAlerts: any[] = data.alerts || [];
          if (serverAlerts.length > 0) {
            const categoryTitles: Record<string, string> = {
              SUICIDE_SELF_HARM: 'CRITICAL: Insinuation of Suicide / Self-Harm Detected',
              BULLYING_HARASSMENT: 'HIGH RISK: Bullying / Harassment Flagged',
              CRIMINAL_ACTIVITY: 'HIGH RISK: Threat of Harm / Violence Keyword Triggered',
              ILLEGAL_ACT: 'HIGH RISK: Illegal Act / Untoward Incident Flagged',
              UNTOWARD_BEHAVIOR: 'HIGH RISK: Physical Assault / Untoward Incident Flagged'
            };

            setAlerts(prev => {
              const existingIds = new Set(prev.map(a => a.id));
              const newlyMapped: ChildRedFlagAlert[] = [];

              for (const sAlert of serverAlerts) {
                if (!existingIds.has(sAlert.id)) {
                  newlyMapped.push({
                    id: sAlert.id,
                    childName: childName,
                    lrn: '109283748291',
                    timestamp: new Date(sAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    severity: 'HIGH_RISK',
                    category: sAlert.category === 'BULLYING_HARASSMENT' ? 'BULLYING_HARASSMENT' : 'ANXIETY',
                    title: categoryTitles[sAlert.category] || 'URGENT: Triggered Safety Keyword Warning',
                    aiSource: sAlert.sourceModule || 'SaFie AI Companion Live Keyword Detection',
                    triggerContext: sAlert.flaggedContent ? `"${sAlert.flaggedContent}"` : 'Triggered keyword detected in message session.',
                    suggestedParentAction: sAlert.category === 'SUICIDE_SELF_HARM' 
                      ? 'CRITICAL CRISIS ALERT: Check in on 109283748291 immediately and contact Hopeline PH 177 / Guidance Counselor.'
                      : 'Check in on your child immediately. School guidance office, adviser, and officials have been notified.',
                    isAcknowledged: sAlert.status !== 'UNRESOLVED',
                    counselorNotified: true
                  });
                }
              }

              return newlyMapped.length > 0 ? [...newlyMapped, ...prev] : prev;
            });
          }
        }
      } catch (err) {
        // Silent catch
      }
    };

    syncServerAlerts();
    const interval = setInterval(syncServerAlerts, 4000);

    const handleSafetyAlert = (event: any) => {
      const detail = event?.detail;
      if (!detail) return;

      const categoryTitles: Record<string, string> = {
        SUICIDE_SELF_HARM: 'CRITICAL: Insinuation of Suicide / Self-Harm Detected',
        BULLYING_HARASSMENT: 'HIGH RISK: Bullying / Harassment Flagged',
        CRIMINAL_ACTIVITY: 'HIGH RISK: Threat of Harm / Violence Keyword Triggered',
        ILLEGAL_ACT: 'HIGH RISK: Illegal Act / Untoward Incident Flagged',
        UNTOWARD_BEHAVIOR: 'HIGH RISK: Physical Assault / Untoward Incident Flagged'
      };

      const newAlert: ChildRedFlagAlert = {
        id: detail.id || `pa-${Date.now()}`,
        childName: childName,
        lrn: '109283748291',
        timestamp: 'Just now',
        severity: 'HIGH_RISK',
        category: detail.category === 'BULLYING_HARASSMENT' ? 'BULLYING_HARASSMENT' : 'ANXIETY',
        title: categoryTitles[detail.category] || 'URGENT: Triggered Safety Keyword Warning',
        aiSource: detail.sourceModule || 'SaFie AI Companion Live Keyword Detection',
        triggerContext: detail.flaggedContent ? `"${detail.flaggedContent}"` : 'Triggered keyword detected in message session.',
        suggestedParentAction: detail.category === 'SUICIDE_SELF_HARM'
          ? 'CRITICAL CRISIS ALERT: Check in on 109283748291 immediately and contact Hopeline PH 177 / Guidance Counselor.'
          : 'Check in on your child immediately. School guidance office, adviser, and officials have been notified.',
        isAcknowledged: false,
        counselorNotified: true
      };

      setAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
      showToast(`🚨 URGENT RED WARNING: Triggered keyword detected in ${childName}'s session! Alert added to Parent Portal.`);
    };

    window.addEventListener('safety_alert_created', handleSafetyAlert);
    return () => {
      clearInterval(interval);
      window.removeEventListener('safety_alert_created', handleSafetyAlert);
    };
  }, [childName]);

  const unacknowledgedCount = alerts.filter(a => !a.isAcknowledged).length;

  const triggerMockAlert = () => {
    const newAlert: ChildRedFlagAlert = {
      id: `pa-${Date.now()}`,
      childName: childName,
      lrn: '109283748291',
      timestamp: 'Just now',
      severity: 'HIGH_RISK',
      category: 'ANXIETY',
      title: 'Sudden High Anxiety Trigger (Simulated Live Red Flag)',
      aiSource: 'SaFie AI Companion Live Detection',
      triggerContext: '"I feel so overwhelmed about upcoming deadlines that I can\'t focus on anything right now..."',
      suggestedParentAction: 'Provide a warm hug and reassure Maria that grades do not define her worth.',
      isAcknowledged: false,
      counselorNotified: true
    };

    setAlerts([newAlert, ...alerts]);
    showToast('🚨 Simulated Red Flag Trigger added to Parent Monitoring Stream!');
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          isAcknowledged: true,
          acknowledgedAt: 'Just now'
        };
      }
      return a;
    }));
    showToast('Alert acknowledged. School guidance counselor notified of parent review.');
  };

  const handleRequestCounselorCallback = async () => {
    if (!counselorNote.trim()) return;
    const noteText = counselorNote.trim();
    setShowCounselorModal(false);
    setCounselorNote('');

    const parentMsg = {
      chatId: 'chat-alt-01',
      alertId: 'ALT-1001',
      senderId: currentUser?.id || 'usr-parent-01',
      senderName: 'Parent / Guardian (Maria\'s Parent)',
      senderRole: 'parent_guardian',
      text: `📋 Guidance Consultation Request: "${noteText}"`,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'authority_messages'), parentMsg);
      await setDoc(doc(db, 'authority_chats', 'chat-alt-01'), {
        lastMessage: parentMsg.text,
        lastUpdated: parentMsg.timestamp,
        unreadCountAuthority: 1
      }, { merge: true });
      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: parentMsg }));
    } catch (e) {
      console.warn('Firestore write error in parent consultation request:', e);
    }

    showToast('✅ Consultation request sent to Mrs. Josefina Castro, RGC (School Guidance Counselor).');
  };

  const handleSendEncouragement = async () => {
    if (!encouragementNote.trim()) return;
    const noteText = encouragementNote.trim();
    setShowEncouragementModal(false);
    setEncouragementNote('');

    const parentMsg = {
      chatId: 'chat-alt-01',
      alertId: 'ALT-1001',
      senderId: currentUser?.id || 'usr-parent-01',
      senderName: 'Parent / Guardian (Maria\'s Parent)',
      senderRole: 'parent_guardian',
      text: `❤️ Warm Note from Parent: "${noteText}"`,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'authority_messages'), parentMsg);
      await setDoc(doc(db, 'authority_chats', 'chat-alt-01'), {
        lastMessage: parentMsg.text,
        lastUpdated: parentMsg.timestamp,
        unreadCountStudent: 1
      }, { merge: true });
      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: parentMsg }));
    } catch (e) {
      console.warn('Firestore write error in parent encouragement note:', e);
    }

    showToast(`❤️ Your warm encouragement note was delivered to ${childName}!`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRefreshHistory = async () => {
    try {
      const res = await fetch('/api/admin/alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) {
          setAlerts(data.alerts.map((item: any) => ({
            id: item.id || `alt-${Date.now()}`,
            childName: item.involved || 'Maria Dela Cruz',
            lrn: '109283748291',
            timestamp: item.timestamp || new Date().toISOString(),
            category: item.category || 'ACADEMIC_STRESS',
            severity: item.severity === 'CRITICAL' ? 'HIGH_RISK' : 'WELLNESS_NOTE',
            title: item.triggerReason || 'Academic Stress Check',
            triggerContext: item.flaggedContent || 'Student discussed feeling overwhelmed by exams.',
            recommendedAction: item.recommendedActions?.[0] || 'Provide warm parental support.',
            isAcknowledged: item.status === 'RESOLVED' || item.status === 'ACKNOWLEDGED'
          })));
        }
      }
    } catch (err) {}
    showToast('✨ Parent Portal safety alerts and activity history refreshed!');
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'UNACKNOWLEDGED') return !a.isAcknowledged;
    if (filterSeverity === 'HIGH_RISK') return a.severity === 'HIGH_RISK';
    if (filterSeverity === 'WELLNESS') return a.severity === 'WELLNESS_NOTE';
    return true;
  });

  // Dynamic Emotional Well-being Meter calculation based on live alerts
  const hasSuicideAlert = alerts.some(a => 
    a.category === 'SUICIDE_SELF_HARM' || 
    (a.title && a.title.toUpperCase().includes('SUICIDE')) || 
    (a.triggerContext && a.triggerContext.toLowerCase().includes('suicide')) || 
    (a.triggerContext && a.triggerContext.toLowerCase().includes('kill myself')) || 
    (a.triggerContext && a.triggerContext.toLowerCase().includes('want to die')) || 
    (a.triggerContext && a.triggerContext.toLowerCase().includes('end my life')) ||
    (a.title && a.title.toUpperCase().includes('CRITICAL'))
  );

  const hasUnacknowledgedHighRisk = alerts.some(a => a.severity === 'HIGH_RISK' && !a.isAcknowledged);
  const totalUnacknowledged = alerts.filter(a => !a.isAcknowledged).length;

  let stressIndex = 68;
  let stressStatusText = 'Moderate Academic Strain detected during midterm exams.';
  let stressColorClass = 'text-amber-400';
  let stressBarClass = 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500';
  let topFactors = [
    { name: 'Exam & Grade Pressure', pct: '55%', color: 'text-sky-300', icon: BookOpen },
    { name: 'Peer & Social Group', pct: '25%', color: 'text-purple-300', icon: User },
    { name: 'Positive Family Support', pct: '20%', color: 'text-emerald-300', icon: Smile }
  ];

  if (hasSuicideAlert) {
    stressIndex = 98;
    stressStatusText = '🚨 CRITICAL CRISIS ALERT: High Suicide & Self-Harm Insinuation Flagged in Live Session!';
    stressColorClass = 'text-rose-500 animate-pulse';
    stressBarClass = 'bg-rose-600 animate-pulse';
    topFactors = [
      { name: 'Suicide & Self-Harm Insinuation', pct: '85%', color: 'text-rose-400 font-bold', icon: ShieldAlert },
      { name: 'Severe Emotional Distress & Fear', pct: '10%', color: 'text-amber-300', icon: Frown },
      { name: 'Academic & School Pressure', pct: '5%', color: 'text-sky-300', icon: BookOpen }
    ];
  } else if (hasUnacknowledgedHighRisk || totalUnacknowledged >= 2) {
    stressIndex = 86;
    stressStatusText = '⚠️ HIGH RISK: Unacknowledged high stress and peer/academic alert flagged.';
    stressColorClass = 'text-rose-400';
    stressBarClass = 'bg-gradient-to-r from-amber-500 to-rose-500';
    topFactors = [
      { name: 'Exam & High Grade Stress', pct: '65%', color: 'text-rose-300', icon: BookOpen },
      { name: 'Peer Group & Anxiety', pct: '25%', color: 'text-purple-300', icon: User },
      { name: 'Family & Environmental Strain', pct: '10%', color: 'text-amber-300', icon: Meh }
    ];
  } else if (totalUnacknowledged === 0) {
    stressIndex = 35;
    stressStatusText = '💚 Stable Emotional Balance. All recent safety logs have been acknowledged and addressed.';
    stressColorClass = 'text-emerald-400';
    stressBarClass = 'bg-gradient-to-r from-emerald-500 to-teal-400';
    topFactors = [
      { name: 'Positive Family Support', pct: '50%', color: 'text-emerald-300', icon: Smile },
      { name: 'Wellness & Mindfulness Breaks', pct: '30%', color: 'text-cyan-300', icon: Award },
      { name: 'Academic Engagement', pct: '20%', color: 'text-sky-300', icon: BookOpen }
    ];
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-md p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold shadow-xl animate-bounce flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-6">
        
        {/* Top Parent Dashboard Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30" />
                  Parent & Guardian Child Monitoring Portal
                </span>
                {unacknowledgedCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold animate-pulse flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    {unacknowledgedCount} Unread Red Flag Alert{unacknowledgedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Monitoring Portal: <span className="text-emerald-700">{childName}</span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Real-time safety alerts, emotional distress indicators, and wellness check-ins powered by SaFie AI Counselor in compliance with DepEd Child Protection Policy.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefreshHistory}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Refresh and re-sync all alerts and history logs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Refresh History</span>
              </button>

              <button
                onClick={() => setShowCounselorModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-purple-700" />
                <span>Contact Guidance Counselor</span>
              </button>

              <button
                onClick={() => setShowVoiceNoteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Mic className="w-4 h-4 text-white" />
                <span>Send Voice Message to Kid</span>
              </button>

              <button
                onClick={() => setShowEncouragementModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Send Love Note to Kid</span>
              </button>

              <button
                onClick={triggerMockAlert}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 border border-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Simulate a live red flag trigger from Maria's AI chat session"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate Red Flag Trigger</span>
              </button>
            </div>
          </div>

          {/* Child Identity & School Info Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Student LRN</div>
              <div className="font-bold text-slate-800">109283748291</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Grade & Section</div>
              <div className="font-bold text-slate-800">Grade 11 - STEM A</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">School</div>
              <div className="font-bold text-slate-800 truncate">Ramon Magsaysay High School</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Assigned Counselor</div>
              <div className="font-bold text-purple-700 truncate">Mrs. Josefina Castro, RGC</div>
            </div>
          </div>
        </div>

        {/* Middle Section: Red Flag Stream & Wellness Index Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 cols): Red Flag & Safety Trigger Feed */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Stream Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900">Kid's Red Flag & Safety Alerts</h2>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterSeverity('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSeverity === 'ALL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Alerts ({alerts.length})
                </button>

                <button
                  onClick={() => setFilterSeverity('UNACKNOWLEDGED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSeverity === 'UNACKNOWLEDGED'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Needs Attention ({unacknowledgedCount})
                </button>

                <button
                  onClick={() => setFilterSeverity('HIGH_RISK')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSeverity === 'HIGH_RISK'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  High Risk
                </button>
              </div>
            </div>

            {/* List of Red Flag Alerts */}
            {filteredAlerts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Red Flag Triggers Found</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  There are no unreviewed safety alerts for {childName} in this filter view.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => {
                  const isHighRisk = alert.severity === 'HIGH_RISK';
                  const isWellness = alert.severity === 'WELLNESS_NOTE';

                  return (
                    <div
                      key={alert.id}
                      className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-sm ${
                        isHighRisk
                          ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400'
                          : isWellness
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      {/* Alert Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isWellness
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {alert.category.replace('_', ' ')}
                          </span>

                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {alert.timestamp}
                          </span>
                        </div>

                        {alert.isAcknowledged ? (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Acknowledged by Parent ({alert.acknowledgedAt})
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Unreviewed Alert
                          </span>
                        )}
                      </div>

                      {/* Title & AI Context */}
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                        {alert.title}
                      </h3>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 my-3 text-xs shadow-sm">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Source: {alert.aiSource}
                        </div>
                        <p className="text-slate-700 italic leading-relaxed">
                          {alert.triggerContext}
                        </p>
                      </div>

                      {/* Parent Action Recommendation */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-4 text-xs">
                        <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Recommended Parent Action:
                        </div>
                        <p className="text-emerald-900 font-medium">
                          {alert.suggestedParentAction}
                        </p>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          {alert.counselorNotified && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                              Guidance Counselor Notified
                            </span>
                          )}
                        </div>

                        {!alert.isAcknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Acknowledge & Confirm Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (1 col): Child Wellness Meter & Counselor Contacts */}
          <div className="space-y-6">
            
            {/* Wellness & Stress Risk Dial */}
            <div className={`p-6 rounded-3xl bg-white border ${hasSuicideAlert ? 'border-rose-400 shadow-lg bg-rose-50/20' : 'border-slate-200'} space-y-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${hasSuicideAlert ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`} />
                  Emotional Well-being Meter
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${hasSuicideAlert ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                  {hasSuicideAlert ? '🚨 CRITICAL CRISIS' : 'This Week'}
                </span>
              </div>

              <div className={`p-4 rounded-2xl bg-slate-50 border ${hasSuicideAlert ? 'border-rose-300 bg-rose-50' : 'border-slate-200'} text-center space-y-2`}>
                <div className={`text-3xl font-extrabold ${stressColorClass}`}>
                  {stressIndex}% <span className="text-xs font-bold text-slate-500">Stress Index</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className={`${stressBarClass} h-full`} style={{ width: `${stressIndex}%` }} />
                </div>
                <div className={`text-[11px] ${hasSuicideAlert ? 'text-rose-700 font-bold animate-pulse' : 'text-amber-800 font-semibold'} pt-1`}>
                  {stressStatusText}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top Emotional Factors</div>
                
                {topFactors.map((factor, idx) => {
                  const IconComp = factor.icon;
                  return (
                    <div key={idx} className={`flex justify-between items-center p-2 rounded-xl ${hasSuicideAlert && idx === 0 ? 'bg-rose-100 border border-rose-300' : 'bg-slate-50'}`}>
                      <span className="text-slate-700 flex items-center gap-1.5 truncate max-w-[200px]">
                        <IconComp className="w-3.5 h-3.5 shrink-0" /> {factor.name}
                      </span>
                      <span className={`font-bold ${factor.color}`}>{factor.pct}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Emergency Contact Desk */}
            <div className="p-6 rounded-3xl bg-white border border-purple-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                School Crisis Desk & Guidance Hotline
              </h3>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1 text-xs">
                <div className="font-bold text-purple-900">Dr. Alejandro V. Ramos</div>
                <div className="text-slate-600 text-[11px]">School Head (Principal) — RMHS</div>
                <a 
                  href="tel:09178882233" 
                  className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-semibold pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-purple-600" /> 0917-888-2233 (Principal Direct Line)
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1 text-xs">
                <div className="font-bold text-purple-900">Mrs. Josefina Castro, RGC</div>
                <div className="text-slate-600 text-[11px]">RMHS Registered Guidance Counselor</div>
                <a 
                  href="tel:09194445566"
                  className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-semibold pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-purple-600" /> 0919-444-5566 (DepEd Guidance Office)
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
                <div className="font-bold text-rose-900">National Crisis Hopeline PH</div>
                <div className="text-slate-600 text-[11px]">24/7 Free Suicide & Distress Hotline</div>
                <a 
                  href="tel:177" 
                  className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-900 font-bold pt-1 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600" /> Dial 177 / (02) 8804-4673
                </a>
              </div>
            </div>

            {/* Privacy Safeguard Notice */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-xs space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Lock className="w-4 h-4 text-emerald-600" />
                Student Confidentiality Protection
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                In accordance with DepEd Order No. 40 s. 2012, personal journal entries remain private to maintain student trust, while automated red flags and safety triggers are shared with parents to ensure immediate child protection.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Request Guidance Counselor Callback */}
      {showCounselorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                Consult Guidance Counselor
              </h3>
              <button 
                onClick={() => setShowCounselorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Recipient:</div>
              <div className="font-bold text-purple-900">Mrs. Josefina Castro, RGC</div>
              <div className="text-slate-600 text-[11px]">RMHS Guidance & Counseling Office</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Notes / Particular Concerns for Counselor:
              </label>
              <textarea
                value={counselorNote}
                onChange={(e) => setCounselorNote(e.target.value)}
                placeholder="e.g., Hi Mrs. Castro, I noticed Maria has been anxious about her STEM exam. I'd like to schedule a quick call..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCounselorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCounselorCallback}
                disabled={!counselorNote.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Send Encouragement Note to Child's Journal */}
      {showEncouragementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
                Send Love Note to {childName}
              </h3>
              <button 
                onClick={() => setShowEncouragementModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-xs">
              This note will be delivered as a warm pop-up message inside {childName}'s SaFie Journal when she opens her next wellness session.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Your Message:
              </label>
              <textarea
                value={encouragementNote}
                onChange={(e) => setEncouragementNote(e.target.value)}
                placeholder="e.g., Hi Maria, Mom is so proud of your hard work! Take a break, drink water, and remember I am always here for you..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEncouragementModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEncouragement}
                disabled={!encouragementNote.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm"
              >
                Deliver Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Send Voice Message to Kid */}
      {showVoiceNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-600 animate-pulse" />
                Send Voice Message to {childName}
              </h3>
              <button 
                onClick={() => {
                  stopVoiceRecording();
                  setShowVoiceNoteModal(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Record a personal, reassuring voice message for your child ({childName}). Your voice note will be delivered to her portal and saved in her SaFie messages.
            </p>

            {/* Voice Recorder Block */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col items-center justify-center space-y-4 text-center">
              {isVoiceRecording ? (
                <div className="space-y-3 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    Recording Voice Note: {String(Math.floor(voiceRecordingSeconds / 60)).padStart(2, '0')}:{String(voiceRecordingSeconds % 60).padStart(2, '0')}
                  </div>

                  {/* Animated Waveform Visualizer */}
                  <div className="flex items-center justify-center gap-1.5 h-10 py-2">
                    {[40, 70, 30, 90, 50, 100, 60, 80, 40, 70, 90, 30].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-rose-500 rounded-full animate-bounce" 
                        style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
                      />
                    ))}
                  </div>

                  <button
                    onClick={stopVoiceRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Stop Recording
                  </button>
                </div>
              ) : recordedVoiceUrl ? (
                <div className="space-y-3 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                    Voice Note Ready ({recordedVoiceDuration}s)
                  </div>

                  <audio src={recordedVoiceUrl} controls className="w-full h-10 rounded-lg" />

                  <button
                    onClick={startVoiceRecording}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-record Voice
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center mx-auto text-rose-600">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">Tap to record your voice</div>
                  <button
                    onClick={startVoiceRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording Voice
                  </button>
                </div>
              )}
            </div>

            {/* Optional Title/Caption */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Voice Message Title / Caption (Optional):
              </label>
              <input
                type="text"
                value={voiceNoteCaption}
                onChange={(e) => setVoiceNoteCaption(e.target.value)}
                placeholder="e.g., Mom's Voice Note: You've got this! ❤️"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  stopVoiceRecording();
                  setShowVoiceNoteModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendVoiceNote}
                disabled={!recordedVoiceUrl || isSendingVoiceNote}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isSendingVoiceNote ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Voice Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
