"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface AIInsightProps {
  contactId: number;
  conversationText?: string;
  className?: string;
}

interface AIAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  lossReason: string | null;
  confidence: number;
  explanation: string;
}

export function AIInsightWidget({ contactId, conversationText, className = "" }: AIInsightProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/contacts/${contactId}/sentiment`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setAnalysis({
          sentiment: result.data.sentiment || 'neutral',
          lossReason: result.data.lossReason || null,
          confidence: 0,
          explanation: ''
        });
      } else {
        setError('No analysis data available');
      }
    } catch (err) {
      setError('Failed to load AI analysis');
      console.error('AI analysis fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeConversation = async () => {
    if (!conversationText) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/leads/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId,
          notes: conversationText
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError('Analysis failed');
      }
    } catch (err) {
      setError('Failed to analyze conversation');
      console.error('AI analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchAIAnalysis();
    }
  }, [contactId]);

  const getSentimentIcon = () => {
    switch (analysis?.sentiment) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'negative':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
    }
  };

  const getSentimentColor = () => {
    switch (analysis?.sentiment) {
      case 'positive':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'negative':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-gray-400 animate-pulse" />
          <span className="text-sm text-gray-500">Analyzing with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-gray-600">{error}</span>
        </div>
        {conversationText && (
          <button
            onClick={analyzeConversation}
            className="mt-2 text-xs text-santaan-teal hover:text-santaan-teal/80 font-medium"
          >
            Retry Analysis
          </button>
        )}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">No AI insights available</span>
          </div>
          {conversationText && (
            <button
              onClick={analyzeConversation}
              className="text-xs text-santaan-teal hover:text-santaan-teal/80 font-medium"
            >
              Analyze Now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-santaan-teal" />
          <span className="text-sm font-semibold text-gray-900">AI Insights</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor()}`}>
          <div className="flex items-center gap-1">
            {getSentimentIcon()}
            <span className="capitalize">{analysis.sentiment}</span>
          </div>
        </div>
      </div>
      
      {analysis.lossReason && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Loss Reason</p>
          <p className="text-sm text-gray-800">{analysis.lossReason}</p>
        </div>
      )}
      
      {analysis.explanation && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Analysis</p>
          <p className="text-sm text-gray-700">{analysis.explanation}</p>
        </div>
      )}
      
      {analysis.confidence > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-santaan-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysis.confidence}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{analysis.confidence}% confidence</span>
        </div>
      )}
      
      {conversationText && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={analyzeConversation}
            className="text-xs text-santaan-teal hover:text-santaan-teal/80 font-medium"
          >
            Re-analyze Conversation
          </button>
        </div>
      )}
    </div>
  );
}