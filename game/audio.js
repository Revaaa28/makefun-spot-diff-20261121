// audio.js — every sound is synthesized with WebAudio: no audio files, no
// network. The context is created on the first user gesture (browsers refuse
// audio before one) and every effect is a short envelope of oscillators.

const audioState = {
  context: null,
  muted: false,
};

function audioEnsure() {
  if (audioState.context) {
    if (audioState.context.state === 'suspended') audioState.context.resume();
    return audioState.context;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  audioState.context = new Ctor();
  return audioState.context;
}

function audioTone(frequency, startAt, duration, type, volume) {
  const ctx = audioEnsure();
  if (!ctx || audioState.muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

// Two-note chime: the satisfying "found it" sound.
function playFindSound() {
  audioTone(659.25, 0, 0.22, 'sine', 0.22);
  audioTone(987.77, 0.09, 0.35, 'sine', 0.22);
}

// Low buzz for a wrong click.
function playMissSound() {
  audioTone(160, 0, 0.18, 'sawtooth', 0.1);
  audioTone(110, 0.05, 0.22, 'sawtooth', 0.08);
}

// Rising sparkle when a hint is spent.
function playHintSound() {
  audioTone(880, 0, 0.15, 'triangle', 0.14);
  audioTone(1174.66, 0.08, 0.15, 'triangle', 0.14);
  audioTone(1567.98, 0.16, 0.25, 'triangle', 0.14);
}

// Little arpeggio for clearing a scene.
function playWinSound() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((note, i) => audioTone(note, i * 0.11, 0.32, 'triangle', 0.18));
}

// Single soft tick when the clock is nearly out.
function playTickSound() {
  audioTone(1200, 0, 0.05, 'square', 0.05);
}

// Quiet click for buttons.
function playClickSound() {
  audioTone(440, 0, 0.06, 'sine', 0.08);
}

function audioSetMuted(muted) {
  audioState.muted = muted;
}

function audioIsMuted() {
  return audioState.muted;
}
