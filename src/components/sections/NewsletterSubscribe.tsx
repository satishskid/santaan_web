'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { ensureMandatoryUtm, readUtmParams } from '@/lib/utm';

export default function NewsletterSubscribe() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !phone.trim()) {
            setError('Please enter your name and WhatsApp number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const utm = ensureMandatoryUtm(readUtmParams());
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    utm: {
                        ...utm,
                        utm_content: utm.utm_content || 'whatsapp_tips_page',
                    },
                }),
            });

            if (response.ok) {
                setSubscribed(true);
                setName('');
                setPhone('');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to subscribe. Please try again.');
            }
        } catch {
            setError('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="flex items-center gap-3 p-4 bg-santaan-teal/10 rounded-lg border border-santaan-teal/20">
                <CheckCircle className="w-5 h-5 text-santaan-teal flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-santaan-teal">You&apos;re in for WhatsApp tips.</p>
                    <p className="text-xs text-gray-600 mt-0.5">Our team will start the guidance flow on WhatsApp.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-santaan-amber" />
                <h3 className="text-lg font-semibold text-gray-900">Get fertility tips on WhatsApp</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Get short fertility guidance, myth-busting education, and the next useful step shared privately on WhatsApp.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white"
                    required
                />
                <div className="flex gap-2">
                    <Input
                        type="tel"
                        placeholder="WhatsApp number"
                        value={phone}
                        onChange={() => setError('')}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => setPhone((e.target as HTMLInputElement).value)}
                        className="flex-1 bg-white"
                        required
                    />
                    <Button 
                        type="submit"
                        disabled={loading}
                        className="bg-santaan-amber hover:bg-santaan-amber/90 text-white px-4"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}
                <p className="text-xs text-gray-500">
                    We use this only for fertility guidance and follow-up on WhatsApp.
                </p>
            </form>
        </div>
    );
}
