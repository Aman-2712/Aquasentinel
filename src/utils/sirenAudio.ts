/**
 * Web Audio API Emergency Siren Audio Synthesizer
 * Generates an authentic, piercing dual-tone disaster warning siren in the browser
 * with automatic 2-second duration auto-cutoff.
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let lfoOscillator: OscillatorNode | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let sirenTimer: NodeJS.Timeout | null = null;

/**
 * Ensures AudioContext is unmuted/unlocked on modern browsers requiring user gesture
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
 * Plays the emergency siren for a specified duration (defaults to exactly 2000ms / 2 seconds)
 * and then automatically shuts off.
 */
export function playEmergencySirenAudio(durationMs: number = 2000): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear any pending stop timers
    if (sirenTimer) {
      clearTimeout(sirenTimer);
      sirenTimer = null;
    }

    // Stop existing oscillators cleanly without closing context
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

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Master volume gain with fast attack and high clarity
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.exponentialRampToValueAtTime(0.40, now + 0.08);

    // Primary High-Pitch Warning Oscillator (Sawtooth tone)
    sirenOscillator1 = audioCtx.createOscillator();
    sirenOscillator1.type = 'sawtooth';
    sirenOscillator1.frequency.setValueAtTime(760, now);

    // Secondary Harmonics Oscillator (Square tone with slight detune)
    sirenOscillator2 = audioCtx.createOscillator();
    sirenOscillator2.type = 'triangle';
    sirenOscillator2.frequency.setValueAtTime(768, now);

    // Low Frequency Oscillator (LFO) for rapid siren rise & fall pitch modulation (1.5 Hz = punchy 2-second alert)
    lfoOscillator = audioCtx.createOscillator();
    lfoOscillator.frequency.setValueAtTime(1.5, now);

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(250, now); // Sweep between 510Hz and 1010Hz

    // Connect LFO to modulate oscillator frequencies
    lfoOscillator.connect(lfoGain);
    lfoGain.connect(sirenOscillator1.frequency);
    lfoGain.connect(sirenOscillator2.frequency);

    // Lowpass filter for acoustic punch
    const biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.setValueAtTime(3000, now);

    sirenOscillator1.connect(biquadFilter);
    sirenOscillator2.connect(biquadFilter);
    biquadFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Start audio generators
    sirenOscillator1.start(now);
    sirenOscillator2.start(now);
    lfoOscillator.start(now);
    isPlaying = true;

    // AUTOMATIC SHUTOFF: Stop precisely after durationMs (default 2 seconds)
    sirenTimer = setTimeout(() => {
      stopEmergencySirenAudio();
    }, durationMs);

  } catch (err) {
    console.warn('Unable to initialize Web Audio emergency siren:', err);
  }
}

export function stopEmergencySirenAudio(): void {
  if (sirenTimer) {
    clearTimeout(sirenTimer);
    sirenTimer = null;
  }

  if (!isPlaying && !sirenOscillator1) return;

  try {
    if (masterGain && audioCtx && audioCtx.state !== 'closed') {
      const now = audioCtx.currentTime;
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
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
    }, 120);
  } catch (err) {
    console.warn('Error stopping emergency siren:', err);
    isPlaying = false;
  }
}

export function getIsSirenAudioPlaying(): boolean {
  return isPlaying;
}
