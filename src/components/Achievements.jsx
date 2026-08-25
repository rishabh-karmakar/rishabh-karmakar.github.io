import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { achievements } from '../data/content';
import './Achievements.css';

export default function Achievements() {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [constraint, setConstraint] = useState(0);

  const measure = () => {
    if (trackRef.current && containerRef.current) {
      const overflow = trackRef.current.scrollWidth - containerRef.current.offsetWidth;
      setConstraint(overflow > 0 ? -overflow : 0);
    }
  };

  return (
    <section id="achievements" className="section achievements">
      <div className="section-inner">
        <span className="eyebrow">05 &mdash; achievements</span>
        <h2 className="section-title">Log entries.</h2>
        <p className="section-desc mono">$ tail -f achievements.log &mdash; drag to scroll</p>

        <div className="ach-container" ref={containerRef}>
          <motion.div
            className="ach-track"
            ref={trackRef}
            drag="x"
            dragConstraints={{ left: constraint, right: 0 }}
            dragElastic={0.08}
            onLayoutMeasure={measure}
            whileTap={{ cursor: 'grabbing' }}
          >
            {achievements.map((a) => (
              <div className="ach-card" key={a.title}>
                <div className="ach-card-top">
                  <span className="ach-year mono">{a.year}</span>
                  <span className={`ach-badge mono badge-${a.badge.toLowerCase()}`}>{a.badge}</span>
                </div>
                <h4>{a.title}</h4>
                <p className="ach-org mono">{a.org}</p>
                <p className="ach-desc">{a.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
