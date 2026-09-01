# Nuts wiki

Raw brainstorming lives in [`notes.md`](./notes.md). Do not treat that file as source of truth, and do not edit it as an agent.

## Where we are (2026-09-01)

The game is playable through **Prehistory (two winters)**, a **Wood Age loop**, and into the **Stone Age**.

A season starts with one squirrel in a bare clearing. You forage, research ideas, staff jobsites, and chase a winter trigger. Hibernate wipes nuts, squirrels, seasonal buildings, and seasonal ideas; you keep **Gold Nuts**, structure research, known jobsites (rebuilt at level 0), and durable housing. Gold permanently boosts production.

**Live content:** Gatherer → Scavenger → Stick Poker → Tree Climber → Ground Tiller/Basket Carrier/Branch Beater/Ledge Percher; hand-crafted then staffed NutWood; seasonal wooden houses and durable (Stone+) housing; a bonfire that slowly attracts squirrels (upgradeable from Stone Age); Wood/Stone Age efficiency ideas; a hard cap of 4 active production sites with retire-to-swap from Stone Age on.

**Not in play yet:** Bronze+ jobsites (ideas point at ids with no templates), barns/storage, science, equips.

## Pages

| Page                            | What it covers                                    |
| ------------------------------- | ------------------------------------------------- |
| [PROGRESSION](./PROGRESSION.md) | Seasons, eras, population, story beats            |
| [JOBSITES](./JOBSITES.md)       | Production model, live roster, later-era horizon  |
| [IDEAS](./IDEAS.md)             | Research tree, persistence, effects               |
| [REFINEMENT](./REFINEMENT.md)   | NutWood and future materials                      |
| [TOWN](./TOWN.md)               | Settlement tab, housing, bonfire, later buildings |
| [CONTENT_DX](./CONTENT_DX.md)   | How to add eras, sites, and ideas                 |

Engine code lives under `src/engine/` (store, loop, effects) and `src/data/` (catalogs).
