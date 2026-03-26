import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

export interface NoteAnalysis {
  sentiment: "Positive" | "Neutral" | "Negative";
  reason: string;
  tags: string[];
}

const SYSTEM_PROMPT = `
You are an expert CRM data analyst for Santaan Fertility Clinic. 
Your job is to read notes written by telecallers after speaking with patients and extract structured insights for the marketing team.

Instructions:
1. Identify the 'sentiment' of the interaction: Positive, Neutral, or Negative.
2. Identify the primary 'reason' for the current state (e.g., "Price", "Distance", "Husband hesitant", "Wants natural try", "Ready to visit"). Keep this under 4 words.
3. Generate 1-3 short tags (e.g., "price_objection", "competitor_mention", "high_intent").

Return ONLY a valid JSON object with the keys: 'sentiment', 'reason', 'tags'. Do not include markdown formatting like \`\`\`json.
`;

export async function analyzeTelecallerNote(note: string): Promise<NoteAnalysis | null> {
  if (!note || note.trim().length < 5) return null;
  if (!GROQ_API_KEY) {
    console.warn("Groq API key missing, skipping note analysis.");
    return null;
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Note: "${note}"` }
      ],
      model: "llama-3.1-8b-instant", // Extremely fast and cheap
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      sentiment: parsed.sentiment || "Neutral",
      reason: parsed.reason || "Unknown",
      tags: parsed.tags || []
    };
  } catch (error) {
    console.error("Failed to analyze telecaller note via Groq:", error);
    return null;
  }
}
