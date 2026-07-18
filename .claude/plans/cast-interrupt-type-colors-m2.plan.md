# Plan: Merge interruptType/important into the cast catalog + types (Milestone 2)

**Source PRD**: `.claude/prds/cast-interrupt-type-colors.prd.md`
**Selected Milestone**: 2 — Data merge + type plumbing. Milestone 3 (recolor render + css) is separate.
**Complexity**: Small–Medium (data-load + type additions; no new subsystems)

## Summary
Load `game-data/casts/interrupt-types.json` as a side table in `cast-catalog.ts`, matched to the enriched catalog by normalized mob+ability (the interrupt file has no ability IDs). Add `interruptType` (`stun|kick|dodge|other|null`) and `important` (`boolean`) to `CastCatalogEntry` and `PullCast`, and pass them through `buildPullCasts`. No render changes yet — milestone 3 consumes these fields.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| JSON load + index | `cast-catalog.ts:37 load()` (`fs.readFileSync`+`JSON.parse`, `fromProjectRoot`) | Load interrupt-types.json the same way; guard with try/catch returning empty |
| Mob-name normalization | `cast-catalog.ts:25 normalizeMob` (`toLowerCase().replace(/[^a-z0-9]/g,'')`) | Reuse verbatim for both mob and ability keys so the join is punctuation-insensitive (handles `Stab Yer Face!`, `Xul'vorith`) |
| Coerce/validate unions | `cast-catalog.ts:29 coercePriority` / `coerceTarget` | Add `coerceInterruptType` with the same allow-list shape |
| Field passthrough in join | `parser-finalize.ts:56 buildPullCasts` map | Add `interruptType`/`important` to the mapped `PullCast` exactly like `target`/`affixOnly` |
| Types location | `src/types/overlay.ts:389-429` | Add the new union + fields beside `CastPriority`/`CastCatalogEntry`/`PullCast` |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/types/overlay.ts` | UPDATE | Add `CastInterruptType` union; add `interruptType`/`important` to `CastCatalogEntry` and `PullCast` |
| `src/main/services/cast-catalog.ts` | UPDATE | Load interrupt-types.json into a `Map<mobKey|abilityKey→{interruptType,important}>`; attach to each `CastCatalogEntry` in `load()` |
| `src/main/services/parser-finalize.ts` | UPDATE | Pass `interruptType`/`important` through in the `buildPullCasts` map (line ~60) |
| `game-data/casts/interrupt-types.json` | (exists) | Side-table source built in milestone 1 |

## Tasks
### Task 1: Types
- **Action**: Add `export type CastInterruptType = 'stun' | 'kick' | 'dodge' | 'other';`. Add `interruptType: CastInterruptType | null;` and `important: boolean;` to `CastCatalogEntry` (after `affixOnly`) and to `PullCast` (after `affixOnly`). `null` = no verdict → milestone 3 falls back to priority color.
- **Validate**: `npx tsc --noEmit` (expect errors only where the object literals are constructed — fixed in Tasks 2–3).

### Task 2: Load + join the side table in cast-catalog.ts
- **Action**: Add `INTERRUPT_FILE = fromProjectRoot('game-data','casts','interrupt-types.json')`. In `load()`, read `{entries:[{mob,ability,interruptType,important}]}`; build `interruptByKey: Map<string,{interruptType,important}>` keyed `normalizeMob(mob)+'|'+normalizeMob(ability)`. When constructing each `catalogEntry`, look up `interruptByKey.get(normalizeMob(mob)+'|'+normalizeMob(ability))`; set `interruptType = hit?.interruptType ?? null`, `important = Boolean(hit?.important)`. Add `coerceInterruptType`. Log a one-line count of matched/unmatched (mirrors nothing today, but cheap) — or skip logging to match the file's silent style.
- **Mirror**: `load()` structure + `normalizeMob`.
- **Validate**: `node -e` prints, for mob "Warlord Brogg" ability "Dread Arc", `interruptType:'kick', important:true`; for "Facestabber"/"Stab Yer Face!", `interruptType:'stun'`.

### Task 3: Pass through in buildPullCasts
- **Action**: In the `parser-finalize.ts:56` map, add `interruptType: entry.interruptType, important: entry.important` to the returned `PullCast`. Do NOT change the filter/sort yet (yellow-tier broadening is a milestone-3 decision, see PRD open question).
- **Mirror**: existing `target`/`affixOnly` passthrough.
- **Validate**: harness prints a pull mob whose cast carries `interruptType`.

## Validation
```bash
npx tsc --noEmit
npx eslint src/main/services/cast-catalog.ts src/main/services/parser-finalize.ts src/types/overlay.ts
npm run build && node -e "const c=require('./dist/main/services/cast-catalog.js'); const m=c.getCastsForMob('Warlord Brogg'); console.log(m.map(x=>({a:x.ability,it:x.interruptType,imp:x.important})));"
npm run build && node -e "require('./dist/main/services/parser.js').parseCombatLog('example_logs/CombatLog130726_215705.txt').then(s=>{const withIt=(s.pullCasts||[]).flatMap(m=>m.casts).filter(c=>c.interruptType);console.log('casts carrying interruptType:',withIt.length);console.log(withIt.slice(0,4));})"
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| GateGuard blocks native Edit/Write (per HANDOVER) | High | Apply all edits via workspace bash (python3/heredoc), detect CRLF per file first |
| Mob/ability name drift between enriched catalog and interrupt-types | Medium | `normalizeMob` on both sides; the milestone-1 Vel'korath casing fix already aligned the known case; log unmatched to catch the rest |
| `overlay.ts`/`parser*.ts` are CRLF (per HANDOVER); string-replace silently fails | Medium | Detect `\r\n` in each file and match anchors accordingly |
| Object-literal construction sites beyond buildPullCasts | Low | `tsc` will flag every missing-field site; fix each |

## Acceptance
- [ ] `CastCatalogEntry` + `PullCast` carry `interruptType`/`important`
- [ ] `getCastsForMob('Warlord Brogg')` shows Dread Arc `kick`/important, Charged Bolt `kick`
- [ ] Harness: pull casts carry `interruptType` where the catalog has a verdict
- [ ] `tsc` + `eslint` + harness green
- [ ] No render/css change (that is milestone 3)

## Out of scope (this milestone)
Recolor of `renderCastAlertPanel()` + `styles.css` and the yellow-tier `buildPullCasts` filter decision — milestone 3.
