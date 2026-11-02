/**
 * Bolhas sobem devagar. Tocar numa bolha estoura; tocar no vazio faz uma
 * bolha nova nascer ali. Uma tecla estoura uma bolha qualquer.
 */
const MAX_BUBBLES = 16;
const BURST_SECONDS = 0.6;
const BIRTH_NOTES = ['C5', 'E5', 'G5', 'A5'];

export default {
  mount(stage) {
    const { ctx } = stage;
    const bubbles = [];
    const bursts = [];
    let spawnIn = 0;

    function spawn(x = stage.random(40, stage.width - 40), y = stage.height + 80) {
      bubbles.push({
        x,
        y,
        r: stage.random(30, 70),
        hue: stage.random(170, 330),
        speed: stage.random(25, 55),
        phase: Math.random() * Math.PI * 2,
        grown: 0,
      });
    }

    function pop(bubble) {
      bubbles.splice(bubbles.indexOf(bubble), 1);
      bursts.push({ x: bubble.x, y: bubble.y, r: bubble.r, hue: bubble.hue, age: 0 });
      stage.audio.pop();
    }

    // Generous hit area: small fingers land near, not on.
    function bubbleAt(x, y) {
      let found = null;
      let closest = Infinity;
      for (const bubble of bubbles) {
        const distance = Math.hypot(bubble.x - x, bubble.y - y);
        if (distance < bubble.r * 1.4 && distance < closest) {
          found = bubble;
          closest = distance;
        }
      }
      return found;
    }

    for (let i = 0; i < 6; i++) spawn(undefined, stage.random(stage.height * 0.3, stage.height));

    stage.onPress(({ x, y, source }) => {
      if (source === 'key') {
        if (bubbles.length) pop(stage.pick(bubbles));
        return;
      }
      const hit = bubbleAt(x, y);
      if (hit) {
        pop(hit);
      } else {
        spawn(x, y);
        stage.audio.tone(stage.pick(BIRTH_NOTES), { duration: 0.4, gain: 0.2 });
      }
    });

    stage.onFrame((dt, t) => {
      spawnIn -= dt;
      if (spawnIn <= 0 && bubbles.length < MAX_BUBBLES) {
        spawn();
        spawnIn = stage.random(0.6, 1.4);
      }

      for (const bubble of bubbles) {
        bubble.y -= bubble.speed * dt;
        bubble.x += Math.sin(t * 1.2 + bubble.phase) * 12 * dt;
        bubble.grown = Math.min(1, bubble.grown + dt * 2.5);
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].y < -bubbles[i].r * 2) bubbles.splice(i, 1);
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].age += dt;
        if (bursts[i].age > BURST_SECONDS) bursts.splice(i, 1);
      }

      const sky = ctx.createLinearGradient(0, 0, 0, stage.height);
      sky.addColorStop(0, '#e3f4ff');
      sky.addColorStop(1, '#fff0f8');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, stage.width, stage.height);

      for (const bubble of bubbles) drawBubble(ctx, bubble);
      for (const burst of bursts) drawBurst(ctx, burst);
    });
  },
};

function drawBubble(ctx, { x, y, r, hue, grown }) {
  const radius = r * easeOutBack(grown);
  if (radius <= 0) return;
  const body = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
  body.addColorStop(0, `hsla(${hue}, 100%, 96%, 0.5)`);
  body.addColorStop(1, `hsla(${hue}, 90%, 72%, 0.45)`);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(x - radius * 0.38, y - radius * 0.42, radius * 0.22, radius * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();
}

function drawBurst(ctx, { x, y, r, hue, age }) {
  const progress = age / BURST_SECONDS;
  const alpha = 1 - progress;
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + progress * 0.8), 0, Math.PI * 2);
  ctx.lineWidth = 4 * alpha;
  ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
  ctx.stroke();

  ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = r * (1 + progress * 1.6);
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, 6 * alpha + 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function easeOutBack(p) {
  const c = 1.7;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
}
