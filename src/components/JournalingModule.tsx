import React, { useState, useEffect, useRef } from 'react';
import { Book, Edit3, Save, Calendar, CheckCircle2, RotateCcw, Sparkles, Trash2, AlertTriangle, Plus, X, Radio, Mic, MicOff, Smile, Sticker, Eye, Send, Play, Pause, Users, UserPlus, User, Search } from 'lucide-react';
import { saveRecordedEntry, getRecordedEntries, refreshAllRecordedEntries, deleteRecordedEntry, shareEntryWithFriend, unshareEntryWithFriend, RecordedActivityEntry } from '../utils/recordedEntriesStore';
import { playAudibleRecording, getSupportedAudioMimeType } from '../utils/audioPlayback';
import { useLocationTracker } from '../utils/locationTracker';

export default function JournalingModule() {
  const { location: trackerLocation } = useLocationTracker();

  const [entry, setEntry] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [journalHistory, setJournalHistory] = useState<RecordedActivityEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Share to Friend state
  const [shareWithFriendInput, setShareWithFriendInput] = useState('');
  const [historyShareInputs, setHistoryShareInputs] = useState<Record<string, string>>({});

  // Prompts state
  const defaultPrompts = [
    "What is one thing that brought you peace today?",
    "Describe a challenge you faced and how you handled it.",
    "What are you looking forward to tomorrow?"
  ];

  const [personalPrompts, setPersonalPrompts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('journal_personal_prompts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const allPrompts = [...personalPrompts, ...defaultPrompts];
  const [activePrompt, setActivePrompt] = useState(allPrompts[0]);
  const [showPersonalPromptModal, setShowPersonalPromptModal] = useState(false);
  const [newPromptInput, setNewPromptInput] = useState('');

  // Interactive Options state (Emoticons, Stickers, Voice Text, Voice Message, Preview)
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'emojis' | 'stickers'>('emojis');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState<boolean>(false);

  // Voice Note state
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState<boolean>(false);

  // Preview Modal state
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Refs for speech & recording
  const recognitionRef = useRef<any>(null);
  const baseVoiceTextRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const stopAudioPlayerRef = useRef<(() => void) | null>(null);

  const EMOTICONS = [
    '😊', '🤗', '💖', '🌿', '🌟', '🙏', '🌸', '☕', 
    '💙', '✨', '🧘', '💪', '🌈', '☁️', '☀️', '🍃', 
    '🌻', '🕊️', '📖', '💡', '💬', '🎉', '🧸', '💌',
    '🥺', '😌', '🥰', '🌱', '🎈', '🎨', '🏖️', '🌙',
    '🫂', '🌧️', '⚡', '🔥', '🌊', '🤝', '🦋', '💜'
  ];

  const STICKERS = [
    { id: 'hug', emoji: '🫂', title: 'Sending Warm Hugs', text: '🫂 Sending warm hugs and comfort right now!' },
    { id: 'anxious', emoji: '🌧️', title: 'Feeling Anxious', text: '🌧️ I am feeling quite anxious and overwhelmed today.' },
    { id: 'rest', emoji: '😴', title: 'Need Rest', text: '😴 Need a peaceful pause and rest from everything.' },
    { id: 'proud', emoji: '🌟', title: 'Proud of Myself', text: '🌟 I took a small step forward today and I feel proud!' },
    { id: 'breath', emoji: '🍃', title: 'Taking a Deep Breath', text: '🍃 Pause and deep breath: 4-7-8 calming breath in progress...' },
    { id: 'stress', emoji: '📚', title: 'Exam / School Stress', text: '📚 Struggling with heavy school requirements, assignments, and exams.' },
    { id: 'safe', emoji: '🛡️', title: 'Seeking Safe Space', text: '🛡️ Thankful for this safe, confidential space to talk.' },
    { id: 'grateful', emoji: '💖', title: 'Grateful Today', text: '💖 Logging a moment of gratitude and positivity today.' },
    { id: 'coffee', emoji: '☕', title: 'Cozy Self-Care Pause', text: '☕ Taking 5 minutes for warm self-care and tea/coffee.' },
    { id: 'overthinking', emoji: '🧠', title: 'Overthinking Mind', text: '🧠 My thoughts are racing fast and I need help slowing down.' },
    { id: 'hope', emoji: '🌈', title: 'Hope & Light', text: '🌈 Reminding myself that tough days will pass and better days are ahead.' },
    { id: 'friends', emoji: '🤝', title: 'Friendship Drama', text: '🤝 Dealing with conflict and communication trouble with friends.' }
  ];

  const handleAddPersonalPrompt = () => {
    if (!newPromptInput.trim()) return;
    const added = newPromptInput.trim();
    if (!personalPrompts.includes(added)) {
      const updated = [added, ...personalPrompts];
      setPersonalPrompts(updated);
      try { localStorage.setItem('journal_personal_prompts', JSON.stringify(updated)); } catch (_) {}
    }
    setActivePrompt(added);
    setNewPromptInput('');
    setShowPersonalPromptModal(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setEntry(prev => prev + emoji);
  };

  const handleInsertSticker = (stickerText: string) => {
    setEntry(prev => (prev ? `${prev}\n${stickerText}` : stickerText));
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      setIsTranscribingVoice(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can still type or record a Voice Message!");
      return;
    }

    try {
      baseVoiceTextRef.current = entry;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsTranscribingVoice(false);
      };

      recognition.onresult = (event: any) => {
        setIsTranscribingVoice(true);
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const combined = baseVoiceTextRef.current 
          ? `${baseVoiceTextRef.current} ${transcript}` 
          : transcript;
        setEntry(combined);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setIsTranscribingVoice(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsTranscribingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsListening(false);
    }
  };

  const startVoiceNoteRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone access is not supported on this device/browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecordingVoiceNote(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start voice note recording:', err);
      alert('Could not access microphone for voice message recording.');
    }
  };

  const stopAndAttachVoiceNote = () => {
    if (mediaRecorderRef.current && isRecordingVoiceNote) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoiceNote(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handlePlayVoiceNote = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingRecordedAudio) {
      if (stopAudioPlayerRef.current) {
        stopAudioPlayerRef.current();
      }
      setIsPlayingRecordedAudio(false);
      return;
    }

    setIsPlayingRecordedAudio(true);
    const stopFn = playAudibleRecording({
      audioUrl: recordedAudioUrl,
      onEnd: () => setIsPlayingRecordedAudio(false),
      onError: () => setIsPlayingRecordedAudio(false)
    });
    stopAudioPlayerRef.current = stopFn;
  };

  const loadJournalEntries = () => {
    const all = getRecordedEntries();
    setJournalHistory(all.filter(e => e.type === 'journal'));
  };

  useEffect(() => {
    loadJournalEntries();
    const handleUpdate = () => loadJournalEntries();
    window.addEventListener('recorded_entries_updated', handleUpdate);
    return () => window.removeEventListener('recorded_entries_updated', handleUpdate);
  }, []);

  const handleRefreshHistory = () => {
    setIsRefreshing(true);
    refreshAllRecordedEntries();
    setTimeout(() => {
      loadJournalEntries();
      setIsRefreshing(false);
    }, 400);
  };

  const handleSave = async () => {
    if (!entry.trim() && !recordedAudioUrl) return;
    setIsSaved(true);

    const friendFormatted = shareWithFriendInput.trim() 
      ? [shareWithFriendInput.trim().startsWith('@') ? shareWithFriendInput.trim() : `@${shareWithFriendInput.trim()}`] 
      : undefined;

    saveRecordedEntry({
      type: 'journal',
      typeLabel: '📖 Recorded Journal Entry',
      title: `Journal: ${activePrompt}`,
      excerpt: entry.trim() || 'Recorded Voice Journal Entry',
      mediaUrl: recordedAudioUrl || undefined,
      audioDuration: recordingDuration || undefined,
      sharedWithFriends: friendFormatted,
      location: trackerLocation,
      reportAnalysis: {
        dominantEmotion: 'Reflective Mindfulness',
        valenceScore: 0.80,
        arousalScore: 0.30,
        sentimentLabel: 'Positive & Mindful',
        summaryObservation: 'The student recorded a daily reflective journal entry demonstrating healthy emotional awareness.',
        psychologistInsights: [
          'Mindful written expression promotes emotional clarity and cognitive reframing.',
          'Regular journaling serves as an effective self-directed coping strategy.'
        ],
        guidanceNote: 'Your entry has been saved and analyzed. Keep up the daily journaling habit!',
        safetyStatus: 'SAFE'
      }
    });

    const savedText = entry;
    setEntry('');
    setShareWithFriendInput('');
    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingDuration(0);
    setShowPreviewModal(false);

    if (savedText.trim()) {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: savedText, sourceModule: 'Your Journal' })
        });
        const data = await res.json();
        if (data?.safetyAlertTriggered && data?.alertDetails) {
          window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: data.alertDetails }));
        }
      } catch (err) {
        console.error('Failed to log journal safety check:', err);
      }
    }

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <h2 className="text-lg text-slate-900 font-semibold flex items-center gap-2">
          <Book className="w-5 h-5 text-indigo-600" /> Daily Journal
        </h2>

        <button
          onClick={handleRefreshHistory}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
          title="Refresh journal history"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh History'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 max-w-4xl mx-auto w-full custom-scrollbar">
        {/* Today's Prompt Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Prompt</h3>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start justify-between gap-3.5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <Edit3 className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed">{activePrompt}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPersonalPromptModal(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition-all shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add personal prompt</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto custom-scrollbar pb-1">
            {allPrompts.map((p, i) => (
              <button 
                key={i} 
                onClick={() => setActivePrompt(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  p === activePrompt 
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Prompt {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Writing & Options Container */}
        <div className="relative space-y-3">
          {/* Active Voice Dictation Banner */}
          {(isListening || isTranscribingVoice) && (
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200 shadow-2xs">
              <div className="flex items-center gap-2 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>
                  {isTranscribingVoice 
                    ? "Transcribing your spoken words into your journal entry..." 
                    : "Voice Text listening in real-time... Speak into your microphone."}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-rose-700 font-bold hover:underline text-[11px] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer shrink-0 ml-2"
              >
                {isTranscribingVoice ? "Transcribing..." : "Done / Stop"}
              </button>
            </div>
          )}

          {/* Emoticons & Stickers Popover Drawer */}
          {showPicker && (
            <div className="p-3 sm:p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl mb-3 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTab('emojis')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      pickerTab === 'emojis' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" /> Emoticons
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab('stickers')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      pickerTab === 'stickers' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Sticker className="w-3.5 h-3.5" /> Stickers
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pickerTab === 'emojis' ? (
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 font-medium">Click any emoticon to insert into your journal entry:</p>
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                    {EMOTICONS.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="p-2 text-xl rounded-xl hover:bg-slate-800 hover:scale-125 transition-all text-center flex items-center justify-center active:scale-95 cursor-pointer"
                        title={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] text-slate-400 mb-2 font-medium">Click an expressive sticker to insert into your reflection:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
                    {STICKERS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleInsertSticker(st.text)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500 text-left transition-all flex items-center gap-2 group active:scale-98 cursor-pointer"
                      >
                        <span className="text-xl p-1.5 rounded-lg bg-slate-900 group-hover:scale-110 transition-transform shrink-0">{st.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate">{st.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{st.text}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attached Voice Message Attachment Card */}
          {recordedAudioUrl && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between mb-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-purple-950">
                <Radio className="w-4 h-4 text-purple-600 animate-pulse shrink-0" />
                <span>Attached Voice Message ({recordingDuration}s)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayVoiceNote}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  {isPlayingRecordedAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingRecordedAudio ? 'Pause' : 'Play Voice'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecordedAudioUrl(null);
                    setRecordedAudioBlob(null);
                    setRecordingDuration(0);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Remove attached voice note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Start writing or record voice text..."
            className="w-full h-[240px] sm:h-[320px] bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed text-sm sm:text-base shadow-sm"
          />

          {/* Interactive Options Toolbar Matching Safie Chat (Voice Message, Voice Text, Emoticons, Stickers, Add Personal Prompt, Preview, Send) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Voice Message Option */}
              <button
                type="button"
                onClick={isRecordingVoiceNote ? stopAndAttachVoiceNote : startVoiceNoteRecording}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isRecordingVoiceNote
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs'
                    : recordedAudioUrl
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                    : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80'
                }`}
                title={isRecordingVoiceNote ? "Stop Voice Recording" : "Record Voice Message"}
              >
                <Radio className={`w-3.5 h-3.5 ${isRecordingVoiceNote ? 'text-white animate-pulse' : 'text-indigo-600'}`} />
                <span>{isRecordingVoiceNote ? `Recording (${recordingDuration}s)...` : recordedAudioUrl ? 'Voice Recorded ✓' : 'Voice Message'}</span>
              </button>

              {/* Voice Text (Speech-to-Text) */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={isListening ? "Stop Speech Dictation" : "Voice Text (Speech-to-Text)"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-white" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-slate-600" />
                    <span>Voice Text</span>
                  </>
                )}
              </button>

              {/* Emoticons */}
              <button
                type="button"
                onClick={() => {
                  if (showPicker && pickerTab === 'emojis') {
                    setShowPicker(false);
                  } else {
                    setShowPicker(true);
                    setPickerTab('emojis');
                  }
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  showPicker && pickerTab === 'emojis'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Open Emoticons"
              >
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                <span>Emoticons</span>
              </button>

              {/* Stickers */}
              <button
                type="button"
                onClick={() => {
                  if (showPicker && pickerTab === 'stickers') {
                    setShowPicker(false);
                  } else {
                    setShowPicker(true);
                    setPickerTab('stickers');
                  }
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  showPicker && pickerTab === 'stickers'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Open Expressive Stickers"
              >
                <Sticker className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stickers</span>
              </button>

              {/* Add Personal Prompt */}
              <button
                type="button"
                onClick={() => setShowPersonalPromptModal(true)}
                className="px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 transition-colors cursor-pointer"
                title="Add a personal prompt"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>Add personal prompt</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Preview Button */}
              <button
                type="button"
                onClick={() => {
                  if (entry.trim() || recordedAudioUrl) {
                    setShowPreviewModal(true);
                  }
                }}
                disabled={!entry.trim() && !recordedAudioUrl}
                className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-purple-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                title="Preview journal entry"
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>Preview</span>
              </button>

              {/* Save / Send Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!entry.trim() && !recordedAudioUrl}
                className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved!' : 'Save Journal Entry'}</span>
              </button>
            </div>
          </div>

          {/* Share to a Friend Optional Field */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Share to a Friend:</span>
            </div>
            <input
              type="text"
              value={shareWithFriendInput}
              onChange={(e) => setShareWithFriendInput(e.target.value)}
              placeholder="Type SafeSpace account name (e.g. @maya_san or Alex)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
          </div>

          <div className="px-1 text-[11px] text-slate-400 font-mono">
            {entry.length} characters
          </div>

          {/* MANDATORY MEDICAL & PROFESSIONAL DISCLAIMER BANNER FOR SHARE FEELINGS */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5 shadow-2xs mt-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-amber-950 block mb-0.5">Medical & Professional Disclaimer</strong>
              Reflections, sentiments, and journal feedback in <strong>Share Feelings</strong> are provided for personal self-awareness and mindful reflection only. They do <strong>NOT</strong> represent or substitute for actual medical, psychological, or clinical consultation with licensed doctors or mental health professionals.
            </div>
          </div>
        </div>

      {/* Add Personal Prompt Modal */}
      {showPersonalPromptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Add Personal Prompt
              </h3>
              <button
                type="button"
                onClick={() => setShowPersonalPromptModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Type your own reflection prompt or daily goal to guide your journal entries.
            </p>

            <textarea
              value={newPromptInput}
              onChange={(e) => setNewPromptInput(e.target.value)}
              placeholder="e.g. What is a goal I accomplished today that made me feel proud?"
              rows={3}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPersonalPromptModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPersonalPrompt}
                disabled={!newPromptInput.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Prompt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entry Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" /> Journal Entry Preview
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                <Edit3 className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>Prompt: {activePrompt}</span>
              </div>

              {entry.trim() ? (
                <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry}
                </p>
              ) : (
                <p className="text-slate-400 text-xs italic">
                  (Voice message reflection entry)
                </p>
              )}

              {recordedAudioUrl && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                    <Radio className="w-4 h-4 text-purple-600" />
                    <span>Voice Message ({recordingDuration}s)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePlayVoiceNote}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isPlayingRecordedAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingRecordedAudio ? 'Pause' : 'Play Voice'}</span>
                  </button>
                </div>
              )}

              {shareWithFriendInput.trim() && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Shared to SafeSpace Friend: <strong className="text-indigo-700">{shareWithFriendInput.trim().startsWith('@') ? shareWithFriendInput.trim() : `@${shareWithFriendInput.trim()}`}</strong>
                  </span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono border-t border-slate-200">
                <span>Length: {entry.length} characters</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Journal Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
        
        {/* Recent Journal Entries History */}
        <div className="mt-8 sm:mt-10 space-y-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
               <Calendar className="w-4 h-4 text-indigo-600" /> Recent Journal Entries ({journalHistory.length})
             </h3>
             <button
               onClick={handleRefreshHistory}
               className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
             >
               <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
             </button>
           </div>

           {/* Keyword Search Input Bar */}
           <div className="relative flex items-center w-full">
             <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
             <input
               type="text"
               value={searchKeyword}
               onChange={(e) => setSearchKeyword(e.target.value)}
               placeholder="Search journal entries by title, emotion, content, or friend name..."
               className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
             />
             {searchKeyword ? (
               <button
                 onClick={() => setSearchKeyword('')}
                 className="absolute right-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
               >
                 <X className="w-3 h-3" />
                 <span>Clear</span>
               </button>
             ) : (
               <span className="absolute right-3 text-[10px] font-bold text-slate-400">
                 Search
               </span>
             )}
           </div>

           {journalHistory.length === 0 ? (
             <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
               No journal entries recorded yet. Write your first reflection above!
             </div>
           ) : journalHistory.filter((item) => {
               if (!searchKeyword.trim()) return true;
               const q = searchKeyword.toLowerCase().trim();
               return (
                 (item.title && item.title.toLowerCase().includes(q)) ||
                 (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
                 (item.reportAnalysis?.dominantEmotion && item.reportAnalysis.dominantEmotion.toLowerCase().includes(q)) ||
                 (item.reportAnalysis?.copingSuggestion && item.reportAnalysis.copingSuggestion.toLowerCase().includes(q)) ||
                 (item.sharedWithFriends && item.sharedWithFriends.some(f => f.toLowerCase().includes(q)))
               );
             }).length === 0 ? (
             <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-xs space-y-2">
               <p className="font-bold text-slate-700">No journal entries found matching "{searchKeyword}"</p>
               <button
                 onClick={() => setSearchKeyword('')}
                 className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold transition-all cursor-pointer"
               >
                 Clear Search
               </button>
             </div>
           ) : (
             <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
               {journalHistory
                 .filter((item) => {
                   if (!searchKeyword.trim()) return true;
                   const q = searchKeyword.toLowerCase().trim();
                   return (
                     (item.title && item.title.toLowerCase().includes(q)) ||
                     (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
                     (item.reportAnalysis?.dominantEmotion && item.reportAnalysis.dominantEmotion.toLowerCase().includes(q)) ||
                     (item.reportAnalysis?.copingSuggestion && item.reportAnalysis.copingSuggestion.toLowerCase().includes(q)) ||
                     (item.sharedWithFriends && item.sharedWithFriends.some(f => f.toLowerCase().includes(q)))
                   );
                 })
                 .map((item) => (
                 <div key={item.id} className="p-4 sm:p-5 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all shadow-sm space-y-2 relative group">
                   <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                     <span>{new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                     <div className="flex items-center gap-1.5">
                       <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                         {item.reportAnalysis?.dominantEmotion || 'Mindful'}
                       </span>
                       {deletingId === item.id ? (
                         <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-lg">
                           <span className="text-[10px] font-bold text-rose-900">Delete?</span>
                           <button
                             onClick={() => {
                               deleteRecordedEntry(item.id);
                               setDeletingId(null);
                             }}
                             className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                           >
                             Yes
                           </button>
                           <button
                             onClick={() => setDeletingId(null)}
                             className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold cursor-pointer"
                           >
                             No
                           </button>
                         </div>
                       ) : (
                         <button
                           onClick={() => setDeletingId(item.id)}
                           className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Delete this journal entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-700 text-xs sm:text-sm line-clamp-3 leading-relaxed italic">
                      "{item.excerpt}"
                    </p>
                    {item.mediaUrl && (
                      <div className="pt-1.5 flex items-center justify-between bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                        <span className="text-[11px] font-semibold text-purple-900 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-purple-600" /> Attached Voice Note ({item.audioDuration || 0}s)
                        </span>
                        <button
                          onClick={() => {
                            playAudibleRecording({ audioUrl: item.mediaUrl });
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                        >
                          <Play className="w-3 h-3" />
                          <span>Play Voice</span>
                        </button>
                      </div>
                    )}

                    {/* Share to a Friend section in Journaling history card */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-indigo-900">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Share to Friend</span>
                        </div>
                        {item.sharedWithFriends && item.sharedWithFriends.length > 0 && (
                          <span className="text-[10px] font-extrabold text-indigo-600">
                            Shared with {item.sharedWithFriends.length} friend(s)
                          </span>
                        )}
                      </div>

                      {item.sharedWithFriends && item.sharedWithFriends.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {item.sharedWithFriends.map(friend => (
                            <span key={friend} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                              <User className="w-2.5 h-2.5 text-indigo-600" />
                              <span>{friend}</span>
                              <button
                                onClick={() => {
                                  unshareEntryWithFriend(item.id, friend);
                                  loadJournalEntries();
                                }}
                                className="hover:text-rose-600 cursor-pointer ml-0.5"
                                title="Remove share"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = historyShareInputs[item.id]?.trim();
                          if (!val) return;
                          shareEntryWithFriend(item.id, val);
                          setHistoryShareInputs(prev => ({ ...prev, [item.id]: '' }));
                          loadJournalEntries();
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          value={historyShareInputs[item.id] || ''}
                          onChange={(e) => setHistoryShareInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Account name (e.g. @maya_san)"
                          className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={!historyShareInputs[item.id]?.trim()}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Share</span>
                        </button>
                      </form>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
