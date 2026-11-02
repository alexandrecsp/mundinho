/**
 * Faixas coloridas, cada uma com uma nota da escala pentatônica, então
 * qualquer combinação soa bonita. Arrastar o dedo faz um glissando, e a
 * carinha de cada faixa pula quando sua nota toca.
 */
const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
const COLORS = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#2ec4b6', '#1982c4', '#4267ac', '#6a4c93'];
const NARROW_BANDS = 5;

export default {
  mount(stage) {
    const { ctx } = stage;
    const glow = NOTES.map(() => 0);
    const floating = [];
    const bandOfPointer = new Map();

    const bandCount = () => (stage.width < 600 ? NARROW_BANDS : NOTES.length);
    const bandWidth = () => stage.width / bandCount();
    const bandAt = (x) => Math.max(0, Math.min(bandCount() - 1, Math.floor(x / bandWidth())));

    function play(index, y) {
      glow[index] = 1;
      stage.audio.tone(NOTES[index], { wave: 'triangle', duration: 1, gain: 0.35 });
      const width = bandWidth();
      floating.push({ x: width * (index + 0.5) + stage.random(-width * 0.2, width * 0.2), y, life: 1 });
    }

    stage.onPress(({ x, y, id, source, key }) => {
      if (source === 'key') {
        play(hash(key) % bandCount(), stage.height * 0.6);
        return;
      }
      const index = bandAt(x);
      bandOfPointer.set(id, index);
      play(index, y);
    });

    stage.onDrag(({ x, y, id }) => {
      const index = bandAt(x);
      if (bandOfPointer.get(id) === index) return;
      bandOfPointer.set(id, index);
      play(index, y);
    });

    stage.onFrame((dt, t) => {
      const count = bandCount();
      const width = bandWidth();
      const h = stage.height;
      ctx.fillStyle = '#fff8ef';
      ctx.fillRect(0, 0, stage.width, h);

      for (let i = 0; i < count; i++) {
        glow[i] = Math.max(0, glow[i] - dt * 1.5);
        const x = i * width;

        ctx.beginPath();
        ctx.roundRect(x + 6, 6, width - 12, h - 12, 28);
        ctx.fillStyle = COLORS[i];
        ctx.fill();
        if (glow[i] > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${glow[i] * 0.45})`;
          ctx.fill();
        }

        const r = Math.min(width * 0.32, h * 0.1);
        const hop = Math.sin(glow[i] * Math.PI) * h * 0.12;
        const bob = Math.sin(t * 2 + i) * 3;
        drawFace(ctx, x + width / 2, h - r * 1.8 - hop + bob, r);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = floating.length - 1; i >= 0; i--) {
        const note = floating[i];
        note.life -= dt * 0.6;
        note.y -= 70 * dt;
        if (note.life <= 0) {
          floating.splice(i, 1);
          continue;
        }
        ctx.font = `${Math.round(40 + (1 - note.life) * 20)}px sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${note.life})`;
        ctx.fillText('♪', note.x, note.y);
      }
    });
  },
};

function drawFace(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.fillStyle = '#2b2540';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * r * 0.35, y - r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.4, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.lineWidth = r * 0.1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2b2540';
  ctx.stroke();
}

function hash(text = '') {
  let n = 0;
  for (const char of text) n = (n * 31 + char.charCodeAt(0)) >>> 0;
  return n;
}
