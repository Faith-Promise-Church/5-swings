import type { SearchType } from "@/lib/types";

export function buildReportLabel(type: SearchType, value: string) {
  const trimmed = value.trim();

  if (type === "campus") {
    return trimmed;
  }

  if (type === "area") {
    return trimmed;
  }

  return trimmed;
}
