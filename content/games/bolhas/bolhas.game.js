/**
 * Bolhas sobem devagar. Tocar numa bolha estoura; tocar no vazio faz uma
 * bolha nova nascer ali. Uma tecla estoura uma bolha qualquer.
 *
 * Se os pais deixarem ligado na Área dos pais, cada bolha tem o contorno de
 * um bichinho (urso, gato, coelho, peixinho, pintinho), como um balão de
 * festa: mais uma coisa para o adulto nomear. Desligado, são redondas.
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

/*
 * Each animal is a round body with a few bumps on its rim (ears, tail, tuft,
 * beak). A bump replaces the slice of the circle from `at - half` to
 * `at + half` (radians, 0 = right, growing clockwise, top = -PI/2) with a
 * path drawn in the bump's own frame: `out` away from the centre, `side`
 * clockwise along the rim, both in body radii. Bumps go in angle order.
 */
const ANIMALS = {
  urso: [lobe(-2.2, 0.32, 0.6, 0.28), lobe(-0.94, 0.32, 0.6, 0.28)],
  gato: [peaks(-2.15, 0.36, [1.55, -0.12]), peaks(-0.99, 0.36, [1.55, 0.12])],
  coelho: [lobe(-1.87, 0.18, 1.6, 0.2), lobe(-1.27, 0.18, 1.6, 0.2)],
  peixinho: [peaks(-1.45, 0.4, [1.35, 0.35]), peaks(0, 0.3, [1.6, -0.6], [1.3, 0], [1.6, 0.6])],
  pintinho: [
    lobe(-1.85, 0.1, 0.35, 0.08),
    lobe(-1.57, 0.1, 0.45, 0.08),
    lobe(-1.29, 0.1, 0.35, 0.08),
    peaks(0.15, 0.17, [1.4, 0.05]),
  ],
};
const ANIMAL_KINDS = Object.keys(ANIMALS);

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
        animal: stage.animalShapes ? stage.pick(ANIMAL_KINDS) : null,
        flip: Math.random() < 0.5, // fish and chicks face either way
        speed: stage.random(25, 55),
        phase: Math.random() * Math.PI * 2,
        grown: 0,
      });
    }

    function pop(bubble) {
      bubbles.splice(bubbles.indexOf(bubble), 1);
      const { x, y, r, hue, word, animal, flip } = bubble;
      bursts.push({ x, y, r, hue, word, animal, flip, age: 0 });
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

function drawBubble(ctx, { x, y, r, hue, word, animal, flip, grown }, c, words) {
  const radius = r * easeOutBack(grown);
  if (radius <= 0) return;
  const body = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius * (animal ? 1.4 : 1));
  body.addColorStop(0, `hsla(${hue}, 100%, ${c.core}%, ${c.coreAlpha})`);
  body.addColorStop(1, `hsla(${hue}, 90%, ${c.rim}%, ${c.rimAlpha})`);
  traceAnimal(ctx, animal, x, y, radius, flip);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
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

function drawBurst(ctx, { x, y, r, hue, word, animal, flip, age }, c, words) {
  const progress = age / BURST_SECONDS;
  const alpha = 1 - progress;
  traceAnimal(ctx, animal, x, y, r * (1 + progress * 0.8), flip);
  ctx.lineWidth = 4 * alpha;
  ctx.lineJoin = 'round';
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

/**
 * Builds the animal's outline as the current path, ready to fill or stroke;
 * a plain circle when there is no animal.
 */
function traceAnimal(ctx, animal, x, y, r, flip) {
  if (!animal) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    return;
  }
  const bumps = ANIMALS[animal];
  const last = bumps[bumps.length - 1];
  let from = last.at + last.half - Math.PI * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -r : r, r);
  ctx.beginPath();
  ctx.moveTo(Math.cos(from), Math.sin(from));
  for (const { at, half, segments } of bumps) {
    ctx.arc(0, 0, 1, from, at - half);
    const ux = Math.cos(at);
    const uy = Math.sin(at);
    for (const segment of segments) {
      const points = segment.flatMap(([out, side]) => [ux * out - uy * side, uy * out + ux * side]);
      if (segment.length === 1) ctx.lineTo(...points);
      else ctx.bezierCurveTo(...points);
    }
    from = at + half;
  }
  ctx.closePath();
  ctx.restore(); // the path keeps its shape; the stroke width does not scale
}

/** A rounded ear or tuft: `out` sets how far it pokes, `width` how fat. */
function lobe(at, half, out, width) {
  const base = Math.cos(half);
  const edge = Math.sin(half);
  return { at, half, segments: [[[base + out, -edge - width], [base + out, edge + width], [base, edge]]] };
}

/** A pointy ear, beak, fin or tail, through the given corners. */
function peaks(at, half, ...corners) {
  const end = [Math.cos(half), Math.sin(half)];
  return { at, half, segments: [...corners, end].map((corner) => [corner]) };
}

function easeOutBack(p) {
  const c = 1.7;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
}
