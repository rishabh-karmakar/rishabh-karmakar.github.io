import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillGroups } from '../data/content';
import './Skills.css';

// Categories whose tag count/length would unbalance a 2-column grid get
// their own full-width row instead of being paired with a neighbor.
const FULL_WIDTH_CATEGORIES = ['Certifications', 'Interpersonal Skills'];

export default function Skills() {
  const [query, setQuery] = useState('');
  const [certScroll, setCertScroll] = useState({ top: false, bottom: false });
  const certTagsRef = useRef(null);

  const updateCertScroll = () => {
    const el = certTagsRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setCertScroll({ top: !atTop, bottom: !atBottom && el.scrollHeight > el.clientHeight });
  };

  const certTagsCallbackRef = (node) => {
    certTagsRef.current = node;
    if (node) {
      // measure once mounted so the bottom fade shows immediately if content overflows
      requestAnimationFrame(updateCertScroll);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skillGroups;
    return skillGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const total = skillGroups.reduce((n, g) => n + g.items.length, 0);
  const shown = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="skills" className="section skills">
      <div className="section-inner">
        <span className="eyebrow">03 &mdash; skills</span>
        <h2 className="section-title">Query the stack.</h2>
        <p className="section-desc">Type in to grep and filter across languages, ML, cloud, and certifications.</p>

        <div className="skills-search mono">
          <span className="skills-prompt">grep &mdash;i</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. python, azure, nlp ..."
            aria-label="Filter skills"
          />
          <span className="skills-count">
            {shown}/{total}
          </span>
        </div>

        <div className="skills-groups">
          <AnimatePresence>
            {filtered.map((group) => {
              const isCert = group.category === 'Certifications';
              const isFullWidth = FULL_WIDTH_CATEGORIES.includes(group.category);

              return (
                <motion.div
                  className={`skills-group ${isFullWidth ? 'skills-group-full' : ''}`}
                  key={group.category}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="mono">
                    {group.category}
                    <span className="skills-group-count mono">{group.items.length}</span>
                  </h4>

                  {isCert ? (
                    <div className="cert-scroll-wrap">
                      <div className="skills-tags cert-tags" ref={certTagsCallbackRef} onScroll={updateCertScroll}>
                        <AnimatePresence>
                          {group.items.map((item) => (
                            <motion.span
                              className="skill-tag"
                              key={item}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item}
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                      {certScroll.top && <div className="cert-fade-top" aria-hidden="true" />}
                      {certScroll.bottom && <div className="cert-fade-bottom" aria-hidden="true" />}
                    </div>
                  ) : (
                    <div className="skills-tags">
                      <AnimatePresence>
                        {group.items.map((item) => (
                          <motion.span
                            className="skill-tag"
                            key={item}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <p className="skills-empty mono">no matches &mdash; try another term</p>}
        </div>
      </div>
    </section>
  );
}