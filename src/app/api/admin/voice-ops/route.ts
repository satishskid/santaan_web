import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { isAuthorizedOpsUser, isAuthorizedVoiceOpsEditor } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

const VOICE_OPS_DOC_SPECS = [
  { prefix: "VOICE_AGENT_MASTER_INDEX_", title: "Master Index", category: "Governance" },
  { prefix: "VOICE_AGENT_PRODUCT_PHILOSOPHY_", title: "Product Philosophy", category: "Governance" },
  { prefix: "VOICE_AGENT_GOVERNANCE_", title: "Governance Policy", category: "Governance" },
  { prefix: "VOICE_AGENT_SYSTEM_README_", title: "System README", category: "Governance" },
  { prefix: "AZURE_SPEECH_FALLBACK_SPIKE_", title: "Azure Speech Fallback Spike", category: "Operations" },
  { prefix: "VOICE_AGENT_CHANGE_LOG_TEMPLATE_", title: "Change Log Template", category: "Governance" },
  { prefix: "VOICE_AGENT_PERSONA_PROTOCOL_", title: "Persona Protocol", category: "Strategy" },
  { prefix: "BOLNA_VOICE_AGENT_PRODUCTION_PROMPT_", title: "Production Prompt", category: "Prompts" },
  { prefix: "BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_", title: "Main Agent Prompt Block", category: "Prompts" },
  { prefix: "BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_", title: "TV Agent Prompt Block", category: "Prompts" },
  { prefix: "EDESY_ODIA_AGENT_PROMPT_BLOCK_", title: "Edesy Odia Prompt Block", category: "Prompts" },
  { prefix: "BOLNA_VOICE_AGENT_EXTRACTION_SCHEMA_", title: "Extraction Schema", category: "Prompts" },
  { prefix: "SWARA_QA_TEAM_TEST_PACK_", title: "Swara QA Team Test Pack", category: "QA" },
  { prefix: "SWARA_QA_EVAL_FORM_TABLE_", title: "Swara QA Eval Form", category: "QA" },
  { prefix: "HANDOVER_SWARA_EDESY_CRM_", title: "Swara Edesy CRM Handover", category: "Operations" },
  { prefix: "BOLNA_CONFIGURATION_MAP_", title: "Bolna Configuration Map", category: "Operations" },
  { prefix: "BOLNA_VOBIZ_GO_LIVE_RUNBOOK_", title: "Bolna + VoBiz Go-Live Runbook", category: "Operations" },
  { prefix: "BOLNA_VOICE_AGENT_MAIN_SCRIPT_", title: "Main Line Script", category: "Operations" },
  { prefix: "BOLNA_VOICE_AGENT_TV_SCRIPT_", title: "TV Line Script", category: "Operations" },
  { prefix: "VOICE_AGENT_QA_SCORECARD_", title: "QA Scorecard", category: "QA" },
  { prefix: "VOICE_AGENT_TEST_SCENARIOS_", title: "Test Scenarios", category: "QA" },
  { prefix: "VOICE_AGENT_REVIEWER_SHEET_GUIDE_", title: "Reviewer Sheet Guide", category: "QA" },
  { prefix: "VOICE_AGENT_REVIEWER_SHEET_TEMPLATE_", title: "Reviewer Sheet Template", category: "QA" },
] as const;

const VOICE_OPS_SETTING_KEYS = [
  "VOICE_AGENT_MAIN_PROMPT_VERSION",
  "VOICE_AGENT_TV_PROMPT_VERSION",
  "VOICE_AGENT_MAIN_BOLNA_AGENT_ID",
  "VOICE_AGENT_TV_BOLNA_AGENT_ID",
  "VOICE_AGENT_MAIN_BOLNA_AGENT_NAME",
  "VOICE_AGENT_TV_BOLNA_AGENT_NAME",
  "VOICE_AGENT_MAIN_EDESY_AGENT_ID",
  "VOICE_AGENT_TV_EDESY_AGENT_ID",
  "VOICE_AGENT_MAIN_EDESY_AGENT_NAME",
  "VOICE_AGENT_TV_EDESY_AGENT_NAME",
  "VOICE_AGENT_MAIN_EDESY_NUMBER",
  "VOICE_AGENT_TV_EDESY_NUMBER",
  "VOICE_AGENT_MAIN_NUMBER",
  "VOICE_AGENT_TV_NUMBER",
  "VOICE_AGENT_BACKUP_NUMBER",
  "VOICE_AGENT_ROLLOUT_STATUS",
  "VOICE_AGENT_LAST_QA_REVIEW_AT",
  "VOICE_AGENT_LAST_QA_REVIEWER",
  "VOICE_AGENT_LATEST_QA_SCORE",
  "VOICE_AGENT_CLINICAL_REVIEW_OWNER",
  "VOICE_AGENT_OPS_OWNER",
  "VOICE_AGENT_OPEN_RISKS",
  "VOICE_AGENT_CHANGE_NOTES",
  "VOICE_AGENT_LAST_UPDATED_BY",
  "VOICE_AGENT_LAST_UPDATED_AT",
] as const;

const VOICE_OPS_MUTABLE_KEYS: ReadonlySet<string> = new Set(
  VOICE_OPS_SETTING_KEYS.filter(
    (key) => key !== "VOICE_AGENT_LAST_UPDATED_BY" && key !== "VOICE_AGENT_LAST_UPDATED_AT"
  )
);

type VoiceOpsSettingKey = (typeof VOICE_OPS_SETTING_KEYS)[number];

async function loadVoiceOpsDocs() {
  const docsDir = path.join(process.cwd(), "docs");
  const fileNames = await readdir(docsDir);

  const docs = await Promise.all(
    VOICE_OPS_DOC_SPECS.map(async (spec, index) => {
      const matchedFile = [...fileNames]
        .filter((fileName) => fileName.startsWith(spec.prefix))
        .sort()
        .at(-1);

      if (!matchedFile) return null;

      const filePath = path.join(docsDir, matchedFile);
      const content = await readFile(filePath, "utf8");
      const extension = path.extname(matchedFile).toLowerCase();

      return {
        id: `${index}-${matchedFile}`,
        title: spec.title,
        category: spec.category,
        fileName: matchedFile,
        extension,
        contentType: extension === ".csv" ? "text/csv" : "text/markdown",
        content,
      };
    })
  );

  return docs.filter(Boolean);
}

async function loadVoiceOpsSettings() {
  const rows = await db.select().from(settings);
  const settingsMap = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return VOICE_OPS_SETTING_KEYS.reduce((acc, key) => {
    acc[key] = settingsMap[key] || "";
    return acc;
  }, {} as Record<VoiceOpsSettingKey, string>);
}

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;

    if (!(await isAuthorizedOpsUser(email, sessionRole))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [docs, voiceSettings, canManage] = await Promise.all([
      loadVoiceOpsDocs().catch((error) => {
        console.error("Voice ops docs load error:", error);
        return [];
      }),
      loadVoiceOpsSettings(),
      isAuthorizedVoiceOpsEditor(email, sessionRole),
    ]);

    return NextResponse.json({
      ok: true,
      canManage,
      docs,
      settings: voiceSettings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Voice ops GET error:", error);
    return NextResponse.json({ error: "Failed to load voice ops data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;

    if (!(await isAuthorizedVoiceOpsEditor(email, sessionRole))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = String(body?.key || "").trim();
    const value = String(body?.value ?? "");

    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
    }

    if (!VOICE_OPS_MUTABLE_KEYS.has(key)) {
      return NextResponse.json({ error: "Setting key is not editable here" }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();
    const updatedBy = String(email || "").trim().toLowerCase();

    await Promise.all([
      db
        .insert(settings)
        .values({ key, value, updatedAt })
        .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt } }),
      db
        .insert(settings)
        .values({ key: "VOICE_AGENT_LAST_UPDATED_BY", value: updatedBy, updatedAt })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: updatedBy, updatedAt },
        }),
      db
        .insert(settings)
        .values({ key: "VOICE_AGENT_LAST_UPDATED_AT", value: updatedAt, updatedAt })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: updatedAt, updatedAt },
        }),
    ]);

    return NextResponse.json({ ok: true, key, value, updatedAt, updatedBy });
  } catch (error) {
    console.error("Voice ops POST error:", error);
    return NextResponse.json({ error: "Failed to save voice ops setting" }, { status: 500 });
  }
}
