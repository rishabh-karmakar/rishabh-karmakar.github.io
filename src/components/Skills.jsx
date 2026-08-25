import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillGroups } from '../data/content';
import './Skills.css';

export default function Skills() {
  const [query, setQuery] = useState('');

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
        <p className="section-desc">Type to filter across languages, ML, cloud, and certifications.</p>

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
            {filtered.map((group) => (
              <motion.div
                className="skills-group"
                key={group.category}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="mono">{group.category}</h4>
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
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <p className="skills-empty mono">no matches &mdash; try another term</p>}
        </div>
      </div>
    </section>
  );
}
