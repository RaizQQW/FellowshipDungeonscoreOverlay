# Plan: Interrupt-Type Data Extraction (interrupt-types.json)

**Source PRD**: `.claude/prds/cast-interrupt-type-colors.prd.md`
**Selected Milestone**: 1 — Interrupt-type data extraction (the crawl). Milestones 2 (merge + type plumbing) and 3 (recolor) are planned separately once this data lands.
**Complexity**: Medium

## Summary
Produce `game-data/casts/interrupt-types.json`: for every named mob cast in the 15 method.gg dungeon guides, a verdict of `interruptType: stun | kick | dodge | other` plus an `important` boolean. The existing `method-guidance.json` collapses all interrupts to a single `"interrupt"` verdict (no stun/kick split, no importance flag — verified: 0 entries mention "stun"), so this is a fresh, more granular read of the same guides. Work is dispatched to a dedicated subagent per dungeon so full guide pages never enter the main context — the exact failure mode ("session limit") that killed the previous attempt.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Output JSON shape | `game-data/casts/method-guidance.json` | `{ "source", "generated", "entries": [ {dungeon, mob, ability, ...} ] }` — reuse this envelope; add `interruptType` + `important` to each entry |
| Entry keys | `method-guidance.json` entries | `dungeon`, `mob`, `ability` are the join keys downstream — spell them identically (same casing) so milestone 2's mob+ability match works |
| Data location | `game-data/casts/` | All cast data lives here; write the new file alongside |
| Dungeon roster | `method-guidance.json` (14 dungeons) + Ruins of Regath | Authoritative list of guides to crawl (below) |
| Crawl script | — | None exists. `method-guidance.json` was subagent-generated, not a committed script. State explicitly: no script to mirror; this is an agent-driven extraction, not a code deliverable. |

## Dungeon roster (crawl targets)
Confirmed present in `method-guidance.json` (14): Cithrel's Fall, Empyrean Sands, Everdawn Grove, Godfall Quarry, Ransack of Drakheim, Sailor's Abyss, Scryer's Peak, Silken Hollow, Stormwatch, The Heart of Tuzari, Urrak Markets, Wraithtide Vault, Wyrmheart, Xul The Blood Monolith.
Missing (retry): **Ruins of Regath** (failed to load last time).

## Files to Change
| File | Action | Why |
|---|---|---|
| `game-data/casts/interrupt-types.json` | CREATE | The milestone deliverable — side table joined in milestone 2 |
| _(no source code)_ | — | Type plumbing and recolor are milestones 2–3, not this one |

## Tasks
### Task 1: Resolve the 15 guide URLs
- **Action**: Determine the method.gg dungeon-guide URL for each of the 15 dungeons (derive the URL pattern from one known-good guide, then map each dungeon name → slug). Confirm each returns real guide content (not a JS shell). If a fetch returns an empty/loading shell, escalate that URL to the Chrome browser tools (JS-rendered) rather than retrying the raw fetch.
- **Mirror**: dungeon names exactly as in `method-guidance.json` for the `dungeon` field.
- **Validate**: 15 URLs listed; each confirmed to contain ability/mob prose. Ruins of Regath explicitly marked loadable or still-failing.

### Task 2: Dispatch per-dungeon extraction subagents
- **Action**: For each dungeon, dispatch a **dedicated subagent** that fetches only that guide and returns a compact JSON array of `{dungeon, mob, ability, interruptType, important}` — the full page stays in the subagent, only the extracted rows return. Apply the classification rules verbatim:
  - `interruptType = stun` — "hard stop / stun / CC to stop / cannot be interrupted"
  - `interruptType = kick` — "interrupt or use a CC on the cast"
  - `interruptType = dodge` — avoid / soak / dispel / positioning
  - `interruptType = other` — anything not matching the above (info/tank-only casts)
  - `important = true` — wipe/death-risk wording ("MUST be kicked", "will wipe", "lethal", "quickly burst players down")
- **Mirror**: one subagent per page to bound context (handover's stated fix for the prior session-limit failure).
- **Validate**: each subagent returns ≥1 row; rows carry all five fields; no full page text leaks into the aggregator.

### Task 3: Aggregate into interrupt-types.json
- **Action**: Merge all subagent row-sets into `game-data/casts/interrupt-types.json` using the `method-guidance.json` envelope: `{ "source": "method.gg dungeon guides", "generated": "<date>", "entries": [...] }`. Dedupe by `(dungeon, mob, ability)`.
- **Mirror**: `method-guidance.json` top-level shape.
- **Validate**: file parses; entry count and dungeon count reported (see Validation).

### Task 4: Coverage + sanity check
- **Action**: Compare against `method-guidance.json`: every ability it marks `methodVerdict=="interrupt"` should now carry a `stun`/`kick` verdict here. Spot-check the `kick & important` set (these become red+★ downstream) for mis-tags. List any `interrupt` abilities left unclassified.
- **Validate**: coverage ratio printed; unclassified list is short and explainable (e.g. Ruins of Regath if it never loaded).

## Validation
```bash
# Shape + distribution
python3 -c "import json;d=json.load(open('game-data/casts/interrupt-types.json'));e=d['entries'];from collections import Counter;print('entries',len(e));print('by type',dict(Counter(x['interruptType'] for x in e)));print('important',sum(bool(x['important']) for x in e));print('dungeons',len(set(x['dungeon'] for x in e)))"

# Coverage: interrupts from the old crawl now carrying a stun/kick verdict
python3 -c "import json;g=json.load(open('game-data/casts/method-guidance.json'))['entries'];a={(x['mob'],x['ability']) for x in g if x['methodVerdict']=='interrupt'};b={(x['mob'],x['ability']) for x in json.load(open('game-data/casts/interrupt-types.json'))['entries'] if x['interruptType'] in ('stun','kick')};print('interrupt abilities with stun/kick verdict:',len(a&b),'/',len(a));print('missing:',sorted(a-b)[:15])"
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Subagent context blowup (prior session-limit failure) | Medium | One subagent per guide; return only extracted rows, never page text |
| method.gg guides are JS-rendered → raw fetch returns a shell | Medium | Detect empty/loading shell; escalate that URL to Chrome browser tools for a rendered read |
| Prose is ambiguous stun-vs-kick | Medium | Fixed rule set (Task 2); mark ambiguous as `other`; flag the `kick & important` set for human spot-check before it's trusted red+★ |
| Ruins of Regath still won't load | Medium | Retry via Chrome tools; if still failing, ship 14-dungeon coverage and record the gap |
| Name drift vs downstream catalog | Medium | Use `method-guidance.json` mob/ability spellings exactly; milestone 2 owns normalization/alias bridging |

## Acceptance
- [ ] `game-data/casts/interrupt-types.json` created with `{source, generated, entries}`
- [ ] Every entry has `dungeon, mob, ability, interruptType (stun|kick|dodge|other), important (bool)`
- [ ] ≥90% of `method-guidance.json` `interrupt` abilities carry a stun/kick verdict (Ruins of Regath excepted if unloadable)
- [ ] `kick & important` set spot-checked for mis-tags
- [ ] No full guide-page text pulled into the main context; extraction ran via per-dungeon subagents

## Out of scope (this milestone)
Milestone 2 (merge `interruptType`/`important` into `cast-catalog.ts` + `overlay.ts` types) and milestone 3 (recolor `renderCastAlertPanel()` + `styles.css`). No app/source code changes here — this milestone produces data only.
