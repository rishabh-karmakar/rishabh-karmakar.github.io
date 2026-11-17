import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { galaxies, hero, heroStats, links, profile } from '../data/content';
import { GALAXY_HUES, GALAXY_POS, mapAmount } from '../utils/galaxy';
import { askArchive } from '../utils/ask';
import StarField from './StarField';
import { CountUp, MaskLines, Rise, Rule } from './Reveal';
import './Hero.css';

const NAME_LINES = profile.name.toUpperCase().split(' ');

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState(null); // index of the galaxy zoomed into
  const [mapOn, setMapOn] = useState(false); // galaxies formed and clickable
  const focusRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // function transforms on purpose: range transforms on opacity get handed to a
  // native scroll timeline, which tracks the page instead of this section
  const cueA = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.12));
  const cueB = useTransform(scrollYProgress, (v) => mapAmount(v));
  const bar = useTransform(scrollYProgress, (v) => Math.min(1, v / 0.72));
  const planetX = useTransform(bar, (v) => 66 + 56 * Math.cos(v * Math.PI * 2));
  const planetY = useTransform(bar, (v) => 30 + 20 * Math.sin(v * Math.PI * 2));
  const labels = useTransform(scrollYProgress, (v) => mapAmount(v));

  const pick = useCallback((i) => {
    focusRef.current = i;
    setFocus(i);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const on = mapAmount(v) > 0.6;
    setMapOn(on);
    if (!on && focusRef.current != null) pick(null); // scrolling away leaves the system
  });

  useEffect(() => {
    if (focus == null) return undefined;
    const onKey = (e) => e.key === 'Escape' && pick(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, pick]);

  const g = focus != null ? galaxies[focus] : null;

  return (
    <>
      <section id="home" className={`hero ${reduce ? 'hero-static' : ''}`} ref={ref}>
        <div className="hero-pin">
          <StarField lines={NAME_LINES} heroRef={ref} galaxies={galaxies} focus={focus} focusRef={focusRef} onPick={pick} />
          <h1 className="sr-only">{profile.name}</h1>

          <div className="hero-top">
            <Rise as="p" className="hero-kicker mono" onLoad delay={0.2}>
              {hero.kicker}
            </Rise>
            <Rise as="nav" className="hero-links mono" onLoad delay={0.35} aria-label="Profiles">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="link-wipe"
                  {...(l.download ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {l.label} <span aria-hidden="true">{l.download ? '↓' : '↗'}</span>
                </a>
              ))}
            </Rise>
          </div>

          {/* galaxy names: real buttons, so the map works by keyboard and touch too */}
          {!reduce && (
            <motion.div
              className={`galaxy-labels ${mapOn && focus == null ? 'is-live' : ''}`}
              style={{ opacity: focus == null ? labels : 0 }}
            >
              {galaxies.map((gal, i) => (
                <button
                  key={gal.label}
                  type="button"
                  className="galaxy-label mono"
                  tabIndex={mapOn && focus == null ? 0 : -1}
                  style={{
                    '--hue': `rgb(${GALAXY_HUES[i]})`,
                    '--x': GALAXY_POS.wide[i][0],
                    '--y': GALAXY_POS.wide[i][1],
                    '--nx': GALAXY_POS.narrow[i][0],
                    '--ny': GALAXY_POS.narrow[i][1],
                  }}
                  onClick={() => pick(i)}
                >
                  {gal.label}
                  <i>{String(gal.items.length).padStart(2, '0')}</i>
                </button>
              ))}
            </motion.div>
          )}

          <div className="hero-bottom">
            <div className="hero-copy">
              <div className={`hero-lede ${g ? 'is-hidden' : ''}`} aria-hidden={g ? true : undefined}>
                <p className="hero-thesis">
                  <MaskLines onLoad delay={0.7} lines={[hero.thesisLead, <em key="e">{hero.thesisEm}</em>]} />
                </p>
                <Rise as="p" className="hero-sub" onLoad delay={1}>
                  {hero.sub}
                </Rise>
                <Rise className="hero-actions" onLoad delay={1.15}>
                  <a href="#work" className="btn btn-primary" tabIndex={g ? -1 : 0}>
                    See the work <span className="arrow" aria-hidden="true">&rarr;</span>
                  </a>
                  <a href={profile.resume} download className="btn btn-ghost" tabIndex={g ? -1 : 0}>
                    R&eacute;sum&eacute; <span className="arrow" aria-hidden="true">&darr;</span>
                  </a>
                  <a href="#ask" className="hero-ask mono link-wipe" tabIndex={g ? -1 : 0}>
                    or ask this site a question &rarr;
                  </a>
                </Rise>
              </div>

              {g && (
                <div className="system-panel" key={focus} aria-live="polite" style={{ '--hue': `rgb(${GALAXY_HUES[focus]})` }}>
                  <p className="system-count mono">
                    Galaxy {String(focus + 1).padStart(2, '0')} / {String(galaxies.length).padStart(2, '0')}
                  </p>
                  <h2 className="hero-thesis">{g.label}</h2>
                  <ul className="system-list mono">
                    {g.items.map((it) => (
                      <li key={it}>
                        <button type="button" className="skill" title={`Find where I used ${it}`} onClick={() => askArchive(`Experience with ${it}`, { usage: true })}>
                          {it}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="system-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => pick(null)}>
                      <span aria-hidden="true">&larr;</span> All galaxies
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => pick((focus + 1) % galaxies.length)}>
                      Next <span className="arrow" aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!reduce && (
              <div className={`hero-cue mono ${g ? 'is-hidden' : ''}`} aria-hidden="true">
                <div className="hero-cue-text">
                  <motion.span style={{ opacity: cueA }}>Drag the black hole through the name. Then scroll.</motion.span>
                  <motion.span style={{ opacity: cueB }}>Pick a galaxy to fly into its skills.</motion.span>
                </div>
                {/* scroll progress as a planet completing one orbit */}
                <svg className="orbit-cue" viewBox="0 0 132 60">
                  <ellipse cx="66" cy="30" rx="56" ry="20" className="orbit-ring" />
                  <motion.ellipse cx="66" cy="30" rx="56" ry="20" className="orbit-done" style={{ pathLength: bar }} />
                  <circle cx="66" cy="30" r="5" className="orbit-sun" />
                  <motion.circle r="4.5" className="orbit-planet" style={{ x: planetX, y: planetY }} />
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="stats" aria-label="At a glance">
        <Rule />
        <dl className="stats-grid">
          {heroStats.map((s, i) => (
            <Rise className="stat" key={s.label} delay={i * 0.07}>
              <dd className="stat-value">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} delay={i * 0.07} />
              </dd>
              <dt className="stat-label mono">{s.label}</dt>
            </Rise>
          ))}
        </dl>
        <Rule />
      </section>
    </>
  );
}
