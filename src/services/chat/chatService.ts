
import { ChatMessage, MessageSender } from '@/types/chat';
import { sendMessageToGroq } from './groqService';

import { SYSTEM_INSTRUCTION } from './prompts';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

export const sendMessageToGemini = async (
    currentUserMessage: string,
    history: ChatMessage[]
): Promise<string> => {
    if (!GEMINI_API_KEY) {
        if (process.env.NODE_ENV === 'development') {
            throw new Error('DEVELOPER NOTE: Gemini API key not configured. Add NEXT_PUBLIC_GOOGLE_AI_API_KEY to .env.local');
        }
        // Production: Don't show technical error
        throw new Error('Our AI Companion is currently offline. Please try again later.');
    }

    const messages = history.map(msg => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    messages.push({
        role: 'user',
        parts: [{ text: currentUserMessage }]
    });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: messages,
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            }),
        });

        if (!response.ok) {
            // Handle Rate Limits (429) specifically
            if (response.status === 429) {
                throw new Error('I am currently receiving too many messages. Please wait a moment and try again.');
            }
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            throw new Error(`Experiencing high traffic. Please try again briefly.`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('I did not get a valid response. Please try asking differently.');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

export const sendMessageWithFallback = async (
    currentUserMessage: string,
    history: ChatMessage[]
): Promise<string> => {
    // 1. Try Gemini First
    try {
        return await sendMessageToGemini(currentUserMessage, history);
    } catch (geminiError: any) {
        console.warn("Gemini failed, attempting fallback to Groq...", geminiError);

        // 2. Fallback to Groq
        try {
            return await sendMessageToGroq(currentUserMessage, history);
        } catch (groqError: any) {
            console.error("All AI providers failed.", groqError);

            // 3. Final Graceful Fallback (if both fail)
            // If it's a rate limit issue, show specific message
            if (geminiError.message?.includes('high traffic') || groqError.message?.includes('Rate limit')) {
                throw new Error("I'm currently experiencing very high traffic. Please try again in a few minutes.");
            }

            throw new Error("I'm having trouble connecting to my knowledge base right now. Please try again later.");
        }
    }
};
