import type { CastPriority, CastTarget, CurrentPullNpc, FinalizedEncounter, FinalizedState, NpcCastRecord, NpcCastTrack, ParserState, PullCast, PullCastMob } from '../../types/overlay';

import { buildCurrentPullSummary } from './parser-dungeon';
import { getCastsForMob } from './cast-catalog';
import { computeRelicCooldownState } from './parser-relics';
import { parseTs } from './parser-line-utils';
import {
  MAX_RECENT_SKILL_ACTIVATIONS,
  buildUsesPerBoss,
  isLikelyCombatAbility,
  serializeAbilityStat,
  sortAbilities,
} from './parser-state';

const CAST_PRIORITY_RANK: Record<CastPriority, number> = { stop: 0, mechanic: 1, ignore: 2, review: 3 };

function castTargetSeverity(target: CastTarget): number {
  if (target === 'group') return 0;
  if (target === 'random') return 1;
  if (target === 'self') return 2;
  return 3;
}

// Across all live instances of a mob type, pick the most-relevant live status
// for an ability: an active cast wins, otherwise the most recently resolved.
function mergeLiveCast(tracks: NpcCastTrack[], abilityId: number): NpcCastRecord | null {
  let best: NpcCastRecord | null = null;
  for (const track of tracks) {
    const record = track.casts.get(abilityId);
    if (!record) continue;
    if (record.status === 'casting') return record;
    if (!best) best = record;
    else if ((Date.parse(record.lastResolvedAt || '') || 0) > (Date.parse(best.lastResolvedAt || '') || 0)) best = record;
  }
  return best;
}

// Build the ranked cast-alert view: alive caster-mobs in the pull (deduped by
// name), each with its dangerous casts and live status, filtered to stop/mechanic.
function buildPullCasts(state: ParserState, mobs: CurrentPullNpc[]): PullCastMob[] {
  const groups = new Map<string, { name: string; tracks: NpcCastTrack[]; count: number }>();
  for (const mob of mobs) {
    if (mob.alive === false) continue;
    const name = mob.name || '';
    if (!getCastsForMob(name).length) continue;
    const key = name.toLowerCase();
    let group = groups.get(key);
    if (!group) { group = { name, tracks: [], count: 0 }; groups.set(key, group); }
    group.count += 1;
    const track = state.pullCasts.get(mob.unitId);
    if (track) group.tracks.push(track);
  }

  const result: PullCastMob[] = [];
  for (const group of groups.values()) {
    const casts: PullCast[] = getCastsForMob(group.name)
      .filter((entry) => entry.priority === 'stop' || entry.priority === 'mechanic')
      .map((entry) => {
        const live = mergeLiveCast(group.tracks, entry.abilityId);
        return {
          abilityId: entry.abilityId,
          ability: entry.ability,
          priority: entry.priority,
          target: entry.target,
          affixOnly: entry.affixOnly,
          interruptType: entry.interruptType,
          important: entry.important,
          status: live?.status ?? 'available',
          lastResolvedAt: live?.lastResolvedAt ?? null,
        };
      })
      .sort((a, b) => (CAST_PRIORITY_RANK[a.priority] - CAST_PRIORITY_RANK[b.priority]) || (castTargetSeverity(a.target) - castTargetSeverity(b.target)) || a.ability.localeCompare(b.ability));
    if (!casts.length) continue;
    result.push({ unitId: group.name.toLowerCase(), mobName: group.name, instances: group.count, topPriority: casts[0].priority, casts });
  }

  result.sort((a, b) => (CAST_PRIORITY_RANK[a.topPriority] - CAST_PRIORITY_RANK[b.topPriority]) || (castTargetSeverity(a.casts[0].target) - castTargetSeverity(b.casts[0].target)) || a.mobName.localeCompare(b.mobName));
  return result;
}

function shouldHidePlayersUntilPartyResolved(state: ParserState): boolean {
  const hasDungeonStart = !!state?.dungeon?.startedAt;
  return hasDungeonStart && state.collectingDungeonParty && state.dungeonPartyIds.size === 0;
}

function finalizeState(state: ParserState): FinalizedState {
  const derivedLatestLogTs = [...state.players.values()]
    .flatMap((player) => [
      parseTs(player.spirit?.ts),
      ...(player.relics || []).map((x) => parseTs(x.lastUsedAt)),
    ])
    .filter((x): x is number => x != null)
    .reduce((max, x) => Math.max(max, x), 0);
  const latestLogTs = Math.max(parseTs(state.latestLogTs) || 0, derivedLatestLogTs || 0);
  const timeCorrectionMs = Number(state.dungeon?.timeCorrectionMs || 0);
  const correctedClientNowMs = Date.now() + timeCorrectionMs;
  const cooldownNowMs = Math.max(correctedClientNowMs, latestLogTs || 0);
  const hidePlayersUntilPartyResolved = shouldHidePlayersUntilPartyResolved(state);

  const encounters: FinalizedEncounter[] = state.encounters.map((encounter) => {
    const abilitiesByPlayer = [...encounter.abilitiesByPlayer.entries()].map(([playerKey, abilitiesMap]) => ({
      playerKey,
      abilities: sortAbilities(abilitiesMap.values())
        .filter(isLikelyCombatAbility)
        .map(serializeAbilityStat),
    }));

    return {
      id: encounter.id,
      name: encounter.name,
      startedAt: encounter.startedAt,
      endedAt: encounter.endedAt,
      success: encounter.success,
      damageByPlayer: [...encounter.damageByPlayer.entries()].map(([playerKey, amount]) => ({ playerKey, amount })).sort((a, b) => b.amount - a.amount),
      healingByPlayer: [...encounter.healingByPlayer.entries()].map(([playerKey, amount]) => ({ playerKey, amount })).sort((a, b) => b.amount - a.amount),
      abilitiesByPlayer,
      npcDeaths: encounter.npcDeaths,
    };
  });

  const players = [...state.players.values()]
    .filter((player) => {
      if (hidePlayersUntilPartyResolved) return false;
      if (state.dungeonPartyIds.size > 0) return state.dungeonPartyIds.has(player.id);
      return true;
    })
    .map((player) => {
      const abilities = sortAbilities(player.abilities.values()).map(serializeAbilityStat);
      const combatAbilities = abilities.filter(isLikelyCombatAbility);
      return {
        ...player,
        spiritHistory: Array.isArray(player.spiritHistory) ? player.spiritHistory.map((snapshot) => ({ ...snapshot })) : [],
        relics: computeRelicCooldownState(player, cooldownNowMs),
        abilities,
        combatAbilities,
        usesPerBoss: buildUsesPerBoss(player, state.encounters),
      };
    })
    .sort((a, b) => b.damageDone - a.damageDone);

  const visiblePlayerIds = new Set(players.map((player) => player.id));
  const playerById = new Map(players.map((player) => [player.id, player]));
  const recentSkillsPlayerId = state.recentSkillsPlayerId && visiblePlayerIds.has(state.recentSkillsPlayerId)
    ? state.recentSkillsPlayerId
    : null;
  const recentSkills = (state.recentSkillActivations || [])
    .filter((entry) => visiblePlayerIds.has(entry.playerId || ''))
    .filter((entry) => !recentSkillsPlayerId || entry.playerId === recentSkillsPlayerId)
    .sort((a, b) => (parseTs(a.ts) || 0) - (parseTs(b.ts) || 0))
    .slice(-MAX_RECENT_SKILL_ACTIVATIONS)
    .map((entry) => {
      const player = playerById.get(entry.playerId || '');
      return {
        ...entry,
        classId: player?.classId ?? entry.classId ?? null,
        className: player?.className ?? entry.className ?? null,
        playerName: player?.name ?? entry.playerName ?? null,
      };
    });

  return {
    latestLogTs: latestLogTs ? new Date(latestLogTs).toISOString() : (state.latestLogTs || null),
    dungeon: {
      startedAt: state.dungeon.startedAt,
      timeCorrectionMs: state.dungeon.timeCorrectionMs,
      timeCorrectionServerTs: state.dungeon.timeCorrectionServerTs,
      timeCorrectionClientTs: state.dungeon.timeCorrectionClientTs,
      endedAt: state.dungeon.endedAt,
      name: state.dungeon.name,
      id: state.dungeon.id,
      difficulty: state.dungeon.difficulty,
      affixes: state.dungeon.affixes,
      success: state.dungeon.success,
      durationMs: state.dungeon.durationMs,
      completionSeconds: state.dungeon.completionSeconds,
      deaths: state.dungeon.deaths,
      extra: state.dungeon.extra,
      data: state.dungeon.data,
      killCount: Number(state.dungeon?.data?.killcount) || null,
      completedPercent: Number(state.dungeon?.completedPercent || 0),
    },
    timeCorrectionMs,
    timeCorrectionServerTs: state.dungeon.timeCorrectionServerTs,
    timeCorrectionClientTs: state.dungeon.timeCorrectionClientTs,
    players,
    recentSkills,
    recentSkillsPlayerId,
    recentSkillsPlayerName: recentSkillsPlayerId ? (playerById.get(recentSkillsPlayerId)?.name ?? state.recentSkillsPlayerName ?? null) : null,
    partyPlayerIds: [...state.dungeonPartyIds],
    encounters,
    npcDeaths: state.npcDeaths,
    playerDeaths: state.playerDeaths,
    pullCasts: buildPullCasts(state, buildCurrentPullSummary(state).mobs),
    currentPull: buildCurrentPullSummary(state),
    counters: Object.fromEntries(state.rawCounters),
  };
}

export {
  finalizeState,
};
