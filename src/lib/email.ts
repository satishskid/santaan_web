import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedConfig: SmtpConfig | null = null;

function buildSmtpConfig(): SmtpConfig | null {
  const host = process.env.EMAIL_SMTP_HOST?.trim();
  const user = process.env.EMAIL_SMTP_USER?.trim();
  const pass = process.env.EMAIL_SMTP_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const portRaw = process.env.EMAIL_SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 587;
  const secure =
    process.env.EMAIL_SMTP_SECURE?.trim().toLowerCase() === "true" || port === 465;

  if (!host || !user || !pass || !from) return null;

  return { host, port, secure, user, pass, from };
}

function getTransporter(): { transporter: nodemailer.Transporter; config: SmtpConfig } {
  const config = buildSmtpConfig();
  if (!config) {
    throw new Error("Email sending is not configured. Ask an admin to set SMTP credentials.");
  }

  if (
    cachedTransporter &&
    cachedConfig &&
    cachedConfig.host === config.host &&
    cachedConfig.port === config.port &&
    cachedConfig.secure === config.secure &&
    cachedConfig.user === config.user &&
    cachedConfig.pass === config.pass &&
    cachedConfig.from === config.from
  ) {
    return { transporter: cachedTransporter, config };
  }

  cachedConfig = config;
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return { transporter: cachedTransporter, config };
}

export async function sendMagicLinkEmail({
  to,
  url,
  ttlMinutes,
}: {
  to: string;
  url: string;
  ttlMinutes: number;
}) {
  const { transporter, config } = getTransporter();
  const subject = `Santaan CRM Magic Link (valid ${ttlMinutes} min)`;
  const text = [
    "Santaan CRM Magic Link",
    "",
    `Requested for: ${to}`,
    `Valid for: ${ttlMinutes} minutes`,
    "",
    `Open: ${url}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Santaan CRM Magic Link</h2>
      <p style="margin: 0 0 8px;">Requested for: <strong>${to}</strong></p>
      <p style="margin: 0 0 16px;">Valid for: <strong>${ttlMinutes} minutes</strong></p>
      <p style="margin: 0 0 12px;">
        <a href="${url}" style="background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block;">
          Open Magic Link
        </a>
      </p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });
}
