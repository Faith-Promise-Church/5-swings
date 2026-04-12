import { SWING_COUNT } from "@/lib/constants";
import type {
  SaveSwingsResponse,
  SearchResultPerson,
  StaffWithCurrentSwings,
  SwingItem,
  SwingRecord,
} from "@/lib/types";

function normalizeWins(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function createEmptySwingItems(): SwingItem[] {
  return Array.from({ length: SWING_COUNT }, () => ({
    category: "",
    wins: [],
  }));
}

export function recordToSwingItems(record: SwingRecord): SwingItem[] {
  return Array.from({ length: SWING_COUNT }, (_, index) => {
    const position = index + 1 as 1 | 2 | 3 | 4 | 5;
    const category = record[`swing_${position}`];
    const wins = normalizeWins(record[`wins_${position}`]);

    return {
      category,
      wins,
    };
  });
}

export function swingItemsToColumns(swings: SwingItem[]) {
  return swings.reduce<Record<string, string | string[] | null>>((acc, swing, index) => {
    const position = index + 1;
    const wins = swing.wins.map((entry) => entry.trim()).filter(Boolean);

    acc[`swing_${position}`] = swing.category.trim();
    acc[`wins_${position}`] = wins.length ? wins : null;

    return acc;
  }, {});
}

export function toSaveResponse({
  staff,
  swings,
}: StaffWithCurrentSwings): SaveSwingsResponse {
  return {
    staffId: staff.id,
    swingsId: swings.id,
    firstName: staff.first_name,
    lastName: staff.last_name,
    email: staff.email,
    campus: staff.campus,
    area: staff.area,
    swings: recordToSwingItems(swings).map((item) => ({
      category: item.category,
      wins: item.wins.filter(Boolean),
    })),
  };
}

export function toSearchResultPerson({
  staff,
  swings,
}: StaffWithCurrentSwings): SearchResultPerson {
  return {
    id: staff.id,
    firstName: staff.first_name,
    lastName: staff.last_name,
    email: staff.email,
    campus: staff.campus,
    area: staff.area,
    createdAt: staff.created_at,
    swingsId: swings.id,
    swingsCreatedAt: swings.created_at,
    isCurrent: swings.is_current,
    swings: recordToSwingItems(swings).map((item) => ({
      category: item.category,
      wins: item.wins.filter(Boolean),
    })),
  };
}
