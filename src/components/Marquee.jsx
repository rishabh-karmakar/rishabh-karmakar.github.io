import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import './Marquee.css';

const wrap = (min, max, v) => min + ((((v - min) % (max - min)) + (max - min)) % (max - min));

/* A band of oversized type that drifts on its own and surges with scroll speed. */
export default function Marquee({ items, direction = -1 }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const dir = useRef(direction);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skew = useTransform(velocity, [-2500, 0, 2500], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < 0) dir.current = -direction;
    else if (b > 0) dir.current = direction;
    baseX.set(baseX.get() + dir.current * (1.6 + Math.abs(b) * 1.6) * (delta / 1000));
  });

  const row = (hidden) => (
    <span className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className={i % 2 ? 'marquee-item is-solid' : 'marquee-item'}>
          {t}
          <i aria-hidden="true">&#10033;</i>
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee">
      <motion.div className="marquee-track" style={reduce ? undefined : { x, skewX: skew }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  );
}
