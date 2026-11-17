import { GALAXY_HUES, clamp, layoutGalaxies, smooth } from '../utils/galaxy';

/*
 * The hero's drawing engine. It knows nothing about the DOM, so the same code
 * runs in a worker on an OffscreenCanvas (the normal case, which keeps the page
 * responsive while thousands of stars animate) or on the page itself where a
 * worker cannot own a canvas.
 *
 *   1. A few thousand stars spell the name. The pointer is a black hole that
 *      drags nearby stars into a swirl.
 *   2. Scrolling lets the name drift apart into spiral galaxies, one per skill group.
 *   3. Picking a galaxy flies the camera into it and shows its skills as a
 *      solar system: one planet per skill.
 *
 * Messages in:
 *   configure { w, h, dpr, narrow, reduce, colors, inside, ghost, homeY, counts, labels, input }
 *   theme     { colors, labels }
 *   input     { p?, focus?, pointer?, visible? }
 */

const TILTS = [-0.42, 0.22, 0.5, -0.25, 0.34];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const makeCanvas = (width, height) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
};

// a soft glowing dot, drawn once and stamped for every star
function makeSprite(rgb) {
  const c = makeCanvas(64, 64);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(0.22, `rgba(${rgb}, 0.95)`);
  grad.addColorStop(0.42, `rgba(${rgb}, 0.2)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

const nextFrame = (fn) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(() => fn(performance.now()), 16);
const dropFrame = (id) => (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id));

export function createEngine(canvas) {
  const ctx = canvas.getContext('2d');
  const input = { p: 0, focus: null, pointer: { x: 0, y: 0, active: false }, visible: true };
  const hole = { x: 0, y: 0, on: 1, ready: false, homeY: 0 };
  const cam = { x: 0, y: 0, z: 1, fx: 0, fy: 0 };
  let pointer = input.pointer;
  let stars = [];
  let dust = [];
  let G = [];
  let labels = [];
  let w = 0;
  let h = 0;
  let narrow = false;
  let reduce = false;
  let raf = 0;
  let baseDpr = 1;
  // share of the stars drawn each frame; drops on slow devices so frames stay short
  let quality = 1;
  let cost = 0;
  // if thinning the stars is not enough, the canvas drops to one pixel per CSS pixel
  let dprCap = 2;
  let gap = 16;
  let lastT = 0;
  let col = null;
  let lastFocus = 0;
  let ghostMaster = null; // the name as a faint fill plus outline, in white
  let ghost = null; // the same, tinted for the current edition
  let glow = null; // a small, soft, coloured copy of the name: the nebula the letters sit in

  const setColors = (c) => {
    col = { ...c, star: makeSprite(c.ink), hot: makeSprite(c.signal), tint: GALAXY_HUES.map(makeSprite) };
    if (!ghostMaster) return;
    ghost = makeCanvas(ghostMaster.width, ghostMaster.height);
    const g = ghost.getContext('2d');
    g.drawImage(ghostMaster, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = `rgb(${c.ink})`;
    g.fillRect(0, 0, ghost.width, ghost.height);
  };

  // label images arrive as bitmaps when running in a worker; release the old set
  const setLabels = (next) => {
    labels.forEach((row) => row.forEach((l) => l.img.close?.()));
    labels = next;
  };

  const applySize = () => {
    const dpr = Math.min(baseDpr, dprCap);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const configure = (cfg) => {
    ({ w, h, narrow, reduce } = cfg);
    baseDpr = cfg.dpr;
    applySize();
    ghostMaster?.close?.();
    ghostMaster = cfg.ghost;
    glow?.close?.();
    glow = cfg.glow;
    setColors(cfg.colors);
    setLabels(cfg.labels);
    hole.homeY = cfg.homeY;
    Object.assign(input, cfg.input);
    pointer = input.pointer;
    const inside = cfg.inside;

    /* galaxies: size follows how many skills each holds */
    G = layoutGalaxies(w, h, narrow, cfg.counts).map((g, i) => ({
      ...g,
      ct: Math.cos(TILTS[i]),
      st: Math.sin(TILTS[i]),
      om: (i % 2 ? -1 : 1) * 0.05,
    }));

    const rand = mulberry32(1705);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-6))) * Math.cos(6.2832 * rand());
    const count = narrow ? 4600 : 9000;
    const old = stars;
    stars = Array.from({ length: count }, (_, i) => {
      // a random spot inside the letters, so the name reads as a star field, not a grid
      const k = Math.floor(rand() * (inside.length / 2)) * 2;
      const nx = inside[k] + rand() * 2;
      const ny = inside[k + 1] + rand() * 2;
      // Colour follows position: the name reads as one spectrum from left to
      // right, and each band of colour later flies off to become its galaxy.
      let r = clamp(nx / w + gauss() * 0.045, 0, 0.9999);
      let gi = 0;
      while (gi < G.length - 1 && r > G[gi].share) {
        r -= G[gi].share;
        gi += 1;
      }
      // spiral arms plus a dense core
      const core = rand() < 0.3;
      const gr = core ? Math.abs(gauss()) * 0.13 : 0.12 + Math.pow(rand(), 0.7) * 0.88;
      const arm = Math.floor(rand() * 2) * Math.PI;
      const gth = core ? rand() * 6.2832 : arm + gr * 4.4 + gauss() * 0.3;
      const mag = Math.pow(rand(), 5);
      const prev = old[i];
      return {
        nx,
        ny,
        gi,
        gr,
        gth,
        delay: rand() * 0.4,
        tinted: rand() < 0.76, // mostly coloured, with silver stars mixed in for sparkle
        ph: rand() * 6.2832,
        tw: 0.6 + rand() * 2.2,
        size: (narrow ? 2.3 : 3.4) + mag * (narrow ? 7.5 : 12) + rand() * 1.1,
        bright: mag > (narrow ? 0.9 : 0.8),
        x: prev ? prev.x : reduce ? nx : w * (rand() * 1.6 - 0.3),
        y: prev ? prev.y : reduce ? ny : h * (rand() * 1.6 - 0.3),
        vx: 0,
        vy: 0,
      };
    });

    // the whole hero is sky: a dense field of silver stars behind everything
    dust = Array.from({ length: narrow ? 520 : 1300 }, () => ({
      x: rand() * w,
      y: rand() * h,
      s: 1.6 + Math.pow(rand(), 4) * 7 + rand() * 1.6,
      ph: rand() * 6.2832,
      tw: 0.4 + rand() * 1.4,
    }));

    cam.x = w / 2;
    cam.y = h / 2;
    cam.fx = w / 2;
    cam.fy = h / 2;
    cam.z = 1;
  };

  const focusPoint = () => (narrow ? [w * 0.5, h * 0.33] : [w * 0.62, h * 0.43]);
  const drawSystem = (gi, a, time) => {
    const items = labels[gi] || [];
    const n = items.length;
    const per = n > 8 ? 2 : 1;
    const orbits = Math.ceil(n / per);
    const rMax = narrow ? w * 0.36 : Math.min(w * 0.27, h * 0.7);
    const rMin = rMax * (orbits > 3 ? 0.26 : 0.4);
    const flat = narrow ? 0.62 : 0.46;
    const rot = -0.12;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const cx = cam.fx;
    const cy = cam.fy;

    // the star at the centre
    ctx.globalCompositeOperation = col.dark ? 'lighter' : 'source-over';
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMin * 0.9);
    const hue = GALAXY_HUES[gi];
    glow.addColorStop(0, `rgba(${hue}, ${0.95 * a})`);
    glow.addColorStop(0.16, `rgba(${hue}, ${0.5 * a})`);
    glow.addColorStop(1, `rgba(${hue}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, rMin * 0.9, 0, 6.2832);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.lineWidth = 1;
    for (let i = 0; i < n; i += 1) {
      const oi = Math.floor(i / per);
      const rx = orbits === 1 ? rMax * 0.7 : rMin + ((rMax - rMin) * oi) / (orbits - 1);
      const ry = rx * flat;
      if (i % per === 0) {
        ctx.globalAlpha = a * 0.22;
        ctx.strokeStyle = `rgb(${col.ink})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, rot, 0, 6.2832);
        ctx.stroke();
      }
      const speed = reduce ? 0 : 0.2 / (0.7 + oi * 0.4);
      const ang = oi * 2.399 + (i % per) * Math.PI + time * speed;
      const lx = Math.cos(ang) * rx;
      const ly = Math.sin(ang) * ry;
      const px = cx + lx * cr - ly * sr;
      const py = cy + lx * sr + ly * cr;
      const front = Math.sin(ang) > 0;
      const ps = (3.2 + ((i * 7) % 4)) * (front ? 1.15 : 0.85);
      const warm = i % 3 === 0;

      ctx.globalAlpha = a * (front ? 1 : 0.6);
      ctx.fillStyle = warm ? `rgb(${hue})` : `rgb(${col.ink})`;
      ctx.beginPath();
      ctx.arc(px, py, ps, 0, 6.2832);
      ctx.fill();

      // label: beside the planet on wide screens, under it on a phone, never off-canvas
      const label = items[i];
      const tw = label.w;
      let lx0;
      let ty = py;
      if (narrow) {
        lx0 = clamp(px, 12 + tw / 2, w - 12 - tw / 2) - tw / 2;
        ty = py + ps + 11;
      } else if (lx >= 0) {
        lx0 = Math.min(px + ps + 9, w - 14 - tw);
      } else {
        lx0 = Math.max(px - ps - 9, 14 + tw) - tw;
      }
      ctx.drawImage(label.img, lx0, ty - label.h / 2, tw, label.h);
    }
    ctx.globalAlpha = 1;
  };
  const draw = (t) => {
    if (!stars.length) return;
    const time = t * 0.001;

    const p = reduce ? 0 : input.p;
    const m = smooth(0.06, 0.72, p);
    const layer = smooth(0.62, 0.95, m);

    // camera: identity normally, flown into one galaxy when it is in focus
    let focus = input.focus;
    if (focus != null && (m < 0.9 || !G[focus])) focus = null;
    if (focus != null) lastFocus = focus;
    const zMax = narrow ? 2.6 : 3.1;
    const [fpx, fpy] = focusPoint();
    const want = focus != null
      ? { x: G[focus].cx, y: G[focus].cy, z: zMax, fx: fpx, fy: fpy }
      : { x: w / 2, y: h / 2, z: 1, fx: w / 2, fy: h / 2 };
    const k = reduce ? 1 : 0.075;
    cam.x += (want.x - cam.x) * k;
    cam.y += (want.y - cam.y) * k;
    cam.z += (want.z - cam.z) * k;
    cam.fx += (want.fx - cam.fx) * k;
    cam.fy += (want.fy - cam.fy) * k;
    const fz = clamp((cam.z - 1) / (zMax - 1));

    // black hole: follows the pointer, or wanders across the name when idle
    const hx = pointer.active ? pointer.x : w * (0.5 + 0.3 * Math.sin(time * 0.19));
    const hy = pointer.active ? pointer.y : (hole.homeY || h * 0.3) + h * 0.07 * Math.sin(time * 0.27 + 1.1);
    if (!hole.ready) {
      hole.x = hx;
      hole.y = hy;
      hole.ready = true;
    }
    hole.x += (hx - hole.x) * (pointer.active ? 0.22 : 0.04);
    hole.y += (hy - hole.y) * (pointer.active ? 0.22 : 0.04);
    const holeWant = focus != null || reduce ? 0 : pointer.active ? 1 : 0.7 * (1 - layer);
    hole.on += (holeWant - hole.on) * 0.08;
    const rh = narrow ? 13 : 19;
    const R = rh * (narrow ? 6.5 : 8.5);

    ctx.clearRect(0, 0, w, h);

    // distant background stars
    const dustN = Math.ceil(dust.length * quality);
    for (let i = 0; i < dustN; i += 1) {
      const d = dust[i];
      ctx.globalAlpha = 0.34 + 0.26 * Math.sin(time * d.tw + d.ph);
      const dx = d.x - (cam.x - w / 2) * 0.25;
      const dy = d.y - (cam.y - h / 2) * 0.25;
      ctx.drawImage(col.star, dx - d.s / 2, dy - d.s / 2, d.s, d.s);
    }

    if (glow && m < 0.45) {
      ctx.globalCompositeOperation = col.dark ? 'lighter' : 'source-over';
      ctx.globalAlpha = (col.dark ? 0.52 : 0.26) * (1 - smooth(0, 0.45, m)) * (0.92 + 0.08 * Math.sin(time * 0.7));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(glow, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }

    if (ghost && m < 0.3) {
      ctx.globalAlpha = 0.6 * (1 - smooth(0, 0.3, m));
      ctx.drawImage(ghost, 0, 0, w, h);
    }

    // gas clouds behind each galaxy
    if (layer > 0.01) {
      ctx.globalCompositeOperation = col.dark ? 'lighter' : 'source-over';
      ctx.globalAlpha = 1; // the background-star loop leaves this low
      const base = layer * (col.dark ? 0.34 : 0.26) * (1 - fz * 0.45);
      const puff = (x, y, rad, hue, a) => {
        const neb = ctx.createRadialGradient(x, y, 0, x, y, rad);
        neb.addColorStop(0, `rgba(${hue}, ${a})`);
        neb.addColorStop(0.45, `rgba(${hue}, ${a * 0.42})`);
        neb.addColorStop(1, `rgba(${hue}, 0)`);
        ctx.fillStyle = neb;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 6.2832);
        ctx.fill();
      };
      G.forEach((g, i) => {
        const sx = (g.cx - cam.x) * cam.z + cam.fx;
        const sy = (g.cy - cam.y) * cam.z + cam.fy;
        const rad = g.R * cam.z;
        const hue = GALAXY_HUES[i];
        const next = GALAXY_HUES[(i + 1) % GALAXY_HUES.length];
        const breathe = 1 + 0.06 * Math.sin(time * 0.3 + i * 1.7);
        puff(sx, sy, rad * 1.7 * breathe, hue, base);
        // two drifting side clouds, so neighbouring galaxies share one gas field
        const a1 = TILTS[i] + 0.6 + Math.sin(time * 0.11 + i) * 0.25;
        const a2 = a1 + 2.6;
        puff(sx + Math.cos(a1) * rad * 1.15, sy + Math.sin(a1) * rad * 0.8, rad * 1.5, next, base * 0.6);
        puff(sx + Math.cos(a2) * rad * 1.25, sy + Math.sin(a2) * rad * 0.85, rad * 1.35, hue, base * 0.5);
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    // the stars themselves
    const spikes = [];
    const starN = Math.ceil(stars.length * quality);
    for (let i = 0; i < starN; i += 1) {
      const s = stars[i];
      const g = G[s.gi];
      const e = smooth(0, 1, m * 1.4 - s.delay);

      let wx = s.nx;
      let wy = s.ny;
      if (e > 0) {
        const ang = s.gth + time * g.om * (1.3 - s.gr * 0.7);
        const lx = Math.cos(ang) * s.gr * g.R;
        const ly = Math.sin(ang) * s.gr * g.R * 0.5;
        const gx = g.cx + lx * g.ct - ly * g.st;
        const gy = g.cy + lx * g.st + ly * g.ct;
        wx += (gx - wx) * e;
        wy += (gy - wy) * e;
      }
      const tx = (wx - cam.x) * cam.z + cam.fx;
      const ty = (wy - cam.y) * cam.z + cam.fy;

      let heat = 0;
      let d = 1e9;
      if (reduce) {
        s.x = tx;
        s.y = ty;
      } else {
        s.vx = (s.vx + (tx - s.x) * 0.05) * 0.85;
        s.vy = (s.vy + (ty - s.y) * 0.05) * 0.85;
        if (hole.on > 0.02) {
          const dx = hole.x - s.x;
          const dy = hole.y - s.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < R) {
            heat = (1 - d / R) ** 2 * hole.on;
            // pulled inward and dragged sideways: an accretion swirl
            s.vx += (dx / d) * heat * 3.4 - (dy / d) * heat * 5.2;
            s.vy += (dy / d) * heat * 3.4 + (dx / d) * heat * 5.2;
          }
        }
        s.x += s.vx;
        s.y += s.vy;
      }
      if (d < rh * hole.on) continue; // past the event horizon

      const size = s.size * (1 - e * 0.18) * (1 + fz * 0.7);
      const twinkle = 0.72 + 0.28 * Math.sin(time * s.tw + s.ph);
      ctx.globalAlpha = twinkle * (1 - fz * 0.5);
      const sprite = heat > 0.06 ? col.hot : s.tinted ? col.tint[s.gi] : col.star;
      ctx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size);
      if (s.bright) spikes.push(s.x, s.y, size * 0.6 * twinkle);
    }

    // diffraction spikes on the brightest stars
    ctx.globalAlpha = 0.5 * (1 - fz * 0.4);
    ctx.strokeStyle = `rgb(${col.ink})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < spikes.length; i += 3) {
      const x = spikes[i];
      const y = spikes[i + 1];
      const l = spikes[i + 2];
      ctx.moveTo(x - l, y);
      ctx.lineTo(x + l, y);
      ctx.moveTo(x, y - l);
      ctx.lineTo(x, y + l);
    }
    ctx.stroke();

    // the black hole
    if (hole.on > 0.02) {
      const a = hole.on;
      const halo = ctx.createRadialGradient(hole.x, hole.y, rh * 0.9, hole.x, hole.y, rh * 3.6);
      halo.addColorStop(0, `rgba(${col.signal}, ${0.34 * a})`);
      halo.addColorStop(1, `rgba(${col.signal}, 0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, rh * 3.6, 0, 6.2832);
      ctx.fill();

      const ring = (from, to) => {
        ctx.strokeStyle = `rgba(${col.signal}, ${0.95 * a})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y, rh * 2.3, rh * 0.5, -0.32, from, to);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${col.signal}, ${0.3 * a})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y, rh * 2.75, rh * 0.66, -0.32, from, to);
        ctx.stroke();
      };
      ring(Math.PI, 6.2832); // far side of the disc
      ctx.globalAlpha = a;
      ctx.fillStyle = col.void;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, rh, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(${col.signal}, ${0.9 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, rh + 1.2, 0, 6.2832);
      ctx.stroke();
      ring(0, Math.PI); // near side, drawn over the hole
    }

    // solar system of the galaxy in focus
    const sysA = smooth(0.5, 0.98, fz);
    if (sysA > 0.01 && G[lastFocus]) drawSystem(lastFocus, sysA, time);
    ctx.globalAlpha = 1;
  };
  const loop = (t) => {
    const t0 = performance.now();
    draw(t);
    /*
     * Stars are stored in random order, so drawing fewer of them thins the
     * sky evenly. If a frame's drawing takes too long, thin it; if there is
     * plenty of headroom, bring stars back.
     */
    cost += (performance.now() - t0 - cost) * 0.2;
    if (lastT) gap += (Math.min(t - lastT, 120) - gap) * 0.1;
    lastT = t;
    if (dprCap > 1 && quality <= 0.3 && gap > 26 && baseDpr > 1) {
      dprCap = 1;
      gap = 16;
      applySize();
    }
    if (cost > 11 && quality > 0.3) quality = Math.max(0.3, quality * 0.85);
    else if (cost < 5 && quality < 1) quality = Math.min(1, quality * 1.03);
    raf = input.visible && !reduce ? nextFrame(loop) : 0;
  };
  const start = () => {
    if (raf) dropFrame(raf);
    raf = nextFrame(loop);
  };

  return {
    handle(msg) {
      if (msg.type === 'configure') {
        configure(msg);
        start();
      } else if (msg.type === 'theme') {
        setColors(msg.colors);
        setLabels(msg.labels);
        start();
      } else if (msg.type === 'input') {
        if ('p' in msg) input.p = msg.p;
        if ('focus' in msg) input.focus = msg.focus;
        if ('visible' in msg) input.visible = msg.visible;
        if ('pointer' in msg) {
          input.pointer = msg.pointer;
          pointer = msg.pointer;
        }
        // a change needs a fresh frame when the loop is stopped, but never while off-screen
        if (input.visible && (!raf || reduce)) start();
      }
    },
    destroy() {
      if (raf) dropFrame(raf);
      raf = 0;
      ghostMaster?.close?.();
      glow?.close?.();
      setLabels([]);
    },
  };
}
