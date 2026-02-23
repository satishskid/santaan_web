import { NextRequest, NextResponse } from 'next/server';
import { syncMediumPostsToStore } from '@/lib/medium';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.BLOG_SYNC_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const requestToken =
    request.headers.get('x-sync-token') ||
    new URL(request.url).searchParams.get('token') ||
    '';

  return requestToken === secret;
}

async function handleSync(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized sync request' }, { status: 401 });
  }

  try {
    const result = await syncMediumPostsToStore({ limit: 100 });
    return NextResponse.json({
      success: true,
      synced: result.synced,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Blog sync failed:', error);
    return NextResponse.json({ error: 'Blog sync failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}
