
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, MessageSender } from '@/types/chat';
import ChatMessageComponent from './ChatMessage';
import UserInput from './UserInput';
import LoadingIndicator from './LoadingIndicator';
import ConversationStarters from './ConversationStarters';
import { sendMessageWithFallback } from '@/services/chat/chatService';
import { useChatRateLimit } from '@/hooks/useChatRateLimit';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasGreeted, setHasGreeted] = useState(false);

    const { data: session, status } = useSession();
    const { checkRateLimit, status: rateLimitStatus } = useChatRateLimit();

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const addMessage = useCallback((text: string, sender: MessageSender) => {
        setMessages(prev => [
            ...prev,
            { id: `${Date.now()}-${Math.random()}`, text, sender, timestamp: Date.now() },
        ]);
    }, []);

    const handleSendMessage = async (text: string) => {
        // Basic throttling/pre-check
        if (isLoading) return;

        // Check Client-Side Rate Limit (Abuse Prevention)
        if (!checkRateLimit()) {
            const resetMinutes = Math.ceil(((rateLimitStatus.resetTime || 0) - Date.now()) / 60000);
            const limitMsg = `You've reached the message limit for now. Please come back in ${resetMinutes} minutes to continue our chat. Science for Smiles!`;
            addMessage(text, MessageSender.USER); // Show their message
            setTimeout(() => addMessage(limitMsg, MessageSender.BOT), 500); // Respond with limit message
            return;
        }

        addMessage(text, MessageSender.USER);
        setIsLoading(true);
        setError(null);

        // Rate Limiting: Add artificial delay if needed, but here we just process
        try {
            const response = await sendMessageWithFallback(text, messages);
            addMessage(response, MessageSender.BOT);
        } catch (err: any) {
            console.error("Chat Error:", err);

            // Friendly message for users
            const displayError = err.message.includes('DEVELOPER NOTE')
                ? err.message
                : err.message || "I'm currently experiencing high traffic. Please try again in a moment.";

            setError(displayError);

            // Fallback bot message
            addMessage(
                "I apologize, I'm taking a short break due to high traffic as I am serving many patients. Please ask me again in a moment.",
                MessageSender.BOT
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Initial Greeting
    useEffect(() => {
        if (isOpen && !hasGreeted && messages.length === 0) {
            setHasGreeted(true);
            setTimeout(() => {
                const userName = session?.user?.name ? ` ${session.user.name.split(' ')[0]}` : "";
                addMessage(
                    `Namaste${userName}! Welcome to Santaan. I am your AI companion. How can I help you with your fertility journey today?`,
                    MessageSender.BOT
                );
            }, 500);
        }
    }, [isOpen, hasGreeted, messages.length, addMessage, session]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[90vw] sm:w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-santaan-teal text-white p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Santaan Companion</h3>
                                    <p className="text-xs text-white/80">Science for Smiles</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={toggleChat} className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area OR Login Prompt */}
                        {status === 'authenticated' ? (
                            <>
                                <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-4">
                                    {messages.length === 0 && !isLoading && (
                                        <div className="text-center text-gray-400 text-sm mt-8">
                                            <p>Start a conversation...</p>
                                        </div>
                                    )}

                                    {/* Conversation Starters if standard greeting is the only message */}
                                    {messages.length === 1 && messages[0].sender === MessageSender.BOT && (
                                        <ConversationStarters onStarterClick={handleSendMessage} />
                                    )}

                                    {messages.map((msg) => (
                                        <ChatMessageComponent key={msg.id} {...msg} />
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <LoadingIndicator />
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg text-center mx-4">
                                            {error}
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {/* Input Area */}
                                <UserInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                                <div className="w-16 h-16 bg-santaan-teal/10 rounded-full flex items-center justify-center mb-4">
                                    <Lock className="w-8 h-8 text-santaan-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Sign in to Chat</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    To provide you with personalized guidance and save your conversation history, please sign in.
                                </p>
                                <Button
                                    onClick={() => signIn('google')}
                                    className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                    Sign in with Google
                                </Button>
                                <p className="text-[10px] text-gray-400 mt-4">
                                    Your privacy is our priority. We adhere to strict data protection standards.
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-50 px-4 py-1 text-center">
                            <p className="text-[10px] text-gray-400">
                                AI can make mistakes. Please consult a doctor for medical advice.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-santaan-teal to-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 group"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!isOpen && (
                    <span className="font-semibold pr-2 hidden group-hover:block whitespace-nowrap overflow-hidden transition-all duration-300">
                        Chat with Santaan
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
