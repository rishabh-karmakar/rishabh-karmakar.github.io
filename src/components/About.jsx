import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { manifesto, proofPoints } from '../data/content';
import './About.css';

function ManifestoLine({ text, progress, index, total }) {
  const start = index / total;
  const end = (index + 0.7) / total;
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <motion.p className="manifesto-line" style={{ opacity }}>
      {text}
    </motion.p>
  );
}

export default function About() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.4'],
  });

  return (
    <section id="about" className="section about">
      <div className="section-inner">
        <span className="eyebrow">01 &mdash; about</span>
        <h2 className="section-title">Systems built for AI, without breaking uptime.</h2>
        <p className="section-desc">
          Bridging enterprise software engineering, applied AI, and blockchain architecture.
        </p>

        <div ref={ref} className="manifesto-block">
          {manifesto.map((line, i) => (
            <ManifestoLine key={i} text={line} progress={scrollYProgress} index={i} total={manifesto.length} />
          ))}
        </div>

        <div className="proof-grid">
          {proofPoints.map((p, i) => (
            <motion.div
              className="proof-card"
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="proof-index mono">0{i + 1}</span>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
