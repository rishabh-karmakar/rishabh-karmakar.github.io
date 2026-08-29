import { motion } from 'framer-motion';
import { publications, scholarStats } from '../data/content';
import './Publications.css';

export default function Publications() {
  return (
    <section id="publications" className="section publications">
      <div className="section-inner">
        <span className="eyebrow">05 &mdash; publications</span>
        <h2 className="section-title">Peer-reviewed research.</h2>
        <p className="section-desc">
          Published work on NLP, blockchain systems, and computer vision, indexed on{' '}
          <a href={scholarStats.url} target="_blank" rel="noopener noreferrer" className="publications-scholar-link">
            Google Scholar
          </a>
          .
        </p>

        <div className="publications-stats mono">
          <div className="pub-stat">
            <span className="pub-stat-value">{scholarStats.citations}</span>
            <span className="pub-stat-label">citations</span>
          </div>
          <div className="pub-stat">
            <span className="pub-stat-value">{scholarStats.hIndex}</span>
            <span className="pub-stat-label">h-index</span>
          </div>
          <div className="pub-stat">
            <span className="pub-stat-value">{scholarStats.i10Index}</span>
            <span className="pub-stat-label">i10-index</span>
          </div>
        </div>

        <div className="publications-list">
          {publications.map((p, i) => (
            <motion.a
              className="pub-row"
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pub-index mono">{String(i + 1).padStart(2, '0')}</div>
              <div className="pub-body">
                <h4>{p.title}</h4>
                <p className="pub-authors">{p.authors}</p>
                <p className="pub-venue mono">
                  {p.venue} &middot; {p.year}
                </p>
              </div>
              <div className="pub-cited">
                <span className="pub-cited-value mono">{p.citedBy}</span>
                <span className="pub-cited-label">cited by</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
