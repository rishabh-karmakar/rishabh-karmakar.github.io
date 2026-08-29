import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { profile, stats } from '../data/content';
import './Hero.css';
import { highlightSnippet } from '../utils/highlight';
import KineticGrid from './KineticGrid';

const bootLines = [
  'initializing rk_profile.sys ...',
  'loading modules: ml, research, systems ...',
  'status: ex-wells, columbia_msc ... active',
  'connection established.',
];

const codeSnippet = `const profile = {
  name: "Rishabh Karmakar",
  role: "MS CS, Machine Learning",
  university: "Columbia University",
  background: "4 yrs @ Wells Fargo (SAVP)",
  focus: [
    "Artificial Intelligence",
    "Machine Learning Research",
    "Deep Neural Networks",
    "Cloud & Systems"
  ],
    uptime: "100%",
    papers: 4
};`;

const nameChars = 'Rishabh Karmakar'.split('');

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03, delayChildren: 0.3 },
  },
};

const char = {
  hidden: { y: '110%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero({ theme = 'dark' }) {
  const [bootDone, setBootDone] = useState(false);
  const [visibleBoot, setVisibleBoot] = useState(0);
  const [typed, setTyped] = useState('');

  // Fixed boot sequence effect (Strict Mode compatible)
  useEffect(() => {
    let i = 0;
    const bootInterval = setInterval(() => {
      i++;
      setVisibleBoot(prev => {
        // Prevent updating past the end
        if (prev >= bootLines.length) return prev;
        return i;
      });

      if (i >= bootLines.length) {
        clearInterval(bootInterval);
        setTimeout(() => setBootDone(true), 250);
      }
    }, 320);

    return () => clearInterval(bootInterval);
  }, []); // Empty deps - runs on mount

  // Typing effect (unchanged - works correctly)
  useEffect(() => {
    if (!bootDone) return;
    let idx = 0;
    const typeInterval = setInterval(() => {
      idx++;
      setTyped(codeSnippet.slice(0, idx));
      if (idx >= codeSnippet.length) clearInterval(typeInterval);
    }, 12);
    return () => clearInterval(typeInterval);
  }, [bootDone]);

  
  return (
    <section id="home" className="hero">
      <KineticGrid theme={theme} />
      <div className="section-inner hero-inner">
        <div className="hero-columns">
          <div className="hero-text">
            <span className="eyebrow">available for opportunities</span>

            <h1 className="hero-name" aria-label={profile.name}>
              <motion.span variants={container} initial="hidden" animate="show" className="hero-name-line">
                {nameChars.map((c, i) => (
                  <span className="hero-char-mask" key={i}>
                    <motion.span variants={char} className="hero-char">
                      {c === ' ' ? '\u00A0' : c}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
            </h1>

            <motion.h2
              className="hero-role"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {profile.role}
            </motion.h2>

            <motion.p
              className="hero-tagline"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {profile.tagline}
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="#contact" className="btn btn-primary">
                Contact me
              </a>
              <a href="#projects" className="btn btn-ghost">
                View projects
              </a>
              <div className="social-icons">
                <a href={profile.googleScholar} target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 4h6a3 3 0 0 1 3 3v4h-3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3v3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3a2 2 0 0 0-2-2V9a2 2 0 0 0 2-2h3V7a3 3 0 0 1 3-3z"/>
                  </svg>
                </a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
                <a href={`mailto:${profile.email}`} aria-label="Email">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              </div>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.55, duration: 0.6 }}
            >
              {stats.map((s) => (
                <div className="hero-stat" key={s.label}>
                  <span className="hero-stat-value mono">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="hero-terminal"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="terminal-header">
              <div className="terminal-controls">
                <span className="control red" />
                <span className="control amber" />
                <span className="control green" />
              </div>
              <div className="terminal-tab mono">rk_profile.sys</div>
            </div>
            <div className="terminal-body mono">
              {!bootDone && (
                <div className="boot-lines">
                  {bootLines.slice(0, visibleBoot).map((l, i) => (
                    <div key={i} className="boot-line">
                      <span className="boot-arrow">$</span> {l}
                    </div>
                  ))}
                </div>
              )}
              {bootDone && (
                <pre className="typed-content" aria-live="polite">
                  <code dangerouslySetInnerHTML={{ __html: highlightSnippet(typed) }} />
                  <span className="terminal-cursor mono" aria-hidden="true">_</span>
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hero-scroll-cue mono">
        <span>scroll</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}
