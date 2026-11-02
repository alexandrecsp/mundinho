/**
 * Figuras em preto, branco e vermelho, as cores que o bebê enxerga melhor
 * nos primeiros meses. Cada toque troca a figura com um sininho; sozinha,
 * ela muda a cada 10 segundos. As trocas são sempre suaves: toques durante
 * a transição são ignorados, para nunca piscar.
 */
const RED = '#e63946';
const INK = '#111111';
const NOTES = ['C5', 'E5', 'G5', 'C6', 'G5', 'E5'];
const AUTO_CHANGE_SECONDS = 10;
const FADE_SECONDS = 0.8;

export default {
  mount(stage) {
    const { ctx } = stage;
    const patterns = [bullseye, face, checker, star, pinwheel];
    let current = 0;
    let previous = null;
    let fade = 1;
    let shownFor = 0;
    let noteIndex = 0;

    function next() {
      previous = current;
      current = (current + 1) % patterns.length;
      fade = 0;
      shownFor = 0;
      stage.audio.chime(NOTES[noteIndex++ % NOTES.length]);
    }

    stage.onPress(() => {
      if (fade >= 1) next();
    });

    stage.onFrame((dt, t) => {
      shownFor += dt;
      fade = Math.min(1, fade + dt / FADE_SECONDS);
      if (shownFor > AUTO_CHANGE_SECONDS) next();

      const view = { ctx, w: stage.width, h: stage.height, size: Math.min(stage.width, stage.height) * 0.8, t };
      if (previous !== null && fade < 1) {
        ctx.globalAlpha = 1;
        patterns[previous](view);
      }
      ctx.globalAlpha = previous === null ? 1 : fade;
      patterns[current](view);
      ctx.globalAlpha = 1;
    });
  },
};

function bullseye({ ctx, w, h, size, t }) {
  fill(ctx, w, h, '#fff');
  const rings = 7;
  const breath = 1 + Math.sin(t * 1.2) * 0.04;
  for (let i = rings; i > 0; i--) circle(ctx, w / 2, h / 2, (size / 2) * (i / rings) * breath, i % 2 ? INK : '#fff');
  circle(ctx, w / 2, h / 2, size * 0.05 * breath, RED);
}

function face({ ctx, w, h, size, t }) {
  fill(ctx, w, h, INK);
  const r = size * 0.45;
  const cx = w / 2;
  const cy = h / 2 + Math.sin(t * 1.1) * size * 0.02;
  circle(ctx, cx, cy, r, '#fff');
  const blink = t % 4 < 0.15 ? 0.1 : 1;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + side * r * 0.36, cy - r * 0.2, r * 0.12, r * 0.12 * blink, 0, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    circle(ctx, cx + side * r * 0.58, cy + r * 0.18, r * 0.09, RED);
  }
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.05, r * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.lineWidth = r * 0.08;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function checker({ ctx, w, h, size, t }) {
  fill(ctx, w, h, '#fff');
  const cells = 6;
  const board = size * 0.8;
  const cell = board / cells;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.sin(t * 0.3) * 0.25);
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#fff' : INK;
      ctx.fillRect(-board / 2 + col * cell, -board / 2 + row * cell, cell + 0.5, cell + 0.5);
    }
  }
  ctx.lineWidth = cell * 0.25;
  ctx.strokeStyle = INK;
  ctx.strokeRect(-board / 2, -board / 2, board, board);
  ctx.restore();
}

function star({ ctx, w, h, size, t }) {
  fill(ctx, w, h, INK);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(t * 0.2);
  const breath = 1 + Math.sin(t * 1.5) * 0.05;
  ctx.scale(breath, breath);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? size * 0.2 : size * 0.45;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fillStyle = RED;
  ctx.fill();
  ctx.lineWidth = size * 0.03;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.restore();
}

function pinwheel({ ctx, w, h, size, t }) {
  fill(ctx, w, h, '#fff');
  const wedges = 12;
  const r = size * 0.5;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(t * 0.25);
  ctx.fillStyle = INK;
  for (let i = 0; i < wedges; i += 2) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, (i * 2 * Math.PI) / wedges, ((i + 1) * 2 * Math.PI) / wedges);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  circle(ctx, w / 2, h / 2, r * 0.12, RED);
}

function fill(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function circle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
