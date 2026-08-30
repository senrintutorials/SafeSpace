// Web Audio API Synthesizer for Soothing Relaxing Instrumental & Nature Sounds
export type SoundType = 'none' | 'ocean' | 'waterfall' | 'crickets' | 'birds' | 'instrumental' | 'rain';

export interface SoundOption {
  id: SoundType;
  name: string;
  icon: string;
  description: string;
  category: 'nature' | 'music';
}

export const SOOTHING_SOUND_OPTIONS: SoundOption[] = [
  { id: 'none', name: 'Mute Sound', icon: '🔇', description: 'Silent focus', category: 'nature' },
  { id: 'ocean', name: 'Sea & Ocean Waves', icon: '🌊', description: 'Rhythmic rolling ocean surf', category: 'nature' },
  { id: 'waterfall', name: 'Cascading Waterfall', icon: '💧', description: 'Continuous rushing freshwater stream', category: 'nature' },
  { id: 'crickets', name: 'Night Crickets', icon: '🌙', description: 'Peaceful evening chirping in meadow', category: 'nature' },
  { id: 'birds', name: 'Forest Birds', icon: '🌲', description: 'Gentle morning woodland birdsong', category: 'nature' },
  { id: 'rain', name: 'Gentle Rain Shower', icon: '🌧️', description: 'Soft raindrops falling on leaves', category: 'nature' },
  { id: 'instrumental', name: 'Cosmic Ambient Music', icon: '🎹', description: 'Warm floating instrumental pad chords', category: 'music' }
];

let audioCtx: AudioContext | null = null;
let currentSound: SoundType = 'none';
let masterGain: GainNode | null = null;
let activeLoopCleanup: (() => void) | null = null;
let currentVolume = 0.5;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoothingVolume(volume: number) {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(currentVolume, audioCtx.currentTime, 0.05);
  }
}

export function getCurrentSoundId(): SoundType {
  return currentSound;
}

export function stopSoothingSound() {
  if (activeLoopCleanup) {
    try {
      activeLoopCleanup();
    } catch {
      // ignore
    }
    activeLoopCleanup = null;
  }
  if (masterGain && audioCtx) {
    try {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    } catch {
      // ignore
    }
  }
  currentSound = 'none';
}

export function playSoothingSound(soundId: SoundType, volume: number = currentVolume) {
  stopSoothingSound();
  if (soundId === 'none') return;

  const ctx = getAudioContext();
  currentSound = soundId;
  currentVolume = volume;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), ctx.currentTime + 0.5);
  masterGain.connect(ctx.destination);

  if (soundId === 'ocean') {
    activeLoopCleanup = startOceanWaves(ctx, masterGain);
  } else if (soundId === 'waterfall') {
    activeLoopCleanup = startWaterfall(ctx, masterGain);
  } else if (soundId === 'crickets') {
    activeLoopCleanup = startCrickets(ctx, masterGain);
  } else if (soundId === 'birds') {
    activeLoopCleanup = startBirds(ctx, masterGain);
  } else if (soundId === 'rain') {
    activeLoopCleanup = startRain(ctx, masterGain);
  } else if (soundId === 'instrumental') {
    activeLoopCleanup = startInstrumentalPad(ctx, masterGain);
  }
}

// 1. Ocean Waves Generator
function startOceanWaves(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11;
    b6 = white * 0.115926;
  }

  const whiteSource = ctx.createBufferSource();
  whiteSource.buffer = noiseBuffer;
  whiteSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 350;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.12; // 8-second wave cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 280;

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const waveGain = ctx.createGain();
  waveGain.gain.value = 0.7;

  whiteSource.connect(filter);
  filter.connect(waveGain);
  waveGain.connect(destination);

  whiteSource.start();
  lfo.start();

  return () => {
    try {
      whiteSource.stop();
      lfo.stop();
      whiteSource.disconnect();
      filter.disconnect();
      lfo.disconnect();
    } catch {
      // ignore
    }
  };
}

// 2. Waterfall Generator
function startWaterfall(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 850;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 500;
  bandpass.Q.value = 0.8;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.5;

  source.connect(lowpass);
  lowpass.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(destination);

  source.start();

  return () => {
    try {
      source.stop();
      source.disconnect();
      lowpass.disconnect();
      bandpass.disconnect();
    } catch {
      // ignore
    }
  };
}

// 3. Night Crickets Generator
function startCrickets(ctx: AudioContext, destination: GainNode) {
  let isStopped = false;
  let timerId: NodeJS.Timeout | null = null;

  function chirp() {
    if (isStopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(4600 + Math.random() * 200, ctx.currentTime);

    filter.type = 'bandpass';
    filter.frequency.value = 4600;
    filter.Q.value = 8;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    // Pulse 3 rapid chirps
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.04;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.035);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.15);

    const nextInterval = 400 + Math.random() * 900;
    timerId = setTimeout(chirp, nextInterval);
  }

  chirp();

  return () => {
    isStopped = true;
    if (timerId) clearTimeout(timerId);
  };
}

// 4. Forest Birds Generator
function startBirds(ctx: AudioContext, destination: GainNode) {
  let isStopped = false;
  let timerId: NodeJS.Timeout | null = null;

  function birdCall() {
    if (isStopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 1200;
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.3 + Math.random() * 0.4), now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.25);

    const nextIn = 1500 + Math.random() * 3500;
    timerId = setTimeout(birdCall, nextIn);
  }

  birdCall();

  return () => {
    isStopped = true;
    if (timerId) clearTimeout(timerId);
  };
}

// 5. Gentle Rain Shower Generator
function startRain(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1400;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 400;

  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.45;

  source.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(rainGain);
  rainGain.connect(destination);

  source.start();

  return () => {
    try {
      source.stop();
      source.disconnect();
      lowpass.disconnect();
      highpass.disconnect();
    } catch {
      // ignore
    }
  };
}

// 6. Cosmic Ambient Instrumental Pad
function startInstrumentalPad(ctx: AudioContext, destination: GainNode) {
  // F maj7 chord (F3, C4, E4, A4, C5)
  const freqs = [174.61, 261.63, 329.63, 440.00, 523.25];
  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 450;

  // LFO for gentle sweeping resonance
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;

  lfo.connect(lfoGain);
  lfoGain.connect(padFilter.frequency);
  lfo.start();

  const now = ctx.currentTime;

  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = f;

    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.12, now + 2.5);

    osc.connect(g);
    g.connect(padFilter);

    osc.start(now);
    oscs.push(osc);
    gains.push(g);
  });

  padFilter.connect(destination);

  return () => {
    try {
      lfo.stop();
      oscs.forEach(o => {
        try { o.stop(); o.disconnect(); } catch { /* ignore */ }
      });
      padFilter.disconnect();
    } catch {
      // ignore
    }
  };
}
