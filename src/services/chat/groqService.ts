
import Groq from "groq-sdk";
import { ChatMessage, MessageSender } from '@/types/chat';
import { SYSTEM_INSTRUCTION } from './prompts';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export const sendMessageToGroq = async (
    currentUserMessage: string,
    history: ChatMessage[]
): Promise<string> => {
    if (!GROQ_API_KEY) {
        console.warn("Groq API key not found. Fallback unavailable.");
        throw new Error("Groq API key missing.");
    }

    const groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true // Enabled for client-side usage as per user preference
    });

    const messages = history.map(msg => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'assistant',
        content: msg.text
    }));

    // Add system instruction as first message for Groq/Llama
    messages.unshift({ role: 'system', content: SYSTEM_INSTRUCTION });

    messages.push({
        role: 'user',
        content: currentUserMessage
    });

    try {
        const completion = await groq.chat.completions.create({
            messages: messages as any[], // Typing mismatch workaround for now
            model: "llama3-70b-8192", // High performance, good free tier limits
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw error;
    }
};
