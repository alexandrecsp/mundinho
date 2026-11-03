/**
 * Bolhas sobem devagar. Tocar numa bolha estoura; tocar no vazio faz uma
 * bolha nova nascer ali. Uma tecla estoura uma bolha qualquer.
 *
 * Cada bolha tem uma cor com nome e, se os pais deixarem ligado na Área dos
 * pais, traz o nome escrito dentro, em letras de bolha. Ao estourar, as
 * letras se espalham junto com ela. O bebê ainda não lê: a palavra é a
 * deixa para o adulto dizer "estourou a azul!".
 */
const MAX_BUBBLES = 16;
const BURST_SECONDS = 0.6;
const BIRTH_NOTES = ['C5', 'E5', 'G5', 'A5'];

// Few, clearly different hues, so the word always matches what is seen.
const COLORS = [
  { word: 'azul', hue: 210 },
  { word: 'verde', hue: 130 },
  { word: 'amarelo', hue: 50 },
  { word: 'roxo', hue: 275 },
  { word: 'rosa', hue: 330 },
];

// Lightness and alpha of the bubbles and their words, by day and by night.
const PALETTE = {
  light: { skyTop: '#e3f4ff', skyBottom: '#fff0f8', core: 96, coreAlpha: 0.5, rim: 72, rimAlpha: 0.45, line: 60, shine: 0.85, word: 40, wordOutline: 98 },
  dark: { skyTop: '#0f1433', skyBottom: '#25183d', core: 78, coreAlpha: 0.3, rim: 52, rimAlpha: 0.35, line: 68, shine: 0.5, word: 78, wordOutline: 18 },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const bubbles = [];
    const bursts = [];
    let spawnIn = 0;

    function spawn(x = stage.random(40, stage.width - 40), y = stage.height + 80) {
      const { word, hue } = stage.pick(COLORS);
      bubbles.push({
        x,
        y,
        r: stage.random(30, 70),
        hue,
        word,
        speed: stage.random(25, 55),
        phase: Math.random() * Math.PI * 2,
        grown: 0,
      });
    }

    function pop(bubble) {
      bubbles.splice(bubbles.indexOf(bubble), 1);
      bursts.push({ x: bubble.x, y: bubble.y, r: bubble.r, hue: bubble.hue, word: bubble.word, age: 0 });
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

      const c = stage.colors(PALETTE);
      const sky = ctx.createLinearGradient(0, 0, 0, stage.height);
      sky.addColorStop(0, c.skyTop);
      sky.addColorStop(1, c.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, stage.width, stage.height);

      const words = stage.colorWords;
      for (const bubble of bubbles) drawBubble(ctx, bubble, c, words);
      for (const burst of bursts) drawBurst(ctx, burst, c, words);
    });
  },
};

function drawBubble(ctx, { x, y, r, hue, word, grown }, c, words) {
  const radius = r * easeOutBack(grown);
  if (radius <= 0) return;
  const body = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
  body.addColorStop(0, `hsla(${hue}, 100%, ${c.core}%, ${c.coreAlpha})`);
  body.addColorStop(1, `hsla(${hue}, 90%, ${c.rim}%, ${c.rimAlpha})`);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = `hsla(${hue}, 80%, ${c.line}%, 0.8)`;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(x - radius * 0.38, y - radius * 0.42, radius * 0.22, radius * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${c.shine})`;
  ctx.fill();

  if (words) drawWord(ctx, { word, x, y, size: radius * 0.42, maxWidth: radius * 1.6, spread: 0, alpha: 1, hue }, c);
}

/**
 * The colour's name in round, outlined "bubble" letters. `spread` pushes
 * the letters apart from the centre as the bubble bursts.
 */
function drawWord(ctx, { word, x, y, size, maxWidth, spread, alpha, hue }, c) {
  if (size < 6) return; // a bubble just being born is too small to read
  ctx.font = `600 ${Math.round(size)}px Fredoka, sans-serif`;
  const fullWidth = ctx.measureText(word).width;
  if (fullWidth > maxWidth) {
    size *= maxWidth / fullWidth;
    ctx.font = `600 ${Math.round(size)}px Fredoka, sans-serif`;
  }
  const letters = [...word];
  const widths = letters.map((letter) => ctx.measureText(letter).width);
  const total = widths.reduce((sum, width) => sum + width, 0);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.22;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `hsl(${hue}, 45%, ${c.wordOutline}%)`;
  ctx.fillStyle = `hsl(${hue}, 70%, ${c.word}%)`;
  let left = -total / 2;
  letters.forEach((letter, i) => {
    const offset = left + widths[i] / 2;
    const lx = x + offset * (1 + spread);
    const ly = y + (i % 2 ? -1 : 1) * spread * size * 0.6;
    ctx.strokeText(letter, lx, ly);
    ctx.fillText(letter, lx, ly);
    left += widths[i];
  });
  ctx.restore();
}

function drawBurst(ctx, { x, y, r, hue, word, age }, c, words) {
  const progress = age / BURST_SECONDS;
  const alpha = 1 - progress;
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + progress * 0.8), 0, Math.PI * 2);
  ctx.lineWidth = 4 * alpha;
  ctx.strokeStyle = `hsla(${hue}, 80%, ${c.line}%, ${alpha})`;
  ctx.stroke();

  ctx.fillStyle = `hsla(${hue}, 85%, ${c.line + 5}%, ${alpha})`;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = r * (1 + progress * 1.6);
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, 6 * alpha + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!words) return;
  const grow = 1 + progress * 0.3;
  drawWord(ctx, { word, x, y, size: r * 0.42 * grow, maxWidth: r * 1.6 * grow, spread: progress * 1.2, alpha, hue }, c);
}

function easeOutBack(p) {
  const c = 1.7;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
}
