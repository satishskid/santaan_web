import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  try {
    const rows = await db.select().from(contacts).orderBy(desc(contacts.id)).limit(10).all();
    return NextResponse.json({ count: rows.length, rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
