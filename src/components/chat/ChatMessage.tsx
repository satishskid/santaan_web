
import React from 'react';
import { ChatMessage, MessageSender } from '@/types/chat';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

type ChatMessageProps = ChatMessage;

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ text, sender, timestamp }) => {
    const isUser = sender === MessageSender.USER;
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full bg-santaan-teal/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-santaan-teal" />
                    </div>
                </div>
            )}
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${isUser
                        ? 'bg-santaan-teal text-white rounded-br-none'
                        : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                    }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                <p className={`text-[10px] mt-1 ${isUser ? 'text-teal-200 text-right' : 'text-gray-400 text-left'}`}>
                    {time}
                </p>
            </div>
            {isUser && (
                <div className="flex-shrink-0 ml-2">
                    <div className="w-8 h-8 rounded-full bg-santaan-sage/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-santaan-sage" />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ChatMessageComponent;
