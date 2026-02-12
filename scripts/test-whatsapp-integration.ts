
import { sendWhatsAppMessage } from '../src/services/whatsapp';

async function main() {
    console.log('Testing WhatsApp Integration...');
    
    const result = await sendWhatsAppMessage({
        phone: '9742100448',
        template: 'santaan_dem',
        params: [] 
    });

    console.log('Result:', result);
}

main().catch(console.error);
