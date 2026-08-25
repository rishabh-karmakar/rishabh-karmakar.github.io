import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { navSections } from '../data/content';
import './Gutter.css';

const BOOT_TIME = Date.now();

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function Gutter({ activeSection }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const [lineCount, setLineCount] = useState(1);
  const [uptime, setUptime] = useState('00:00:00');
  const maxLines = 480;

  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      setLineCount(Math.max(1, Math.round(v * maxLines)));
    });
    return unsub;
  }, [progress]);

  useEffect(() => {
    const id = setInterval(() => {
      setUptime(formatUptime(Date.now() - BOOT_TIME));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const activeMeta = navSections.find((s) => s.id === activeSection) || navSections[0];

  return (
    <div className="gutter" aria-hidden="true">
      <div className="gutter-track">
        <motion.div className="gutter-fill" style={{ scaleY: progress }} />
      </div>
      <div className="gutter-linecount mono">{String(lineCount).padStart(3, '0')}</div>
      <div className="gutter-breadcrumb mono">
        <span className="gutter-dot" />
        {activeMeta.path}
      </div>
      <div className="gutter-uptime mono">
        <span>uptime</span>
        <span className="gutter-uptime-value">{uptime}</span>
      </div>
    </div>
  );
}
