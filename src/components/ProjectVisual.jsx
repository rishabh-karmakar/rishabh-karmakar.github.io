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

const map = { sparkline: Sparkline, nodes: Nodes, bars: Bars, radar: Radar };

export default function ProjectVisual({ type }) {
  const Cmp = map[type] || Sparkline;
  return <Cmp />;
}
