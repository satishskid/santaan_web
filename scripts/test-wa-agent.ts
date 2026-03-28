
import fetch from 'node-fetch';

async function testWhatsAppAgent() {
  const webhookUrl = 'http://localhost:3000/api/whatsapp/webhook';
  
  // Simulated BhashSMS Webhook Payload
  const payload = {
    mobile: '919876543210',
    msg: 'Hi, I am interested in IVF treatment in Bhubaneswar. What is the process and how much does it cost?',
    name: 'Test Patient'
  };

  console.log('--- Testing WhatsApp AI Agent Webhook ---');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('\n--- Webhook Response ---');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Success! The webhook processed the message.');
      console.log('The AI Agent will now:');
      console.log('1. Extract chips (Sentiment: Positive, Intent: IVF Process/Cost)');
      console.log('2. Log the conversation in the database');
      console.log('3. Push the enriched lead to NeoDove');
      console.log('4. Send a clinical-safe reply back via BhashSMS');
    } else {
      console.log('\n❌ Failed. Check if the server is running on http://localhost:3000');
    }
  } catch (error: any) {
    console.error('\n❌ Error connecting to webhook:', error.message);
    console.log('Hint: Ensure your dev server is running with `npm run dev`');
  }
}

testWhatsAppAgent();
