'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

export default function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get UTM data from localStorage
            const utmData = {
                name: name || 'Newsletter Subscriber',
                email,
                newsletterSubscribed: true,
                tags: 'newsletter',
                leadSource: 'website',
                utmSource: localStorage.getItem('utm_source') || 'direct',
                utmMedium: localStorage.getItem('utm_medium') || 'website',
                utmCampaign: localStorage.getItem('utm_campaign') || 'newsletter',
                utmContent: 'footer_newsletter',
                preferredChannel: 'email'
            };

            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(utmData)
            });

            if (response.ok) {
                setSubscribed(true);
                setEmail('');
                setName('');
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
                    <p className="text-sm font-medium text-santaan-teal">Successfully subscribed!</p>
                    <p className="text-xs text-gray-600 mt-0.5">Check your email for confirmation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-santaan-amber" />
                <h3 className="text-lg font-semibold text-gray-900">Stay Informed</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Get expert fertility tips, success stories, and updates delivered to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white"
                />
                <div className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setError('')}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => setEmail((e.target as HTMLInputElement).value)}
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
                    By subscribing, you agree to receive email updates. Unsubscribe anytime.
                </p>
            </form>
        </div>
    );
}
