import { h } from '../../../../shared/ui/dom.js';

const MINUTE = 60_000;
const LIMIT_CHOICES = [5, 10, 15, 20, 30, null];

/** The parents' corner of the home page: today's usage and the daily limit. */
export function renderScreenTimePanel({ getScreenTime, setScreenTimeLimit, resetScreenTime }) {
  const panel = h('section', { class: 'parents', 'aria-labelledby': 'parents-title' });

  function draw(time = getScreenTime.execute()) {
    // h() skips false children; replaceChildren() would print them.
    const content = h('div', {},
      h('div', { class: 'parents-head' },
        h('h2', { id: 'parents-title' }, 'Área dos pais'),
        h('p', { class: 'parents-usage' }, usage(time))),
      time.limitMs !== null && meter(time),
      time.exhausted && h('p', { class: 'parents-alert' }, '🌙 O tempo de tela de hoje acabou. Os jogos mostram a tela de descanso até amanhã.'),
      h('p', { class: 'parents-label', id: 'limit-label' }, 'Limite por dia'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'limit-label' },
        LIMIT_CHOICES.map((minutes) => {
          const limitMs = minutes === null ? null : minutes * MINUTE;
          return h('button', {
            class: 'chip',
            'aria-pressed': String(time.limitMs === limitMs),
            onclick: () => draw(setScreenTimeLimit.execute({ limitMs })),
          }, minutes === null ? 'Sem limite' : `${minutes} min`);
        })),
      h('button', { class: 'link-button', onclick: () => draw(resetScreenTime.execute()) }, 'Zerar o tempo de hoje'),
      h('p', { class: 'parents-tip' },
        'A Sociedade Brasileira de Pediatria recomenda evitar telas antes dos 2 anos. ',
        'Se usar, prefira poucos minutos, com você junto, conversando e cantando com o bebê. ',
        'Para sair de um jogo ou vídeo, segure o botão ✕ do canto por 2 segundos.'),
    );
    panel.replaceChildren(...content.childNodes);
  }

  draw();
  return panel;
}

function usage({ usedMs, limitMs }) {
  const used = formatMinutes(usedMs);
  return limitMs === null ? `Hoje: ${used}` : `Hoje: ${used} de ${formatMinutes(limitMs)}`;
}

function meter({ usedMs, limitMs, exhausted }) {
  const percent = Math.min(100, (usedMs / limitMs) * 100);
  return h('div', { class: `meter${exhausted ? ' meter-full' : ''}`, role: 'progressbar', 'aria-valuenow': Math.round(percent), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('div', { class: 'meter-fill', style: `width: ${percent}%` }));
}

function formatMinutes(ms) {
  const minutes = Math.floor(ms / MINUTE);
  if (minutes === 0) return ms > 0 ? 'menos de 1 min' : '0 min';
  return `${minutes} min`;
}
