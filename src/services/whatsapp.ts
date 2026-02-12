const BHASH_API_URL = 'http://bhashsms.com/api/sendmsg.php';
const DEFAULT_USER = 'Santaan_01';
const DEFAULT_PASS = '123456';
const DEFAULT_SENDER = 'BUZWAP';

interface WhatsAppMessage {
    phone: string;      // Mobile Number without 91
    template: string;   // Template Name
    params?: string[];  // Optional parameters for the template
    imageUrl?: string;  // Optional image URL
}

/**
 * Sends a WhatsApp message using the BhashSMS API
 */
export async function sendWhatsAppMessage(data: WhatsAppMessage) {
    const user = process.env.BHASH_USER || DEFAULT_USER;
    const pass = process.env.BHASH_PASS || DEFAULT_PASS;
    const sender = process.env.BHASH_SENDER || DEFAULT_SENDER;

    if (!pass) {
        console.warn('BHASH_PASS environment variable is not set. Skipping WhatsApp message.');
        return { success: false, error: 'Configuration missing' };
    }
    
    // ... rest of the function ...


    // Sanitize phone number: remove non-digits, remove leading 91 if length > 10
    let cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.substring(2);
    }

    const payload: Record<string, string> = {
        user,
        pass,
        sender,
        phone: cleanPhone,
        text: data.template,
        priority: 'wa',
        stype: 'normal',
    };

    if (data.params && data.params.length > 0) {
        payload['Params'] = data.params.join(',');
    }

    if (data.imageUrl) {
        payload['htype'] = 'image';
        payload['url'] = data.imageUrl;
    }

    // Convert to URL parameters
    const queryParams = new URLSearchParams(payload).toString();
    const fullUrl = `${BHASH_API_URL}?${queryParams}`;

    try {
        console.log(`Sending WhatsApp to ${cleanPhone} with template ${data.template}`);
        const response = await fetch(fullUrl);
        const result = await response.text();
        
        // BhashSMS often returns plain text like "S.No.12345" or error codes
        console.log('BhashSMS Response:', result);
        
        return { success: true, result };
    } catch (error) {
        console.error('BhashSMS Error:', error);
        return { success: false, error: String(error) };
    }
}
