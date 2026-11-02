/**
 * Blends a light and a dark palette: t = 0 is light, t = 1 is dark. Walks
 * objects and arrays; mixes hex colours ('#rgb', '#rrggbb', '#rrggbbaa')
 * and numbers; any other value (a blend mode, a word) switches halfway.
 * A key missing from the dark palette keeps its light value.
 *
 * At either end it returns a settled palette (the light one itself, or
 * the dark one completed once and cached), so the common case allocates
 * nothing per frame.
 */
const settledDark = new WeakMap();

export function mixPalette(light, dark, t) {
  if (t <= 0) return light;
  if (t >= 1) {
    let settled = settledDark.get(dark);
    if (!settled || settled.light !== light) settledDark.set(dark, (settled = { light, palette: complete(light, dark) }));
    return settled.palette;
  }
  return mix(light, dark, t);
}

// The dark palette with the light value filling any key it lacks.
function complete(light, dark) {
  if (dark === undefined) return light;
  if (Array.isArray(light) && Array.isArray(dark)) return light.map((value, i) => complete(value, dark[i]));
  if (light && dark && typeof light === 'object' && typeof dark === 'object') {
    const out = { ...dark };
    for (const key of Object.keys(light)) out[key] = complete(light[key], dark[key]);
    return out;
  }
  return dark;
}

function mix(a, b, t) {
  if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (typeof a === 'string' && typeof b === 'string') {
    const from = parseHex(a);
    const to = parseHex(b);
    if (from && to) return toRgba(from.map((channel, i) => channel + (to[i] - channel) * t));
    return t < 0.5 ? a : b;
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.map((value, i) => mix(value, b[i], t));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const out = {};
    for (const key of Object.keys(a)) out[key] = mix(a[key], b[key], t);
    return out;
  }
  return t < 0.5 ? a : b;
}

function parseHex(color) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(color);
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = [...hex].map((digit) => digit + digit).join('');
  if (hex.length === 6) hex += 'ff';
  return [0, 2, 4, 6].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function toRgba([r, g, b, a]) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${(a / 255).toFixed(3)})`;
}
