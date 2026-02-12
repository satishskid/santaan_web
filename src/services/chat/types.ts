import { MessageSender } from '@/types/chat';

export interface ChatCompletionMessageParam {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export function convertChatMessagesToGroqFormat(messages: { sender: MessageSender; text: string }[]): ChatCompletionMessageParam[] {
    return messages.map(msg => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'assistant',
        content: msg.text
    }));
}