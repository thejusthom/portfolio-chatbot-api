import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, MODEL_NAME, isLikelyRelevant, OFF_TOPIC_RESPONSE } from '../config.js';
import { retrieve, allChunks, buildQueryText } from '../lib/retriever.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ========== Relevance pre-filter ==========
    // If clearly off-topic, respond immediately without calling Gemini.
    // Saves API costs + guarantees consistent redirect.
    if (!isLikelyRelevant(message)) {
      return res.status(200).json({ reply: OFF_TOPIC_RESPONSE });
    }
    // ==========================================

    // ========== RAG retrieval ==========
    // Embed the question, cosine-match it against the pre-computed knowledge
    // chunks, and put only the top hits in the system prompt.
    let contextChunks;
    let sources = null;
    try {
      contextChunks = await retrieve(buildQueryText(message, history));
      sources = contextChunks.map(c => ({ id: c.id, score: +c.score.toFixed(3) }));
    } catch (retrievalError) {
      // Embedding call failed — fall back to stuffing the whole knowledge base.
      console.error('Retrieval failed, using full context:', retrievalError);
      contextChunks = allChunks();
    }
    // ===================================

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: buildSystemPrompt(contextChunks),
    });

    // Filter history: ensure it starts with a user message (Gemini requirement)
    const chatHistory = history
      .slice(-10)
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.status(200).json({ reply, sources });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: 'Failed to get response',
      details: error.message
    });
  }
}
