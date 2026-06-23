import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await request.json();
  } catch {
    // CTA tracking must never block call or WhatsApp clicks.
  }

  return NextResponse.json({ success: true });
}
