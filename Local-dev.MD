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

## RAG Pipeline

The bot's knowledge is no longer one giant system prompt — it's retrieved per-question:

1. **Knowledge base** — facts live in `knowledge/*.md`, one `## section` = one chunk
2. **Ingestion** — `npm run embed` chunks the files, embeds each chunk with
   `gemini-embedding-001` (768 dims, normalized), and writes `data/embeddings.js`
3. **Retrieval** — at request time, `lib/retriever.js` embeds the question
   (plus the previous user turn, for follow-ups), scores every chunk by cosine
   similarity, and picks the top 4
4. **Generation** — `config.js#buildSystemPrompt()` combines the persona/scope
   rules with only the retrieved chunks; responses include a `sources` array
   with chunk ids + similarity scores for debugging

**Editing the bot's knowledge:**
```bash
# 1. Edit the markdown in knowledge/
# 2. Regenerate the vector store
npm run embed
# 3. Commit BOTH knowledge/ and data/embeddings.js, then push
#    (Vercel bundles data/embeddings.js — ingestion does not run at deploy time)
```

If the embedding call fails at request time, the API falls back to stuffing
all chunks into the prompt (same behavior as the pre-RAG version).

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