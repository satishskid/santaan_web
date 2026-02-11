import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { SYSTEM_INSTRUCTION } from "@/services/chat/prompts";
import { ChatMessage, MessageSender } from "@/types/chat";

interface ChatRequestBody {
    message?: string;
    history?: ChatMessage[];
}

const getGroqClient = () => {
    const apiKey =
        process.env.GROQ_API_KEY ||
        process.env.NEXT_PUBLIC_GROQ_API_KEY ||
        "";

    if (!apiKey) {
        throw new Error("Groq API key missing");
    }

    return new Groq({ apiKey });
};

const buildGroqMessages = (message: string, history: ChatMessage[]): ChatCompletionMessageParam[] => {
    const mapped: ChatCompletionMessageParam[] = history.map((msg) => ({
        role: msg.sender === MessageSender.USER ? "user" : "assistant",
        content: msg.text,
    }));

    mapped.unshift({ role: "system", content: SYSTEM_INSTRUCTION });
    mapped.push({ role: "user", content: message });

    return mapped;
};

const GROQ_MODELS = (
    process.env.GROQ_MODEL?.split(",").map((m) => m.trim()).filter(Boolean) ?? []
).length
    ? process.env.GROQ_MODEL!.split(",").map((m) => m.trim()).filter(Boolean)
    : ["llama-3.1-8b-instant", "llama-3.2-3b-preview"];

const sendToGroq = async (message: string, history: ChatMessage[]) => {
    const groq = getGroqClient();
    const errors: unknown[] = [];

    for (const model of GROQ_MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                messages: buildGroqMessages(message, history),
                model,
                temperature: 0.7,
                max_tokens: 1024,
            });

            return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        } catch (error) {
            errors.push({ model, error });
        }
    }

    throw new Error(`Groq models failed: ${GROQ_MODELS.join(", ")}`);
};

const sendToGemini = async (message: string, history: ChatMessage[]) => {
    const apiKey =
        process.env.GOOGLE_AI_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
        "";

    if (!apiKey) {
        throw new Error("Gemini API key missing");
    }

    const contents = history.map((msg) => ({
        role: msg.sender === MessageSender.USER ? "user" : "model",
        parts: [{ text: msg.text }],
    }));

    contents.push({
        role: "user",
        parts: [{ text: message }],
    });

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }],
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        // Fallback: inline system instruction if system_instruction is unsupported
        if (errorText.includes("system_instruction") || errorText.includes("systemInstruction")) {
            const fallbackResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${message}` }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000,
                        },
                    }),
                }
            );

            if (!fallbackResponse.ok) {
                const fallbackError = await fallbackResponse.text();
                throw new Error(`Gemini API error: ${fallbackResponse.status} ${fallbackError}`);
            }

            const fallbackData = await fallbackResponse.json();
            const fallbackText = fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!fallbackText) {
                throw new Error("Gemini response invalid");
            }

            return fallbackText;
        }

        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini response invalid");
    }

    return text;
};

const getLocalFallbackResponse = (message: string) => {
    const lower = message.toLowerCase();

    if (lower.includes("success rate") || (lower.includes("ivf") && lower.includes("success"))) {
        return [
            "IVF success rates depend on several factors, especially age, egg quality, sperm quality, and embryo quality.",
            "Other important factors include the cause of infertility, uterine health, lifestyle (smoking, alcohol, weight), and the clinic’s lab quality and protocols.",
            "If you share your age range and any known diagnosis, I can give a more tailored, general overview."
        ].join(" ");
    }

    return [
        "I’m currently experiencing high traffic with our AI providers, but I’m still here to help.",
        "Please tell me a bit more about your question so I can share the most relevant general guidance."
    ].join(" ");
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as ChatRequestBody;
        const message = body.message?.trim();
        const history = Array.isArray(body.history) ? body.history : [];

        if (!message) {
            return NextResponse.json({ error: "Message is required." }, { status: 400 });
        }

        try {
            const reply = await sendToGroq(message, history);
            return NextResponse.json({ reply });
        } catch (groqError) {
            try {
                const reply = await sendToGemini(message, history);
                return NextResponse.json({ reply });
            } catch (geminiError) {
                console.error("Chat provider failure", { groqError, geminiError });
                const reply = getLocalFallbackResponse(message);
                return NextResponse.json({ reply });
            }
        }
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
    }
}
