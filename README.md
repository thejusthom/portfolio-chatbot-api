# Portfolio Chatbot API

RAG-powered AI chatbot using Google Gemini for Thejus Thomson's portfolio website.

**🎉 FREE with Google One AI Premium or Gemini API free tier!**

## Quick Start

### 1. Get Gemini API Key (FREE)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key

**Free tier limits:** 15 requests/minute, 1 million tokens/month — plenty for a portfolio!

### 2. Deploy Backend to Vercel

```bash
# Clone or copy the portfolio-chatbot-api folder
cd portfolio-chatbot-api

# Install dependencies
npm install

# Login to Vercel (if not already)
npx vercel login

# Deploy
npx vercel --prod
```

### 3. Set Environment Variable on Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
3. Redeploy for changes to take effect

### 4. Update Frontend

After deploying, you'll get a URL like `https://portfolio-chatbot-api-xxx.vercel.app`

**Option A: Environment Variable (Recommended)**

Create `.env` in your portfolio root:
```
REACT_APP_CHAT_API_URL=https://your-vercel-app.vercel.app/api/chat
```

**Option B: Direct Update**

Edit `ChatWidget.js` line 8:
```javascript
const API_URL = 'https://your-vercel-app.vercel.app/api/chat';
```

### 5. Add Files to Portfolio

Copy to your portfolio project:
- `ChatWidget.js` → `src/components/`
- `ChatWidget.css` → `src/styles/`
- Update `App.js` with the import and component

### 6. Deploy Portfolio

```bash
git add .
git commit -m "Add AI chatbot"
git push
```

Netlify will auto-deploy.

---

## File Structure

```
portfolio-chatbot-api/
├── api/
│   └── chat.js         # Serverless function
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

## API Usage

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "message": "What's your tech stack?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello!" }
  ]
}
```

**Response:**
```json
{
  "reply": "I specialize in Java and Spring Boot for backend...",
  "usage": { "promptTokenCount": 150, "candidatesTokenCount": 50 }
}
```

## Cost

**FREE!** 🎉

Gemini API free tier includes:
- 15 requests per minute
- 1 million tokens per month
- No credit card required

If you have Google One AI Premium, you get even higher limits.

## Customization

### Update Your Info

Facts live in `knowledge/*.md` (experience, projects, skills, education, personal, contact).
After editing them, regenerate the vector store and commit both:

```bash
npm run embed
git add knowledge data/embeddings.js
```

Persona, scope rules, and the keyword pre-filter live in `config.js`.
See `Local-dev.MD` for how the RAG pipeline works.

### Change Model

In `api/chat.js`, modify:
```javascript
model: 'gemini-1.5-flash',  // Fast & free (recommended)
// model: 'gemini-1.5-pro',   // Smarter, still free tier available
```

## Troubleshooting

**CORS errors?**
- Make sure the API is deployed and URL is correct
- Check Vercel function logs

**No response?**
- Verify `GEMINI_API_KEY` is set in Vercel
- Check if you've hit rate limits (15 req/min)

**Slow responses?**
- Normal for first request (cold start)
- Subsequent requests should be faster

---

Built with ❤️ by Thejus Thomson