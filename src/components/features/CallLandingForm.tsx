"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRIMARY_CALL_NUMBER } from "@/data/centers";

declare global {
  interface Window {
    submitLead?: (name: string, phone: string) => boolean | Promise<boolean>;
  }
}

export function CallLandingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const userName = name.trim();
    const userPhone = phone.trim();

    if (!userName || !userPhone) {
      setError("Please enter your name and phone number.");
      return;
    }

    if (typeof window.submitLead !== "function") {
      setError("The callback service is not available right now. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await Promise.resolve(window.submitLead(userName, userPhone));

      if (!result) {
        throw new Error("Lead submission failed");
      }

      setIsSuccess(true);
      setName("");
      setPhone("");
    } catch {
      setError("We could not submit your callback request. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-santaan-sage/30 bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-playfair font-bold text-santaan-teal">
          Request Received
        </h2>
        <p className="mt-3 text-center text-gray-600">
          Our voice assistant will try calling you right away. If you miss it, you can also call us directly.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={`tel:${PRIMARY_CALL_NUMBER}`}
            className="inline-flex items-center gap-2 rounded-full bg-santaan-teal px-5 py-3 font-semibold text-white hover:bg-santaan-dark-teal transition-colors"
          >
            <PhoneCall className="h-4 w-4" />
            Call {PRIMARY_CALL_NUMBER}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-santaan-sage/30 bg-white p-8 shadow-xl">
      <h2 className="text-2xl font-playfair font-bold text-santaan-teal">Request a Call</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Share your details and we will trigger a callback through the Santaan Voice Assistant.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="call-name">Name</Label>
          <Input
            id="call-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="call-phone">Phone Number</Label>
          <Input
            id="call-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="98765 43210"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" size="lg" fullWidth className="mt-6" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        By submitting, you are asking Santaan to contact you on this number regarding fertility consultation.
      </p>
    </form>
  );
}
