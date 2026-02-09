export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-santaan-cream px-4 py-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-6">
                    Privacy Policy
                </h1>
                <p className="text-gray-700 mb-4">
                    We respect your privacy. Santaan collects only the information needed to provide
                    fertility guidance, consultations, and updates you request.
                </p>
                <ul className="space-y-3 text-gray-700 list-disc pl-5">
                    <li>We never sell your data to third parties.</li>
                    <li>Contact details are used for consultation, follow-ups, or newsletters you opt into.</li>
                    <li>You can request deletion of your data at any time.</li>
                </ul>
                <p className="text-gray-700 mt-6">
                    For questions, email <a href="mailto:info@santaan.in" className="text-santaan-teal font-semibold">info@santaan.in</a>.
                </p>
            </div>
        </main>
    );
}
