/**
 * Fundo do mar: peixinhos e águas-vivas nadando devagar entre algas, ao som
 * de uma melodia calma. Tocar solta bolhas, e o peixe mais perto dá uma
 * acelerada feliz.
 */
const MELODY = [
  ['G4', 1], ['B4', 1], ['D5', 2], ['E5', 1], ['D5', 1], ['B4', 2],
  ['A4', 1], ['B4', 1], ['G4', 1], ['E4', 1], ['D4', 2], [null, 2],
  ['G4', 1], ['A4', 1], ['B4', 2], ['D5', 1], ['E5', 1], ['G5', 2],
  ['E5', 1], ['D5', 1], ['B4', 1], ['A4', 1], ['G4', 2], [null, 2],
];
const BASS = [['G2', 4], ['C3', 4], ['E3', 4], ['D3', 4], ['G2', 4], ['C3', 4], ['D3', 4], ['G2', 4]];
const BPM = 84;

const PALETTE = {
  light: {
    top: '#5ccfff', bottom: '#0a5a9c', rays: 0.06, bubble: 0.7,
    sand: '#f2d38a', seaweed: '#2e9e5b', starfish: '#ff7b54', jelly: 0.85, tentacles: 0.7,
  },
  dark: {
    top: '#0b3557', bottom: '#020d1c', rays: 0.025, bubble: 0.4,
    sand: '#5e5034', seaweed: '#1c5638', starfish: '#a3523a', jelly: 0.7, tentacles: 0.5,
  },
};
const FISH_COLORS = [
  ['#ff8c42', '#ffb37a'],
  ['#ffd23f', '#ffe68a'],
  ['#ff6f91', '#ffa3b8'],
  ['#7bdff2', '#b6ecf7'],
  ['#b388eb', '#d4bdf5'],
  ['#4cd4b0', '#94e8d2'],
];

export default {
  mount(stage) {
    const { ctx } = stage;
    const fish = Array.from({ length: 7 }, (_, i) => {
      const [color, fin] = FISH_COLORS[i % FISH_COLORS.length];
      return {
        x: Math.random(),
        y: stage.random(0.15, 0.7),
        dir: Math.random() < 0.5 ? -1 : 1,
        speed: stage.random(0.03, 0.06),
        size: stage.random(22, 38),
        phase: Math.random() * Math.PI * 2,
        boost: 0,
        color,
        fin,
      };
    });
    const jellies = Array.from({ length: 2 }, (_, i) => ({ x: 0.2 + i * 0.55, y: stage.random(0.3, 0.9), phase: i * 2 }));
    const bubbles = [];

    function bubble(x, y, r = stage.random(3, 8)) {
      bubbles.push({ x, y, r, wobble: Math.random() * Math.PI * 2 });
    }

    stage.audio.play(MELODY, { bpm: BPM, wave: 'triangle', gain: 0.22 });
    stage.audio.play(BASS, { bpm: BPM, wave: 'sine', gain: 0.16 });

    stage.onPress(({ x, y }) => {
      for (let i = 0; i < 6; i++) bubble(x + stage.random(-20, 20), y + stage.random(-10, 10));
      stage.audio.tone(stage.random(500, 700), { glideTo: 1100, duration: 0.18, gain: 0.18 });
      const nearest = fish.reduce((best, f) =>
        Math.hypot(f.x * stage.width - x, f.y * stage.height - y) < Math.hypot(best.x * stage.width - x, best.y * stage.height - y) ? f : best);
      nearest.boost = 1;
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const c = stage.colors(PALETTE);

      const water = ctx.createLinearGradient(0, 0, 0, h);
      water.addColorStop(0, c.top);
      water.addColorStop(1, c.bottom);
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = `rgba(255, 255, 255, ${c.rays})`;
      for (let i = 0; i < 4; i++) {
        const sway = Math.sin(t * 0.3 + i) * w * 0.05;
        const x = w * (0.15 + i * 0.25) + sway;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.04, 0);
        ctx.lineTo(x + w * 0.04, 0);
        ctx.lineTo(x + w * 0.12, h);
        ctx.lineTo(x - w * 0.02, h);
        ctx.fill();
      }

      if (Math.random() < dt * 1.5) bubble(stage.random(0, w), h + 10);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= (30 + b.r * 6) * dt;
        b.x += Math.sin(t * 2 + b.wobble) * 10 * dt;
        if (b.y < -20) {
          bubbles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${c.bubble})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (const jelly of jellies) {
        jelly.y -= 0.012 * dt;
        if (jelly.y < -0.15) jelly.y = 1.1;
        drawJelly(ctx, jelly.x * w + Math.sin(t * 0.4 + jelly.phase) * 20, jelly.y * h, Math.min(w, h) * 0.06, t + jelly.phase, c);
      }

      for (const f of fish) {
        f.boost = Math.max(0, f.boost - dt * 0.8);
        f.x += f.dir * f.speed * (1 + f.boost * 3) * dt;
        if (f.dir > 0 && f.x > 1.1) f.x = -0.1;
        if (f.dir < 0 && f.x < -0.1) f.x = 1.1;
        drawFish(ctx, f.x * w, f.y * h + Math.sin(t * 1.5 + f.phase) * 8, f, t);
      }

      const sandTop = h * 0.88;
      for (let i = 0; i < 9; i++) drawSeaweed(ctx, w * (i + 0.5) / 9, sandTop + 6, h * (0.18 + (i % 3) * 0.06), t + i, c.seaweed);

      ctx.fillStyle = c.sand;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, sandTop);
      for (let x = 0; x < w; x += 40) ctx.lineTo(x, sandTop + Math.sin(x * 0.01) * 6);
      ctx.lineTo(w, sandTop + Math.sin(w * 0.01) * 6);
      ctx.lineTo(w, h);
      ctx.fill();
      drawStarfish(ctx, w * 0.72, sandTop + (h - sandTop) * 0.5, Math.min(w, h) * 0.03, c.starfish);
    });
  },
};

function drawFish(ctx, x, y, { dir, size, color, fin, phase }, t) {
  const wag = Math.sin(t * 6 + phase) * 0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);

  ctx.fillStyle = fin;
  ctx.beginPath();
  ctx.moveTo(-0.8, 0);
  ctx.lineTo(-1.45, -0.55 + wag);
  ctx.lineTo(-1.45, 0.55 + wag);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.2, -0.5);
  ctx.quadraticCurveTo(0.1, -0.95, 0.4, -0.5);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0.5, -0.15, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d2e';
  ctx.beginPath();
  ctx.arc(0.55, -0.15, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1d1d2e';
  ctx.lineWidth = 0.07;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0.62, 0.12, 0.16, 0.1 * Math.PI, 0.7 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawJelly(ctx, x, y, size, t, c) {
  const pulse = 1 + Math.sin(t * 2) * 0.1;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255, 190, 230, ${c.tentacles})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size * 0.3, 0);
    ctx.quadraticCurveTo(i * size * 0.3 + Math.sin(t * 2 + i) * size * 0.3, size * 0.8, i * size * 0.25, size * 1.5);
    ctx.stroke();
  }
  ctx.scale(pulse, 2 - pulse);
  ctx.fillStyle = `rgba(255, 170, 220, ${c.jelly})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.8, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a2d4f';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * size * 0.3, -size * 0.3, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSeaweed(ctx, x, base, height, t, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, base);
  const sway = Math.sin(t * 0.8) * 18;
  ctx.bezierCurveTo(x + sway, base - height * 0.35, x - sway, base - height * 0.7, x + sway * 0.6, base - height);
  ctx.stroke();
}

function drawStarfish(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? size * 0.45 : size;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}
