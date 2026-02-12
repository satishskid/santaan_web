"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

interface AtHomeRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AtHomeRegistrationModal({ isOpen, onClose }: AtHomeRegistrationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        location: "",
        concerns: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Get UTM params
            const utm = {
                utm_source: localStorage.getItem('utm_source'),
                utm_medium: localStorage.getItem('utm_medium'),
                utm_campaign: localStorage.getItem('utm_campaign'),
            };

            const res = await fetch("/api/at-home/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, utm }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFormData({ name: "", phone: "", email: "", location: "", concerns: "" });
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white text-gray-900 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair text-santaan-teal text-center">
                        {isSuccess ? "Request Received!" : "Book At-Home Testing"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        {isSuccess 
                            ? "Our executive will call you shortly to schedule your appointment."
                            : "Fill in your details for a private and convenient fertility assessment."}
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="py-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-800 font-medium">We&apos;ll be in touch soon!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input 
                                id="name" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Your Name"
                                className="border-gray-300 focus:border-santaan-teal focus:ring-santaan-teal"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                            <Input 
                                id="phone" 
                                required 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="98765 43210"
                                className="border-gray-300 focus:border-santaan-teal focus:ring-santaan-teal"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">City / Location</Label>
                            <Input 
                                id="location" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="e.g. Bhubaneswar"
                                className="border-gray-300 focus:border-santaan-teal focus:ring-santaan-teal"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="your@email.com"
                                className="border-gray-300 focus:border-santaan-teal focus:ring-santaan-teal"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-santaan-teal hover:bg-santaan-teal/90 text-white font-medium py-6 rounded-lg text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Request Call Back"
                            )}
                        </Button>
                        
                        <p className="text-xs text-center text-gray-500 mt-2">
                            100% Private & Confidential. We never share your data.
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
