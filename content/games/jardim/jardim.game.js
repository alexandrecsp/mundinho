/**
 * Um jardim que cresce com o toque: onde o dedo encosta, nasce uma flor
 * que sobe até ali. Cada lugar da tela tem a sua nota, da esquerda (grave)
 * para a direita (aguda). Tocar numa flor aberta faz ela balançar e cantar.
 * Duas borboletas visitam as flores. Uma tecla planta uma flor qualquer.
 */
const MAX_FLOWERS = 14;
const GROW_SECONDS = 0.9;
const BLOOM_SECONDS = 0.5;
const WILT_SECONDS = 1;
const NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];

// Each flower brings its own hue; these set how bright the garden wears it.
const PALETTE = {
  light: {
    skyTop: '#cdeeff', skyBottom: '#fff6e0', sun: '#ffd75e', glow: [255, 215, 94], sunGlow: 0.45,
    grass: '#8fd17a', grassDark: '#6fbf5f', stem: '#4f9a46', leaf: '#62b356',
    petalSat: 85, petalLight: 72, center: '#ffcf3f', wingSat: 85, wingLight: 68, body: '#4a3b5c',
  },
  dark: {
    skyTop: '#0c1230', skyBottom: '#1d1a3a', sun: '#e9e3c4', glow: [233, 227, 196], sunGlow: 0.16,
    grass: '#1d3324', grassDark: '#162a1c', stem: '#2a4a2c', leaf: '#2f5532',
    petalSat: 45, petalLight: 45, center: '#a88a3a', wingSat: 45, wingLight: 50, body: '#2a2236',
  },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const flowers = [];
    const butterflies = Array.from({ length: 2 }, (_, i) => ({
      x: stage.width * (0.3 + i * 0.4),
      y: stage.height * 0.35,
      tx: stage.width / 2,
      ty: stage.height / 2,
      hue: stage.random(0, 360),
      phase: Math.random() * Math.PI * 2,
      retargetIn: 0,
    }));

    const groundY = () => stage.height * 0.8;
    const flowerSize = () => Math.min(stage.width, stage.height) * 0.06;
    const noteAt = (x) => NOTES[Math.min(NOTES.length - 1, Math.max(0, Math.floor((x / stage.width) * NOTES.length)))];

    function plant(x, y, delay = 0) {
      const top = stage.height * 0.22;
      const bottom = groundY() - flowerSize() * 2;
      flowers.push({
        x,
        headY: Math.min(bottom, Math.max(top, y)),
        hue: stage.random(0, 360),
        petals: stage.pick([5, 6, 8]),
        size: flowerSize() * stage.random(0.85, 1.2),
        note: noteAt(x),
        age: -delay,
        phase: Math.random() * Math.PI * 2,
        wiggle: 0,
        wilt: 0,
      });
      const living = flowers.filter((flower) => !flower.wilt);
      if (living.length > MAX_FLOWERS) living[0].wilt = 0.001;
    }

    function flowerAt(x, y) {
      return flowers.find((flower) => {
        if (flower.wilt || flower.age < GROW_SECONDS) return false;
        return Math.hypot(flower.x - x, flower.headY - y) < flower.size * 1.6;
      });
    }

    for (const [fx, fy, delay] of [[0.25, 0.5, 0.2], [0.55, 0.38, 0.9], [0.8, 0.55, 1.6]]) {
      plant(stage.width * fx, stage.height * fy, delay);
    }

    stage.onPress(({ x, y, source }) => {
      const hit = source === 'pointer' && flowerAt(x, y);
      if (hit) {
        hit.wiggle = 1;
        stage.audio.chime(hit.note);
        return;
      }
      plant(x, y);
      stage.audio.tone(noteAt(x), { wave: 'triangle', duration: 0.9, gain: 0.25 });
      stage.audio.tone(noteAt(x), { delay: GROW_SECONDS * 0.8, duration: 0.8, gain: 0.08 });
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const c = stage.colors(PALETTE);

      for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];
        flower.age += dt;
        flower.wiggle = Math.max(0, flower.wiggle - dt * 0.9);
        if (flower.wilt) {
          flower.wilt += dt / WILT_SECONDS;
          if (flower.wilt >= 1) flowers.splice(i, 1);
        }
      }

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, c.skyTop);
      sky.addColorStop(1, c.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      drawSun(ctx, w * 0.85, h * 0.14, Math.min(w, h) * 0.08, t, c);
      drawGround(ctx, w, h, groundY(), c);

      for (const flower of flowers) drawFlower(ctx, flower, groundY(), t, c);

      const open = flowers.filter((flower) => !flower.wilt && flower.age > GROW_SECONDS + BLOOM_SECONDS);
      for (const butterfly of butterflies) {
        butterfly.retargetIn -= dt;
        const close = Math.hypot(butterfly.tx - butterfly.x, butterfly.ty - butterfly.y) < 20;
        if (butterfly.retargetIn <= 0 || close) {
          const flower = open.length && Math.random() < 0.7 ? stage.pick(open) : null;
          butterfly.tx = flower ? flower.x : stage.random(w * 0.1, w * 0.9);
          butterfly.ty = flower ? flower.headY - flower.size * 1.2 : stage.random(h * 0.15, h * 0.6);
          butterfly.retargetIn = stage.random(3, 6);
        }
        const angle = Math.atan2(butterfly.ty - butterfly.y, butterfly.tx - butterfly.x);
        butterfly.x += Math.cos(angle) * 55 * dt;
        butterfly.y += Math.sin(angle) * 55 * dt + Math.sin(t * 3 + butterfly.phase) * 30 * dt;
        drawButterfly(ctx, butterfly, flowerSize() * 0.7, t, c);
      }
    });
  },
};

function drawSun(ctx, x, y, r, t, c) {
  const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4);
  const [r8, g8, b8] = c.glow.map(Math.round);
  glow.addColorStop(0, `rgba(${r8}, ${g8}, ${b8}, ${c.sunGlow})`);
  glow.addColorStop(1, `rgba(${r8}, ${g8}, ${b8}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + Math.sin(t * 0.8) * 0.03), 0, Math.PI * 2);
  ctx.fillStyle = c.sun;
  ctx.fill();
}

function drawGround(ctx, w, h, groundY, c) {
  ctx.fillStyle = c.grass;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w + 20; x += 20) ctx.lineTo(x, groundY + Math.sin(x * 0.02) * 6);
  ctx.lineTo(w, h);
  ctx.fill();
  ctx.fillStyle = c.grassDark;
  ctx.fillRect(0, groundY + (h - groundY) * 0.55, w, h);
}

function drawFlower(ctx, flower, groundY, t, c) {
  if (flower.age <= 0) return;
  const grow = easeOut(Math.min(1, flower.age / GROW_SECONDS));
  const bloom = easeOutBack(Math.min(1, Math.max(0, (flower.age - GROW_SECONDS * 0.7) / BLOOM_SECONDS)));
  const shrink = flower.wilt ? 1 - flower.wilt : 1;
  const sway = Math.sin(t * 1.3 + flower.phase) * 6 + Math.sin(flower.age * 14) * flower.wiggle * 16;
  const tipX = flower.x + sway * grow;
  const tipY = groundY - (groundY - flower.headY) * grow * shrink;

  ctx.strokeStyle = c.stem;
  ctx.lineWidth = Math.max(3, flower.size * 0.16);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(flower.x, groundY + 4);
  ctx.quadraticCurveTo(flower.x, (groundY + tipY) / 2, tipX, tipY);
  ctx.stroke();

  const leafY = groundY - (groundY - tipY) * 0.35;
  ctx.fillStyle = c.leaf;
  ctx.beginPath();
  ctx.ellipse(flower.x + flower.size * 0.45, leafY, flower.size * 0.5 * grow, flower.size * 0.2 * grow, -0.5, 0, Math.PI * 2);
  ctx.fill();

  const r = flower.size * bloom * shrink;
  if (r <= 0) return;
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(Math.sin(t * 0.7 + flower.phase) * 0.15 + flower.wiggle * Math.sin(flower.age * 18) * 0.4);
  ctx.fillStyle = `hsl(${flower.hue}, ${c.petalSat}%, ${c.petalLight}%)`;
  for (let i = 0; i < flower.petals; i++) {
    const angle = (i / flower.petals) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * r * 0.75, Math.sin(angle) * r * 0.75, r * 0.6, r * 0.36, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = c.center;
  ctx.fill();
  ctx.restore();
}

function drawButterfly(ctx, { x, y, tx, hue, phase }, size, t, c) {
  const flap = 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + phase));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(tx < x ? -1 : 1, 1);
  ctx.fillStyle = `hsl(${hue}, ${c.wingSat}%, ${c.wingLight}%)`;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * size * 0.55 * flap, -size * 0.3, size * 0.6 * flap, size * 0.55, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(side * size * 0.4 * flap, size * 0.35, size * 0.4 * flap, size * 0.35, -side * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function easeOut(p) {
  return 1 - (1 - p) ** 3;
}

function easeOutBack(p) {
  const k = 1.7;
  return 1 + (k + 1) * (p - 1) ** 3 + k * (p - 1) ** 2;
}
