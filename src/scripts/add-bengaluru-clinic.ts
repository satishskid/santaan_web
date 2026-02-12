import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface CenterRow {
    city: string;
    title: string;
    address: string;
}

async function addBengaluruClinic() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials");
    }

    console.log("🚀 Connecting to Production Turso DB...");
    const client = createClient({ url, authToken });
    const db = drizzle(client);

    // Check if clinic already exists
    const existing = await db.select().from(centers).where(eq(centers.city, "Bengaluru")).limit(1);
    if (existing.length > 0) {
        console.log("⚠️  Bengaluru clinic already exists, skipping...");
        return;
    }

    await db.insert(centers).values({
        city: "Bengaluru",
        title: "Santaan Brookefield",
        address: "Brookefield, Bengaluru, Karnataka",
        phone: "+91 9337326896",
        email: "care@santaan.in",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
        description: "Advanced fertility care in Bengaluru's tech hub",
        services: ["IVF", "IUI", "Fertility Assessment", "Semen Analysis"],
        coordinates: { lat: 12.9716, lng: 77.5946 },
        sortOrder: 2
    });
    console.log('✅ Bengaluru Brookefield clinic added!');
    
    const result = await db.select().from(centers).orderBy(centers.sortOrder);
    console.log('\n📍 All Centers:');
    result.forEach((r: CenterRow, i: number) => console.log(`  ${i+1}. ${r.city} - ${r.title}`));
}

addBengaluruClinic();