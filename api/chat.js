import { GoogleGenerativeAI } from '@google/generative-ai';
import { PORTFOLIO_CONTEXT, MODEL_NAME, isLikelyRelevant, OFF_TOPIC_RESPONSE } from '../config.js';

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

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: PORTFOLIO_CONTEXT,
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

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: 'Failed to get response',
      details: error.message
    });
  }
}