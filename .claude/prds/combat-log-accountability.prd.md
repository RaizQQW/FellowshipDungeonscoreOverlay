# Combat Log Accountability — Death Log & Boss Timers

## Problem
Group and LFG dungeon pushers wipe or fall off pace without a clear, in-game explanation. The combat log listener already ingests the events that explain *why* a pull failed (who died, to what) and *whether the group is on pace* (encounter timing), but none of that is surfaced. Today a pusher has to alt-tab to an external log site after the run — too late to adjust mid-key. Left unsolved, groups repeat the same mistakes and can't self-diagnose between attempts.

## Evidence
- Assumption — needs validation via {user research with LFG pushers + observing which post-run log sites they open}.
- Grounded feasibility: the listener already parses `UNIT_DEATH`, `ABILITY_DAMAGE` / `SWING_DAMAGE` / periodic damage, `EFFECT_APPLIED`, and `ENCOUNTER_START` / `ENCOUNTER_END` / `DUNGEON_START` / `DUNGEON_END`, so both capabilities can be derived from data already captured. (Not evidence of demand — evidence of feasibility.)

## Users
- **Primary**: LFG / group dungeon pushers — players climbing keys in pickup or semi-organized groups who need fast, in-game accountability ("why did we wipe?") and pace awareness ("are we going to beat the timer?") between attempts.
- **Not for**: Solo players who don't wipe to group mechanics; retrospective theorycrafters who are fine with external log sites; streamers wanting broadcast overlays (possible later, not the target now).

## Hypothesis
We believe **surfacing an in-game death/mistake log and a live boss/pull timer** will **let groups diagnose wipes and judge pace without alt-tabbing** for **LFG pushers**.
We'll know we're right when **users can, after a wipe, identify who died and to what from the overlay alone, and check encounter pace during a boss** — validated by playtests where testers answer "why did we wipe?" correctly from the overlay.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| "Why did we wipe?" answerable from overlay | Testers correctly attribute cause in ≥8/10 wipes | Moderated playtest |
| Alt-tabs to external log site per session | Decrease vs. baseline | Self-report / observed session |
| Death events correctly attributed | ≥90% of deaths show correct victim + plausible cause | Log replay against known runs |

## Scope
**MVP** — A death log listing, for the current run, each party death with victim, timestamp/where-in-run, and best-available cause (killing/recent damage source); plus a live encounter timer showing elapsed boss/pull time and a comparison to the group's prior time for that encounter.

**Out of scope**
- Boss *phase* detection (health-threshold / phase markers) — defer until it's confirmed the log exposes enough to derive phases reliably.
- Cross-run persistent history / trends — MVP is current-run only.
- Full damage/healing meter — a different direction, not selected.
- Public shareable recap cards and streamer overlays — later audiences.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Death & mistake log | After a wipe, the group sees who died, when, and to what — no alt-tab | pending | — |
| 2 | Live boss / pull timer | During an encounter, the group sees elapsed time and pace vs. their prior best | pending | — |

## Feasibility check (verified against 8 real logs, 2026-07-13)
Checked against the `example_logs/` combat logs (~1 GB across 8 runs), not just the parser:
- **Player deaths are a DIFFERENT event than the parser assumes.** `UNIT_DEATH` fires only for NPCs — `|UNIT_DEATH|Player-` appears **0 times in all 8 logs**. Player deaths are logged as **`ALLY_DEATH`**, which the parser does not handle at all today. Example: `ALLY_DEATH|Player-…|"digge"|Npc-…|"Vel'korath…"|2986|"Marching Vessels: Unraveling Flesh"`. It carries victim + killer + killing-ability name — exactly what the death log needs — but the feature must be built on `ALLY_DEATH`, and the overlay's current per-player death counter (keyed on `UNIT_DEATH|Player-`) is almost certainly a latent bug that always reads 0.
- **Bonus signal: `RESURRECT`** is logged (`RESURRECT|reviverPlayer|…|deadPlayer|…|"Revive"`) — enables combat-res / battle-res tracking for free.
- **Data is party-wide.** `ALLY_DEATH` fires for every party member (multiple distinct `Player-*` victims per run), so a group-wide death log is real, not local-only.
- **Boss/encounter timing is present and clean.** `ENCOUNTER_START|id|["Boss name"]` and `ENCOUNTER_END|id|["Boss name"]|<success>` bracket each boss; `DUNGEON_START/END` carry run-level timing. Live elapsed time and per-boss splits are directly derivable.
- **Phases are NOT in the log** (no health-% / phase markers) — confirms deferring phase detection.

## Open Questions
- [x] Death cause attribution — RESOLVED: `ALLY_DEATH` includes victim, killer, and killing-ability name.
- [x] Party-wide vs local — RESOLVED: `ALLY_DEATH` fires for every party member.
- [ ] The parser must learn `ALLY_DEATH` (and optionally `RESURRECT`) — the death log cannot reuse existing `UNIT_DEATH` handling. Also fix the latent player-death-counter bug while here.
- [ ] "Pace vs. prior" needs a persisted prior encounter time — encounters are current-run/in-memory only. Elapsed-timer-only ships without it.
- [ ] Overlay real estate is already tight (the scores panel just needed a hero toggle to fit) — where do two new panels live without crowding the left side?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ~~Log doesn't cleanly identify killing-blow source~~ RETIRED | — | — | Resolved: `UNIT_DEATH` carries killer + killing ability |
| Remote party members' fine-grained damage may be coarser than local | Low | Medium | Death lines are party-scoped and sufficient; treat detailed "hits taken" as local-only enrichment |
| Player-death detail must be persisted (only a counter today) | High | Low | Retain the already-parsed death fields for `Player-*` victims |
| New panels worsen existing overlay crowding | High | Medium | Reuse the toggle/tab pattern; make panels opt-in and collapsible |
| "Pace vs. prior" needs persistence the MVP excludes | Medium | Medium | Ship elapsed-timer-only first; add comparison once persistence exists |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
