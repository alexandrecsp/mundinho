/**
 * Uma lagoa calma. Tocar na água faz ondinhas e um "plim"; o patinho nada
 * devagar até onde o dedo tocou. Tocar no patinho faz ele pular e grasnar.
 * De vez em quando um peixinho salta. Uma tecla faz ondinhas num lugar qualquer.
 */
const RIPPLE_SECONDS = 2.4;
const FISH_SECONDS = 1.1;
const DROP_NOTES = ['G5', 'A5', 'C6', 'D6', 'E6'];

// Each fish brings its own hue; the rest of the pond comes from here.
const PALETTE = {
  light: {
    waterTop: '#9fe0f0', waterBottom: '#5ab8d6', ripple: '#ffffff', rippleAlpha: 0.7, glint: 0.5,
    pad: '#6cc27a', padDark: '#4fa35f', lotus: '#ffb3d1',
    duck: '#ffd84d', wing: '#f0c030', beak: '#ff9a3c', eye: '#2b2b38', fishSat: 85, fishLight: 62,
  },
  dark: {
    waterTop: '#0f2a3a', waterBottom: '#08161f', ripple: '#b8d8ff', rippleAlpha: 0.3, glint: 0.18,
    pad: '#1f4a2c', padDark: '#163822', lotus: '#7a5a72',
    duck: '#b49a3c', wing: '#9a8030', beak: '#a8642a', eye: '#14141c', fishSat: 45, fishLight: 42,
  },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const ripples = [];
    const fishes = [];
    const pending = [];
    const pads = [[0.15, 0.25, 1], [0.82, 0.2, 0.8], [0.1, 0.78, 0.9], [0.88, 0.72, 1.1], [0.62, 0.88, 0.7]].map(
      ([x, y, scale]) => ({ x, y, scale, angle: Math.random() * Math.PI * 2, lotus: Math.random() < 0.5 }),
    );
    const glints = Array.from({ length: 24 }, () => ({ x: Math.random(), y: Math.random(), phase: Math.random() * Math.PI * 2 }));
    const duck = { x: stage.width / 2, y: stage.height / 2, vx: 0, vy: 0, tx: stage.width / 2, ty: stage.height / 2, facing: 1, hop: 0, wakeIn: 0 };
    let nextFish = 4;

    const unit = () => Math.min(stage.width, stage.height);

    function ripple(x, y, size = 1) {
      ripples.push({ x, y, size, age: 0 });
      if (ripples.length > 30) ripples.shift();
    }

    function jumpFish(x, y) {
      fishes.push({ x, y, dir: Math.random() < 0.5 ? -1 : 1, hue: stage.random(0, 360), age: 0 });
      ripple(x, y, 0.6);
    }

    function quack() {
      for (const delay of [0, 0.22]) stage.audio.tone(330, { delay, wave: 'sawtooth', glideTo: 230, duration: 0.16, gain: 0.06 });
    }

    stage.onPress(({ x, y, source }) => {
      if (source === 'pointer' && Math.hypot(duck.x - x, duck.y - y) < unit() * 0.12) {
        duck.hop = 1;
        quack();
        return;
      }
      ripple(x, y);
      const note = stage.pick(DROP_NOTES);
      stage.audio.tone(note, { glideTo: note.replace(/\d/, (o) => Number(o) + 1), duration: 0.18, gain: 0.25 });
      duck.tx = x;
      duck.ty = y;
      if (Math.random() < 0.35) {
        pending.push({ in: 0.5, x: x + stage.random(-1, 1) * unit() * 0.15, y: y + stage.random(-1, 1) * unit() * 0.1 });
      }
    });

    stage.onFrame((dt, t) => {
      const w = stage.width;
      const h = stage.height;
      const u = unit();
      const c = stage.colors(PALETTE);

      nextFish -= dt;
      if (nextFish <= 0) {
        jumpFish(stage.random(0.2, 0.8) * w, stage.random(0.25, 0.85) * h);
        nextFish = stage.random(5, 9);
      }
      for (let i = pending.length - 1; i >= 0; i--) {
        pending[i].in -= dt;
        if (pending[i].in <= 0) {
          jumpFish(pending[i].x, pending[i].y);
          pending.splice(i, 1);
        }
      }

      // The duck paddles toward its target on a soft spring.
      duck.vx += ((duck.tx - duck.x) * 0.9 - duck.vx * 1.6) * dt;
      duck.vy += ((duck.ty - duck.y) * 0.9 - duck.vy * 1.6) * dt;
      duck.x += duck.vx * dt;
      duck.y += duck.vy * dt;
      if (Math.abs(duck.vx) > 8) duck.facing += (Math.sign(duck.vx) - duck.facing) * Math.min(1, dt * 5);
      duck.hop = Math.max(0, duck.hop - dt * 2);
      duck.wakeIn -= dt;
      if (duck.wakeIn <= 0 && Math.hypot(duck.vx, duck.vy) > 25) {
        ripple(duck.x - duck.facing * u * 0.05, duck.y + u * 0.02, 0.35);
        duck.wakeIn = 0.45;
      }

      const water = ctx.createLinearGradient(0, 0, 0, h);
      water.addColorStop(0, c.waterTop);
      water.addColorStop(1, c.waterBottom);
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = c.ripple;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (const glint of glints) {
        ctx.globalAlpha = c.glint * (0.5 + 0.5 * Math.sin(t * 0.9 + glint.phase));
        const gx = ((glint.x * w + t * 6) % (w + 40)) - 20;
        ctx.beginPath();
        ctx.moveTo(gx, glint.y * h);
        ctx.lineTo(gx + u * 0.03, glint.y * h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += dt;
        if (r.age > RIPPLE_SECONDS) {
          ripples.splice(i, 1);
          continue;
        }
        drawRipple(ctx, r, u, c);
      }

      for (const pad of pads) drawPad(ctx, pad.x * w, pad.y * h, u * 0.08 * pad.scale, pad, t, c);

      for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        fish.age += dt;
        if (fish.age >= FISH_SECONDS) {
          ripple(fish.x + fish.dir * u * 0.2, fish.y, 0.6);
          stage.audio.tone('E5', { glideTo: 'A5', duration: 0.14, gain: 0.12 });
          fishes.splice(i, 1);
          continue;
        }
        drawFish(ctx, fish, u, c);
      }

      drawDuck(ctx, duck, u * 0.07, t, c);
    });
  },
};

function drawRipple(ctx, { x, y, size, age }, u, c) {
  ctx.strokeStyle = c.ripple;
  for (const delay of [0, 0.3, 0.6]) {
    const a = age - delay;
    if (a <= 0) continue;
    const p = a / (RIPPLE_SECONDS - 0.6);
    if (p >= 1) continue;
    const radius = u * 0.18 * size * Math.sqrt(p);
    ctx.globalAlpha = c.rippleAlpha * (1 - p);
    ctx.lineWidth = 3 * (1 - p) + 1;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPad(ctx, x, y, r, { angle, lotus }, t, c) {
  const drift = Math.sin(t * 0.4 + angle) * 0.05;
  ctx.fillStyle = c.pad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.ellipse(x, y, r, r * 0.7, 0, angle + drift + 0.35, angle + drift + Math.PI * 2 - 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = c.padDark;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (!lotus) return;
  ctx.fillStyle = c.lotus;
  for (let i = 0; i < 6; i++) {
    const petal = (i / 6) * Math.PI * 2 + t * 0.05;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(petal) * r * 0.22, y - r * 0.1 + Math.sin(petal) * r * 0.12, r * 0.25, r * 0.12, petal, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFish(ctx, { x, y, dir, hue, age }, u, c) {
  const p = age / FISH_SECONDS;
  const span = u * 0.2;
  const height = u * 0.14;
  const fx = x + dir * p * span;
  const fy = y - Math.sin(p * Math.PI) * height;
  const slope = -Math.cos(p * Math.PI) * height * Math.PI;
  const s = u * 0.035;

  ctx.save();
  ctx.translate(fx, fy);
  ctx.scale(dir, 1);
  ctx.rotate(Math.atan2(slope, span));
  ctx.fillStyle = `hsl(${hue}, ${c.fishSat}%, ${c.fishLight}%)`;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.3, s * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 1.1, 0);
  ctx.lineTo(-s * 1.9, -s * 0.6);
  ctx.lineTo(-s * 1.9, s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(s * 0.7, -s * 0.15, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDuck(ctx, duck, s, t, c) {
  const hop = Math.sin(duck.hop * Math.PI) * s * 0.9;
  const bob = Math.sin(t * 2.2) * s * 0.06;

  ctx.save();
  ctx.translate(duck.x, duck.y + bob);

  ctx.globalAlpha = 0.25;
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.55, s * 1.4 * (1 - duck.hop * 0.3), s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.translate(0, -hop);
  ctx.scale(duck.facing, 1);

  ctx.fillStyle = c.duck;
  ctx.beginPath();
  ctx.moveTo(-s * 1.1, -s * 0.1);
  ctx.lineTo(-s * 1.6, -s * 0.6);
  ctx.lineTo(-s * 0.9, -s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.3, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.85, -s * 0.85, s * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.wing;
  ctx.beginPath();
  ctx.ellipse(-s * 0.15, -s * 0.05, s * 0.65, s * 0.38, -0.2 + Math.sin(duck.hop * Math.PI) * -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.beak;
  ctx.beginPath();
  ctx.ellipse(s * 1.42, -s * 0.75, s * 0.32, s * 0.14, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(s * 1.0, -s * 0.98, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
