
import React from 'react';

interface ConversationStartersProps {
    onStarterClick: (prompt: string) => void;
}

const starterPrompts = [
    {
        id: 'explain_ivf',
        text: 'What is IVF and how does it work?',
    },
    {
        id: 'santaan_approach',
        text: "What is Santaan's 'Science for Smiles'?",
    },
    {
        id: 'success_rates',
        text: "What affects IVF success rates?",
    },
    {
        id: 'common_myths',
        text: "Common myths about IVF in India?",
    }
];

const ConversationStarters: React.FC<ConversationStartersProps> = ({ onStarterClick }) => {
    return (
        <div className="mt-4 mb-2 px-2">
            <p className="text-xs font-medium text-gray-500 mb-2 px-1">
                Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                    <button
                        key={prompt.id}
                        onClick={() => onStarterClick(prompt.text)}
                        className="text-left px-3 py-2 bg-white border border-santaan-teal/20 rounded-full hover:bg-santaan-teal/5 transition-colors text-santaan-teal text-xs font-medium whitespace-nowrap"
                    >
                        {prompt.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ConversationStarters;
