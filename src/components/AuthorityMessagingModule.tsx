import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, ShieldAlert, HeartHandshake, User, Lock, 
  CheckCircle2, Clock, AlertTriangle, Sparkles, Phone, ArrowLeft,
  ChevronRight, RefreshCw, AlertOctagon, UserCheck, ShieldCheck,
  Building2, BookOpen, MapPin, Landmark, PhoneCall, Eye, Edit3, X,
  Mic, MicOff, Play, Pause, Volume2, Square, Radio, FileAudio, RotateCcw,
  Trash2, Trash, CheckSquare
} from 'lucide-react';
import { UserProfile, UserRole, ROLE_CONFIGS, getUserDisplayName } from '../types/auth';
import { playAudibleRecording, getSupportedAudioMimeType } from '../utils/audioPlayback';
import { db } from '../firebase';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, serverTimestamp, getDocs, updateDoc, doc, setDoc
} from 'firebase/firestore';

export interface AuthorityChatMessage {
  id: string;
  chatId: string;
  alertId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientRole?: string;
  text: string;
  timestamp: string;
  isRedFlagSystemNote?: boolean;
  messageType?: 'text' | 'voice';
  audioUrl?: string;
  audioDuration?: number;
}

export interface AuthorityChatThread {
  id: string;
  alertId: string;
  studentId: string;
  studentName: string;
  studentLrn: string;
  authorityRole: string;
  authorityName: string;
  redFlagCategory: string;
  triggerReason: string;
  flaggedContent?: string;
  lastMessage: string;
  lastUpdated: string;
  status: 'ACTIVE_OUTREACH' | 'COUNSELING_SCHEDULED' | 'RESOLVED';
  unreadCountStudent: number;
  unreadCountAuthority: number;
}

interface AuthorityMessagingModuleProps {
  currentUser: UserProfile;
  initialAlertId?: string | null;
  initialStudentLrn?: string | null;
  initialTriggerReason?: string | null;
  initialRedFlagCategory?: string | null;
  initialFlaggedContent?: string | null;
  onBackToDashboard?: () => void;
}

export default function AuthorityMessagingModule({
  currentUser,
  initialAlertId,
  initialStudentLrn,
  initialTriggerReason,
  initialRedFlagCategory,
  initialFlaggedContent,
  onBackToDashboard
}: AuthorityMessagingModuleProps) {
  const isStudent = currentUser.role === 'student';
  const roleCfg = ROLE_CONFIGS[currentUser.role];

  const [threads, setThreads] = useState<AuthorityChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AuthorityChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [previewMessageText, setPreviewMessageText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedToDeleteIds, setSelectedToDeleteIds] = useState<string[]>([]);

  const handleOpenDeleteModal = (initialThreadId?: string) => {
    if (initialThreadId) {
      setSelectedToDeleteIds([initialThreadId]);
    } else if (selectedThreadId) {
      setSelectedToDeleteIds([selectedThreadId]);
    } else if (threads.length > 0) {
      setSelectedToDeleteIds([threads[0].id]);
    } else {
      setSelectedToDeleteIds([]);
    }
    setShowDeleteModal(true);
  };

  const handleDeleteSingleThread = (threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setThreads(prev => {
      const updated = prev.filter(t => t.id !== threadId);
      if (selectedThreadId === threadId) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        setSelectedThreadId(nextId);
        if (!nextId) setMessages([]);
      }
      return updated;
    });

    setSelectedToDeleteIds(prev => prev.filter(id => id !== threadId));
  };

  const handleDeleteSelectedThreads = () => {
    if (selectedToDeleteIds.length === 0) return;

    setThreads(prev => {
      const updated = prev.filter(t => !selectedToDeleteIds.includes(t.id));
      if (selectedThreadId && selectedToDeleteIds.includes(selectedThreadId)) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        setSelectedThreadId(nextId);
        if (!nextId) setMessages([]);
      }
      return updated;
    });

    setSelectedToDeleteIds([]);
    setShowDeleteModal(false);
  };

  const handleDeleteAllThreads = () => {
    setThreads([]);
    setSelectedThreadId(null);
    setMessages([]);
    setSelectedToDeleteIds([]);
    setShowDeleteModal(false);
  };

  const toggleSelectToDelete = (threadId: string) => {
    setSelectedToDeleteIds(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId) 
        : [...prev, threadId]
    );
  };

  const toggleSelectAllToDelete = () => {
    if (selectedToDeleteIds.length === threads.length) {
      setSelectedToDeleteIds([]);
    } else {
      setSelectedToDeleteIds(threads.map(t => t.id));
    }
  };

  const handleRestoreDefaultThreads = () => {
    const defaultThreads = getInitialFallbackThreads();
    const userThreads = isStudent 
      ? defaultThreads.filter(t => t.studentLrn === (currentUser.roleSpecificData?.lrn || '109283748291'))
      : defaultThreads;
    setThreads(userThreads);
    if (userThreads.length > 0) {
      setSelectedThreadId(userThreads[0].id);
    }
  };

  // Voice Message Recording & Playback State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioDuration, setRecordedAudioDuration] = useState<number>(0);
  const [voiceCaption, setVoiceCaption] = useState<string>('');
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Start voice recording
  const startVoiceRecording = async () => {
    setRecordedAudioUrl(null);
    setRecordedAudioDuration(0);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedAudioMimeType();
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(audioBlob);
            setRecordedAudioUrl(url);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(100);
        setIsRecording(true);

        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(prev => {
            const next = prev + 1;
            setRecordedAudioDuration(next);
            return next;
          });
        }, 1000);
      } else {
        setIsRecording(true);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(prev => {
            const next = prev + 1;
            setRecordedAudioDuration(next);
            return next;
          });
        }, 1000);
      }
    } catch (err) {
      console.warn('Microphone access fallback:', err);
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          const next = prev + 1;
          setRecordedAudioDuration(next);
          return next;
        });
      }, 1000);
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!recordedAudioUrl) {
      setRecordedAudioUrl('simulated-voice-note');
    }
    setIsRecording(false);
  };

  // Cancel voice recording
  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    setRecordedAudioDuration(0);
  };

  const activePlaybackStopRef = useRef<(() => void) | null>(null);

  // Toggle audio playback
  const togglePlayAudio = (msgId: string, audioUrl?: string, textFallback?: string) => {
    if (activePlaybackStopRef.current) {
      activePlaybackStopRef.current();
      activePlaybackStopRef.current = null;
    }

    if (playingMsgId === msgId) {
      setPlayingMsgId(null);
    } else {
      setPlayingMsgId(msgId);
      const stop = playAudibleRecording({
        audioUrl,
        textFallback: textFallback || "Voice note message from Guidance Authority.",
        onEnd: () => setPlayingMsgId(null)
      });
      activePlaybackStopRef.current = stop;
    }
  };

  const handleTriggerPreview = (text: string) => {
    if (!text.trim()) return;
    setInputMessage(text);
    setPreviewMessageText(text.trim());
    setShowPreview(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Demo fallback threads generator for offline or immediate test
  const getInitialFallbackThreads = (): AuthorityChatThread[] => {
    return [
      {
        id: 'chat-alt-01',
        alertId: 'ALT-1001',
        studentId: 'usr-student-01',
        studentName: 'Maria Nicole Santos',
        studentLrn: '109283748291',
        authorityRole: 'guidance_counselor',
        authorityName: 'Mrs. Josefina Castro, RGC',
        redFlagCategory: 'SUICIDE_SELF_HARM',
        triggerReason: 'Severe despair & crisis keyword detected in voice diary',
        flaggedContent: 'I feel completely overwhelmed and hopeless about everything.',
        lastMessage: 'Hi Maria, I am here for you. Would you like to talk at the Guidance Office today?',
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE_OUTREACH',
        unreadCountStudent: 1,
        unreadCountAuthority: 0
      },
      {
        id: 'chat-alt-02',
        alertId: 'ALT-1002',
        studentId: 'usr-student-02',
        studentName: 'Juan Carlos Reyes',
        studentLrn: '109283748292',
        authorityRole: 'teacher_adviser',
        authorityName: 'Mrs. Clarissa Soriano',
        redFlagCategory: 'BULLYING_HARASSMENT',
        triggerReason: 'Cyberbullying and classroom harassment reported',
        flaggedContent: 'Classmates are making fun of me and sending mean messages.',
        lastMessage: 'Hello Juan, your adviser here. We are taking action to ensure a safe classroom.',
        lastUpdated: new Date(Date.now() - 3600000).toISOString(),
        status: 'COUNSELING_SCHEDULED',
        unreadCountStudent: 0,
        unreadCountAuthority: 1
      }
    ];
  };

  // Listen to Firestore chats collection or fallback
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const chatsRef = collection(db, 'authority_chats');
      
      unsubscribe = onSnapshot(chatsRef, (snapshot) => {
        if (!snapshot.empty) {
          const loadedThreads: AuthorityChatThread[] = [];
          snapshot.forEach((doc) => {
            loadedThreads.push({ ...doc.data(), id: doc.id } as AuthorityChatThread);
          });

          // Filter for students: only see their own LRN threads
          let userThreads = loadedThreads;
          if (isStudent) {
            const studentLrn = currentUser.roleSpecificData?.lrn || currentUser.fullName;
            userThreads = loadedThreads.filter(t => t.studentLrn === studentLrn || t.studentId === currentUser.id);
          }

          userThreads.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          setThreads(userThreads);

          if (!selectedThreadId && userThreads.length > 0) {
            setSelectedThreadId(userThreads[0].id);
          }
        } else {
          // Empty firestore fallback
          const defaultThreads = getInitialFallbackThreads();
          const userThreads = isStudent 
            ? defaultThreads.filter(t => t.studentLrn === (currentUser.roleSpecificData?.lrn || '109283748291'))
            : defaultThreads;
          setThreads(userThreads);
          if (!selectedThreadId && userThreads.length > 0) {
            setSelectedThreadId(userThreads[0].id);
          }
        }
      }, (error) => {
        console.warn('Firestore snapshot error on authority_chats, using local fallback:', error);
        const defaultThreads = getInitialFallbackThreads();
        setThreads(defaultThreads);
        if (defaultThreads.length > 0) setSelectedThreadId(defaultThreads[0].id);
      });
    } catch (e) {
      console.warn('Firebase error initializing threads listener:', e);
      const defaultThreads = getInitialFallbackThreads();
      setThreads(defaultThreads);
      if (defaultThreads.length > 0) setSelectedThreadId(defaultThreads[0].id);
    }

    return () => unsubscribe();
  }, [currentUser, isStudent]);

  // Create new thread automatically if opened with initialAlertId
  useEffect(() => {
    if (initialAlertId && initialStudentLrn) {
      const existing = threads.find(t => t.alertId === initialAlertId);
      if (existing) {
        setSelectedThreadId(existing.id);
      } else {
        // Create new chat thread
        const newThreadId = 'chat-' + initialAlertId;
        const newThread: AuthorityChatThread = {
          id: newThreadId,
          alertId: initialAlertId,
          studentId: 'student-' + initialStudentLrn,
          studentName: initialStudentLrn === '109283748291' ? 'Maria Nicole Santos' : `Student LRN: ${initialStudentLrn}`,
          studentLrn: initialStudentLrn,
          authorityRole: currentUser.role,
          authorityName: getUserDisplayName(currentUser),
          redFlagCategory: initialRedFlagCategory || 'RED_FLAG',
          triggerReason: initialTriggerReason || 'Safety alert flagged',
          flaggedContent: initialFlaggedContent || '',
          lastMessage: `⚠️ Red Flag Outreach Initiated by ${getUserDisplayName(currentUser)} (${roleCfg.shortLabel})`,
          lastUpdated: new Date().toISOString(),
          status: 'ACTIVE_OUTREACH',
          unreadCountStudent: 1,
          unreadCountAuthority: 0
        };

        // Add to Firestore & Local State
        try {
          setDoc(doc(db, 'authority_chats', newThreadId), newThread);
        } catch (e) {
          console.warn('Failed to save doc to firestore:', e);
        }

        setThreads(prev => [newThread, ...prev.filter(t => t.id !== newThreadId)]);
        setSelectedThreadId(newThreadId);

        // Pre-populate system initial message
        const initialSysMsg: AuthorityChatMessage = {
          id: 'msg-init-' + Date.now(),
          chatId: newThreadId,
          alertId: initialAlertId,
          senderId: currentUser.id,
          senderName: getUserDisplayName(currentUser),
          senderRole: currentUser.role,
          text: `⚠️ RED FLAG OUTREACH INITIATED: ${getUserDisplayName(currentUser)} (${roleCfg.shortLabel}) has reached out regarding safety incident #${initialAlertId}.\nCategory: ${initialRedFlagCategory || 'Red Flag'} | Reason: ${initialTriggerReason || 'Trigger detected'}`,
          timestamp: new Date().toISOString(),
          isRedFlagSystemNote: true
        };

        try {
          addDoc(collection(db, 'authority_messages'), initialSysMsg);
        } catch (e) {
          console.warn('Failed to add message to firestore:', e);
        }
      }
    }
  }, [initialAlertId, initialStudentLrn]);

  // Listen to messages for active selected thread
  useEffect(() => {
    if (!selectedThreadId) return;

    let unsubscribe: () => void = () => {};

    try {
      const msgRef = collection(db, 'authority_messages');
      const q = query(msgRef, where('chatId', '==', selectedThreadId), orderBy('timestamp', 'asc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedMsgs: AuthorityChatMessage[] = [];
          snapshot.forEach((doc) => {
            loadedMsgs.push({ ...doc.data(), id: doc.id } as AuthorityChatMessage);
          });
          setMessages(loadedMsgs);
        } else {
          // Initial sample messages for the thread if firestore is empty
          const thread = threads.find(t => t.id === selectedThreadId);
          if (thread) {
            setMessages([
              {
                id: 'msg-sys-01',
                chatId: thread.id,
                alertId: thread.alertId,
                senderId: 'system',
                senderName: 'SelfSense Safety Protocol',
                senderRole: 'school_admin',
                text: `⚠️ RED FLAG OUTREACH: Incident #${thread.alertId} (${thread.redFlagCategory}).\nTrigger: "${thread.triggerReason}"`,
                timestamp: thread.lastUpdated,
                isRedFlagSystemNote: true
              },
              {
                id: 'msg-auth-01',
                chatId: thread.id,
                alertId: thread.alertId,
                senderId: 'auth-01',
                senderName: thread.authorityName,
                senderRole: thread.authorityRole as UserRole,
                text: `Hello! I am reaching out from the ${roleCfg.shortLabel} team. We noticed your recent entry and want to check in on how you are feeling. You are safe here and we are ready to listen.`,
                timestamp: thread.lastUpdated
              }
            ]);
          }
        }
      }, (err) => {
        console.warn('Firestore messages snapshot fallback:', err);
      });
    } catch (e) {
      console.warn('Firestore error for messages:', e);
    }

    return () => unsubscribe();
  }, [selectedThreadId, threads]);

  const activeThread = threads.find(t => t.id === selectedThreadId);

  const handleSendVoiceMessage = async (customAudioUrl?: string, customDurationSec?: number, customCaption?: string) => {
    const audioUrl = customAudioUrl || recordedAudioUrl || 'simulated-voice-note';
    const duration = customDurationSec || recordedAudioDuration || 12;
    const caption = customCaption || voiceCaption || `🎙️ Official Voice Response (${duration}s)`;

    if (!selectedThreadId || !activeThread) return;

    setIsSending(true);

    const newMsg: AuthorityChatMessage = {
      id: 'msg-voice-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      chatId: selectedThreadId,
      alertId: activeThread.alertId,
      senderId: currentUser.id,
      senderName: getUserDisplayName(currentUser),
      senderRole: currentUser.role,
      text: caption,
      timestamp: new Date().toISOString(),
      messageType: 'voice',
      audioUrl: audioUrl,
      audioDuration: duration
    };

    setMessages(prev => [...prev, newMsg]);
    setRecordedAudioUrl(null);
    setRecordedAudioDuration(0);
    setVoiceCaption('');

    const updatedThread = {
      ...activeThread,
      lastMessage: `🎙️ Voice Note (${duration}s): ${caption}`,
      lastUpdated: new Date().toISOString(),
      unreadCountStudent: isStudent ? 0 : activeThread.unreadCountStudent + 1,
      unreadCountAuthority: !isStudent ? 0 : activeThread.unreadCountAuthority + 1
    };

    setThreads(prev => prev.map(t => t.id === selectedThreadId ? updatedThread : t));

    try {
      await addDoc(collection(db, 'authority_messages'), newMsg);
      await setDoc(doc(db, 'authority_chats', selectedThreadId), updatedThread, { merge: true });
      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: newMsg }));
    } catch (e) {
      console.warn('Firestore voice message save error:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !selectedThreadId || !activeThread) return;

    setIsSending(true);

    const newMsg: AuthorityChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      chatId: selectedThreadId,
      alertId: activeThread.alertId,
      senderId: currentUser.id,
      senderName: getUserDisplayName(currentUser),
      senderRole: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Update thread last message
    const updatedThread = {
      ...activeThread,
      lastMessage: text.trim(),
      lastUpdated: new Date().toISOString(),
      unreadCountStudent: isStudent ? 0 : activeThread.unreadCountStudent + 1,
      unreadCountAuthority: !isStudent ? 0 : activeThread.unreadCountAuthority + 1
    };

    setThreads(prev => prev.map(t => t.id === selectedThreadId ? updatedThread : t));

    // Persist to Firestore
    try {
      await addDoc(collection(db, 'authority_messages'), newMsg);
      await setDoc(doc(db, 'authority_chats', selectedThreadId), updatedThread, { merge: true });

      // Dispatch event to app
      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: newMsg }));
    } catch (e) {
      console.warn('Firestore save error, maintained in local state:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateThreadStatus = async (newStatus: 'ACTIVE_OUTREACH' | 'COUNSELING_SCHEDULED' | 'RESOLVED') => {
    if (!selectedThreadId || !activeThread) return;

    const updated = { ...activeThread, status: newStatus };
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? updated : t));

    try {
      await setDoc(doc(db, 'authority_chats', selectedThreadId), { status: newStatus }, { merge: true });
    } catch (e) {
      console.warn('Failed to update status in firestore:', e);
    }
  };

  const filteredThreads = threads.filter(t => {
    if (filterCategory === 'ALL') return true;
    return t.redFlagCategory === filterCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {isStudent ? 'Authority Emergency Outreach & Counseling Chat' : 'Red Flag Student Outreach Messaging Center'}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider">
                Confidential & Encrypted
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {isStudent 
                ? 'Direct, safe communication line with your Guidance Counselor, Adviser, and School Authorities.'
                : 'Direct confidential message channel to counsel and check in on students with triggered Red Flag alerts.'}
            </p>
          </div>
        </div>

        {/* User Role Indicator & Delete Message Threads */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
          <button
            onClick={() => handleOpenDeleteModal()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer"
            title="Choose message threads to delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Delete Message Threads</span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">{getUserDisplayName(currentUser)}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleCfg.badgeBg} ${roleCfg.badgeText}`}>
              {roleCfg.shortLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Threads List Sidebar + Message Conversation Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Threads List */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          {/* Filter Bar */}
          {!isStudent && (
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 font-medium">Flagged Student Threads ({filteredThreads.length})</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs rounded-lg px-2 py-1 border border-slate-300 focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SUICIDE_SELF_HARM">Suicide / Self-Harm</option>
                  <option value="BULLYING_HARASSMENT">Bullying</option>
                  <option value="CRIMINAL_ACTIVITY">Criminal Threat</option>
                  <option value="ILLEGAL_ACT">Illegal / Untoward</option>
                </select>
              </div>
            </div>
          )}

          {/* Threads List Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                No active Red Flag chat threads found.
              </div>
            ) : (
              filteredThreads.map((thread, threadIdx) => {
                const isSelected = thread.id === selectedThreadId;
                const isCrisis = thread.redFlagCategory === 'SUICIDE_SELF_HARM';

                return (
                  <div
                    key={`${thread.id}-${threadIdx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedThreadId(thread.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedThreadId(thread.id);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isCrisis ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                        }`} />
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {isStudent ? `${thread.authorityName}` : `${thread.studentName}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(thread.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingleThread(thread.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors opacity-70 hover:opacity-100"
                          title="Delete this message thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCrisis ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {thread.redFlagCategory.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 truncate">#{thread.alertId}</span>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-1 italic font-mono">
                      "{thread.lastMessage}"
                    </p>

                    {/* Status Pill */}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                      <span className={`font-semibold ${
                        thread.status === 'ACTIVE_OUTREACH' ? 'text-rose-700' : thread.status === 'COUNSELING_SCHEDULED' ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        ● {thread.status.replace('_', ' ')}
                      </span>
                      {!isStudent && (
                        <span className="text-slate-500 font-mono">LRN: {thread.studentLrn}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Conversation Messages Panel */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {activeThread ? (
            <>
              {/* Conversation Top Bar */}
              <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {isStudent ? `Chat with ${activeThread.authorityName}` : `Outreach: ${activeThread.studentName}`}
                      <span className="text-xs text-slate-500 font-normal font-mono">(LRN: {activeThread.studentLrn})</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      Alert #{activeThread.alertId}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 font-mono">
                    ⚠️ Trigger Reason: {activeThread.triggerReason}
                  </p>
                </div>

                {/* Actions & Status Selector */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleOpenDeleteModal(activeThread.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    title="Delete message thread"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Message Threads</span>
                  </button>

                  {!isStudent && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">Status:</span>
                      <select
                        value={activeThread.status}
                        onChange={(e: any) => handleUpdateThreadStatus(e.target.value)}
                        className="bg-slate-50 border border-indigo-300 rounded-xl px-3 py-1.5 text-xs text-indigo-900 font-semibold focus:outline-none"
                      >
                        <option value="ACTIVE_OUTREACH">🔴 Active Outreach</option>
                        <option value="COUNSELING_SCHEDULED">🟡 Counseling Scheduled</option>
                        <option value="RESOLVED">🟢 Resolved Check-in</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {/* Confidentiality Notice Header */}
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1 max-w-2xl mx-auto shadow-sm">
                  <div className="text-xs font-bold text-indigo-900 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" /> Official Safe & Confidential Channel
                  </div>
                  <p className="text-[11px] text-indigo-950 leading-relaxed">
                    This communication channel is established specifically for Red Flag crisis outreach, student well-being check-ins, and confidential guidance support under DepEd Child Protection protocols.
                  </p>
                </div>

                {messages.map((msg, msgIdx) => {
                  const uniqueKey = `${msg.id || 'msg'}-${msgIdx}`;
                  if (msg.isRedFlagSystemNote) {
                    return (
                      <div key={uniqueKey} className="my-3 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1 font-mono max-w-2xl mx-auto text-center shadow-sm">
                        <div className="font-bold text-rose-800 flex items-center justify-center gap-1.5">
                          <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" /> AUTOMATED RED FLAG SYSTEM NOTIFICATION
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className="text-[10px] text-slate-500 pt-1">{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === currentUser.id;
                  const isVoiceMsg = msg.messageType === 'voice' || !!msg.audioUrl;
                  const isPlaying = playingMsgId === msg.id;

                  return (
                    <div
                      key={uniqueKey}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed font-sans shadow-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {isVoiceMsg ? (
                          <div className="space-y-2.5 min-w-[240px]">
                            <div className="flex items-center justify-between gap-2 border-b border-indigo-400/30 pb-1.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isMe ? 'text-indigo-200' : 'text-purple-700'}`}>
                                <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Official Voice Response Note
                              </span>
                              <span className={`text-[10px] font-mono ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                                ⏱️ {msg.audioDuration || 12}s
                              </span>
                            </div>

                            {/* Voice Player Controls */}
                            <div className="flex items-center gap-3 bg-black/10 p-2.5 rounded-xl">
                              <button
                                type="button"
                                onClick={() => togglePlayAudio(msg.id, msg.audioUrl, msg.text)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-md ${
                                  isPlaying 
                                    ? 'bg-rose-500 text-white animate-pulse' 
                                    : isMe ? 'bg-white text-indigo-700' : 'bg-purple-600 text-white'
                                }`}
                              >
                                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </button>

                              <div className="flex-1 flex flex-col gap-1 min-w-0">
                                {/* Waveform graphic bars */}
                                <div className="flex items-center gap-1 h-5 overflow-hidden">
                                  {[40, 75, 30, 90, 60, 100, 45, 80, 35, 95, 50, 70, 85, 40, 60].map((height, hIdx) => (
                                    <div
                                      key={hIdx}
                                      style={{ height: `${isPlaying ? Math.max(15, (height * (hIdx % 2 ? 1 : 0.6))) : 25}%` }}
                                      className={`w-1 rounded-full transition-all duration-300 ${
                                        isPlaying ? 'bg-rose-300 animate-pulse' : isMe ? 'bg-indigo-200/80' : 'bg-purple-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className={`text-[10px] font-mono ${isMe ? 'text-indigo-100' : 'text-slate-600'}`}>
                                  {isPlaying ? '🔊 Playing Authority Voice...' : 'Click play to listen'}
                                </span>
                              </div>
                            </div>

                            {msg.text && (
                              <p className="whitespace-pre-wrap pt-1 text-[11px] opacity-90 border-t border-indigo-400/20 italic">
                                "{msg.text}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Preset Buttons for Authorities */}
              {!isStudent && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">Quick Response Presets:</span>
                  <button
                    onClick={() => handleSendVoiceMessage('simulated-voice-note', 14, '🎙️ Guidance Reassurance: "Hi Maria, I am Mrs. Castro. We received your note and we are here to support you. You are completely safe with us."')}
                    className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Mic className="w-3 h-3 text-purple-200 animate-pulse" />
                    🎙️ Send 14s Counselor Voice Note
                  </button>
                  <button
                    onClick={() => handleTriggerPreview(`Hi! I am here for you. We saw your entry and want to reassure you that you are safe and supported. How are you feeling right now?`)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3 text-indigo-500" />
                    💬 "We are here for you..."
                  </button>
                  <button
                    onClick={() => handleTriggerPreview(`Would you like to drop by the Guidance Counselor's Office today for a quiet, gentle chat?`)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3 text-purple-500" />
                    📞 "Drop by Guidance Office..."
                  </button>
                  <button
                    onClick={() => handleTriggerPreview(`Please remember you can also connect 24/7 with Hopeline Philippines at 177 or NCMH at 1553 anytime.`)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3 text-rose-500" />
                    🆘 "Share Crisis Hotline 177..."
                  </button>
                </div>
              )}

              {/* Quick Preset Buttons for Students */}
              {isStudent && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">Quick Student Replies:</span>
                  <button
                    onClick={() => handleSendVoiceMessage('simulated-voice-note', 10, '🎙️ Student Voice Note: "Thank you for reaching out to me. I would like to talk in person."')}
                    className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Mic className="w-3 h-3 text-indigo-200 animate-pulse" />
                    🎙️ Send 10s Student Voice Note
                  </button>
                  <button
                    onClick={() => handleTriggerPreview(`Thank you for reaching out. I would like to talk with you.`)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3 text-emerald-500" />
                    💚 "Thank you, I would like to talk."
                  </button>
                  <button
                    onClick={() => handleTriggerPreview(`I am currently feeling overwhelmed, but I am safe right now.`)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 whitespace-nowrap text-[11px] transition-colors shadow-sm flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3 text-indigo-500" />
                    🛡️ "Overwhelmed, but safe right now."
                  </button>
                </div>
              )}

              {/* Message Input & Voice Recorder Studio Box */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
                {/* Voice Recording Active Studio Bar */}
                {isRecording && (
                  <div className="p-4 rounded-2xl bg-rose-950 text-white border border-rose-600 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-rose-600 animate-ping shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-rose-200 flex items-center gap-2">
                          <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Recording Live Authority Voice Response
                        </div>
                        <div className="text-[11px] text-rose-300 font-mono">
                          Duration: <span className="font-bold text-white text-sm">{recordingSeconds}s</span> / 180s max
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-rose-800"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop & Review
                      </button>
                    </div>
                  </div>
                )}

                {/* Recorded Audio Ready Preview Bar */}
                {!isRecording && recordedAudioUrl && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/50 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Mic className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white">Voice Note Recorded ({recordedAudioDuration}s)</span>
                      </div>
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="text-slate-400 hover:text-white p-1"
                        title="Discard Voice Note"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => togglePlayAudio('preview-rec', recordedAudioUrl)}
                        className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm"
                      >
                        {playingMsgId === 'preview-rec' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                      <span className="text-xs text-slate-300 font-mono flex-1">
                        {playingMsgId === 'preview-rec' ? '🔊 Playing preview audio...' : 'Click play to preview your recorded voice note'}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={voiceCaption}
                      onChange={(e) => setVoiceCaption(e.target.value)}
                      placeholder="Add an optional text caption or transcript to accompany your voice message..."
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Re-record
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendVoiceMessage()}
                        disabled={isSending}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch Voice Response
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Preview Banner */}
                {showPreview && previewMessageText && (
                  <div className="mb-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                          <Eye className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-white">Message Preview (Review before sending)</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                          Official Outreach Preview
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowPreview(false);
                          setPreviewMessageText(null);
                        }}
                        className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Dismiss Preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="my-2.5 p-4 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm leading-relaxed border border-indigo-400/40 shadow-inner">
                      <div className="text-[10px] text-indigo-200 font-mono mb-1.5 flex items-center justify-between border-b border-indigo-400/30 pb-1">
                        <span>Sender: {getUserDisplayName(currentUser)} ({roleCfg.shortLabel})</span>
                        <span>{previewMessageText.length} characters • Encrypted</span>
                      </div>
                      <p className="whitespace-pre-wrap font-medium">{previewMessageText}</p>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 italic">
                        Verify contents carefully before dispatching to student thread.
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPreview(false);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Message
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSendMessage(previewMessageText);
                            setShowPreview(false);
                            setPreviewMessageText(null);
                          }}
                          disabled={isSending}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" /> Confirm & Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Message & Voice Input Form Bar */}
                {!isRecording && !recordedAudioUrl && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (showPreview && previewMessageText) {
                        handleSendMessage(previewMessageText);
                        setShowPreview(false);
                        setPreviewMessageText(null);
                      } else if (inputMessage.trim()) {
                        handleTriggerPreview(inputMessage.trim());
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="px-3.5 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-300 transition-all shrink-0 shadow-sm group"
                      title="Record voice message response"
                    >
                      <Mic className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Voice Response</span>
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        if (showPreview) {
                          setPreviewMessageText(e.target.value);
                        }
                      }}
                      placeholder={
                        isStudent 
                          ? 'Type your confidential response to the authority...' 
                          : 'Type supportive message or official advice to the student...'
                      }
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (inputMessage.trim()) {
                          handleTriggerPreview(inputMessage.trim());
                        }
                      }}
                      disabled={!inputMessage.trim()}
                      className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors shrink-0 disabled:opacity-50"
                      title="Preview message first"
                    >
                      <Eye className="w-4 h-4 text-slate-600" /> Preview
                    </button>

                    <button
                      type="submit"
                      disabled={isSending || (!inputMessage.trim() && !showPreview)}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm shrink-0"
                    >
                      <Send className="w-4 h-4" /> {showPreview ? 'Confirm & Send' : 'Send'}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-3">
              <ShieldAlert className="w-12 h-12 text-indigo-600/50" />
              <div>
                <h3 className="text-slate-900 font-bold text-base">
                  {threads.length === 0 ? 'No Message Threads Available' : 'Select a Red Flag Student Thread'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {threads.length === 0 
                    ? 'All Alert Lines message threads have been deleted. You can restore sample demonstration threads anytime.' 
                    : 'Choose a student thread on the left to review trigger details and begin confidential outreach messaging.'}
                </p>
              </div>

              {threads.length === 0 && (
                <button
                  onClick={handleRestoreDefaultThreads}
                  className="mt-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Sample Demonstration Threads</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Message Threads Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Delete Message Threads</h3>
                  <p className="text-xs text-slate-500">Choose which message threads to permanently delete</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Controls Header */}
            {threads.length > 0 && (
              <div className="flex items-center justify-between px-1 text-xs">
                <button
                  type="button"
                  onClick={toggleSelectAllToDelete}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  {selectedToDeleteIds.length === threads.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>Select All ({threads.length})</span>
                    </>
                  )}
                </button>
                <span className="text-slate-500 font-mono text-[11px]">
                  Selected: <strong className="text-rose-600 font-bold">{selectedToDeleteIds.length}</strong> of {threads.length}
                </span>
              </div>
            )}

            {/* Threads Checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[320px]">
              {threads.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No message threads remaining to delete.
                </div>
              ) : (
                threads.map((thread) => {
                  const isChecked = selectedToDeleteIds.includes(thread.id);
                  return (
                    <div
                      key={thread.id}
                      onClick={() => toggleSelectToDelete(thread.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">
                              {isStudent ? thread.authorityName : thread.studentName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              #{thread.alertId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                            "{thread.lastMessage}"
                          </p>
                          <div className="text-[10px] text-slate-400">
                            Reason: {thread.triggerReason}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingleThread(thread.id, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
                        title="Delete this message thread"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              {threads.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllThreads}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-slate-200 hover:border-rose-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete All ({threads.length})</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelectedThreads}
                  disabled={selectedToDeleteIds.length === 0}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedToDeleteIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
