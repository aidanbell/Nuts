# Progression

How a run is supposed to feel: **long seasons**, a winter wipe that matters, and a new unlockable each year so Wood Age isn’t the same grind twice.

Numbers below are current tuning, not sacred. Design intent is the pacing.

See also: [Jobsites](./JOBSITES.md) · [Ideas](./IDEAS.md) · [Town](./TOWN.md) · [Refinement](./REFINEMENT.md)

---

## Where this is

**Shipped:** Prehistory (two winters) and a Wood Age catalog you can actually enter. Hibernate, Gold Nuts, population caps, Town, and the Stick Poker → house → bonfire story are all in the engine.

**Next depth:** make each Wood winter feel distinct (more seasonal ideas / NutWood sinks), then a real Stone Age gate — era idea, hard roster of four, retire to swap sites.

---

## The season loop

You always wake **alone**. The clearing, nuts, jobsite levels, wooden houses, and the bonfire are gone. What survives is colony *knowledge*:

| Persists (meta) | Wipes (run / season) |
|-----------------|----------------------|
| Gold Nuts and the forage/production multi they grant | Nuts, refined materials, squirrels |
| Structure ideas (`persists: true`) | Efficiency ideas |
| Known jobsite ids (rebuild at level 0, unstaffed) | Jobsite levels, workers, costs-as-upgraded |
| Known town buildings (e.g. you remember how to light a bonfire) | Houses, bonfire level |
| Tabs except Hibernate | Hibernate tab, seasonal UI state |
| `maxEraAvailable` (which era you’re allowed to enter) | Current era resets to Prehistory, then structure ideas re-apply `setEra` |

Gold reward on hibernate is `floor(sqrt(nuts this season) × goldNuts.multi × 2)`, at least 1. Banked Gold adds **+2% production per Gold Nut** (`goldForageMulti`). Pushing farther each year is the prestige loop.

Winter is **story-gated**, not a clock. The Hibernate tab appears when a winter beat fires (Gatherer maxed in season 0; first NutWood in season 1). You can linger for more nuts/Gold, but the den still dies.

After two hibernations, spring story is console-only instead of a modal.

### Design locks

- **Scavenger** is its own idea after Division of Labor — not bundled with DoL.
- **Stick Poker before Tree Climber.**
- **Prehistory lasts ~2 winters** (Gatherer wall, then first NutWood).
- **Wood Age lasts ~2–4/5 winters** before Stone is in play.
- **New jobsites always come from an `unlock` idea.**
- Settlement nav uses the [Town](./TOWN.md) scale name (Clearing → Village → …), not a fixed “Town” label.
- Early housing is **cheap wood that dies in winter**. Durable housing is Stone+.

---

## Population

Soft cap, not a hard sim. `createSquirrel` refuses past `getSquirrelCap()`.

| When | Cap | How they arrive |
|------|-----|-----------------|
| Season 0 | **3** | You + two story friends |
| Season 1+ (no houses) | **5** | Two companions return early; two more at ~200 nuts (this is also the **Town tab** unlock) |
| Wood Age houses | **+2 per house** | Up to 3 wooden houses / season — extra cap **this season only** |
| Stick Poker travelers | — | Story: two wait for a house; building one lets them join and teaches the bonfire |
| Bonfire | — | Slow RNG join while lit, if there’s free cap |

The Population tab is a stub. Housing and attraction live on Town. Later eras (notes) want era-specific recruit rates and a “no more locals — grow the colony yourselves” beat once five squirrels fill the early roles.

`unlockSquirrelCapacity` on Stone+ ideas is **not wired** — cap is houses + the constants above.

---

## Prehistory (~2 winters)

You start jobless: click forage plus idle squirrels rolling RNG. Ideas teach better foraging, then **Division of Labor** unlocks **Gatherer** only.

| Beat | Season | What happens |
|------|--------|----------------|
| Ideas tab | 0 | Story around 25 nuts / 2 squirrels |
| Foraging ideas | 0 | Value, chance, speed, multi on the jobless site — **seasonal** |
| Division of Labor | 0 | Unlocks Gatherer (~500 nuts) |
| First winter | 0 | Gatherer hits level 10 → Hibernate tab |
| Scavenger Routes | 1+ | After first winter (`maxEraAvailable` becomes Wood Age). Second production site |
| NutWood Craft | 1+ | Opens Refinement; **hand craft only** (100 nuts → 1 NutWood) |
| Second winter | 1 | First NutWood crafted → Hibernate again |
| The Wood Age | 2+ | 25 NutWood + 2 winters. Sets era to Wood Age and opens that catalog |

NutWood **does not** survive winter. Season 1 teaches the craft; season 2 is when you actually bind a stockpile in one run.

Wood Age is *available* after the first winter (`maxEraAvailable`), but **The Wood Age** idea also requires `minHibernations: 2`.

---

## Wood Age (~2–4/5 winters)

Goal: each season a **new unlockable**, plus Gold NPS climbing from last year. Sites come back at level 0 — you rebuild, optionally raise a house, chase this year’s idea, then hibernate richer.

| Unlock | Typical timing | What it does | Persists? |
|--------|----------------|--------------|-----------|
| The Wood Age | After 2nd winter | Era + Wood catalog | Yes |
| Stick Poker | Early Wood | 3rd production site | Yes |
| Climbing Techniques | After Stick Poker | 4th site (air) | Yes |
| Wooden house | Wood, Town | +2 cap / house; steep NutWood curve | **No** (rebuild) |
| Stick Poker travelers | After Stick Poker | Two want a den | Story |
| First house after Poker | ≥1 house | Those two join; unlocks **Bonfire** knowledge | Knowledge yes; fire no |
| Bonfire | After that story | Slow attraction at Lv1 | Rebuild each spring |
| Braced Tools / Canopy Paths / Wood Age Mastery | Wood seasons | Global efficiency this season | **No** |
| NutWood Refinery | Late Wood (after Climber + Mastery) | Staffed auto-craft | Yes (site knowledge) |
| Louder Flame | **Stone Age** catalog | Reveals Bonfire upgrades | Yes (idea exists; era-gated) |

Seasonal target: wake → rebuild sites + optional house → this season’s unlock → push NPS → hibernate with more Gold than last year.

**Not built yet for Wood:** extra per-winter unique ideas beyond the three efficiency cards; more NutWood sinks (site upgrades already spend nuts, houses spend wood). Stone tease / locked “you can see it but not buy it” idea.

---

## Stone Age and later

Deferred as **playable content**. Templates for the Stone quartet exist in `jobsites.ts` but nothing designed should *unlock* them yet.

Intended Stone beat:

- An era idea (huge cost, after Wood feels long) opens the Stone catalog and a **hard cap of 4** active production sites — bringing a fifth online means **retiring** one.
- Sites: Ground Tiller, Basket Carrier, Branch Beater, Ledge Percher.
- Durable housing that survives winter; Louder Flame (already authored as a Stone-era idea) lets the bonfire upgrade past the Wood trickle.

There is a leftover **stoneAgeChoice** story (3000 nuts + 40 total jobsite levels) that can jump era via a modal. That is not the intended gate. Bronze / Iron / later stories and ideas in the catalog are placeholders.

Later eras stay a name list and a jobsite horizon until Wood (then Stone) feel deep. See [Jobsites](./JOBSITES.md).

---

## Story

Checkpoints in `src/data/storyCheckpoints.ts` fire from triggers (OR) plus requirements (AND), with optional `minSeason` / `maxSeason`. Effects go through `effectProcessor` (squirrels, tabs, buildings, nuts, era).

Early-life tutorial ids are skipped after the first hibernate. `building_built` conditions always fail — Nut City buildings aren’t a system yet.

For the authored beat list, read the checkpoint file; this page is the intended *pacing*, not a dump of every modal.
