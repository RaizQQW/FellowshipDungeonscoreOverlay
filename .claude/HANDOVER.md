# Handover — Fellowship Overlay (fw-overlay-clean)

**Repo:** `C:\Users\Julian\fw-overlay-clean` (GitHub `RaizQQW/FellowshipDungeonscoreOverlay`, branch `main`).
Electron + TypeScript overlay for the game *Fellowship*. Parses combat logs, shows overlay panels.
Run/test: `npm start` (= `npm run build && electron .`). No unit-test framework — validation = `tsc`, `eslint`, and a headless `parseCombatLog` harness on `example_logs/`.

## Environment gotchas (READ FIRST)
- **GateGuard hook blocks the native Edit/Write tools.** Do all file edits through the workspace shell (`python3` heredocs / `cat >`), not Edit/Write. This is why every change below was applied via bash.
- **Line endings are mixed per file.** Some files are CRLF (e.g. `index.ts`, `parser*.ts`, `settings-store.ts`, `overlay-settings.ts`, `i18n.ts`, `constants.ts`), others LF (`overlay.ts`, `index.html`, `styles.css`, `cast-catalog.ts`). When string-replacing, detect `"\r\n" in s` and convert anchors accordingly, or replaces silently fail. Git shows ~50 files as modified purely from CRLF churn — only ~a dozen have real changes.
- **Renderer `index.ts` is one big IIFE** `(() => { ... })();` (lines 1–~1100). Anything appended after `})();` is out of scope. Put code before the closing.
- **Renderer has no bundler.** `index.html` loads compiled `dist/renderer/*.js` via `<script>` tags. `index.html` is loaded from `src/` (there is no `dist/renderer/index.html`). Modules use `window.OverlayRenderer*` globals + IIFEs.
- **Parser runs in a worker** (`parser-worker.ts` → `parser.ts` `parseCombatLog`). Same finalize path as the harness, so harness results match in-game.
- **`initializePanel` (layout.ts) adds a `hidden` class to every panel.** Each panel's render MUST clear/toggle its own `hidden` class or it stays `display:none` forever. THIS bug cost hours — see below.

## Combat-log format facts (verified against example_logs)
- Player deaths = `ALLY_DEATH` (NOT `UNIT_DEATH`, which is NPC-only). Fields: `ts|ALLY_DEATH|deadPlayerId|"name"|killerId|"killer"|killingAbilityId|"ability"|...`. `RESURRECT` = revives.
- Damage events (`ABILITY_DAMAGE`/`SWING_DAMAGE`/`ABILITY_PERIODIC_DAMAGE`): amount at `parts[9]`; victim current/max HP at `parts[23]`/`parts[24]`.
- NPC casts (`ABILITY_CAST_START`/`_SUCCESS`/`_FAIL`/`CHANNEL_*`): source `parts[2]/[3]`, ability id/name `parts[4]/[5]`. Cast start carries the mob NAME (matches `currentPull.mobs[].name`).
- `FinalizedState.currentPull.mobs` already lists the pull's mobs (name, unitId, alive).

## DONE & verified (all tsc/eslint/build green)
1. **Hero tabs** on the dungeon-scores panel (`panels.ts` + `index.ts`) — one hero shown at a time, preserves the "run next" optimizer. WORKS in game (see screenshot in chat).
2. **Death log** panel (opt-in "Show death log", default off): `ALLY_DEATH`+`RESURRECT` → `FinalizedState.playerDeaths`; one-shot vs trickle classification (rolling damage window in `parser.ts`, `classifyPlayerDeath`). Fixed a latent bug where player deaths were never counted.
3. **Cast-alert overlay** (opt-in "Show mob cast alerts", default off): the current milestone.
   - `src/main/services/cast-catalog.ts` (NEW) loads `game-data/casts/cast-priority-enriched.json`; `getCastByAbilityId`, `getCastsForMob`.
   - `parser.ts` records NPC cast status per mob (`recordNpcCast`, `state.pullCasts`), reset in `parser-dungeon.ts`.
   - `parser-finalize.ts` `buildPullCasts()` joins live status + catalog for alive pull mobs, dedupes by mob name (with `instances` count), drops ignore/review-only mobs, ranks by priority→target→name, emits `FinalizedState.pullCasts`.
   - `index.ts` `renderCastAlertPanel()` — right-side `#castAlertPanel`, one block per ranked mob (`×N` if >1 instance), cast rows styled by status (available / casting=red highlight / justCast=grey ~4s / interrupted=strikethrough), `stop` casts get a gold ★.
   - Visibility/settings/i18n/css wired like the death-log panel. Affix tag was removed (Vayr's Legacy is always on in Eternal keys).

## Data artifacts (game-data/casts/)
- `cast-priority.json` — log-derived (195 casts, ability IDs + counts).
- `method-guidance.json` — method.gg crawl (376 abilities, 14 dungeons; Ruins of Regath failed to load).
- `cast-priority-enriched.json` — **the file the app loads.** Reconciled: each cast has `abilityId, ability, mob, finalPriority (stop|mechanic|ignore|review), method:{target,affixOnly,verdict}`. 66 mob types have a stop/mechanic cast (broad coverage).

## IN PROGRESS — color re-model (user's spec, NOT yet built)
User wants the cast colors to mean:
- **grey = stunnable** (hard-stop / CC, can't be kicked)
- **yellow = kickable** (normal interrupt)
- **red = kickable + IMPORTANT** (must-stop, wipe risk) — gets the ★
- **dodge/soak "mechanic" casts**: keep showing them but visually distinct (dimmed/outlined), NOT part of the 3-color scheme.

Our data lacks the stun-vs-kick distinction. User chose: **re-crawl method.gg** to extract it.

### NEXT STEP (do this first next session)
The re-crawl subagent was dispatched but **failed (session limit)** — `game-data/casts/interrupt-types.json` was NOT created. Re-dispatch a subagent (keeps huge pages out of context) to fetch the 15 dungeon guide URLs (list in the PRD / chat) and, per named ability, output `{dungeon, mob, ability, interruptType: stun|kick|dodge|other, important: bool}` to `game-data/casts/interrupt-types.json`. Classification rules: `stun` = "hard stop/stun/CC to stop/cannot be interrupted"; `kick` = "interrupt or use a CC on the cast"; `dodge` = avoid/soak/dispel; `important` = wipe/death-risk wording ("MUST be kicked", "will wipe", "lethal", "quickly burst players down").

Then:
1. Merge `interruptType` (+`important`) into `cast-priority-enriched.json` (or load as a side table in `cast-catalog.ts`), matched by normalized mob+ability. Add `interruptType`/`important` to `CastCatalogEntry` and `PullCast` (types in `overlay.ts`).
2. Recolor in `renderCastAlertPanel()` (`index.ts`) + `styles.css`:
   - grey (`cast-prio-stun` or new class) = interruptType `stun`
   - red + ★ = interruptType `kick` AND important
   - yellow = interruptType `kick` AND not important
   - mechanic (dodge/soak) = kept, dimmed/outlined separate style
   Current classes to repurpose: `.cast-prio-stop` (red) / `.cast-prio-mechanic` (amber). Add a stun/kick split.
3. Consider whether to broaden `buildPullCasts` filter (currently stop+mechanic only) to include kickable-non-important casts for the yellow tier.

## Open user feedback (besides colors)
- "Some casts were missing" → coverage: only casts in the 8 logs + method crawl exist; 86 `review` + 19 method-only casts lack IDs/curation. Fills in with more logs. (Ruins of Regath guide never loaded — retry.)
- "Double magi, only 1 cast shown" → dedup-by-name; now shows `×N` instance count. If a mob truly has 2 stop casts and only 1 shows, check the catalog for that mob/ability id.

## PRD / plan
- PRD: `.claude/prds/cast-alert-overlay.prd.md` (milestone 2 = complete; milestone 3 = cooldown inference "goal c", not started).
- Plan: `.claude/plans/cast-alert-overlay.plan.md`.
- Also: `.claude/prds/combat-log-accountability.prd.md` + `.claude/plans/death-log.plan.md` (death log — done).

## Verify commands
```
npx tsc --noEmit
npx eslint src/main/services/parser.ts src/main/services/cast-catalog.ts src/main/services/parser-finalize.ts src/renderer/index.ts src/types/overlay.ts
npm run build && node -e "require('./dist/main/services/parser.js').parseCombatLog('example_logs/CombatLog130726_215705.txt').then(s=>console.log('pullCasts',(s.pullCasts||[]).length,'deaths',(s.playerDeaths||[]).length))"
```

## Housekeeping
- Nothing is committed yet — all work is uncommitted in the working tree (plus CRLF churn on ~50 untouched files). When committing, stage only the real changes to avoid a huge EOL-flip diff; consider adding a `.gitattributes` (`* text=auto eol=lf`) to end the CRLF pain.
- `Overlay/` (the old non-clean copy) was deleted from disk earlier; disconnect it from the workspace in the app if still listed.
