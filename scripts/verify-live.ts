import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { createAdminSessionValue, hasValidAdminSession } from "../lib/admin-auth";
import {
  createNewSwingVersion,
  createStaffAndSwings,
  getStaffWithCurrentSwings,
  getSwingsHistory,
  searchStaffWithCurrentSwings,
  updateCurrentSwings,
  verifyStaff,
} from "../lib/data/staff-swings";
import { sendAdminReportEmail, sendUserSwingsEmail } from "../lib/email";
import { AppError } from "../lib/errors";
import { ReportPdf } from "../lib/pdf";
import { toSearchResultPerson } from "../lib/swings";
import type { SwingItem } from "../lib/types";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectAppError(
  label: string,
  fn: () => Promise<unknown>,
  status: number,
  includes: string,
) {
  try {
    await fn();
    throw new Error(`${label}: expected AppError ${status}`);
  } catch (error) {
    if (!(error instanceof AppError)) {
      throw error;
    }

    assert(error.status === status, `${label}: expected status ${status}, got ${error.status}`);
    assert(
      error.message.includes(includes),
      `${label}: expected message to include "${includes}", got "${error.message}"`,
    );
    console.log(`PASS ${label}`);
  }
}

function makeSwings(prefix: string): SwingItem[] {
  return Array.from({ length: 5 }, (_, index) => ({
    category: `${prefix} Swing ${index + 1}`,
    wins: index === 0 ? [`${prefix} Win A`, `${prefix} Win B`] : [],
  }));
}

async function main() {
  const timestamp = Date.now();
  const lastName = `CodexLive${timestamp}`;
  const verifyEmailTo = process.env.VERIFY_EMAIL_TO;

  if (!verifyEmailTo) {
    throw new Error("VERIFY_EMAIL_TO is required for live verification.");
  }

  const created = await createStaffAndSwings({
    firstName: "Codex",
    lastName,
    email: verifyEmailTo,
    campus: "Pellissippi",
    area: "Admin",
    pin: "1234",
    swings: makeSwings("Created"),
  });
  console.log("PASS createStaffAndSwings");

  const duplicateLastName = await createStaffAndSwings({
    firstName: "Second",
    lastName,
    email: `duplicate+${timestamp}@example.com`,
    campus: "Blount",
    area: "Kids",
    pin: "5678",
    swings: makeSwings("Duplicate"),
  });
  console.log("PASS duplicate last name create");

  await expectAppError(
    "wrong pin verify",
    () => verifyStaff(lastName, "9999"),
    401,
    "couldn't find that combination",
  );

  const verified = await verifyStaff(lastName, "1234");
  assert(verified.id === created.staff.id, "verifyStaff: returned wrong staff id");
  console.log("PASS verifyStaff");

  const duplicateVerified = await verifyStaff(lastName, "5678");
  assert(
    duplicateVerified.id === duplicateLastName.staff.id,
    "verifyStaff with duplicate last name: returned wrong staff id",
  );
  console.log("PASS verifyStaff duplicate last name");

  const fetched = await getStaffWithCurrentSwings(created.staff.id);
  assert(fetched.swings.swing_1 === "Created Swing 1", "getStaffWithCurrentSwings: wrong initial data");
  console.log("PASS getStaffWithCurrentSwings");

  const updated = await updateCurrentSwings(created.staff.id, makeSwings("Updated"));
  assert(updated.swings.swing_1 === "Updated Swing 1", "updateCurrentSwings: did not update current row");
  const historyAfterUpdate = await getSwingsHistory(created.staff.id);
  assert(historyAfterUpdate.length === 1, "updateCurrentSwings: should not create history row");
  console.log("PASS updateCurrentSwings");

  const versioned = await createNewSwingVersion(created.staff.id, makeSwings("Versioned"));
  assert(versioned.swings.swing_1 === "Versioned Swing 1", "createNewSwingVersion: wrong new current row");
  const historyAfterVersion = await getSwingsHistory(created.staff.id);
  assert(historyAfterVersion.length === 2, "createNewSwingVersion: expected two history rows");
  assert(historyAfterVersion[0].is_current === true, "createNewSwingVersion: newest row should be current");
  assert(historyAfterVersion[1].is_current === false, "createNewSwingVersion: previous row should be archived");
  console.log("PASS createNewSwingVersion");

  const campusResults = await searchStaffWithCurrentSwings("campus", "Pellissippi");
  assert(campusResults.length >= 1, "search by campus: expected at least one result");
  console.log(`PASS search by campus (${campusResults.length})`);

  const areaResults = await searchStaffWithCurrentSwings("area", "Admin");
  assert(areaResults.length >= 1, "search by area: expected at least one result");
  console.log(`PASS search by area (${areaResults.length})`);

  const individualResults = await searchStaffWithCurrentSwings("individual", lastName);
  assert(individualResults.length === 1, "search by individual: expected exactly one result");
  console.log("PASS search by individual");

  const emptyResults = await searchStaffWithCurrentSwings(
    "individual",
    "NobodyShouldMatchThisName",
  );
  assert(emptyResults.length === 0, "empty search: expected zero results");
  console.log("PASS empty result search");

  const pdfBuffer = await renderToBuffer(
    createElement(ReportPdf, {
      people: individualResults.map((entry) => toSearchResultPerson(entry)),
      title: "5 Swings Report - Verification",
      language: "en",
    }),
  );
  assert(pdfBuffer.length > 1000, "PDF generation: expected non-empty buffer");
  console.log(`PASS pdf generation (${pdfBuffer.length} bytes)`);

  const sessionValue = createAdminSessionValue();
  assert(hasValidAdminSession(sessionValue), "admin session: should validate");
  assert(!hasValidAdminSession("bad.session"), "admin session: bad token should fail");
  console.log("PASS admin session helpers");

  const userEmailResponse = await sendUserSwingsEmail({
    data: versioned,
    language: "en",
  });
  console.log("USER_EMAIL_RESPONSE", JSON.stringify(userEmailResponse));
  assert(userEmailResponse.data?.id, "user email: expected resend id");
  console.log(`PASS user email (${userEmailResponse.data?.id})`);

  const adminEmailResponse = await sendAdminReportEmail({
    people: individualResults.map((entry) => toSearchResultPerson(entry)),
    email: verifyEmailTo,
    label: lastName,
    language: "en",
  });
  console.log("ADMIN_EMAIL_RESPONSE", JSON.stringify(adminEmailResponse));
  assert(adminEmailResponse.data?.id, "admin email: expected resend id");
  console.log(`PASS admin email (${adminEmailResponse.data?.id})`);

  console.log(`VERIFIED_LAST_NAME=${lastName}`);
  console.log(`VERIFIED_STAFF_ID=${created.staff.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
