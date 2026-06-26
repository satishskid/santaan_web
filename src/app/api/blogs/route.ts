import { NextRequest, NextResponse } from 'next/server';
import { getSantaanBlogPosts, type BlogType } from '@/lib/medium';

export const dynamic = 'force-dynamic';

function resolveBlogType(type: string | null): BlogType | undefined {
  if (type === 'blog' || type === 'patient') return 'blog';
  if (type === 'doctor' || type === 'clinical') return 'doctor';
  if (type === 'news' || type === 'announcement' || type === 'updates') return 'news';
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const typeParam = searchParams.get('type');

    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const type = resolveBlogType(typeParam);

    const posts = await getSantaanBlogPosts({
      limit: Number.isFinite(limit) ? limit : undefined,
      type,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Failed to fetch Santaan blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
