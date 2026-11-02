/**
 * Canção de ninar: "Brilha, Brilha Estrelinha" (melodia de domínio público)
 * em caixinha de música, com uma lua sonolenta e estrelas que cintilam
 * devagar. Cada nota acende uma estrelinha nova no céu.
 */
const LINE_A = [['C5', 1], ['C5', 1], ['G5', 1], ['G5', 1], ['A5', 1], ['A5', 1], ['G5', 2]];
const LINE_B = [['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1], ['C5', 2]];
const LINE_C = [['G5', 1], ['G5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 2]];
const MELODY = [...LINE_A, ...LINE_B, ...LINE_C, ...LINE_C, ...LINE_A, ...LINE_B];

const BASS_A = ['C3', 'C3', 'F3', 'C3'];
const BASS_B = ['F3', 'C3', 'G2', 'C3'];
const BASS_C = ['C3', 'F3', 'C3', 'G2'];
const BASS = [...BASS_A, ...BASS_B, ...BASS_C, ...BASS_C, ...BASS_A, ...BASS_B].map((note) => [note, 2]);

const BPM = 72;
const TAP_NOTES = ['C6', 'D6', 'E6', 'G6', 'A6'];

export default {
  mount(stage) {
    const { ctx } = stage;
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.68,
      r: stage.random(0.6, 2.2),
      phase: Math.random() * Math.PI * 2,
      speed: stage.random(0.4, 1.2),
    }));
    const clouds = Array.from({ length: 3 }, (_, i) => ({ x: Math.random(), y: 0.12 + i * 0.16, scale: stage.random(0.8, 1.3), speed: stage.random(0.006, 0.012) }));
    const sparkles = [];
    let shootingStar = null;
    let nextShootingStar = 8;

    function sparkle(x, y) {
      sparkles.push({ x, y, life: 1 });
    }

    stage.audio.play(MELODY, {
      bpm: BPM,
      wave: 'sine',
      gain: 0.28,
      ring: 1.4,
      onNote: () => sparkle(stage.random(0.05, 0.95) * stage.width, stage.random(0.05, 0.6) * stage.height),
    });
    stage.audio.play(BASS, { bpm: BPM, wave: 'triangle', gain: 0.1, ring: 1.8 });

    stage.onPress(({ x, y }) => {
      sparkle(x, y);
      stage.audio.tone(stage.pick(TAP_NOTES), { wave: 'sine', duration: 1.2, gain: 0.12 });
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0d1b4c');
      sky.addColorStop(1, '#2d3383');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      for (const star of stars) {
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
        if (star.r > 1.8) drawSparkle(ctx, star.x * w, star.y * h, star.r * 3, alpha);
        else {
          ctx.beginPath();
          ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 220, ${alpha})`;
          ctx.fill();
        }
      }

      nextShootingStar -= dt;
      if (nextShootingStar <= 0) {
        shootingStar = { x: stage.random(0.1, 0.6) * w, y: stage.random(0.05, 0.25) * h, age: 0 };
        nextShootingStar = stage.random(12, 18);
      }
      if (shootingStar) {
        shootingStar.age += dt;
        const progress = shootingStar.age / 1.6;
        if (progress >= 1) shootingStar = null;
        else drawShootingStar(ctx, shootingStar, progress, Math.min(w, h));
      }

      drawMoon(ctx, w * 0.75, h * 0.25 + Math.sin(t * 0.5) * 6, Math.min(w, h) * 0.11, t);

      for (const cloud of clouds) {
        cloud.x += cloud.speed * dt;
        if (cloud.x > 1.25) cloud.x = -0.25;
        drawCloud(ctx, cloud.x * w, cloud.y * h, Math.min(w, h) * 0.08 * cloud.scale);
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life -= dt * 0.5;
        if (s.life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        drawSparkle(ctx, s.x, s.y, 6 + (1 - s.life) * 18, Math.sin(s.life * Math.PI));
      }

      drawHills(ctx, w, h);
    });
  },
};

function drawSparkle(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(255, 245, 200, ${alpha})`;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 ? size * 0.18 : size;
    const angle = (i * Math.PI) / 4;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShootingStar(ctx, { x, y }, progress, scale) {
  const length = scale * 0.25;
  const headX = x + progress * scale * 0.6;
  const headY = y + progress * scale * 0.25;
  const tail = ctx.createLinearGradient(headX - length, headY - length * 0.4, headX, headY);
  tail.addColorStop(0, 'rgba(255, 255, 255, 0)');
  tail.addColorStop(1, `rgba(255, 255, 255, ${1 - progress})`);
  ctx.beginPath();
  ctx.moveTo(headX - length, headY - length * 0.4);
  ctx.lineTo(headX, headY);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = tail;
  ctx.stroke();
}

function drawMoon(ctx, x, y, r, t) {
  const glow = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.6);
  glow.addColorStop(0, 'rgba(255, 244, 194, 0.35)');
  glow.addColorStop(1, 'rgba(255, 244, 194, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff4c2';
  ctx.fill();

  ctx.strokeStyle = '#8a7a52';
  ctx.lineWidth = r * 0.06;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * r * 0.35, y - r * 0.1, r * 0.13, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y + r * 0.2, r * 0.2 + Math.sin(t * 0.8) * r * 0.02, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 170, 170, 0.5)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * r * 0.58, y + r * 0.18, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(200, 210, 255, 0.13)';
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.9, 0.2, 0.7], [0.3, -0.45, 0.7]]) {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx, w, h) {
  ctx.fillStyle = '#1b2160';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.82);
  ctx.quadraticCurveTo(w * 0.3, h * 0.7, w * 0.6, h * 0.82);
  ctx.quadraticCurveTo(w * 0.85, h * 0.9, w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.fill();

  const house = Math.min(w, h) * 0.06;
  const hx = w * 0.3;
  const hy = h * 0.76 - house * 0.2;
  ctx.fillStyle = '#141846';
  ctx.fillRect(hx - house / 2, hy, house, house * 0.8);
  ctx.beginPath();
  ctx.moveTo(hx - house * 0.65, hy);
  ctx.lineTo(hx, hy - house * 0.55);
  ctx.lineTo(hx + house * 0.65, hy);
  ctx.fill();
  ctx.fillStyle = '#ffd97a';
  ctx.fillRect(hx - house * 0.15, hy + house * 0.2, house * 0.3, house * 0.28);

  ctx.fillStyle = '#141846';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.92);
  ctx.quadraticCurveTo(w * 0.5, h * 0.82, w, h * 0.93);
  ctx.lineTo(w, h);
  ctx.fill();
}
