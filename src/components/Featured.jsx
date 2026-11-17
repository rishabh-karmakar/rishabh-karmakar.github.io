import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { caseStudies } from '../data/content';
import { HubFigure, PipelineFigure, RetrievalFigure, SimilarityFigure } from './Figures';
import { OPEN_EVENT } from '../utils/ask';
import { tabKeys } from '../utils/tabs';
import { KineticTitle } from './Reveal';
import './Featured.css';

const FIGURES = { pipeline: PipelineFigure, retrieval: RetrievalFigure, hub: HubFigure, similarity: SimilarityFigure };
const EASE = [0.16, 1, 0.3, 1];

/* Mission console: four case studies in one screen, switched by tabs. */
export default function Featured() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // a search result that cites a mission opens that mission
  useEffect(() => {
    const onOpen = ({ detail }) => {
      const i = detail.kind === 'mission' ? caseStudies.findIndex((c) => c.id === detail.id) : -1;
      if (i >= 0) setActive(i);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const p = caseStudies[active];
  const Figure = FIGURES[p.figure];

  return (
    <section id="work" className="section featured" style={{ '--glow': 'var(--hue-1)' }}>
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>02</b> Missions &middot; selected work
            </p>
            <KineticTitle className="section-title-sm" lines={[<>Four missions, <em>measured.</em></>]} />
          </div>
          <p className="section-desc">Pick a mission. Each one is a real system, what it was for, and what it changed.</p>
        </header>

        <div className="console-tabs" role="tablist" aria-label="Missions">
          {caseStudies.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`mission-tab-${i}`}
              aria-selected={i === active}
              aria-controls="mission-panel"
              tabIndex={i === active ? 0 : -1}
              className={`console-tab ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => tabKeys(e, i, caseStudies.length, setActive)}
            >
              <span className="console-tab-no mono">Mission {String(i + 1).padStart(2, '0')}</span>
              <span className="console-tab-name">{c.name}</span>
              <span className="console-tab-metric">{c.metric}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={p.id}
          id="mission-panel"
          role="tabpanel"
          aria-labelledby={`mission-tab-${active}`}
          className="study"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="study-grid">
            <figure className="study-figure">
              <div className="fig-frame">
                <span className="fig-tag mono">Fig. {active + 1}</span>
                <Figure />
              </div>
              <figcaption>
                <span className="mono">Fig. {active + 1}</span> {p.caption}
              </figcaption>
            </figure>

            <div className="study-body">
              <p className="study-context mono">{p.context}</p>
              <h3 className="study-title">{p.headline}</h3>

              <dl className="study-rows">
                {[
                  ['Problem', p.problem],
                  ['Approach', p.approach],
                  ['Result', p.result],
                ].map(([k, v]) => (
                  <div className="study-row" key={k}>
                    <dt className="mono">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="study-foot">
                <div className="study-metric">
                  <span className="study-metric-value">{p.metric}</span>
                  <span className="study-metric-label mono">{p.metricLabel}</span>
                </div>
                <ul className="study-tags mono">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The other missions stay in the document, hidden, so search engines and "find in page" can read them. */}
        {caseStudies.map((c, i) =>
          i === active ? null : (
            <article key={c.id} hidden>
              <h3>{c.name}: {c.headline}</h3>
              <p>{c.context}</p>
              <p>{c.problem}</p>
              <p>{c.approach}</p>
              <p>{c.result}</p>
              <p>{c.metric} {c.metricLabel}. {c.tags.join(', ')}.</p>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
