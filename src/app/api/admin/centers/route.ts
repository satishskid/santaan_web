import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - Fetch all centers (public) or all for admin
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('all') === 'true';
        
        let result;
        if (includeInactive) {
            // Admin view - all centers
            result = await db.select().from(centers).orderBy(asc(centers.sortOrder));
        } else {
            // Public view - only active centers
            result = await db.select().from(centers)
                .where(eq(centers.isActive, true))
                .orderBy(asc(centers.sortOrder));
        }
        
        // Parse phones JSON for each center
        const parsedCenters = result.map((center: typeof centers.$inferSelect) => ({
            ...center,
            phones: JSON.parse(center.phones || '[]')
        }));
        
        return NextResponse.json({ centers: parsedCenters });
    } catch (error) {
        console.error("Error fetching centers:", error);
        return NextResponse.json({ error: "Failed to fetch centers" }, { status: 500 });
    }
}

// POST - Create a new center (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { city, title, address, description, email, phones, mapUrl, sortOrder } = body;
        
        if (!city || !title || !address || !email || !phones) {
            return NextResponse.json(
                { error: "City, title, address, email, and phones are required" },
                { status: 400 }
            );
        }
        
        const phonesJson = typeof phones === 'string' ? phones : JSON.stringify(phones);
        
        const result = await db.insert(centers).values({
            city,
            title,
            address,
            description: description || null,
            email,
            phones: phonesJson,
            mapUrl: mapUrl || null,
            sortOrder: sortOrder || 0,
            isActive: true,
        }).returning();
        
        return NextResponse.json({ 
            success: true, 
            center: {
                ...result[0],
                phones: JSON.parse(result[0].phones)
            }
        });
    } catch (error) {
        console.error("Error creating center:", error);
        return NextResponse.json({ error: "Failed to create center" }, { status: 500 });
    }
}

// PUT - Update a center
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, city, title, address, description, email, phones, mapUrl, sortOrder, isActive } = body;
        
        if (!id) {
            return NextResponse.json({ error: "Center ID is required" }, { status: 400 });
        }
        
        const updateData: Record<string, unknown> = {
            updatedAt: new Date().toISOString(),
        };
        
        if (city !== undefined) updateData.city = city;
        if (title !== undefined) updateData.title = title;
        if (address !== undefined) updateData.address = address;
        if (description !== undefined) updateData.description = description;
        if (email !== undefined) updateData.email = email;
        if (phones !== undefined) {
            updateData.phones = typeof phones === 'string' ? phones : JSON.stringify(phones);
        }
        if (mapUrl !== undefined) updateData.mapUrl = mapUrl;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const result = await db.update(centers)
            .set(updateData)
            .where(eq(centers.id, id))
            .returning();
        
        if (result.length === 0) {
            return NextResponse.json({ error: "Center not found" }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            center: {
                ...result[0],
                phones: JSON.parse(result[0].phones)
            }
        });
    } catch (error) {
        console.error("Error updating center:", error);
        return NextResponse.json({ error: "Failed to update center" }, { status: 500 });
    }
}

// DELETE - Delete a center
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "Center ID is required" }, { status: 400 });
        }
        
        await db.delete(centers).where(eq(centers.id, parseInt(id)));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting center:", error);
        return NextResponse.json({ error: "Failed to delete center" }, { status: 500 });
    }
}
