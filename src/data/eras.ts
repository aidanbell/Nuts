/**
 * Era ordering — single source for gating, catalogs, and progression.
 * Add new eras here first when expanding the timeline.
 */
import type { IdeaEra } from "../types/ideas";

export const ERA_ORDER: readonly IdeaEra[] = [
  "PREHISTORY",
  "WOOD_AGE",
  "STONE_AGE",
  "BRONZE_AGE",
  "IRON_AGE",
  "INDUSTRIAL_AGE",
  "INFORMATION_AGE",
  "TECHNOLOGY_AGE",
  "SPACE_AGE",
  "GALACTIC_AGE",
] as const;

export function eraIndex(era: string | null | undefined): number {
  const idx = ERA_ORDER.indexOf((era as IdeaEra) || "PREHISTORY");
  return idx < 0 ? 0 : idx;
}

/** True if `era` is at or before `maxAvailable`. */
export function eraAtMost(
  era: string | null | undefined,
  maxAvailable: IdeaEra,
): boolean {
  return eraIndex(era) <= eraIndex(maxAvailable);
}

export function formatEraName(era: string | null | undefined): string {
  return (era || "PREHISTORY").replace(/_/g, " ");
}
