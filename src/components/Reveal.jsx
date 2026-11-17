import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/* Lines of text that rise out of a mask, one after another. */
export function MaskLines({ lines, delay = 0, stagger = 0.09, onLoad = false, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const show = reduce || onLoad || inView;

  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span
            initial={reduce ? false : { y: '108%' }}
            animate={show ? { y: '0%' } : undefined}
            transition={{ duration: 1, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* A hairline that draws from left to right. */
export function Rule({ delay = 0, onLoad = false, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const show = reduce || onLoad || inView;

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      className={`rule ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      animate={show ? { scaleX: 1 } : undefined}
      transition={{ duration: 1.2, delay, ease: EASE }}
    />
  );
}

/* Fades and lifts a block a few pixels. Used sparingly, for body copy. */
export function Rise({ children, delay = 0, onLoad = false, className = '', as = 'div' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const show = reduce || onLoad || inView;
  const Tag = motion[as];

  return (
    <Tag
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/* Counts a number up once it scrolls into view. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', delay = 0 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  // on the server (the prerender) show the final number; in the browser count up from zero
  const [shown, setShown] = useState(reduce || typeof window === 'undefined' ? value : 0);

  useEffect(() => {
    if (reduce || !inView) return undefined;
    const controls = animate(0, value, {
      duration: 1.6,
      delay,
      ease: EASE,
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [inView, reduce, value, delay]);

  return (
    <span ref={ref}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* Section title whose letterforms widen as it travels up the screen. */
export function KineticTitle({ lines, as = 'h2', className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const stretch = useTransform(scrollYProgress, (v) => `${48 + Math.min(1, v / 0.6) * 46}%`);
  const Tag = motion[as];

  return (
    <Tag ref={ref} className={`section-title kinetic-title ${className}`} style={reduce ? undefined : { fontStretch: stretch }}>
      <MaskLines lines={lines} />
    </Tag>
  );
}
