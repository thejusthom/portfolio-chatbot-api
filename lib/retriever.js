// lib/retriever.js — RAG retrieval
//
// At request time: embed the user's question, score it against every
// pre-computed chunk vector with cosine similarity, return the top-k chunks.

import { CHUNKS, EMBEDDING_MODEL, EMBEDDING_DIM } from '../data/embeddings.js';

const TOP_K = 4;

async function embedQuery(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: EMBEDDING_DIM,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding API ${response.status}: ${body}`);
  }

  const data = await response.json();
  return normalize(data.embedding.values);
}

function normalize(vector) {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / norm);
}

// Both vectors are normalized, so dot product == cosine similarity.
function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Cap on how much of the previous assistant reply goes into the query text.
const MAX_ASSISTANT_CONTEXT = 300;

/**
 * Follow-up questions ("tell me more about that", "what do you do there")
 * carry little meaning on their own, so the previous user turn and the
 * previous assistant reply are prepended to the query text. The reply matters
 * because it's often where the referent ("there", "that") was introduced.
 */
export function buildQueryText(message, history = []) {
  const lastTurn = role => history
    .filter(m => m.role === role && m.content)
    .slice(-1)
    .map(m => m.content);
  const lastAssistantTurn = lastTurn('assistant')
    .map(text => text.slice(0, MAX_ASSISTANT_CONTEXT));
  return [...lastTurn('user'), ...lastAssistantTurn, message].join('\n');
}

/**
 * Returns the top-k most relevant chunks for a query, each with a `score`
 * (cosine similarity, 0..1).
 */
export async function retrieve(queryText, topK = TOP_K) {
  const queryVector = await embedQuery(queryText);
  return CHUNKS
    .map(chunk => ({ ...chunk, score: dot(queryVector, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Fallback if the embedding call fails: the whole knowledge base
 * (it's small enough to fit in the prompt, just like the pre-RAG version).
 */
export function allChunks() {
  return CHUNKS;
}
