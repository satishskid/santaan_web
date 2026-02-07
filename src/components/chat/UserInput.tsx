
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface UserInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading }) => {
    const [inputText, setInputText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputText.trim() && !isLoading) {
            onSendMessage(inputText.trim());
            setInputText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputText]);

    return (
        <form onSubmit={handleSubmit} className="flex items-end p-3 gap-2 bg-white border-t border-gray-100">
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Available free on this website..."
                className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-santaan-teal/20 focus:border-santaan-teal outline-none transition-all resize-none min-h-[44px] max-h-[120px] text-sm"
                disabled={isLoading}
                rows={1}
            />
            <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-3 bg-santaan-teal text-white rounded-xl hover:bg-santaan-dark-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm mb-[1px]"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};

export default UserInput;
