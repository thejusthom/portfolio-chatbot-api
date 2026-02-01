// test-local.js
// Run with: node test-local.js

const API_URL = 'http://localhost:3001/api/chat';

const testQuestions = [
  "What's your tech stack?",
  "Tell me about your IBM experience",
  "Are you available for hire?",
  "What projects have you built?"
];

async function testChat(message) {
  console.log(`\n📤 Question: "${message}"`);
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📥 Response:\n${data.reply}`);
    
    if (data.usage) {
      console.log(`\n📊 Tokens used: ${JSON.stringify(data.usage)}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Portfolio Chatbot API');
  console.log('═'.repeat(50));
  console.log(`🔗 API URL: ${API_URL}`);
  console.log('═'.repeat(50));

  // Test single question
  await testChat(testQuestions[0]);

  // Uncomment to test all questions:
  // for (const question of testQuestions) {
  //   await testChat(question);
  // }

  console.log('\n✅ Test complete!');
}

runTests();