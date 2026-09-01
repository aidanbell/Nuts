# Jobsites

Staffed production (and later, staffed refinement). New sites are always granted by an **`unlock` idea**, never by buying a building on the Jobsites tab.

Catalog: `src/data/jobsites.ts`. Runtime instances live on `game.jobSites.production` / `.refinement`.

---

## Where this is

**Shipped:** four production sites through Wood Age, plus a NutWood refinery template used for both hand craft and (once unlocked) automation. Sites start **unbuilt (level 0)** — first purchase Builds; you cannot staff or produce until level ≥ 1. The Stone quartet (Ground Tiller, Basket Carrier, Branch Beater, Ledge Percher) is now reachable via **The Stone Age** era idea, with a hard cap of 4 active production sites enforced in code (`PRODUCTION_ROSTER_CAP` in `jobsites.ts`) and a `retireJobsite` action to swap sites.

**Not shipped:** Bronze+ have ideas pointing at ids with **no templates**.

---

## How production works

Unemployed squirrels use the **jobless** site (RNG forage: `time`, `chance`, `value`, `multi`). Assigned squirrels use a production site.

Passive rate per built production site:

```
(baseProduction + squirrelBonus × workers) × multi × goldForageMulti
```

- Each upgrade: ×1.05 on `baseProduction` and `squirrelBonus`; cost becomes `baseCost × costGrowthRate^level`.
- Every 5 levels: +1 `maxSquirrels`.
- Optional `maxLevel` (Gatherer/Scavenger 10 — first winter uses Gatherer 10).
- Gold Nuts from hibernation apply as `goldForageMulti` on jobless forage and production (not a separate NPS currency).

Refinement sites use **cycles** (see [Refinement](./REFINEMENT.md)). They do **not** count toward a future production roster cap.

`method` (`ground` / `air` / later `space`) is flavor for now — no mechanic branches on it yet.

---

## Roster philosophy

| Phase | Eras | Intent |
|-------|------|--------|
| Soft | Prehistory → Wood | 2 sites, then 4. All may coexist. Enforced by which unlock ideas exist, not by a retire UI. |
| Hard | Stone+ | **4 active**, enforced. Unlocking another means retiring one that’s online (`retireJobsite`). |
| Later | Buildings / wonders | Raise how many can be active at once. |

---

## Live roster

| Era | Name | id | Method | maxLevel | baseCost | growth | baseProd | squirrelBonus | Unlock idea |
|-----|------|----|--------|----------|----------|--------|----------|---------------|-------------|
| Prehistory | Gatherer | `gatherer` | ground | 10 | 120 | 1.18 | 0.4 | 2.2 | Division of Labor |
| Prehistory | Scavenger | `scavenger` | ground | 10 | 200 | 1.25 | 0.55 | 2.8 | Scavenger Routes (after 1st winter) |
| Wood Age | Stick Poker | `stickPoker` | ground | 12 | 350 | 1.22 | 0.7 | 3.5 | Stick Poker |
| Wood Age | Tree Climber | `treeClimber` | air | 12 | 500 | 1.2 | 0.9 | 4.6 | Climbing Techniques |
| Wood Age | NutWood Refinery | `nutwoodRefinement` | refinement | — | 100 | 1.15 | — | — | NutWood Refinery (late Wood); cycles 100 nuts → 1 NutWood / 30s / worker |
| Stone Age | Ground Tiller | `groundTiller` | ground | 15 | 100 | 1.15 | 1.2 | 5.5 | Stone Tooling |
| Stone Age | Basket Carrier | `basketCarrier` | ground | 15 | 150 | 1.15 | 1.5 | 7.0 | Stone Tooling |
| Stone Age | Branch Beater | `branchBeater` | ground | 15 | 225 | 1.15 | 1.9 | 9.0 | Advanced Stone Tools |
| Stone Age | Ledge Percher | `ledgePercher` | air | 15 | 325 | 1.15 | 2.4 | 11.5 | Advanced Stone Tools |

---

## Horizon (not in game)

Names and upgrade *flavor* from notes. Focus is the planned identity of that tier’s upgrades (`+val` / `−time` / `+multi`) — not implemented as a separate upgrade layer yet. Equips / shiny rocks in notes would eventually feed those stats.

| Era | Sites (method) | Focus |
|-----|----------------|-------|
| Bronze | Farmer, Gathering Party, Tree Thumper (ground); Stilt Walker (air) | +val |
| Iron | Crop Tender, Floor Rakers, Tree Shaker (ground); Tree Lifts (air) | +val |
| Industrial | Agriculturalist, Vacuum Tractor, Nut Factory (ground); Tree Nets (air) | +val / −time |
| Information | Hydroponics, Nut Trackers, Nut Complex (ground); Nut Funneling System (air) | +val / −time |
| Technology | Auto Gardens, RC Nut Delivery, Nut Lab (ground); Nut Chutes (air) | +val / −time / +multi |
| Space | Orbiting Farm (space), Nut Routing / Synthesizer (ground); Nut Drones (air) | +val / −time / +multi |
| Galactic | HoloFarms, TeleNuts, Nut Wormholes (space); The Nut (?) | +val / −time / +multi |

Bronze is next: write real jobsite templates for `farmer`, `gatheringParty`, `treeThumper`, `stiltWalker`, then wire them through unlock ideas the same way Stone was. Do not drip Bronze ids until those templates exist.

Pacing and which winter each Wood site should land: [Progression](./PROGRESSION.md). Authoring: [Content DX](./CONTENT_DX.md).
