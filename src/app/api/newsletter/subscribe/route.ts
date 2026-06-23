import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Thank you. The Santaan team has received your subscription request.",
  });
}
