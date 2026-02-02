// server.js - Local development server
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PORTFOLIO_CONTEXT, MODEL_NAME } from './config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
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

    return res.json({ reply });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response',
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`
🚀 Portfolio Chatbot API
━━━━━━━━━━━━━━━━━━━━━━━━
📍 http://localhost:${PORT}/api/chat
📦 Model: ${MODEL_NAME}
  `);
});