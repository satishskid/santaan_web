import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { opsTaskUpdates } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  getVisibleProfilesForRole,
  OPS_ROLE_TO_PROFILE,
  OPS_TASK_TEMPLATES,
  getAllowedStatuses,
  getProfileByKey,
} from "@/lib/ops-workboard";

function parseDate(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const safe = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  return safe;
}

function normalizeStatus(value?: string | null) {
  const token = String(value || "")
    .trim()
    .toLowerCase() as "pending" | "in_progress" | "done" | "blocked";
  return getAllowedStatuses().includes(token) ? token : null;
}

function normalizeText(value: unknown, max = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

async function requireOpsAccess() {
  const session = await auth();
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  const normalizedRole = String(sessionRole || "")
    .trim()
    .toLowerCase();
  const ok = await isAuthorizedOpsUser(session?.user?.email, normalizedRole);
  return { ok, session, role: normalizedRole || "admin" };
}

export async function GET(request: NextRequest) {
  try {
    const { ok, role } = await requireOpsAccess();
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = parseDate(searchParams.get("date"));
    if (!date) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    const profileFilter = searchParams.get("profileKey")?.trim();

    const updates = await db
      .select()
      .from(opsTaskUpdates)
      .where(eq(opsTaskUpdates.taskDate, date))
      .orderBy(desc(opsTaskUpdates.updatedAt), desc(opsTaskUpdates.id));

    const updateMap = new Map(
      updates.map((update) => [
        `${update.taskDate}|${update.profileKey}|${update.center || "network"}|${update.taskCode}`,
        update,
      ])
    );

    const visibleProfiles = getVisibleProfilesForRole(role);
    const visibleProfileKeys = new Set(visibleProfiles.map((profile) => profile.key));
    if (profileFilter && !visibleProfileKeys.has(profileFilter)) {
      return NextResponse.json({ error: "Forbidden profile access" }, { status: 403 });
    }

    const profiles = profileFilter
      ? visibleProfiles.filter((profile) => profile.key === profileFilter)
      : visibleProfiles;

    const rows = profiles.flatMap((profile) => {
      const templates = OPS_TASK_TEMPLATES.filter((task) => task.profileKey === profile.key);
      return templates.map((task) => {
        const key = `${date}|${profile.key}|${profile.center}|${task.code}`;
        const update = updateMap.get(key);
        return {
          date,
          profileKey: profile.key,
          profileLabel: profile.label,
          role: profile.role,
          center: profile.center,
          taskCode: task.code,
          slot: task.slot,
          timeLabel: task.timeLabel,
          title: task.title,
          inputTarget: task.inputTarget,
          sla: task.sla,
          ownerHint: task.ownerHint,
          status: update?.status || "pending",
          note: update?.note || "",
          updatedByEmail: update?.updatedByEmail || null,
          updatedByName: update?.updatedByName || null,
          updatedAt: update?.updatedAt || null,
        };
      });
    });

    const profileSummary = profiles.map((profile) => {
      const profileRows = rows.filter((row) => row.profileKey === profile.key);
      const total = profileRows.length;
      const done = profileRows.filter((row) => row.status === "done").length;
      const blocked = profileRows.filter((row) => row.status === "blocked").length;
      const inProgress = profileRows.filter((row) => row.status === "in_progress").length;
      const pending = total - done - blocked - inProgress;
      return {
        profileKey: profile.key,
        profileLabel: profile.label,
        center: profile.center,
        total,
        done,
        inProgress,
        blocked,
        pending,
        completionRate: total > 0 ? (done / total) * 100 : 0,
      };
    });

    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();

    return NextResponse.json({
      date,
      role: role || null,
      defaultProfileKey:
        OPS_ROLE_TO_PROFILE[normalizedRole] || profiles[0]?.key || "ceo_crm_admin",
      profiles,
      tasks: rows,
      summary: profileSummary,
    });
  } catch (error) {
    console.error("Ops workboard GET error:", error);
    return NextResponse.json({ error: "Failed to fetch workboard data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ok, session, role } = await requireOpsAccess();
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const taskDate = parseDate(body?.taskDate);
    const profileKey = normalizeText(body?.profileKey, 80);
    const center = normalizeText(body?.center, 40).toLowerCase() || "network";
    const taskCode = normalizeText(body?.taskCode, 120);
    const status = normalizeStatus(body?.status);
    const note = normalizeText(body?.note, 1000);

    if (!taskDate || !profileKey || !taskCode || !status) {
      return NextResponse.json(
        { error: "taskDate, profileKey, taskCode, and valid status are required" },
        { status: 400 }
      );
    }

    const profile = getProfileByKey(profileKey);
    if (!profile) {
      return NextResponse.json({ error: "Invalid profileKey" }, { status: 400 });
    }
    const visibleProfileKeys = new Set(getVisibleProfilesForRole(role).map((item) => item.key));
    if (!visibleProfileKeys.has(profileKey)) {
      return NextResponse.json({ error: "Forbidden profile update" }, { status: 403 });
    }

    const taskExists = OPS_TASK_TEMPLATES.some((task) => task.profileKey === profileKey && task.code === taskCode);
    if (!taskExists) {
      return NextResponse.json({ error: "Unknown taskCode for profile" }, { status: 400 });
    }

    const userName = session?.user?.name || null;
    const userEmail = session?.user?.email || null;
    const now = new Date().toISOString();

    await db
      .insert(opsTaskUpdates)
      .values({
        taskDate,
        profileKey,
        center,
        taskCode,
        status,
        note: note || null,
        updatedByEmail: userEmail,
        updatedByName: userName,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          opsTaskUpdates.taskDate,
          opsTaskUpdates.profileKey,
          opsTaskUpdates.center,
          opsTaskUpdates.taskCode,
        ],
        set: {
          status,
          note: note || null,
          updatedByEmail: userEmail,
          updatedByName: userName,
          updatedAt: now,
        },
      });

    return NextResponse.json({ success: true, role: role || null });
  } catch (error) {
    console.error("Ops workboard POST error:", error);
    return NextResponse.json({ error: "Failed to update workboard task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ok, role } = await requireOpsAccess();
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskDate = parseDate(searchParams.get("taskDate"));
    const profileKey = searchParams.get("profileKey")?.trim() || "";
    const center = searchParams.get("center")?.trim().toLowerCase() || "network";
    const taskCode = searchParams.get("taskCode")?.trim() || "";

    if (!taskDate || !profileKey || !taskCode) {
      return NextResponse.json({ error: "taskDate, profileKey, taskCode are required" }, { status: 400 });
    }
    const visibleProfileKeys = new Set(getVisibleProfilesForRole(role).map((item) => item.key));
    if (!visibleProfileKeys.has(profileKey)) {
      return NextResponse.json({ error: "Forbidden profile reset" }, { status: 403 });
    }

    await db
      .delete(opsTaskUpdates)
      .where(
        and(
          eq(opsTaskUpdates.taskDate, taskDate),
          eq(opsTaskUpdates.profileKey, profileKey),
          eq(opsTaskUpdates.center, center),
          eq(opsTaskUpdates.taskCode, taskCode)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ops workboard DELETE error:", error);
    return NextResponse.json({ error: "Failed to reset task status" }, { status: 500 });
  }
}
