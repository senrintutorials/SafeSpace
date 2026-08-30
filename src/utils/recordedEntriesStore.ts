export interface CommentItem {
  id: string;
  text: string;
  timestamp: string;
  authorName?: string;
}

export interface LocationMeta {
  address?: string;
  campusZone?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  geofenceStatus?: string;
}

export interface RecordedActivityEntry {
  id: string;
  type: 'journal' | 'video' | 'audio' | 'multimodal' | 'chat' | 'share-art' | 'avatar' | 'sing-along' | 'inspiring-media' | 'affirmation' | 'circle' | 'game' | 'meditation' | 'incident' | 'authority-chat' | 'parent-monitoring' | 'feature-usage';
  typeLabel: string;
  title: string;
  timestamp: string;
  excerpt: string;
  mediaUrl?: string;
  audioDuration?: number;
  location?: LocationMeta;
  chatTranscript?: { role: 'user' | 'model'; content: string; timestamp?: string }[];
  comments?: CommentItem[];
  sharedWithFriends?: string[];
  reportAnalysis: {
    dominantEmotion: string;
    valenceScore: number;
    arousalScore: number;
    sentimentLabel: string;
    summaryObservation: string;
    psychologistInsights: string[];
    guidanceNote: string;
    safetyStatus: 'SAFE' | 'MONITORED' | 'FLAGGED';
  };
}

export const DEFAULT_RECORDED_ENTRIES: RecordedActivityEntry[] = [
  {
    id: 'rec-chat-01',
    type: 'chat',
    typeLabel: '💬 Recorded Counselor Chat',
    title: 'Guidance Session: Academic Balance & Mindfulness with SaFie',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    excerpt: 'Student: "I was feeling anxious about my upcoming exams..." • Counselor SaFie: "Take a deep breath with me. Break down your subjects into small, achievable steps..."',
    chatTranscript: [
      { role: 'model', content: "Hello there! I'm SaFie, your SafeSpace Counselor and Friend. How are you holding up today?" },
      { role: 'user', content: "I was feeling anxious about my upcoming exams and group presentation." },
      { role: 'model', content: "I hear you, and it is completely normal to feel jitters before big academic milestones. Take a deep breath with me. Let's break down your subjects into small, achievable steps." },
      { role: 'user', content: "Thank you SaFie, that really helped me slow down my racing thoughts." },
      { role: 'model', content: "You're so welcome! Remember to take 5-minute study breaks and give yourself credit for every step." }
    ],
    reportAnalysis: {
      dominantEmotion: 'Calm Relief & Empowerment',
      valenceScore: 0.86,
      arousalScore: 0.38,
      sentimentLabel: 'High Reframing Success',
      summaryObservation: 'Student engaged in a structured chat session with AI Counselor SaFie. Demonstrated prompt anxiety reduction following grounding prompts.',
      psychologistInsights: [
        'Proactive use of AI chat counseling for academic anxiety.',
        'Immediate positive response to cognitive reframing and step-by-step task decomposition.'
      ],
      guidanceNote: 'Excellent utilization of the SaFie counseling line. Continue recording chat check-ins whenever feeling overwhelmed.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-journal-01',
    type: 'journal',
    typeLabel: '📖 Recorded Journal Entry',
    title: 'Evening Reflection: Finding Peace After Midterms',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    excerpt: 'I spent 20 minutes sitting in the school courtyard after exams. Taking deep breaths helped me unwind completely. Excited for tomorrow\'s group project and feeling ready.',
    sharedWithFriends: ['@maya_san'],
    reportAnalysis: {
      dominantEmotion: 'Serene Optimism',
      valenceScore: 0.82,
      arousalScore: 0.35,
      sentimentLabel: 'Positive & Mindful',
      summaryObservation: 'The student exhibits strong cognitive reframing and effective decompression techniques following academic pressure.',
      psychologistInsights: [
        'High level of self-directed mindfulness and positive emotional regulation.',
        'Academic stress successfully processed without emotional carryover.'
      ],
      guidanceNote: 'Great practice of mindful transition between academic stress and rest. Recommended to maintain evening journaling.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-avatar-01',
    type: 'avatar',
    typeLabel: '✨ Create Avatar Studio',
    title: 'Chibi Hero Avatar Created: Magical Wink & Gamer Headset',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    excerpt: 'Designed personalized 640x640 Chibi Sticker Avatar with Pastel Pink twin tails, Wink Smile expression, and Hero Bow costume.',
    reportAnalysis: {
      dominantEmotion: 'Creative Joy & Self-Identity',
      valenceScore: 0.94,
      arousalScore: 0.48,
      sentimentLabel: 'High Self-Expression',
      summaryObservation: 'Avatar customization studio session completed. User expressed joyful creative ownership over their personal anime avatar persona.',
      psychologistInsights: [
        'Creative avatar design supports positive digital identity formation.',
        'High alignment with playful self-affirmation and aesthetic satisfaction.'
      ],
      guidanceNote: 'Custom avatar sticker saved to your SafeSpace profile for stickers and journal stamps.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-sing-along-01',
    type: 'sing-along',
    typeLabel: '🎤 Sing Along Karaoke',
    title: 'Vocal Performance: You Raise Me Up (Pitch Accuracy 94%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    excerpt: 'Sung "You Raise Me Up" by Josh Groban with real-time vocal pitch tracking. Average Pitch: 310Hz (High Peak Stability).',
    reportAnalysis: {
      dominantEmotion: 'Uplifting Resilience',
      valenceScore: 0.90,
      arousalScore: 0.55,
      sentimentLabel: 'Vocal Expansion & Flow',
      summaryObservation: 'Interactive karaoke singing session completed with high pitch accuracy and sustained diaphragmatic breath support.',
      psychologistInsights: [
        'Vocal singing stimulates vagus nerve activation, reducing physiological stress markers.',
        'High emotional resonance and release observed during inspirational lyric peaks.'
      ],
      guidanceNote: 'Singing along to uplifting pop ballads is an effective vocal wellness exercise.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-inspiring-media-01',
    type: 'inspiring-media',
    typeLabel: '✨ Inspiring Media Hub',
    title: 'Media Reflection: Daily Courage & Mindfulness Podcast',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    excerpt: 'Explored inspiring quote graphics and listened to Episode 4 of Student Resilience Stories. Saved quote: "Small steady steps move mountains."',
    reportAnalysis: {
      dominantEmotion: 'Informed Motivation',
      valenceScore: 0.85,
      arousalScore: 0.40,
      sentimentLabel: 'Cognitive Reinforcement',
      summaryObservation: 'Student actively engaged with curated inspirational media content and saved encouraging reflection quotes.',
      psychologistInsights: [
        'Proactive consumption of growth-oriented media fosters constructive mindset shifts.',
        'High receptiveness to peer stories of academic perseverance.'
      ],
      guidanceNote: 'Keep exploring media podcasts when seeking fresh perspective or study encouragement.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-video-01',
    type: 'video',
    typeLabel: '🌸 Recorded "Share Your Video"',
    title: 'Personal Time Capsule: First Semester Growth & Encouragement',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    excerpt: 'Hey self, remembering how nervous you were during week 1... look at where you are now! You handled the public speaking presentation with calm confidence. Keep trusting your preparation.',
    mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    reportAnalysis: {
      dominantEmotion: 'Pride & Self-Assurance',
      valenceScore: 0.88,
      arousalScore: 0.52,
      sentimentLabel: 'High Resilience',
      summaryObservation: 'Facial micro-expression analysis indicates genuine Duchenne smile activation (FACS AU6 + AU12) and stable vocal resonance.',
      psychologistInsights: [
        'Strong internal locus of control and positive self-talk.',
        'Non-verbal facial cues reflect authentic satisfaction and relaxed posture.'
      ],
      guidanceNote: 'Excellent self-compassion exercise. Looking back at past video reflections reinforces personal resilience during challenges.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-affirmation-01',
    type: 'affirmation',
    typeLabel: '☀️ Daily Affirmations',
    title: 'Spoken Affirmation: "I am worthy of peace, progress & patience"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    excerpt: 'Completed daily morning positive affirmation check-in with voice recitation: "I choose calm confidence over perfection."',
    reportAnalysis: {
      dominantEmotion: 'Self-Acceptance & Strength',
      valenceScore: 0.89,
      arousalScore: 0.32,
      sentimentLabel: 'Positive Self-Talk',
      summaryObservation: 'Morning affirmation routine completed. Auditory resonance showed steady pitch and relaxed tone during recitation.',
      psychologistInsights: [
        'Repetitive self-affirmation strengthens neural pathways associated with self-worth.',
        'Lowered stress reactivity reported following morning voice check-in.'
      ],
      guidanceNote: 'Daily affirmations provide a grounded start to academic routines.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-circle-01',
    type: 'circle',
    typeLabel: '👥 Connect with Circles',
    title: 'Peer Support Circle: Mindful Study Group Reflection',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 62).toISOString(),
    excerpt: 'Shared reflection in the "Zen Study Circle" with 12 classmates: "Encouraging each other during finals week makes the workload lighter."',
    reportAnalysis: {
      dominantEmotion: 'Social Connection & Belonging',
      valenceScore: 0.91,
      arousalScore: 0.42,
      sentimentLabel: 'Peer Solidarity',
      summaryObservation: 'Active participation in moderated student support circles. High positive social interaction indicators.',
      psychologistInsights: [
        'Peer group support serves as a critical buffer against academic isolation.',
        'Reciprocal empathy and constructive dialogue observed among circle participants.'
      ],
      guidanceNote: 'Social connection in study circles reinforces mutual safety and emotional well-being.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-game-01',
    type: 'game',
    typeLabel: '🎮 SafeSpace Games',
    title: 'Zen Relaxation Session: Breathing Bubble & Zen Garden',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    excerpt: 'Completed 10 minutes of Zen Sand Raking & Rhythm Breathing game. Achieve level 5 inner calm focus (Score: 1,250 pts).',
    reportAnalysis: {
      dominantEmotion: 'Mindful Play & Equilibrium',
      valenceScore: 0.87,
      arousalScore: 0.28,
      sentimentLabel: 'Decompression Achieved',
      summaryObservation: 'Engaged in tactile relaxation games designed to shift brainwave rhythms into relaxed alpha state.',
      psychologistInsights: [
        'Gamified sensory grounding effectively redirects hyper-vigilant thoughts.',
        'Heart rate variability (HRV) proxies indicate steady autonomic calming.'
      ],
      guidanceNote: 'Sensory games serve as ideal 10-minute study breaks between intense focus blocks.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-audio-01',
    type: 'audio',
    typeLabel: '🎤 Recorded "Share Voice"',
    title: 'Voice Note: Pre-Speech Jitters & Vocal Calming Exercises',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    excerpt: 'Practicing my class report presentation out loud... my voice started a bit shaky in the first few seconds, but my breathing evened out as I focused on the main points.',
    mediaUrl: 'simulated-voice-note',
    audioDuration: 14,
    reportAnalysis: {
      dominantEmotion: 'Calm Focus & Stability',
      valenceScore: 0.65,
      arousalScore: 0.45,
      sentimentLabel: 'Vocal Cadence Stabilized',
      summaryObservation: 'Acoustic pitch tracking indicates pitch normalization from 195Hz initial tension down to 142Hz relaxed conversational pitch within 8 seconds.',
      psychologistInsights: [
        'Pacing stabilized from rapid 170 wpm down to clear 130 wpm cadence.',
        'Resonance analysis shows positive response to diaphragmatic breathing.'
      ],
      guidanceNote: 'Demonstrates active mastery over performance anxiety. Vocal pitch and tone cleared up very quickly.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-meditation-01',
    type: 'meditation',
    typeLabel: '🍃 Breathing Helps',
    title: 'Guided 4-7-8 Diaphragmatic Breathing Session (5 Mins)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 85).toISOString(),
    excerpt: 'Completed 6 full cycles of 4-sec inhale, 7-sec hold, 8-sec exhale with soothing ocean soundscape.',
    reportAnalysis: {
      dominantEmotion: 'Deep Parasympathetic Calm',
      valenceScore: 0.93,
      arousalScore: 0.20,
      sentimentLabel: 'Optimal Relaxation',
      summaryObservation: 'Structured breathing exercise successfully reduced self-reported tension from 7/10 to 2/10.',
      psychologistInsights: [
        'Prolonged exhalation directly stimulates parasympathetic vagal tone.',
        'Sustained respiratory control reduces somatic symptoms of panic.'
      ],
      guidanceNote: 'Consistently using 4-7-8 breathing before high-pressure events builds long-term autonomic resilience.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-incident-01',
    type: 'incident',
    typeLabel: '🛡️ Report Incident',
    title: 'Confidential Safety Dispatch: Hallway Peer Dispute Note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    excerpt: 'Submitted confidential report regarding hallway intimidation incident near East Building locker bank. Guidance officer dispatched.',
    reportAnalysis: {
      dominantEmotion: 'Proactive Courage & Alertness',
      valenceScore: 0.45,
      arousalScore: 0.65,
      sentimentLabel: 'Confidential Safety Action',
      summaryObservation: 'Student utilized the encrypted Incident Dispatch tool to report campus safety concerns.',
      psychologistInsights: [
        'Taking proactive safety action helps regain sense of agency in stressful environments.',
        'Confidential reporting protects student safety while ensuring guidance officer notification.'
      ],
      guidanceNote: 'Safety report routed to designated school guidance officers and logged in safety desk.',
      safetyStatus: 'MONITORED'
    }
  },
  {
    id: 'rec-authority-01',
    type: 'authority-chat',
    typeLabel: '☎️ Alert Lines Hotline',
    title: 'Direct Line Session: School Counselor Consultation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 108).toISOString(),
    excerpt: 'Held confidential 1-on-1 direct line chat session with Guidance Head Mrs. Davis regarding schedule support.',
    reportAnalysis: {
      dominantEmotion: 'Reassured Support',
      valenceScore: 0.84,
      arousalScore: 0.35,
      sentimentLabel: 'Counselor Alignment',
      summaryObservation: 'Direct communication line used to consult with school guidance staff. Positive plan established.',
      psychologistInsights: [
        'Direct counselor contact provides immediate institutional support.',
        'Open communication channel reduces feelings of helplessness.'
      ],
      guidanceNote: 'Follow-up appointment scheduled for next Tuesday.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-parent-01',
    type: 'parent-monitoring',
    typeLabel: '❤️ Parent & Child Portal',
    title: 'Family Safety Portal: Weekly Wellbeing Check-In',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 115).toISOString(),
    excerpt: 'Parent portal sync completed. Shared weekly mood summaries and positive academic milestones with guardian.',
    reportAnalysis: {
      dominantEmotion: 'Family Harmony',
      valenceScore: 0.92,
      arousalScore: 0.30,
      sentimentLabel: 'Guardianship Alignment',
      summaryObservation: 'Parent-child portal check-in verified. Positive familial support system active.',
      psychologistInsights: [
        'Strong parental support and transparent communication significantly improve student emotional stability.',
        'Family engagement acts as a primary protective factor.'
      ],
      guidanceNote: 'Weekly parent portal summary updated automatically.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-multimodal-01',
    type: 'multimodal',
    typeLabel: '🎨 Recorded "Share Feelings"',
    title: 'Study Break Canvas: Campus Sunset & Gratitude Note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    excerpt: 'Captured the golden sunset light outside the library window while studying with my project team. Feeling grateful for good classmates who help each other out.',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    reportAnalysis: {
      dominantEmotion: 'Warm Gratitude',
      valenceScore: 0.91,
      arousalScore: 0.38,
      sentimentLabel: 'Social Connection & Harmony',
      summaryObservation: 'Visual color spectrum analysis indicates high preference for warm golden hues associated with safety and peaceful social bonding.',
      psychologistInsights: [
        'Strong protective factor present through active peer support and aesthetic appreciation.',
        'Balanced mood with low distress indicators.'
      ],
      guidanceNote: 'Social connections and taking visual study breaks serve as key protective factors against burnout.',
      safetyStatus: 'SAFE'
    }
  },
  {
    id: 'rec-share-art-01',
    type: 'share-art',
    typeLabel: '🖼️ Share your Arts',
    title: 'Art Canvas: Serene Ocean Waves & Emerald Harmony',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    excerpt: 'Reflection: "Drawing fluid waves with warm emerald and amber tones helped me release exam tension." • Analysis: Serene Tranquility & Creative Catharsis (Valence: 88%)',
    mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    reportAnalysis: {
      dominantEmotion: 'Creative Catharsis & Serenity',
      valenceScore: 0.88,
      arousalScore: 0.36,
      sentimentLabel: 'Mindful Art Flow',
      summaryObservation: 'Color spectrum analysis of the drawn artwork indicates high dominance of soothing emerald green and golden hues. Stroke density reflects non-linear creative release.',
      psychologistInsights: [
        'Art expression provided an effective non-verbal channel for releasing subconscious tension.',
        'The chosen color palette aligns with self-directed grounding and cognitive decompression.',
        'User reflection demonstrates positive self-directed emotional grounding.'
      ],
      guidanceNote: 'Art therapy serves as a key protective factor against stress. Continue keeping visual reflections in your SafeSpace Dashboard.',
      safetyStatus: 'SAFE'
    }
  }
];

const STORAGE_KEY = 'selfsense_recorded_activity_entries_v1';

export function getRecordedEntries(): RecordedActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load recorded entries from localStorage:', err);
  }
  return DEFAULT_RECORDED_ENTRIES;
}

export function saveRecordedEntry(entry: Omit<RecordedActivityEntry, 'id' | 'timestamp'>): RecordedActivityEntry {
  const current = getRecordedEntries();
  const newEntry: RecordedActivityEntry = {
    ...entry,
    id: `rec-${entry.type}-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to save recorded entry to localStorage:', err);
  }
  return newEntry;
}

export function saveOrUpdateChatSessionEntry(messages: { role: 'user' | 'model'; content: string }[], customTitle?: string): RecordedActivityEntry {
  const userMsgs = messages.filter(m => m.role === 'user');
  const lastUserMsg = userMsgs[userMsgs.length - 1]?.content || 'Counselor check-in with SaFie';
  const lastModelMsg = messages.filter(m => m.role === 'model').pop()?.content || 'Counselor SaFie provided emotional support.';
  
  const userExcerpt = lastUserMsg.length > 90 ? lastUserMsg.slice(0, 90) + '...' : lastUserMsg;
  const modelExcerpt = lastModelMsg.length > 90 ? lastModelMsg.slice(0, 90) + '...' : lastModelMsg;

  const excerptText = userMsgs.length > 0 
    ? `Student: "${userExcerpt}" • Counselor SaFie: "${modelExcerpt}"`
    : `Guidance conversation session with AI Counselor SaFie (${messages.length} messages exchanged).`;

  const title = customTitle || `Counselor Chat: ${lastUserMsg.slice(0, 42)}${lastUserMsg.length > 42 ? '...' : ''}`;

  return saveRecordedEntry({
    type: 'chat',
    typeLabel: '💬 Recorded Counselor Chat',
    title: title,
    excerpt: excerptText,
    chatTranscript: messages,
    reportAnalysis: {
      dominantEmotion: 'Empathetic Support & Clarity',
      valenceScore: 0.88,
      arousalScore: 0.38,
      sentimentLabel: 'Active Guidance & Resilience',
      summaryObservation: `Student completed a ${messages.length}-message interactive guidance session with AI Counselor SaFie. High constructive engagement observed.`,
      psychologistInsights: [
        'Proactive self-expression and healthy emotional processing through structured dialogue.',
        'High alignment with SafeSpace counselor coping recommendations and stress reframing.'
      ],
      guidanceNote: 'Recorded chat session added to Dashboard history. Regular communication with SaFie supports long-term mental wellbeing.',
      safetyStatus: 'SAFE'
    }
  });
}

export function refreshAllRecordedEntries(): RecordedActivityEntry[] {
  try {
    const current = getRecordedEntries();
    const existingIds = new Set(current.map(e => e.id));
    const missingDefaults = DEFAULT_RECORDED_ENTRIES.filter(d => !existingIds.has(d.id));
    const merged = missingDefaults.length > 0 ? [...current, ...missingDefaults] : current;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.warn('Failed to refresh recorded entries in localStorage:', err);
    return getRecordedEntries();
  }
}

export function deleteRecordedEntry(id: string): RecordedActivityEntry[] {
  try {
    const current = getRecordedEntries();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to delete recorded entry from localStorage:', err);
    return getRecordedEntries();
  }
}

export function addCommentToEntry(entryId: string, commentText: string, authorName: string = 'User Reflection'): RecordedActivityEntry[] {
  const current = getRecordedEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId) {
      const existingComments = entry.comments || [];
      const newComment: CommentItem = {
        id: `comment-${Date.now()}`,
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
        authorName
      };
      return {
        ...entry,
        comments: [...existingComments, newComment]
      };
    }
    return entry;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to add comment to entry in localStorage:', err);
  }
  return updated;
}

export function deleteCommentFromEntry(entryId: string, commentId: string): RecordedActivityEntry[] {
  const current = getRecordedEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId && entry.comments) {
      return {
        ...entry,
        comments: entry.comments.filter(c => c.id !== commentId)
      };
    }
    return entry;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to delete comment from entry in localStorage:', err);
  }
  return updated;
}

export function shareEntryWithFriend(entryId: string, friendAccountName: string): RecordedActivityEntry[] {
  const current = getRecordedEntries();
  const trimmed = friendAccountName.trim();
  if (!trimmed) return current;

  // Format with @ if user didn't type @ or keep clean
  const formattedName = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;

  const updated = current.map(entry => {
    if (entry.id === entryId) {
      const existing = entry.sharedWithFriends || [];
      if (!existing.includes(formattedName)) {
        return {
          ...entry,
          sharedWithFriends: [...existing, formattedName]
        };
      }
    }
    return entry;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to share entry with friend in localStorage:', err);
  }
  return updated;
}

export function unshareEntryWithFriend(entryId: string, friendAccountName: string): RecordedActivityEntry[] {
  const current = getRecordedEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId && entry.sharedWithFriends) {
      return {
        ...entry,
        sharedWithFriends: entry.sharedWithFriends.filter(f => f !== friendAccountName)
      };
    }
    return entry;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to unshare entry with friend in localStorage:', err);
  }
  return updated;
}

export function clearAndResetRecordedEntries(): RecordedActivityEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDED_ENTRIES));
    window.dispatchEvent(new CustomEvent('recorded_entries_updated', { detail: DEFAULT_RECORDED_ENTRIES }));
  } catch (err) {
    console.warn('Failed to reset recorded entries in localStorage:', err);
  }
  return DEFAULT_RECORDED_ENTRIES;
}
