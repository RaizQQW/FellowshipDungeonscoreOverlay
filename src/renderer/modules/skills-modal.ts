(() => {
  const { escapeHtml, toAssetSrc } = window.OverlayRendererFormatters;
  const RELICS_ORDER_TOKEN = '__relics__';

  function getOrderedTokens(selectedSkillsByClass: SkillSelectionMap, classId: number): string[] {
    const normalizedClassId = String(Number(classId || 0));
    const stored = selectedSkillsByClass[normalizedClassId];
    const hasStored = Array.isArray(stored);
    const raw = hasStored ? stored : [];
    const tokens: string[] = [];
    const seen = new Set<string>();

    raw.forEach((token) => {
      const normalized = String(token) === RELICS_ORDER_TOKEN ? RELICS_ORDER_TOKEN : String(Number(token));
      if (!normalized || normalized === 'NaN' || seen.has(normalized)) return;
      seen.add(normalized);
      tokens.push(normalized);
    });

    // Relics default ON only for classes never configured; once a class has a
    // stored selection, relics appear only if the user kept the token (so they
    // can now be deselected). Existing users keep relics because the token was
    // always persisted before this change.
    if (!hasStored) tokens.push(RELICS_ORDER_TOKEN);
    return tokens;
  }

  function saveOrderedTokens(selectedSkillsByClass: SkillSelectionMap, classId: number, tokens: string[]): void {
    const normalizedClassId = String(Number(classId || 0));
    const normalized: string[] = [];
    const seen = new Set<string>();

    (Array.isArray(tokens) ? tokens : []).forEach((token) => {
      const nextToken = String(token) === RELICS_ORDER_TOKEN ? RELICS_ORDER_TOKEN : String(Number(token));
      if (!nextToken || nextToken === 'NaN' || seen.has(nextToken)) return;
      seen.add(nextToken);
      normalized.push(nextToken);
    });

    // Persist exactly what was chosen — no forced relics token — so an explicit
    // deselect sticks.
    selectedSkillsByClass[normalizedClassId] = normalized;
  }

  function buildAbilityOption(classId: number, ability: SkillCatalogAbility, selected: boolean): string {
    const checked = selected ? 'checked' : '';
    return `
      <label class="skill-option">
        <input type="checkbox" data-class-id="${classId}" data-ability-id="${ability.id}" ${checked} />
        <img class="skill-option-icon" src="${toAssetSrc(ability.icon || 'game-data/relics/empty.jpg')}" alt="${escapeHtml(ability.name)}" />
        <span class="skill-option-text">
          <span class="skill-option-name">${escapeHtml(ability.name)}</span>
          <span class="skill-option-cooldown">${escapeHtml(ability.cooldown)}s</span>
        </span>
      </label>
    `;
  }

  function buildRelicsOption(classId: number, selected: boolean, t: (key: string) => string): string {
    const checked = selected ? 'checked' : '';
    return `
      <label class="skill-option">
        <input type="checkbox" data-class-id="${classId}" data-relics-toggle="1" ${checked} />
        <img class="skill-option-icon" src="${toAssetSrc('game-data/relics/empty.jpg')}" alt="${escapeHtml(t('relics'))}" />
        <span class="skill-option-text">
          <span class="skill-option-name">${escapeHtml(t('relics'))}</span>
        </span>
      </label>
    `;
  }

  function buildDraggableOrderItem(token: string, classId: number, abilitiesById: Map<string, SkillCatalogAbility>, t: (key: string) => string): string {
    const isRelics = token === RELICS_ORDER_TOKEN;
    const ability = isRelics ? null : abilitiesById.get(String(token));
    const name = isRelics ? t('relics') : (ability?.name || t('unknown'));
    const icon = isRelics ? 'game-data/relics/empty.jpg' : (ability?.icon || 'game-data/relics/empty.jpg');

    return `
      <div class="order-item" draggable="true" data-order-class-id="${classId}" data-order-token="${escapeHtml(token)}">
        <img class="skill-option-icon" src="${toAssetSrc(icon)}" alt="${escapeHtml(name)}" />
        <span class="order-item-name">${escapeHtml(name)}</span>
        <span class="order-drag-hint">::</span>
      </div>
    `;
  }

  function renderSkillsModal(args: RenderSkillsModalArgs): void {
    const { latestData, renderPlayers, saveSkillSelections, selectedSkillsByClass, skillCatalog, skillsCatalogEl, t } = args;
    const classes = skillCatalog.classes || [];
    if (!classes.length) {
      skillsCatalogEl.innerHTML = `<div class="empty-state">${escapeHtml(t('skillsEmpty'))}</div>`;
      return;
    }

    skillsCatalogEl.innerHTML = classes.map((heroClass) => {
      const orderedTokens = getOrderedTokens(selectedSkillsByClass, heroClass.id);
      const selected = new Set(orderedTokens.filter((token) => token !== RELICS_ORDER_TOKEN));
      const abilitiesById = new Map((heroClass.abilities || []).map((ability) => [String(ability.id), ability]));
      const orderedItems = orderedTokens.map((token) => buildDraggableOrderItem(token, heroClass.id, abilitiesById, t)).join('');
      const relicsSelected = orderedTokens.includes(RELICS_ORDER_TOKEN);
      const relicsOption = buildRelicsOption(heroClass.id, relicsSelected, t);
      const options = relicsOption + (heroClass.abilities || []).map((ability) => buildAbilityOption(heroClass.id, ability, selected.has(String(ability.id)))).join('');
      return `
        <section class="skill-class-group">
          <div class="skill-class-title">${escapeHtml(heroClass.name)}</div>
          <div class="skill-order-title">${escapeHtml(t('selectedOrder'))}</div>
          <div class="skill-order-list">${orderedItems}</div>
          <div class="skill-options-grid">${options}</div>
        </section>
      `;
    }).join('');

    skillsCatalogEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const classId = Number(input.dataset.classId || 0);
        const currentAll = getOrderedTokens(selectedSkillsByClass, classId);
        const abilityTokens = currentAll.filter((token) => token !== RELICS_ORDER_TOKEN);

        if (input.dataset.relicsToggle) {
          const next = input.checked ? [...abilityTokens, RELICS_ORDER_TOKEN] : abilityTokens;
          saveOrderedTokens(selectedSkillsByClass, classId, next);
        } else {
          const abilityId = String(Number(input.dataset.abilityId || 0));
          const hasRelics = currentAll.includes(RELICS_ORDER_TOKEN);
          const nextAbilities = input.checked ? [...abilityTokens, abilityId] : abilityTokens.filter((token) => token !== abilityId);
          const next = hasRelics ? [...nextAbilities, RELICS_ORDER_TOKEN] : nextAbilities;
          saveOrderedTokens(selectedSkillsByClass, classId, next);
        }

        saveSkillSelections();
        renderSkillsModal(args);
        if (latestData()?.players) renderPlayers(latestData()?.players || []);
      });
    });

    let draggedClassId = '';
    let draggedToken = '';
    skillsCatalogEl.querySelectorAll<HTMLElement>('.order-item').forEach((item) => {
      item.addEventListener('dragstart', (event: DragEvent) => {
        draggedClassId = String(item.dataset.orderClassId || '');
        draggedToken = String(item.dataset.orderToken || '');
        item.classList.add('is-dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', draggedToken);
        }
      });

      item.addEventListener('dragend', () => {
        draggedClassId = '';
        draggedToken = '';
        skillsCatalogEl.querySelectorAll<HTMLElement>('.order-item').forEach((node) => node.classList.remove('is-dragging', 'drag-over'));
      });

      item.addEventListener('dragover', (event: DragEvent) => {
        const targetClassId = String(item.dataset.orderClassId || '');
        const targetToken = String(item.dataset.orderToken || '');
        if (!draggedToken || !draggedClassId || draggedClassId !== targetClassId || draggedToken === targetToken) return;
        event.preventDefault();
        item.classList.add('drag-over');
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (event: DragEvent) => {
        const targetClassId = String(item.dataset.orderClassId || '');
        const targetToken = String(item.dataset.orderToken || '');
        item.classList.remove('drag-over');
        if (!draggedToken || !draggedClassId || draggedClassId !== targetClassId || draggedToken === targetToken) return;
        event.preventDefault();
        const orderedTokens = getOrderedTokens(selectedSkillsByClass, Number(targetClassId));
        const sourceIndex = orderedTokens.indexOf(draggedToken);
        const targetIndex = orderedTokens.indexOf(targetToken);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
        const next = [...orderedTokens];
        const [movedToken] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, movedToken);
        saveOrderedTokens(selectedSkillsByClass, Number(targetClassId), next);
        saveSkillSelections();
        renderSkillsModal(args);
        if (latestData()?.players) renderPlayers(latestData()?.players || []);
      });
    });
  }

  window.OverlayRendererSkillsModal = {
    renderSkillsModal,
  };
})();
