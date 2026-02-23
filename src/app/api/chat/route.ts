import { NextResponse } from "next/server";
import { generateCompanionReply } from "@/lib/companion";
import { ChatMessage, MessageSender } from "@/types/chat";

interface ChatRequestBody {
  message?: string;
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const mappedHistory = history.map((msg) => ({
      role: msg.sender === MessageSender.USER ? ("user" as const) : ("assistant" as const),
      text: msg.text,
    }));

    const reply = await generateCompanionReply({
      message,
      history: mappedHistory,
      channel: "web",
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}

