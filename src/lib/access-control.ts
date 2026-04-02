export const SUPER_ADMIN_EMAILS = [
  "ceo.crmops@santaan.in",
  "raghab.panda@santaan.in",
  "satish.rath@santaan.in",
  "digi.social@skids.health",
  "satsh@skids.health",
  "satish@skids.health",
  "satish.rath@gmail.com",
  "demo@santaan.com",
] as const;

export const LEADERSHIP_ROLES = ["admin", "ceo", "crm_ops_admin"] as const;

export const OPS_ROLES = [
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
  "field_exec",
  "ivr_manager",
  "telecaller_manager",
  "telecaller",
  "counselor",
] as const;

const SUPER_ADMIN_EMAIL_SET = new Set<string>(SUPER_ADMIN_EMAILS);
const LEADERSHIP_ROLE_SET = new Set<string>(LEADERSHIP_ROLES);
const OPS_ROLE_SET = new Set<string>(OPS_ROLES);

export function normalizeAccessEmail(email?: string | null) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeAccessRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email?: string | null) {
  return SUPER_ADMIN_EMAIL_SET.has(normalizeAccessEmail(email));
}

export function hasLeadershipRole(role?: string | null) {
  return LEADERSHIP_ROLE_SET.has(normalizeAccessRole(role));
}

export function hasOpsRole(role?: string | null) {
  return OPS_ROLE_SET.has(normalizeAccessRole(role));
}

