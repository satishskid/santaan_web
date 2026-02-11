import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcements } from "@/db/schema";
import { eq, desc, and, lte, or, isNull, sql } from "drizzle-orm";

// GET - Fetch announcements (public shows only active, non-expired)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';
        const type = searchParams.get('type'); // Filter by type
        
        const now = new Date().toISOString();
        
        let result;
        if (includeAll) {
            // Admin view - all announcements
            result = await db.select().from(announcements)
                .orderBy(desc(announcements.isPinned), desc(announcements.publishDate));
        } else {
            // Public view - only active, published, non-expired
            const conditions = [
                eq(announcements.isActive, true),
                lte(announcements.publishDate, now),
                or(
                    isNull(announcements.expiryDate),
                    sql`${announcements.expiryDate} > ${now}`
                )
            ];
            
            if (type) {
                conditions.push(eq(announcements.type, type));
            }
            
            result = await db.select().from(announcements)
                .where(and(...conditions))
                .orderBy(desc(announcements.isPinned), desc(announcements.publishDate));
        }
        
        return NextResponse.json({ announcements: result });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

// POST - Create a new announcement
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, type, imageUrl, linkUrl, linkText, isPinned, publishDate, expiryDate } = body;
        
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        
        const result = await db.insert(announcements).values({
            title,
            content: content || null,
            type: type || 'news',
            imageUrl: imageUrl || null,
            linkUrl: linkUrl || null,
            linkText: linkText || null,
            isPinned: isPinned || false,
            isActive: true,
            publishDate: publishDate || new Date().toISOString(),
            expiryDate: expiryDate || null,
        }).returning();
        
        return NextResponse.json({ success: true, announcement: result[0] });
    } catch (error) {
        console.error("Error creating announcement:", error);
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
}

// PUT - Update an announcement
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, content, type, imageUrl, linkUrl, linkText, isPinned, isActive, publishDate, expiryDate } = body;
        
        if (!id) {
            return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
        }
        
        const updateData: Record<string, unknown> = {
            updatedAt: new Date().toISOString(),
        };
        
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (type !== undefined) updateData.type = type;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
        if (linkText !== undefined) updateData.linkText = linkText;
        if (isPinned !== undefined) updateData.isPinned = isPinned;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (publishDate !== undefined) updateData.publishDate = publishDate;
        if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
        
        const result = await db.update(announcements)
            .set(updateData)
            .where(eq(announcements.id, id))
            .returning();
        
        if (result.length === 0) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, announcement: result[0] });
    } catch (error) {
        console.error("Error updating announcement:", error);
        return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
    }
}

// DELETE - Delete an announcement
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
        }
        
        await db.delete(announcements).where(eq(announcements.id, parseInt(id)));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
    }
}
