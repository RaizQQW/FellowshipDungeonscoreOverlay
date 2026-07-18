# Implementation Plan — Milestone 1: Death & Mistake Log

Source PRD: `.claude/prds/combat-log-accountability.prd.md` (milestone 1)
Verified against real logs in `example_logs/` (8 runs).

## Requirement (restated)
After a wipe, the group can see — in the overlay, no alt-tab — each party death this run: **who** died, **when / in which encounter**, and **to what** (killer + killing ability). Opt-in, draggable panel that doesn't crowd the already-full left side.

## Ground truth (from logs)
- Player deaths = `ALLY_DEATH` (NOT `UNIT_DEATH`, which is NPC-only — 0 player hits across all 8 logs).
  Field layout: `ts | ALLY_DEATH | deadPlayerId | "deadName" | killerId | "killerName" | killingAbilityId | "killingAbility" | …`
- Revives = `RESURRECT | reviverId | "reviver" | deadId | "dead" | abilityId | "Revive"`.
- Encounter context available via `state.currentEncounter` (name set by `ENCOUNTER_START`).
- Finalized state reaches the renderer through the existing `log-data` IPC channel — no new channel needed (unlike dungeon-scores).

## Risks / assumptions
- The parser has never handled `ALLY_DEATH`; the existing `UNIT_DEATH|Player-` death counter is dead code (always 0) — fix it here.
- Remote party members' presence in `ALLY_DEATH` is confirmed (multiple victims per run); no local-only fallback needed.
- Overlay real estate is tight → panel defaults OFF, draggable, mirrors the dungeon-scores panel's opt-in/visibility pattern.

## Steps (each small, verifiable)

1. **Types** — `src/types/overlay.ts`
   - Add `PlayerDeathEntry { ts; playerId; playerName; killerId; killerName; killingAbilityId; killingAbility; encounterName: string | null; revived: boolean }`.
   - Add `playerDeaths: PlayerDeathEntry[]` to `FinalizedState`.
   - Extend `ParserState` (`src/types/main-process.ts`) with `playerDeaths: PlayerDeathEntry[]`.

2. **State init + reset**
   - `parser-state.ts`: add `playerDeaths: []` to both state factory objects (alongside `npcDeaths`).
   - `parser-dungeon.ts` (~L120): `state.playerDeaths = [];` on dungeon reset.
   - `parser.ts`: add `const MAX_STORED_PLAYER_DEATHS = 100;`.

3. **Parse `ALLY_DEATH`** — `parser.ts` switch
   - New `case 'ALLY_DEATH':` → build `PlayerDeathEntry` from parts[2..7], `encounterName = state.currentEncounter?.name ?? null`, push to `state.playerDeaths` (cap at MAX), and `ensurePlayer(state, deadId, deadName).deaths += 1` (this is the real death counter — retire the never-firing `UNIT_DEATH|Player-` increment).

4. **Parse `RESURRECT` (bonus, cheap)** — `parser.ts`
   - New `case 'RESURRECT':` → mark the most recent unrevived `playerDeaths` entry for that victim `revived = true`. Enables a "died / rezzed" distinction in the UI.

5. **Finalize** — `parser-finalize.ts` (~L124)
   - Add `playerDeaths: state.playerDeaths,` to the returned object.

6. **Renderer panel**
   - `index.html`: `<div id="deathLogPanel" class="death-log-panel hidden"></div>`.
   - New `src/renderer/modules/death-log.ts`: `renderDeathLogPanel({ playerDeaths, translate, … })` + `updateDeathLogPanelVisibility` (mirror `panels.ts` dungeon-scores structure); rows show victim (hero-colored), ability, and relative time / encounter; empty state = "no deaths this run".
   - `index.ts`: grab element, call render inside the existing `onData('log-data')` handler using `latestData.playerDeaths`; add draggable position (mirror `loadDungeonScoresPanelPosition`), a `showDeathLog` visibility setting + settings toggle.
   - `styles.css`: `.death-log-*` styles (reuse dungeon-scores row grid).
   - `i18n.ts`: `deathLogTitle`, `noDeaths`, `revivedSuffix` for en + ru.
   - `settings-store.ts` + `main/config/overlay-settings.ts`: persist `showDeathLog` + panel position.

## Verification (gate before "done")
- `npx tsc --noEmit` + `npx eslint` on changed files → clean.
- **Data harness** (node, no UI): run `parseCombatLog('example_logs/CombatLog100726_223349.txt')` and assert:
  - `playerDeaths.length > 0` (expect ~ up to MAX; run has 58 `ALLY_DEATH`),
  - a sample entry has non-null `killerName` and `killingAbility` (e.g. "Marching Vessels: Unraveling Flesh"),
  - at least one finalized player has `deaths > 0` (counter bug fixed).
- Manual smoke: launch overlay, enable the toggle, confirm the panel lists deaths and is draggable.

## Out of scope (this milestone)
Boss timer (milestone 2), cross-run persistence, damage meters, phase detection.
