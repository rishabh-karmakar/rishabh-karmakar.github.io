import { useCallback, useEffect, useRef, useState } from 'react';
import { corpus } from './corpus';
import { fitMap } from './project';

/* ---------------- keyword baseline (BM25) ---------------- */

const STOP = new Set(
  'a an and are as at be been but by can did do does for from had has have he her his how i in is it its me my of on or our she so that the their them they this to was we were what when where which who why will with you your about into than then there these those would could should any some more most other such also just over under between during'.split(' '),
);
const stem = (w) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w);
const tokenize = (t) =>
  (t.toLowerCase().match(/[a-z0-9+#]+/g) || []).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

const docs = corpus.map((c) => tokenize(c.text));
const avgLen = docs.reduce((n, d) => n + d.length, 0) / docs.length;
const df = new Map();
docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));

// BM25 score of every passage for a query
function keywordScores(query) {
  const terms = tokenize(query);
  return docs.map((d) => {
    let s = 0;
    for (const term of terms) {
      const n = df.get(term);
      if (!n) continue;
      const tf = d.reduce((c, w) => c + (w === term), 0);
      if (!tf) continue;
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      s += (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.length / avgLen)));
    }
    return s;
  });
}

/*
 * How much of a question's distinctive vocabulary a passage shares, 0..1.
 * Rare words count for more, and words that appear nowhere on the site count
 * the most, so a question about something absent scores near zero.
 */
const idf = (term) => {
  const n = df.get(term) || 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};
function coverage(query, index) {
  const terms = [...new Set(tokenize(query))];
  const have = new Set(docs[index]);
  const total = terms.reduce((a, t) => a + idf(t), 0) || 1;
  return terms.reduce((a, t) => a + (have.has(t) ? idf(t) : 0), 0) / total;
}

export function keywordSearch(query, k = 5) {
  const scored = keywordScores(query).map((score, i) => ({ chunk: corpus[i], score }));
  const top = scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  const max = top[0]?.score || 1;
  return top.map((r) => ({ ...r, rel: r.score / max }));
}

/* ---------------- neural search (embeddings in a worker) ---------------- */

const dot = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
};

/*
 * Stage one: candidate passages by cosine similarity, with a small keyword
 * bonus so passages that use the question's exact terms (tool names, mostly)
 * are not missed.
 */
export function candidates(vector, vectors, query, k = 8, allow = null) {
  const lex = keywordScores(query);
  const maxLex = Math.max(...lex, 1e-9);
  const all = vectors.map((v, i) => {
    const cos = dot(vector, v);
    return { chunk: corpus[i], cos, cover: coverage(query, i), order: cos + 0.05 * (lex[i] / maxLex) };
  }).filter((c) => !allow || allow(c.chunk));
  const pool = [...all].sort((a, b) => b.order - a.order).slice(0, k);
  // the passage sharing most of the question's own words always gets a hearing
  const worded = all.reduce((best, c) => (c.cover > best.cover ? c : best));
  if (!pool.includes(worded)) pool.push(worded);
  return pool;
}

/*
 * Confidence bands, set by running on-topic and deliberately off-topic
 * requirements through both models and looking at where they separate:
 * unrelated text scored below -9.7 on the cross-encoder, real matches above -7.
 */
const NO_MATCH_LOGIT = -8.5;
const SURE_LOGIT = -3;
const SURE_COS = 0.72;
const SHARED_WORDS = 0.3; // enough distinctive vocabulary in common to overrule a 'no match'
const SAME_TOPIC = 0.22; // below this the passage barely uses the question's words
const CERTAIN_LOGIT = 3;
const relevance = (logit) => Math.min(1, Math.max(0, (logit + 11) / 17));

// Decide how good the evidence for one question is, and which passage to show.
function grade(cands) {
  const byLogit = [...cands].sort((x, y) => y.logit - x.logit);
  const byCos = [...cands].sort((x, y) => y.order - x.order);
  const top = byLogit[0];
  if (top.logit < NO_MATCH_LOGIT) {
    // the cross-encoder says no; believe it unless a candidate plainly shares the question's own terms
    const worded = [...cands].sort((x, y) => y.cover - x.cover)[0];
    if (worded.cover < SHARED_WORDS) return { level: 'none', best: top, results: byLogit };
    return { level: 'partial', best: worded, results: [worded, ...byLogit.filter((c) => c !== worded)] };
  }
  /*
   * A confident reranker wins, unless the passage shares almost none of the
   * question's wording: that is how "leading a team of ML researchers" got
   * credited to an ML internship, and a PhD to a master's degree. Those are
   * related, not direct.
   */
  if (top.logit >= SURE_LOGIT) {
    const direct = top.cover >= SAME_TOPIC || top.logit >= CERTAIN_LOGIT;
    return { level: direct ? 'strong' : 'partial', best: top, results: byLogit };
  }
  // failing that a confident retriever; otherwise it is only related
  if (byCos[0].cos >= SURE_COS) {
    return { level: 'strong', best: byCos[0], results: [byCos[0], ...byLogit.filter((c) => c !== byCos[0])] };
  }
  return { level: 'partial', best: top, results: byLogit };
}

/*
 * status: idle -> loading (progress 0..1) -> indexing -> ready | error
 * load() starts the downloads; search() and match() wait for them.
 */
export function useEngine() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null); // every passage as a point on a 2-D map
  const worker = useRef(null);
  const vectors = useRef(null);
  const pending = useRef(new Map());
  const seq = useRef(0);
  const readyWaiters = useRef([]);
  const failed = useRef(null); // why the models are unavailable, once loading has failed

  useEffect(() => () => worker.current?.terminate(), []);

  // Loading failed: tell everyone waiting, and drop the worker so a later search can try again.
  const giveUp = useCallback((message) => {
    failed.current = message;
    setError(message);
    setStatus('error');
    worker.current?.terminate();
    worker.current = null;
    const err = new Error(message);
    readyWaiters.current.forEach((r) => r.reject(err));
    readyWaiters.current = [];
    pending.current.forEach((r) => r.reject(err));
    pending.current.clear();
  }, []);

  const load = useCallback(() => {
    if (worker.current || vectors.current) return;
    failed.current = null;
    setStatus('loading');
    const w = new Worker(new URL('./embedWorker.js', import.meta.url), { type: 'module' });
    worker.current = w;
    w.onmessage = ({ data }) => {
      if (data.type === 'progress') setProgress(data.value);
      else if (data.type === 'indexing') setStatus('indexing');
      else if (data.type === 'ready') {
        vectors.current = data.vectors;
        setMap(fitMap(data.vectors));
        setStatus('ready');
        readyWaiters.current.forEach((r) => r.resolve());
        readyWaiters.current = [];
      } else if (data.type === 'done') {
        pending.current.get(data.id)?.resolve(data);
        pending.current.delete(data.id);
      } else if (data.type === 'error') {
        if (data.id != null && pending.current.has(data.id)) {
          pending.current.get(data.id).reject(new Error(data.message));
          pending.current.delete(data.id);
        } else {
          giveUp(data.message);
        }
      }
    };
    w.onerror = (e) => giveUp(e.message || 'The model worker failed to start.');
    w.postMessage({ type: 'init', texts: corpus.map((c) => c.text) });
  }, [giveUp]);

  const whenReady = useCallback(
    () =>
      vectors.current
        ? Promise.resolve()
        : failed.current
          ? Promise.reject(new Error(failed.current)) // do not wait for a load that already failed
          : new Promise((resolve, reject) => {
              readyWaiters.current.push({ resolve, reject });
            }),
    [],
  );

  // one round trip to the worker
  const call = useCallback(
    async (message) => {
      await whenReady();
      const id = (seq.current += 1);
      return new Promise((resolve, reject) => {
        pending.current.set(id, { resolve, reject });
        worker.current.postMessage({ ...message, id });
      });
    },
    [whenReady],
  );

  /*
   * Stage two for a batch of questions: every question's candidates are scored
   * as [question, passage] pairs by the cross-encoder, then re-sorted.
   * `rel` rescales the cross-encoder's score to 0..1 for display.
   */
  const retrieve = useCallback(
    async (questions, pool, keep, allow = null) => {
      await whenReady(); // time the query itself, not the one-off model download
      const t0 = performance.now();
      const { vectors: qs } = await call({ type: 'embed', texts: questions });
      const pools = qs.map((v, i) => candidates(v, vectors.current, questions[i], pool, allow));
      const pairs = pools.flatMap((cands, i) => cands.map((c) => [questions[i], c.chunk.text]));
      const { logits } = await call({ type: 'score', pairs });
      let n = 0;
      const graded = pools.map((cands) => {
        const scored = cands.map((c) => {
          const logit = logits[n];
          n += 1;
          return { ...c, logit, rel: relevance(logit) };
        });
        const g = grade(scored);
        return { ...g, results: g.results.slice(0, keep) };
      });
      return { graded, qs, ms: performance.now() - t0 };
    },
    [call, whenReady],
  );

  const search = useCallback(
    async (query, k = 5, { usage = false } = {}) => {
      // "Where was this skill used?" should not be answered by the list of
      // skills itself, so those passages sit out unless nothing else matches.
      const lists = /^(Skills|Certifications)/;
      if (usage) {
        const { graded, qs, ms } = await retrieve([query], 10, k, (c) => !lists.test(c.source));
        if (graded[0].level !== 'none') return { ...graded[0], vector: qs[0], ms };
      }
      const { graded, qs, ms } = await retrieve([query], 10, k);
      // listedOnly: asked where a skill was used, and only the skill list mentions it
      return { ...graded[0], vector: qs[0], ms, listedOnly: usage && graded[0].level !== 'none' && lists.test(graded[0].best.chunk.source) };
    },
    [retrieve],
  );

  // best piece of evidence for each of several statements
  const match = useCallback(
    async (statements) => {
      const { graded, ms } = await retrieve(statements, 6, 1);
      return { rows: statements.map((text, i) => ({ text, level: graded[i].level, best: graded[i].best })), ms };
    },
    [retrieve],
  );

  return { status, progress, error, map, load, search, match, size: corpus.length };
}
