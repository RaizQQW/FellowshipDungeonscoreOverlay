# Plan: Per-Pull Cast Alert Overlay (goals a + b)

**Source PRD**: `.claude/prds/cast-alert-overlay.prd.md`
**Selected Milestone**: 2 — Per-pull cast overlay (goals a + b). Goal (c), cooldown inference, is milestone 3 — stubbed here, not built.
**Complexity**: Large

## Summary
Add a right-side overlay that, during a pull, lists the engaged caster-mobs (filtered to those with meaningful casts, ranked by interrupt priority) and, per mob, shows its casts as available vs. just-cast (greyed for a few seconds). Data comes from the reconciled `cast-priority-enriched.json` (mob+ability→priority/target/affix) joined live with the parser's existing pull-mob tracking and NPC cast events.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Panel (render+wire+visibility+drag+i18n+css) | death-log: `src/renderer/index.ts` `renderDeathLogPanel`, `showDeathLog`, `deathLogPanel` | Newest sibling panel — copy its whole wiring shape |
| Game-data catalog load | `src/main/services/game-database.ts:64` (`fs.readFileSync`+`JSON.parse`, `GAME_DATA_ROOT_DIR='game-data'`); `skill-catalog.ts` | Load + index the cast JSON the same way |
| Pull mobs (goal a data) | `src/main/services/parser-dungeon.ts:234` `buildCurrentPullSummary`; `CurrentPullSummary.mobs: CurrentPullNpc[]` (has `npcName`, `unitId`, `deadAt`, `alive`) | Already emitted in `FinalizedState.currentPull` over the `log-data` IPC |
| NPC cast events | `src/main/services/parser.ts:426` cases `ABILITY_CAST_START/SUCCESS/FAIL/CHANNEL_*` (fields: source `parts[2]/[3]`, ability `parts[4]/[5]`) | Extend these cases to record NPC casts; currently only ABILITY_ACTIVATED player logic runs |
| State init / reset | `parser-state.ts` factory + `parser-dungeon.ts` `resetDungeonScope` (and the per-pull reset) | Add + reset the new pull-cast map like `recentDamageByPlayer` |
| Validation | headless harness (`node dist/... parseCombatLog` on an example log) + `tsc` + `eslint` | No unit-test suite exists; this is the project's validation path |

## Files to Change
| File | Action | Why |
|---|---|---|
| `game-data/casts/cast-priority-enriched.json` | (exists) | Source of truth for mob→casts→priority/target/affix |
| `src/main/services/cast-catalog.ts` | CREATE | Load+index the JSON: `byAbilityId`, `byMobName` |
| `src/types/overlay.ts` | UPDATE | `CastCatalogEntry`, `PullCastMob`/`PullCastState`, add to `FinalizedState` + `ParserState` |
| `src/main/services/parser.ts` | UPDATE | Record NPC cast start/success/fail per (mob, abilityId) with ts |
| `src/main/services/parser-state.ts` | UPDATE | Init `pullCasts` map in state factory |
| `src/main/services/parser-dungeon.ts` | UPDATE | Reset `pullCasts` on pull/dungeon reset; build pull cast state in finalize summary |
| `src/main/services/parser-finalize.ts` | UPDATE | Emit `pullCasts` into `FinalizedState` |
| `src/renderer/index.ts` | UPDATE | `renderCastAlertPanel()` + wiring (mirror death-log) |
| `src/renderer/index.html` | UPDATE | `#castAlertPanel` div + settings toggle |
| `src/renderer/styles.css` | UPDATE | Right-side panel + cast state styles (available/casting/just-cast/tier colors) |
| `src/renderer/modules/i18n.ts` | UPDATE | Titles + state labels (en+ru) |
| `src/renderer/modules/settings-store.ts`, `src/main/config/overlay-settings.ts`, `src/renderer/modules/constants.ts` | UPDATE | `showCastAlerts` visibility default+normalize |

## Tasks
### Task 1: Cast catalog service
- **Action**: `cast-catalog.ts` loads `game-data/casts/cast-priority-enriched.json`, exposes `getCastByAbilityId(id)` and `getCastsForMob(name)` returning `{ability, abilityId, priority, target, affixOnly, redditOverride}`. Filter out `review`/`ignore` for the "which mobs have casts" test but keep them queryable.
- **Mirror**: `game-database.ts:64` read + `skill-catalog.ts` indexing.
- **Validate**: `node -e` load prints counts (stop/mechanic) and a Sinnari's Wrath lookup by id `1618`.

### Task 2: Track NPC casts in the parser
- **Action**: In the `ABILITY_CAST_START/SUCCESS/FAIL/CHANNEL_*` block, when `isNpcId(sourceId)`, upsert `state.pullCasts[sourceId]` (keyed by mob unitId) → `{ mobName, casts: Map<abilityId, {lastStartAt, lastResolvedAt, status}> }`. `status`: `casting` on START, `justCast` on SUCCESS/CHANNEL_SUCCESS, `interrupted` on FAIL. Only track abilities present in the cast catalog (ignore trash noise).
- **Mirror**: `recordDamageTaken` rolling-map pattern added for the death log.
- **Validate**: harness on `CombatLog130726_215705.txt` prints ≥1 mob with a tracked `stop` cast.

### Task 3: Finalize pull cast state (goal a ranking)
- **Action**: In `buildCurrentPullSummary`/finalize, for each **alive** mob in `currentPull.mobs`, join `getCastsForMob(name)` + live `pullCasts` status; drop mobs whose only casts are `ignore`/`review`; sort mobs by (max cast tier → most-dangerous target → cast frequency). Emit `FinalizedState.pullCasts: PullCastMob[]`.
- **Mirror**: `parser-finalize.ts` output object; `playerDeaths` field addition.
- **Validate**: harness prints ranked caster-mob list for an active pull.

### Task 4: Render the right-side panel (goal b)
- **Action**: `renderCastAlertPanel()` (in `index.ts`, mirroring `renderDeathLogPanel`): one block per ranked mob (name in tier color), rows of its casts styled by status — available (normal), `casting` (highlight/pulse), `justCast` (greyed ~4s then back to available), `interrupted` (struck/kicked). Right-side default position; opt-in toggle; draggable; empty state when no caster-mobs.
- **Mirror**: death-log panel render + `#deathLogPanel` wiring, `showDeathLog` visibility, `initializePanel` drag, i18n, css.
- **Validate**: `tsc` + `eslint` clean; visual check via `npm start` against an example log.

### Task 5: Settings + i18n + css
- **Action**: `showCastAlerts` visibility (default **off**) across `constants.ts`/`overlay-settings.ts`/`settings-store.ts`; toggle in `index.html`; `overlay-root.cast-alerts-hidden`; tier/state colors; en+ru strings.
- **Mirror**: the `showDeathLog` plumbing added last change.
- **Validate**: toggle persists; `tsc`/`eslint` clean.

## Validation
```bash
npx tsc --noEmit
npx eslint src/main/services/parser.ts src/main/services/cast-catalog.ts src/renderer/index.ts src/types/overlay.ts
npm run build && node -e "require('./dist/main/services/parser.js').parseCombatLog('example_logs/CombatLog130726_215705.txt').then(s=>{const m=(s.pullCasts||[]);console.log('caster-mobs:',m.length);console.log(JSON.stringify(m.slice(0,3),null,1));})"
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Can't tell from logs whether a mob *will* cast before it does | High | Pre-populate each mob's cast list from the static catalog by mob name; live status overlays it |
| Affix (Vayr's Legacy) state unknown from logs | Low | Resolved: Vayr's Legacy is always active in Eternal keys (the target content), so affix casts are treated as normal casts; no affix tag rendered |
| `review` casts (86) uncurated → noise | Medium | Panel shows only `stop`/`mechanic`; `review`/`ignore` hidden until curated |
| Multiple instances of same mob in a pull | Medium | Track per-`unitId`; group display by mob name |
| Cast-event field indices differ from damage events | Low | Confirmed: ability at `parts[4]/[5]` for cast events (parser.ts:426) |
| Right-side default overlaps existing panels | Low | Draggable + persisted position, opt-in default off |

## Acceptance
- [ ] Panel lists only pull mobs that have `stop`/`mechanic` casts, ranked by interrupt priority
- [ ] Each mob shows its casts; a resolved cast greys out for a few seconds then returns to available
- [ ] `stop` casts visually outrank `mechanic`; `ignore`/`review` hidden
- [ ] Opt-in toggle persists; panel draggable on the right
- [ ] `tsc` + `eslint` + harness all green
- [ ] Patterns mirrored from the death-log panel, not reinvented

## Out of scope (this milestone)
Goal (c) cooldown inference (milestone 3): per-mob-type median inter-cast interval → "next in ~Ns". Data is available (cast timestamps per abilityId) but noisy (adds/resets); plan separately.
