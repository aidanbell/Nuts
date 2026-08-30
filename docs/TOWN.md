# Town

Settlement surface: housing, attraction, and (later) everything that isn’t a jobsite. The nav label is **not** “Town” — it uses the current [settlement scale](#settlement-scale).

Tab id: `town`. Config: `src/data/town.ts`. Seasonal state: `game.town`. Knowledge that survives winter: `meta.unlockedTownBuildings`.

---

## Where this is

**Shipped:** tab unlock at the population wall; wooden houses in Wood Age; bonfire after the Stick Poker housing story; scale names from Clearing up through a far-future ladder.

**Not shipped:** durable housing, barns, storage, tavern / hall / library, science lab, trading post, wonders/projects, Nut City as a separate layer. Population tab is still a placeholder — cap and attraction live here.

---

## How you get the tab

Story **No Room Left** (`moreSquirrelsJoin`): season 1+, three squirrels, ~200 nuts. Two more join (cap 5) and Town opens. Season 0 never sees the tab; you’re still in the tutorial trio.

---

## Wooden houses

Wood Age only (`currentEra` at least Wood). Seasonal dens:

| | |
|--|--|
| First cost | 800 nuts + **50 NutWood** |
| Extra houses | ×**2.5** cost each |
| Cap | **3 per season** |
| Effect | **+2** squirrel soft cap each (`getSquirrelCap`) |
| Winter | Count resets to 0. You rebuild if you want the cap again |

This is the first real NutWood sink and the gate for Stick Poker travelers: they refuse to stay without a den. Building ≥1 house after Stick Poker joins two squirrels and teaches the bonfire.

Stone+ housing in notes is **durable** (survives hibernate) and era-skinned. Don’t persist wooden houses to fake that.

---

## Bonfire

Knowledge unlocks from that housing story (`unlockBuildings: ["bonfire"]`). The fire itself is seasonal (`bonfireLevel` 0 each spring).

| | |
|--|--|
| Light | 600 nuts + 20 NutWood → level 1 |
| Tick | ~10% chance every 60s at Lv1 to `createSquirrel` |
| Cap | Rolls fail quietly when the colony is full |
| Upgrades | **Louder Flame** idea (`bonfireUpgrades`) — authored as **Stone Age**, so Wood stays a Lv1 trickle |

Upgrade math is already in `town.ts` (faster interval, higher chance, max level 5) but hidden until that idea is researched in Stone.

---

## Settlement scale

Highest matching row wins (`getSettlementScale`). Early Wood with cap ~11 and max 3 houses will sit on **Clearing** or barely **Village**; later names are the long ladder.

| Label | Min pop | Min houses this season |
|-------|---------|------------------------|
| Clearing | 0 | 0 |
| Village | 10 | 0 |
| Hamlet | 20 | 1 |
| Homestead | 40 | 1 |
| Borough | 80 | 2 |
| Town | 160 | 4 |
| City | 320 | 8 |
| Metropolis | 640 | 16 |
| Megapolis | 1280 | 32 |
| Urban Macropolis | 2560 | 64 |
| Intercontinental System | 5120 | 128 |
| Global System | 10240 | 256 |

---

## What’s to come (from notes)

Town buildings always cost **refined** resources. Production-style town buildings would add staff slots as they level (same spirit as jobsites).

**Constant (era-skinned):** houses; **barn/silo** (nuts survive winter); **storage** (some refined survives winter).

**Production:** research lab (science), beacon (attraction — bonfire is the Wood prototype), refineries/smelters, trading post, golden-nut collectors.

**Amenities:** tavern (productivity), town hall (management/stats), library (see NPS and upgrade math).

**Projects / wonders:** expensive era caps, maybe extra jobsite slots.

Nut City as a named fantasy is the late scale of *this* tab, not a second settlement UI. Notes also say city buildings collapse between eras and must be upgraded — that’s far future.

Until Stone, this tab is **houses + a campfire**.
