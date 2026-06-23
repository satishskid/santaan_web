import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: 'Registration successful',
  });
}
