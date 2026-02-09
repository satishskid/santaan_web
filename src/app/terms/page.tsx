export default function TermsPage() {
    return (
        <main className="min-h-screen bg-santaan-cream px-4 py-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-6">
                    Terms of Service
                </h1>
                <p className="text-gray-700 mb-4">
                    The Santaan website provides educational information and tools to support your
                    fertility journey. It is not a substitute for medical diagnosis or treatment.
                </p>
                <ul className="space-y-3 text-gray-700 list-disc pl-5">
                    <li>Use the Santaan Companion and Signal as guidance, not medical advice.</li>
                    <li>Consult a specialist for personalized care.</li>
                    <li>We may update these terms to improve services and compliance.</li>
                </ul>
                <p className="text-gray-700 mt-6">
                    For questions, email <a href="mailto:info@santaan.in" className="text-santaan-teal font-semibold">info@santaan.in</a>.
                </p>
            </div>
        </main>
    );
}
