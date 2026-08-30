import React, { useState, useEffect } from 'react';
import { ShieldAlert, MessageSquare, X, Heart, Sparkles, ChevronRight, Bell } from 'lucide-react';
import { UserProfile, ROLE_CONFIGS } from '../types/auth';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export interface AuthorityMessageNotification {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  alertId?: string;
  timestamp: string;
}

interface TopAuthorityMessageBannerProps {
  currentUser?: UserProfile | null;
  onOpenAuthorityChat: () => void;
}

export default function TopAuthorityMessageBanner({
  currentUser,
  onOpenAuthorityChat
}: TopAuthorityMessageBannerProps) {
  const [activeNotification, setActiveNotification] = useState<AuthorityMessageNotification | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Listen to window custom events
  useEffect(() => {
    const handleCustomMsg = (event: any) => {
      const msg = event?.detail;
      if (!msg || !msg.text) return;

      const isMe = currentUser && msg.senderId === currentUser.id;
      if (isMe) return; // Don't notify self

      if (!dismissedIds.has(msg.id)) {
        setActiveNotification({
          id: msg.id || 'msg-' + Date.now(),
          senderName: msg.senderName || 'Authority / Parent',
          senderRole: msg.senderRole || 'authority',
          text: msg.text,
          alertId: msg.alertId,
          timestamp: msg.timestamp || new Date().toISOString()
        });
      }
    };

    window.addEventListener('authority_message_created', handleCustomMsg);
    return () => window.removeEventListener('authority_message_created', handleCustomMsg);
  }, [currentUser, dismissedIds]);

  // Listen to live Firestore authority_messages collection
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const msgRef = collection(db, 'authority_messages');
      const q = query(msgRef, orderBy('timestamp', 'desc'), limit(1));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          const msgId = doc.id;

          const isMe = currentUser && data.senderId === currentUser.id;
          if (!isMe && !dismissedIds.has(msgId)) {
            // Check if this message was created in the last 12 hours
            const msgTime = new Date(data.timestamp).getTime();
            const now = Date.now();
            if (now - msgTime < 12 * 3600 * 1000) {
              setActiveNotification({
                id: msgId,
                senderName: data.senderName || 'Authority / Parent',
                senderRole: data.senderRole || 'authority',
                text: data.text || '',
                alertId: data.alertId,
                timestamp: data.timestamp
              });
            }
          }
        }
      }, (err) => {
        console.warn('Firestore notification banner snapshot warning:', err);
      });
    } catch (e) {
      console.warn('Firestore initialization error for notification banner:', e);
    }

    return () => unsubscribe();
  }, [currentUser, dismissedIds]);

  if (!activeNotification) return null;

  const isParentSender = activeNotification.senderRole === 'parent_guardian';
  const roleLabel = isParentSender 
    ? 'Parent / Guardian' 
    : (ROLE_CONFIGS[activeNotification.senderRole as keyof typeof ROLE_CONFIGS]?.shortLabel || 'Respective Authority');

  const handleDismiss = () => {
    if (activeNotification) {
      setDismissedIds(prev => new Set(prev).add(activeNotification.id));
    }
    setActiveNotification(null);
  };

  const handleOpenChat = () => {
    handleDismiss();
    onOpenAuthorityChat();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xl px-4 pointer-events-none transition-all duration-300">
      <div className={`pointer-events-auto p-4 rounded-2xl bg-white/95 border-2 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 animate-bounce-short ${
        isParentSender ? 'border-emerald-500 shadow-emerald-100' : 'border-rose-500 shadow-rose-100'
      }`}>
        {/* Left Info Column */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isParentSender ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {isParentSender ? <Heart className="w-6 h-6 animate-pulse text-emerald-600" /> : <ShieldAlert className="w-6 h-6 animate-pulse text-rose-600" />}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                isParentSender ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                🔔 Message from your {roleLabel}
              </span>
              {activeNotification.alertId && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Ref #{activeNotification.alertId}
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-slate-900 truncate">
              {activeNotification.senderName}
            </p>

            <p className="text-xs text-slate-700 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-200 font-sans">
              "{activeNotification.text}"
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <button
            onClick={handleOpenChat}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isParentSender
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Chat</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
