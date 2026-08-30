export function VideoEngine() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera. Please allow permissions.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    setVideoUrl(null);
    setResults(null);
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
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

  const handleAnalyze = async () => {
    if (!videoUrl) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      await new Promise((resolve) => {
        video.onloadeddata = () => resolve(true);
      });
      video.currentTime = Math.min(1, video.duration / 2 || 1); 
      await new Promise((resolve) => {
        video.onseeked = () => resolve(true);
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             imageBase64: base64,
             mimeType: 'image/jpeg'
          })
        });

        if (!res.ok) {
           throw new Error('Analysis failed.');
        }
        const data = await res.json();
        setResults(data);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05080F]">
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-rose-400" />
          Video Logs
        </h2>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/5 rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-4">Live Camera</h3>
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative">
                 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                 {isRecording && (
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-medium text-white">Recording</span>
                   </div>
                 )}
              </div>
              <div className="mt-6">
                {!isRecording ? (
                  <button onClick={startRecording} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full transition-colors flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" /> Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-full transition-colors flex items-center gap-2">
                     <span className="w-3 h-3 rounded-sm bg-rose-500" /> Stop Recording
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-4">Playback & Analysis</h3>
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                {videoUrl ? (
                   <video src={videoUrl} controls playsInline className="w-full h-full object-contain" />
                ) : (
                   <div className="text-slate-500 flex flex-col items-center gap-2">
                     <Video className="w-8 h-8 opacity-50" />
                     <span className="text-sm">Record a video first</span>
                   </div>
                )}
              </div>
              <div className="mt-6 flex flex-col items-center gap-4 w-full">
                 <button 
                   onClick={handleAnalyze} 
                   disabled={!videoUrl || isAnalyzing}
                   className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                 >
                   {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                   {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
                 </button>
                 {error && <div className="text-rose-400 text-sm">{error}</div>}
              </div>
            </div>
          </div>

          {results && (
            <div className="bg-slate-900 border border-white/5 rounded-xl p-6">
               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-indigo-400" /> Analysis Results
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {Object.entries(results.emotions || {}).map(([emotion, value]: any) => (
                   <div key={emotion} className="bg-slate-950 rounded-lg p-4 border border-white/5">
                     <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{emotion}</div>
                     <div className="text-xl font-bold text-white">{(value * 100).toFixed(0)}%</div>
                   </div>
                 ))}
               </div>
               <div className="bg-slate-950 rounded-lg p-4 border border-white/5">
                 <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Detailed Analysis</div>
                 <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{results.summary}</p>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
