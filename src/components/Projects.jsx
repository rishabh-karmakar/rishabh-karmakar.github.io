import { motion } from 'framer-motion';
import { projects } from '../data/content';
import ProjectVisual from './ProjectVisual';
import './Projects.css';

export default function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="section-inner">
        <span className="eyebrow">04 &mdash; projects</span>
        <h2 className="section-title">Research shipped as code.</h2>
        <p className="section-desc">Four production builds spanning deep learning, blockchain, and NLP.</p>

        <div className="projects-list">
          {projects.map((p, i) => (
            <motion.article
              className="project-row"
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="project-index mono">0{i + 1}</div>

              <div className="project-visual-frame">
                <ProjectVisual type={p.visual} />
              </div>

              <div className="project-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="project-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="mono">{t}</span>
                  ))}
                </div>
              </div>

              <div className="project-metric">
                <span className="project-metric-value mono">{p.metric}</span>
                <span className="project-metric-label">{p.metricLabel}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
