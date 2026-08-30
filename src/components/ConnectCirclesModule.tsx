import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Heart, Sparkles, ShieldCheck, CheckCircle2, 
  Send, UserPlus, Info, Lock, ArrowLeft, Volume2, PlusCircle, AlertCircle,
  Eye, Edit3, X
} from 'lucide-react';
import { UserProfile } from '../types/auth';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';

export interface AdvocatePeer {
  id: string;
  name: string;
  gradeSection: string;
  specialty: string;
  badge: string;
  avatarBg: string;
  status: 'Online Now' | 'In Circle Room' | 'Available for Chat';
  bio: string;
  rating: string;
  sessionsCompleted: number;
}

export interface CircleRoom {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  activeMembers: number;
  advocateHost: string;
  bgGradient: string;
}

export interface CircleMessage {
  id: string;
  senderName: string;
  senderRole: 'student' | 'advocate';
  text: string;
  timestamp: string;
  avatarBg: string;
}

const ADVOCATE_PEERS: AdvocatePeer[] = [
  {
    id: 'adv-1',
    name: 'Aria Chen',
    gradeSection: 'Grade 11 - STEM A',
    specialty: 'Exam Stress & Math Anxiety',
    badge: 'Certified Peer Advocate',
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-pink-500',
    status: 'Online Now',
    bio: 'Hi! I am a Grade 11 STEM student who loves helping peers navigate study pressure and exam worries with zero judgment.',
    rating: '4.9 ★',
    sessionsCompleted: 42
  },
  {
    id: 'adv-2',
    name: 'Marco Santos',
    gradeSection: 'Grade 12 - HUMSS B',
    specialty: 'Peer Relationships & Social Confidence',
    badge: 'Senior Peer Mentor',
    avatarBg: 'bg-gradient-to-tr from-blue-500 to-teal-500',
    status: 'Available for Chat',
    bio: 'Grade 12 HUMSS student passionate about mental health awareness. Always here to listen whenever you need a safe space.',
    rating: '5.0 ★',
    sessionsCompleted: 68
  },
  {
    id: 'adv-3',
    name: 'Sophia Reyes',
    gradeSection: 'Grade 10 - Wisdom',
    specialty: 'Mindfulness & Gentle Listening',
    badge: 'Listening Ear Specialist',
    avatarBg: 'bg-gradient-to-tr from-pink-500 to-rose-500',
    status: 'In Circle Room',
    bio: 'I specialize in box breathing guidance and quiet active listening for students who feel overwhelmed.',
    rating: '4.9 ★',
    sessionsCompleted: 35
  },
  {
    id: 'adv-4',
    name: 'Liam Cruz',
    gradeSection: 'Grade 11 - ABM C',
    specialty: 'Bullying Support & Self-Esteem',
    badge: 'SafeSpace Peer Guardian',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-500',
    status: 'Online Now',
    bio: 'Advocating for kind school culture. Let us talk about self-confidence, setting boundaries, and positive friendships.',
    rating: '4.8 ★',
    sessionsCompleted: 29
  }
];

const CIRCLE_ROOMS: CircleRoom[] = [
  {
    id: 'room-1',
    title: 'Study Lounge & Group Learning',
    description: 'A friendly circle for sharing effective study tips, homework strategies, and learning encouragement.',
    category: 'Academic Care',
    icon: '🎓',
    activeMembers: 14,
    advocateHost: 'Aria Chen (Peer Advocate)',
    bgGradient: 'from-purple-600/10 via-pink-600/5 to-indigo-600/10'
  },
  {
    id: 'room-2',
    title: 'Daily Student Life & Friendly Chat',
    description: 'A warm, welcoming space to share daily school highlights, campus news, and positive thoughts.',
    category: 'Daily Reflections',
    icon: '🌸',
    activeMembers: 19,
    advocateHost: 'Marco Santos (Senior Advocate)',
    bgGradient: 'from-pink-600/10 via-rose-600/5 to-amber-600/10'
  },
  {
    id: 'room-3',
    title: 'Mindful Routines & Wellness Habits',
    description: 'Explore daily routines, healthy study habits, and relaxing de-stress techniques together.',
    category: 'Mindfulness',
    icon: '🌿',
    activeMembers: 9,
    advocateHost: 'Sophia Reyes (Peer Listener)',
    bgGradient: 'from-teal-600/10 via-emerald-600/5 to-cyan-600/10'
  },
  {
    id: 'room-4',
    title: 'Creative Arts, Music & Hobbies',
    description: 'Share your drawings, favorite soothing playlists, creative projects, and personal hobbies.',
    category: 'Creative Support',
    icon: '🎨',
    activeMembers: 11,
    advocateHost: 'Liam Cruz (Peer Guardian)',
    bgGradient: 'from-amber-600/10 via-orange-600/5 to-yellow-600/10'
  }
];

const INITIAL_MESSAGES: Record<string, CircleMessage[]> = {
  'room-1': [
    { id: 'm-1', senderName: 'Aria Chen (Advocate)', senderRole: 'advocate', text: 'Welcome to the Exam Support Circle! Remember to take breaks and stay hydrated today.', timestamp: '10:05 AM', avatarBg: 'bg-purple-600' },
    { id: 'm-2', senderName: 'Student Friend', senderRole: 'student', text: 'I have a big algebra exam tomorrow and my heart is beating fast!', timestamp: '10:07 AM', avatarBg: 'bg-blue-600' },
    { id: 'm-3', senderName: 'Aria Chen (Advocate)', senderRole: 'advocate', text: 'You got this! Try doing 3 box breaths before reading the questions. Your effort matters most.', timestamp: '10:09 AM', avatarBg: 'bg-purple-600' }
  ],
  'room-2': [
    { id: 'm-4', senderName: 'Marco Santos (Advocate)', senderRole: 'advocate', text: 'Hi everyone! This circle is a judgment-free zone for whatever is on your mind.', timestamp: '09:40 AM', avatarBg: 'bg-teal-600' },
    { id: 'm-5', senderName: 'Classmate', senderRole: 'student', text: 'Felt a little isolated during lunch today, but coming here cheered me up.', timestamp: '09:42 AM', avatarBg: 'bg-indigo-600' }
  ]
};

export default function ConnectCirclesModule({
  currentUser,
  onBackToDashboard
}: {
  currentUser?: UserProfile;
  onBackToDashboard?: () => void;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, CircleMessage[]>>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewMessageText, setPreviewMessageText] = useState<string | null>(null);
  const [selectedAdvocateModal, setSelectedAdvocateModal] = useState<AdvocatePeer | null>(null);
  const [privateChatSuccess, setPrivateChatSuccess] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = CIRCLE_ROOMS.find(r => r.id === selectedRoomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, selectedRoomId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = showPreview ? (previewMessageText || '') : inputMessage.trim();
    if (!textToSend || !selectedRoomId) return;

    if (!showPreview) {
      setPreviewMessageText(inputMessage.trim());
      setShowPreview(true);
      return;
    }

    const newMsg: CircleMessage = {
      id: `m-${Date.now()}`,
      senderName: currentUser?.fullName || 'You (Student)',
      senderRole: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarBg: 'bg-indigo-600'
    };

    const updated = {
      ...roomMessages,
      [selectedRoomId]: [...(roomMessages[selectedRoomId] || []), newMsg]
    };

    setRoomMessages(updated);

    const activeRoomObj = CIRCLE_ROOMS.find(r => r.id === selectedRoomId);
    saveRecordedEntry({
      type: 'circle',
      typeLabel: '👥 Connect with Circles',
      title: `Circle Reflection: ${activeRoomObj?.title || 'Peer Support Room'}`,
      excerpt: `Message: "${textToSend}" in ${activeRoomObj?.title || 'Circle'}`,
      reportAnalysis: {
        dominantEmotion: 'Social Support & Solidarity',
        valenceScore: 0.91,
        arousalScore: 0.40,
        sentimentLabel: 'Peer Connection',
        summaryObservation: `Student shared a message in circle room "${activeRoomObj?.title || 'Support Group'}".`,
        psychologistInsights: [
          'Peer group interaction reduces feelings of isolation and fosters empathy.',
          'Constructive contribution to peer support circles strengthens protective social bonds.'
        ],
        guidanceNote: 'Circle interaction recorded in Dashboard activity history.',
        safetyStatus: 'SAFE'
      }
    });

    setInputMessage('');
    setShowPreview(false);
    setPreviewMessageText(null);

    // Simulated Advocate Peer automated supportive response
    setTimeout(() => {
      const advocateReplies = [
        "Thank you for sharing that with the circle! We are standing right beside you.",
        "Your feelings are completely valid. Remember to give yourself grace today!",
        "That takes real courage to put into words. Thanks for being part of our safe circle!",
        "Take a gentle breath. You are doing so much better than you give yourself credit for!"
      ];
      const randomReply = advocateReplies[Math.floor(Math.random() * advocateReplies.length)];

      const advocateMsg: CircleMessage = {
        id: `m-adv-${Date.now()}`,
        senderName: activeRoom?.advocateHost || 'Mental Health Advocate Peer',
        senderRole: 'advocate',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarBg: 'bg-purple-600'
      };

      setRoomMessages(prev => ({
        ...prev,
        [selectedRoomId]: [...(prev[selectedRoomId] || []), advocateMsg]
      }));
    }, 1500);
  };

  const handleRequestPrivateChat = (advocate: AdvocatePeer) => {
    setSelectedAdvocateModal(advocate);
  };

  const handleConfirmPrivateChat = () => {
    setPrivateChatSuccess(true);
    setTimeout(() => {
      setPrivateChatSuccess(false);
      setSelectedAdvocateModal(null);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-black shadow-lg">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Peer-to-Peer Wellness Network
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Connect with Circles</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            4 Mental Health Advocates Active Now
          </span>
        </div>
      </div>

      {/* SECTION 1: MENTAL HEALTH ADVOCATE PEERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Mental Health Advocate Peers
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Trained student leaders dedicated to peer listening, exam stress support, and emotional safety.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADVOCATE_PEERS.map((adv) => (
            <div key={adv.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${adv.avatarBg} text-white font-black text-lg flex items-center justify-center shadow-sm`}>
                    {adv.name.charAt(0)}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    adv.status === 'Online Now' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    adv.status === 'In Circle Room' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                    'bg-blue-50 text-blue-700 border-blue-300'
                  }`}>
                    {adv.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{adv.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400">{adv.gradeSection}</p>
                  <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    ✨ {adv.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                  "{adv.bio}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-slate-500">
                  {adv.rating} ({adv.sessionsCompleted} peers helped)
                </span>
                <button
                  onClick={() => handleRequestPrivateChat(adv)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  Chat 1-on-1
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LIVE SUPPORT CIRCLES */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Peer Support Circles (Live Rooms)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Join themed student group circles moderated by Mental Health Advocate Peers for encouragement & vent sessions.
          </p>
        </div>

        {!selectedRoomId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CIRCLE_ROOMS.map((room) => (
              <div
                key={room.id}
                className={`p-6 rounded-3xl bg-gradient-to-br ${room.bgGradient} bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{room.icon}</span>
                    <span className="px-3 py-1 rounded-full bg-white/90 text-slate-700 text-xs font-black border border-slate-200">
                      👥 {room.activeMembers} Members Active
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      {room.category}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{room.title}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/70 backdrop-blur-xs border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Host: <strong className="text-slate-900">{room.advocateHost}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Join Circle Room</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ACTIVE ROOM CHAT VIEW */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-[520px]">
            {/* Room Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <span>{activeRoom?.icon}</span>
                    <span>{activeRoom?.title}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Host: {activeRoom?.advocateHost} • Safe & Confidential
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  ● Live Circle
                </span>
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Leave Circle
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-slate-50">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center text-xs font-bold text-indigo-900">
                💬 Welcome to {activeRoom?.title}. Please keep all comments kind, respectful, and supportive!
              </div>

              {(roomMessages[selectedRoomId] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.senderRole === 'advocate' ? 'flex-row' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full ${msg.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs max-w-lg shadow-2xs ${
                    msg.senderRole === 'advocate'
                      ? 'bg-purple-900 text-white border border-purple-700'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`font-black ${msg.senderRole === 'advocate' ? 'text-purple-300' : 'text-slate-900'}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Preview Box before sending */}
            {showPreview && previewMessageText && (
              <div className="mx-3 my-2 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Eye className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Message Preview (Review before sending)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Circle Draft
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewMessageText(null);
                    }}
                    className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Dismiss Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-2 p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-100 font-medium leading-relaxed">
                  <div className="text-[10px] text-indigo-300 font-mono mb-1 flex items-center justify-between border-b border-indigo-500/30 pb-1">
                    <span>Target Circle: {activeRoom?.title}</span>
                    <span>{previewMessageText.length} characters</span>
                  </div>
                  <p className="whitespace-pre-wrap">{previewMessageText}</p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 italic">
                    Review your comment before sharing with circle peers.
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" /> Confirm & Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={showPreview ? (previewMessageText || '') : inputMessage}
                onChange={(e) => {
                  if (showPreview) {
                    setPreviewMessageText(e.target.value);
                  } else {
                    setInputMessage(e.target.value);
                  }
                }}
                placeholder="Share your thoughts or encouragement with the circle..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {!showPreview && (
                <button
                  type="button"
                  onClick={() => {
                    if (inputMessage.trim()) {
                      setPreviewMessageText(inputMessage.trim());
                      setShowPreview(true);
                    }
                  }}
                  disabled={!inputMessage.trim()}
                  className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-all cursor-pointer"
                  title="Preview message first"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showPreview ? "Confirm & Send" : "Send"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PRIVATE 1-ON-1 CHAT REQUEST MODAL */}
      {selectedAdvocateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Connect 1-on-1 with Advocate
              </h3>
              <button
                onClick={() => setSelectedAdvocateModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${selectedAdvocateModal.avatarBg} text-white font-black text-lg flex items-center justify-center shrink-0`}>
                {selectedAdvocateModal.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{selectedAdvocateModal.name}</h4>
                <p className="text-xs text-purple-800 font-bold">{selectedAdvocateModal.gradeSection}</p>
                <p className="text-[11px] text-slate-500 font-medium">Specialty: {selectedAdvocateModal.specialty}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Requesting a private peer chat session will notify <strong>{selectedAdvocateModal.name}</strong>. Your identity remains safe, and conversations are grounded in student wellness & mutual empathy.
            </p>

            {privateChatSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Request sent! {selectedAdvocateModal.name} will accept your chat shortly.</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedAdvocateModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPrivateChat}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Send Peer Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
