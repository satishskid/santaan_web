// Test script for Groq AI sentiment analysis integration
const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

const testConversations = [
  {
    contactId: 1,
    conversation: "Patient called and said the treatment cost is too high for them. They mentioned they found a cheaper option elsewhere. Not interested in proceeding with Santaan."
  },
  {
    contactId: 2, 
    conversation: "Very interested patient! They asked lots of questions about the success rates and wanted to schedule a consultation next week. Seemed very positive about our services."
  },
  {
    contactId: 3,
    conversation: "Patient said they need to discuss with their spouse first. Will call back in a few days. Neutral response."
  }
];

async function testSentimentAnalysis() {
  console.log('🚀 Testing Groq AI Sentiment Analysis Integration...\n');
  
  for (const test of testConversations) {
    try {
      console.log(`Testing Contact ${test.contactId}: ${test.conversation.substring(0, 50)}...`);
      
      const prompt = `Analyze this customer conversation and provide:
1. Sentiment (positive/negative/neutral)
2. Loss reason if applicable (price/distance/service/quality/competitor/other)
3. Confidence score (0-100)

Conversation:
${test.conversation}

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "price|distance|service|quality|competitor|other|null",
  "confidence": 85,
  "explanation": "Brief explanation of analysis"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a CRM AI assistant that analyzes customer conversations to determine sentiment and reasons for lead loss.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      let analysis;
      
      try {
        analysis = JSON.parse(responseText);
      } catch {
        analysis = {
          sentiment: 'neutral',
          lossReason: null,
          confidence: 0,
          explanation: 'Could not parse AI response'
        };
      }

      console.log(`✅ Analysis Result:`);
      console.log(`   Sentiment: ${analysis.sentiment || 'unknown'}`);
      console.log(`   Loss Reason: ${analysis.lossReason || 'none'}`);
      console.log(`   Confidence: ${analysis.confidence || 0}%`);
      console.log(`   Explanation: ${analysis.explanation || 'No explanation'}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error analyzing contact ${test.contactId}:`, error.message);
      console.log('');
    }
  }
  
  console.log('✅ Groq AI Sentiment Analysis test completed!');
}

// Run the test
testSentimentAnalysis().catch(console.error);