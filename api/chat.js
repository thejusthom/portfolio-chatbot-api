// api/chat.js - Vercel serverless function

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PORTFOLIO_CONTEXT, MODEL_NAME } from '../config.js';

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

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: PORTFOLIO_CONTEXT,
    });

    // Filter history: must start with 'user', alternate user/model
    // Skip any leading assistant messages
    let filteredHistory = history.slice(-10).filter(m => m.content && m.content.trim());
    
    // Find first user message index
    const firstUserIndex = filteredHistory.findIndex(m => m.role === 'user');
    if (firstUserIndex > 0) {
      filteredHistory = filteredHistory.slice(firstUserIndex);
    } else if (firstUserIndex === -1) {
      filteredHistory = []; // No user messages, start fresh
    }

    const chatHistory = filteredHistory.map(m => ({
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