# Cast-Alert Interrupt-Type Colors — Stun vs Kick vs Mechanic

> Follow-on to `.claude/prds/cast-alert-overlay.prd.md` (milestone 2 shipped). This PRD covers the color re-model the user requested after playtesting the shipped panel. Treat it as **milestone 4** of the cast-alert line of work.

## Problem
The shipped cast-alert overlay colors casts by *priority* (`stop` = red, `mechanic` = amber), which tells the interrupter a cast is dangerous but not **how to stop it**. In *Fellowship*, some dangerous casts are stopped by a normal interrupt ("kick"), others require a hard stun/CC (an interrupt won't touch them), and others aren't stoppable at all (dodge/soak). An interrupter who kicks a stun-only cast wastes the interrupt and the cast still lands — the exact wipe the overlay exists to prevent. The overlay currently can't make that distinction because the underlying data doesn't carry it.

## Evidence
- **Direct user request** (recorded in `.claude/HANDOVER.md`, "IN PROGRESS — color re-model"): the user specified the target scheme — grey = stunnable (hard-stop/CC, can't be kicked), yellow = kickable (normal interrupt), red = kickable + important (must-stop, wipe risk, gets the ★), and dodge/soak "mechanic" casts kept but visually distinct (dimmed/outlined), outside the 3-color scheme.
- **Data gap is confirmed, not assumed**: the app's live data file `game-data/casts/cast-priority-enriched.json` has `finalPriority (stop|mechanic|ignore|review)` and `method.target` but **no stun-vs-kick field** (verified in repo). The distinction cannot be derived from combat logs — logs show a cast happened, not how it must be answered.
- **Source for the missing distinction exists**: method.gg dungeon guides describe interrupt method per ability in prose ("hard stop / stun / CC to stop", "interrupt or use a CC on the cast", "avoid / soak / dispel"). A prior crawl already produced `game-data/casts/method-guidance.json` (376 abilities across 14 of 15 dungeons; Ruins of Regath failed to load). The re-crawl to extract interrupt-type has **not** succeeded yet — the dispatched subagent hit a session limit and `game-data/casts/interrupt-types.json` was never written.
- Assumption still needing validation: that showing the *interrupt method* (not just danger) makes interrupters pick the right stop tool — validate via playtest.

## Users
- **Primary**: LFG / group-dungeon interrupters (the "kicker") in Eternal keys who must decide, in the moment, whether to kick, stun, or dodge a flagged cast.
- **Not for**: Top-end players who already know every cast's interrupt method; solo content with no interrupt pressure.

## Hypothesis
We believe **recoloring cast alerts by interrupt method — grey = stunnable, yellow = kickable, red + ★ = kickable & important, with dodge/soak mechanics shown in a distinct dimmed style** will help interrupters **apply the correct stop tool on the first attempt**.
We'll know we're right when **playtesters stop flagged casts with the right method (kick vs stun) and fewer dangerous casts complete than under the priority-only coloring**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Interrupt-type coverage of shown casts | ≥90% of `stop`/`mechanic` casts currently rendered carry an `interruptType` verdict | Reconcile `interrupt-types.json` against the casts `buildPullCasts` emits |
| No mis-tiered "important" reds | 0 casts shown red+★ that are actually stun-only or dodge | Human spot-check of the `kick & important` set |
| Correct-method interrupts in playtest | Increase vs. priority-only baseline | Playtest observation / log replay of `ABILITY_CAST_SUCCESS` on flagged casts |

## Scope
**MVP** — Extract an interrupt-type verdict per named cast from the method.gg guides into `game-data/casts/interrupt-types.json` (`{dungeon, mob, ability, interruptType: stun|kick|dodge|other, important: bool}`), join it into the cast catalog, and recolor the existing cast-alert panel so each shown cast reads as stun (grey), kick (yellow), kick-important (red + ★), or dodge/soak mechanic (dimmed/outlined). Casts with no verdict fall back to today's priority coloring.

**Out of scope**
- Cooldown inference ("next in ~Ns") — that is milestone 3 of the cast-alert PRD, unaffected here.
- Audio / TTS callouts.
- Curating the 86 `review` casts or filling missing ability IDs — coverage stays a living-data problem.
- Re-loading the Ruins of Regath guide as a blocker — retry it, but ship with the 14-dungeon coverage if it still fails.
- Any game-side change (ability renames, etc.).

## Interrupt-type model (target)
| Color | Class (repurpose/add) | Condition | ★ |
|---|---|---|---|
| Grey | stun (new/`cast-prio-stun`) | `interruptType = stun` | no |
| Yellow | kick (new) | `interruptType = kick` AND not `important` | no |
| Red | `cast-prio-stop` (repurposed) | `interruptType = kick` AND `important` | yes |
| Dimmed/outlined | `cast-prio-mechanic` (repurposed) | `interruptType = dodge`/soak | no |
| Fallback | current priority classes | no `interruptType` verdict | per today |

Classification rules for the crawl (from HANDOVER): `stun` = "hard stop / stun / CC to stop / cannot be interrupted"; `kick` = "interrupt or use a CC on the cast"; `dodge` = avoid / soak / dispel; `important` = wipe/death-risk wording ("MUST be kicked", "will wipe", "lethal", "quickly burst players down").

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Interrupt-type data extraction | `game-data/casts/interrupt-types.json` created: 113 entries across all 15 dungeons (Ruins of Regath rendered via Chrome). 69/69 of method-guidance's generic `interrupt` casts now split into stun (11) vs kick (91), with 20 kick+important (red+★). 11 ambiguous casts flagged for spot-check. | complete | `.claude/plans/cast-interrupt-type-colors.plan.md` |
| 2 | Data merge + type plumbing | Side table `interrupt-types.json` loaded in `cast-catalog.ts`, joined by normalized mob+ability; `CastCatalogEntry` + `PullCast` carry `interruptType`/`important`; passed through `buildPullCasts`. tsc/eslint/build/harness green; verdicts reach `pullCasts` (Dread Arc=kick+important). | complete | `.claude/plans/cast-interrupt-type-colors-m2.plan.md` |
| 3 | Recolor the panel | `renderCastAlertPanel()` + `styles.css` implement grey=stun / yellow=kick / red+★=kick+important / dashed-dimmed=mechanic, with priority-color fallback. Added an out-of-combat 'Preview cast alerts (test)' toggle injecting sample casts; verified via headless render. `buildPullCasts` filter left as stop+mechanic (unchanged). | complete | — |

## Open Questions
- [ ] **Yellow-tier inclusion**: does the panel broaden `buildPullCasts` (currently `stop`+`mechanic` only) to surface kickable-non-important casts, or only recolor casts already shown? Broadening adds signal but risks the clutter the cast-alert PRD warned about.
- [ ] **Fallback color**: for a shown cast with no `interruptType` verdict, keep today's priority color, or render a neutral "unknown method" style so it isn't mistaken for a confirmed kick?
- [ ] **`important` precision**: the `important` flag is keyword-heuristic from guide prose — does it need a human spot-check pass before red+★ is trusted, and who owns it?
- [ ] **Ruins of Regath**: acceptable to ship v1 without it if the guide still won't load, or is full 15-dungeon coverage a gate?
- [ ] **Name matching**: interrupt-types (guide names) vs enriched catalog (log/ability-id names) — is normalized mob+ability match reliable, or is an ability-id bridge needed for the mismatches the cast-alert PRD already flagged (e.g. "Charge"≠Charged Bolt)?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Re-crawl subagent fails again (session limit, as before) | Medium | High | Dedicated subagent, 15 URLs chunked, output streamed to `interrupt-types.json`; keep full guide pages out of the main context |
| Keyword classification mis-tags stun as kick (or vice versa) | Medium | High | Explicit rule set (above); human spot-check of the `kick & important` red set before trusting it |
| Guide-name ↔ catalog-name mismatch drops verdicts | Medium | Medium | Normalize mob+ability; log unmatched casts; bridge known aliases; fall back to priority color |
| Ruins of Regath still won't load | Medium | Low | Retry; ship 14-dungeon coverage and treat the 15th as a known gap |
| Recolor confuses users mid-playtest (grey now means stun, not just-cast) | Low | Medium | Keep the just-cast/interrupted state styling distinct from the tier color; note the change in-panel or in release notes |

---
*Status: milestones 1-3 COMPLETE (data + plumbing + recolor). Preview toggle added for out-of-combat visual test. Uncommitted; see HANDOVER for CRLF/commit guidance.*
*Data artifacts: `game-data/casts/cast-priority-enriched.json` (app-loaded), `method-guidance.json` (crawl source), and the to-be-created `interrupt-types.json`.*
