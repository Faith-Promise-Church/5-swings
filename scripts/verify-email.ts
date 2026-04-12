import { sendAdminReportEmail, sendUserSwingsEmail } from "../lib/email";
import type { SearchResultPerson, StaffWithCurrentSwings } from "../lib/types";

async function main() {
  const verifyEmailTo = process.env.VERIFY_EMAIL_TO;

  if (!verifyEmailTo) {
    throw new Error("VERIFY_EMAIL_TO is required.");
  }

  const sampleData: StaffWithCurrentSwings = {
    staff: {
      id: "00000000-0000-0000-0000-000000000001",
      first_name: "Jody",
      last_name: "Verification",
      email: verifyEmailTo,
      campus: "Pellissippi",
      area: "Admin",
      created_at: new Date().toISOString(),
    },
    swings: {
      id: "00000000-0000-0000-0000-000000000002",
      staff_id: "00000000-0000-0000-0000-000000000001",
      swing_1: "Email Test Swing 1",
      swing_2: "Email Test Swing 2",
      swing_3: "Email Test Swing 3",
      swing_4: "Email Test Swing 4",
      swing_5: "Email Test Swing 5",
      wins_1: ["Weekly win A", "Weekly win B"],
      wins_2: [],
      wins_3: [],
      wins_4: [],
      wins_5: [],
      created_at: new Date().toISOString(),
      is_current: true,
    },
  };

  const person: SearchResultPerson = {
    id: sampleData.staff.id,
    firstName: sampleData.staff.first_name,
    lastName: sampleData.staff.last_name,
    email: verifyEmailTo,
    campus: sampleData.staff.campus,
    area: sampleData.staff.area,
    createdAt: sampleData.staff.created_at,
    swingsId: sampleData.swings.id,
    swingsCreatedAt: sampleData.swings.created_at,
    isCurrent: true,
    swings: [
      { category: "Email Test Swing 1", wins: ["Weekly win A", "Weekly win B"] },
      { category: "Email Test Swing 2", wins: [] },
      { category: "Email Test Swing 3", wins: [] },
      { category: "Email Test Swing 4", wins: [] },
      { category: "Email Test Swing 5", wins: [] },
    ],
  };

  const userEmailResponse = await sendUserSwingsEmail({
    data: sampleData,
    language: "en",
  });
  console.log("USER_EMAIL_RESPONSE", JSON.stringify(userEmailResponse));

  const adminEmailResponse = await sendAdminReportEmail({
    people: [person],
    email: verifyEmailTo,
    label: "Verification",
    language: "en",
  });
  console.log("ADMIN_EMAIL_RESPONSE", JSON.stringify(adminEmailResponse));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
