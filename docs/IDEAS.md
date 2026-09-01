# Ideas

The research / tech tree. Spend nuts (and NutWood) to unlock jobsites, tabs, eras, and seasonal buffs.

Catalog: `src/data/ideas.ts`. Prefer factories in `src/data/defineIdea.ts`. Research spends resources, calls `researchIdea`, then `processEffects`.

---

## Where this is

**Shipped:** Prehistory foraging chain, Division of Labor → Gatherer, post-winter Scavenger and NutWood Craft, The Wood Age as an era idea, Wood production unlocks, seasonal Wood efficiency, late-Wood Refinery idea, and now **The Stone Age** as an era idea (5 hibernations + NutWood Refinery researched) unlocking the Stone catalog — Stone Tooling, Advanced Stone Tools, Stone Age Mastery, Organization Basics, and Louder Flame (Bonfire upgrades). Catalog visibility is **era + prereq ideas**, not a nut drip.

**Stub / unwired:** Bronze+ entries unlocking missing jobsite ids. Effect types `unlockSquirrelCapacity` and `reduceJobsiteCost` display on the card but do nothing (Organization Basics' capacity effect is a known no-op).

---

## How the catalog works

An idea is **visible** when its `era` is at or before `story.currentEra` **and** every `requirements.ideasResearched` id is already researched (`refreshIdeaCatalog`).

It is **buyable** when visible, unaffordable-check passes, and extra gates pass: `era`, `maxEraAvailable` (meta may enter that era), `minHibernations`, nut/squirrel counts, etc.

Two factories encode the persistence split:

| Factory | Category | Winter |
|---------|----------|--------|
| `unlockIdea` | `unlock` | **Persists** — id stored on `meta.structureIdeas`, marked researched again each spring |
| `efficiencyIdea` | `efficiency` | **Wipes** — you buy it again next year |

Other categories (`capacity`, `automation`, `meta`, `production`) exist on older Stone+ rows; new content should use the two factories unless you have a real reason not to.

On hibernate, all ideas reset from template, then structure ids are restored **without re-running most effects**. `restoreStructureKnowledge` re-unlocks known jobsites at level 0 and re-applies `setEra` / `unlockFeature` only. Seasonal `globalEfficiency` and jobless upgrades do **not** come back.

---

## Effects that actually apply

Via `processEffects` (ideas and stories):

| Effect | Result |
|--------|--------|
| `unlockJobsites` | Clone templates into the run; open Jobsites tab; remember ids on meta |
| `unlockRefinement` | Same for refinement ids + open Refinement tab |
| `unlockFeature` | Open that tab id (e.g. `"refinement"`) |
| `unlockTabs` | Open tabs |
| `unlockBuildings` | Remember town building ids (bonfire, upgrade flag) |
| `unlockSquirrels` | `createSquirrel` up to cap |
| `setEra` | `story.currentEra` — refreshes catalog |
| `nutReward` | Instant nuts |

Via `researchIdea` only (seasonal numbers on the run):

| Effect | Result |
|--------|--------|
| `upgradeJobsite` | Jobless: `value` / `chance` / `time` (subtract) / `multi`. Production/refinement: `multi` only |
| `globalEfficiency` | Adds to `multi` on jobless + all current production and refinement sites |
| `increaseGatherMulti` / `increaseGetButton` | Get-button stats (barely used by live ideas) |

**Defined, not applied:** `unlockSquirrelCapacity`, `reduceJobsiteCost`. Population cap is houses + meta constants; jobsite costs are template growth only.

---

## Live catalog (Prehistory → Wood)

**Prehistory (always in the first catalog):**

1. **Nut Recognition** — jobless +value  
2. **Efficient Gathering** — jobless +chance  
3. **Keen Nose** — jobless faster  
4. **Territorial Awareness** — jobless +multi (hand-written, not the efficiency factory — still seasonal)  
5. **Division of Labor** — unlocks Gatherer  

**After first winter** (`maxEraAvailable` ≥ Wood Age):

- **Scavenger Routes** — second site  
- **NutWood Craft** — Refinement tab (hand craft)  
- **The Wood Age** — needs NutWood Craft researched, **2 hibernations**, 25 NutWood. `setEra: WOOD_AGE`

**Wood Age catalog** (after you enter the era):

- **Stick Poker** → **Climbing Techniques** (Tree Climber)  
- **Braced Tools**, **Canopy Paths** (after Climber), **Wood Age Mastery** (after Poker + Braced Tools) — seasonal efficiency  
- **NutWood Refinery** — after Climber + Mastery; staffed automation  
- **The Stone Age** — after NutWood Refinery, 5 hibernations, 25,000 nuts + 150 NutWood. `setEra: STONE_AGE`

**Stone Age catalog** (after you enter the era):

- **Stone Tooling** → **Advanced Stone Tools** — unlock the four Stone jobsites (hard-capped at 4 active)  
- **Stone Age Mastery** — seasonal efficiency (after Wood Age Mastery)  
- **Organization Basics** — capacity effect is a known no-op  
- **Louder Flame** — Bonfire upgrades (needs Stick Poker; visible once era flips)

UI: Ideas tab groups by era; cards show cost, effect summary, researched vs available.

---

## What’s to come

- Real jobsite templates + a **Bronze Age** era idea, following the Stone pattern.
- Wire or delete `unlockSquirrelCapacity` / `reduceJobsiteCost`.
- Hide or rewrite Bronze+ rows until those jobsites exist (`farmer`, etc. have no templates — researching them would no-op the unlock).
- Science / Research Resin from notes is a later currency, not ideas-as-they-are.
- A visual tree is a nicety; the grouped list is enough.
