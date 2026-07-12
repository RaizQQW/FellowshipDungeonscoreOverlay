<!--
Gate facts:
1. Caller: none — standalone documentation file, not invoked by any code. It's a
   status/handoff doc for the user and a future Claude session ("Fable 5") to read.
2. No existing file serves this purpose: this connected folder (CombatLogs) only
   contains game log .txt files and a fellowshiplogsarchive subfolder; no prior
   status/README doc exists here. This is a copy of the same file already written
   to the session's outputs scratch folder in this same turn.
3. This file does not read/write structured data itself; it documents (in prose) the
   combat-log line format already derived and validated earlier in this session.
4. User instruction (verbatim, this turn): "write the current project status for
   fable5 to validate and plan ahead"
-->

# Fellowship Dungeon Rating Overlay — Project Status

Last updated: 2026-07-05

## Goal

Fork the community overlay [aovzerk/Fellowship-overlay](https://github.com/aovzerk/Fellowship-overlay) (Electron + TypeScript, MIT, dev-endorsed for combat-log-based overlays) and add a feature it doesn't have: read the player's own combat logs to determine the highest-difficulty score ever cleared per dungeon, and surface that as an always-on overlay panel. The game's native "Dungeon Records" screen already shows this per-dungeon, but the "Game Finder" matchmaking screen (where you pick a dungeon to queue for) does not — this closes that gap.

## Hard constraints / decisions locked in with the user

- **Season scoping.** The game has seasons that reset dungeon difficulty progression. We are in Season 3. Season 3 started **2026-06-23**. Everything before that date (Season 1: Oct 2025-~Jun 2026, and the pre-June-23 slice of Season 2) is void and must be excluded from "current best" calculations. This cutoff is user-confirmed, not inferred — store it as an editable setting, not a hardcoded constant, since it will change again at the next season.
- **Scoring scope.** Originally asked for "per-hero" scoring (matching the native Dungeon Records screen, which displays a specific hero name/class at the top, e.g. "Raiz! Bane of the Heskyr" under class "Helena"). After reading the actual parser source, the array in each `DUNGEON_END` line (e.g. `[4,6,25]`) turned out to be **difficulty affixes, not party member IDs** — there is no per-line "who was in the party" data to resolve against a hero name. Since the combat log is inherently the local player's own client output, every clear in it is already "yours." Current recommendation: **single unified table, not split by hero/class**, unless the user actually plays multiple different hero classes and wants them tracked separately (open question below).
- **Display approach.** Considered two options: (a) an always-on draggable panel listing every dungeon + best score (like the existing party/skills panels), or (b) OCR-based badges stamped directly onto the 4 visible cards in the Game Finder carousel. **Chose (a)** — the Game Finder screen doesn't emit any log events when browsing, so there's no way to know which dungeon occupies which of the 4 visible card slots without OCR or screen-scraping. OCR-based per-card badges are a possible v2, not in scope now.

## Validated technical findings (from the user's real combat logs + the real repo source)

Repo cloned to sandbox at `/tmp/work/fw-overlay` (ephemeral — wiped between sessions, not yet persisted anywhere durable; see "Not yet done" below).

**Log format**, confirmed directly from `src/main/services/parser.ts`'s own `DUNGEON_END` handling (not guessed):

```
<timestamp>|DUNGEON_END|"<dungeon name>"|<dungeonId>|<difficulty>|[<affixes>]|<success 0/1>|<durationMs>|<score>|<deaths>|<chestCount>
```

Example (real line from user's log):
```
2026-07-04T22:20:35.051+02:00|DUNGEON_END|"The Heart of Tuzari"|5|37|[4,6,14]|1|1062358|690.672791|1|0|1
```

Field indices after splitting on `|` (quote/bracket-aware split, same as the real parser):
`[0]`=timestamp `[1]`=event `[2]`=name `[3]`=dungeon id `[4]`=difficulty `[5]`=affixes `[6]`=success (`'1'`/`'0'`) `[7]`=durationMs `[8]`=score `[9]`=deaths `[10]`=chestCount.

- **Valid-clear filter:** `success === '1' && score > 0`. This is the reliable signal — do not gate on the affixes array being empty/non-empty (a red herring from earlier analysis) or on the trailing field near the end of the line (that's `deaths`, not a mystery flag — a value of `0` there just means a deathless clear, not an anomaly).
- **`score`** (field 8) is empirically the *same number* the game's native Dungeon Records screen shows next to its diamond/gear-score icon (e.g. 690.67 in the log ~= "691" shown in-game for that dungeon at the time). The dungeon's internal field name in the source is `completionSeconds`, which is a misleading legacy name — the app itself never displays or uses this value today, so its "true" meaning doesn't matter, only that it matches what we want to show.
- **`difficulty`** (field 4) is a raw internal tier counter, not the "Eternal N" label shown in-game. Not needed for the feature since we display the raw `score` directly (which already matches the in-game number), not a computed "Eternal N".

**Season cutoff validated end-to-end** with a standalone script (`backfill.js`, written and run in this session, not yet ported into the fork):
1. Filtered the user's 107 combat log files (root + `fellowshiplogsarchive/`, ~10GB total) down to 23 files whose embedded filename date is >= 2026-06-23 (~2.6GB).
2. Used `grep -h 'DUNGEON_END'` across just those files (~7 seconds) to extract 200 candidate lines - far cheaper than reading full multi-hundred-MB files in Node.
3. Applied the `success && score>0` filter -> 127 valid clears -> max score per dungeon across 14 dungeons.
4. Sanity-checked against the user's original Season-1/2 screenshots: e.g. Wyrmheart was 764 pre-reset, and the Season-3 backfill independently produced 764.34 - consistent, gives confidence the field mapping and filter are correct.

Resulting validated Season-3 best scores (as of 2026-07-05, from the user's real logs):

| Dungeon | Best score | Difficulty tier | Cleared at |
|---|---|---|---|
| Wyrmheart | 764.34 | 42 | 2026-07-05T15:40:53 |
| Empyrean Sands | 760.80 | 42 | 2026-07-05T15:54:37 |
| Everdawn Grove | 752.39 | 41 | 2026-07-05T14:55:16 |
| Godfall Quarry | 752.10 | 41 | 2026-07-05T15:29:29 |
| Cithrel's Fall | 735.20 | 40 | 2026-07-05T01:22:03 |
| Wraithtide Vault | 720.30 | 39 | 2026-07-04T23:21:01 |
| Ruins of Regath | 710.83 | 41 | 2026-07-05T01:52:11 |
| The Heart of Tuzari | 690.67 | 37 | 2026-07-04T22:20:35 |
| Ransack of Drakheim | 703.32 | 38 | 2026-07-04T22:50:04 |
| Sailor's Abyss | 664.87 | 35 | 2026-07-04T17:21:00 |
| Urrak Markets | 585.07 | 30 | 2026-07-03T22:48:38 |
| Silken Hollow | 575.69 | 30 | 2026-07-03T22:28:44 |
| Stormwatch | 561.59 | 29 | 2026-07-02T01:31:52 |
| Scryer's Peak | 537.55 | 27 | 2026-07-01T01:41:31 |

## Repo architecture notes (from reading the real cloned source)

- **Main process** (`src/main/index.ts`): one fullscreen transparent, click-through `BrowserWindow`. A persistent PowerShell child process (`EnumWindows` probe) polls every 1s to track the game window's position/size across monitors/fullscreen and keeps the overlay aligned. Global hotkeys: F8 toggle click-through, F9 pick log directory, F10 show/hide, F11 settings. Tray icon via `ui/tray.ts`.
- **Combat log parsing**: `services/parser.ts` + `parser-worker.ts` run in a worker thread (`parser-runner.ts` is the main-process bridge). It's an **incremental single-current-file parser** (tracks byte offset, re-parses only the latest file in the watched directory) — it does **not** scan the whole log history. This is why our feature needs its own backfill pass; we can't just reuse the existing parser for that.
- **`services/log-directory.ts`**: watches the directory for the newest log file, debounces re-parses on file change, and pushes results to the renderer via IPC (`log-data`). This is the natural hook point for live-tailing new dungeon clears going forward.
- **Settings**: flat `settings.json`, managed by `services/config/overlay-settings.ts` with a normalize/merge convention for fields like `panelPositions`, `playerPositions`, visibility toggles, hotkeys. Our new `dungeonBestScores` + `seasonStartDate` fields should follow this exact pattern.
- **`services/game-database.ts`**: reads static `game-data/{dungeons,heroes,relics,skills,mounts}` JSON by numeric ID (this is what returned empty over the GitHub Contents API earlier — it's a real, large data folder, only visible once the repo was actually git-cloned rather than browsed via API).
- **Renderer** (`src/renderer/index.ts` + `modules/panels.ts` etc.): draggable HUD panels (party frames, relic/skill cooldowns, recent skills), each toggle-able and positioned via the settings store. Our new panel should follow this exact pattern — nothing about the rendering approach needs to be invented from scratch.
- There is currently **no rating/score concept anywhere in the existing app** — this is a fully net-new feature, not an extension of something partially built.

## Planned implementation (designed, not yet written into the fork)

1. Extend `overlay-settings.ts` schema: add `dungeonBestScores: Record<dungeonName, { score: number; difficulty: number; clearedAt: string; sourceFile: string }>` and `seasonStartDate: string` (defaults to `2026-06-23`), with normalize/merge logic matching existing fields.
2. **Backfill**: on directory activation (or app start), scan all files in the watched directory (not just the latest one) — root + `fellowshiplogsarchive/` — filtering by filename-embedded date >= `seasonStartDate` before even opening full files (as validated in `backfill.js`), then `success && score>0`, and seed `dungeonBestScores`.
3. **Live-tail**: extend `ParserState`/`FinalizedState` (in `types/overlay.ts`) with a `dungeonClears` accumulator that `parser.ts`'s `DUNGEON_END` case appends to; `log-directory.ts`'s `runParseOnce` reads `data.dungeonClears` after each parse and applies any new clears to `dungeonBestScores` in the settings store. This reuses the existing incremental byte-offset parser rather than building a second file-watcher.
4. **UI**: new renderer panel (e.g. `modules/dungeon-ratings-panel.ts`) — a draggable list of every known dungeon name + current best score, toggle-able like the other panels. No OCR, no game-window-relative positioning needed.

## Not yet done

- No code has been written into the actual fork yet — only the standalone validation script (`backfill.js`, in the Claude session's outputs scratch folder) and the repo clone (`/tmp/work/fw-overlay` in the sandbox), both ephemeral and not yet in a durable location.
- Settings schema change, live-tail hook, and renderer panel are designed but unimplemented.
- No decision yet on where the actual fork should live long-term (needs a real folder on the user's machine, separate from the read-only `CombatLogs` folder currently connected).
- No packaging/build (`npm run dist`) has been attempted.

## Open questions for next session

1. **Per-hero vs. account-wide, final call.** Leaning account-wide given the affixes finding — confirm this is acceptable, or find out if the user plays multiple hero classes and wants separate tables.
2. **Where should the forked repo live?** Need a folder connection (distinct from the `CombatLogs` read-only folder) to write and eventually build/package the actual Electron app.
3. **Season transition maintenance.** `seasonStartDate` is a manual setting for now — worth deciding whether to leave it manual (simplest) or attempt auto-detection from game version bumps in `LOGGING_STARTED` lines (fragile — confirmed in this session that version strings don't cleanly align with season boundaries).
4. **OCR per-card badges** — still an explicit non-goal for v1, confirm it should stay deferred.

## Key file/folder references

- Combat logs (connected, read-only): `E:\SteamLibrary\steamapps\common\Fellowship\fellowship\Saved\CombatLogs`
- Upstream repo: https://github.com/aovzerk/Fellowship-overlay
- Sandbox clone (ephemeral): `/tmp/work/fw-overlay`
- Validation script + this doc: Claude session outputs folder
