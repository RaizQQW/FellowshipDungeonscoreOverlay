import type { DungeonBestScores, HeroBestScores } from '../../types/overlay';

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { LOG_FILE_EXTENSIONS } from '../config/overlay-settings';
import { UNKNOWN_HERO, getHeroNameForClassId } from './hero-catalog';
import { isPlayerId, toNumber } from './parser-line-utils';

// Combat log line shapes (fields validated against real Season 3 logs):
// <ts>|DUNGEON_END|"<name>"|<dungeonId>|<tier>|[affixes]|<successFlag>|<durationMs>|<score>|<deaths>|<chests>
// <ts>|COMBATANT_INFO|<?>|Player-<id>|"<playerName>"|<?>|<classId>|...
// The score float is the same number the in-game Dungeon Records screen shows.
// The only reliable "counted clear" signal is score > 0: success-flag and
// party-list based filters both produce false positives/negatives.
//
// Hero attribution: the first player COMBATANT_INFO after DUNGEON_START is the
// local player (same convention parser.ts uses for recentSkillsPlayerId), so
// its classId names the hero the clear belongs to.

const DUNGEON_END_MARKER = '|DUNGEON_END|';
const DUNGEON_START_MARKER = '|DUNGEON_START|';
const COMBATANT_INFO_MARKER = '|COMBATANT_INFO|';
const ARCHIVE_FOLDER_HINT = 'archive';

export interface DungeonEndEvent {
  timestamp: string;
  name: string;
  tier: number;
  score: number;
  hero: string;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith('"') && trimmed.endsWith('"')
    ? trimmed.slice(1, -1)
    : trimmed;
}

function parseDungeonEndLine(line: string, hero: string = UNKNOWN_HERO): DungeonEndEvent | null {
  if (!line || !line.includes(DUNGEON_END_MARKER)) return null;

  const parts = line.split('|');
  if (parts.length < 9 || parts[1] !== 'DUNGEON_END') return null;

  const timestamp = parts[0].trim();
  const name = unquote(parts[2] || '');
  const tier = Number(parts[4]);
  const score = Number(parts[8]);

  if (!name || !timestamp) return null;
  if (!Number.isFinite(score) || score <= 0) return null;

  return {
    timestamp,
    name,
    tier: Number.isFinite(tier) ? Math.round(tier) : 0,
    score,
    hero: hero || UNKNOWN_HERO,
  };
}

// Extracts the hero name from the local player's COMBATANT_INFO line.
// Returns null for NPC combatants or unknown class ids.
function parseCombatantHeroLine(line: string): string | null {
  if (!line || !line.includes(COMBATANT_INFO_MARKER)) return null;

  const parts = line.split('|');
  if (parts.length < 7 || parts[1] !== 'COMBATANT_INFO') return null;
  if (!isPlayerId(parts[3])) return null;

  return getHeroNameForClassId(toNumber(parts[6]));
}

function isOnOrAfterSeasonStart(timestamp: string, seasonStartDate: string): boolean {
  const eventMs = Date.parse(timestamp);
  const seasonMs = Date.parse(`${seasonStartDate}T00:00:00Z`);
  if (!Number.isFinite(eventMs) || !Number.isFinite(seasonMs)) return false;
  return eventMs >= seasonMs;
}

function mergeDungeonBestScores(
  existing: HeroBestScores,
  events: DungeonEndEvent[],
  seasonStartDate: string,
): { changed: boolean; next: HeroBestScores } {
  let changed = false;
  const next: HeroBestScores = { ...existing };

  for (const event of events) {
    if (!isOnOrAfterSeasonStart(event.timestamp, seasonStartDate)) continue;

    const hero = event.hero || UNKNOWN_HERO;
    const heroScores: DungeonBestScores = next[hero] || {};
    const current = heroScores[event.name];
    if (current && current.score >= event.score) continue;

    next[hero] = {
      ...heroScores,
      [event.name]: {
        score: Math.round(event.score * 100) / 100,
        tier: event.tier,
        clearedAt: event.timestamp,
      },
    };
    changed = true;
  }

  return { changed, next };
}

function isSupportedLogFile(filePath: string): boolean {
  return LOG_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function listLogFilesInDirectory(directoryPath: string): string[] {
  try {
    return fs.readdirSync(directoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(directoryPath, entry.name))
      .filter(isSupportedLogFile);
  } catch {
    return [];
  }
}

// Backfill candidates: every log in the watched directory plus any first-level
// subfolder whose name contains "archive" (e.g. "fellowshiplogsarchive").
// Files whose last modification predates the season start can't contain
// season clears and are skipped without being opened.
function collectBackfillLogFiles(directoryPath: string | null | undefined, seasonStartDate: string): string[] {
  if (!directoryPath || !fs.existsSync(directoryPath)) return [];

  const candidates: string[] = [...listLogFilesInDirectory(directoryPath)];

  try {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!entry.name.toLowerCase().includes(ARCHIVE_FOLDER_HINT)) continue;
      candidates.push(...listLogFilesInDirectory(path.join(directoryPath, entry.name)));
    }
  } catch {}

  const seasonMs = Date.parse(`${seasonStartDate}T00:00:00Z`);
  return candidates.filter((filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return !Number.isFinite(seasonMs) || stats.mtimeMs >= seasonMs;
    } catch {
      return false;
    }
  });
}

async function extractDungeonEndEventsFromFile(filePath: string): Promise<DungeonEndEvent[]> {
  const events: DungeonEndEvent[] = [];
  // Hero of the run in progress: set from the first player COMBATANT_INFO
  // after DUNGEON_START, consumed by the matching DUNGEON_END. Files that
  // start mid-run produce hero-less clears bucketed under UNKNOWN_HERO.
  let collectingParty = false;
  let currentRunHero: string | null = null;

  await new Promise<void>((resolve) => {
    let stream: fs.ReadStream;
    try {
      stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    } catch {
      resolve();
      return;
    }

    const lineReader = readline.createInterface({ input: stream, crlfDelay: Infinity });
    lineReader.on('line', (line: string) => {
      if (line.includes(DUNGEON_START_MARKER)) {
        collectingParty = true;
        currentRunHero = null;
        return;
      }

      if (collectingParty && line.includes(COMBATANT_INFO_MARKER)) {
        const hero = parseCombatantHeroLine(line);
        if (hero) {
          currentRunHero = hero;
          collectingParty = false;
        }
        return;
      }

      const event = parseDungeonEndLine(line, currentRunHero || UNKNOWN_HERO);
      if (event) {
        events.push(event);
        collectingParty = false;
        currentRunHero = null;
      }
    });
    lineReader.on('close', () => resolve());
    stream.on('error', () => {
      lineReader.close();
      resolve();
    });
  });

  return events;
}

async function scanLogFilesForBestScores(
  filePaths: string[],
  seasonStartDate: string,
  initial: HeroBestScores = {},
): Promise<{ changed: boolean; next: HeroBestScores }> {
  let changed = false;
  let next: HeroBestScores = { ...initial };

  for (const filePath of filePaths) {
    const events = await extractDungeonEndEventsFromFile(filePath);
    const merged = mergeDungeonBestScores(next, events, seasonStartDate);
    changed = changed || merged.changed;
    next = merged.next;
  }

  return { changed, next };
}

export {
  collectBackfillLogFiles,
  mergeDungeonBestScores,
  parseDungeonEndLine,
  scanLogFilesForBestScores,
};
