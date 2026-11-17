import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { profile } from '../data/content';
import { corpus } from '../engine/corpus';
import { evalCases } from '../engine/evals';
import { keywordSearch, useEngine } from '../engine/search';
import { ASK_EVENT, openItem, scrollToSection } from '../utils/ask';
import { tabKeys } from '../utils/tabs';
import { KineticTitle } from './Reveal';
import './Ask.css';

const SUGGESTIONS = [
  'Has he built AI agents?',
  'Experience with LLM agents',
  'Can he work with non-technical stakeholders?',
  'What has he published?',
  'Has he led or mentored people?',
];

const SAMPLE_JD = `Build and ship LLM-powered features, including retrieval-augmented generation and agent workflows
Work directly with customers and business stakeholders to turn requirements into production systems
Strong Python and experience with a modern ML framework such as PyTorch
Experience with vector databases, embeddings and semantic search
Deploy and operate services on a major cloud platform with Docker and Kubernetes
Evaluate model quality and keep production systems reliable
Communicate clearly through demos, documentation and mentoring
Published research or a strong academic background in machine learning
Experience designing custom silicon for AI accelerators`;

const LEVELS = { strong: 'Direct evidence', partial: 'Related evidence', none: 'Still learning' };
const GAP = 'Not something I’ve done yet, and I won’t pretend otherwise. It goes on my list to learn.';

// One requirement per line or sentence. Full sentences are preferred, but a
// single word ("painter") is still a fair question and gets an answer.
function splitRequirements(text) {
  const lines = text
    .split(/\n|(?<=[.;])\s+(?=[A-Z])/)
    .map((l) => l.replace(/^[\s\-*•\d.)]+/, '').trim())
    .filter((l) => l.length >= 2 && l.length <= 260);
  const unique = [...new Set(lines)]; // a repeated line is one requirement
  const full = unique.filter((l) => l.length >= 18);
  return (full.length ? full : unique).slice(0, 14);
}

// Results usually come back in well under a second, too fast to see that four
// separate stages ran. Each search holds for a moment while the stages are
// named, unless the visitor prefers reduced motion.
const SHOW_MS = 1900;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const staged = async (work) => {
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [out] = await Promise.all([work, wait(still ? 0 : SHOW_MS)]);
  return out;
};

function Pipeline({ steps }) {
  return (
    <ol className="pipeline mono" role="status" aria-label="Working">
      {steps.map((s, i) => (
        <li key={s} style={{ '--i': i }}>
          <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> {s}
        </li>
      ))}
    </ol>
  );
}

function Status({ engine }) {
  const { status, progress, error, size } = engine;
  const text = {
    idle: 'Keyword engine ready. Two small neural models (about 57 MB together) load in the background, then stay cached.',
    loading: `Downloading the retrieval and reranking models… ${Math.round(progress * 100)}%`,
    indexing: `Embedding ${size} passages from this site…`,
    ready: `Neural engine ready: bge-small retrieval + MiniLM cross-encoder reranking, ${size} passages indexed, running on your device.`,
    error: `Neural model unavailable (${error}). Keyword results only.`,
  }[status];
  return (
    <p className={`engine-status mono is-${status}`} role="status">
      <span className="engine-dot" aria-hidden="true" />
      {text}
      {(status === 'loading' || status === 'indexing') && (
        <span className="engine-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${status === 'indexing' ? 1 : Math.max(0.03, progress)})` }} />
        </span>
      )}
    </p>
  );
}

// The passage's source. Following it reveals the exact mission, project or role cited.
function SourceLink({ chunk }) {
  const go = (e) => {
    if (!chunk.open) return;
    e.preventDefault();
    openItem(chunk.open);
  };
  return (
    <a className="hit-source mono link-wipe" href={chunk.href} onClick={go}>
      {chunk.source} &rarr;
    </a>
  );
}

function Hit({ r, i, value, label }) {
  return (
    <li className="hit">
      <span className="hit-rank mono">{String(i + 1).padStart(2, '0')}</span>
      <div className="hit-main">
        <p>{r.chunk.text}</p>
        <SourceLink chunk={r.chunk} />
      </div>
      <div className="hit-score mono">
        <b>{label}</b>
        <span className="hit-bar" aria-hidden="true">
          <span style={{ width: `${Math.max(4, Math.min(100, value * 100))}%` }} />
        </span>
      </div>
    </li>
  );
}

/* ---------------- constellation map ---------------- */

const KINDS = [
  ['Missions', /^Mission/],
  ['Projects', /^Project/],
  ['Research', /^(Paper|Google Scholar)/],
  ['Awards', /^Award/],
  ['Skills', /^(Skills|Certifications|Languages)/],
  ['About', /^About/],
  ['Experience', /./],
];
const kindOf = (source) => KINDS.findIndex(([, re]) => re.test(source));
const MAP_W = 400;
const MAP_H = 280;
const sx = (x) => MAP_W / 2 + x * (MAP_W / 2 - 26);
const sy = (y) => MAP_H / 2 - y * (MAP_H / 2 - 24);

/*
 * Every passage on the site as a star, placed so that passages with similar
 * meaning sit near each other. A question lands on the same map, joined to the
 * passages the engine picked for it.
 */
function SkyMap({ map, at, hits }) {
  const [hover, setHover] = useState(null);
  const picked = new Set(hits.map((h) => h.chunk.id));
  const shown = hover != null ? corpus[hover] : null;

  return (
    <figure className="sky">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label={`Map of ${corpus.length} passages by meaning. Your question sits closest to: ${hits.map((h) => h.chunk.source).join('; ')}.`}
        onMouseLeave={() => setHover(null)}
      >
        {hits.map((h, i) => {
          const [x, y] = map.points[h.chunk.id];
          return <line key={h.chunk.id} className="sky-link" x1={sx(at[0])} y1={sy(at[1])} x2={sx(x)} y2={sy(y)} style={{ animationDelay: `${i * 0.07}s` }} />;
        })}
        {map.points.map(([x, y], i) => (
          <circle
            key={corpus[i].id}
            className={`sky-star k${kindOf(corpus[i].source)} ${picked.has(i) ? 'is-hit' : ''} ${hover === i ? 'is-hover' : ''}`}
            cx={sx(x)}
            cy={sy(y)}
            r={picked.has(i) ? 4.2 : 2.4}
            onMouseEnter={() => setHover(i)}
          />
        ))}
        <g className="sky-query" transform={`translate(${sx(at[0])} ${sy(at[1])})`}>
          <circle r="9" className="sky-query-halo" />
          <path d="M0 -8 L1.6 -1.6 L8 0 L1.6 1.6 L0 8 L-1.6 1.6 L-8 0 L-1.6 -1.6 Z" />
        </g>
      </svg>
      <figcaption className="mono">
        {shown ? (
          <>
            <b>{shown.source}</b> {shown.text.slice(0, 96)}&hellip;
          </>
        ) : (
          <>
            <b>&#10022; your question</b> among {corpus.length} passages, placed by meaning. Hover a star.
          </>
        )}
      </figcaption>
      <ul className="sky-legend mono" aria-hidden="true">
        {KINDS.map(([name], i) => (
          <li key={name} className={`k${i}`}>{name}</li>
        ))}
      </ul>
    </figure>
  );
}

/* ---------------- ask a question ---------------- */

function AskMode({ engine, request }) {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [listedOnly, setListedOnly] = useState(false);
  const latest = useRef(0); // only the most recent search may update the screen
  const [asked, setAsked] = useState('');
  const [lexical, setLexical] = useState([]);
  const [neural, setNeural] = useState(null);
  const [level, setLevel] = useState('none');
  const [at, setAt] = useState(null);
  const [ms, setMs] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (q, opts) => {
    const text = q.trim();
    if (!text) return;
    setQuery(text);
    setAsked(text);
    setLexical(keywordSearch(text));
    setNeural(null);
    setCopied(false);
    setBusy(true);
    const mine = (latest.current += 1);
    engine.load();
    try {
      const out = await staged(engine.search(text, 5, opts));
      if (mine !== latest.current) return;
      setNeural(out.results);
      setLevel(out.level);
      setListedOnly(Boolean(out.listedOnly));
      setAt(out.vector);
      setMs(out.ms);
    } catch {
      if (mine !== latest.current) return;
      setNeural(null);
    }
    setBusy(false);
  };

  // a question handed over from a skill, a planet or a shared link
  const runRef = useRef(null);
  const touched = useRef(false); // the visitor has typed or asked something
  useEffect(() => {
    runRef.current = run;
    touched.current = Boolean(asked || query);
  });
  useEffect(() => {
    if (!request) return;
    // the arrival demo never overrides something the visitor already typed or asked
    if (request.demo && touched.current) return;
    runRef.current?.(request.q, { usage: request.usage });
  }, [request]);

  // a link that reopens the site with this question already asked
  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(asked)}#ask`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
      >
        <label className="sr-only" htmlFor="ask-input">Ask a question about my work</label>
        <input
          id="ask-input"
          className="ask-input"
          type="search"
          autoComplete="off"
          placeholder="Ask anything about my work"
          onFocus={engine.load}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search <span className="arrow" aria-hidden="true">&rarr;</span>
        </button>
      </form>

      <div className="ask-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip mono" onClick={() => run(s)}>
            {s}
          </button>
        ))}
      </div>

      <Status engine={engine} />
      {busy && engine.status !== 'error' && (
        <Pipeline steps={['Embed the question', `Scan ${engine.size} passages`, 'Rerank the shortlist', 'Grade the evidence']} />
      )}

      {asked && neural && (
        <div className="ask-top">
          <div className={`answer ${level === 'none' ? 'is-gap' : ''}`} aria-live="polite">
            {level !== 'none' ? (
              <>
                <p className="answer-label mono">
                  {listedOnly ? 'Listed skill' : 'Best evidence'} <i>{listedOnly ? 'no project evidence yet' : level === 'strong' ? 'strong match' : 'related match'}</i>
                </p>
                <p className="answer-text">{neural[0].chunk.text}</p>
                {listedOnly && (
                  <p className="answer-note">This is on my skill list, but nothing else on this site shows it in use yet.</p>
                )}
                <SourceLink chunk={neural[0].chunk} />
              </>
            ) : (
              <>
                <p className="answer-label mono">Still learning</p>
                <p className="answer-text">
                  I don&rsquo;t have a real answer to that yet, and I&rsquo;d rather say so than stretch something to fit. The closest passages are below.
                </p>
              </>
            )}
          </div>
          {engine.map && at && <SkyMap map={engine.map} at={engine.map.place(at)} hits={neural} />}
        </div>
      )}
      {asked && neural && (
        <p className="share-bar mono">
          <button type="button" className="chip mono" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy a link to this search'}
          </button>
          <span>Anyone who opens it sees this question answered live.</span>
        </p>
      )}

      {asked && !busy && (
        <div className="ask-results">
          <section aria-label="Neural results">
            <h3 className="col-title mono">
              Neural <i>retrieve by meaning, then rerank</i>
              {ms != null && neural && <span>{ms.toFixed(0)} ms</span>}
            </h3>
            {neural ? (
              <ol className="hits">
                {neural.map((r, i) => (
                  <Hit key={r.chunk.id} r={r} i={i} value={r.rel} label={`rel ${r.rel.toFixed(2)}`} />
                ))}
              </ol>
            ) : (
              <p className="ask-empty">Semantic results need the neural model, which could not be loaded. Keyword results still work.</p>
            )}
          </section>

          <section aria-label="Keyword results">
            <h3 className="col-title mono">
              Keyword <i>by exact words</i>
            </h3>
            {lexical.length ? (
              <ol className="hits is-dim">
                {lexical.map((r, i) => (
                  <Hit key={r.chunk.id} r={r} i={i} value={r.rel} label={`bm25 ${r.score.toFixed(1)}`} />
                ))}
              </ol>
            ) : (
              <p className="ask-empty">No passage shares a word with that question. This is where keyword search gives up.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}

/* ---------------- match a job description ---------------- */

// The match as a one-page document. It lives outside the app and is shown only
// while printing, so "Save as PDF" in the print dialog produces a clean brief.
function Brief({ rows }) {
  const strong = rows.filter((r) => r.level === 'strong').length;
  const partial = rows.filter((r) => r.level === 'partial').length;
  const gaps = rows.length - strong - partial;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return createPortal(
    <div className="brief">
      <h1>{profile.name}</h1>
      <p className="brief-meta">Evidence brief &middot; {today} &middot; rishabh-karmakar.github.io</p>
      <p className="brief-summary">
        Of {rows.length} requirements: <b>{strong}</b> with direct evidence, <b>{partial}</b> with related evidence, <b>{gaps}</b> not yet done.
        Each line below quotes the passage it rests on, so the match can be checked.
      </p>
      <table>
        <thead>
          <tr>
            <th>Match</th>
            <th>Requirement</th>
            <th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.text}>
              <td>{{ strong: 'Direct', partial: 'Related', none: 'Not yet' }[r.level]}</td>
              <td>{r.text}</td>
              <td>
                {r.level === 'none' ? (
                  'Not something I have done yet. It is on my list to learn.'
                ) : (
                  <>
                    {r.best.chunk.text}
                    <span className="brief-source">{r.best.chunk.source}</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="brief-foot">
        Produced in the browser by a retrieval engine (bge-small embeddings, MiniLM cross-encoder reranking) over the text of
        rishabh-karmakar.github.io. It finds and quotes evidence; it does not judge fit. {profile.linkedin.replace('https://www.', '')}
      </p>
    </div>,
    document.body,
  );
}

function MatchMode({ engine }) {
  const [text, setText] = useState('');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const run = async (source) => {
    const reqs = splitRequirements(source);
    if (!reqs.length) {
      setNote('Type or paste at least one requirement first.');
      return;
    }
    setNote('');
    setRows(null);
    setBusy(true);
    engine.load();
    try {
      const out = await staged(engine.match(reqs));
      setRows(out.rows);
    } catch {
      setNote('The neural model could not be loaded, so matching is unavailable right now.');
    }
    setBusy(false);
  };

  // show the brief only for the duration of the print dialog
  useEffect(() => {
    const done = () => document.documentElement.classList.remove('printing-brief');
    window.addEventListener('afterprint', done);
    return () => window.removeEventListener('afterprint', done);
  }, []);
  const printBrief = () => {
    document.documentElement.classList.add('printing-brief');
    window.print();
  };

  const strong = rows?.filter((r) => r.level === 'strong').length ?? 0;
  const partial = rows?.filter((r) => r.level === 'partial').length ?? 0;
  const waiting = busy && !rows;

  return (
    <>
      <div className="match-form">
        <label className="sr-only" htmlFor="jd-input">Job description</label>
        <textarea
          id="jd-input"
          className="ask-input match-input"
          rows={6}
          placeholder="Paste a job description or a list of requirements, one per line"
          onFocus={engine.load}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="match-actions">
          <button type="button" className="btn btn-primary" onClick={() => run(text)} disabled={busy}>
            Find the evidence <span className="arrow" aria-hidden="true">&rarr;</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setText(SAMPLE_JD);
              run(SAMPLE_JD);
            }}
            disabled={busy}
          >
            Try a sample
          </button>
        </div>
      </div>

      <Status engine={engine} />
      {note && <p className="ask-empty" role="alert">{note}</p>}
      {waiting && engine.status !== 'error' && (
        <Pipeline steps={['Split the requirements', 'Embed each one', 'Retrieve candidates', 'Rerank and grade']} />
      )}

      {rows && (
        <>
          <p className="match-summary">
            <b>{strong}</b> of {rows.length} {rows.length === 1 ? 'requirement has' : 'requirements have'} direct evidence on this site
            {partial > 0 && <>, <b>{partial}</b> {partial === 1 ? 'has' : 'have'} related evidence</>}
            {rows.length - strong - partial > 0 && <>, and <b>{rows.length - strong - partial}</b> I&rsquo;m still learning</>}.
            <span className="mono"> Retrieval, not a verdict: read the evidence.</span>
          </p>
          <div className="coverage" role="img" aria-label={`${strong} direct, ${partial} related, ${rows.length - strong - partial} still learning`}>
            {rows.map((r) => (
              <span key={r.text} className={`is-${r.level}`} />
            ))}
          </div>
          <ol className="match-rows">
            {rows.map((r) => (
              <li key={r.text} className={`match-row is-${r.level}`}>
                <div className="match-req">
                  <span className="match-level mono">{LEVELS[r.level]}</span>
                  <p>{r.text}</p>
                </div>
                <div className="match-evidence">
                  {r.level === 'none' ? (
                    <p className="learning">{GAP}</p>
                  ) : (
                    <>
                      <p>{r.best.chunk.text}</p>
                      <SourceLink chunk={r.best.chunk} />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="brief-bar">
            <button type="button" className="btn btn-ghost" onClick={printBrief}>
              Save as a PDF brief <span className="arrow" aria-hidden="true">&darr;</span>
            </button>
            <span className="mono">Opens the print dialog. Choose &ldquo;Save as PDF&rdquo; to keep or forward it.</span>
          </div>
          <Brief rows={rows} />
        </>
      )}
    </>
  );
}

/* ---------------- run the evals ---------------- */

function EvalMode({ engine }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [ms, setMs] = useState(null);

  const run = async () => {
    setNote('');
    setRows(null);
    setBusy(true);
    engine.load();
    try {
      const out = await staged(engine.match(evalCases.map((c) => c.text)));
      const graded = out.rows.map((r, i) => ({ ...r, expect: evalCases[i].expect, pass: r.level === evalCases[i].expect }));
      // failures first: they are the interesting part
      setRows([...graded.filter((r) => !r.pass), ...graded.filter((r) => r.pass)]);
      setMs(out.ms);
    } catch {
      setNote('The neural model could not be loaded, so the evals cannot run right now.');
    }
    setBusy(false);
  };

  const passed = rows?.filter((r) => r.pass).length ?? 0;
  const over = rows?.filter((r) => r.level === 'strong' && r.expect !== 'strong').length ?? 0;
  const missed = rows?.filter((r) => r.level === 'none' && r.expect !== 'none').length ?? 0;

  return (
    <>
      <p className="eval-intro">
        A demo that only shows its good answers proves little. This runs {evalCases.length} test requirements through the same
        engine, in your browser, and compares each grade with the one a fair reader of this site would give. The misses are
        listed first.
      </p>
      <div className="match-actions">
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
          Run the evals <span className="arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <Status engine={engine} />
      {note && <p className="ask-empty" role="alert">{note}</p>}
      {busy && !rows && engine.status !== 'error' && (
        <Pipeline steps={[`Load ${evalCases.length} cases`, 'Embed and retrieve', 'Rerank and grade', 'Compare with expected']} />
      )}

      {rows && (
        <>
          <dl className="eval-stats">
            <div>
              <dt className="mono">Graded as expected</dt>
              <dd>
                {passed}<span>/{rows.length}</span>
              </dd>
            </div>
            <div>
              <dt className="mono">Overclaims</dt>
              <dd>{over}</dd>
              <dd className="eval-stat-note">said &ldquo;direct evidence&rdquo; when it should not have</dd>
            </div>
            <div>
              <dt className="mono">Missed evidence</dt>
              <dd>{missed}</dd>
              <dd className="eval-stat-note">said &ldquo;still learning&rdquo; when evidence exists</dd>
            </div>
            <div>
              <dt className="mono">Run time</dt>
              <dd>
                {(ms / 1000).toFixed(1)}<span>s</span>
              </dd>
            </div>
          </dl>
          <div className="coverage eval-bar" role="img" aria-label={`${passed} of ${rows.length} cases graded as expected`}>
            {rows.map((r) => (
              <span key={r.text} className={r.pass ? 'is-strong' : 'is-fail'} />
            ))}
          </div>
          <ol className="eval-rows">
            {rows.map((r) => (
              <li key={r.text} className={`eval-row ${r.pass ? 'is-pass' : 'is-fail'}`}>
                <span className="eval-mark mono">{r.pass ? 'Pass' : 'Miss'}</span>
                <p>{r.text}</p>
                <span className="eval-grade mono">
                  {r.pass ? LEVELS[r.level] : <>expected {LEVELS[r.expect].toLowerCase()}, got {LEVELS[r.level].toLowerCase()}</>}
                  {r.level !== 'none' && <i> &middot; {r.best.chunk.source}</i>}
                </span>
              </li>
            ))}
          </ol>
          <p className="eval-foot mono">
            The expected grades are my own judgement, and the engine&rsquo;s thresholds were tuned on these same cases, so this is a
            regression check, not a held-out score.
          </p>
        </>
      )}
    </>
  );
}

const MODES = ['Ask a question', 'Match a job description', 'Run the evals'];

/* Mission control: a retrieval engine over this site, running in the browser. */
export default function Ask() {
  const engine = useEngine();
  const [mode, setMode] = useState(0);

  /*
   * Fetch the models in the background so the first search is instant. It
   * starts at the visitor's first sign of life (a scroll, a pointer move, a
   * key), not at page load, so the download never competes with the first
   * paint, and it is skipped on data-saver and very slow connections, where
   * the models load on demand instead.
   */
  // questions arriving from outside the console: a clicked skill, or ?q= in the address
  const [request, setRequest] = useState(null);
  useEffect(() => {
    const take = (q, delay, usage = false) => {
      const text = String(q || '').trim().slice(0, 200);
      if (!text) return;
      setMode(0);
      setRequest({ q: text, usage });
      setTimeout(() => scrollToSection('ask'), delay);
    };
    const onAsk = (e) => take(e.detail.q, 0, e.detail.usage);
    window.addEventListener(ASK_EVENT, onAsk);
    take(new URLSearchParams(window.location.search).get('q'), 700);
    return () => window.removeEventListener(ASK_EVENT, onAsk);
  }, []);

  // Show it working: the first time the console scrolls into view, run one sample
  // question. Skipped for shared links, data-saver and very slow connections.
  const sectionRef = useRef(null);
  useEffect(() => {
    const net = navigator.connection;
    if (net?.saveData || /2g/.test(net?.effectiveType || '')) return undefined;
    if (new URLSearchParams(window.location.search).get('q')) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setRequest((r) => r || { q: SUGGESTIONS[0], demo: true });
      },
      { threshold: 0.35 },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const { load } = engine;
  useEffect(() => {
    const net = navigator.connection;
    if (net?.saveData || /2g/.test(net?.effectiveType || '')) return undefined;
    const events = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
    const start = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      load();
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, start));
  }, [load]);

  return (
    <section id="ask" ref={sectionRef} className="section ask" style={{ '--glow': 'var(--hue-5)' }}>
      <div className="section-inner">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">
              <b>&#10022;</b> Mission control &middot; live demo
            </p>
            <KineticTitle className="section-title-sm" lines={[<>Query the <em>archive.</em></>]} />
          </div>
          <p className="section-desc">
            A semantic search engine over everything on this site, running in your browser. What you type never leaves your device.
          </p>
        </header>

        <div className="ask-console">
          <div className="dial" role="tablist" aria-label="Mode">
            {MODES.map((m, i) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={i === mode}
                tabIndex={i === mode ? 0 : -1}
                className={`dial-btn mono ${i === mode ? 'is-active' : ''}`}
                onClick={() => setMode(i)}
                onKeyDown={(e) => tabKeys(e, i, MODES.length, setMode)}
              >
                {m}
              </button>
            ))}
          </div>

          <div hidden={mode !== 0}>
            <AskMode engine={engine} request={request} />
          </div>
          <div hidden={mode !== 1}>
            <MatchMode engine={engine} />
          </div>
          <div hidden={mode !== 2}>
            <EvalMode engine={engine} />
          </div>
        </div>
      </div>
    </section>
  );
}
