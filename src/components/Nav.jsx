import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { navSections, profile } from '../data/content';
import './Nav.css';

export default function Nav({ activeSection, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const isDay = theme === 'light';

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''} ${open ? 'nav-open' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="nav-logo" onClick={() => setOpen(false)}>
          {profile.name.split(' ')[0]} <em>{profile.name.split(' ')[1]}</em>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {navSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`nav-link ${activeSection === s.id ? 'nav-link-active' : ''}`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="edition-toggle"
            onClick={onToggleTheme}
            aria-label={`Night / Day: switch to the ${isDay ? 'night' : 'day'} edition`}
          >
            <span className={isDay ? '' : 'is-on'}>Night</span>
            <span aria-hidden="true">/</span>
            <span className={isDay ? 'is-on' : ''}>Day</span>
          </button>
          <button
            className="nav-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-overlay"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <motion.span className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <div id="nav-overlay" className="nav-overlay" aria-hidden={!open}>
        <nav aria-label="Sections, mobile">
          {navSections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : '0s' }}
              onClick={() => setOpen(false)}
            >
              <span className="mono">0{i + 1}</span>
              {s.label}
            </a>
          ))}
        </nav>
        <a className="nav-overlay-mail mono" href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>
          {profile.email}
        </a>
      </div>
    </header>
  );
}
