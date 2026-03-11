import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { desc, eq, inArray } from 'drizzle-orm';
import { auth } from '@/auth';
import { admins, users } from '@/db/schema';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth-helper';

const OPERATIONAL_ROLES = [
  'admin',
  'ceo',
  'crm_ops_admin',
  'agency_ops',
  'marketing_manager',
  'performance_marketer',
  'content_writer',
  'social_media_exec',
  'field_exec',
  'ivr_manager',
  'telecaller_manager',
  'telecaller',
  'counselor',
] as const;

const OPERATIONAL_ROLE_SET = new Set<string>(OPERATIONAL_ROLES);

async function ensureAuthorized() {
  const session = await auth();
  return isAuthorizedAdmin(session?.user?.email);
}

export async function GET() {
  try {
    if (!(await ensureAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.role, [...OPERATIONAL_ROLES]))
      .orderBy(desc(users.createdAt));

    const adminRows = await db.select().from(admins);
    const adminEmailSet = new Set(adminRows.map((row) => row.email.trim().toLowerCase()));

    return NextResponse.json({
      members: members.map((member) => ({
        ...member,
        isAdminRegistry: member.role === 'admin' || adminEmailSet.has(member.email.trim().toLowerCase()),
      })),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await ensureAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, role, password } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    if (!role) return NextResponse.json({ error: 'Role required' }, { status: 400 });

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role).trim().toLowerCase();
    const normalizedName = String(name || '').trim() || null;
    const nextPassword = String(password || '').trim();

    if (!OPERATIONAL_ROLE_SET.has(normalizedRole)) {
      return NextResponse.json({ error: 'Invalid operational role' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).get();
    if (!existingUser && !nextPassword) {
      return NextResponse.json({ error: 'Password required for a new team member' }, { status: 400 });
    }

    const updateFields: Partial<typeof users.$inferInsert> = {
      role: normalizedRole,
    };

    if (normalizedName) updateFields.name = normalizedName;
    if (nextPassword) {
      updateFields.password = await bcrypt.hash(nextPassword, 12);
    }

    if (existingUser) {
      await db.update(users).set(updateFields).where(eq(users.email, normalizedEmail));
    } else {
      await db.insert(users).values({
        email: normalizedEmail,
        name: normalizedName,
        role: normalizedRole,
        password: updateFields.password as string,
      });
    }

    const existingAdmin = await db.select().from(admins).where(eq(admins.email, normalizedEmail)).get();
    if (normalizedRole === 'admin') {
      if (!existingAdmin) {
        await db.insert(admins).values({ email: normalizedEmail, role: 'admin' });
      }
    } else if (existingAdmin) {
      await db.delete(admins).where(eq(admins.email, normalizedEmail));
    }

    const savedUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .get();

    return NextResponse.json({
      success: true,
      member: {
        ...savedUser,
        isAdminRegistry: normalizedRole === 'admin',
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to save team member' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await ensureAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();
    await db.delete(admins).where(eq(admins.email, normalizedEmail));
    await db.update(users).set({ role: 'user' }).where(eq(users.email, normalizedEmail));

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to remove team member access' }, { status: 500 });
  }
}
