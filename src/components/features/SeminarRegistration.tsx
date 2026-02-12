
"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { readUtmParams } from '@/lib/utm';

interface SeminarRegistrationProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    signal: 'Green' | 'Yellow' | 'Red';
    initialData?: {
        name?: string;
        email?: string;
    };
}

export function SeminarRegistration({ isOpen, onClose, score, signal, initialData }: SeminarRegistrationProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: '',
        question: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/seminar/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    question: formData.question,
                    score,
                    signal,
                    utm: readUtmParams()
                }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            setStep('success');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Register for Dr. Satish&apos;s Seminar</DialogTitle>
                            <DialogDescription>
                                Join the upcoming session to discuss your score of {score}.
                                Your privacy is our priority.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone (WhatsApp preferred)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91..."
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="question">Top Concern / Question (Optional)</Label>
                                <Input
                                    id="question"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="e.g., Low AMH, IVF Failure..."
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600">
                                    {isSubmitting ? 'Reserving...' : 'Reserve My Free Spot'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Spot Reserved!</h3>
                        <p className="text-gray-500 mb-6">
                            We have sent a confirmation to <b>{formData.email}</b> with the joining link.
                        </p>
                        <Button onClick={onClose} className="w-full">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
