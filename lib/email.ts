import { Resend } from "resend";
import { SEGMENTS, TEACHING_ROLES, GRADUATION_LEVELS, LANGUAGES } from "./reference-data";

const resend = new Resend(process.env.RESEND_API_KEY);

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function labelFor<T extends { code: string; label: string }>(
  list: readonly T[],
  code: string | null
): string | null {
  if (!code) return null;
  return list.find((item) => item.code === code)?.label ?? code;
}

export async function sendConfirmationEmail({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const firstName = name.split(" ")[0];
  const confirmUrl = `${baseUrl()}/smiq/confirm?token=${token}`;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: "Confirm your Capoeira International response",
    html: `
<!-- confirm email -->
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0e0c09;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0c09;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#15120d;border:1px solid #2a2318;border-radius:8px;padding:40px;">
        <tr><td style="color:#c8922a;font-size:22px;font-weight:bold;padding-bottom:16px;">
          Capoeira International
        </td></tr>
        <tr><td style="color:#e8dfd0;font-size:17px;padding-bottom:12px;">
          Axé, ${firstName} —
        </td></tr>
        <tr><td style="color:#b8aa94;font-size:15px;line-height:1.6;padding-bottom:28px;">
          Thank you for sharing your experience with the Capoeira community. Please confirm your email address to submit your response.
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <a href="${confirmUrl}"
             style="display:inline-block;background:#c8922a;color:#0e0c09;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:6px;">
            Confirm my response →
          </a>
        </td></tr>
        <tr><td style="color:#6b5f4e;font-size:13px;line-height:1.5;">
          This link expires in 24 hours. If you didn't fill in the Capoeira International survey, you can safely ignore this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log("[resend] sent", data?.id);
}

export async function sendOwnerNotification({
  name,
  email,
  segment,
  smiqAnswer,
  teachingRole,
  graduationLevel,
  lang,
  createdAt,
}: {
  name: string;
  email: string;
  segment: string;
  smiqAnswer: string;
  teachingRole: string | null;
  graduationLevel: string | null;
  lang: string | null;
  createdAt: Date;
}) {
  const to = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[email] OWNER_NOTIFICATION_EMAIL not set — skipping owner notification");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const segmentLabel = labelFor(SEGMENTS, segment) ?? segment;
  const roleLabel = labelFor(TEACHING_ROLES, teachingRole);
  const gradLabel = labelFor(GRADUATION_LEVELS, graduationLevel);
  const langLabel = labelFor(LANGUAGES, lang) ?? lang ?? "—";
  const timestamp = createdAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const rows = [
    ["Name", escapeHtml(name)],
    ["Email", escapeHtml(email)],
    ["Segment", escapeHtml(segmentLabel)],
    ...(roleLabel ? [["Teaching role", escapeHtml(roleLabel)]] : []),
    ...(gradLabel ? [["Graduation level", escapeHtml(gradLabel)]] : []),
    ["Language", escapeHtml(langLabel)],
    ["Confirmed at", `${escapeHtml(timestamp)} UTC`],
  ];

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `New SMIQ response — ${segmentLabel}`,
    html: `
<!-- owner notification email -->
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0e0c09;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0c09;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#15120d;border:1px solid #2a2318;border-radius:8px;padding:40px;">
        <tr><td style="color:#c8922a;font-size:22px;font-weight:bold;padding-bottom:16px;">
          New SMIQ response
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows
              .map(
                ([label, value]) => `
            <tr>
              <td style="color:#6b5f4e;font-size:13px;padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;">${label}</td>
              <td style="color:#e8dfd0;font-size:14px;padding:4px 0;">${value}</td>
            </tr>`
              )
              .join("")}
          </table>
        </td></tr>
        <tr><td style="color:#6b5f4e;font-size:13px;padding-bottom:8px;">SMIQ answer</td></tr>
        <tr><td style="color:#b8aa94;font-size:15px;line-height:1.6;">
          ${escapeHtml(smiqAnswer)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  console.log("[resend] owner notification sent", data?.id);
}
