import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opsTaskUpdates } from "@/db/schema";
import { OPS_PROFILE_LIST, OPS_TASK_TEMPLATES } from "@/lib/ops-workboard";
import { postZohoCliqMessage, readZohoCliqConfig } from "@/lib/zoho-cliq";

export const runtime = "nodejs";

function isVercelCron(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  if (cronHeader) return true;
  const scheduledHeader = req.headers.get("x-vercel-scheduled");
  if (scheduledHeader) return true;
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  return userAgent.includes("vercel-cron");
}

function isAuthorized(req: NextRequest) {
  if (isVercelCron(req)) return true;
  const secret = String(process.env.ZOHO_CLIQ_CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = req.headers.get("x-cron-secret") || req.headers.get("authorization");
  const token = new URL(req.url).searchParams.get("token");
  return header === secret || token === secret || header === `Bearer ${secret}`;
}

function getIstDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getIstLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
}

function formatStatus(value: string) {
  return value.replace("_", " ");
}

const DAILY_TIPS = [
  "You’ve got this. Start with the first task and momentum will follow.",
  "Small updates create big clarity. Mark status as you go.",
  "One good action now beats a perfect plan later. Begin.",
  "The system is here to help you, not test you. Keep it simple.",
  "You’re not alone — the whole team is moving together today.",
  "Focus on progress, not perfection. The CRM keeps it organized.",
  "If something is stuck, note it clearly. Help will come faster.",
  "You only need one step at a time. Today’s list is enough.",
  "We win by showing up and updating. That’s it.",
  "Your work today helps real families. Thank you.",
  "Breathe, pick one task, and start. You can do this.",
  "Keep it easy: update, move on, repeat. You’re doing great.",
];

function dailyTipFor(dateKey: string) {
  const seed = Number(dateKey.replace(/-/g, "")) || 0;
  return DAILY_TIPS[seed % DAILY_TIPS.length];
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const zohoConfig = readZohoCliqConfig();
    if (!zohoConfig) {
      return NextResponse.json({ error: "Zoho Cliq not configured." }, { status: 400 });
    }

    const dateKey = getIstDateKey();
    const dateLabel = getIstLabel();

    const updates = await db
      .select()
      .from(opsTaskUpdates)
      .where(eq(opsTaskUpdates.taskDate, dateKey))
      .orderBy(desc(opsTaskUpdates.updatedAt), desc(opsTaskUpdates.id));

    const updateMap = new Map(
      updates.map((update) => [
        `${update.taskDate}|${update.profileKey}|${update.center || "network"}|${update.taskCode}`,
        update,
      ])
    );

    const tasksWithStatus = OPS_TASK_TEMPLATES.map((task) => {
      const profile = OPS_PROFILE_LIST.find((item) => item.key === task.profileKey);
      const center = profile?.center || "network";
      const key = `${dateKey}|${task.profileKey}|${center}|${task.code}`;
      const update = updateMap.get(key);
      return {
        ...task,
        ownerLabel: profile?.label || task.profileKey,
        status: update?.status || "pending",
      };
    });

    const total = tasksWithStatus.length;
    const done = tasksWithStatus.filter((task) => task.status === "done").length;
    const blocked = tasksWithStatus.filter((task) => task.status === "blocked").length;
    const inProgress = tasksWithStatus.filter((task) => task.status === "in_progress").length;
    const pending = total - done - blocked - inProgress;

    const morningTasks = tasksWithStatus.filter((task) => task.slot === "morning");
    const morningLines = morningTasks.map(
      (task) =>
        `- [${formatStatus(task.status)}] ${task.ownerLabel}: ${task.title} (due ${task.timeLabel})`
    );

    const message = [
      `Santaan CRM Morning Standup — ${dateLabel}`,
      "",
      `Today’s workload: total ${total} | done ${done} | in progress ${inProgress} | blocked ${blocked} | pending ${pending}`,
      "",
      "Morning focus (update status in CRM):",
      ...(morningLines.length ? morningLines : ["- No morning tasks found."]),
      "",
      `Daily tip: ${dailyTipFor(dateKey)}`,
      "",
      "Open CRM:",
      "- https://www.santaan.in/login",
      "- https://www.santaan.in/admin/dashboard",
      "",
      "Manuals:",
      "- https://www.santaan.in/admin/marketing-manual",
      "- https://www.santaan.in/admin/ceo-manual",
      "",
      "Please update your task status after completion so the evening review stays accurate.",
    ].join("\n");

    const result = await postZohoCliqMessage(message);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, date: dateKey, messageId: result.messageId });
  } catch (error) {
    console.error("Zoho Cliq morning cron error:", error);
    const message = error instanceof Error ? error.message : "Failed to send Zoho Cliq morning update.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
