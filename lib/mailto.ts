import { buildReportLabel } from "@/lib/report-label";
import { translate } from "@/lib/messages";
import type { Language, SaveSwingsResponse, SearchResultPerson } from "@/lib/types";

const DIVIDER = "----------------------------------------";

function formatSwingLines(swings: Array<{ category: string; wins: string[] }>, language: Language) {
  const winsLabel = translate(language, "swingCard.weeklyWins");

  return swings
    .map((swing, index) => {
      const wins = swing.wins.length
        ? `\n   ${winsLabel}:\n${swing.wins.map((win) => `   - ${win}`).join("\n")}`
        : "";

      return `${index + 1}. ${swing.category}${wins}`;
    })
    .join("\n\n");
}

function buildUserBody(data: SaveSwingsResponse, language: Language) {
  return [
    "MY 5 SWINGS",
    DIVIDER,
    "",
    translate(language, "email.userIntro"),
    "",
    `${data.firstName} ${data.lastName}`,
    `${translate(language, "swingCard.campus")}: ${data.campus}`,
    `${translate(language, "swingCard.area")}: ${data.area}`,
    "",
    formatSwingLines(data.swings, language),
    "",
    DIVIDER,
    translate(language, "email.footer"),
  ].join("\n");
}

function buildPersonBlock(person: SearchResultPerson, language: Language) {
  return [
    `${person.firstName} ${person.lastName}`,
    `${translate(language, "swingCard.campus")}: ${person.campus}`,
    `${translate(language, "swingCard.area")}: ${person.area}`,
    "",
    formatSwingLines(person.swings, language),
  ].join("\n");
}

function buildAdminBody(people: SearchResultPerson[], language: Language) {
  return [
    "5 SWINGS REPORT",
    DIVIDER,
    "",
    translate(language, "email.adminIntro"),
    "",
    ...people.flatMap((person, index) => [
      buildPersonBlock(person, language),
      ...(index < people.length - 1 ? ["", DIVIDER, ""] : []),
    ]),
    "",
    DIVIDER,
    translate(language, "email.footer"),
  ].join("\n");
}

function buildMailtoUrl(to: string, subject: string, body: string) {
  const normalizedBody = body.replace(/\n/g, "\r\n");
  const query = [
    `subject=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(normalizedBody)}`,
  ].join("&");

  return `mailto:${to}?${query}`;
}

export function openUserSwingsMailto({
  to,
  data,
  language,
}: {
  to: string;
  data: SaveSwingsResponse;
  language: Language;
}) {
  window.location.href = buildMailtoUrl(
    to,
    translate(language, "email.subjectUser"),
    buildUserBody(data, language),
  );
}

export function openAdminReportMailto({
  to,
  people,
  type,
  value,
  language,
}: {
  to: string;
  people: SearchResultPerson[];
  type: "campus" | "area" | "individual";
  value: string;
  language: Language;
}) {
  const label = buildReportLabel(type, value);

  window.location.href = buildMailtoUrl(
    to,
    translate(language, "email.subjectAdmin", { label }),
    buildAdminBody(people, language),
  );
}
