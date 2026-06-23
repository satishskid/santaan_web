import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Request registered successfully",
  });
}
