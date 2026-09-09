/**
 * Web Audio API Emergency Siren Audio Synthesizer
 * Generates an authentic, piercing dual-tone disaster warning siren in the browser
 * without relying on external MP3 audio asset files.
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let lfoOscillator: OscillatorNode | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;

export function playEmergencySirenAudio(): void {
  if (typeof window === 'undefined') return;

  try {
    // Stop any existing instance
    stopEmergencySirenAudio();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Master volume gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 0.5);

    // Primary High-Pitch Warning Oscillator (Sawtooth tone)
    sirenOscillator1 = audioCtx.createOscillator();
    sirenOscillator1.type = 'sawtooth';
    sirenOscillator1.frequency.setValueAtTime(750, audioCtx.currentTime);

    // Secondary Harmonics Oscillator (Square tone with slight detune)
    sirenOscillator2 = audioCtx.createOscillator();
    sirenOscillator2.type = 'triangle';
    sirenOscillator2.frequency.setValueAtTime(756, audioCtx.currentTime);

    // Low Frequency Oscillator (LFO) for smooth siren rise & fall pitch modulation (0.35 Hz = ~2.8s cycle)
    lfoOscillator = audioCtx.createOscillator();
    lfoOscillator.frequency.setValueAtTime(0.35, audioCtx.currentTime);

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(220, audioCtx.currentTime); // Pitch sweep range: 750 +/- 220Hz (530Hz to 970Hz)

    // Connect LFO to modulate oscillator frequencies
    lfoOscillator.connect(lfoGain);
    lfoGain.connect(sirenOscillator1.frequency);
    lfoGain.connect(sirenOscillator2.frequency);

    // Filter to warm up tone and reduce harshness
    const biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.setValueAtTime(2400, audioCtx.currentTime);

    sirenOscillator1.connect(biquadFilter);
    sirenOscillator2.connect(biquadFilter);
    biquadFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Start audio generators
    sirenOscillator1.start();
    sirenOscillator2.start();
    lfoOscillator.start();
    isPlaying = true;
  } catch (err) {
    console.warn('Unable to initialize Web Audio emergency siren:', err);
  }
}

export function stopEmergencySirenAudio(): void {
  if (!isPlaying && !audioCtx) return;

  try {
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
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
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
      }
      isPlaying = false;
    }, 350);
  } catch (err) {
    console.warn('Error stopping emergency siren:', err);
    isPlaying = false;
  }
}

export function getIsSirenAudioPlaying(): boolean {
  return isPlaying;
}
