"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Send, AlertCircle, FileText } from 'lucide-react';

export default function ContentPublisher() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'news' | 'blog' | 'doctor'>('news');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        if (!title.trim() || !content.trim()) {
            setMessage({ type: 'error', text: "Please provide both a title and content." });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, type })
            });

            if (!response.ok) throw new Error("Failed to publish");

            setMessage({ type: 'success', text: "Content published successfully! It is now live on the website." });
            setTitle('');
            setContent('');
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Failed to publish content. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-playfair flex items-center gap-2">
                    <Send className="w-6 h-6 text-santaan-teal" />
                    Publish Content
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Instantly publish announcements, clinical insights, or news directly to the website. No Medium required.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-4 px-6 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-800">Draft New Post</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Break the Silence on Endometriosis" className="w-full rounded-lg border-gray-200 shadow-sm focus:border-santaan-teal focus:ring-santaan-teal text-base py-2.5 px-3 border" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full rounded-lg border-gray-200 shadow-sm focus:border-santaan-teal focus:ring-santaan-teal text-base py-2.5 px-3 border bg-white">
                                <option value="news">News & Announcement</option>
                                <option value="blog">Clinical Insight (Blog)</option>
                                <option value="doctor">Doctor Update</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Content</span>
                            <span className="text-xs text-gray-400 font-normal">Use simple paragraphs</span>
                        </label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement or paste your text here..." className="w-full rounded-lg border-gray-200 shadow-sm focus:border-santaan-teal focus:ring-santaan-teal text-base p-4 min-h-[300px] border resize-y" required />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                Clicking publish will make this instantly visible on santaan.in
                            </div>
                            {message && (
                                <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="bg-santaan-teal hover:bg-santaan-dark-teal text-white min-w-[120px]">
                            {isSubmitting ? 'Publishing...' : 'Publish Live'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}