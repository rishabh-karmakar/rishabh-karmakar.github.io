import { useEffect, useRef } from 'react';
import { createEngine } from '../engine/starEngine';
import { GALAXY_HUES, clamp, layoutGalaxies, smooth } from '../utils/galaxy';

/*
 * Hero instrument: the name in stars, a black hole on the pointer, galaxies on
 * scroll, a solar system on click. The drawing itself lives in
 * engine/starEngine.js and normally runs in a worker; this component does the
 * parts that need the page: measuring, rasterising the name with the real
 * display face, reading theme colours, and forwarding scroll and pointer input.
 */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const newCanvas = (width, height) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(width));
  c.height = Math.max(1, Math.ceil(height));
  return c;
};

export default function StarField({ lines, heroRef, galaxies, focus, focusRef, onPick }) {
  const wrapRef = useRef(null);
  const sendRef = useRef(null);

  // the galaxy in focus is page state; pass each change on to the engine
  useEffect(() => {
    sendRef.current?.({ type: 'input', focus });
  }, [focus]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const counts = galaxies.map((g) => g.items.length);
    let canvas = null;
    let worker = null;
    let local = null;
    let G = [];
    let mNow = 0;
    let lastP = -1;
    let seq = 0;
    let dead = false;

    const send = (msg, transfer) => {
      if (worker) worker.postMessage(msg, transfer || []);
      else local?.handle(msg);
    };
    sendRef.current = send;

    // A canvas can be handed to a worker only once, so each mount makes its own.
    const mount = (useWorker) => {
      canvas = document.createElement('canvas');
      wrap.replaceChildren(canvas);
      canvas.addEventListener('click', onClick);
      if (useWorker) {
        try {
          const off = canvas.transferControlToOffscreen();
          worker = new Worker(new URL('../engine/starWorker.js', import.meta.url), { type: 'module' });
          worker.onerror = () => {
            // the worker could not start: draw on the page instead
            worker?.terminate();
            worker = null;
            if (dead) return;
            mount(false);
            configure();
          };
          worker.postMessage({ type: 'init', canvas: off }, [off]);
          return;
        } catch {
          worker = null;
          canvas = document.createElement('canvas');
          wrap.replaceChildren(canvas);
          canvas.addEventListener('click', onClick);
        }
      }
      local = createEngine(canvas);
    };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const get = (n) => s.getPropertyValue(n).trim();
      return {
        ink: hexToRgb(get('--ink')),
        signal: hexToRgb(get('--signal')),
        void: get('--void'),
        mono: get('--font-mono'),
        display: get('--font-display'),
        dark: document.documentElement.getAttribute('data-theme') !== 'light',
      };
    };

    // planet labels are drawn here, where the mono face is loaded, and sent over as images
    const drawLabels = (col, narrow, scale) =>
      galaxies.map((g) =>
        g.items.map((item) => {
          const text = item.toUpperCase();
          const font = `500 ${narrow ? 10 : 11}px ${col.mono}`;
          const probe = newCanvas(1, 1).getContext('2d');
          probe.font = font;
          const tw = Math.ceil(probe.measureText(text).width) + 2;
          const th = 16;
          const c = newCanvas(tw * scale, th * scale);
          const x = c.getContext('2d');
          x.scale(scale, scale);
          x.font = font;
          x.textBaseline = 'middle';
          x.fillStyle = `rgb(${col.ink})`;
          x.fillText(text, 1, th / 2);
          return { img: c, w: tw, h: th };
        }),
      );

    // canvases cannot cross to a worker; bitmaps can
    const pack = async (labels, ghost, glow) => {
      if (!worker) return { labels, ghost, glow, transfer: [] };
      const transfer = [];
      const bmp = async (c) => {
        const b = await createImageBitmap(c);
        transfer.push(b);
        return b;
      };
      const packed = await Promise.all(labels.map((row) => Promise.all(row.map(async (l) => ({ ...l, img: await bmp(l.img) })))));
      return { labels: packed, ghost: ghost ? await bmp(ghost) : null, glow: glow ? await bmp(glow) : null, transfer };
    };

    const progress = () => {
      const hero = heroRef.current;
      if (!hero || reduce) return 0;
      const r = hero.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      return travel > 0 ? clamp(-r.top / travel) : 0;
    };

    const configure = async () => {
      if (dead) return;
      const token = (seq += 1);
      const rect = wrap.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const col = readColors();
      const narrow = w < 760;
      const pad = Math.max(20, w * 0.042);

      /* rasterise the name off-screen */
      const off = newCanvas(w, h);
      const o = off.getContext('2d', { willReadFrequently: true });
      const setFont = (px) => {
        o.font = `900 ${px}px ${col.display}`;
        if ('fontStretch' in o) o.fontStretch = 'condensed';
      };
      setFont(200);
      const widest = Math.max(...lines.map((l) => o.measureText(l).width));
      let top = narrow ? 176 : Math.max(96, h * 0.115);
      let room = h * (narrow ? 0.31 : 0.45);
      if (!narrow) {
        // on short screens the name must fit between the top row and the copy block
        const edge = (sel, side) => {
          const el = wrap.parentElement?.querySelector(sel);
          return el ? el.getBoundingClientRect()[side] - rect.top : null;
        };
        const above = edge('.hero-top', 'bottom');
        const below = edge('.hero-lede', 'top');
        if (above != null) top = Math.max(top, above + 10);
        if (below != null) room = Math.max(120, Math.min(room, below - top - 18));
      }
      const size = Math.min(((w - pad * 2) / widest) * 200, room / (0.8 * lines.length));
      setFont(size);
      const lineH = size * 0.8;
      const sy = Math.min(1.7, Math.max(1, room / (lineH * lines.length)));
      // draws the name into any 2-D context, filled or as an outline
      const drawName = (c, stroke) => {
        c.font = o.font;
        if ('fontStretch' in c) c.fontStretch = 'condensed';
        c.textBaseline = 'alphabetic';
        c.save();
        c.translate(0, top);
        c.scale(1, sy);
        lines.forEach((l, i) => {
          c.textAlign = i === 0 ? 'left' : 'right';
          const x = i === 0 ? pad : w - pad;
          if (stroke) c.strokeText(l, x, lineH * (i + 0.9));
          else c.fillText(l, x, lineH * (i + 0.9));
        });
        c.restore();
      };
      o.fillStyle = '#fff';
      drawName(o, false);

      // every other pixel inside the letters is somewhere a star may live
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const solid = (x, y) => x >= 0 && y >= 0 && x < off.width && y < off.height && data[(y * off.width + x) * 4 + 3] > 128;
      const pts = [];
      for (let y = 0; y < off.height; y += 2) {
        for (let x = 0; x < off.width; x += 2) {
          if (!solid(x, y)) continue;
          pts.push(x, y);
          // points on a letter's edge are listed three times, so stars crowd the
          // contours and the letters hold their shape without a heavy outline
          if (!solid(x - 3, y) || !solid(x + 3, y) || !solid(x, y - 3) || !solid(x, y + 3)) pts.push(x, y, x, y);
        }
      }
      if (!pts.length) return;
      const inside = Uint16Array.from(pts);

      // readable backing for the star name: a faint fill and a crisp outline, in white
      const ghost = newCanvas(w * dpr, h * dpr);
      const gc = ghost.getContext('2d');
      gc.setTransform(dpr, 0, 0, dpr, 0, 0);
      gc.fillStyle = 'rgba(255, 255, 255, 0.07)';
      drawName(gc, false);
      gc.strokeStyle = '#fff';
      gc.lineWidth = narrow ? 0.8 : 1.1;
      gc.lineJoin = 'round';
      drawName(gc, true);

      // the nebula behind the name: the letters in the galaxy colours, drawn small
      // and blurred by scaling down and back up (works where canvas filters do not)
      G = layoutGalaxies(w, h, narrow, counts);
      const S = 6;
      const sharp = newCanvas(w / S, h / S);
      const sc = sharp.getContext('2d');
      sc.scale(1 / S, 1 / S);
      const grad = sc.createLinearGradient(pad, 0, w - pad, 0);
      let edge0 = 0;
      G.forEach((g, i) => {
        grad.addColorStop(clamp(edge0 + g.share / 2), `rgb(${GALAXY_HUES[i]})`);
        edge0 += g.share;
      });
      sc.fillStyle = grad;
      drawName(sc, false);
      const tiny = newCanvas(sharp.width / 4, sharp.height / 4);
      tiny.getContext('2d').drawImage(sharp, 0, 0, tiny.width, tiny.height);
      const glow = newCanvas(sharp.width, sharp.height);
      const glc = glow.getContext('2d');
      glc.imageSmoothingQuality = 'high';
      glc.drawImage(tiny, 0, 0, glow.width, glow.height);
      glc.globalAlpha = 0.22;
      glc.drawImage(sharp, 0, 0);

      const packed = await pack(drawLabels(col, narrow, dpr), ghost, glow);
      if (dead || token !== seq) {
        packed.transfer.forEach((b) => b.close());
        return;
      }
      lastP = progress();
      mNow = smooth(0.06, 0.72, lastP);
      send(
        {
          type: 'configure',
          w,
          h,
          dpr,
          narrow,
          reduce,
          colors: col,
          inside,
          ghost: packed.ghost,
          glow: packed.glow,
          homeY: top + (lineH * lines.length * sy) / 2,
          counts,
          labels: packed.labels,
          input: { p: lastP, focus: focusRef.current },
        },
        [...packed.transfer, ...(worker ? [inside.buffer] : [])],
      );
    };

    const retheme = async () => {
      const rect = wrap.getBoundingClientRect();
      const col = readColors();
      const token = seq;
      const packed = await pack(drawLabels(col, rect.width < 760, Math.min(window.devicePixelRatio || 1, 2)), null, null);
      if (dead || token !== seq) {
        packed.transfer.forEach((b) => b.close());
        return;
      }
      send({ type: 'theme', colors: col, labels: packed.labels }, packed.transfer);
    };

    const onScroll = () => {
      const p = progress();
      if (p === lastP) return;
      lastP = p;
      mNow = smooth(0.06, 0.72, p);
      send({ type: 'input', p });
    };

    const galaxyAt = (x, y) => {
      if (mNow < 0.9 || focusRef.current != null) return -1;
      return G.findIndex((g) => Math.hypot(x - g.cx, y - g.cy) < g.R * 0.85);
    };
    let active = false;
    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const was = active;
      active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (active || was) send({ type: 'input', pointer: { x, y, active } });
      if (e.pointerType === 'mouse' && canvas) {
        const over = galaxyAt(x, y) >= 0;
        canvas.style.cursor = over ? 'pointer' : focusRef.current != null ? 'zoom-out' : reduce ? '' : 'none';
      }
    };
    const onLeave = () => {
      if (!active) return;
      active = false;
      send({ type: 'input', pointer: { x: 0, y: 0, active: false } });
    };
    const onUp = (e) => e.pointerType !== 'mouse' && onLeave();
    function onClick(e) {
      const rect = wrap.getBoundingClientRect();
      if (focusRef.current != null) {
        onPick(null);
        return;
      }
      const hit = galaxyAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit >= 0) onPick(hit);
    }

    mount('transferControlToOffscreen' in HTMLCanvasElement.prototype && typeof Worker !== 'undefined');

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(configure, 140);
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => send({ type: 'input', visible: entry.isIntersecting }));
    io.observe(wrap);
    const themeObserver = new MutationObserver(retheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);

    // the name must be drawn with the real display face, so wait for it
    const display = readColors().display.split(',')[0];
    const ready = document.fonts?.load ? document.fonts.load(`900 100px ${display}`) : Promise.resolve();
    ready.then(configure, configure);

    return () => {
      dead = true;
      clearTimeout(resizeTimer);
      sendRef.current = null;
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      if (worker) {
        worker.postMessage({ type: 'destroy' });
        worker = null;
      }
      local?.destroy();
      wrap.replaceChildren();
    };
  }, [lines, heroRef, galaxies, focusRef, onPick]);

  return <div ref={wrapRef} className="star-field" aria-hidden="true" />;
}
