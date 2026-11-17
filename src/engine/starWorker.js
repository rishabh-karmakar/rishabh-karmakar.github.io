import { createEngine } from './starEngine';

// Runs the hero's drawing engine off the main thread, on a canvas handed over by the page.
let engine = null;

self.onmessage = ({ data }) => {
  if (data.type === 'init') engine = createEngine(data.canvas);
  else if (data.type === 'destroy') {
    engine?.destroy();
    self.close();
  } else engine?.handle(data);
};
