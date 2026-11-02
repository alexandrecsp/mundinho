/**
 * Quatro formas com carinha, cada uma dona de uma nota. Elas pulam quando
 * a música toca a sua nota, e também quando o bebê toca perto delas.
 */
const SHAPES = [
  { note: 'C5', kind: 'circle' },
  { note: 'E5', kind: 'square' },
  { note: 'G5', kind: 'triangle' },
  { note: 'A5', kind: 'star' },
];

// `shapes` follows the order of SHAPES.
const PALETTE = {
  light: {
    top: '#ffe9f3', bottom: '#e3f2ff', confettiLight: 75, confettiAlpha: 0.6, floor: '#ffb3d9', floorAlpha: 0.5,
    shapes: ['#ff595e', '#1982c4', '#ffca3a', '#8ac926'], feature: '#2b2540',
  },
  dark: {
    top: '#1d1530', bottom: '#0f1a2e', confettiLight: 45, confettiAlpha: 0.45, floor: '#5a2d50', floorAlpha: 0.6,
    shapes: ['#c9474b', '#1f6fa3', '#cfa431', '#6fa422'], feature: '#1a1528',
  },
};
const MELODY = [
  ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
  ['A5', 2], ['G5', 2],
  ['C5', 1], ['E5', 1], ['G5', 1], ['A5', 1],
  ['G5', 1], ['E5', 1], ['C5', 2],
  ['E5', 1], ['E5', 1], ['G5', 1], ['G5', 1],
  ['A5', 1], ['A5', 1], ['G5', 2],
  ['A5', 1], ['G5', 1], ['E5', 1], ['C5', 1],
  ['C5', 2], [null, 2],
];
const BASS = ['C3', 'C3', 'F3', 'C3', 'C3', 'F3', 'G2', 'C3', 'C3', 'C3', 'F3', 'C3', 'F3', 'G2', 'G2', 'C3'].map((note) => [note, 2]);
const KICK = Array.from({ length: 16 }, () => [[150, 1], [null, 1]]).flat();
const BPM = 100;
const JUMP_SECONDS = 0.22;

export default {
  mount(stage) {
    const { ctx } = stage;
    const bodies = SHAPES.map((shape) => ({ ...shape, lift: 0, velocity: 0, squash: 0 }));
    const confetti = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: stage.random(4, 10),
      hue: stage.random(0, 360),
      speed: stage.random(0.02, 0.05),
    }));
    let beat = 0;

    const size = () => Math.min(stage.width / 6, stage.height * 0.18);
    const xOf = (index) => (stage.width * (index + 1)) / (bodies.length + 1);

    function jump(body) {
      const height = size() * 1.2;
      const gravity = (2 * height) / JUMP_SECONDS ** 2;
      body.velocity = -gravity * JUMP_SECONDS;
    }

    stage.audio.play(MELODY, {
      bpm: BPM,
      wave: 'triangle',
      gain: 0.28,
      onNote: (note) => bodies.filter((body) => body.note === note).forEach(jump),
    });
    stage.audio.play(BASS, { bpm: BPM, wave: 'sine', gain: 0.2 });
    stage.audio.play(KICK, { bpm: BPM, wave: 'sine', gain: 0.3, glideTo: 45, ring: 0.25, onNote: () => (beat = 1) });

    stage.onPress(({ x }) => {
      const nearest = bodies.reduce((best, body, index) =>
        Math.abs(xOf(index) - x) < Math.abs(xOf(bodies.indexOf(best)) - x) ? body : best);
      jump(nearest);
      stage.audio.tone(nearest.note, { wave: 'triangle', duration: 0.5, gain: 0.3 });
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const s = size();
      const floor = h * 0.72;
      const gravity = (2 * s * 1.2) / JUMP_SECONDS ** 2;
      beat = Math.max(0, beat - dt * 4);
      const c = stage.colors(PALETTE);

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, c.top);
      sky.addColorStop(1, c.bottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      for (const piece of confetti) {
        piece.y += piece.speed * dt;
        if (piece.y > 1.05) piece.y = -0.05;
        ctx.beginPath();
        ctx.arc(piece.x * w + Math.sin(t + piece.hue) * 10, piece.y * h, piece.r * (1 + beat * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${piece.hue}, 80%, ${c.confettiLight}%, ${c.confettiAlpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.roundRect(w * 0.08, floor + s * 0.55, w * 0.84, s * 0.35, s * 0.18);
      ctx.fillStyle = c.floor;
      ctx.globalAlpha = Math.min(1, c.floorAlpha + beat * 0.3);
      ctx.fill();
      ctx.globalAlpha = 1;

      bodies.forEach((body, index) => {
        if (body.velocity !== 0 || body.lift < 0) {
          body.velocity += gravity * dt;
          body.lift += body.velocity * dt;
          if (body.lift >= 0) {
            body.lift = 0;
            body.velocity = 0;
            body.squash = 1;
          }
        }
        body.squash = Math.max(0, body.squash - dt * 5);
        drawBody(ctx, xOf(index), floor + body.lift, s, body, c.shapes[index], c.feature);
      });
    });
  },
};

function drawBody(ctx, x, y, size, { kind, squash }, color, feature) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y + half);
  ctx.scale(1 + squash * 0.2, 1 - squash * 0.2);
  ctx.translate(0, -half);
  ctx.fillStyle = color;
  ctx.beginPath();
  if (kind === 'circle') ctx.arc(0, 0, half, 0, Math.PI * 2);
  if (kind === 'square') ctx.roundRect(-half, -half, size, size, size * 0.15);
  if (kind === 'triangle') {
    ctx.moveTo(0, -half * 1.1);
    ctx.lineTo(half * 1.1, half);
    ctx.lineTo(-half * 1.1, half);
    ctx.closePath();
  }
  if (kind === 'star') {
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? half * 0.5 : half * 1.1;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
  }
  ctx.fill();

  const faceY = kind === 'triangle' ? half * 0.25 : 0;
  ctx.fillStyle = feature;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * size * 0.15, faceY - size * 0.06, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, faceY + size * 0.02, size * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.strokeStyle = feature;
  ctx.stroke();
  ctx.restore();
}
