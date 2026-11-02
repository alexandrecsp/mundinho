/**
 * Builds an element: h('button', { class: 'card', onclick }, 'Texto', child).
 * Props starting with "on" become listeners; null, false and undefined
 * props and children are skipped, so conditionals can sit inline.
 */
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) element.addEventListener(key.slice(2), value);
    else element.setAttribute(key, value === true ? '' : value);
  }
  element.append(...children.flat().filter((child) => child != null && child !== false));
  return element;
}
