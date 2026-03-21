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

function formatNote(note?: string | null) {
  const safe = String(note || "").trim();
  if (!safe) return "";
  return safe.length > 80 ? `${safe.slice(0, 77)}...` : safe;
}

const DAILY_TIPS = [
  "You showed up today. That matters. Thank you.",
  "Progress is progress. The CRM captures it, and we improve tomorrow.",
  "Even a small update helps the whole team stay aligned.",
  "If today was hard, it’s okay. You still moved us forward.",
  "Take a breath. Close the open loops you can, rest for the rest.",
  "Consistency beats intensity. You’re building that habit.",
  "One honest note is enough. Keep it simple.",
  "Tomorrow gets easier because of what you logged today.",
  "If something is blocked, you did the right thing by flagging it.",
  "Celebrate the wins — big or small — they matter.",
  "You’re helping real families. That’s meaningful work.",
  "Thanks for staying steady. We do this together.",
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
        note: update?.note || "",
        updatedAt: update?.updatedAt || null,
      };
    });

    const total = tasksWithStatus.length;
    const done = tasksWithStatus.filter((task) => task.status === "done").length;
    const blocked = tasksWithStatus.filter((task) => task.status === "blocked").length;
    const inProgress = tasksWithStatus.filter((task) => task.status === "in_progress").length;
    const pending = total - done - blocked - inProgress;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const blockedTasks = tasksWithStatus.filter((task) => task.status === "blocked");
    const openTasks = tasksWithStatus
      .filter((task) => task.status !== "done")
      .slice(0, 10);

    const blockedLines = blockedTasks.length
      ? blockedTasks.map((task) => {
          const note = formatNote(task.note);
          return `- ${task.ownerLabel}: ${task.title}${note ? ` (note: ${note})` : ""}`;
        })
      : ["- No blocked tasks reported today."];

    const openLines = openTasks.length
      ? openTasks.map(
          (task) =>
            `- [${formatStatus(task.status)}] ${task.ownerLabel}: ${task.title} (due ${task.timeLabel})`
        )
      : ["- All tasks closed. Great job team."];

    const message = [
      `Santaan CRM Evening Wrap — ${dateLabel}`,
      "",
      `Completion: total ${total} | done ${done} | in progress ${inProgress} | blocked ${blocked} | pending ${pending} | ${completionRate}% done`,
      "",
      "Blocked items (need help):",
      ...blockedLines,
      "",
      "Still open (top 10):",
      ...openLines,
      "",
      `Daily tip: ${dailyTipFor(dateKey)}`,
      "",
      "Please update any remaining tasks before sign-off so tomorrow’s standup is accurate.",
      "",
      "Manuals:",
      "- https://www.santaan.in/admin/marketing-manual",
      "- https://www.santaan.in/admin/ceo-manual",
    ].join("\n");

    const result = await postZohoCliqMessage(message);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, date: dateKey, messageId: result.messageId });
  } catch (error) {
    console.error("Zoho Cliq evening cron error:", error);
    const message = error instanceof Error ? error.message : "Failed to send Zoho Cliq evening update.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
