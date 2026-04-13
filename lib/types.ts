import type { AREAS, CAMPUSES } from "@/lib/constants";

export type Language = "en" | "es";
export type Campus = (typeof CAMPUSES)[number];
export type Area = (typeof AREAS)[number];

export type SwingItem = {
  category: string;
  wins: string[];
};

export type StaffRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  campus: Campus;
  area: Area;
  created_at: string;
};

export type StaffAuthRecord = StaffRecord & {
  pin_hash: string;
};

export type SwingRecord = {
  id: string;
  staff_id: string;
  swing_1: string;
  swing_2: string;
  swing_3: string;
  swing_4: string;
  swing_5: string;
  wins_1: string[] | null;
  wins_2: string[] | null;
  wins_3: string[] | null;
  wins_4: string[] | null;
  wins_5: string[] | null;
  created_at: string;
  is_current: boolean;
};

export type StaffWithCurrentSwings = {
  staff: StaffRecord;
  swings: SwingRecord;
};

export type SearchType = "campus" | "area" | "individual";

export type SearchResultPerson = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  campus: Campus;
  area: Area;
  createdAt: string;
  swingsId: string;
  swingsCreatedAt: string;
  isCurrent: boolean;
  swings: SwingItem[];
};

export type VerifyResponse = {
  staffId: string;
  firstName: string;
  lastName: string;
};

export type SaveSwingsResponse = {
  staffId: string;
  swingsId: string;
  firstName: string;
  lastName: string;
  email: string;
  campus: Campus;
  area: Area;
  swings: SwingItem[];
};
