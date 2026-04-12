import { Resend } from "resend";

import { AppError } from "@/lib/errors";
import { translate } from "@/lib/messages";
import type { Language, SearchResultPerson, StaffWithCurrentSwings } from "@/lib/types";
import { toSearchResultPerson } from "@/lib/swings";

const DEFAULT_EMAIL_FROM = "onboarding@resend.dev";
const TEST_EMAIL_REDIRECT_TO = process.env.TEST_EMAIL_REDIRECT_TO?.trim();

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
}

function getEmailRecipients(to: string | string[]) {
  if (TEST_EMAIL_REDIRECT_TO) {
    return TEST_EMAIL_REDIRECT_TO;
  }

  return to;
}

async function sendEmail(
  payload: Parameters<ReturnType<typeof getResend>["emails"]["send"]>[0],
) {
  const resend = getResend();
  const result = await resend.emails.send(payload);

  if (result.error || !result.data?.id) {
    const message = result.error?.message ?? "We couldn't send that email right now. Please try again in a moment.";

    if (
      message.toLowerCase().includes("your own email address") ||
      message.toLowerCase().includes("verify a domain") ||
      message.toLowerCase().includes("resend.dev domain")
    ) {
      throw new AppError(
        "Resend's test sender can only deliver to the email address on the Resend account. To send to other people, you'll need a verified domain in Resend.",
        502,
      );
    }

    throw new AppError(
      message,
      502,
    );
  }

  return result;
}

function renderPersonSection(
  person: SearchResultPerson,
  language: Language,
  includeMeta = true,
) {
  const winsLabel = translate(language, "swingCard.weeklyWins");

  return `
    <section style="background:#ffffff;border:1px solid #e4dfd6;border-radius:12px;padding:24px;margin-bottom:18px;">
      ${
        includeMeta
          ? `<div style="margin-bottom:18px;">
            <div style="font-size:22px;font-weight:600;color:#445557;">${person.firstName} ${person.lastName}</div>
            <div style="margin-top:8px;font-size:14px;color:#6c7778;">${translate(language, "swingCard.campus")}: ${person.campus}</div>
            <div style="font-size:14px;color:#6c7778;">${translate(language, "swingCard.area")}: ${person.area}</div>
          </div>`
          : ""
      }
      <ol style="padding-left:20px;margin:0;">
        ${person.swings
          .map(
            (swing) => `
              <li style="margin-bottom:12px;color:#445557;">
                <div style="font-size:16px;line-height:1.6;">${swing.category}</div>
                ${
                  swing.wins.length
                    ? `<div style="margin-top:8px;font-size:14px;color:#6c7778;">${winsLabel}</div>
                       <ul style="margin-top:6px;padding-left:18px;">
                         ${swing.wins
                           .map(
                             (win) =>
                               `<li style="margin-bottom:4px;color:#445557;font-size:14px;">${win}</li>`,
                           )
                           .join("")}
                       </ul>`
                    : ""
                }
              </li>
            `,
          )
          .join("")}
      </ol>
    </section>
  `;
}

function renderShell({
  title,
  intro,
  content,
  footer,
}: {
  title: string;
  intro: string;
  content: string;
  footer: string;
}) {
  return `
    <div style="background:#f5f1ea;padding:32px 16px;font-family:'neue-haas-grotesk-text',Inter,system-ui,sans-serif;color:#445557;">
      <div style="max-width:720px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:24px;">
          <img src="https://faithpromise.org/favicon.ico" alt="Faith Promise" style="height:40px;margin:0 auto 16px;" />
          <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.02em;margin:0;">${title}</h1>
          <p style="margin:10px 0 0;color:#6c7778;font-size:15px;line-height:1.6;">${intro}</p>
        </div>
        ${content}
        <p style="margin-top:24px;text-align:center;font-size:13px;color:#6c7778;">${footer}</p>
      </div>
    </div>
  `;
}

export async function sendUserSwingsEmail({
  data,
  language,
}: {
  data: StaffWithCurrentSwings;
  language: Language;
}) {
  const person = toSearchResultPerson(data);

  return sendEmail({
    from: getEmailFrom(),
    to: getEmailRecipients(data.staff.email),
    subject: translate(language, "email.subjectUser"),
    html: renderShell({
      title: translate(language, "email.subjectUser"),
      intro: translate(language, "email.userIntro"),
      content: renderPersonSection(person, language, false),
      footer: translate(language, "email.footer"),
    }),
  });
}

export async function sendAdminReportEmail({
  people,
  email,
  label,
  language,
}: {
  people: SearchResultPerson[];
  email: string;
  label: string;
  language: Language;
}) {
  return sendEmail({
    from: getEmailFrom(),
    to: getEmailRecipients(email),
    subject: translate(language, "email.subjectAdmin", { label }),
    html: renderShell({
      title: translate(language, "email.subjectAdmin", { label }),
      intro: translate(language, "email.adminIntro"),
      content: people.map((person) => renderPersonSection(person, language)).join(""),
      footer: translate(language, "email.footer"),
    }),
  });
}
