# Refinement

Turning nuts (and later other inputs) into **building materials**. Town and era ideas spend these; production jobsites still run on nuts.

State bucket: `game.resources` (`nutwood`, `stone`, `bronze`, `iron`). The header shows a resource once its count is > 0.

---

## Where this is

**Shipped:** NutWood only. Hand craft from the Refinement tab after **NutWood Craft**. Automated **NutWood Refinery** is a late-Wood unlock idea (staffed cycles). First NutWood fires story and, in season 1, the second winter.

**Not shipped:** stone / bronze / iron as produced materials — note Stone **Age** (the era) is now shipped, but stone the **material** is not; durable housing spends nuts + NutWood only. No spend sinks beyond houses / Wood+Stone ideas / the refinery itself, and no refinement as a Town “industry sector.” All four resource keys exist so the UI doesn’t have to change later.

**Important:** refined resources **wipe on hibernate** with the rest of the run. You cannot bank NutWood across winters. Season 1 teaches the recipe; season 2+ is when you craft a Wood Age stockpile in one go.

---

## NutWood

**Recipe:** 100 nuts → 1 NutWood.

### Hand craft

**NutWood Craft** (`unlockFeature: "refinement"`) opens the tab. `craftRefinement` spends against the **template**, not an owned building — you can mash craft without a refinery instance. That’s the intended early loop: discover → grind by hand → later automate.

### Automated refinery

**NutWood Refinery** idea (`unlockRefinement: ["nutwoodRefinement"]`) places a refinement jobsite. Same consume/produce as hand craft; **30s cycle per worker**, needs the site **built (level ≥ 1)** and staffed. Refinement sites are not part of the production roster cap.

Unlock is gated on Tree Climber + Wood Age Mastery so automation sits near the end of Wood, as a step toward Stone industry.

---

## Spend sinks (today)

| Sink | Role |
|------|------|
| The Wood Age idea | 25 NutWood (plus nuts) to change era |
| Stick Poker / Climber / efficiency / Refinery ideas | Mixed NutWood costs |
| Wooden houses | 50 NutWood for the first, ×2.5 each extra this season |
| Bonfire | 20 NutWood to light; upgrades later (Stone idea) |

More Wood-age sinks (site-related wood costs, extra seasonal ideas) keep hand craft relevant before the refinery.

---

## What’s to come

Notes map materials to later ages (cement, metals, fuels, processors, rocket parts, nut matter). Treat that as flavor until Stone has a real loop.

Order that matches current design:

1. Keep NutWood feeling scarce through Wood winters (houses + ideas).
2. Staffed refinery as the late-Wood industrial tease.
3. **Second material (stone)** — durable housing and the Stone era idea shipped without it (nuts + NutWood only); a stone jobsite/refinery chain is the natural next step now that Stone Age is live.
4. Town refineries / smelters as settlement industry, not only a Jobsites row.
5. Storage buildings so *some* refined goods survive winter (today: none do). Barns would do the same for nuts.

`unlockRefinement` in the effect processor already unlocks the jobsite + tab; new materials are new templates + an unlock idea, not a new effect type.
