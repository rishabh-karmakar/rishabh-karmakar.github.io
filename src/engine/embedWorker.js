import { AutoModelForSequenceClassification, AutoTokenizer, pipeline } from '@huggingface/transformers';

/*
 * Two-stage retrieval, off the main thread.
 *   1. A bi-encoder (bge-small) embeds passages and questions so candidates
 *      can be found by cosine similarity. Fast, but its scores are poorly
 *      calibrated: unrelated text still lands around 0.6.
 *   2. A cross-encoder reads each question together with each candidate and
 *      scores the pair directly. Slower, far better at saying "no match".
 * Both models are fetched once from the Hugging Face hub and cached by the
 * browser. Text typed by the visitor never leaves their machine.
 */
const EMBEDDER = 'Xenova/bge-small-en-v1.5';
const RERANKER = 'Xenova/ms-marco-MiniLM-L-6-v2';
const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: ';

let extractor = null;
let tokenizer = null;
let reranker = null;

async function embed(input, asQuery = false) {
  const texts = asQuery ? input.map((t) => QUERY_PREFIX + t) : input;
  const vectors = [];
  for (let i = 0; i < texts.length; i += 12) {
    const out = await extractor(texts.slice(i, i + 12), { pooling: 'cls', normalize: true });
    vectors.push(...out.tolist());
  }
  return vectors;
}

// relevance logit for each [question, passage] pair
async function score(pairs) {
  const logits = [];
  for (let i = 0; i < pairs.length; i += 16) {
    const batch = pairs.slice(i, i + 16);
    const inputs = tokenizer(batch.map((p) => p[0]), {
      text_pair: batch.map((p) => p[1]),
      padding: true,
      truncation: true,
    });
    const out = await reranker(inputs);
    logits.push(...out.logits.tolist().map((row) => row[0]));
  }
  return logits;
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      // two downloads share one progress bar: the embedder is the first half
      const report = (offset) => (p) => {
        if (p.status === 'progress' && typeof p.progress === 'number' && /onnx/.test(p.file || '')) {
          self.postMessage({ type: 'progress', value: offset + p.progress / 200 });
        }
      };
      extractor = await pipeline('feature-extraction', EMBEDDER, { dtype: 'q8', progress_callback: report(0) });
      tokenizer = await AutoTokenizer.from_pretrained(RERANKER);
      reranker = await AutoModelForSequenceClassification.from_pretrained(RERANKER, {
        dtype: 'q8',
        progress_callback: report(0.5),
      });
      self.postMessage({ type: 'indexing' });
      const vectors = await embed(data.texts);
      self.postMessage({ type: 'ready', vectors });
    } else if (data.type === 'embed') {
      const vectors = await embed(data.texts, true);
      self.postMessage({ type: 'done', id: data.id, vectors });
    } else if (data.type === 'score') {
      const logits = await score(data.pairs);
      self.postMessage({ type: 'done', id: data.id, logits });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: data.id, message: String(err?.message || err) });
  }
};
