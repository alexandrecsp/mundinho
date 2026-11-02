const SEMITONES_FROM_A = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

/** 'A4' → 440 Hz. Accepts sharps and flats ('F#5', 'Bb3'); numbers pass through as Hz. */
export function toFrequency(note) {
  if (typeof note === 'number') return note;
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);
  if (!match) throw new Error(`Nota inválida: ${note}`);
  const [, letter, accidental, octave] = match;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  const semitones = SEMITONES_FROM_A[letter] + shift + (Number(octave) - 4) * 12;
  return 440 * 2 ** (semitones / 12);
}

/**
 * A soft Web Audio synth for small ears: a quiet master volume behind a
 * limiter, so no game can play loud. Each activity plays through its own
 * channel, and closing the channel silences everything it scheduled.
 */
export function createSynth({ volume = 0.35 } = {}) {
  let context = null;
  let master = null;

  function ready() {
    if (!context) {
      context = new AudioContext();
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.ratio.value = 12;
      master = context.createGain();
      master.gain.value = volume;
      master.connect(limiter).connect(context.destination);
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  return {
    /** Call from a click or tap: browsers only start audio after a gesture. */
    unlock: () => void ready(),
    channel: () => createChannel(ready(), master, ready),
  };
}

function createChannel(context, master, wake) {
  const output = context.createGain();
  output.connect(master);
  const timeouts = new Set();
  const intervals = new Set();
  let closed = false;

  const now = () => context.currentTime;

  function voice(note, start, { duration = 0.6, wave = 'sine', gain = 0.4, attack = 0.01, glideTo = null } = {}) {
    if (closed) return;
    wake();
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(toFrequency(note), start);
    if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(toFrequency(glideTo), start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(output);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function later(ms, fn) {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, Math.max(0, ms));
    timeouts.add(id);
  }

  function tone(note, { delay = 0, ...sound } = {}) {
    voice(note, now() + delay, sound);
  }

  return {
    tone,

    pop() {
      const base = 420 + Math.random() * 380;
      tone(base, { duration: 0.12, glideTo: base * 2.4, gain: 0.3 });
    },

    chime(note = 'C6') {
      tone(note, { duration: 1.4, wave: 'triangle', gain: 0.25 });
      tone(toFrequency(note) * 2, { duration: 0.9, gain: 0.07 });
    },

    /**
     * Plays a melody of [note, beats] pairs; note may be null (a rest) or an
     * array (a chord). `ring` lets each note sound longer than its beat, like
     * a music box. `onNote` fires in time with each note, for visuals.
     * Returns a function that stops the loop.
     */
    play(melody, { bpm = 90, loop = true, ring = null, onNote = null, ...sound } = {}) {
      const beat = 60 / bpm;
      const cycle = melody.reduce((sum, [, beats]) => sum + beats, 0) * beat;
      let cycleStart = now() + 0.1;
      let stopped = false;

      const schedule = (start) => {
        let at = start;
        melody.forEach(([note, beats], index) => {
          if (note !== null) {
            for (const pitch of [].concat(note)) voice(pitch, at, { ...sound, duration: ring ?? beats * beat * 0.9 });
            if (onNote) later((at - now()) * 1000, () => !stopped && onNote(note, index));
          }
          at += beats * beat;
        });
      };

      schedule(cycleStart);
      if (!loop) return () => { stopped = true; };

      const id = setInterval(() => {
        if (now() < cycleStart + cycle - 1.2) return;
        // A hidden tab throttles timers; restart cleanly instead of bunching notes.
        cycleStart = Math.max(cycleStart + cycle, now() + 0.1);
        schedule(cycleStart);
      }, 250);
      intervals.add(id);

      return () => {
        stopped = true;
        clearInterval(id);
        intervals.delete(id);
      };
    },

    close() {
      if (closed) return;
      closed = true;
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      output.gain.setTargetAtTime(0, now(), 0.05);
      setTimeout(() => output.disconnect(), 400);
    },
  };
}
