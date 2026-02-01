# Local Development Guide

## Prerequisites
- Node.js 18+ installed
- Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Setup

### 1. Install dependencies
```bash
cd portfolio-chatbot-api
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Then edit `.env` and add your actual API key:
```
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Run locally
```bash
npm run dev
```

This starts an Express server at `http://localhost:3001`

### 4. Test the API

**Option A: Using curl**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your tech stack?"}'
```

**Option B: Using the test script**
```bash
node test-local.js
```

### 5. Test with your React frontend

In your portfolio folder, create `.env.local`:
```
REACT_APP_CHAT_API_URL=http://localhost:3001/api/chat
```

Then run your portfolio:
```bash
cd ../portfolio-thejus
npm start
```

Now the chat widget will talk to your local API!

---

## How It Works

**Local Development:** Uses `server.js` (Express)
**Production (Vercel):** Uses `api/chat.js` (Serverless)

Both use the same logic, just different frameworks. When you deploy to Vercel via GitHub, it automatically uses the serverless function.

---

## Common Issues

**"Cannot find module" error**
→ Run `npm install` first

**"GEMINI_API_KEY not set" error**
→ Make sure `.env` file exists with your API key

**Port 3001 already in use**
→ Change PORT in server.js or kill other processes

**CORS error in browser**
→ The server has CORS enabled, should work. Try testing with curl first.