/**
 * Um trenzinho passeia pelos campos levando bichinhos nos vagões, ao som
 * de uma musiquinha (melodia original). A paisagem passa devagar, a
 * chaminé solta fumaça no ritmo, e um toque faz o trem apitar e os
 * bichinhos pularem.
 */
const C = ['C3', 'G3'];
const F = ['F3', 'C3'];
const G = ['G2', 'D3'];
const bar = ([root, fifth]) => [[root, 1], [fifth, 1], [root, 1], [fifth, 1]];

const MELODY = [
  ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['F5', 1], ['A5', 1], ['G5', 2],
  ['E5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['E5', 1], ['C5', 1], ['D5', 2],
  ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['F5', 1], ['A5', 1], ['G5', 2],
  ['F5', 1], ['E5', 1], ['D5', 1], ['G4', 1], ['C5', 4],
];
const BASS = [C, F, C, G, C, F, G, C].flatMap(bar);
const BPM = 104;
const ANIMALS = ['🐶', '🐱', '🐰', '🐼'];

const PALETTE = {
  light: {
    skyTop: '#9fd8ff', skyBottom: '#eef9ff', sun: '#ffd75e', starAlpha: 0,
    cloud: '#ffffff', cloudAlpha: 0.85, hillFar: '#b2deaa', hillNear: '#8fca84', ground: '#7cb86c',
    trunk: '#8a5a3c', leaves: '#5aa85a', rail: '#7a5a44', sleeper: '#a57f5c',
    carSat: 70, carLight: 64, loco: '#e85d5d', locoDark: '#b04040', cab: '#4a7fe0', wheel: '#3a3a48', lamp: '#fff4c7',
    smoke: '#ffffff', smokeAlpha: 0.85,
  },
  dark: {
    skyTop: '#0b1430', skyBottom: '#1f2350', sun: '#efe6c4', starAlpha: 0.8,
    cloud: '#8c96c8', cloudAlpha: 0.15, hillFar: '#1a2a4a', hillNear: '#15233a', ground: '#14251d',
    trunk: '#2e2420', leaves: '#1d3a28', rail: '#3a3040', sleeper: '#2e2830',
    carSat: 38, carLight: 36, loco: '#8a3a3a', locoDark: '#5e2828', cab: '#2a4580', wheel: '#18181f', lamp: '#ffd97a',
    smoke: '#9aa3c0', smokeAlpha: 0.3,
  },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const puffs = [];
    const hops = ANIMALS.map(() => ({ wait: 0, p: 0 }));
    const stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() * 0.45, r: stage.random(0.6, 1.8), phase: Math.random() * 6 }));
    const clouds = Array.from({ length: 4 }, (_, i) => ({ x: i / 4 + Math.random() * 0.1, y: 0.1 + Math.random() * 0.2, scale: stage.random(0.8, 1.3) }));
    let scroll = 0;
    let chimney = { x: 0, y: 0 };

    function puff() {
      puffs.push({ x: chimney.x, y: chimney.y, age: 0 });
      if (puffs.length > 24) puffs.shift();
    }

    stage.audio.play(MELODY, { bpm: BPM, wave: 'triangle', gain: 0.22, ring: 0.5 });
    stage.audio.play(BASS, { bpm: BPM, wave: 'sine', gain: 0.14, ring: 0.3, onNote: (_, i) => i % 2 === 0 && puff() });

    stage.onPress(() => {
      for (const delay of [0, 0.45]) {
        stage.audio.tone('A5', { delay, wave: 'triangle', duration: 0.38, gain: 0.12 });
        stage.audio.tone('C6', { delay, wave: 'triangle', duration: 0.38, gain: 0.1 });
      }
      hops.forEach((hop, i) => {
        hop.wait = i * 0.1;
        hop.p = 1;
      });
      puff();
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const u = Math.min(w, h);
      const groundY = h * 0.72;
      const c = stage.colors(PALETTE);
      const speed = w * 0.09;
      scroll += speed * dt;

      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, c.skyTop);
      sky.addColorStop(1, c.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      if (c.starAlpha > 0.01) {
        ctx.fillStyle = '#fffadc';
        for (const star of stars) {
          ctx.globalAlpha = c.starAlpha * (0.5 + 0.5 * Math.sin(t * 0.8 + star.phase));
          ctx.beginPath();
          ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = c.sun;
      ctx.beginPath();
      ctx.arc(w * 0.84, h * 0.17, u * 0.07, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = c.cloud;
      ctx.globalAlpha = c.cloudAlpha;
      for (const cloud of clouds) {
        const x = wrap(cloud.x * w * 1.4 - scroll * 0.08, w * 1.4) - w * 0.2;
        drawCloud(ctx, x, cloud.y * h, u * 0.05 * cloud.scale);
      }
      ctx.globalAlpha = 1;

      drawHills(ctx, w, groundY, scroll * 0.2, h * 0.16, 0.006, c.hillFar);
      drawHills(ctx, w, groundY, scroll * 0.45, h * 0.09, 0.011, c.hillNear);
      ctx.fillStyle = c.ground;
      ctx.fillRect(0, groundY - 2, w, h - groundY + 2);

      const spacing = u * 0.45;
      for (let k = Math.floor((scroll * 0.8) / spacing) - 1; k * spacing - scroll * 0.8 < w + spacing; k++) {
        const x = k * spacing - scroll * 0.8 + hash(k) * spacing * 0.5;
        drawTree(ctx, x, groundY - u * 0.02, u * (0.07 + hash(k + 7) * 0.05), c);
      }

      const railY = groundY + (h - groundY) * 0.45;
      const gap = u * 0.05;
      ctx.fillStyle = c.sleeper;
      for (let x = -wrap(scroll, gap); x < w; x += gap) ctx.fillRect(x, railY - 2, gap * 0.45, u * 0.025);
      ctx.fillStyle = c.rail;
      ctx.fillRect(0, railY - 4, w, 4);

      const unit = Math.min((w * 0.9) / (1.4 + ANIMALS.length * 1.1), h * 0.22);
      const totalLength = unit * (1.4 + ANIMALS.length * 1.1);
      const left = (w - totalLength) / 2;
      const wheelAngle = scroll / (unit * 0.14);

      for (const hop of hops) {
        if (hop.wait > 0) hop.wait -= dt;
        else hop.p = Math.max(0, hop.p - dt * 2.2);
      }

      ANIMALS.forEach((animal, i) => {
        const x = left + i * unit * 1.1;
        const bob = Math.sin(t * 9 + i) * 1.5;
        const hop = hops[i].wait > 0 ? 0 : Math.sin(hops[i].p * Math.PI) * unit * 0.35;
        drawCar(ctx, x, railY, unit, (i * 85 + 20) % 360, animal, bob, hop, wheelAngle, stage, c);
        ctx.fillStyle = c.wheel;
        ctx.fillRect(x + unit, railY - unit * 0.22, unit * 0.12, unit * 0.06);
      });
      chimney = drawLocomotive(ctx, left + ANIMALS.length * unit * 1.1, railY, unit, Math.sin(t * 9) * 1.5, wheelAngle, c);

      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += dt;
        if (p.age > 2.6) {
          puffs.splice(i, 1);
          continue;
        }
        p.x -= speed * 0.6 * dt;
        p.y -= u * 0.06 * dt;
        ctx.globalAlpha = c.smokeAlpha * (1 - p.age / 2.6);
        ctx.fillStyle = c.smoke;
        ctx.beginPath();
        ctx.arc(p.x, p.y, unit * (0.1 + p.age * 0.1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  },
};

function drawCar(ctx, x, railY, unit, hue, animal, bob, hop, wheelAngle, stage, c) {
  const bodyTop = railY - unit * 0.62 + bob;
  ctx.font = stage.emojiFont(unit * 0.55);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(animal, x + unit / 2, bodyTop - unit * 0.12 - hop);

  ctx.fillStyle = `hsl(${hue}, ${c.carSat}%, ${c.carLight}%)`;
  ctx.beginPath();
  ctx.roundRect(x, bodyTop, unit, unit * 0.45, unit * 0.08);
  ctx.fill();
  ctx.fillStyle = `hsl(${hue}, ${c.carSat}%, ${c.carLight - 12}%)`;
  ctx.fillRect(x, bodyTop + unit * 0.3, unit, unit * 0.06);

  for (const wx of [0.25, 0.75]) drawWheel(ctx, x + unit * wx, railY - unit * 0.14, unit * 0.14, wheelAngle, c);
}

function drawLocomotive(ctx, x, railY, unit, bob, wheelAngle, c) {
  const length = unit * 1.4;
  const base = railY - unit * 0.2 + bob;

  ctx.fillStyle = c.cab;
  ctx.beginPath();
  ctx.roundRect(x, base - unit * 0.85, length * 0.42, unit * 0.85, unit * 0.06);
  ctx.fill();
  ctx.fillStyle = c.locoDark;
  ctx.fillRect(x - unit * 0.04, base - unit * 0.92, length * 0.5, unit * 0.1);
  ctx.fillStyle = c.lamp;
  ctx.beginPath();
  ctx.roundRect(x + length * 0.1, base - unit * 0.7, length * 0.22, unit * 0.25, unit * 0.04);
  ctx.fill();

  ctx.fillStyle = c.loco;
  ctx.beginPath();
  ctx.roundRect(x + length * 0.38, base - unit * 0.55, length * 0.6, unit * 0.55, [0, unit * 0.25, unit * 0.06, 0]);
  ctx.fill();

  const chimneyX = x + length * 0.82;
  ctx.fillStyle = c.locoDark;
  ctx.fillRect(chimneyX - unit * 0.08, base - unit * 0.85, unit * 0.16, unit * 0.32);
  ctx.fillRect(chimneyX - unit * 0.12, base - unit * 0.9, unit * 0.24, unit * 0.08);

  ctx.fillStyle = c.lamp;
  ctx.beginPath();
  ctx.arc(x + length * 0.99, base - unit * 0.3, unit * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.locoDark;
  ctx.beginPath();
  ctx.moveTo(x + length * 0.95, base);
  ctx.lineTo(x + length * 1.1, base + unit * 0.18);
  ctx.lineTo(x + length * 0.95, base + unit * 0.18);
  ctx.closePath();
  ctx.fill();

  drawWheel(ctx, x + length * 0.2, railY - unit * 0.2, unit * 0.2, wheelAngle * 0.7, c);
  drawWheel(ctx, x + length * 0.55, railY - unit * 0.14, unit * 0.14, wheelAngle, c);
  drawWheel(ctx, x + length * 0.82, railY - unit * 0.14, unit * 0.14, wheelAngle, c);

  return { x: chimneyX, y: base - unit * 0.95 };
}

function drawWheel(ctx, x, y, r, angle, c) {
  ctx.fillStyle = c.wheel;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.lamp;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath();
  for (let i = 0; i < 2; i++) {
    const a = angle + (i * Math.PI) / 2;
    ctx.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
    ctx.lineTo(x - Math.cos(a) * r * 0.7, y - Math.sin(a) * r * 0.7);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawHills(ctx, w, baseY, offset, amplitude, frequency, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w + 16; x += 16) {
    const s = (x + offset) * frequency;
    ctx.lineTo(x, baseY - amplitude * (0.55 + 0.3 * Math.sin(s) + 0.15 * Math.sin(s * 2.3 + 1)));
  }
  ctx.lineTo(w, baseY);
  ctx.fill();
}

function drawTree(ctx, x, y, size, c) {
  ctx.fillStyle = c.trunk;
  ctx.fillRect(x - size * 0.1, y - size * 0.9, size * 0.2, size * 0.9);
  ctx.fillStyle = c.leaves;
  for (const [dx, dy, r] of [[0, -1.3, 0.55], [-0.35, -0.95, 0.42], [0.35, -0.95, 0.42]]) {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCloud(ctx, x, y, size) {
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.9, 0.2, 0.7], [0.3, -0.45, 0.7]]) {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

// A stable 0..1 for each tree index, so trees keep their look as they scroll by.
function hash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
