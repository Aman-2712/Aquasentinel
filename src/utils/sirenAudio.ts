/**
 * AquaSentinel Emergency Siren Audio Synthesizer
 * Direct Web Audio API Dual-Tone Emergency Siren with 2.0-Second Auto-Cutoff
 */

let globalAudioCtx: AudioContext | null = null;
let currentSirenSession: {
  stop: () => void;
  timer: NodeJS.Timeout;
} | null = null;

// Get or create active AudioContext
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    globalAudioCtx = new AudioContextClass();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

/**
 * Automatically unlocks audio context on any user interaction
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('click', unlock, { once: false, passive: true });
  window.addEventListener('keydown', unlock, { once: false, passive: true });
  window.addEventListener('touchstart', unlock, { once: false, passive: true });
}

/**
 * Immediately stops any currently playing emergency siren
 */
export function stopEmergencySirenAudio(): void {
  if (currentSirenSession) {
    try {
      clearTimeout(currentSirenSession.timer);
      currentSirenSession.stop();
    } catch (e) {}
    currentSirenSession = null;
  }
}

/**
 * Plays an unmistakable, piercing dual-tone disaster warning siren
 * for precisely durationMs (defaults to 2000ms / 2.0 seconds) and automatically shuts off.
 */
export function playEmergencySirenAudio(durationMs: number = 2000): void {
  if (typeof window === 'undefined') return;

  console.log(`🚨 [AQUASENTINEL SIREN] Blaring 2.0s Emergency Siren (${durationMs}ms)...`);

  // Stop any active previous siren session immediately
  stopEmergencySirenAudio();

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const durationSec = durationMs / 1000;

    // Gain node for clean, loud emergency envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.55, now + 0.05); // Piercing clear volume
    gainNode.gain.setValueAtTime(0.55, now + durationSec - 0.08);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + durationSec);

    // Primary High-Pitch Warning Oscillator (Sawtooth)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(750, now);

    // Secondary Harmonics Oscillator (Square)
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(758, now);

    // LFO Oscillator (1.5 Hz frequency modulation for rapid siren wail)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(1.5, now);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(260, now); // Modulates +/- 260Hz (490Hz to 1010Hz)

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Biquad filter for acoustic punch
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    const stopAudio = () => {
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        osc1.disconnect();
        osc2.disconnect();
        lfo.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };

    // Auto cutoff after durationMs
    const timer = setTimeout(() => {
      stopAudio();
      if (currentSirenSession?.timer === timer) {
        currentSirenSession = null;
      }
    }, durationMs);

    currentSirenSession = {
      stop: stopAudio,
      timer,
    };

  } catch (err) {
    console.warn('Error starting emergency siren audio:', err);
  }
}

export function getIsSirenAudioPlaying(): boolean {
  return currentSirenSession !== null;
}
