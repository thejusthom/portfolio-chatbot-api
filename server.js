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

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: PORTFOLIO_CONTEXT,
    });

    // Build conversation history for Gemini
    const chatHistory = history.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.json({ 
      reply,
      usage: result.response.usageMetadata
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Portfolio Chatbot API running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local:    http://localhost:${PORT}
📍 Endpoint: http://localhost:${PORT}/api/chat
📦 Model:    ${MODEL_NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test with:
curl -X POST http://localhost:${PORT}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is your tech stack?"}'
  `);
});