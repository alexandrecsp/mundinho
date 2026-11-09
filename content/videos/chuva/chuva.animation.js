/**
 * Chuva mansa num campinho com um sapinho e poças d'água. Aos poucos as
 * nuvens se abrem, o sol aparece e nasce um arco-íris; depois a chuva
 * volta, e o ciclo recomeça. Música calma (melodia original). Um toque
 * solta gotinhas ali e faz o sapinho pular.
 */
const MELODY = [
  ['A5', 2], ['G5', 1], ['F5', 1], ['G5', 2], ['C5', 2], ['A5', 2], ['C6', 1], ['A5', 1], ['G5', 4],
  ['F5', 2], ['G5', 1], ['A5', 1], ['G5', 2], ['D5', 2], ['C5', 2], ['D5', 1], ['F5', 1], ['F5', 4],
];
const BASS = ['F3', 'C3', 'F3', 'C3', 'F3', 'Bb2', 'C3', 'F3'].map((note) => [note, 4]);
const BPM = 72;
const CYCLE_SECONDS = 44;
const TAP_NOTES = ['C6', 'D6', 'F6', 'G6', 'A6'];
const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];

// The sunny scene is drawn first; the rainy greys lie over it as rain sets in.
const PALETTE = {
  light: {
    skyTop: '#8fd0ff', skyBottom: '#e6f6ff', rainTop: '#8a9aac', rainBottom: '#c3cdd8', sun: '#ffd75e',
    cloud: '#ffffff', cloudRain: '#9aa6b4', drop: '#5b8fd6', dropAlpha: 0.6,
    hill: '#86c97a', hillFront: '#6fb865', puddle: '#9cc8ec', ring: '#ffffff', rainbowAlpha: 0.55,
    frog: '#5fbf5a', frogLine: '#2f7a35', eyeWhite: '#ffffff', pupil: '#2b2b38',
  },
  dark: {
    skyTop: '#0b1430', skyBottom: '#1b2350', rainTop: '#141a26', rainBottom: '#1e2533', sun: '#efe6c4',
    cloud: '#3a4266', cloudRain: '#23293a', drop: '#7a9ccf', dropAlpha: 0.35,
    hill: '#17301f', hillFront: '#122819', puddle: '#1f3550', ring: '#9ab8e0', rainbowAlpha: 0.18,
    frog: '#2f5a32', frogLine: '#1a3a1e', eyeWhite: '#c8ccd4', pupil: '#101018',
  },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const drops = Array.from({ length: 140 }, () => newDrop(true));
    const splashes = [];
    const tapDrops = [];
    const clouds = Array.from({ length: 6 }, (_, i) => ({ x: (i + 0.5) / 6, y: 0.08 + Math.random() * 0.1, scale: stage.random(0.9, 1.3) }));
    const puddles = [[0.22, 0.86, 0.09], [0.62, 0.9, 0.12], [0.86, 0.84, 0.07]];
    const frog = { x: 0.42, hop: 0 };
    let clock = 8; // start mid-rain, so the sun comes out soon

    function newDrop(anywhere = false) {
      return {
        x: Math.random() * 1.1,
        y: anywhere ? Math.random() : -0.05,
        speed: stage.random(0.28, 0.42),
        length: stage.random(0.02, 0.035),
        land: stage.random(0.8, 0.98),
      };
    }

    function splash(x, y) {
      splashes.push({ x, y, age: 0 });
      if (splashes.length > 40) splashes.shift();
    }

    stage.audio.play(MELODY, { bpm: BPM, wave: 'sine', gain: 0.22, ring: 1.6 });
    stage.audio.play(BASS, { bpm: BPM, wave: 'triangle', gain: 0.09, ring: 3 });

    stage.onPress(({ x, y }) => {
      for (let i = 0; i < 6; i++) {
        tapDrops.push({ x: x + stage.random(-30, 30), y: y + stage.random(-20, 10), vy: stage.random(20, 80), land: stage.random(0.82, 0.96) * stage.height });
      }
      frog.hop = 1;
      stage.audio.tone(stage.pick(TAP_NOTES), { duration: 1, gain: 0.14 });
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const u = Math.min(w, h);
      const c = stage.colors(PALETTE);
      clock = (clock + dt) % CYCLE_SECONDS;
      const rain = 1 - band(clock, 16, 21, 37, 42);
      const rainbow = band(clock, 22, 26, 33, 37);
      const groundY = h * 0.78;

      fill(ctx, w, h, c.skyTop, c.skyBottom, 1);
      fill(ctx, w, h, c.rainTop, c.rainBottom, rain * 0.9);

      const sunR = u * 0.09;
      const sunY = h * (0.38 - 0.2 * (1 - rain));
      ctx.globalAlpha = 1 - rain;
      ctx.fillStyle = c.sun;
      ctx.beginPath();
      ctx.arc(w * 0.78, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.sun;
      ctx.lineWidth = u * 0.008;
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + t * 0.1;
        ctx.beginPath();
        ctx.moveTo(w * 0.78 + Math.cos(a) * sunR * 1.3, sunY + Math.sin(a) * sunR * 1.3);
        ctx.lineTo(w * 0.78 + Math.cos(a) * sunR * 1.6, sunY + Math.sin(a) * sunR * 1.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (rainbow > 0) {
        const stripe = u * 0.03;
        ctx.globalAlpha = rainbow * c.rainbowAlpha;
        ctx.lineWidth = stripe;
        RAINBOW.forEach((color, i) => {
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.arc(w * 0.42, groundY, w * 0.36 - i * stripe, Math.PI, Math.PI * 2);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      for (const cloud of clouds) {
        const side = cloud.x < 0.5 ? -1 : 1;
        const spread = (1 - rain) * Math.abs(cloud.x - 0.5) * 1.2;
        const x = (cloud.x + side * spread) * w + Math.sin(t * 0.15 + cloud.x * 9) * u * 0.02;
        const size = u * 0.09 * cloud.scale;
        ctx.fillStyle = c.cloud;
        drawCloud(ctx, x, cloud.y * h, size);
        ctx.globalAlpha = rain;
        ctx.fillStyle = c.cloudRain;
        drawCloud(ctx, x, cloud.y * h, size);
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = c.hill;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, groundY);
      ctx.quadraticCurveTo(w * 0.35, groundY - h * 0.08, w * 0.7, groundY);
      ctx.quadraticCurveTo(w * 0.9, groundY + h * 0.04, w, groundY - h * 0.02);
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle = c.hillFront;
      ctx.fillRect(0, h * 0.93, w, h);

      ctx.fillStyle = c.puddle;
      for (const [px, py, pr] of puddles) {
        ctx.beginPath();
        ctx.ellipse(px * w, py * h, pr * w, pr * w * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = c.ring;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.age += dt;
        if (s.age > 0.8) {
          splashes.splice(i, 1);
          continue;
        }
        const p = s.age / 0.8;
        ctx.globalAlpha = 0.6 * (1 - p);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, u * 0.025 * p + 2, (u * 0.025 * p + 2) * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      drawFrog(ctx, frog, w * frog.x, groundY + h * 0.06, u * 0.06, t, dt, rainbow, c);

      ctx.strokeStyle = c.drop;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.globalAlpha = c.dropAlpha;
      const visible = Math.round(drops.length * rain);
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x -= d.speed * 0.15 * dt;
        if (d.y > d.land) {
          if (i < visible && Math.random() < 0.4) splash(d.x * w, d.land * h);
          drops[i] = newDrop();
          continue;
        }
        if (i >= visible) continue;
        ctx.beginPath();
        ctx.moveTo(d.x * w, d.y * h);
        ctx.lineTo((d.x + d.length * 0.15) * w, (d.y - d.length) * h);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = c.drop;
      for (let i = tapDrops.length - 1; i >= 0; i--) {
        const d = tapDrops[i];
        d.vy += 260 * dt;
        d.y += d.vy * dt;
        if (d.y > d.land) {
          splash(d.x, d.land);
          tapDrops.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },
};

// 0 before `a`, rising to 1 by `b`, holding until `c`, back to 0 by `d`.
function band(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;
  if (x < b) return smooth((x - a) / (b - a));
  if (x <= c) return 1;
  return smooth((d - x) / (d - c));
}

function smooth(p) {
  return p * p * (3 - 2 * p);
}

function fill(ctx, w, h, top, bottom, alpha) {
  if (alpha <= 0) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

function drawCloud(ctx, x, y, size) {
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.9, 0.2, 0.7], [0.3, -0.45, 0.7]]) {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFrog(ctx, frog, x, y, s, t, dt, cheer, c) {
  frog.hop = Math.max(0, frog.hop - dt * 1.8);
  const lift = Math.sin(frog.hop * Math.PI) * s * 1.4 + cheer * Math.max(0, Math.sin(t * 2)) * s * 0.25;
  ctx.save();
  ctx.translate(x, y - lift);
  ctx.globalAlpha = 1;
  ctx.fillStyle = c.frog;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.1, s * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.fillStyle = c.frog;
    ctx.beginPath();
    ctx.arc(side * s * 0.5, -s * 0.65, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.eyeWhite;
    ctx.beginPath();
    ctx.arc(side * s * 0.5, -s * 0.68, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.pupil;
    ctx.beginPath();
    ctx.arc(side * s * 0.5, -s * 0.66, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = c.frogLine;
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -s * 0.05, s * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}
