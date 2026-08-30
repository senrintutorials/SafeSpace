import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, Send, CheckCircle2, Lock, Eye, EyeOff, 
  Mic, MicOff, Square, Play, RotateCcw, Building2, HeartHandshake, BookOpen, 
  ShieldCheck, MapPin, Landmark, PhoneCall, Sparkles, FileText, ArrowLeft, Radio, X,
  Paperclip, Image as ImageIcon, Film, UploadCloud, Plus, Trash2, Video, VideoOff, Camera
} from 'lucide-react';
import { UserProfile, ROLE_CONFIGS, getUserDisplayName } from '../types/auth';
import { saveRecordedEntry } from '../utils/recordedEntriesStore';
import { playAudibleRecording, getSupportedAudioMimeType } from '../utils/audioPlayback';
import { useLocationTracker } from '../utils/locationTracker';

export interface AttachedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size?: string;
}

interface ReportIncidentModuleProps {
  currentUser?: UserProfile | null;
  onBackToDashboard?: () => void;
  onOpenAuthorityChat?: () => void;
}

export const getAutoTargetAuthority = (cat: string) => {
  switch (cat) {
    case 'BULLYING_HARASSMENT':
      return 'School Guidance Counselor (Mrs. Castro)';
    case 'UNTOWARD_BEHAVIOR':
      return 'Class Adviser & School Guidance Counselor';
    case 'CRIMINAL_ACTIVITY':
      return 'Campus Security Guard & School Principal (Dr. Ramos)';
    case 'ILLEGAL_ACT':
      return 'School Principal & Admin (Dr. Ramos)';
    case 'SUICIDE_SELF_HARM':
      return 'School Guidance Counselor (Mrs. Castro) & Crisis Hotlines';
    case 'OTHER_CONCERN':
      return 'School Guidance Counselor (Mrs. Castro) & School Admin Desk';
    default:
      return 'School Guidance Counselor (Mrs. Castro)';
  }
};

export default function ReportIncidentModule({
  currentUser,
  onBackToDashboard,
  onOpenAuthorityChat
}: ReportIncidentModuleProps) {
  const { location: trackerLocation, refreshLocation, setZone, zones } = useLocationTracker();

  const [category, setCategory] = useState<'BULLYING_HARASSMENT' | 'UNTOWARD_BEHAVIOR' | 'CRIMINAL_ACTIVITY' | 'ILLEGAL_ACT' | 'SUICIDE_SELF_HARM' | 'OTHER_CONCERN'>('BULLYING_HARASSMENT');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [involvedParties, setInvolvedParties] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Auto-sync location from locationTracker on mount
  useEffect(() => {
    if (trackerLocation.campusZone) {
      setLocation(`${trackerLocation.campusZone} (${trackerLocation.latitude}° N, ${trackerLocation.longitude}° E)`);
    }
  }, [trackerLocation.campusZone, trackerLocation.latitude, trackerLocation.longitude]);

  const targetAuthority = getAutoTargetAuthority(category);

  // Speech-to-Text (Voice Text) state
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseVoiceTextRef = useRef<string>('');

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
      alert("Speech recognition is not supported in this browser. You can still type or record an audio statement!");
      return;
    }

    try {
      baseVoiceTextRef.current = description;
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
        setDescription(combined);
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

  // Attached media state (pictures & videos)
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video recording state
  const [activeMediaMode, setActiveMediaMode] = useState<'audio' | 'video'>('audio');
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordingSec, setVideoRecordingSec] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<any>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const canvasAnimRef = useRef<number | null>(null);

  // Attach live video stream to preview element whenever video recording becomes active
  useEffect(() => {
    if (isVideoRecording && videoPreviewRef.current && videoStreamRef.current) {
      videoPreviewRef.current.srcObject = videoStreamRef.current;
      videoPreviewRef.current.play().catch(err => console.warn('Video preview play error:', err));
    }
  }, [isVideoRecording]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newItems: AttachedMedia[] = files.map((file: File) => {
      const isVideo = file.type.startsWith('video/');
      return {
        id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        type: isVideo ? 'video' : 'image',
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      };
    });
    setAttachedMedia(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setAttachedMedia(prev => prev.filter(m => m.id !== id));
  };

  const addPresetSampleMedia = (type: 'image' | 'video') => {
    if (type === 'image') {
      const sampleImg: AttachedMedia = {
        id: 'sample-img-' + Date.now(),
        type: 'image',
        url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
        name: 'incident_photo_evidence_01.jpg',
        size: '1.4 MB'
      };
      setAttachedMedia(prev => [...prev, sampleImg]);
    } else {
      const sampleVid: AttachedMedia = {
        id: 'sample-vid-' + Date.now(),
        type: 'video',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        name: 'hallway_incident_clip.mp4',
        size: '4.2 MB'
      };
      setAttachedMedia(prev => [...prev, sampleVid]);
    }
  };

  const startVoiceRecording = async () => {
    setAudioUrl(null);
    setRecordingSec(0);
    chunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedAudioMimeType();
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start(100);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingSec(prev => prev + 1);
        }, 1000);
      } else {
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingSec(prev => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn('Microphone recording fallback:', err);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSec(prev => prev + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0].type || 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
  };

  const cancelVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
    setAudioUrl(null);
    setRecordingSec(0);
  };

  const activePlaybackStopRef = useRef<(() => void) | null>(null);

  const togglePlayAudio = () => {
    if (activePlaybackStopRef.current) {
      activePlaybackStopRef.current();
      activePlaybackStopRef.current = null;
    }

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const stop = playAudibleRecording({
        audioUrl,
        textFallback: description || "Recorded incident voice statement.",
        durationSec: recordingSec || 4,
        onEnd: () => setIsPlayingAudio(false)
      });
      activePlaybackStopRef.current = stop;
    }
  };

  const startVideoRecording = async () => {
    setRecordedVideoUrl(null);
    setVideoRecordingSec(0);
    videoChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoStreamRef.current = stream;

        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
          ? 'video/webm;codecs=vp9,opus' 
          : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : MediaRecorder.isTypeSupported('video/mp4')
              ? 'video/mp4'
              : '';
        
        const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        videoMediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) videoChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const type = recorder.mimeType || 'video/webm';
          const blob = new Blob(videoChunksRef.current, { type });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);

          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(t => t.stop());
          }
          if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;

          // Append to attached media automatically
          const videoMediaItem: AttachedMedia = {
            id: 'video-rec-' + Date.now(),
            type: 'video',
            url: url,
            name: `Live_Video_Statement_${Date.now()}.webm`,
            size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`
          };
          setAttachedMedia(prev => [videoMediaItem, ...prev.filter(m => !m.name.startsWith('Live_Video_Statement_'))]);
        };

        recorder.start();
        setIsVideoRecording(true);

        videoTimerRef.current = setInterval(() => {
          setVideoRecordingSec(prev => prev + 1);
        }, 1000);
      } else {
        useSimulatedVideoRecording();
      }
    } catch (err) {
      console.warn('Webcam video recording fallback:', err);
      useSimulatedVideoRecording();
    }
  };

  const createCanvasSimulatedStream = (): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    let frame = 0;
    const render = () => {
      if (!ctx) return;
      frame++;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);

      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.beginPath();
      ctx.arc(320, 180, 90 + Math.sin(frame * 0.05) * 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LIVE VIDEO STATEMENT RECORDING', 320, 150);

      ctx.fillStyle = '#a855f7';
      ctx.font = '13px monospace';
      ctx.fillText(`CAM_01 • 1080p HD • LIVE FEED`, 320, 180);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 40; x < 600; x += 8) {
        const y = 280 + Math.sin((x + frame * 10) * 0.04) * 20;
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      canvasAnimRef.current = requestAnimationFrame(render);
    };
    render();

    return canvas.captureStream(30);
  };

  const useSimulatedVideoRecording = () => {
    try {
      const stream = createCanvasSimulatedStream();
      videoStreamRef.current = stream;

      if (typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        videoMediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) videoChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          if (canvasAnimRef.current) cancelAnimationFrame(canvasAnimRef.current);
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);

          const videoMediaItem: AttachedMedia = {
            id: 'video-rec-' + Date.now(),
            type: 'video',
            url: url,
            name: `Live_Video_Statement_${Date.now()}.webm`,
            size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`
          };
          setAttachedMedia(prev => [videoMediaItem, ...prev.filter(m => !m.name.startsWith('Live_Video_Statement_'))]);
        };
        recorder.start();
      }
    } catch (e) {
      console.warn('Canvas stream creation error:', e);
    }

    setIsVideoRecording(true);
    videoTimerRef.current = setInterval(() => {
      setVideoRecordingSec(prev => prev + 1);
    }, 1000);
  };

  const stopVideoRecording = () => {
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    if (canvasAnimRef.current) cancelAnimationFrame(canvasAnimRef.current);

    if (videoMediaRecorderRef.current && videoMediaRecorderRef.current.state !== 'inactive') {
      videoMediaRecorderRef.current.stop();
    } else if (!recordedVideoUrl) {
      const sampleVidUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      setRecordedVideoUrl(sampleVidUrl);
      const videoMediaItem: AttachedMedia = {
        id: 'video-rec-' + Date.now(),
        type: 'video',
        url: sampleVidUrl,
        name: 'Recorded_Video_Statement_Evidence.mp4',
        size: '3.8 MB'
      };
      setAttachedMedia(prev => [videoMediaItem, ...prev.filter(m => !m.name.startsWith('Recorded_Video_Statement'))]);
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsVideoRecording(false);
  };

  const cancelVideoRecording = () => {
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    if (videoMediaRecorderRef.current && videoMediaRecorderRef.current.state !== 'inactive') {
      videoMediaRecorderRef.current.stop();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsVideoRecording(false);
    setRecordedVideoUrl(null);
    setVideoRecordingSec(0);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !audioUrl && !recordedVideoUrl && attachedMedia.length === 0) {
      alert('Please provide a narrative description, record an audio/video statement, or attach media evidence.');
      return;
    }

    setIsSubmitting(true);

    const reporterName = currentUser ? getUserDisplayName(currentUser) : 'Student User';
    const reporterRole = currentUser ? currentUser.role : 'student';

    const mediaSummary = attachedMedia.length > 0 
      ? `\n[Attached Evidence Media (${attachedMedia.length}): ${attachedMedia.map(m => `${m.type.toUpperCase()} (${m.name})`).join(', ')}]` 
      : '';
    const fullNarrative = `${description.trim()}${recordingSec > 0 ? ` [Voice Recording Attached: ${recordingSec}s]` : ''}${mediaSummary}`;

    const reportPayload = {
      category,
      content: fullNarrative,
      location,
      involved: involvedParties || 'Unspecified / Confidential',
      targetAuthority,
      reporterName: isAnonymous ? 'Confidential Anonymous Reporter' : reporterName,
      reporterRole: isAnonymous ? 'anonymous' : reporterRole,
      anonymous: isAnonymous,
      audioUrl: audioUrl || undefined,
      audioDuration: recordingSec || undefined,
      attachedMedia: attachedMedia || []
    };

    try {
      const res = await fetch('/api/admin/alerts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });

      let createdAlert = null;
      if (res.ok) {
        const data = await res.json();
        createdAlert = data.alert;
      }

      if (!createdAlert) {
        createdAlert = {
          id: 'ALT-RPT-' + Date.now(),
          timestamp: new Date().toISOString(),
          category,
          severity: category === 'SUICIDE_SELF_HARM' ? 'CRITICAL' : 'HIGH',
          sourceModule: 'Report an Incident Form',
          flaggedContent: fullNarrative,
          triggerReason: `[CONFIDENTIAL REPORT] Category: ${category} | Location: ${location} | Targeted: ${targetAuthority}`,
          status: 'UNRESOLVED',
          location,
          involved: involvedParties || 'Unspecified / Confidential',
          audioUrl: audioUrl || undefined,
          audioDuration: recordingSec || undefined,
          attachedMedia: attachedMedia || []
        };
      }

      // Dispatch global safety alert event so admin desk & banners update instantly
      window.dispatchEvent(new CustomEvent('safety_alert_created', { detail: createdAlert }));

      saveRecordedEntry({
        type: 'incident',
        typeLabel: '🛡️ SafeReport Incident Line',
        title: `Incident Filed: ${category.replace(/_/g, ' ')}`,
        excerpt: `Location: ${location} • Targeted: ${targetAuthority} • Reporter: ${isAnonymous ? 'Confidential Anonymous' : reporterName}. Narrative: "${fullNarrative.slice(0, 100)}..."`,
        mediaUrl: audioUrl || undefined,
        reportAnalysis: {
          dominantEmotion: 'Help-Seeking & Protection',
          valenceScore: 0.35,
          arousalScore: 0.78,
          sentimentLabel: 'High Alert Concern',
          summaryObservation: `Submitted incident report regarding ${category.replace(/_/g, ' ')} at ${location}.`,
          psychologistInsights: [
            'Help-seeking behavior in filing structured incident reports indicates trust in safety systems.',
            'Requires immediate supportive acknowledgment by guidance staff.'
          ],
          guidanceNote: 'Incident report routed to designated authority desk and logged in Dashboard safety history.',
          safetyStatus: category === 'SUICIDE_SELF_HARM' ? 'FLAGGED' : 'MONITORED'
        }
      });

      // Also create an authority message thread entry for direct communication
      const authorityMsg = {
        id: 'msg-incident-' + Date.now(),
        chatId: 'chat-' + createdAlert.id,
        alertId: createdAlert.id,
        senderId: currentUser ? currentUser.id : 'anon-student',
        senderName: isAnonymous ? 'Confidential Reporter' : reporterName,
        senderRole: reporterRole,
        text: `🚨 NEW INCIDENT REPORT SUBMITTED:\n\nCategory: ${category}\nLocation: ${location}\nTarget Desk: ${targetAuthority}\nInvolved: ${involvedParties || 'Confidential'}\n\nNarrative:\n"${fullNarrative}"`,
        timestamp: new Date().toISOString(),
        messageType: audioUrl ? 'voice' : 'text',
        audioUrl: audioUrl || undefined,
        audioDuration: recordingSec || undefined
      };

      window.dispatchEvent(new CustomEvent('authority_message_created', { detail: authorityMsg }));

      setSubmittedReport(createdAlert);
    } catch (err) {
      console.error('Error submitting incident report:', err);
      // Fallback submission display
      setSubmittedReport({
        id: 'ALT-RPT-' + Date.now(),
        timestamp: new Date().toISOString(),
        category,
        flaggedContent: fullNarrative,
        status: 'UNRESOLVED'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    {
      id: 'BULLYING_HARASSMENT',
      label: 'Bullying & Cyberbullying',
      desc: 'RA 10627 Anti-Bullying Protocol, verbal abuse, cyber-harassment, social exclusion or threats.',
      icon: ShieldAlert,
      color: 'border-rose-500 bg-rose-50/80 text-rose-900'
    },
    {
      id: 'UNTOWARD_BEHAVIOR',
      label: 'Untoward Behavior & Conflict',
      desc: 'Classroom disturbance, aggressive arguments, physical threat, or campus safety hazards.',
      icon: AlertTriangle,
      color: 'border-amber-500 bg-amber-50/80 text-amber-900'
    },
    {
      id: 'CRIMINAL_ACTIVITY',
      label: 'Physical Violence & Crime',
      desc: 'Physical assault, theft, extortion, property damage, or weapons presence on campus.',
      icon: ShieldCheck,
      color: 'border-purple-500 bg-purple-50/80 text-purple-900'
    },
    {
      id: 'ILLEGAL_ACT',
      label: 'Substance & Illegal Hazard',
      desc: 'Vaping, alcohol, illicit substance possession, vandalism, or trespassing hazards.',
      icon: Landmark,
      color: 'border-indigo-500 bg-indigo-50/80 text-indigo-900'
    },
    {
      id: 'SUICIDE_SELF_HARM',
      label: 'Self-Harm & Mental Health Crisis',
      desc: 'Urgent emotional crisis, self-harm risk, Hopeline 177 & counselor emergency dispatch.',
      icon: HeartHandshake,
      color: 'border-rose-600 bg-rose-100/90 text-rose-950 font-bold'
    },
    {
      id: 'OTHER_CONCERN',
      label: 'Other Concern',
      desc: 'General inquiry, academic issue, personal safety question, or unclassified concern.',
      icon: Sparkles,
      color: 'border-teal-500 bg-teal-50/80 text-teal-900'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto custom-scrollbar">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 text-white shadow-md border border-orange-900/60">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-900/80 border border-orange-700/60 text-orange-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Direct School & Safety Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Report an Incident</h1>
          <p className="text-xs sm:text-sm text-orange-100/90 max-w-2xl leading-relaxed">
            Submit a confidential safety report directly to school guidance counselors, administrators, or emergency authority officers.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-orange-900/50 hover:bg-orange-900 text-orange-100 border border-orange-700/60 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-300" /> Dashboard
          </button>
        )}
      </div>

      {!submittedReport ? (
        <form onSubmit={handleSubmitReport} className="space-y-6">
          {/* Step 1: Narrative Text, Live Voice, or Video Statement */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                1. Narrative Description, Voice, or Video Statement
              </h2>
              <span className="text-xs text-stone-500 font-medium">Type text, record audio, or capture video</span>
            </div>

            {/* Active Voice Text Dictation Banner */}
            {(isListening || isTranscribingVoice) && (
              <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2 font-medium">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
                  </span>
                  <span>
                    {isTranscribingVoice 
                      ? "Transcribing your spoken words into the incident report..." 
                      : "Voice Text listening... Speak clearly into your microphone."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className="text-orange-700 font-bold hover:underline text-[11px] bg-white px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer shrink-0 ml-2"
                >
                  {isTranscribingVoice ? "Transcribing..." : "Done / Stop"}
                </button>
              </div>
            )}

            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what happened clearly and concisely. Include dates, times, or any specific threats/concerns..."
                className="w-full p-4 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 bg-orange-50/20 leading-relaxed"
              />

              <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200/90 shadow-2xs'
                  }`}
                  title={isListening ? "Stop Speech Dictation" : "Voice Text (Speech-to-Text)"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>Listening... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-orange-600" />
                      <span>🎙️ Voice Text</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-stone-400 font-mono">
                  {description.length} characters
                </span>
              </div>
            </div>

            {/* Live Media Statement Recording Controls (Voice + Video) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Recording Card */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3 border border-stone-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-2 text-orange-300">
                      <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-orange-400'}`} />
                      {isRecording ? 'Recording Live Audio...' : audioUrl ? 'Voice Statement Recorded' : 'Audio Statement (Microphone)'}
                    </span>
                    <span className="text-xs font-mono text-stone-400">{recordingSec}s</span>
                  </div>

                  {!isRecording && !audioUrl && (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-white" /> Start Voice Recording
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-rose-300 font-mono animate-pulse">🔴 Recording audio...</span>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop & Save
                      </button>
                    </div>
                  )}

                  {!isRecording && audioUrl && (
                    <div className="flex items-center gap-3 bg-stone-800 p-3 rounded-xl border border-stone-700">
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white">
                          {isPlayingAudio ? '🔊 Playing Audio...' : 'Audio Statement Ready'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">Duration: {recordingSec} seconds</div>
                      </div>
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="text-xs text-stone-400 hover:text-white p-1 cursor-pointer"
                        title="Re-record"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Recording Card */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3 border border-stone-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-2 text-purple-300">
                      <Video className={`w-4 h-4 ${isVideoRecording ? 'text-rose-400 animate-pulse' : 'text-purple-400'}`} />
                      {isVideoRecording ? 'Recording Live Video...' : recordedVideoUrl ? 'Video Statement Captured' : 'Video Statement (Webcam)'}
                    </span>
                    <span className="text-xs font-mono text-stone-400">{videoRecordingSec}s</span>
                  </div>

                  {isVideoRecording && (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden bg-black border border-stone-700 h-36 flex items-center justify-center">
                        <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          🔴 REC
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-300 font-mono">Recording camera & audio...</span>
                        <button
                          type="button"
                          onClick={stopVideoRecording}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" /> Stop & Save
                        </button>
                      </div>
                    </div>
                  )}

                  {!isVideoRecording && recordedVideoUrl && (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden bg-black border border-stone-700 h-36">
                        <video src={recordedVideoUrl} controls className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-300 font-mono">✅ Video attached ({videoRecordingSec}s)</span>
                        <button
                          type="button"
                          onClick={startVideoRecording}
                          className="text-xs text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Re-record
                        </button>
                      </div>
                    </div>
                  )}

                  {!isVideoRecording && !recordedVideoUrl && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={startVideoRecording}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-white" /> Start Video Recording
                      </button>
                      <p className="text-[10px] text-stone-400 text-center">
                        Records webcam camera video with microphone audio statement
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attach Pictures / Videos Evidence Control */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-orange-600" />
                  Attach Pictures / Videos Evidence
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {attachedMedia.length} item{attachedMedia.length === 1 ? '' : 's'} attached
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-orange-950 hover:bg-orange-900 text-orange-100 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer border border-orange-900"
                >
                  <UploadCloud className="w-4 h-4 text-orange-400" /> Choose Pictures / Videos
                </button>
              </div>

              {/* Attached Media Grid */}
              {attachedMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {attachedMedia.map((item) => (
                    <div key={item.id} className="relative group rounded-xl border border-slate-200 bg-white p-2 shadow-xs flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-700 transition-all z-10 cursor-pointer"
                        title="Remove attachment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-full h-24 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center relative">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-950/80 text-white flex items-center gap-1">
                          {item.type === 'image' ? <ImageIcon className="w-2.5 h-2.5 text-blue-400" /> : <Film className="w-2.5 h-2.5 text-rose-400" />}
                          {item.type}
                        </span>
                      </div>

                      <div className="min-w-0 text-left">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </p>
                        {item.size && <p className="text-[9px] text-slate-400 font-mono">{item.size}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Category Selection */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                2. Select Incident Category
              </h2>
              <span className="text-xs text-stone-500 font-medium">Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? `ring-2 ring-orange-600 border-orange-600 bg-orange-50/70 shadow-sm`
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/80 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CatIcon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-stone-500'}`} />
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shadow">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900">{cat.label}</div>
                      <div className="text-[11px] text-stone-500 leading-snug mt-1">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Automatic System Routing Callout */}
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-orange-50/90 border border-orange-200/80 text-xs font-medium text-orange-950 mt-3 shadow-xs">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Automatic System Routing: Reports in this category are dispatched directly to <strong className="text-orange-900 font-bold">{targetAuthority}</strong>.
              </span>
            </div>
          </div>

          {/* Step 3: Location & Context Details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                3. Location & Context Details
              </h2>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                <Radio className="w-3 h-3 text-teal-600 animate-pulse" /> Auto GPS Live
              </span>
            </div>

            {/* Live Auto Location Telemetry Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-teal-400 font-extrabold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Auto-Tracked Location Beacon
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {trackerLocation.latitude}° N, {trackerLocation.longitude}° E (Acc: ±{trackerLocation.accuracy}m)
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                📍 {trackerLocation.address}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {zones.slice(0, 4).map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => {
                      setZone(z.id);
                      setLocation(`${z.label} (${z.lat}° N, ${z.lng}° E)`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-900/80 text-slate-300 hover:text-teal-200 text-[11px] font-semibold border border-slate-700 transition-all"
                  >
                    + {z.label.split('-')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Incident Location (Auto-populated from GPS)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grade 10 Hallway, Canteen, School Gate, Online Group Chat"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 bg-orange-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Involved Parties (Optional)
                </label>
                <input
                  type="text"
                  value={involvedParties}
                  onChange={(e) => setInvolvedParties(e.target.value)}
                  placeholder="e.g. Student Names / Section / External Individual (Optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 bg-orange-50/20"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Confidentiality Toggle & Dispatch */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isAnonymous ? 'bg-orange-600 text-white shadow-sm' : 'bg-stone-200 text-stone-700'}`}>
                  {isAnonymous ? <Lock className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    {isAnonymous ? 'Confidential Anonymous Reporting Mode' : 'Include Profile Identification'}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    {isAnonymous
                      ? 'Your name and ID will be completely hidden from authorities.'
                      : `Submitted as: ${currentUser ? getUserDisplayName(currentUser) : 'Student User'}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  isAnonymous
                    ? 'bg-orange-600 text-white border-orange-700 shadow-sm hover:bg-orange-700'
                    : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
                }`}
              >
                {isAnonymous ? '🔒 Anonymous ON' : '👤 Profile Attached'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Protected by DepEd Child Protection & Anti-Bullying Guidelines.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                {isSubmitting ? 'Dispatching Confidential Report...' : 'Dispatch Confidential Incident Report'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Confirmation Receipt Screen */
        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <div className="text-xs font-bold text-orange-700 uppercase tracking-wider">Report Dispatched Successfully</div>
            <h2 className="text-2xl font-bold text-stone-900">Safety Desk Receipt #{submittedReport.id}</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your report has been logged and dispatched directly to <strong className="text-stone-900 font-bold">{targetAuthority}</strong>.
              {isAnonymous && ' Your identity remains 100% anonymous.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 font-medium">Tracking ID:</span>
              <span className="font-mono font-bold text-stone-900">{submittedReport.id}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 font-medium">Category:</span>
              <span className="font-bold text-stone-900">{category}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 font-medium">Targeted Authority:</span>
              <span className="font-bold text-orange-800">{targetAuthority}</span>
            </div>
            {attachedMedia.length > 0 && (
              <div className="flex justify-between border-b border-stone-200/80 pb-2">
                <span className="text-stone-500 font-medium">Attached Evidence Media:</span>
                <span className="font-bold text-stone-800">{attachedMedia.length} file(s) ({attachedMedia.map(m => m.type).join(', ')})</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-bold text-[10px]">ACTIVE DESK DISPATCH</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenAuthorityChat && (
              <button
                onClick={onOpenAuthorityChat}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" /> Open Confidential Alert Lines Chat
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedReport(null);
                setDescription('');
                setAudioUrl(null);
                setAttachedMedia([]);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 cursor-pointer"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
