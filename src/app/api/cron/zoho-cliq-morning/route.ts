import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opsTaskUpdates } from "@/db/schema";
import { OPS_PROFILE_LIST, OPS_TASK_TEMPLATES } from "@/lib/ops-workboard";
import { postZohoCliqMessage, readZohoCliqConfig } from "@/lib/zoho-cliq";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
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
  "Mark task status in CRM right after completion so the evening wrap is accurate.",
  "Log UTMs in every link you publish today so we can measure ROI.",
  "If a lead is hot, update status immediately and add the next action note.",
  "Use the Campaign Analytics keywords list before finalizing copy.",
  "If a task is blocked, write the blocker clearly in notes so help is fast.",
  "Use the Ops Workboard to track field activity and keep dates consistent.",
  "Keep call outcomes short and specific: reason, outcome, next step.",
  "Review NeoDove sync status before the first calling cycle.",
  "Share center-specific creatives with correct tracking links only.",
  "Always close the loop: update leads after WhatsApp/phone follow-ups.",
  "Check integration health once in the morning and flag any warnings.",
  "Write one learning from today’s content performance for tomorrow.",
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
