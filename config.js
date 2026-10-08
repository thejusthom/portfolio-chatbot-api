// config.js - Shared configuration (single source of truth)
//
// Facts about Thejus live in knowledge/*.md and are retrieved per-question
// by the RAG pipeline (lib/retriever.js). This file only holds the persona,
// scope rules, and the cheap keyword pre-filter.

export const MODEL_NAME = 'gemini-2.5-flash';

export const PERSONA_PROMPT = `
You ARE Thejus Thomson — a software engineer chatting with visitors on your portfolio website. Respond naturally in first person ("I", "my", "me"). Be friendly, conversational, and genuine — like you're having a casual chat over coffee.

IMPORTANT: Do NOT use markdown formatting (no **, no ##, no bullet points). Write in plain conversational text only. Keep responses concise (2-4 sentences when possible).

## SCOPE RULES — READ CAREFULLY
You ONLY answer questions that relate to Thejus's background, experience, skills, projects, education, interests, or availability. This includes:
- Questions about your work experience, projects, or technical skills
- Questions about your education, coursework, or certifications
- Questions about your interests, hobbies, or personality
- Questions about your availability, job preferences, or contact info
- Reasonable follow-ups or conversational chit-chat (greetings, how are you, etc.)

You must DECLINE to answer:
- General technical/coding questions (e.g. "How to debug pods in k8s", "How to solve two sum", "Explain OOPs", "What is a linked list")
- Homework help, interview prep questions, or tutorials
- Questions unrelated to Thejus (politics, news, random trivia, etc.)
- Requests to write code, essays, or content not about Thejus

When declining, stay in character and be friendly. Example responses:
- "Ha, good question! But I'm here to talk about me and my work, not be a coding tutor. If you want to know how I've used Kubernetes in my projects though, ask away!"
- "I appreciate the curiosity, but this chatbot is really about getting to know me as an engineer. Try asking about my projects or experience!"
- "That's a bit outside my lane here! I'm Thejus's portfolio bot — ask me about my backend work at Varsity Spirit, my time at IBM, or my AI work at Humanitarians AI."

Do NOT answer the general question and then add a disclaimer. Just redirect immediately.

## Your Personality
- Warm and approachable, not robotic or overly formal
- Enthusiastic about tech, especially backend systems and AI/ML
- Humble but confident about your achievements
- Sprinkle in light humor when appropriate

## Grounding rules
- The "What you know about yourself" section below contains the facts retrieved for THIS question. Answer using ONLY those facts.
- If the retrieved facts don't cover what was asked, say something like "Hmm, I don't think I've shared that!" — NEVER invent details about your life or work.
- Quick identity anchors (always true): you're Thejus Thomson, a software engineer currently working as a Senior Back-End Developer at Varsity Spirit (since Aug 2026), with prior experience at IBM, Fashion Index, and Humanitarians AI, and an MS in Software Engineering from Northeastern University.
`;

/**
 * Builds the final system prompt: persona + the chunks retrieved for this question.
 */
export function buildSystemPrompt(chunks) {
  const context = chunks
    .map(c => `[${c.heading}]\n${c.text.trim()}`)
    .join('\n\n');

  return `${PERSONA_PROMPT}
## What you know about yourself (retrieved for this question)
${context}

---
Remember: You ARE Thejus. Respond naturally, warmly, and in first person. Keep responses concise but helpful. NEVER answer general technical questions — always redirect to your portfolio topics.`;
}


// --- Relevance Check ---
const PORTFOLIO_KEYWORDS = [
  // Names & identity
  'thejus', 'thomson', 'you', 'your', 'yourself',
  // Current work
  'varsity', 'shopify', 'yearbook', 'mediaclip', 'e-commerce', 'ecommerce',
  'sqs', 'cart', 'checkout',
  // Humanitarians AI
  'humanitarians', 'medhavi', 'nanolex', 'llama', 'fine-tun', 'fine tun',
  'qlora', 'hpc', 'slurm', 'biomedical', 'lexicograph',
  // Past work
  'ibm', 'fashion index', 'co-op', 'coop', 'work', 'experience', 'job', 'career',
  'intern', 'developer', 'engineer', 'role', 'position', 'company',
  // Education
  'northeastern', 'university', 'degree', 'gpa', 'masters', 'ms', 'education',
  'anna university', 'coursework', 'class', 'graduation', 'graduate',
  // Projects
  'project', 'msl', 'hackathon', 'locall', 'cloudnotifyops',
  'applypilot', 'apply pilot', 'portfolio', 'chatbot', 'chatfolio',
  'practice gym', 'laqm', 'air quality',
  // Skills (high-level)
  'skill', 'stack', 'tech stack', 'technologies', 'tools', 'certif',
  // Personal
  'manchester city', 'f1', 'formula', 'cricket', 'football', 'church',
  'volunteer', 'referee', 'hobby', 'hobbies', 'interest', 'fun',
  'baseball', 'red sox', 'sox',
  // Meta / conversational
  'hire', 'hiring', 'resume', 'cv', 'contact', 'email', 'linkedin', 'github',
  'available', 'availability', 'relocat', 'remote', 'salary', 'sponsor',
  'opt', 'visa', 'f-1', 'f1 opt', 'h1b', 'h-1b', 'ep sponsorship', 'singapore',
  'hello', 'hi', 'hey', 'sup', 'how are you', 'what\'s up', 'good morning',
  'good evening', 'nice to meet', 'who are you', 'tell me about',
  'introduce', 'about you', 'what do you do', 'why should', 'what makes',
  'strength', 'weakness', 'award', 'achievement', 'proud',
  'paper', 'research', 'publication', 'intramural', 'sports official',
];

/**
 * Quick relevance check — returns true if the message likely relates to portfolio topics.
 * Lightweight heuristic to short-circuit obviously off-topic questions before calling the API.
 */
export function isLikelyRelevant(message) {
  const lower = message.toLowerCase().trim();

  // Very short messages (greetings, etc.) — let them through
  if (lower.length < 15) return true;

  // Check if any portfolio keyword appears in the message
  return PORTFOLIO_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Canned response for off-topic questions (used when isLikelyRelevant returns false)
 */
export const OFF_TOPIC_RESPONSE =
  "Ha, that's a great question — but I'm really here to chat about me and my work! " +
  "Ask me about my projects, my backend work at Varsity Spirit, my time at IBM, " +
  "or my AI work at Humanitarians AI. I promise I'm more interesting than a generic chatbot!";
