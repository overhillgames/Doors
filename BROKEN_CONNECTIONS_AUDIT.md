# Doors to Netherwhere — Broken Connections Audit
*Generated 2026-05-06. Cross-references every switch, variable, common event, and map transfer in the project against the System.json registry.*

---

## TIER 1 — Logic dead-ends (will silently fail in playtest)

These are switches/variables that one side of the wiring is missing for. Code will execute but the gate will never open.

### A. Quest gates that will NEVER open (checked but never set)
- **Switch #30 `TwoStonesQuest`** — Heavy Ass Boulder events on Map003 and Map026 use it as a page condition, but nothing turns it ON. Boulder page 2 cannot activate.
- **Switch #48 `RangBlessStarRealm`** — Gates Joyo on Map005 and the Star Realm Guardian on Map007/Map028. Nothing turns it ON. The Star Realm path is unreachable.
- **Switch #90 `BergTellsOfAstrucious`** — Astrucious Book scene on Map016 page 2 uses it as a page condition; no setter anywhere.
- **Var #19 `DeliveredBoulders`** — Checked by Boulder1/Boulder2 page conditions on Map004 (Temple). Never assigned a value. (Likely intended to count up via #27 `DeliverBoulderNow` and #20 `RemainingBouldersNeeded`, both of which have **zero** references.)
- **Var #32 `SagesVar`** — Checked by Father Rangala on Map004. Never set.

### B. Flags raised that nothing listens to (set but never checked)
These were probably meant to drive consequences (NPC dialog branches, scene unlocks) that haven't been wired yet.

- Quest milestone flags: `AsterArrows`, `FalconQuest`, `StarRealmBegins(Joyo)`, `TravelerAgilPotion`, `RangalaMekStart`, `IvroTellsSecretRoom`, `GwynGaveArrows`, `AwareWelkinHasKey`, `VipiNoJoin`, `VipiAnsweredArrows`, `KovShardAcquired`, `HasBombs`, `PlayerHasKovKey`, `TimesUpHandled`, `SageRiddleRead`, `SagesFail`.
- Var #25 `GwynShieldTimer` set once on Map002, never read.
- Var #91 `RiddleScriptInput` set 3x but never read.

### C. The "Alive" roster system is half-built
Common Event #60 (`- Enemy Attacks/Boss Check -`) sets all 12 character `Alive` switches (#117–128) — but **none of those switches are ever checked anywhere else**. Whatever consequence was intended (game-over trigger, party reformation, narrative branch) is missing.

Sub-issue: `NorinAlive` (#117) exists, but there is no base `Norin` character switch in the #1–11 actor block. Either Norin is referenced under a different name (the only related switch is `NorinArmorVisual`) or the alive entry is a leftover.

### D. Party-manager bookkeeping is broken
The recruit-then-organize phase relies on `party1on/2on/3on` and `party1lock/2lock/3lock`, but:
- `party1on` (#82): **0 references** — never set, never checked.
- `party2on` (#83), `party3on` (#84): set in 3 places (Map003, Map018, Map026) but **never checked**.
- `party1lock` (#85), `party2lock` (#86), `party3lock` (#87): **0 references** total.

Whatever flow was supposed to lock or reveal parties is currently a no-op.

---

## TIER 2 — Orphaned references to deleted entries

Events still point to switch/variable IDs whose names have been wiped. The IDs work mechanically, but you have no label to debug them later.

### Unnamed switches still being SET
- **Switch #108** — set in CE21 (`=== Battle Events ===`)
- **Switch #109** — set in CE21
- **Switch #110** — set in CE21 and CE103 (`Calm Down`)
- **Switch #111** — set in CE21 and CE103

### Unnamed variables still being SET and CHECKED
- **Var #103** — 12 references across CE24 (`Arrow Attack`), CE28, CE52 (`Knife Animation`), CE59, CE63, CE67. Still functional but completely unlabeled.
- **Var #120** — 4 references in CE103 (`Calm Down`) and Troop16 (`Boss Battle`).

**Action:** open each of these common events, decide whether the switch/var is still needed, and either rename it in System.json or delete the references.

---

## TIER 3 — Duplicate maps (prototype/redesign drift)

You have three pairs of identically-named maps. These are almost certainly your prototype + your redesign-in-progress, and you'll want to choose one source of truth before any new wiring locks in.

| Name | Old (?) | New (?) | Notes |
|---|---|---|---|
| Mountain Defense Pass | Map003 (16 events, 40x26) | Map026 (15 events, 40x26) | Both contain `KovShardAcquired` setter and party2on/3on setter — wired in parallel. |
| Netherwhere Cavern | Map007 (26 events) | Map028 (26 events) | Both have `Star Realm Guardian` page-condition on `RangBlessStarRealm` (which is never set). |
| Mekinations | Map012 | Map021 | (no event-level breaks detected, but worth confirming.) |

**Action:** decide which of each pair is canonical, point all transfers there, and either delete or visibly rename the other (e.g., `OLD_Mountain Defense Pass`) to make divergence obvious in the editor.

---

## TIER 4 — Unused entries (likely abandoned or reserved)

Safe to delete — or rename so you remember what they were for.

**Switches with 0 references:** `TroopSpawnConfirmed` (#17), `WizSpawned?` (#27), `VipiDeclines2Join` (#67), `mekgearpos1/2/3` (#69–71), `CliveInParty` (#72), `DoorArcaneOpenIdle` (#77), `AnimalFleeHappened` (#78), `SageHintGiven` (#94).

**Variables with 0 references:** `SpawnEventSpin` (#13), `SpawnEventX/Y` (#14–15), `RemainingBouldersNeeded` (#20), `DeliverBoulderNow` (#27), `LightningWaitVar` (#29), `TroopsBoss` (#85), all of Thiago's #100–104 block (`PartySize`, `Member#1–4`, `SpecialInteraction`).

Note: `TroopsBoss` being unused while `TroopsEasy/Medium/Hard` are used is a smell — confirm boss spawning isn't supposed to read it.

---

## TIER 5 — Sanity checks worth eyeballing manually

- **`TimeVar` (#21)** is set 115 times but only checked 6 times. That's normal for an incrementing clock, but verify with Shane that the 6 check sites are all the gates the new design intends (Time's Up, scheduled scenes, etc.).
- **`Time'sUp!` (#88)** is checked 5x but `TimesUpHandled` (#89) is never checked. If the redesign keeps the "lockout repeat handling" pattern, you'll need a checker for #89.
- **`PartyCount` (#17)** vs **`PartySize` (#105)** — only PartyCount is used (2 set, 2 check). Make sure you didn't half-migrate from one to the other.
- **`KovTimerStart`** exists as both Switch #40 and Variable #33 — confirm intentional and clarify the naming.
- All transfers, common-event calls, and party-member adds resolved cleanly — no missing maps, no calls to deleted CEs, no add/remove of nonexistent actors.

---

## Suggested order of attack

1. **Pick canonical maps** in each duplicate pair (Tier 3) — every other fix depends on knowing which copy you're wiring into.
2. **Resolve Tier 1A** (gates that never open) — these are the most player-visible breaks; without setters, paths are unreachable.
3. **Decide the fate of the Alive roster + party-manager bookkeeping** (Tier 1C, 1D) — these touch the win/lose backbone of the recruit→organize→battle loop.
4. **Walk Tier 1B** with Shane — for each "set but never checked" flag, confirm whether the new script has a planned consumer or whether the flag is dead.
5. **Clean up Tier 2** so the editor shows you names instead of bare IDs.
6. **Delete Tier 4** entries you've confirmed dead.
