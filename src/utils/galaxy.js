// Shared between the star canvas and the hero's DOM labels, so they line up.

// galaxy centres as fractions of the canvas, for wide and narrow screens
export const GALAXY_POS = {
  wide: [[0.31, 0.37], [0.5, 0.27], [0.7, 0.36], [0.77, 0.64], [0.55, 0.62]],
  narrow: [[0.3, 0.25], [0.71, 0.23], [0.5, 0.36], [0.74, 0.49], [0.27, 0.49]],
};
// one nebula colour per galaxy; the interface itself stays silver and amber
export const GALAXY_HUES = ['255, 178, 36', '255, 94, 140', '56, 220, 200', '158, 118, 255', '84, 162, 255'];

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// how far the name has dissolved into galaxies, 0..1, for a hero scroll progress p
export const mapAmount = (p) => smooth(0.62, 0.95, smooth(0.06, 0.72, p));

// Where each galaxy sits and how big it is: size follows how many skills it holds.
// Used by the drawing engine and by the page's hit-testing, so they always agree.
export function layoutGalaxies(w, h, narrow, counts) {
  const total = counts.reduce((n, c) => n + c, 0);
  const shares = counts.map((c) => Math.max(0.13, c / total));
  const shareSum = shares.reduce((a, b) => a + b, 0);
  const pos = narrow ? GALAXY_POS.narrow : GALAXY_POS.wide;
  const unit = Math.min(w, h);
  return counts.map((_, i) => {
    const share = shares[i] / shareSum;
    return {
      cx: pos[i][0] * w,
      cy: pos[i][1] * h,
      R: unit * (narrow ? 0.15 : 0.17) * Math.sqrt(share / 0.2),
      share,
    };
  });
}
