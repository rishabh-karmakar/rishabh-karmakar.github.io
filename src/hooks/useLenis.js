import { useEffect } from 'react';
import Lenis from 'lenis';

// Smooth scrolling for the whole page. Skipped when the visitor asks for reduced motion.
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
    window.__lenis = lenis; // so code outside React can scroll through it
    return () => {
      window.__lenis = null;
      lenis.destroy();
    };
  }, []);
}
