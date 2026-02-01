// list-models.js
// Run with: node list-models.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('📋 Fetching available Gemini models...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Available Models:');
    console.log('═'.repeat(60));
    
    data.models.forEach(model => {
      console.log(`\n📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description?.substring(0, 80)}...`);
      console.log(`   Input Limit: ${model.inputTokenLimit} tokens`);
      console.log(`   Output Limit: ${model.outputTokenLimit} tokens`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log(`\n✅ Total: ${data.models.length} models available`);
    
    // Show recommended models
    console.log('\n💡 Recommended for chatbot:');
    console.log('   - gemini-1.5-flash (fast, free tier)');
    console.log('   - gemini-1.5-pro (smarter, free tier)');
    console.log('   - gemini-2.0-flash (latest, if available)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();