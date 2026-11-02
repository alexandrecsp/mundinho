/**
 * O dedo deixa um rastro de luzinhas coloridas: num céu claro de dia, num
 * céu estrelado à noite. Quanto mais alto o toque, mais aguda a nota. Sem
 * ninguém tocando, um cometa desenha sozinho, convidando a brincar.
 */
const SCALE = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
const MAX_SPARKS = 700;
const COMET_AFTER_SECONDS = 4;

// Light sparks add up on a dark sky ('lighter') but would wash out to
// white on a light one, so by day they are deeper and simply painted over.
const PALETTE = {
  light: { ground: '#f4f1ff', dots: '#c9c0ef', dotsAlpha: 0.8, spark: 50, halo: 75, haloAlpha: 0.35, blend: 'source-over' },
  dark: { ground: '#0b1036', dots: '#ffffff', dotsAlpha: 0.35, spark: 70, halo: 60, haloAlpha: 0.12, blend: 'lighter' },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    const sparks = [];
    const backdrop = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: stage.random(0.5, 1.6) }));
    let clock = 0;
    let lastNoteAt = 0;
    let cometNoteIn = 0;

    function emit(x, y, count, speed) {
      for (let i = 0; i < count && sparks.length < MAX_SPARKS; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * speed;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          decay: stage.random(0.35, 0.7),
          size: stage.random(2, 6),
          hue: (clock * 40 + stage.random(-20, 20) + 360) % 360,
        });
      }
    }

    function sing(y, gain) {
      const step = Math.round((1 - y / stage.height) * (SCALE.length - 1));
      stage.audio.tone(SCALE[Math.max(0, Math.min(SCALE.length - 1, step))], { duration: 0.8, gain });
    }

    stage.onPress(({ x, y }) => {
      emit(x, y, 40, 160);
      sing(y, 0.25);
    });

    stage.onDrag(({ x, y }) => {
      emit(x, y, 4, 40);
      if (clock - lastNoteAt > 0.15) {
        lastNoteAt = clock;
        sing(y, 0.15);
      }
    });

    stage.onFrame((dt, t) => {
      clock = t;

      if (stage.idleSeconds > COMET_AFTER_SECONDS) {
        const x = stage.width * (0.5 + 0.35 * Math.sin(t * 0.7));
        const y = stage.height * (0.5 + 0.3 * Math.sin(t * 1.1));
        emit(x, y, 3, 30);
        cometNoteIn -= dt;
        if (cometNoteIn <= 0) {
          cometNoteIn = 1.2;
          sing(y, 0.08);
        }
      }

      const drag = Math.max(0, 1 - 1.5 * dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.vx *= drag;
        spark.vy = spark.vy * drag + 20 * dt;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.life -= spark.decay * dt;
        if (spark.life <= 0) sparks.splice(i, 1);
      }

      const c = stage.colors(PALETTE);
      ctx.fillStyle = c.ground;
      ctx.fillRect(0, 0, stage.width, stage.height);
      ctx.fillStyle = c.dots;
      ctx.globalAlpha = c.dotsAlpha;
      for (const star of backdrop) {
        ctx.beginPath();
        ctx.arc(star.x * stage.width, star.y * stage.height, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = c.blend;
      for (const spark of sparks) {
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${spark.hue}, 90%, ${c.halo}%, ${spark.life * c.haloAlpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * (0.5 + spark.life * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${spark.hue}, 95%, ${c.spark}%, ${spark.life})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    });
  },
};
