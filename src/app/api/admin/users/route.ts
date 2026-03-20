import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { auth } from '@/auth';
import { isAuthorizedLeadership } from '@/lib/auth-helper';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const USERNAME_REGEX = /^[a-z0-9._-]{3,40}$/;
const PIN_REGEX = /^\d{6}$/;

const SUPER_ADMIN_EMAILS = new Set([
  'raghab.panda@santaan.in',
  'satish.rath@santaan.in',
  'digi.social@skids.health',
  'satsh@skids.health',
]);

const LEADERSHIP_ROLES = new Set(['admin', 'ceo', 'crm_ops_admin']);

const ALLOWED_ROLES = new Set([
  'admin',
  'ceo',
  'crm_ops_admin',
  'marketing_manager',
  'agency_ops',
  'performance_marketer',
  'content_manager',
  'field_exec',
  'ivr_manager',
  'telecaller_manager',
  'telecaller',
  'counselor',
  'user',
  'disabled',
]);

function normalizeLoginId(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function validateLoginId(loginId: string): { ok: true } | { ok: false; error: string } {
  if (!loginId) return { ok: false, error: 'Username required' };
  if (loginId.includes('@')) {
    const parsed = z.string().email().safeParse(loginId);
    if (!parsed.success) return { ok: false, error: 'Invalid email' };
    return { ok: true };
  }
  if (!USERNAME_REGEX.test(loginId)) {
    return { ok: false, error: 'Invalid username (use a-z, 0-9, dot, underscore, hyphen; 3-40 chars)' };
  }
  return { ok: true };
}

function normalizeRole(value: unknown): string {
  if (typeof value !== 'string') return 'user';
  return value.trim().toLowerCase();
}

export async function GET() {
  try {
    const session = await auth();
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    if (!await isAuthorizedLeadership(session?.user?.email, sessionRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db.select().from(users);
    const safeUsers = rows
      .map((row) => ({
        id: row.id,
        username: row.email,
        name: row.name ?? '',
        role: row.role ?? 'user',
        createdAt: row.createdAt ?? '',
      }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return NextResponse.json({ users: safeUsers });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    if (!await isAuthorizedLeadership(session?.user?.email, sessionRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const username = normalizeLoginId(body?.username);
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const role = normalizeRole(body?.role);
    const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';

    const loginIdValidation = validateLoginId(username);
    if (!loginIdValidation.ok) return NextResponse.json({ error: loginIdValidation.error }, { status: 400 });
    if (!ALLOWED_ROLES.has(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    if (!PIN_REGEX.test(pin)) return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });

    const existing = await db.select().from(users).where(eq(users.email, username)).get();
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(pin, 12);
    const inserted = await db
      .insert(users)
      .values({
        email: username,
        name: name || null,
        role,
        password: hashedPassword,
      })
      .returning();

    const created = inserted?.[0];
    return NextResponse.json({
      success: true,
      user: created
        ? { id: created.id, username: created.email, name: created.name ?? '', role: created.role ?? 'user', createdAt: created.createdAt ?? '' }
        : null,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    if (!await isAuthorizedLeadership(session?.user?.email, sessionRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const scopeRaw = body?.scope;
    const scope = typeof scopeRaw === 'string' ? scopeRaw.trim().toLowerCase() : '';
    if (scope) {
      if (scope !== 'admins' && scope !== 'staff') {
        return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
      }

      const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';
      if (!PIN_REGEX.test(pin)) {
        return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(pin, 12);
      const allUsers = await db.select().from(users).all();

      const targets = allUsers.filter((user) => {
        const loginId = String(user.email || '').trim().toLowerCase();
        const role = String(user.role || '').trim().toLowerCase();
        const isSuperAdmin = SUPER_ADMIN_EMAILS.has(loginId);
        const isLeadership = LEADERSHIP_ROLES.has(role);
        const isDisabled = role === 'disabled';
        const isAdminGroup = isSuperAdmin || isLeadership;

        if (scope === 'admins') return isAdminGroup;
        return !isDisabled && !isAdminGroup;
      });

      for (const target of targets) {
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, target.id));
      }

      return NextResponse.json({ success: true, updatedCount: targets.length });
    }

    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });

    const existing = await db.select().from(users).where(eq(users.id, id)).get();
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const nextUsernameRaw = body?.username;
    const nextUsername = nextUsernameRaw === undefined ? undefined : normalizeLoginId(nextUsernameRaw);
    if (nextUsername !== undefined) {
      const loginIdValidation = validateLoginId(nextUsername);
      if (!loginIdValidation.ok) return NextResponse.json({ error: loginIdValidation.error }, { status: 400 });
      if (nextUsername !== existing.email) {
        const collision = await db.select().from(users).where(eq(users.email, nextUsername)).get();
        if (collision) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    const nextNameRaw = body?.name;
    const nextName = nextNameRaw === undefined ? undefined : (typeof nextNameRaw === 'string' ? nextNameRaw.trim().slice(0, 80) : '');

    const nextRoleRaw = body?.role;
    const nextRole = nextRoleRaw === undefined ? undefined : normalizeRole(nextRoleRaw);
    if (nextRole !== undefined && !ALLOWED_ROLES.has(nextRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const pinRaw = body?.pin;
    const pin = pinRaw === undefined ? undefined : (typeof pinRaw === 'string' ? pinRaw.trim() : '');
    if (pin !== undefined && pin && !PIN_REGEX.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    const updates: Partial<typeof users.$inferInsert> = {};
    if (nextUsername !== undefined) updates.email = nextUsername;
    if (nextName !== undefined) updates.name = nextName || null;
    if (nextRole !== undefined) updates.role = nextRole;
    if (pin !== undefined && pin) updates.password = await bcrypt.hash(pin, 12);

    await db.update(users).set(updates).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id)).get();

    return NextResponse.json({
      success: true,
      user: updated
        ? { id: updated.id, username: updated.email, name: updated.name ?? '', role: updated.role ?? 'user', createdAt: updated.createdAt ?? '' }
        : null,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
