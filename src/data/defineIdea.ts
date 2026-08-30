/**
 * Idea factories — prefer these when adding content so defaults stay consistent.
 *
 * Conventions:
 * - `unlockIdea` → one-and-done structure (jobsites, tabs, eras); always persists
 * - `efficiencyIdea` → seasonal buffs; wipe on hibernate
 * - Visibility: era catalog + `requirements.ideasResearched` (see refreshIdeaCatalog)
 * - New jobsites: unlock idea with `effects.unlockJobsites: [id]`
 */
import type { Idea, IdeaCost, IdeaEffect, IdeaEra } from "../types/ideas";

type IdeaBase = {
  id: string;
  name: string;
  description: string;
  era: IdeaEra;
  cost: IdeaCost;
  effects: IdeaEffect;
  requirements?: Idea["requirements"];
  visible?: boolean;
};

export function unlockIdea(def: IdeaBase): Idea {
  return {
    ...def,
    category: "unlock",
    persists: true,
    researched: false,
    visible: def.visible ?? false,
  };
}

export function efficiencyIdea(def: IdeaBase): Idea {
  return {
    ...def,
    category: "efficiency",
    researched: false,
    visible: def.visible ?? false,
  };
}
