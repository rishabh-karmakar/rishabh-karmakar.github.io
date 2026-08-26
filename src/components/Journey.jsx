import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { journey } from '../data/content';
import './Journey.css';

export default function Journey() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.7', 'end 0.6'],
  });

  return (
    <section id="journey" className="section journey">
      <div className="section-inner">
        <span className="eyebrow">02 &mdash; journey</span>
        <h2 className="section-title">Commit log.</h2>
        <p className="section-desc">Five years of building, from a research bench to a banking-grade platform.</p>

        <div className="timeline" ref={ref}>
          <div className="timeline-rail">
            <motion.div className="timeline-fill" style={{ scaleY: scrollYProgress }} />
          </div>

          {journey.map((item, i) => (
            <motion.div
              className="timeline-item"
              key={item.role}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`timeline-node ${item.status === 'active' ? 'is-active' : ''}`} />
              <div className="timeline-date mono">{item.date}</div>
              <div className="timeline-content">
                <h4>{item.role}</h4>
                <h5 className="mono">{item.org}</h5>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
