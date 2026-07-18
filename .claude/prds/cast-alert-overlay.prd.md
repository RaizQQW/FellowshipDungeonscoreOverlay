# Interrupt Alert Overlay — "Must-Stop" Casts Per Pull

## Problem
In group dungeons, one un-interrupted mob cast can wipe the party, but players have no in-game reminder of *which* casts in the current pull are the dangerous ones — the knowledge lives in a Reddit post and players' memory. Pugs in particular let killable casts through because nobody knows "this pack has a Kidnap / Sinnari's Wrath / Together Stronk!" until it's already going off. The cost of leaving this unsolved is repeated avoidable deaths and wipes.

## Evidence
- Community demand is concrete: a widely-shared Reddit "List of All the Must-Stop casts in Fellowship" exists precisely because players need this reference mid-run (supplied verbatim by the requester).
- Feasibility is grounded in the real logs: `ABILITY_CAST_START` from `Npc-*` carries mob name, ability id, and ability name. Across the 8 example logs, **195 distinct mob casts** were extracted; **35 map to the community must-stop list** with stable ability IDs (e.g. Sinnari's Wrath `1618`, Kidnap `469`, Together Stronk! `626`, Big Oogha Flame `202`, Ball Lightning `616`). Seed data: `game-data/casts/cast-priority.json`.
- **Cross-checked against Method.gg** (2026-07-14): crawled all 15 dungeon guides (`method-guidance.json`, 376 abilities, 14 dungeons — Ruins of Regath failed to load). Reconciled with the log table (`cast-priority-enriched.json`): 160/195 observed casts matched. The guide corrected the log heuristic on edge cases — caught Bolt-rule false-negatives (`Necrotic Bolt`, `Shadow Bolt`, `Hydrobolt` are dangerous despite "Bolt"), fixed two fuzzy-match errors (`Charge`≠Charged Bolt, `Shatter`≠Shattering Barrier), and added per-cast **target** (tank/group/random) and **affix-gating** (Vayr's Legacy) that logs alone can't give.
- Assumption still needing validation: that surfacing this live actually changes interrupt behaviour — validate via playtest.

## Users
- **Primary**: LFG / group dungeon players (esp. the interrupter/kicker role) who need to know, per pull, which casts to watch and stop.
- **Not for**: Top-end players who have every cast memorised; solo content with no interrupt pressure.

## Hypothesis
We believe **a per-pull overlay of the pull's must-stop casts (highlighted when a cast starts, greyed for a few seconds after it resolves, with an estimated cooldown)** will **reduce un-interrupted dangerous casts** for **group dungeon players**.
We'll know we're right when **playtesters correctly pre-empt the flagged casts and let fewer through than without the overlay**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Dangerous casts completed (not interrupted) per run | Decrease vs. baseline | Count `ABILITY_CAST_SUCCESS` of "stop"-priority casts, before/after |
| Coverage of community must-stop list by ability id | ≥90% of listed casts mapped to a real id (across all dungeons) | Reconcile `cast-priority.json` vs. the list |
| Correct pull attribution | Flagged casts belong to mobs actually in the pull | Log replay spot-check |

## Scope
**MVP** — A curated cast-priority table keyed on ability id + mob (seeded from `cast-priority.json`, human-reviewed), and an overlay panel that, during a pull, lists the "stop" casts the engaged mobs can do; when one starts it highlights, and when it resolves it greys out for a few seconds.

**Out of scope**
- Cooldown *inference* from logs (estimate next-cast timing) — desirable second milestone, not required to test the core hypothesis.
- Audio cues / TTS callouts.
- Auto-tiering the 143 "review" casts — MVP ships the confirmed "stop" set; the rest stay unclassified until human-reviewed.
- Renaming abilities / anything requiring game-side changes.

## Importance & priority model
Reconciled priority tiers (final, in `cast-priority-enriched.json`), highest-attention first:

| Tier | Meaning | Overlay treatment |
|---|---|---|
| `stop` | Interrupt — heals, group/random damage, hard CC, detonation | Top rank; highlight when cast starts |
| `mechanic` | Dodge / soak / dispel — positioning, not a kick | Shown, lower rank; not an interrupt callout |
| `ignore` | Tank damage / Bolt-rule | Deprioritised or hidden by default |
| `review` | Seen in logs, no guide verdict yet | Hidden until curated |

Two modifiers ride alongside the tier: **target** (`tank` casts matter less than `group`/`random`) and **affixOnly** (only relevant under Vayr's Legacy). A handful of tier-nuance cases keep a Reddit-override note where the community rates a "tank" cast higher than Method (e.g. `Venom Bolt`, `Arcane Strike`, `Icy Death`, `Poisonado` — healing-debuff / big tank hits).

**Mob ranking (goal a):** a mob's rank = the highest-priority cast it can do (`stop` > `mechanic` > `ignore`), tie-broken by most-dangerous target (`group`/`random` > `tank`), then cast frequency. Mobs whose only casts are `ignore`/`review` are filtered out of the panel.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Cast-priority table (data) | Log-derived + Method.gg-reconciled `cast-priority-enriched.json` feeding the app; sign-off on ~15 tier-nuance cases + missing IDs pending | in-progress | — |
| 2 | Per-pull cast overlay (goals a+b) | Right-side panel: pull's caster-mobs filtered to those with casts, ranked by interrupt priority; each mob shows its casts as available vs. just-cast (grey for a few seconds) | complete | `.claude/plans/cast-alert-overlay.plan.md` |
| 3 | Cooldown inference (goal c) | Each cast shows an estimated "next in ~Ns" inferred from observed inter-cast intervals per mob type | pending | — |

## Open Questions
- [ ] Priority tiers: is a 3-level scheme (stop / ignore-bolt / review) enough, or do the "stop" casts need sub-ranking (hard-stop vs. nice-to-kick), as the Reddit author notes?
- [ ] "Which casts a pull HAS" before anyone casts: derive from the mobs currently engaged (parser tracks pull mobs) mapped to their known casts — confirm the pull's mob roster is reliable enough to pre-populate.
- [ ] Fuzzy matches in the seed table need a human pass (e.g. "Charge" mis-matched "Charged Bolt"; "Barbed Chain" is really `Bloodlash Wake` `292`). Who owns the curation?
- [ ] Some listed casts weren't in these 8 logs (Rune of Detonation, Withering Bolt, Shadow Lob, Wicked Strikes…) — need more logs / manual ids to reach full coverage.
- [ ] Grey-out trigger: `ABILITY_CAST_SUCCESS` vs `ABILITY_CAST_FAIL` (interrupted) — should an interrupted cast grey-out differently ("kicked!") than one that completed?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Colloquial vs in-game name mismatches produce wrong mappings | Medium | Medium | Key on ability id (stable), not name; human-review the seed table |
| Cooldown estimates are noisy (adds, resets, phase changes) | High | Low | Present as rough estimate only; defer to milestone 3 |
| Incomplete coverage (dungeons/casts absent from sample logs) | High | Medium | Treat table as living data; add ids as more logs arrive |
| Overlay clutter on the already-full left side | Medium | Medium | Show only the current pull's stop-casts; reuse opt-in/draggable pattern |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
*Seed data artifact: `game-data/casts/cast-priority.json` (195 casts, 35 confirmed must-stop).*
