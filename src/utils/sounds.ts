// Simple synthesized sound effects using Web Audio API
// No audio files needed — generates tones programmatically

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported or blocked — fail silently
  }
}

/** Ascending two-tone chime for correct answer */
export function playCorrectSound() {
  playTone(523, 0.15, 'sine', 0.12); // C5
  setTimeout(() => playTone(659, 0.2, 'sine', 0.12), 100); // E5
}

/** Descending buzz for wrong answer */
export function playWrongSound() {
  playTone(220, 0.25, 'square', 0.08); // A3 buzzy
  setTimeout(() => playTone(165, 0.3, 'square', 0.08), 120); // E3
}

/** Quick hit impact sound */
export function playHitSound() {
  playTone(110, 0.12, 'sawtooth', 0.1);
}

/** Victory fanfare — ascending arpeggio */
export function playVictorySound() {
  playTone(523, 0.15, 'sine', 0.1); // C5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 120); // E5
  setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 240); // G5
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.12), 360); // C6
}

/** Defeat sound — descending */
export function playDefeatSound() {
  playTone(392, 0.2, 'sine', 0.1); // G4
  setTimeout(() => playTone(330, 0.2, 'sine', 0.1), 150); // E4
  setTimeout(() => playTone(262, 0.2, 'sine', 0.1), 300); // C4
  setTimeout(() => playTone(196, 0.4, 'sine', 0.08), 450); // G3
}

/** Collective bonus chime */
export function playBonusSound() {
  playTone(784, 0.1, 'sine', 0.1); // G5
  setTimeout(() => playTone(988, 0.1, 'sine', 0.1), 80); // B5
  setTimeout(() => playTone(1175, 0.2, 'sine', 0.12), 160); // D6
}
