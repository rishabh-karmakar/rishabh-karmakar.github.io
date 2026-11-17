/*
 * Flattens the passage embeddings (384 numbers each) to two, so they can be
 * drawn as a map: principal component analysis by power iteration. With under
 * a hundred passages this takes a few milliseconds, so it needs no library.
 * Returns each passage's position in -1..1 and a function that places a new
 * vector (a visitor's question) on the same map.
 */
export function fitMap(vectors) {
  const n = vectors.length;
  const d = vectors[0].length;
  const mean = new Float64Array(d);
  for (const v of vectors) for (let i = 0; i < d; i += 1) mean[i] += v[i] / n;
  const X = vectors.map((v) => Float64Array.from(v, (x, i) => x - mean[i]));

  const dot = (a, b) => {
    let s = 0;
    for (let i = 0; i < d; i += 1) s += a[i] * b[i];
    return s;
  };

  const axes = [];
  for (let k = 0; k < 2; k += 1) {
    // a fixed starting direction, so the map looks the same on every visit
    let v = Float64Array.from({ length: d }, (_, i) => Math.sin(i * 12.9898 + k * 78.233));
    for (let it = 0; it < 80; it += 1) {
      const next = new Float64Array(d);
      for (const x of X) {
        const s = dot(x, v);
        for (let i = 0; i < d; i += 1) next[i] += x[i] * s;
      }
      // keep the second axis at right angles to the first
      for (const a of axes) {
        const s = dot(next, a);
        for (let i = 0; i < d; i += 1) next[i] -= a[i] * s;
      }
      const len = Math.sqrt(dot(next, next)) || 1;
      for (let i = 0; i < d; i += 1) next[i] /= len;
      v = next;
    }
    axes.push(v);
  }

  const raw = X.map((x) => axes.map((a) => dot(x, a)));
  const scale = axes.map((_, k) => Math.max(...raw.map((r) => Math.abs(r[k]))) || 1);
  const clamp = (x) => Math.max(-1.12, Math.min(1.12, x));

  return {
    points: raw.map((r) => r.map((x, k) => x / scale[k])),
    place: (vector) => axes.map((a, k) => clamp(dot(Float64Array.from(vector, (x, i) => x - mean[i]), a) / scale[k])),
  };
}
