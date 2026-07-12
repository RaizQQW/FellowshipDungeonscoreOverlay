(() => {
  // Season 3 rotation, fully validated (104/104 scraped appearances, user-verified
  // anchors). Normals repeat every 10 eternal levels; capstone every 4.
  const NORMALS_BY_RESIDUE: Record<number, string[]> = {
    0: ['Urrak Markets', 'Silken Hollow', "Scryer's Peak"],
    1: ['Everdawn Grove', 'Godfall Quarry', 'Ruins of Regath'],
    2: ['Empyrean Sands', 'Wyrmheart', "Sailor's Abyss"],
    3: ['Stormwatch', 'Urrak Markets', 'Silken Hollow'],
    4: ['Everdawn Grove', 'Godfall Quarry', "Scryer's Peak"],
    5: ['Empyrean Sands', "Sailor's Abyss", 'Ruins of Regath'],
    6: ['Wyrmheart', 'Stormwatch', 'Urrak Markets'],
    7: ['Everdawn Grove', 'Silken Hollow', "Scryer's Peak"],
    8: ['Empyrean Sands', 'Godfall Quarry', 'Ruins of Regath'],
    9: ['Wyrmheart', 'Stormwatch', "Sailor's Abyss"],
  };
  const CAPSTONE_ORDER = ['The Heart of Tuzari', 'Ransack of Drakheim', 'Wraithtide Vault', "Cithrel's Fall"];

  function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
  function normalsForEternal(eternal: number): string[] {
    return NORMALS_BY_RESIDUE[mod(eternal, 10)] || [];
  }
  function capstoneForEternal(eternal: number): string {
    return CAPSTONE_ORDER[mod(eternal - 1, 4)];
  }
  function isOffered(name: string, eternal: number): boolean {
    return name === capstoneForEternal(eternal) || normalsForEternal(eternal).indexOf(name) >= 0;
  }
  // Levels until `name` is next offered after `fromEternal` (>=1). Normals recur
  // within 10, capstones within 4, so a 12-level look-ahead always resolves.
  function nextReturn(name: string, fromEternal: number, maxLevel = 130): number {
    for (let l = fromEternal + 1; l <= fromEternal + 12 && l <= maxLevel; l += 1) {
      if (isOffered(name, l)) return l - fromEternal;
    }
    return -1;
  }
  // What to run at the current level, ranked by scarcity: the dungeon that won't
  // come back for the longest is the one to capture score on now.
  function recommend(currentEternal: number) {
    const capstone = capstoneForEternal(currentEternal);
    const offered = normalsForEternal(currentEternal).map((n) => ({ name: n, isCapstone: false }));
    offered.push({ name: capstone, isCapstone: true });
    const picks = offered.map((o) => {
      const gap = nextReturn(o.name, currentEternal);
      return { name: o.name, isCapstone: o.isCapstone, gap, returnsAt: gap > 0 ? currentEternal + gap : null };
    });
    picks.sort((a, b) => (b.gap || 0) - (a.gap || 0));
    return { eternal: currentEternal, picks };
  }

  window.OverlayRendererRotation = {
    normalsForEternal, capstoneForEternal, isOffered, nextReturn, recommend,
  };
})();
