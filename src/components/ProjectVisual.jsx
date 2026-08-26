function Sparkline() {
  return (
    <svg viewBox="0 0 300 140" className="pv-svg" preserveAspectRatio="none">
      <polyline
        points="0,110 40,90 80,100 120,60 160,70 200,30 240,45 300,10"
        fill="none"
        stroke="var(--signal)"
        strokeWidth="2"
      />
      <polyline
        points="0,110 40,90 80,100 120,60 160,70 200,30 240,45 300,10"
        fill="url(#sparkFill)"
        stroke="none"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Nodes() {
  const pts = [
    [40, 30], [150, 20], [260, 40], [30, 100], [150, 110], [270, 100], [150, 65],
  ];
  const links = [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6]];
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
          stroke="var(--line-bright)" strokeWidth="1"
        />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 6 ? 7 : 4} fill={i === 6 ? 'var(--signal)' : 'var(--good)'} />
      ))}
    </svg>
  );
}

function Bars() {
  const heights = [30, 55, 40, 80, 65, 95];
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 48 + 10}
          y={140 - h}
          width="28"
          height={h}
          fill={i === heights.length - 1 ? 'var(--signal)' : 'var(--line-bright)'}
        />
      ))}
    </svg>
  );
}

function Radar() {
  const pts = [
    [150, 15], [260, 70], [215, 130], [85, 130], [40, 70],
  ];
  const path = pts.map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      <polygon points={path} fill="var(--signal)" opacity="0.15" stroke="var(--signal)" strokeWidth="1.5" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--good)" />
      ))}
    </svg>
  );
}

function Candles() {
  const candles = [
    { x: 20, top: 40, bottom: 70, wickTop: 25, wickBottom: 85, up: true },
    { x: 60, top: 55, bottom: 90, wickTop: 45, wickBottom: 100, up: false },
    { x: 100, top: 35, bottom: 60, wickTop: 20, wickBottom: 70, up: true },
    { x: 140, top: 65, bottom: 100, wickTop: 55, wickBottom: 110, up: false },
    { x: 180, top: 30, bottom: 55, wickTop: 15, wickBottom: 65, up: true },
    { x: 220, top: 45, bottom: 75, wickTop: 35, wickBottom: 85, up: true },
    { x: 260, top: 20, bottom: 50, wickTop: 10, wickBottom: 58, up: true },
  ];
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      {candles.map((c, i) => (
        <g key={i}>
          <line x1={c.x} y1={c.wickTop} x2={c.x} y2={c.wickBottom} stroke={c.up ? 'var(--good)' : 'var(--line-bright)'} strokeWidth="1.5" />
          <rect
            x={c.x - 8}
            y={c.top}
            width="16"
            height={c.bottom - c.top}
            fill={c.up ? 'var(--good)' : 'var(--line-bright)'}
          />
        </g>
      ))}
    </svg>
  );
}

function Waves() {
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      <path
        d="M0,70 C 30,30 60,110 90,70 C 120,30 150,110 180,70 C 210,30 240,110 270,70 L 300,70"
        fill="none"
        stroke="var(--signal)"
        strokeWidth="2"
      />
      <path
        d="M0,90 C 30,70 60,110 90,90 C 120,70 150,110 180,90 C 210,70 240,110 270,90 L 300,90"
        fill="none"
        stroke="var(--good)"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}

function Scan() {
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      <rect x="90" y="15" width="120" height="110" rx="8" fill="none" stroke="var(--line-bright)" strokeWidth="1.5" />
      <line x1="90" y1="45" x2="210" y2="45" stroke="var(--signal)" strokeWidth="1.5" opacity="0.8" />
      <circle cx="150" cy="80" r="26" fill="none" stroke="var(--good)" strokeWidth="1.5" />
      <circle cx="150" cy="80" r="3" fill="var(--good)" />
      {[[110, 25], [190, 25], [110, 115], [190, 115]].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 8},${y} h8 v${y < 70 ? 8 : -8}`}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function Pulse() {
  return (
    <svg viewBox="0 0 300 140" className="pv-svg">
      <polyline
        points="0,70 40,70 55,30 70,110 85,70 110,70 125,45 140,95 155,70 300,70"
        fill="none"
        stroke="var(--good)"
        strokeWidth="2"
      />
      {[55, 125].map((x, i) => (
        <circle key={i} cx={x} cy={30} r="3" fill="var(--signal)" />
      ))}
    </svg>
  );
}


const map = {
  sparkline: Sparkline,
  nodes: Nodes,
  bars: Bars,
  radar: Radar,
  candles: Candles,
  waves: Waves,
  scan: Scan,
  pulse: Pulse,
};

export default function ProjectVisual({ type }) {
  const Cmp = map[type] || Sparkline;
  return <Cmp />;
}