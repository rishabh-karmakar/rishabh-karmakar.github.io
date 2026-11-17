import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  abstract,
  achievements,
  domains,
  earlyInternships,
  galaxies,
  journey,
  links,
  profile,
  projects,
  publications,
  scholarStats,
  skillGroups,
  spokenLanguages,
} from '../data/content';
import { OPEN_EVENT, askArchive } from '../utils/ask';
import { tabKeys } from '../utils/tabs';
import { CountUp, KineticTitle, Rise } from './Reveal';
import './Sections.css';

const EASE = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------------------ */
/* Planet rail: the page as a row of destinations, always one click away */
/* ------------------------------------------------------------------ */

const STOPS = [
  { id: 'home', label: 'Stars' },
  { id: 'about', label: 'Origin' },
  { id: 'ask', label: 'Ask' },
  { id: 'work', label: 'Missions' },
  { id: 'record', label: 'Flight log' },
  { id: 'toolkit', label: 'Instruments' },
  { id: 'papers', label: 'Signals' },
  { id: 'contact', label: 'Contact' },
];

export function Rail({ active }) {
  return (
    <nav className="rail" aria-label="Jump to section">
      {STOPS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`rail-stop ${active === s.id ? 'is-active' : ''}`}
          style={{ '--hue': `var(--hue-${(i % 5) + 1})` }}
          aria-current={active === s.id ? 'true' : undefined}
        >
          <span className="rail-label mono">{s.label}</span>
          <span className="rail-dot" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* 01  Origin: the statement lights up word by word as it scrolls       */
/* ------------------------------------------------------------------ */

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, (v) => 0.16 + 0.84 * Math.min(1, Math.max(0, (v - range[0]) / (range[1] - range[0]))));
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

export function Abstract() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] });
  const words = abstract.statement.split(' ');

  return (
    <section id="about" className="section abstract" style={{ '--glow': 'var(--hue-3)' }}>
      <div className="section-inner">
        <p className="eyebrow">
          <b>01</b> Origin &middot; about
        </p>
        <h2 className="sr-only">About</h2>
        <p className="abstract-statement" ref={ref}>
          {reduce
            ? abstract.statement
            : words.map((w, i) => (
                <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {w}
                </Word>
              ))}
        </p>

        <div className="abstract-grid">
          <Rise as="p" className="abstract-body">
            {abstract.body}
          </Rise>
          <ul className="abstract-points">
            {abstract.points.map((p, i) => (
              <Rise as="li" key={p.title} delay={i * 0.08}>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </Rise>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Star catalogue: other projects, five shown until asked for more      */
/* ------------------------------------------------------------------ */

export function Archive() {
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  const rows = projects.filter((p) => p.id !== 'answer-eval');
  const shown = all ? rows : rows.slice(0, 5);

  // a search result that cites a project shows the full list and opens that row
  useEffect(() => {
    const onOpen = ({ detail }) => {
      if (detail.kind !== 'project') return;
      setAll(true);
      setOpen(detail.id);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  return (
    <section className="section archive" style={{ '--glow': 'var(--hue-4)' }} aria-labelledby="archive-title">
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>03</b> Star catalogue &middot; other projects
            </p>
            <h2 id="archive-title" className="section-title section-title-sm">
              {rows.length} more <em>objects.</em>
            </h2>
          </div>
          <p className="section-desc">Earlier builds across deep learning, computer vision, NLP and blockchain. Select a row for the details.</p>
        </header>

        <ul className="catalogue">
          {shown.map((p, i) => {
            const isOpen = open === p.id;
            return (
              <li key={p.id} id={`project-${p.id}`} className={isOpen ? 'is-open' : ''}>
                <button type="button" className="catalogue-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.id)}>
                  <span className="catalogue-no mono">RK-{String(i + 1).padStart(3, '0')}</span>
                  <span className="catalogue-title">{p.title}</span>
                  <span className="catalogue-tags mono">{p.tags.slice(0, 3).join(' / ')}</span>
                  <span className="catalogue-metric">
                    <b>{p.metric}</b>
                    <span className="mono">{p.metricLabel}</span>
                  </span>
                  <span className="catalogue-plus" aria-hidden="true" />
                </button>
                <div className="catalogue-detail" hidden={!isOpen}>
                  <p>{p.desc}</p>
                  {p.links && (
                    <p className="catalogue-links mono">
                      {p.links.github && (
                        <a className="link-wipe" href={p.links.github} target="_blank" rel="noopener noreferrer">
                          GitHub &#8599;
                        </a>
                      )}
                      {p.links.demo && (
                        <a className="link-wipe" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                          Write-up / demo &#8599;
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {/* rows not shown yet stay in the document, hidden, so they can still be indexed */}
        {!all && (
          <ul hidden>
            {rows.slice(5).map((p) => (
              <li key={p.id}>
                <h3>{p.title}</h3>
                <p>{p.desc} {p.tags.join(', ')}.</p>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="more-btn mono" aria-expanded={all} onClick={() => setAll((v) => !v)}>
          {all ? 'Show fewer' : `Show all ${rows.length}`}
          <span aria-hidden="true">{all ? '↑' : '↓'}</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Flight log: one trajectory, left to right; pick a waypoint           */
/* ------------------------------------------------------------------ */

export function Record() {
  const path = [...journey].reverse(); // oldest first, so time runs left to right
  const [active, setActive] = useState(path.length - 2); // most recent role
  const [early, setEarly] = useState(false);
  const reduce = useReducedMotion();
  const j = path[active];
  const trackRef = useRef(null);

  // a search result that cites a role selects that waypoint (or shows the internships)
  useEffect(() => {
    const onOpen = ({ detail }) => {
      if (detail.kind === 'internships') setEarly(true);
      if (detail.kind !== 'waypoint') return;
      const i = [...journey].reverse().findIndex((w) => w.role + w.date === detail.id);
      if (i >= 0) setActive(i);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // on a phone the track scrolls sideways: keep the chosen waypoint in view
  useEffect(() => {
    const track = trackRef.current;
    const node = track?.children[active];
    if (node) track.scrollTo({ left: node.offsetLeft - 24, behavior: 'smooth' });
  }, [active]);

  return (
    <section id="record" className="section record" style={{ '--glow': 'var(--hue-2)' }}>
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>04</b> Flight log &middot; experience and education
            </p>
            <KineticTitle className="section-title-sm" lines={[<>Trajectory <em>so far.</em></>]} />
          </div>
          <p className="section-desc">Promoted twice in four years at Wells Fargo, from Program Associate to AVP to SAVP, then on to Columbia. Select a waypoint.</p>
        </header>

        <div className="orbit-track" role="tablist" aria-label="Career waypoints" ref={trackRef}>
          {path.map((w, i) => (
            <button
              key={w.role + w.date}
              type="button"
              role="tab"
              id={`way-tab-${i}`}
              aria-selected={i === active}
              aria-controls="way-panel"
              tabIndex={i === active ? 0 : -1}
              className={`waypoint ${i === active ? 'is-active' : ''} ${i <= active ? 'is-passed' : ''} ${w.status === 'active' ? 'is-now' : ''}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => tabKeys(e, i, path.length, setActive)}
            >
              <span className="waypoint-node" aria-hidden="true" />
              <span className="waypoint-date mono">{w.date.split(' — ')[0]}</span>
              <span className="waypoint-org">{w.org.split(' · ')[0]}</span>
              <span className="waypoint-kind mono">{w.status === 'active' ? 'Now' : w.kind}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={j.role + j.date}
          id="way-panel"
          role="tabpanel"
          aria-labelledby={`way-tab-${active}`}
          className="way-panel"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="way-head">
            <p className="mono way-date">{j.date}</p>
            <h3>{j.role}</h3>
            <p className="log-org mono">{j.org}</p>
          </div>
          <ul className="way-points">
            {j.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </motion.div>

        {/* the other waypoints stay in the document, hidden, so they can still be indexed */}
        {path.map((w, i) =>
          i === active ? null : (
            <div key={w.role + w.date} hidden>
              <h3>{w.role}, {w.org}</h3>
              <p>{w.date}</p>
              <ul>
                {w.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          ),
        )}

        <button type="button" className="more-btn mono" aria-expanded={early} onClick={() => setEarly((v) => !v)}>
          {early ? 'Hide' : 'Show'} the launch years: {earlyInternships.length} internships, 2019 to 2020
          <span aria-hidden="true">{early ? '↑' : '↓'}</span>
        </button>
        {!early && (
          <ul hidden>
            {earlyInternships.map((e) => (
              <li key={e.org}>{e.role} at {e.org}: {e.note}</li>
            ))}
          </ul>
        )}
        {early && (
          <ul className="early-list">
            {earlyInternships.map((e) => (
              <li key={e.org}>
                <b>{e.org}</b>
                <span className="mono">{e.role}</span>
                <span>{e.note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Instruments: three dials instead of one long list                    */
/* ------------------------------------------------------------------ */

export function Toolkit() {
  const [tab, setTab] = useState(0);
  const reduce = useReducedMotion();
  const core = new Set(galaxies.flatMap((g) => g.items.map((i) => i.toLowerCase())));
  const also = skillGroups
    .filter((g) => g.category === 'Industry Knowledge' || g.category === 'Tools & Technologies')
    .flatMap((g) => g.items)
    .filter((i) => !core.has(i.toLowerCase()));
  const certs = (skillGroups.find((g) => g.category === 'Certifications')?.items ?? []).map((c) => c.trim());
  const soft = skillGroups.find((g) => g.category === 'Interpersonal Skills')?.items ?? [];

  const tabs = [
    { label: 'Core', count: galaxies.reduce((n, g) => n + g.items.length, 0) },
    { label: 'Also worked with', count: also.length + soft.length + spokenLanguages.length },
    { label: 'Certifications', count: certs.length },
  ];

  return (
    <section id="toolkit" className="section toolkit" style={{ '--glow': 'var(--hue-5)' }}>
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>05</b> Instruments &middot; skills and certifications
            </p>
            <KineticTitle className="section-title-sm" lines={[<>On-board <em>instruments.</em></>]} />
          </div>
          <div className="dial" role="tablist" aria-label="Skill sets">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={i === tab}
                aria-controls="toolkit-panel"
                tabIndex={i === tab ? 0 : -1}
                className={`dial-btn mono ${i === tab ? 'is-active' : ''}`}
                onClick={() => setTab(i)}
                onKeyDown={(e) => tabKeys(e, i, tabs.length, setTab)}
              >
                {t.label} <i>{String(t.count).padStart(2, '0')}</i>
              </button>
            ))}
          </div>
        </header>

        <motion.div
          key={tab}
          id="toolkit-panel"
          role="tabpanel"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {tab === 0 && (
            <dl className="instruments">
              {[...galaxies, { label: 'Domains', items: domains }].map((r, i) => (
                <div className="instrument is-big" key={r.label} style={{ '--hue': `var(--hue-${(i % 5) + 1})` }}>
                  <dt className="mono">{r.label}</dt>
                  <dd>
                    {r.items.map((it) => (
                      <span key={it}>
                        <button type="button" className="skill" title={`Find where I used ${it}`} onClick={() => askArchive(`Experience with ${it}`, { usage: true })}>
                          {it}
                        </button>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 1 && (
            <dl className="instruments">
              {[
                { label: 'Tools and topics', items: also },
                { label: 'Working style', items: soft },
                { label: 'Spoken languages', items: spokenLanguages },
              ].map((r) => (
                <div className="instrument" key={r.label}>
                  <dt className="mono">{r.label}</dt>
                  <dd>
                    {r.items.map((it) => (
                      <span key={it}>
                        <button type="button" className="skill" title={`Find where I used ${it}`} onClick={() => askArchive(`Experience with ${it}`, { usage: true })}>
                          {it}
                        </button>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 2 && (
            <ul className="certs-list mono">
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Signals: publications beside recognition                             */
/* ------------------------------------------------------------------ */

export function Papers() {
  const max = Math.max(...publications.map((p) => p.citedBy));
  return (
    <section id="papers" className="section papers" style={{ '--glow': 'var(--hue-3)' }}>
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>06</b> Signals &middot; publications and recognition
            </p>
            <KineticTitle className="section-title-sm" lines={[<>Signals <em>sent.</em></>]} />
          </div>
          <dl className="scholar">
            {[
              ['Citations', scholarStats.citations],
              ['h-index', scholarStats.hIndex],
              ['i10-index', scholarStats.i10Index],
            ].map(([k, v]) => (
              <div key={k}>
                <dd>
                  <CountUp value={v} />
                </dd>
                <dt className="mono">{k}</dt>
              </div>
            ))}
          </dl>
        </header>

        <div className="signals-grid">
          <div>
            <h3 className="col-title mono">Papers</h3>
            <ol className="papers-list">
              {publications.map((p) => (
                <li key={p.id}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="paper">
                    <span className="paper-year mono">{p.year}</span>
                    <span className="paper-main">
                      <span className="paper-title">{p.title}</span>
                      <span className="paper-meta mono">{p.venue}</span>
                    </span>
                    <span className="paper-cites">
                      <span className="mono">
                        <b>{p.citedBy}</b> cited
                      </span>
                      <span className="paper-bar" aria-hidden="true">
                        <span style={{ width: `${(p.citedBy / max) * 100}%` }} />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="papers-more mono">
              <a className="link-wipe" href={scholarStats.url} target="_blank" rel="noopener noreferrer">
                Full record on Google Scholar &#8599;
              </a>
            </p>
          </div>

          <div>
            <h3 className="col-title mono">Recognition</h3>
            <ul className="honours-list">
              {achievements.map((a) => (
                <li key={a.title} title={a.desc}>
                  <span className={`honour-mark ${a.badge === 'Winner' ? 'is-win' : ''}`} aria-hidden="true" />
                  <span className="honour-main">
                    <b>{a.title}</b>
                    <span className="mono">
                      {a.org} &middot; {a.year}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="section contact" style={{ '--glow': 'var(--hue-1)' }}>
      <div className="section-inner">
        <p className="eyebrow">
          <b>07</b> Open channel &middot; contact
        </p>
        <KineticTitle lines={['Make', <em key="c">contact.</em>]} />
        <p className="contact-lede">
          I am looking for software engineering and machine learning roles. If you are building AI that has to work in production, I would like to hear about it.
        </p>

        <div className="contact-row">
          <a className="contact-mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <button type="button" className="btn btn-ghost" onClick={copy} aria-live="polite">
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>

        <nav className="contact-links mono" aria-label="Profiles">
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
        </nav>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer mono">
      <span>&copy; {new Date().getFullYear()} {profile.name}</span>
      <span>New York, NY</span>
      <a href="#home" className="link-wipe">Back to the stars &uarr;</a>
    </footer>
  );
}
