import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

function useFigure() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  return { ref, reduce, show: reduce || inView };
}

/* A labelled box that fades up when the figure enters view. */
function Node({ x, y, w = 84, h = 26, label, hot, delay = 0, show, reduce }) {
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx="13"
        className={hot ? 'fig-node is-hot' : 'fig-node'}
      />
      <text x={x} y={y + 3} textAnchor="middle" className={hot ? 'fig-node-text is-hot' : 'fig-node-text'}>
        {label}
      </text>
    </motion.g>
  );
}

/* A connector that draws itself, with a pulse of light travelling along it. */
function Link({ d, delay = 0, show, reduce, dur = 2.6, begin = 0 }) {
  return (
    <>
      <motion.path
        d={d}
        className="fig-link"
        initial={reduce ? false : { pathLength: 0 }}
        animate={show ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.9, delay, ease: EASE }}
      />
      {!reduce && show && (
        <circle r="2.6" className="fig-pulse">
          <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} />
        </circle>
      )}
    </>
  );
}

/* Fig: one change fans out to three agents, two of which call tools over MCP. */
export function PipelineFigure() {
  const { ref, reduce, show } = useFigure();
  const p = { show, reduce };
  return (
    <div className="fig-plot" ref={ref}>
      <svg viewBox="0 0 320 300" role="img" aria-label="Diagram: a code change is sent to review, test and security agents. The review and security agents call SonarQube and Black Duck through MCP servers, and all three feed one report.">
        <Link d="M160 40 C160 62 62 60 62 92" delay={0.3} begin={0} {...p} />
        <Link d="M160 40 L160 92" delay={0.4} begin={0.4} {...p} />
        <Link d="M160 40 C160 62 258 60 258 92" delay={0.5} begin={0.8} {...p} />
        <Link d="M62 118 L62 166" delay={0.8} begin={1.1} {...p} />
        <Link d="M258 118 L258 166" delay={0.9} begin={1.5} {...p} />
        <Link d="M62 192 C62 232 160 220 160 252" delay={1.1} begin={1.9} {...p} />
        <Link d="M160 118 L160 252" delay={1.1} begin={1.2} {...p} />
        <Link d="M258 192 C258 232 160 220 160 252" delay={1.2} begin={2.2} {...p} />

        <Node x={160} y={27} w={104} label="CODE CHANGE" delay={0.1} {...p} />
        <Node x={62} y={105} label="REVIEW AGENT" w={96} hot delay={0.5} {...p} />
        <Node x={160} y={105} label="TEST AGENT" w={84} hot delay={0.6} {...p} />
        <Node x={258} y={105} label="SECURITY AGENT" w={104} hot delay={0.7} {...p} />
        <Node x={62} y={179} label="SONARQUBE" delay={1} {...p} />
        <Node x={258} y={179} label="BLACK DUCK" delay={1.1} {...p} />
        <Node x={160} y={265} w={84} label="REPORT" delay={1.4} {...p} />
        <text x={70} y={146} className="fig-note">MCP</text>
        <text x={266} y={146} className="fig-note">MCP</text>
      </svg>
    </div>
  );
}

const RESULTS = [0.94, 0.91, 0.86, 0.71, 0.52, 0.33];

/* Fig: a query is embedded and the index returns passages ranked by similarity. */
export function RetrievalFigure() {
  const { ref, reduce, show } = useFigure();
  const p = { show, reduce };
  return (
    <div className="fig-plot" ref={ref}>
      <svg viewBox="0 0 320 300" role="img" aria-label="Diagram: a query becomes an embedding vector, which is compared against the index. Six passages are returned ranked by cosine similarity from 0.94 down to 0.33; the top three are highlighted.">
        <Node x={54} y={27} w={72} label="QUERY" delay={0.1} {...p} />
        <Link d="M92 27 L128 27" delay={0.3} dur={1.6} {...p} />
        {Array.from({ length: 14 }, (_, i) => (
          <motion.rect
            key={i}
            x={132 + i * 13}
            y={17}
            width="10"
            height="20"
            className="fig-cell"
            initial={reduce ? false : { opacity: 0 }}
            animate={show ? { opacity: 0.25 + ((i * 37) % 70) / 100 } : undefined}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.04 }}
          />
        ))}
        <text x={132} y={54} className="fig-note">EMBEDDING</text>
        <Link d="M222 60 L222 82" delay={1.1} dur={1.6} begin={0.8} {...p} />

        {RESULTS.map((v, i) => {
          const y = 96 + i * 32;
          const top = i < 3;
          return (
            <g key={i}>
              <text x={4} y={y + 13} className="fig-note">#{i + 1}</text>
              <rect x={28} y={y} width={244} height={20} className="fig-track" />
              <motion.rect
                x={28}
                y={y}
                height={20}
                className={top ? 'fig-bar is-hot' : 'fig-bar'}
                initial={reduce ? false : { width: 0 }}
                animate={show ? { width: 244 * v } : undefined}
                transition={{ duration: 1, delay: 1.2 + i * 0.1, ease: EASE }}
              />
              <text x={316} y={y + 13} textAnchor="end" className={top ? 'fig-note is-hot' : 'fig-note'}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        <text x={28} y={294} className="fig-note">TOP 3 PASSED TO THE MODEL AS CONTEXT</text>
      </svg>
    </div>
  );
}

/* Fig: an orchestrator routes documents to four agents; two cite a retrieval layer. */
export function HubFigure() {
  const { ref, reduce, show } = useFigure();
  const p = { show, reduce };
  return (
    <div className="fig-plot" ref={ref}>
      <svg viewBox="0 0 320 300" role="img" aria-label="Diagram: documents enter an orchestrator, which routes them to extraction, internal policy, federal regulation and categorisation agents. The two compliance agents draw on a shared retrieval layer of regulations and policy.">
        <Link d="M160 34 L160 84" delay={0.2} dur={1.8} {...p} />
        <Link d="M160 110 C160 140 50 132 50 162" delay={0.5} begin={0.3} {...p} />
        <Link d="M160 110 C160 140 124 138 124 162" delay={0.6} begin={0.7} {...p} />
        <Link d="M160 110 C160 140 198 138 198 162" delay={0.7} begin={1.1} {...p} />
        <Link d="M160 110 C160 140 272 132 272 162" delay={0.8} begin={1.5} {...p} />
        <Link d="M124 252 L124 188" delay={1.3} begin={0.5} dur={2} {...p} />
        <Link d="M198 252 L198 188" delay={1.4} begin={1.2} dur={2} {...p} />

        <Node x={160} y={21} w={110} label="10,000+ DOCS / DAY" delay={0.1} {...p} />
        <Node x={160} y={97} w={112} h={28} label="ORCHESTRATOR" hot delay={0.3} {...p} />
        <Node x={50} y={175} w={70} label="EXTRACT" delay={0.8} {...p} />
        <Node x={124} y={175} w={64} label="POLICY" hot delay={0.9} {...p} />
        <Node x={198} y={175} w={72} label="FEDERAL" hot delay={1} {...p} />
        <Node x={272} y={175} w={78} label="CATEGORISE" delay={1.1} {...p} />
        <Node x={161} y={265} w={188} label="RAG: REGULATIONS + POLICY" delay={1.5} {...p} />
        <text x={206} y={226} className="fig-note">CITED SOURCE TEXT</text>
      </svg>
    </div>
  );
}

const N = 8;
// Deterministic similarity scores: strong on the diagonal, weak elsewhere.
const MATRIX = Array.from({ length: N }, (_, r) =>
  Array.from({ length: N }, (_, c) => {
    const noise = ((r * 37 + c * 91 + r * c * 13) % 100) / 100;
    if (r === c) return 0.8 + noise * 0.16;
    if (Math.abs(r - c) === 1) return 0.28 + noise * 0.2;
    return 0.05 + noise * 0.2;
  }),
);

/* Fig: similarity heat map between candidate and reference answers. */
export function SimilarityFigure() {
  const { ref, reduce, show } = useFigure();
  const [hover, setHover] = useState(null);
  const cell = 34;
  const gap = 4;
  const off = 30;
  const size = off + N * (cell + gap);

  return (
    <div className="fig-plot" ref={ref}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Heat map of cosine similarity between eight candidate answers and eight reference answers; the diagonal is brightest."
        onPointerLeave={() => setHover(null)}
      >
        {Array.from({ length: N }, (_, i) => (
          <g key={i}>
            <text x={off + i * (cell + gap) + cell / 2} y={16} textAnchor="middle" className="fig-note">R{i + 1}</text>
            <text x={12} y={off + i * (cell + gap) + cell / 2 + 3.5} textAnchor="middle" className="fig-note">A{i + 1}</text>
          </g>
        ))}
        {MATRIX.map((row, r) =>
          row.map((v, c) => {
            const active = hover && hover.r === r && hover.c === c;
            const dimmed = hover && !active && hover.r !== r && hover.c !== c;
            return (
              <motion.rect
                key={`${r}-${c}`}
                x={off + c * (cell + gap)}
                y={off + r * (cell + gap)}
                width={cell}
                height={cell}
                fill="var(--signal)"
                stroke={active ? 'var(--ink)' : 'transparent'}
                strokeWidth="1.5"
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={show ? { opacity: dimmed ? v * 0.35 : v, scale: 1 } : undefined}
                transition={{ duration: hover ? 0.25 : 0.7, delay: hover ? 0 : 0.15 + (r + c) * 0.045, ease: EASE }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center', cursor: 'crosshair' }}
                onPointerEnter={() => setHover({ r, c, v })}
              />
            );
          }),
        )}
      </svg>
      <p className="fig-readout mono" aria-live="polite">
        {hover ? `A${hover.r + 1} × R${hover.c + 1}   cos ${hover.v.toFixed(2)}` : 'Hover a cell to read its score'}
      </p>
    </div>
  );
}
