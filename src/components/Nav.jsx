import { useState, useEffect } from 'react';
import { navSections } from '../data/content';
import './Nav.css';

export default function Nav({ activeSection, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="nav-logo mono">
          rk<span className="nav-cursor">_</span>
        </a>

        <nav className={`nav-links ${open ? 'nav-links-open' : ''}`}>
          {navSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`nav-link mono ${activeSection === s.id ? 'nav-link-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            <span className={`theme-toggle-track ${theme === 'light' ? 'is-light' : ''}`}>
              <span className="theme-toggle-thumb" />
            </span>
          </button>
          <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
