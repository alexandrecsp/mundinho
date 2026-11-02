import { h } from '../../../../shared/ui/dom.js';

const MINUTE = 60_000;
const LIMIT_CHOICES = [5, 10, 15, 20, 30, null];

/** Today's screen time and the daily limit, for the parents' corner of the home page. */
export function renderScreenTimePanel({ getScreenTime, setScreenTimeLimit, resetScreenTime }) {
  const panel = h('div', { class: 'screen-time' });

  function draw(time = getScreenTime.execute()) {
    // h() skips false children; replaceChildren() would print them.
    const content = h('div', {},
      h('div', { class: 'parents-row' },
        h('p', { class: 'parents-label', id: 'limit-label' }, 'Tempo de tela por dia'),
        h('p', { class: 'parents-usage' }, usage(time))),
      time.limitMs !== null && meter(time),
      time.exhausted && h('p', { class: 'parents-alert' }, '🌙 O tempo de tela de hoje acabou. Os jogos mostram a tela de descanso até amanhã.'),
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
