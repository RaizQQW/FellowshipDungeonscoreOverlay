import * as fs from 'fs';
import * as path from 'path';
import { fromProjectRoot } from '../utils/project-paths';
import type { CastCatalogEntry, CastInterruptType, CastPriority, CastTarget } from '../../types/overlay';

// Loads the reconciled cast-priority table (log data x method.gg guides) and
// indexes it by ability id and by mob name so the parser/finalize layer can
// answer "what dangerous casts can this mob do?" and "is this ability tracked?".

interface RawCastEntry {
  abilityId?: number;
  ability?: string;
  mob?: string;
  finalPriority?: string;
  method?: { target?: string | null; affixOnly?: boolean };
}

const CAST_FILE = fromProjectRoot('game-data', 'casts', 'cast-priority-enriched.json');
const INTERRUPT_FILE = fromProjectRoot('game-data', 'casts', 'interrupt-types.json');
const VALID_PRIORITY: CastPriority[] = ['stop', 'mechanic', 'ignore', 'review'];
const VALID_TARGET: Exclude<CastTarget, null>[] = ['tank', 'group', 'random', 'self'];
const VALID_INTERRUPT: CastInterruptType[] = ['stun', 'kick', 'dodge', 'other'];

let byId: Map<number, CastCatalogEntry> | null = null;
let byMob: Map<string, CastCatalogEntry[]> | null = null;

function normalizeMob(name: string): string {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function coercePriority(raw: unknown): CastPriority {
  return VALID_PRIORITY.includes(raw as CastPriority) ? (raw as CastPriority) : 'review';
}

function coerceTarget(raw: unknown): CastTarget {
  return VALID_TARGET.includes(raw as Exclude<CastTarget, null>) ? (raw as CastTarget) : null;
}

function coerceInterruptType(raw: unknown): CastInterruptType | null {
  return VALID_INTERRUPT.includes(raw as CastInterruptType) ? (raw as CastInterruptType) : null;
}

interface RawInterruptEntry {
  mob?: string;
  ability?: string;
  interruptType?: string;
  important?: boolean;
}

interface InterruptVerdict {
  interruptType: CastInterruptType | null;
  important: boolean;
}

function loadInterruptTable(): Map<string, InterruptVerdict> {
  const table = new Map<string, InterruptVerdict>();
  let raw: { entries?: RawInterruptEntry[] };
  try {
    raw = JSON.parse(fs.readFileSync(INTERRUPT_FILE, 'utf8')) as { entries?: RawInterruptEntry[] };
  } catch {
    return table;
  }
  for (const entry of raw.entries || []) {
    const key = `${normalizeMob(String(entry.mob || ''))}|${normalizeMob(String(entry.ability || ''))}`;
    if (key === '|') continue;
    table.set(key, { interruptType: coerceInterruptType(entry.interruptType), important: Boolean(entry.important) });
  }
  return table;
}

function load(): void {
  byId = new Map();
  byMob = new Map();
  const interrupts = loadInterruptTable();
  let raw: { casts?: RawCastEntry[] };
  try {
    raw = JSON.parse(fs.readFileSync(CAST_FILE, 'utf8')) as { casts?: RawCastEntry[] };
  } catch {
    return;
  }
  for (const entry of raw.casts || []) {
    const abilityId = Number(entry.abilityId);
    if (!Number.isFinite(abilityId)) continue;
    const interruptKey = `${normalizeMob(String(entry.mob || ''))}|${normalizeMob(String(entry.ability || ''))}`;
    const verdict = interrupts.get(interruptKey);
    const catalogEntry: CastCatalogEntry = {
      abilityId,
      ability: String(entry.ability || ''),
      mob: String(entry.mob || ''),
      priority: coercePriority(entry.finalPriority),
      target: coerceTarget(entry.method?.target),
      affixOnly: Boolean(entry.method?.affixOnly),
      interruptType: verdict?.interruptType ?? null,
      important: Boolean(verdict?.important),
    };
    if (!byId.has(abilityId)) byId.set(abilityId, catalogEntry);
    const key = normalizeMob(catalogEntry.mob);
    if (!key) continue;
    const list = byMob.get(key);
    if (list) list.push(catalogEntry);
    else byMob.set(key, [catalogEntry]);
  }
}

function ensureLoaded(): void {
  if (byId === null || byMob === null) load();
}

export function getCastByAbilityId(abilityId: number | null | undefined): CastCatalogEntry | null {
  if (abilityId === null || abilityId === undefined || !Number.isFinite(abilityId)) return null;
  ensureLoaded();
  return byId?.get(Number(abilityId)) ?? null;
}

export function getCastsForMob(mobName: string | null | undefined): CastCatalogEntry[] {
  ensureLoaded();
  return byMob?.get(normalizeMob(String(mobName || ''))) ?? [];
}

export { normalizeMob as normalizeMobName };
