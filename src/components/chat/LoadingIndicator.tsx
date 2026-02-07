
import React from 'react';

const LoadingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-1 p-2 bg-white rounded-2xl rounded-bl-none shadow-sm border border-gray-100 w-fit">
            <div className="w-2 h-2 bg-santaan-teal rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-santaan-teal rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-santaan-teal rounded-full animate-bounce"></div>
            <span className="ml-2 text-xs text-gray-500 font-medium">Santaan is thinking...</span>
        </div>
    );
};

export default LoadingIndicator;
