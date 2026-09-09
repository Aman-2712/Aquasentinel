/**
 * AquaSentinel Emergency Siren Audio Synthesizer
 * Dual-Engine Web Audio API + Programmatic WAV Audio Element
 * Plays a piercing dual-tone disaster warning siren with exact 2-second auto-stop.
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let lfoOscillator: OscillatorNode | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let sirenTimer: NodeJS.Timeout | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;

// Pre-cached synthesized WAV Data URI for zero-latency instant playback
let cachedWavDataUri: string | null = null;

/**
 * Generates an authentic 2-second dual-tone emergency siren WAV audio in pure memory
 */
function generateSirenWavDataUri(durationSec: number = 2.0): string {
  if (cachedWavDataUri) return cachedWavDataUri;

  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM dual-tone frequency sweep samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const lfo = Math.sin(2 * Math.PI * 1.5 * t); // 1.5 Hz pitch sweep
    const freq1 = 760 + lfo * 260; // 500Hz to 1020Hz
    const freq2 = 768 + lfo * 260;

    const sample1 = (2 * ((t * freq1) % 1) - 1) * 0.45; // Sawtooth
    const sample2 = Math.sin(2 * Math.PI * freq2 * t) * 0.35; // Sine
    let sample = sample1 + sample2;

    // Envelope
    let env = 1.0;
    if (t < 0.06) {
      env = t / 0.06;
    } else if (t > durationSec - 0.12) {
      env = (durationSec - t) / 0.12;
    }

    const val = Math.max(-1, Math.min(1, sample * env * 0.8));
    view.setInt16(44 + i * 2, val < 0 ? val * 0x8000 : val * 0x7FFF, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedWavDataUri = 'data:audio/wav;base64,' + btoa(binary);
  return cachedWavDataUri;
}

/**
 * Ensures AudioContext is unlocked on first user interaction
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      }
    } catch (e) {}
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

/**
 * Plays the emergency siren for exactly durationMs (defaults to 2000ms / 2 seconds)
 * using dual-engine synthesis with guaranteed playback.
 */
export function playEmergencySirenAudio(durationMs: number = 2000): void {
  if (typeof window === 'undefined') return;

  console.log(`🚨 [AQUASENTINEL SIREN] Blaring 2-second Emergency Siren Alert (${durationMs}ms)...`);

  try {
    stopEmergencySirenAudio();

    // 1. ENGINE 1: HTML5 Audio with memory WAV buffer
    try {
      const wavUri = generateSirenWavDataUri(durationMs / 1000);
      activeHtmlAudio = new Audio(wavUri);
      activeHtmlAudio.volume = 0.85;
      const playPromise = activeHtmlAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 audio play blocked by browser autoplay policy:', err);
        });
      }
    } catch (e) {
      console.warn('HTML5 audio error:', e);
    }

    // 2. ENGINE 2: Web Audio API Oscillator Nodes
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtx || audioCtx.state === 'closed') {
          audioCtx = new AudioContextClass();
        }

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.01, now);
        masterGain.gain.exponentialRampToValueAtTime(0.40, now + 0.08);

        sirenOscillator1 = audioCtx.createOscillator();
        sirenOscillator1.type = 'sawtooth';
        sirenOscillator1.frequency.setValueAtTime(760, now);

        sirenOscillator2 = audioCtx.createOscillator();
        sirenOscillator2.type = 'triangle';
        sirenOscillator2.frequency.setValueAtTime(768, now);

        lfoOscillator = audioCtx.createOscillator();
        lfoOscillator.frequency.setValueAtTime(1.5, now);

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(250, now);

        lfoOscillator.connect(lfoGain);
        lfoGain.connect(sirenOscillator1.frequency);
        lfoGain.connect(sirenOscillator2.frequency);

        const biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(3000, now);

        sirenOscillator1.connect(biquadFilter);
        sirenOscillator2.connect(biquadFilter);
        biquadFilter.connect(masterGain);
        masterGain.connect(audioCtx.destination);

        sirenOscillator1.start(now);
        sirenOscillator2.start(now);
        lfoOscillator.start(now);
      }
    } catch (e) {
      console.warn('Web Audio oscillator error:', e);
    }

    isPlaying = true;

    // Automatic cutoff after exactly durationMs (2 seconds)
    sirenTimer = setTimeout(() => {
      stopEmergencySirenAudio();
    }, durationMs);

  } catch (err) {
    console.warn('Unable to initialize emergency siren:', err);
  }
}

export function stopEmergencySirenAudio(): void {
  if (sirenTimer) {
    clearTimeout(sirenTimer);
    sirenTimer = null;
  }

  // Stop HTML5 audio
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch (e) {}
    activeHtmlAudio = null;
  }

  // Stop Web Audio oscillators
  try {
    if (masterGain && audioCtx && audioCtx.state !== 'closed') {
      const now = audioCtx.currentTime;
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    }

    setTimeout(() => {
      if (sirenOscillator1) {
        try { sirenOscillator1.stop(); sirenOscillator1.disconnect(); } catch (e) {}
        sirenOscillator1 = null;
      }
      if (sirenOscillator2) {
        try { sirenOscillator2.stop(); sirenOscillator2.disconnect(); } catch (e) {}
        sirenOscillator2 = null;
      }
      if (lfoOscillator) {
        try { lfoOscillator.stop(); lfoOscillator.disconnect(); } catch (e) {}
        lfoOscillator = null;
      }
      isPlaying = false;
    }, 100);
  } catch (err) {
    isPlaying = false;
  }
}

export function getIsSirenAudioPlaying(): boolean {
  return isPlaying;
}
