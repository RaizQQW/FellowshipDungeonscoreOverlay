(() => {
  const { clamp, escapeHtml, formatPercent, toAssetSrc } = window.OverlayRendererFormatters;

  function getDefaultSkillIcon(): string {
    return 'game-data/heroes/Default/default_skill.jpg';
  }

  function getAbilityCatalogEntry(skillCatalog: SkillCatalog, classId: number | null, abilityId: number | null): SkillCatalogAbility | null {
    const normalizedClassId = String(Number(classId || 0));
    const wantedAbilityId = String(Number(abilityId || 0));
    const classEntry = (skillCatalog.classes || []).find((entry) => String(Number(entry.id || 0)) === normalizedClassId);
    if (!classEntry) return null;
    return (classEntry.abilities || []).find((ability) => String(Number(ability.id || 0)) === wantedAbilityId) || null;
  }

  function resolveRecentSkillIcon(skillCatalog: SkillCatalog, entry: RecentSkillActivation | null | undefined): string {
    if (entry?.icon) return entry.icon;
    const catalogEntry = getAbilityCatalogEntry(skillCatalog, entry?.classId ?? null, entry?.abilityId ?? null);
    return catalogEntry?.icon || getDefaultSkillIcon();
  }

  function updatePullPanelVisibility({ filePathEl, latestData, pullInfoEl, translate, visibilitySettings }: PullPanelVisibilityArgs): void {
    const hasSelectedFile = !!(latestData || (filePathEl.textContent && filePathEl.textContent !== translate('noFileSelected')));
    const isVisible = hasSelectedFile && visibilitySettings.showPull;
    pullInfoEl.classList.toggle('hidden', !isVisible);
  }

  function updateRecentSkillsPanelVisibility({ filePathEl, latestData, recentSkillsPanelEl, translate, visibilitySettings }: RecentSkillsPanelVisibilityArgs): void {
    const hasSelectedFile = !!(latestData || (filePathEl.textContent && filePathEl.textContent !== translate('noFileSelected')));
    const isVisible = hasSelectedFile && visibilitySettings.showRecentSkills;
    recentSkillsPanelEl.classList.toggle('hidden', !isVisible);
  }

  // The log never reveals which dungeon cards the Game Finder is showing, so the
  // scores panel approximates "browser context" instead: visible while out of a
  // run (when you'd be picking a dungeon), hidden while a run is in progress.
  function updateDungeonScoresPanelVisibility({ dungeonScoresPanelEl, latestData, visibilitySettings }: DungeonScoresPanelVisibilityArgs): void {
    const inActiveRun = !!(latestData?.dungeon?.startedAt && !latestData.dungeon.endedAt);
    const isVisible = visibilitySettings.showDungeonScores && !inActiveRun;
    dungeonScoresPanelEl.classList.toggle('hidden', !isVisible);
  }

  // Raw log tiers above 20 correspond to the in-game "Eternal N" labels
  // (observed: raw 37 displayed as Eternal 17). Verify offset in-game.
  function formatDungeonTier(tier: number): string {
    if (!Number.isFinite(tier) || tier <= 0) return '—';
    return tier > 20 ? `E${tier - 20}` : String(tier);
  }

  // Mirrors HERO_INFO_BY_CLASS_ID colors in src/main/services/hero-catalog.ts
  // (renderer modules are IIFE globals and cannot import main-process code).
  const HERO_COLORS: Record<string, string> = {
    Helena: '#b46831',
    Meiko: '#28e05c',
    Xavian: '#077365',
    Aeona: '#fc9fec',
    Sylvie: '#ea4f84',
    Vigour: '#dddbc5',
    Mara: '#965a90',
    Tariq: '#527af5',
    Ardeos: '#eb6328',
    Elarion: '#935dff',
    Rime: '#1ea3ee',
    Gunde: '#913539',
  };

  function getLatestClearMs(scores: DungeonBestScores): number {
    return Object.values(scores || {}).reduce((latest, entry) => {
      const ms = Date.parse(String(entry?.clearedAt || ''));
      return Number.isFinite(ms) && ms > latest ? ms : latest;
    }, 0);
  }

  function renderDungeonScoresPanel({
    currentLanguage,
    currentHero,
    selectedHero,
    dungeonBestScores,
    dungeonScoresPanelEl,
    translate,
    onSelectHero,
    updateDungeonScoresPanelVisibility,
  }: RenderDungeonScoresPanelArgs): void {
    // One section per hero: scores are tracked per character (e.g. Sylvie vs
    // Helena vs Xavian). The hero of the latest run sorts first and is
    // highlighted; remaining heroes follow by most recent clear.
    const heroSections = Object.entries(dungeonBestScores || {})
      .map(([hero, scores]) => ({
        hero,
        isCurrent: !!currentHero && hero === currentHero,
        latestClearMs: getLatestClearMs(scores),
        entries: Object.entries(scores || {})
          .map(([name, entry]) => ({ name, ...entry }))
          .sort((left, right) => right.score - left.score),
      }))
      .filter((section) => section.entries.length)
      .sort((left, right) => {
        if (left.isCurrent !== right.isCurrent) return left.isCurrent ? -1 : 1;
        return right.latestClearMs - left.latestClearMs;
      });

    const header = `
      <div class="player-header drag-handle dungeon-scores-header">
        <div class="player-title-block">
          <div class="player-name">${escapeHtml(translate('dungeonScoresTitle'))}</div>
        </div>
      </div>
    `;

    if (!heroSections.length) {
      dungeonScoresPanelEl.innerHTML = `
        ${header}
        <div class="pull-empty">${escapeHtml(translate('noDungeonScores'))}</div>
      `;
      updateDungeonScoresPanelVisibility();
      return;
    }

    const numberLocale = currentLanguage === 'ru' ? 'ru-RU' : 'en-US';
    const rotation = window.OverlayRendererRotation;

    const sectionHtmlByHero = new Map<string, string>();
    heroSections.forEach((section) => {
      const heroColor = HERO_COLORS[section.hero] || '#9ca3af';
      const rows = section.entries.map((entry) => `
        <div class="dungeon-scores-row">
          <span class="dungeon-scores-name">${escapeHtml(entry.name)}</span>
          <span class="dungeon-scores-tier">${escapeHtml(formatDungeonTier(entry.tier))}</span>
          <span class="dungeon-scores-score">${escapeHtml(Math.round(entry.score).toLocaleString(numberLocale))}</span>
        </div>
      `).join('');

      // Per-hero optimizer: each hero climbs independently, so "run next" is
      // based on this hero's own highest cleared tier (raw tier - 20 = Eternal
      // level). Heroes not yet in Eternal (tier <= 20) get no recommendation -
      // the rotation model only covers Eternal difficulties.
      let heroMaxTier = 0;
      for (const entry of section.entries) {
        const t = Number(entry?.tier);
        if (Number.isFinite(t) && t > heroMaxTier) heroMaxTier = t;
      }
      const heroEternal = heroMaxTier > 20 ? heroMaxTier - 20 : 0;
      let optimizerHtml = '';
      if (heroEternal >= 1 && rotation) {
        const rec = rotation.recommend(heroEternal);
        const optRows = rec.picks.map((pick, index) => `
          <div class="dungeon-opt-row${index === 0 ? ' dungeon-opt-top' : ''}">
            <span class="dungeon-opt-name">${escapeHtml(pick.name)}${pick.isCapstone ? ' \u2605' : ''}</span>
            <span class="dungeon-opt-gap">${pick.gap > 0 ? 'next E' + pick.returnsAt + ' (+' + pick.gap + ')' : 'now'}</span>
          </div>`).join('');
        optimizerHtml = `
          <div class="dungeon-opt">
            <div class="dungeon-opt-title">Run next \u00b7 Eternal ${heroEternal}</div>
            ${optRows}
          </div>`;
      }

      sectionHtmlByHero.set(section.hero, `
        <div class="dungeon-scores-hero${section.isCurrent ? ' dungeon-scores-hero-current' : ''}">
          <div class="dungeon-scores-hero-name" style="color: ${heroColor};">${escapeHtml(section.hero)}</div>
          ${optimizerHtml}
          <div class="dungeon-scores-list">${rows}</div>
        </div>
      `);
    });

    // Only one hero's key levels show at a time; a tab bar switches between
    // them so the panel stays compact instead of stacking every character down
    // the left edge. Active hero = the user's pinned selection when it still
    // has scores, otherwise the current run's hero, otherwise the first.
    const heroNames = heroSections.map((section) => section.hero);
    const activeHero = (selectedHero && heroNames.includes(selectedHero))
      ? selectedHero
      : (currentHero && heroNames.includes(currentHero))
        ? currentHero
        : heroNames[0];

    const tabs = heroSections.length > 1
      ? `<div class="dungeon-scores-tabs">${heroSections.map((section) => {
          const tabColor = HERO_COLORS[section.hero] || '#9ca3af';
          const isActive = section.hero === activeHero;
          const classes = ['dungeon-scores-tab'];
          if (isActive) classes.push('dungeon-scores-tab-active');
          if (section.isCurrent) classes.push('dungeon-scores-tab-current');
          const style = isActive
            ? `style="color: ${tabColor}; border-color: ${tabColor};"`
            : `style="color: ${tabColor};"`;
          return `<button type="button" class="${classes.join(' ')}" data-hero="${escapeHtml(section.hero)}" ${style}>${escapeHtml(section.hero)}</button>`;
        }).join('')}</div>`
      : '';

    dungeonScoresPanelEl.innerHTML = `
      ${header}
      ${tabs}
      ${sectionHtmlByHero.get(activeHero) || ''}
    `;

    dungeonScoresPanelEl.querySelectorAll<HTMLButtonElement>('.dungeon-scores-tab').forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.stopPropagation();
        const hero = tab.dataset.hero;
        if (hero) onSelectHero(hero);
      });
    });

    updateDungeonScoresPanelVisibility();
  }

  function renderRecentSkillsPanel({
    currentLanguage,
    getCardWidthForIconCount,
    recentSkillsGrowthDirection,
    recentSkillsLayoutDirection,
    recentSkillsTrackCount,
    recentSkills,
    recentSkillsLimit,
    recentSkillsPanelEl,
    skillCatalog,
    translate,
    updateRecentSkillsPanelVisibility,
  }: RenderRecentSkillsPanelArgs): void {
    const allItems = Array.isArray(recentSkills) ? recentSkills : [];
    const normalizedLimit = clamp(Number(recentSkillsLimit || 7), 1, 20);
    const items = allItems.slice(-normalizedLimit).map((entry) => ({
      ...entry,
      icon: resolveRecentSkillIcon(skillCatalog, entry),
    }));

    if (!items.length) {
      recentSkillsPanelEl.innerHTML = `
        <div class="player-header drag-handle recent-skills-header">
          <div class="player-title-block">
            <div class="player-name">${escapeHtml(translate('recentSkillsTitle'))}</div>
          </div>
        </div>
        <div class="pull-empty">${escapeHtml(translate('noRecentSkills'))}</div>
      `;
      recentSkillsPanelEl.style.width = '';
      updateRecentSkillsPanelVisibility();
      return;
    }

    recentSkillsPanelEl.innerHTML = `
      <div class="player-header drag-handle recent-skills-header">
        <div class="player-title-block">
          <div class="player-name">${escapeHtml(translate('recentSkillsTitle'))}</div>
        </div>
      </div>
      <div class="recent-skills-row"></div>
    `;

    const row = recentSkillsPanelEl.querySelector<HTMLElement>('.recent-skills-row');
    if (!row) return;

    const trackCount = clamp(Number(recentSkillsTrackCount || 3), 1, 6);
    const isHorizontal = recentSkillsLayoutDirection === 'horizontal';
    const primaryCount = Math.max(1, Math.min(trackCount, items.length));
    const rowCount = isHorizontal
      ? primaryCount
      : Math.max(1, Math.ceil(items.length / primaryCount));
    const columnCount = isHorizontal
      ? Math.max(1, Math.ceil(items.length / rowCount))
      : primaryCount;

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const chip = document.createElement('div');
      chip.className = 'relic-chip recent-skill-chip';
      chip.dataset.key = `${item.playerId || 'player'}-${item.abilityId || 'skill'}-${item.ts || index}`;
      chip.innerHTML = '<img class="relic-icon" alt="" />';
      const icon = chip.querySelector<HTMLImageElement>('.relic-icon');
      if (!icon) return;
      icon.src = toAssetSrc(item.icon || getDefaultSkillIcon());
      icon.alt = escapeHtml(item.abilityName || 'Skill');
      fragment.appendChild(chip);
    });

    row.appendChild(fragment);
    row.dataset.layout = recentSkillsLayoutDirection;
    row.dataset.growth = recentSkillsGrowthDirection;
    row.style.setProperty('--recent-skills-columns', String(columnCount));
    row.style.setProperty('--recent-skills-rows', String(rowCount));
    recentSkillsPanelEl.style.width = `${getCardWidthForIconCount(columnCount, columnCount)}px`;
    updateRecentSkillsPanelVisibility();
  }

  function renderPullInfo({
    currentLanguage,
    currentPull,
    dungeon,
    pullInfoEl,
    renderRecentSkillsPanelEmpty,
    translate,
    updatePullPanelVisibility,
    updateRecentSkillsPanelVisibility,
  }: RenderPullInfoArgs): void {
    const mobs = Array.isArray(currentPull?.mobs) ? currentPull.mobs : [];
    const alivePercent = Number(currentPull?.alivePercent || 0);
    const completedPercent = Number(dungeon?.completedPercent || 0);
    const dungeonEnded = Boolean(dungeon?.endedAt);
    const projectedTotalPercent = dungeonEnded ? completedPercent : (completedPercent + alivePercent);
    const chickenizedCount = Number(currentPull?.chickenizedCount || 0);
    const chickenizedOriginalPercent = Number(currentPull?.chickenizedOriginalPercent || 0);
    const aliveChickenizedCount = Number(currentPull?.aliveChickenizedCount || 0);
    const aliveChickenizedOriginalPercent = Number(currentPull?.aliveChickenizedOriginalPercent || 0);
    const dungeonTitle = String(dungeon?.name || '').trim() || translate('currentPull');

    if (!mobs.length) {
      pullInfoEl.innerHTML = `
        <div class="pull-title pull-drag-handle">${escapeHtml(dungeonTitle)}</div>
        <div class="pull-empty">${escapeHtml(translate('noPullData'))}</div>
      `;
      renderRecentSkillsPanelEmpty();
      updatePullPanelVisibility();
      updateRecentSkillsPanelVisibility();
      return;
    }

    const chickenizedLine = chickenizedCount > 0
      ? `<div class="pull-note chickenized">${escapeHtml(translate('chickenizedInfo'))}: <strong>${escapeHtml(String(chickenizedCount))}</strong> ${escapeHtml(translate('chickenizedSuffix'))} <span>(-${escapeHtml(formatPercent(currentLanguage, chickenizedOriginalPercent))}%${aliveChickenizedCount > 0 ? `, ${escapeHtml(translate('chickenizedAlive'))}: ${escapeHtml(String(aliveChickenizedCount))} / -${escapeHtml(formatPercent(currentLanguage, aliveChickenizedOriginalPercent))}%` : ''})</span></div>`
      : '';

    const completedLine = `<div class="pull-stat"><span>${escapeHtml(translate('pullCompleted'))}</span><strong>${escapeHtml(formatPercent(currentLanguage, completedPercent))}%</strong></div>`;
    const aliveLine = dungeonEnded
      ? ''
      : `<div class="pull-stat"><span>${escapeHtml(translate('pullAlive'))}</span><strong>${escapeHtml(formatPercent(currentLanguage, alivePercent))}%</strong></div>`;
    const totalLine = `<div class="pull-stat"><span>${escapeHtml(dungeonEnded ? translate('pullTotal') : translate('pullProjected'))}</span><strong>${escapeHtml(formatPercent(currentLanguage, projectedTotalPercent))}%</strong></div>`;

    pullInfoEl.innerHTML = `
      <div class="pull-title pull-drag-handle">${escapeHtml(dungeonTitle)}</div>
      <div class="pull-stats">
        ${completedLine}
        ${aliveLine}
        ${totalLine}
      </div>
      ${chickenizedLine}
    `;
    updatePullPanelVisibility();
  }

  // Exposed on window for cross-module access (renderer has no bundler).
  window.OverlayRendererPanels = {
    getAbilityCatalogEntry,
    renderPullInfo,
    renderRecentSkillsPanel,
    renderDungeonScoresPanel,
    resolveRecentSkillIcon,
    updatePullPanelVisibility,
    updateRecentSkillsPanelVisibility,
    updateDungeonScoresPanelVisibility,
  };
})();
