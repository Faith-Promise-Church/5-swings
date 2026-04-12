import bcrypt from "bcryptjs";

import { AppError } from "@/lib/errors";
import { getServiceSupabase } from "@/lib/supabase/server";
import { swingItemsToColumns } from "@/lib/swings";
import type {
  SearchType,
  StaffRecord,
  StaffWithCurrentSwings,
  SwingItem,
  SwingRecord,
} from "@/lib/types";

type CreateStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  campus: StaffRecord["campus"];
  area: StaffRecord["area"];
  pin: string;
  swings: SwingItem[];
};

function assertData<T>(data: T | null, errorMessage = "Not found", status = 404) {
  if (!data) {
    throw new AppError(errorMessage, status);
  }

  return data;
}

export async function getStaffByLastName(lastName: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("staff")
    .select("id, first_name, last_name, email, campus, area, pin_hash, created_at")
    .ilike("last_name", lastName.trim())
    .maybeSingle();

  if (error) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return data;
}

export async function verifyStaff(lastName: string, pin: string) {
  const staff = await getStaffByLastName(lastName);

  if (!staff) {
    throw new AppError(
      "We couldn't find that combination. Try again or contact Pastor Josh.",
      401,
    );
  }

  const matches = await bcrypt.compare(pin, staff.pin_hash);

  if (!matches) {
    throw new AppError(
      "We couldn't find that combination. Try again or contact Pastor Josh.",
      401,
    );
  }

  return staff;
}

export async function createStaffAndSwings(input: CreateStaffInput) {
  const supabase = getServiceSupabase();
  const existing = await getStaffByLastName(input.lastName);

  if (existing) {
    throw new AppError(
      "A staff member with that last name already exists. Please contact Pastor Josh to resolve.",
      409,
    );
  }

  const pinHash = await bcrypt.hash(input.pin, 10);

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim(),
      campus: input.campus,
      area: input.area,
      pin_hash: pinHash,
    })
    .select("id, first_name, last_name, email, campus, area, created_at")
    .single();

  if (staffError || !staff) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  const { data: swings, error: swingsError } = await supabase
    .from("swings")
    .insert({
      staff_id: staff.id,
      ...swingItemsToColumns(input.swings),
      is_current: true,
    })
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .single();

  if (swingsError || !swings) {
    await supabase.from("staff").delete().eq("id", staff.id);
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return {
    staff,
    swings,
  } satisfies StaffWithCurrentSwings;
}

export async function getStaffById(staffId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("staff")
    .select("id, first_name, last_name, email, campus, area, created_at")
    .eq("id", staffId)
    .maybeSingle();

  if (error) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return data;
}

export async function getCurrentSwingsRecord(staffId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("swings")
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .eq("staff_id", staffId)
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return data;
}

export async function getStaffWithCurrentSwings(staffId: string) {
  const [staff, swings] = await Promise.all([
    getStaffById(staffId),
    getCurrentSwingsRecord(staffId),
  ]);

  return {
    staff: assertData(staff, "Staff member not found."),
    swings: assertData(swings, "Current swings not found."),
  } satisfies StaffWithCurrentSwings;
}

export async function getSwingsHistory(staffId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("swings")
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return data as SwingRecord[];
}

export async function updateCurrentSwings(staffId: string, swings: SwingItem[]) {
  const supabase = getServiceSupabase();
  const current = await getCurrentSwingsRecord(staffId);

  if (!current) {
    throw new AppError("Current swings not found.", 404);
  }

  const { data, error } = await supabase
    .from("swings")
    .update({
      ...swingItemsToColumns(swings),
    })
    .eq("id", current.id)
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .single();

  if (error || !data) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return getStaffWithCurrentSwings(staffId);
}

export async function createNewSwingVersion(staffId: string, swings: SwingItem[]) {
  const supabase = getServiceSupabase();
  const current = await getCurrentSwingsRecord(staffId);

  if (!current) {
    throw new AppError("Current swings not found.", 404);
  }

  const { error: archiveError } = await supabase
    .from("swings")
    .update({ is_current: false })
    .eq("id", current.id);

  if (archiveError) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("swings")
    .insert({
      staff_id: staffId,
      ...swingItemsToColumns(swings),
      is_current: true,
    })
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .single();

  if (insertError || !inserted) {
    await supabase.from("swings").update({ is_current: true }).eq("id", current.id);
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  return getStaffWithCurrentSwings(staffId);
}

export async function searchStaffWithCurrentSwings(
  type: SearchType,
  value: string,
): Promise<StaffWithCurrentSwings[]> {
  const supabase = getServiceSupabase();
  let staffQuery = supabase
    .from("staff")
    .select("id, first_name, last_name, email, campus, area, created_at");

  if (type === "campus") {
    staffQuery = staffQuery.eq("campus", value);
  }

  if (type === "area") {
    staffQuery = staffQuery.eq("area", value);
  }

  if (type === "individual") {
    const term = value.trim();
    staffQuery = staffQuery.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%`,
    );
  }

  const { data: staffRows, error: staffError } = await staffQuery.order("last_name");

  if (staffError) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  if (!staffRows?.length) {
    return [];
  }

  const ids = staffRows.map((staff) => staff.id);
  const { data: swingRows, error: swingsError } = await supabase
    .from("swings")
    .select(
      "id, staff_id, swing_1, swing_2, swing_3, swing_4, swing_5, wins_1, wins_2, wins_3, wins_4, wins_5, created_at, is_current",
    )
    .in("staff_id", ids)
    .eq("is_current", true);

  if (swingsError) {
    throw new AppError("Something went wrong. Please try again or contact Pastor Josh.", 500);
  }

  const swingsByStaffId = new Map<string, SwingRecord>();

  for (const row of (swingRows ?? []) as SwingRecord[]) {
    swingsByStaffId.set(row.staff_id, row);
  }

  return staffRows
    .map((staff) => {
      const swings = swingsByStaffId.get(staff.id);

      if (!swings) {
        return null;
      }

      return {
        staff: staff as StaffRecord,
        swings,
      } satisfies StaffWithCurrentSwings;
    })
    .filter(Boolean) as StaffWithCurrentSwings[];
}
