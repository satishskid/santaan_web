import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { blogPosts } from '@/db/schema';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';

function normalizeRole(role?: string | null) {
    return String(role || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
        const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
        
        const ALLOWED_ROLES = new Set(['ceo', 'admin', 'content_manager', 'marketing_manager', 'agency_ops']);
        const role = sessionRole || 'admin';

        if (!authorized || !ALLOWED_ROLES.has(role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, type } = body;

        if (!title || !content || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueSlug = `${slug}-${Math.floor(Date.now() / 1000).toString(36)}`;

        const htmlContent = content.split('\n').map((p: string) => p.trim() ? `<p>${p}</p>` : '<br/>').join('');
        const plainText = content.substring(0, 180).trim() + (content.length > 180 ? '...' : '');

        await db.insert(blogPosts).values({
            slug: uniqueSlug,
            title: title,
            html: htmlContent,
            excerpt: plainText,
            author: session?.user?.name || 'Santaan Team',
            publishedAt: new Date().toISOString(),
            tags: JSON.stringify([`santaan-${type}`]),
            type: type,
            sourceUrl: `https://www.santaan.in/api/admin/content/${uniqueSlug}`,
            isActive: true,
            readMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)),
        });

        return NextResponse.json({ success: true, slug: uniqueSlug });
    } catch (error) {
        console.error('Error publishing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
