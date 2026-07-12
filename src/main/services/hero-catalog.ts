// Single main-process source of truth for hero (character) identity.
// NOTE: the renderer cannot import this module (renderer modules are IIFE
// globals), so panels.ts keeps a small mirrored hero-color map — keep in sync.

const HERO_INFO_BY_CLASS_ID: Record<number, { name: string; color: string }> = {
  22: { name: 'Helena', color: '#b46831' },
  13: { name: 'Meiko', color: '#28e05c' },
  25: { name: 'Xavian', color: '#077365' },
  24: { name: 'Aeona', color: '#fc9fec' },
  14: { name: 'Sylvie', color: '#ea4f84' },
  20: { name: 'Vigour', color: '#dddbc5' },
  11: { name: 'Mara', color: '#965a90' },
  10: { name: 'Tariq', color: '#527af5' },
  7: { name: 'Ardeos', color: '#eb6328' },
  2: { name: 'Elarion', color: '#935dff' },
  17: { name: 'Rime', color: '#1ea3ee' },
  9: { name: 'Gunde', color: '#913539' },
};

// Bucket key for clears whose hero could not be determined (e.g. a log file
// that starts mid-run and never replays the party COMBATANT_INFO block).
const UNKNOWN_HERO = 'Unknown';

function getHeroNameForClassId(classId: number | null | undefined): string | null {
  if (classId == null || !Number.isFinite(Number(classId))) return null;
  return HERO_INFO_BY_CLASS_ID[Number(classId)]?.name || null;
}

export {
  HERO_INFO_BY_CLASS_ID,
  UNKNOWN_HERO,
  getHeroNameForClassId,
};
