/**
 * Esconde-esconde: um bichinho fica atrás da mantinha. Um toque (ou a
 * espera de alguns segundos) puxa a manta, e o bichinho aparece com um
 * "buu!". Depois a manta volta e outro bichinho se esconde.
 *
 * Cada toque no bichinho toca a nota seguinte do primeiro verso de uma
 * cantiga, uma nota por sílaba, para o adulto cantar junto. O verso continua
 * de onde parou quando o próximo bichinho aparece. Quando o verso acaba, vêm
 * alguns toques de notas soltas e depois outra cantiga, por sorteio. Versos
 * curtos se repetem mais e ficam fáceis de reconhecer.
 */
const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐸', '🐵', '🦁', '🐮', '🐷', '🐥', '🐨'];
const REVEAL_SECONDS = 0.5;
const SHOW_SECONDS = 2.8;
const HIDE_SECONDS = 0.7;
const AUTO_REVEAL_SECONDS = 5;

// O primeiro verso de cantigas de domínio público, todas em dó maior para
// combinar com o acorde da revelação. Para acrescentar uma, escreva as
// notas separadas por espaço, uma por sílaba, e a letra no comentário.
const SONGS = [
  {
    title: 'Brilha, Brilha Estrelinha',
    // Brilha, brilha, estrelinha / Quero ver você brilhar
    notes: 'C5 C5 G5 G5 A5 A5 G5 F5 F5 E5 E5 D5 D5 C5',
  },
  {
    title: 'Seu Lobato Tinha um Sítio',
    // Seu Lobato tinha um sítio / Ia, ia, ô
    notes: 'C5 C5 C5 G4 A4 A4 G4 E5 E5 D5 D5 C5',
  },
  {
    title: 'Frei Martinho',
    // Frei Martinho, Frei Martinho / Dormes tu? Dormes tu?
    notes: 'C5 D5 E5 C5 C5 D5 E5 C5 E5 F5 G5 E5 F5 G5',
  },
  {
    title: 'Ciranda, Cirandinha',
    // Ciranda, cirandinha / Vamos todos cirandar
    notes: 'G4 C5 C5 E5 E5 G5 G5 F5 E5 D5 G5 E5 D5 C5',
  },
  {
    title: 'Marcha Soldado',
    // Marcha, soldado / Cabeça de papel
    notes: 'G5 G5 E5 C5 C5 E5 G5 G5 G5 E5 D5',
  },
  {
    title: 'O Sapo Não Lava o Pé',
    // O sapo não lava o pé
    notes: 'G4 C5 C5 G4 A4 G4 E4',
  },
].map((song) => ({ ...song, notes: song.notes.split(' ') }));

// Between two songs, a few taps play loose notes from the reveal chord.
const FREE_NOTES = ['C5', 'E5', 'G5'];
const FREE_TAPS_BETWEEN_SONGS = 8;

// Each animal brings its own hue; these set how bright the scene wears it.
const PALETTE = {
  light: { sat: 80, light: 88, blanketSat: 70, blanketLight: 62, hemLight: 48, dots: 0.45, text: 35 },
  dark: { sat: 35, light: 18, blanketSat: 45, blanketLight: 38, hemLight: 28, dots: 0.22, text: 80 },
};

export default {
  mount(stage) {
    const { ctx } = stage;
    let animal = stage.pick(ANIMALS);
    let hue = stage.random(0, 360);
    let phase = 'hidden'; // hidden → revealing → shown → hiding → hidden
    let phaseTime = 0;
    let cover = 1; // 1: the blanket is fully over the animal
    let bounce = 0;
    let song = stage.pick(SONGS);
    let noteIndex = 0;
    let freeTapsLeft = 0;

    function enter(next) {
      phase = next;
      phaseTime = 0;
    }

    function reveal() {
      enter('revealing');
      stage.audio.tone('G4', { glideTo: 'C6', duration: 0.35, gain: 0.3 });
      for (const note of ['C5', 'E5', 'G5']) stage.audio.tone(note, { delay: 0.3, wave: 'triangle', duration: 1.1, gain: 0.18 });
    }

    function nextAnimal() {
      const others = ANIMALS.filter((candidate) => candidate !== animal);
      animal = stage.pick(others);
      hue = (hue + 70) % 360;
    }

    // The song carries on across animals; at its end come a few loose
    // notes, then a new song drawn at random.
    function nextNote() {
      if (freeTapsLeft > 0) {
        freeTapsLeft -= 1;
        return stage.pick(FREE_NOTES);
      }
      const note = song.notes[noteIndex];
      noteIndex += 1;
      if (noteIndex === song.notes.length) {
        song = stage.pick(SONGS.filter((candidate) => candidate !== song));
        noteIndex = 0;
        freeTapsLeft = FREE_TAPS_BETWEEN_SONGS;
      }
      return note;
    }

    stage.onPress(() => {
      if (phase === 'hidden') {
        reveal();
      } else if (phase === 'shown') {
        bounce = 1;
        phaseTime = Math.min(phaseTime, SHOW_SECONDS - 1.5);
        stage.audio.tone(nextNote(), { wave: 'triangle', duration: 0.5, gain: 0.3 });
      }
    });

    stage.onFrame((dt, t) => {
      phaseTime += dt;
      bounce = Math.max(0, bounce - dt * 2.5);

      if (phase === 'hidden' && phaseTime > AUTO_REVEAL_SECONDS) reveal();
      if (phase === 'revealing') {
        cover = Math.max(0, 1 - phaseTime / REVEAL_SECONDS);
        if (cover === 0) {
          enter('shown');
          bounce = 1;
        }
      }
      if (phase === 'shown' && phaseTime > SHOW_SECONDS) {
        enter('hiding');
        stage.audio.tone('C5', { glideTo: 'G4', duration: 0.4, gain: 0.12 });
      }
      if (phase === 'hiding') {
        cover = Math.min(1, phaseTime / HIDE_SECONDS);
        if (cover === 1) {
          enter('hidden');
          nextAnimal();
        }
      }

      const w = stage.width;
      const h = stage.height;
      const size = Math.min(w, h) * 0.42;
      const cx = w / 2;
      const cy = h * 0.46;
      const c = stage.colors(PALETTE);

      ctx.fillStyle = `hsl(${hue}, ${c.sat}%, ${c.light}%)`;
      ctx.fillRect(0, 0, w, h);

      const scale = 1 + Math.sin(bounce * Math.PI) * 0.18;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.font = stage.emojiFont(size);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(animal, 0, 0);
      ctx.restore();

      if (phase === 'shown') {
        ctx.globalAlpha = Math.min(1, phaseTime * 3);
        ctx.font = `600 ${Math.round(size * 0.28)}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `hsl(${hue}, 55%, ${c.text}%)`;
        ctx.fillText('Achou!', cx, cy + size * 0.8);
        ctx.globalAlpha = 1;
      }

      if (cover > 0) drawBlanket(ctx, { cx, cy, size, h, hue, cover, t, waiting: phase === 'hidden', c });
    });
  },
};

function drawBlanket(ctx, { cx, cy, size, h, hue, cover, t, waiting, c }) {
  const width = size * 1.7;
  const height = size * 1.6;
  const restingTop = cy - height / 2;
  const eased = cover * cover * (3 - 2 * cover);
  const top = restingTop + (1 - eased) * (h - restingTop + 20);

  ctx.save();
  ctx.translate(cx, top + height / 2);
  if (waiting) ctx.rotate(Math.sin(t * 2.2) * 0.03); // a little wiggle that says "tap me"

  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, size * 0.18);
  ctx.fillStyle = `hsl(${(hue + 180) % 360}, ${c.blanketSat}%, ${c.blanketLight}%)`;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = `rgba(255, 255, 255, ${c.dots})`;
  const gap = size * 0.22;
  for (let y = -height / 2; y < height / 2 + gap; y += gap) {
    for (let x = -width / 2; x < width / 2 + gap; x += gap) {
      const offset = Math.round((y + height / 2) / gap) % 2 ? gap / 2 : 0;
      ctx.beginPath();
      ctx.arc(x + offset, y, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = `hsl(${(hue + 180) % 360}, 60%, ${c.hemLight}%)`;
  ctx.fillRect(-width / 2, height / 2 - size * 0.14, width, size * 0.14);
  ctx.restore();
  ctx.restore();
}
