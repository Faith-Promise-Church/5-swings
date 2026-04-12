import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

import { swingItemsToColumns } from "../lib/swings";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoStaff = [
  {
    firstName: "Avery",
    lastName: "Coleman",
    email: "avery.coleman@example.com",
    campus: "Pellissippi",
    area: "Admin",
    swings: [
      { category: "Calendar stewardship", wins: ["Lock the weekly priorities", "Clear bottlenecks fast"] },
      { category: "Staff communication", wins: ["Send recap notes", "Prepare meeting follow-up"] },
      { category: "Budget oversight", wins: ["Review requests", "Track spend variance"] },
      { category: "Decision support", wins: ["Surface next actions", "Organize approvals"] },
      { category: "Leadership coverage", wins: ["Handle key handoffs", "Keep deadlines visible"] }
    ]
  },
  {
    firstName: "Brooke",
    lastName: "Dalton",
    email: "brooke.dalton@example.com",
    campus: "Blount",
    area: "Kids",
    swings: [
      { category: "Volunteer recruiting", wins: ["Invite two new leaders", "Follow up with prospects"] },
      { category: "Weekend readiness", wins: ["Confirm rooms and teams", "Prep lesson flow"] },
      { category: "Parent communication", wins: ["Send family recap", "Answer open questions"] },
      { category: "Leader development", wins: ["Coach one team lead", "Celebrate strong serving"] },
      { category: "Safety excellence", wins: ["Review check-in flow", "Close any incidents"] }
    ]
  },
  {
    firstName: "Caleb",
    lastName: "Merritt",
    email: "caleb.merritt@example.com",
    campus: "North Knox",
    area: "Students",
    swings: [
      { category: "Student relationships", wins: ["Reach out to absentees", "Schedule one-on-ones"] },
      { category: "Leader pipeline", wins: ["Identify new volunteers", "Coach Wednesday leaders"] },
      { category: "Midweek environment", wins: ["Tighten run of show", "Prep games and teaching"] },
      { category: "Parent partnership", wins: ["Send update email", "Connect with two families"] },
      { category: "Campus integration", wins: ["Align with campus pastor", "Promote next steps"] }
    ]
  },
  {
    firstName: "Danielle",
    lastName: "Hale",
    email: "danielle.hale@example.com",
    campus: "Anderson",
    area: "Groups",
    swings: [
      { category: "Group launches", wins: ["Review openings", "Publish leader needs"] },
      { category: "Leader care", wins: ["Check in with leaders", "Pray with one leader"] },
      { category: "Apprentice development", wins: ["Identify future leaders", "Coach apprentices"] },
      { category: "Stories of life change", wins: ["Capture one testimony", "Share win with campus staff"] },
      { category: "Systems follow-through", wins: ["Update roster issues", "Resolve group questions"] }
    ]
  },
  {
    firstName: "Ethan",
    lastName: "Bledsoe",
    email: "ethan.bledsoe@example.com",
    campus: "Farragut",
    area: "Worship",
    swings: [
      { category: "Service planning", wins: ["Finalize set list", "Confirm transitions"] },
      { category: "Volunteer shepherding", wins: ["Text team encouragement", "Schedule one coaching touchpoint"] },
      { category: "Rehearsal quality", wins: ["Tighten cues", "Review pain points"] },
      { category: "Technical alignment", wins: ["Coordinate with production", "Share stage notes"] },
      { category: "Spiritual preparation", wins: ["Pray with team", "Review service focus"] }
    ]
  },
  {
    firstName: "Faith",
    lastName: "Torres",
    email: "faith.torres@example.com",
    campus: "Bristol",
    area: "Guest Services",
    swings: [
      { category: "First-time guest follow-up", wins: ["Review guest cards", "Send welcome contacts"] },
      { category: "Volunteer placement", wins: ["Fill host gaps", "Confirm lobby teams"] },
      { category: "Arrival experience", wins: ["Walk parking flow", "Refresh signage"] },
      { category: "Leader coaching", wins: ["Coach a team captain", "Celebrate one host"] },
      { category: "Weekend execution", wins: ["Review observations", "Close loop on issues"] }
    ]
  },
  {
    firstName: "Gavin",
    lastName: "Presley",
    email: "gavin.presley@example.com",
    campus: "Roane",
    area: "Central Ministries",
    swings: [
      { category: "Ministry alignment", wins: ["Clarify support asks", "Prioritize requests"] },
      { category: "Cross-campus coordination", wins: ["Share updates", "Resolve one blocker"] },
      { category: "Team development", wins: ["Coach a director", "Review next milestones"] },
      { category: "Resource stewardship", wins: ["Track project progress", "Adjust allocations"] },
      { category: "Strategic follow-through", wins: ["Move one initiative forward", "Prepare leadership summary"] }
    ]
  },
  {
    firstName: "Hannah",
    lastName: "Whitaker",
    email: "hannah.whitaker@example.com",
    campus: "Central",
    area: "Central Ops",
    swings: [
      { category: "Operational planning", wins: ["Confirm key dates", "Update task owners"] },
      { category: "Process refinement", wins: ["Simplify one workflow", "Document a repeatable step"] },
      { category: "Vendor coordination", wins: ["Close one open request", "Review weekly needs"] },
      { category: "Internal service", wins: ["Respond to support asks", "Unblock a campus team"] },
      { category: "Execution visibility", wins: ["Share ops snapshot", "Flag any risks"] }
    ]
  },
  {
    firstName: "Isaac",
    lastName: "Navarro",
    email: "isaac.navarro@example.com",
    campus: "Promesa de Fe",
    area: "Campus Pastors",
    swings: [
      { category: "Pastoral care", wins: ["Call key people", "Follow up on prayer needs"] },
      { category: "Weekend leadership", wins: ["Prepare host moments", "Align with service teams"] },
      { category: "Team coaching", wins: ["Meet with a ministry lead", "Clarify weekly focus"] },
      { category: "Community presence", wins: ["Build one relationship", "Support one key family"] },
      { category: "Vision clarity", wins: ["Cast direction to staff", "Reinforce wins"] }
    ]
  },
  {
    firstName: "Julia",
    lastName: "Ramsey",
    email: "julia.ramsey@example.com",
    campus: "Pellissippi",
    area: "SLT",
    swings: [
      { category: "Vision leadership", wins: ["Clarify one priority", "Reinforce role ownership"] },
      { category: "Leader multiplication", wins: ["Coach one high-capacity leader", "Review succession needs"] },
      { category: "Strategic decisions", wins: ["Resolve one major question", "Communicate next step"] },
      { category: "Culture shaping", wins: ["Celebrate key behavior", "Address one tension quickly"] },
      { category: "Future planning", wins: ["Review upcoming season", "Align resources"] }
    ]
  },
  {
    firstName: "Kara",
    lastName: "Bishop",
    email: "kara.bishop@example.com",
    campus: "Blount",
    area: "Guest Services",
    swings: [
      { category: "Volunteer readiness", wins: ["Fill Sunday roles", "Check in with host leaders"] },
      { category: "Guest engagement", wins: ["Review first-time wins", "Follow up with return guests"] },
      { category: "Lobby excellence", wins: ["Refresh environment details", "Audit signage"] },
      { category: "Systems support", wins: ["Update serve schedules", "Resolve one issue"] },
      { category: "Culture of welcome", wins: ["Celebrate a team win", "Model hospitality"] }
    ]
  },
  {
    firstName: "Landon",
    lastName: "Keaton",
    email: "landon.keaton@example.com",
    campus: "North Knox",
    area: "Worship",
    swings: [
      { category: "Weekend set preparation", wins: ["Finalize charts", "Send Planning Center notes"] },
      { category: "Musician development", wins: ["Coach one player", "Recruit one future volunteer"] },
      { category: "Band communication", wins: ["Share rehearsal expectations", "Answer open questions"] },
      { category: "Production partnership", wins: ["Walk through cues", "Confirm rehearsal timing"] },
      { category: "Spiritual culture", wins: ["Pray with a volunteer", "Share one encouragement"] }
    ]
  },
  {
    firstName: "Maya",
    lastName: "Quillen",
    email: "maya.quillen@example.com",
    campus: "Anderson",
    area: "Students",
    swings: [
      { category: "Student touchpoints", wins: ["Reach five students", "Invite one new student"] },
      { category: "Leader care", wins: ["Encourage two leaders", "Solve one volunteer issue"] },
      { category: "Service planning", wins: ["Prepare message flow", "Build response moment"] },
      { category: "School presence", wins: ["Show up at one event", "Connect with one family"] },
      { category: "Next steps follow-up", wins: ["Track decisions", "Move one student toward serving"] }
    ]
  },
  {
    firstName: "Noah",
    lastName: "Stafford",
    email: "noah.stafford@example.com",
    campus: "Farragut",
    area: "Groups",
    swings: [
      { category: "Leader recruitment", wins: ["Invite a future leader", "Follow up with interest"] },
      { category: "Group health", wins: ["Check attendance trends", "Coach a struggling leader"] },
      { category: "Multiplication focus", wins: ["Name one apprentice", "Clarify next launch path"] },
      { category: "Stories and wins", wins: ["Capture one testimony", "Share it with staff"] },
      { category: "Systems follow-through", wins: ["Update leader records", "Resolve one issue"] }
    ]
  },
  {
    firstName: "Olivia",
    lastName: "York",
    email: "olivia.york@example.com",
    campus: "Central",
    area: "Kids",
    swings: [
      { category: "Volunteer pipeline", wins: ["Recruit two new leaders", "Review next placements"] },
      { category: "Weekend prep", wins: ["Lock curriculum flow", "Confirm room leaders"] },
      { category: "Parent trust", wins: ["Send helpful update", "Follow up after check-in concern"] },
      { category: "Leader development", wins: ["Coach one room lead", "Celebrate one volunteer"] },
      { category: "Safety and excellence", wins: ["Audit environment", "Close one open issue"] }
    ]
  }
] as const;

async function upsertDemoStaff() {
  const pinHash = await bcrypt.hash("1234", 10);

  for (const person of demoStaff) {
    const { data: existingStaff } = await supabase
      .from("staff")
      .select("id")
      .ilike("last_name", person.lastName)
      .maybeSingle();

    let staffId = existingStaff?.id as string | undefined;

    if (!staffId) {
      const { data, error } = await supabase
        .from("staff")
        .insert({
          first_name: person.firstName,
          last_name: person.lastName,
          email: person.email,
          campus: person.campus,
          area: person.area,
          pin_hash: pinHash
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(`Could not insert staff ${person.lastName}: ${error?.message}`);
      }

      staffId = data.id;
    } else {
      const { error } = await supabase
        .from("staff")
        .update({
          first_name: person.firstName,
          email: person.email,
          campus: person.campus,
          area: person.area,
          pin_hash: pinHash
        })
        .eq("id", staffId);

      if (error) {
        throw new Error(`Could not update staff ${person.lastName}: ${error.message}`);
      }
    }

    const { data: current } = await supabase
      .from("swings")
      .select("id")
      .eq("staff_id", staffId)
      .eq("is_current", true)
      .maybeSingle();

    const swingPayload = {
      staff_id: staffId,
      ...swingItemsToColumns(person.swings.map((swing) => ({
        category: swing.category,
        wins: [...swing.wins]
      }))),
      is_current: true
    };

    if (!current) {
      const { error } = await supabase.from("swings").insert(swingPayload);

      if (error) {
        throw new Error(`Could not insert swings for ${person.lastName}: ${error.message}`);
      }
    } else {
      const { error } = await supabase
        .from("swings")
        .update(swingPayload)
        .eq("id", current.id);

      if (error) {
        throw new Error(`Could not update swings for ${person.lastName}: ${error.message}`);
      }
    }
  }
}

upsertDemoStaff()
  .then(() => {
    console.log(`Seeded ${demoStaff.length} demo staff records with PIN 1234.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
