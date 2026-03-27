import { NextRequest, NextResponse } from 'next/server';
import { getSantaanBlogPosts, type BlogType } from '@/lib/medium';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const typeParam = searchParams.get('type');

    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const type = (
      typeParam === 'blog' || typeParam === 'news' || typeParam === 'doctor' ? typeParam : undefined
    ) as BlogType | undefined;

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
