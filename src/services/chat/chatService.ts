
import { ChatMessage } from '@/types/chat';

export const sendMessageWithFallback = async (
    currentUserMessage: string,
    history: ChatMessage[]
): Promise<string> => {
    try {
        // First check if chatbot is enabled
        const statusResponse = await fetch('/api/admin/chatbot');
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (!statusData.enabled) {
                throw new Error("I'm currently offline for maintenance. Our team is working to bring me back online soon. Please try again later or contact our support team directly.");
            }
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: currentUserMessage,
                history,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Chat API error:', response.status, errorText);

            if (response.status === 429) {
                throw new Error('I am currently receiving too many messages. Please wait a moment and try again.');
            }

            throw new Error("I'm currently experiencing technical difficulties. Our IT team has been notified. Please try again in a few minutes or contact support.");
        }

        const data = await response.json();

        if (!data?.reply) {
            throw new Error('I did not get a valid response. Please try asking differently.');
        }

        return data.reply as string;
    } catch (error: any) {
        console.error('Chat API failure:', error);
        throw error;
    }
};
