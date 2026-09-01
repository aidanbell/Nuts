# Content DX

How to add eras, jobsites, and ideas without fighting the engine. Design pacing lives in [Progression](./PROGRESSION.md); numbers for sites in [Jobsites](./JOBSITES.md).

---

## Mental model

| Layer | Lives in | Winter |
|-------|----------|--------|
| Run | `GameState` — nuts, squirrels, site levels, `town`, resources | Wipes |
| Legacy | `MetaState` — Gold, structure idea ids, known jobsite/building ids, tabs, `maxEraAvailable` | Keeps |
| Catalogs | `src/data/*` templates | Re-cloned each spring |

Unlock **knowledge** on meta; rebuild **instances** at level 0 in `restoreStructureKnowledge`. Efficiency numbers are run-only.

---

## Files

| File | Role |
|------|------|
| `src/data/eras.ts` | `ERA_ORDER`, `eraIndex`, name formatting |
| `src/data/jobsites.ts` | Templates + `getJobsiteTemplate(id)` |
| `src/data/defineIdea.ts` | `unlockIdea` / `efficiencyIdea` |
| `src/data/ideas.ts` | Catalog |
| `src/data/town.ts` | Houses, bonfire, settlement scales |
| `src/data/storyCheckpoints.ts` | Narrative gates (tabs, squirrels, winter) |
| `src/engine/effectProcessor.ts` | Shared effects from ideas **and** stories |
| `src/types/ideas.ts` | `IdeaEra`, effect shapes, requirement fields |

---

## Add a jobsite

Append a template in `jobsites.ts` (`production` or `refinement`). Add an `unlockIdea` with `effects.unlockJobsites: ["yourId"]` (or `unlockRefinement` for a staffed crafter). Set `era` and `requirements.ideasResearched` so it appears in order — visibility is catalog + prereqs, not nut drip.

Sites spawn at **level 0**. First purchase is “Build.” Refinement sites are excluded from a future production roster cap; don’t use them to sneak around Stone’s hard 4.

Document live numbers on [Jobsites](./JOBSITES.md).

---

## Add an idea

Use the factories so persistence stays consistent:

- **Structure** (sites, tabs, eras, town knowledge) → `unlockIdea` → always `persists`.
- **Seasonal buffs** → `efficiencyIdea` → wiped on hibernate.

Gates that are easy to get wrong:

- `maxEraAvailable` — meta may enter that era (e.g. Scavenger after first winter).
- `minHibernations` — completed winters (e.g. The Wood Age after two).
- `ideasResearched` — also hides the card until prereqs are done.

Costs may include `nutwood` / `stone` / `bronze`. Only effects listed in [Ideas](./IDEAS.md) actually run; don’t add `unlockSquirrelCapacity` expecting the cap to move.

After research, `refreshIdeaCatalog` runs so the next card can appear.

---

## Add an era

1. Append `ERA_ORDER` and the `IdeaEra` union.
2. Add an `unlockIdea` with `effects.setEra` on the **previous** era’s catalog (see The Wood Age).
3. Gate it with `maxEraAvailable` and/or `minHibernations` if winters must happen first.
4. On hibernate, bump `meta.maxEraAvailable` when that era should become *reachable* (Wood is set after the first winter in `hibernate` today). Entering the era is still the idea.

Do not unlock the next era’s jobsites from a story choice unless that *is* the gate — Stone Age now follows this recipe (`stoneAge` idea in `ideas.ts`, `setEra: STONE_AGE`); use it as the template for Bronze.

---

## Town and story

Town buildings: put numbers in `town.ts`, grant knowledge with `unlockBuildings: ["id"]`, keep seasonal instance state on `game.town`. Nav label is `getSettlementScale` — add rows there if you introduce a new size name.

Story checkpoints: `triggers` are OR, `requirements` are AND, `minSeason` / `maxSeason` use `meta.seasonIndex`. Winter beats should `unlockTabs: ["hibernate"]`. Tutorial ids listed in `TUTORIAL_CHECKPOINT_IDS` are auto-completed after the first wipe.

`building_built` conditions are stubs (always false) until a real building-construction system exists.

---

## Town / housing specifics

- Tab id `town`; `game.town.woodenHouses` and `bonfireLevel` reset in `createFreshGameState`.
- Cap: `getSquirrelCap()` = season base (3 or 5) + houses × `WOODEN_HOUSE.capBonus`.
- Houses require Wood Age as **current** era, not merely `maxEraAvailable`.
