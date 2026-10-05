export const MAX = 50, MAXLEN = 40;
export const clean = (s) => s.replace(/\s+/g, " ").trim();
export const key = (s) => clean(s).toLowerCase();
const u32 = () => crypto.getRandomValues(new Uint32Array(1))[0];
export const rand01 = () => u32() / 2 ** 32;
// Unbiased integer in [0,n) via rejection sampling
export function randInt(n) {
  const lim = Math.floor(2 ** 32 / n) * n; let x;
  do { x = u32(); } while (x >= lim);
  return x % n;
}
export function validate(raw, list, ignore = -1) {
  const v = clean(raw);
  if (!v) return { err: "Please type a choice first." };
  if (v.length > MAXLEN) return { err: `Keep choices under ${MAXLEN + 1} characters so they fit on the wheel.` };
  if (list.some((c, i) => i !== ignore && key(c) === key(v)))
    return { err: `“${v}” is already on the wheel. Duplicates would unfairly boost its odds.` };
  return { v };
}
export function encode(arr) {
  let s = ""; new TextEncoder().encode(JSON.stringify(arr)).forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeHash(hash) {
  const m = hash.match(/^#c=(.+)$/); if (!m) return null;
  try {
    const b = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
    const arr = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))));
    if (!Array.isArray(arr)) throw 0;
    const out = [];
    for (const x of arr) {
      if (typeof x !== "string") continue;
      const v = clean(x).slice(0, MAXLEN);
      if (v && !out.some((o) => key(o) === key(v))) out.push(v);
      if (out.length >= MAX) break;
    }
    if (!out.length) throw 0;
    return out;
  } catch { return { error: true }; }
}
