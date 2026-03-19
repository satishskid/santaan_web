export type OpsTaskStatus = "pending" | "in_progress" | "done" | "blocked";

export type OpsProfile = {
  key: string;
  label: string;
  role: string;
  center: "network" | "bhubaneswar" | "berhampur" | "bangalore";
};

export type OpsTaskTemplate = {
  code: string;
  profileKey: string;
  slot: "morning" | "midday" | "afternoon" | "evening";
  timeLabel: string;
  title: string;
  inputTarget: string;
  sla: string;
  ownerHint: string;
};

export const OPS_PROFILE_LIST: OpsProfile[] = [
  { key: "ceo_crm_admin", label: "CEO / CRM Ops Admin", role: "admin", center: "network" },
  { key: "agency_ops", label: "Agency Ops", role: "agency_ops", center: "network" },
  { key: "content_manager", label: "Content Manager (AI)", role: "content_manager", center: "network" },
  { key: "field_exec_bhubaneswar", label: "Field Exec - Bhubaneswar", role: "field_exec", center: "bhubaneswar" },
  { key: "field_exec_berhampur", label: "Field Exec - Berhampur", role: "field_exec", center: "berhampur" },
  { key: "field_exec_bangalore", label: "Field Exec - Bangalore", role: "field_exec", center: "bangalore" },
  { key: "ivr_telecalling_lead", label: "IVR / Telecalling Lead", role: "ivr_manager", center: "network" },
  { key: "counselor_bhubaneswar", label: "Counselor - Bhubaneswar", role: "counselor", center: "bhubaneswar" },
  { key: "counselor_berhampur", label: "Counselor - Berhampur", role: "counselor", center: "berhampur" },
  { key: "counselor_bangalore", label: "Counselor - Bangalore", role: "counselor", center: "bangalore" },
];

export const OPS_ROLE_TO_PROFILE: Record<string, string> = {
  admin: "ceo_crm_admin",
  ceo: "ceo_crm_admin",
  crm_ops_admin: "ceo_crm_admin",
  marketing_manager: "agency_ops",
  agency_ops: "agency_ops",
  performance_marketer: "agency_ops",
  content_manager: "content_manager",
  field_exec: "field_exec_bhubaneswar",
  ivr_manager: "ivr_telecalling_lead",
  telecaller_manager: "ivr_telecalling_lead",
  telecaller: "ivr_telecalling_lead",
  counselor: "counselor_bhubaneswar",
};

const LEADERSHIP_ROLES = new Set(["admin", "ceo", "crm_ops_admin"]);

export const OPS_TASK_TEMPLATES: OpsTaskTemplate[] = [
  {
    code: "content_daily_plan_generate",
    profileKey: "content_manager",
    slot: "morning",
    timeLabel: "10:30 AM",
    title: "Generate today’s content drafts (use CRM prompt + embed UTMs)",
    inputTarget: "Campaign Analytics -> Agency Feedback",
    sla: "Drafts ready before 11:00 AM IST",
    ownerHint: "Content Manager",
  },
  {
    code: "content_publish_and_log_assets",
    profileKey: "content_manager",
    slot: "midday",
    timeLabel: "01:00 PM",
    title: "Publish posts and log asset ids + final UTM links",
    inputTarget: "Ops Workboard (notes)",
    sla: "All published items logged with asset + UTM link",
    ownerHint: "Content Manager",
  },
  {
    code: "content_distribute_to_centers",
    profileKey: "content_manager",
    slot: "afternoon",
    timeLabel: "04:00 PM",
    title: "Share center-specific creatives and tracking links with field/counselor teams",
    inputTarget: "WhatsApp/Email to centers + CRM note",
    sla: "Center teams receive assets same day",
    ownerHint: "Content Manager",
  },
  {
    code: "content_learning_and_next_day",
    profileKey: "content_manager",
    slot: "evening",
    timeLabel: "08:45 PM",
    title: "Log what worked (topic/time/caption) + next-day hypothesis",
    inputTarget: "Campaign Analytics + Ops Workboard note",
    sla: "1 learning logged daily",
    ownerHint: "Content Manager",
  },
  {
    code: "agency_daily_spend_submit",
    profileKey: "agency_ops",
    slot: "morning",
    timeLabel: "11:00 AM",
    title: "Submit daily campaign spend and lead metrics",
    inputTarget: "Ops Inputs -> Agency",
    sla: "100% active campaigns updated by 11:00 AM IST",
    ownerHint: "Agency Ops",
  },
  {
    code: "agency_underperformer_flag",
    profileKey: "agency_ops",
    slot: "afternoon",
    timeLabel: "03:00 PM",
    title: "Flag underperforming campaigns and add corrective note",
    inputTarget: "Ops Inputs -> Agency (notes)",
    sla: "All underperformers flagged within 24h",
    ownerHint: "Agency Ops",
  },
  {
    code: "field_bhubaneswar_activity_log",
    profileKey: "field_exec_bhubaneswar",
    slot: "evening",
    timeLabel: "08:00 PM",
    title: "Log all Bhubaneswar field activities with tracking handles",
    inputTarget: "Ops Inputs -> Field Team",
    sla: "Same-day logging with QR/call/WhatsApp handle",
    ownerHint: "Field Exec BBSR",
  },
  {
    code: "field_berhampur_activity_log",
    profileKey: "field_exec_berhampur",
    slot: "evening",
    timeLabel: "08:00 PM",
    title: "Log all Berhampur field activities with tracking handles",
    inputTarget: "Ops Inputs -> Field Team",
    sla: "Same-day logging with QR/call/WhatsApp handle",
    ownerHint: "Field Exec BRP",
  },
  {
    code: "field_bangalore_activity_log",
    profileKey: "field_exec_bangalore",
    slot: "evening",
    timeLabel: "08:00 PM",
    title: "Log all Bangalore field activities with tracking handles",
    inputTarget: "Ops Inputs -> Field Team",
    sla: "Same-day logging with QR/call/WhatsApp handle",
    ownerHint: "Field Exec BLR",
  },
  {
    code: "ivr_cycle_morning",
    profileKey: "ivr_telecalling_lead",
    slot: "morning",
    timeLabel: "11:00 AM",
    title: "Run NeoDove-to-CRM sync cycle A and update hot lead statuses",
    inputTarget: "CRM Contacts + NeoDove export",
    sla: "All hot leads touched in <=10 minutes",
    ownerHint: "IVR Lead",
  },
  {
    code: "ivr_cycle_afternoon",
    profileKey: "ivr_telecalling_lead",
    slot: "afternoon",
    timeLabel: "03:00 PM",
    title: "Run sync cycle B and reconcile pending callback queue",
    inputTarget: "CRM Contacts + NeoDove export",
    sla: "All new leads touched in <=2 hours",
    ownerHint: "IVR Lead",
  },
  {
    code: "ivr_cycle_evening",
    profileKey: "ivr_telecalling_lead",
    slot: "evening",
    timeLabel: "07:00 PM",
    title: "Run sync cycle C and publish daily reconciliation",
    inputTarget: "CRM + Daily summary note",
    sla: "Variance <=5% vs NeoDove touched leads",
    ownerHint: "IVR Lead",
  },
  {
    code: "tv_daily_spot_log",
    profileKey: "agency_ops",
    slot: "evening",
    timeLabel: "08:30 PM",
    title: "Log TV airing blocks with QR/IVR/keyword tracking",
    inputTarget: "Ops Inputs -> TV Ads",
    sla: "All spots logged same day",
    ownerHint: "Media/Ops",
  },
  {
    code: "counselor_bhubaneswar_followups",
    profileKey: "counselor_bhubaneswar",
    slot: "afternoon",
    timeLabel: "04:30 PM",
    title: "Update qualified follow-ups and closure outcomes",
    inputTarget: "CRM Contacts (status updates)",
    sla: "Qualified leads actioned same day",
    ownerHint: "Counselor BBSR",
  },
  {
    code: "counselor_berhampur_followups",
    profileKey: "counselor_berhampur",
    slot: "afternoon",
    timeLabel: "04:30 PM",
    title: "Update qualified follow-ups and closure outcomes",
    inputTarget: "CRM Contacts (status updates)",
    sla: "Qualified leads actioned same day",
    ownerHint: "Counselor BRP",
  },
  {
    code: "counselor_bangalore_followups",
    profileKey: "counselor_bangalore",
    slot: "afternoon",
    timeLabel: "04:30 PM",
    title: "Update qualified follow-ups and closure outcomes",
    inputTarget: "CRM Contacts (status updates)",
    sla: "Qualified leads actioned same day",
    ownerHint: "Counselor BLR",
  },
  {
    code: "ceo_morning_pulse_check",
    profileKey: "ceo_crm_admin",
    slot: "morning",
    timeLabel: "09:30 AM",
    title: "Review CEO Command metrics and assign daily priorities",
    inputTarget: "CEO Command",
    sla: "Owner assignments before 10:00 AM",
    ownerHint: "CEO/CRM Admin",
  },
  {
    code: "ceo_evening_review",
    profileKey: "ceo_crm_admin",
    slot: "evening",
    timeLabel: "09:00 PM",
    title: "Review compliance, leaks, and close daily action sheet",
    inputTarget: "CEO Command + Ops Workboard",
    sla: "Daily action closure note published",
    ownerHint: "CEO/CRM Admin",
  },
];

export function getProfileByKey(profileKey: string) {
  return OPS_PROFILE_LIST.find((profile) => profile.key === profileKey) || null;
}

export function getTasksForProfile(profileKey: string) {
  return OPS_TASK_TEMPLATES.filter((task) => task.profileKey === profileKey);
}

export function getAllowedStatuses(): OpsTaskStatus[] {
  return ["pending", "in_progress", "done", "blocked"];
}

function normalizeRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export function isLeadershipRole(role?: string | null) {
  return LEADERSHIP_ROLES.has(normalizeRole(role));
}

export function getVisibleProfilesForRole(role?: string | null): OpsProfile[] {
  const normalizedRole = normalizeRole(role);

  if (isLeadershipRole(normalizedRole)) return OPS_PROFILE_LIST;

  if (normalizedRole === "agency_ops" || normalizedRole === "marketing_manager" || normalizedRole === "performance_marketer") {
    return OPS_PROFILE_LIST.filter((profile) => profile.key === "agency_ops");
  }

  if (normalizedRole === "content_manager") {
    return OPS_PROFILE_LIST.filter((profile) => profile.key === "content_manager");
  }

  if (normalizedRole === "ivr_manager" || normalizedRole === "telecaller_manager" || normalizedRole === "telecaller") {
    return OPS_PROFILE_LIST.filter((profile) => profile.key === "ivr_telecalling_lead");
  }

  if (normalizedRole === "field_exec") {
    return OPS_PROFILE_LIST.filter((profile) => profile.key.startsWith("field_exec_"));
  }

  if (normalizedRole === "counselor") {
    return OPS_PROFILE_LIST.filter((profile) => profile.key.startsWith("counselor_"));
  }

  const fallbackProfileKey = OPS_ROLE_TO_PROFILE[normalizedRole];
  if (fallbackProfileKey) {
    return OPS_PROFILE_LIST.filter((profile) => profile.key === fallbackProfileKey);
  }

  return OPS_PROFILE_LIST.filter((profile) => profile.key === "ceo_crm_admin");
}
