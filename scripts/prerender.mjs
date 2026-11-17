// Runs after `vite build`: renders the app to HTML and writes it into dist/index.html.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href);
const file = path.join(root, 'dist/index.html');
const html = await readFile(file, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error('prerender: #root marker not found in dist/index.html');

const body = render();
if (!body.includes('<h1')) throw new Error('prerender: rendered page has no <h1>, refusing to write it');

// Preload the two faces used above the fold, so text does not shift when they arrive.
const assets = await readdir(path.join(root, 'dist/assets'));
const preloads = ['anybody-latin-wdth-normal', 'schibsted-grotesk-latin-wght-normal']
  .map((name) => assets.find((f) => f.startsWith(name) && f.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('');

await writeFile(
  file,
  html.replace('</title>', () => `</title>${preloads}`).replace(marker, () => `<div id="root">${body}</div>`),
);
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerendered ${(body.length / 1024).toFixed(0)} kB of HTML into dist/index.html`);
