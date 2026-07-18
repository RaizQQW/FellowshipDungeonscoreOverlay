(() => {
function mustElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }
  return element as T;
}

const playersContainer = mustElement<HTMLElement>('playersContainer');
const settingsModal = mustElement<HTMLElement>('settingsModal');
const closeSettingsModalBtn = mustElement<HTMLButtonElement>('closeSettingsModalBtn');
const settingsModalTitle = mustElement<HTMLElement>('settingsModalTitle');
const settingsModalSubtitle = mustElement<HTMLElement>('settingsModalSubtitle');
const logSettingsTitle = mustElement<HTMLElement>('logSettingsTitle');
const overlaySettingsTitle = mustElement<HTMLElement>('overlaySettingsTitle');
const appearanceSettingsTitle = mustElement<HTMLElement>('appearanceSettingsTitle');
const pickFileBtn = mustElement<HTMLButtonElement>('pickFileBtn');
const reloadBtn = mustElement<HTMLButtonElement>('reloadBtn');
const toggleLockBtn = mustElement<HTMLButtonElement>('toggleLockBtn');
const skillsBtn = mustElement<HTMLButtonElement>('skillsBtn');
const hotkeysSettingsTitle = mustElement<HTMLElement>('hotkeysSettingsTitle');
const hotkeyToggleInteractionLabel = mustElement<HTMLElement>('hotkeyToggleInteractionLabel');
const hotkeyPickLogLabel = mustElement<HTMLElement>('hotkeyPickLogLabel');
const hotkeyToggleVisibilityLabel = mustElement<HTMLElement>('hotkeyToggleVisibilityLabel');
const hotkeyOpenSettingsLabel = mustElement<HTMLElement>('hotkeyOpenSettingsLabel');
const hotkeyToggleInteractionBtn = mustElement<HTMLButtonElement>('hotkeyToggleInteractionBtn');
const hotkeyPickLogBtn = mustElement<HTMLButtonElement>('hotkeyPickLogBtn');
const hotkeyToggleVisibilityBtn = mustElement<HTMLButtonElement>('hotkeyToggleVisibilityBtn');
const hotkeyOpenSettingsBtn = mustElement<HTMLButtonElement>('hotkeyOpenSettingsBtn');
const hotkeyStatusEl = mustElement<HTMLElement>('hotkeyStatus');
const frameGapDownBtn = mustElement<HTMLButtonElement>('frameGapDownBtn');
const frameGapUpBtn = mustElement<HTMLButtonElement>('frameGapUpBtn');
const frameGapValueEl = mustElement<HTMLElement>('frameGapValue');
const frameGapControls = mustElement<HTMLElement>('frameGapControls');
const iconsPerRowDownBtn = mustElement<HTMLButtonElement>('iconsPerRowDownBtn');
const iconsPerRowUpBtn = mustElement<HTMLButtonElement>('iconsPerRowUpBtn');
const iconsPerRowValueEl = mustElement<HTMLElement>('iconsPerRowValue');
const iconsPerRowControls = mustElement<HTMLElement>('iconsPerRowControls');
const panelOpacitySlider = mustElement<HTMLInputElement>('panelOpacitySlider');
const panelOpacityValueEl = mustElement<HTMLElement>('panelOpacityValue');
const panelOpacityLabel = mustElement<HTMLElement>('panelOpacityLabel');
const layoutDirectionSelect = mustElement<HTMLSelectElement>('layoutDirectionSelect');
const layoutDirectionLabel = mustElement<HTMLElement>('layoutDirectionLabel');
const frameGapLabel = document.getElementById('frameGapLabel') as HTMLElement | null;
const iconsPerRowLabel = document.getElementById('iconsPerRowLabel') as HTMLElement | null;
const cardSizeDownBtn = mustElement<HTMLButtonElement>('cardSizeDownBtn');
const cardSizeUpBtn = mustElement<HTMLButtonElement>('cardSizeUpBtn');
const cardSizeValueEl = mustElement<HTMLElement>('cardSizeValue');
const cardSizeControls = mustElement<HTMLElement>('cardSizeControls');
const cardSizeLabel = document.getElementById('cardSizeLabel') as HTMLElement | null;
const autoHideWithWindowToggle = document.getElementById('autoHideWithWindowToggle') as HTMLInputElement | null;
const autoHideWithWindowToggleLabel = document.getElementById('autoHideWithWindowToggleLabel') as HTMLElement | null;
const closeSkillsModalBtn = mustElement<HTMLButtonElement>('closeSkillsModalBtn');
const languageSelect = mustElement<HTMLSelectElement>('languageSelect');
const languageLabel = mustElement<HTMLElement>('languageLabel');
const showPartyToggle = document.getElementById('showPartyToggle') as HTMLInputElement | null;
const showPullToggle = document.getElementById('showPullToggle') as HTMLInputElement | null;
const showPartyToggleLabel = document.getElementById('showPartyToggleLabel') as HTMLElement | null;
const showPullToggleLabel = document.getElementById('showPullToggleLabel') as HTMLElement | null;
const skillsModalTitle = mustElement<HTMLElement>('skillsModalTitle');
const skillsModalSubtitle = mustElement<HTMLElement>('skillsModalSubtitle');
const filePathEl = mustElement<HTMLElement>('filePath');
const watchStatusEl = mustElement<HTMLElement>('watchStatus');
const hudStatusEl = mustElement<HTMLElement>('hudStatus');
const overlayRoot = mustElement<HTMLElement>('overlay-root');
const skillsModal = mustElement<HTMLElement>('skillsModal');
const skillsCatalogEl = mustElement<HTMLElement>('skillsCatalog');
const pullInfoEl = mustElement<HTMLElement>('pullInfo');
const recentSkillsPanelEl = mustElement<HTMLElement>('recentSkillsPanel');
const dungeonScoresPanelEl = mustElement<HTMLElement>('dungeonScoresPanel');
const showDungeonScoresToggle = document.getElementById('showDungeonScoresToggle') as HTMLInputElement | null;
const showDungeonScoresToggleLabel = document.getElementById('showDungeonScoresToggleLabel') as HTMLElement | null;
const deathLogPanelEl = mustElement<HTMLElement>('deathLogPanel');
const showDeathLogToggle = document.getElementById('showDeathLogToggle') as HTMLInputElement | null;
const showDeathLogToggleLabel = document.getElementById('showDeathLogToggleLabel') as HTMLElement | null;
const castAlertPanelEl = mustElement<HTMLElement>('castAlertPanel');
const showCastAlertsToggle = document.getElementById('showCastAlertsToggle') as HTMLInputElement | null;
const showCastAlertsToggleLabel = document.getElementById('showCastAlertsToggleLabel') as HTMLElement | null;
const previewCastAlertsToggle = document.getElementById('previewCastAlertsToggle') as HTMLInputElement | null;
const previewCastAlertsToggleLabel = document.getElementById('previewCastAlertsToggleLabel') as HTMLElement | null;
let castAlertPreview = false;
const recentSkillsSettingsGroup = mustElement<HTMLElement>('recentSkillsSettingsGroup');
const showRecentSkillsToggle = document.getElementById('showRecentSkillsToggle') as HTMLInputElement | null;
const showRecentSkillsToggleLabel = document.getElementById('showRecentSkillsToggleLabel') as HTMLElement | null;
const recentSkillsLimitInput = mustElement<HTMLInputElement>('recentSkillsLimitInput');
const recentSkillsLimitLabel = mustElement<HTMLElement>('recentSkillsLimitLabel');
const recentSkillsLayoutDirectionSelect = mustElement<HTMLSelectElement>('recentSkillsLayoutDirectionSelect');
const recentSkillsLayoutDirectionLabel = mustElement<HTMLElement>('recentSkillsLayoutDirectionLabel');
const recentSkillsGrowthDirectionSelect = mustElement<HTMLSelectElement>('recentSkillsGrowthDirectionSelect');
const recentSkillsGrowthDirectionLabel = mustElement<HTMLElement>('recentSkillsGrowthDirectionLabel');
const recentSkillsTrackCountDownBtn = mustElement<HTMLButtonElement>('recentSkillsTrackCountDownBtn');
const recentSkillsTrackCountUpBtn = mustElement<HTMLButtonElement>('recentSkillsTrackCountUpBtn');
const recentSkillsTrackCountValueEl = mustElement<HTMLElement>('recentSkillsTrackCountValue');
const recentSkillsTrackCountControls = mustElement<HTMLElement>('recentSkillsTrackCountControls');
const recentSkillsTrackCountTitle = document.getElementById('recentSkillsTrackCountTitle') as HTMLElement | null;
const recentSkillsTrackCountLabel = mustElement<HTMLElement>('recentSkillsTrackCountLabel');

const {
  CARD_SCALE_STEP,
  DEFAULT_HOTKEYS,
  DEFAULT_FRAME_GAP,
  DEFAULT_ICONS_PER_ROW,
  DEFAULT_LAYOUT_DIRECTION,
  DEFAULT_PANEL_OPACITY,
  DEFAULT_RECENT_SKILLS_GROWTH_DIRECTION,
  DEFAULT_RECENT_SKILLS_LAYOUT_DIRECTION,
  DEFAULT_RECENT_SKILLS_TRACK_COUNT,
  FRAME_GAP_STEP,
} = window.OverlayRendererConstants;
const {
  applyTranslations: applyTranslationsShared,
  setLogSourceText: setLogSourceTextShared,
  t: translateText,
} = window.OverlayRendererI18n;
const {
  clamp,
  escapeHtml,
  formatNumber: formatNumberShared,
  formatPercent: formatPercentShared,
} = window.OverlayRendererFormatters;
const {
  getAbilityCatalogEntry: getAbilityCatalogEntryShared,
  renderPullInfo: renderPullInfoShared,
  renderRecentSkillsPanel: renderRecentSkillsPanelShared,
  renderDungeonScoresPanel: renderDungeonScoresPanelShared,
  resolveRecentSkillIcon: resolveRecentSkillIconShared,
  updatePullPanelVisibility: updatePullPanelVisibilityShared,
  updateRecentSkillsPanelVisibility: updateRecentSkillsPanelVisibilityShared,
  updateDungeonScoresPanelVisibility: updateDungeonScoresPanelVisibilityShared,
} = window.OverlayRendererPanels;
const { createOverlaySettingsController } = window.OverlayRendererSettings;
const {
  applyCardLayout,
  getCardWidthForIconCount: getCardWidthForIconCountShared,
  getDefaultPosition,
  initializePanel,
  makeCardDraggable,
} = window.OverlayRendererLayout;
const { createPlayerCardRenderer } = window.OverlayRendererPlayerCards;
const { renderSkillsModal: renderSkillsModalShared } = window.OverlayRendererSkillsModal;

const settingsController: OverlaySettingsController = createOverlaySettingsController(window.api);

let overlayLocked = false;
let latestData: FinalizedState | null = null;
const cardMap = new Map<string, HTMLElement>();
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
let hudActive = true;
let skillCatalog: SkillCatalog = { classes: [] };
let selectedSkillsByClass: SkillSelectionMap = settingsController.loadSkillSelections();
let cardScale = settingsController.loadCardScale();
let autoHideWithGameWindow = settingsController.loadAutoHideWithGameWindow();

let frameGap = settingsController.loadFrameGap();
let iconsPerRow = settingsController.loadIconsPerRow();
let panelOpacity = settingsController.loadPanelOpacity();
let layoutDirection = settingsController.loadLayoutDirection();
let hotkeys = settingsController.loadHotkeys();
let currentLanguage: LanguageCode = 'en';
let lastWatchStatusMessage = '';
let visibilitySettings: OverlayVisibilitySettings = settingsController.loadVisibilitySettings();
let dungeonBestScores: HeroBestScores = settingsController.loadDungeonBestScores();
let lastRenderedHero: string | null = null;
// Hero pinned by the user via the dungeon-scores tab bar. Null = follow the
// current hero automatically.
let selectedDungeonScoresHero: string | null = null;
let recentSkillsLimit = settingsController.loadRecentSkillsLimit();
let recentSkillsLayoutDirection = settingsController.loadRecentSkillsLayoutDirection();
let recentSkillsGrowthDirection = settingsController.loadRecentSkillsGrowthDirection();
let recentSkillsTrackCount = settingsController.loadRecentSkillsTrackCount();
let playerCardRenderer: PlayerCardRenderer | null = null;
let settingsModalOpen = false;
let listeningHotkeyAction: HotkeyAction | null = null;

function t(key: string): string {
  return translateText(currentLanguage, key);
}

function formatHotkeyLabel(accelerator: string): string {
  return String(accelerator || '')
    .split('+')
    .map((part) => {
      if (part === 'CommandOrControl') return 'Ctrl';
      if (part === 'Super') return 'Win';
      return part;
    })
    .join('+');
}

function setHotkeyStatus(messageKey: string = 'hotkeyHint'): void {
  hotkeyStatusEl.textContent = t(messageKey);
}

function updateHotkeyButtons(): void {
  hotkeyToggleInteractionBtn.textContent = formatHotkeyLabel(hotkeys.toggleInteraction);
  hotkeyPickLogBtn.textContent = formatHotkeyLabel(hotkeys.pickLog);
  hotkeyToggleVisibilityBtn.textContent = formatHotkeyLabel(hotkeys.toggleVisibility);
  hotkeyOpenSettingsBtn.textContent = formatHotkeyLabel(hotkeys.openSettings);

  hotkeyToggleInteractionBtn.classList.toggle('listening', listeningHotkeyAction === 'toggleInteraction');
  hotkeyPickLogBtn.classList.toggle('listening', listeningHotkeyAction === 'pickLog');
  hotkeyToggleVisibilityBtn.classList.toggle('listening', listeningHotkeyAction === 'toggleVisibility');
  hotkeyOpenSettingsBtn.classList.toggle('listening', listeningHotkeyAction === 'openSettings');

  if (listeningHotkeyAction === 'toggleInteraction') hotkeyToggleInteractionBtn.textContent = '...';
  if (listeningHotkeyAction === 'pickLog') hotkeyPickLogBtn.textContent = '...';
  if (listeningHotkeyAction === 'toggleVisibility') hotkeyToggleVisibilityBtn.textContent = '...';
  if (listeningHotkeyAction === 'openSettings') hotkeyOpenSettingsBtn.textContent = '...';
}

function keyEventToAccelerator(event: KeyboardEvent): string | null {
  if (event.key === 'Escape') return '__cancel__';

  let baseKey = '';
  if (/^F([1-9]|1\d|2[0-4])$/i.test(event.key)) {
    baseKey = event.key.toUpperCase();
  } else if (/^Key[A-Z]$/.test(event.code)) {
    baseKey = event.code.slice(3);
  } else if (/^Digit\d$/.test(event.code)) {
    baseKey = event.code.slice(5);
  } else if (event.code === 'Space') {
    baseKey = 'Space';
  } else if (event.key === 'ArrowUp') {
    baseKey = 'Up';
  } else if (event.key === 'ArrowDown') {
    baseKey = 'Down';
  } else if (event.key === 'ArrowLeft') {
    baseKey = 'Left';
  } else if (event.key === 'ArrowRight') {
    baseKey = 'Right';
  } else if (event.key === 'Tab') {
    baseKey = 'Tab';
  } else if (event.key === 'Enter') {
    baseKey = 'Enter';
  }

  if (!baseKey) return null;

  const modifiers: string[] = [];
  if (event.ctrlKey) modifiers.push('CommandOrControl');
  if (event.altKey) modifiers.push('Alt');
  if (event.shiftKey) modifiers.push('Shift');
  if (event.metaKey) modifiers.push('Super');
  return [...modifiers, baseKey].join('+');
}

function saveHotkeys(nextHotkeys: OverlayHotkeys): void {
  hotkeys = settingsController.normalizeHotkeys(nextHotkeys);
  settingsController.saveHotkeys(hotkeys);
  updateHotkeyButtons();
  setHotkeyStatus();
}

function beginHotkeyCapture(action: HotkeyAction): void {
  listeningHotkeyAction = action;
  updateHotkeyButtons();
  setHotkeyStatus('hotkeyListening');
}

function endHotkeyCapture(): void {
  listeningHotkeyAction = null;
  updateHotkeyButtons();
}

function setLogSourceText(source: { filePath?: string | null; directoryPath?: string | null } | null | undefined): void {
  setLogSourceTextShared(filePathEl, t, source);
}

function formatPercent(value: unknown): string {
  return formatPercentShared(currentLanguage, value);
}

function formatNumber(value: unknown): string {
  return formatNumberShared(currentLanguage, value);
}

function getPlayerLayoutKey(slotIndex = 0): string {
  return `party-slot:${slotIndex}`;
}

function getPartySlotIndex(player: { id: string } | null | undefined, index = 0): number {
  const partyIds = latestData?.partyPlayerIds || [];
  const byPartyOrder = Array.isArray(partyIds) ? partyIds.indexOf(player?.id || '') : -1;
  if (byPartyOrder >= 0) return byPartyOrder;
  return index;
}

function getEffectiveCardScale(): number {
  return settingsController.normalizeCardScaleValue(cardScale);
}

function getCardWidthForIconCount(iconCount: number, iconsInRow = iconsPerRow): number {
  return getCardWidthForIconCountShared(getEffectiveCardScale(), iconCount, iconsInRow);
}

function setLanguage(language: LanguageCode | string | null | undefined): void {
  currentLanguage = String(language || '').toLowerCase() === 'en' ? 'en' : 'ru';
  applyTranslations();
}

function updatePullPanelVisibility(): void {
  updatePullPanelVisibilityShared({ filePathEl, latestData, pullInfoEl, translate: t, visibilitySettings });
}

function updateRecentSkillsPanelVisibility(): void {
  updateRecentSkillsPanelVisibilityShared({ filePathEl, latestData, recentSkillsPanelEl, translate: t, visibilitySettings });
}

function updateDungeonScoresPanelVisibility(): void {
  updateDungeonScoresPanelVisibilityShared({ dungeonScoresPanelEl, latestData, visibilitySettings });
}

let deathLogPanelPosition: Point = { x: 16, y: 560 };

// Party death log for the current run, built from ALLY_DEATH events. Newest
// first; visibility is driven by the overlay-root 'death-log-hidden' class.
function renderDeathLogPanel(): void {
  deathLogPanelEl.classList.toggle('hidden', !visibilitySettings.showDeathLog);
  const deaths = Array.isArray(latestData?.playerDeaths) ? latestData!.playerDeaths : [];
  const header = `<div class="player-header drag-handle death-log-header"><div class="player-title-block"><div class="player-name">${escapeHtml(t('deathLogTitle'))}</div></div></div>`;
  if (!deaths.length) {
    deathLogPanelEl.innerHTML = `${header}<div class="pull-empty">${escapeHtml(t('noDeaths'))}</div>`;
    return;
  }
  const rows = deaths.slice(-12).reverse().map((death) => {
    const cause = death.killingAbility || death.killerName || '';
    const causeHtml = cause ? ` <span class="death-log-cause">${escapeHtml(cause)}</span>` : '';
    const rezHtml = death.revived ? ` <span class="death-log-rez">${escapeHtml(t('revivedSuffix'))}</span>` : '';
    let tagHtml = '';
    if (death.category) {
      const pct = death.fatalFraction != null ? ` ${Math.round(death.fatalFraction * 100)}%` : '';
      if (death.category === 'oneshot') tagHtml = ` <span class="death-log-tag death-log-tag-oneshot">${escapeHtml(t('oneShot'))}${pct}</span>`;
      else if (death.category === 'trickle') tagHtml = ` <span class="death-log-tag death-log-tag-trickle">${escapeHtml(t('trickle'))}${death.hitCount ? ` ${death.hitCount} ${escapeHtml(t('hitsSuffix'))}` : ''}</span>`;
      else tagHtml = ` <span class="death-log-tag death-log-tag-burst">${escapeHtml(t('burst'))}${pct}</span>`;
    }
    return `<div class="death-log-row"><span class="death-log-victim">${escapeHtml(death.playerName || 'Unknown')}</span>${causeHtml}${tagHtml}${rezHtml}</div>`;
  }).join('');
  deathLogPanelEl.innerHTML = `${header}<div class="death-log-list">${rows}</div>`;
}

let castAlertPanelPosition: Point = { x: 760, y: 120 };

// Maps a cast to its interrupt-type color tier (grey=stun, yellow=kick,
// red=kick+important). Casts without an interrupt verdict fall back to the
// priority color so nothing regresses.
function castTierClass(cast: { interruptType: string | null; important: boolean; priority: string }): string {
  if (cast.interruptType === 'stun') return 'cast-int-stun';
  if (cast.interruptType === 'kick') return cast.important ? 'cast-int-kick-important' : 'cast-int-kick';
  if (cast.interruptType === 'dodge') return 'cast-int-mechanic';
  return `cast-prio-${cast.priority}`;
}

// Out-of-combat preview: synthetic pull covering every color tier and state so
// the panel can be eyeballed without being in a dungeon. Not real data.
function buildSampleCastPreview(): FinalizedState['pullCasts'] {
  const nowIso = new Date().toISOString();
  return [
    {
      unitId: 'preview-brogg', mobName: 'Warlord Brogg (preview)', instances: 1, topPriority: 'stop',
      casts: [
        { abilityId: -1, ability: 'Dread Arc', priority: 'stop', target: 'group', affixOnly: false, interruptType: 'kick', important: true, status: 'casting', lastResolvedAt: null },
        { abilityId: -2, ability: 'Charged Bolt', priority: 'stop', target: 'random', affixOnly: false, interruptType: 'kick', important: false, status: 'available', lastResolvedAt: null },
        { abilityId: -3, ability: 'Perfect Storm', priority: 'mechanic', target: 'group', affixOnly: false, interruptType: 'dodge', important: false, status: 'available', lastResolvedAt: null },
      ],
    },
    {
      unitId: 'preview-facestabber', mobName: 'Facestabber (preview)', instances: 2, topPriority: 'stop',
      casts: [
        { abilityId: -4, ability: 'Stab Yer Face!', priority: 'stop', target: 'random', affixOnly: false, interruptType: 'stun', important: false, status: 'available', lastResolvedAt: null },
        { abilityId: -5, ability: 'Kidnap', priority: 'stop', target: 'random', affixOnly: false, interruptType: 'kick', important: true, status: 'justCast', lastResolvedAt: nowIso },
        { abilityId: -6, ability: 'Silence', priority: 'stop', target: 'random', affixOnly: false, interruptType: 'kick', important: false, status: 'interrupted', lastResolvedAt: nowIso },
      ],
    },
  ];
}

// Right-side cast-alert panel: pull's caster-mobs (ranked by interrupt priority)
// and their dangerous casts, highlighted while casting and greyed for a few
// seconds after they resolve. Data joins live status with the cast catalog in
// the main process (FinalizedState.pullCasts).
function renderCastAlertPanel(): void {
  castAlertPanelEl.classList.toggle('hidden', !(visibilitySettings.showCastAlerts || castAlertPreview));
  const mobs = castAlertPreview ? buildSampleCastPreview() : (Array.isArray(latestData?.pullCasts) ? latestData!.pullCasts : []);
  const header = `<div class="player-header drag-handle cast-alert-header"><div class="player-title-block"><div class="player-name">${escapeHtml(t('castAlertsTitle'))}</div></div></div>`;
  if (!mobs.length) {
    castAlertPanelEl.innerHTML = `${header}<div class="pull-empty">${escapeHtml(t('noCastsNearby'))}</div>`;
    return;
  }
  const now = Date.now();
  const blocks = mobs.slice(0, 6).map((mob) => {
    const rows = mob.casts.map((cast) => {
      let visualState = 'available';
      if (cast.status === 'casting') {
        visualState = 'casting';
      } else if (cast.status === 'justCast' || cast.status === 'interrupted') {
        const age = cast.lastResolvedAt ? now - Date.parse(cast.lastResolvedAt) : Number.POSITIVE_INFINITY;
        if (age < 4000) visualState = cast.status === 'interrupted' ? 'interrupted' : 'justcast';
      }
      const tier = castTierClass(cast);
      const showStar = (cast.interruptType === 'kick' && cast.important) || (cast.interruptType === null && cast.priority === 'stop');
      const star = showStar ? '<span class="cast-star">\u2605</span> ' : '';
      return `<div class="cast-row cast-${visualState} ${tier}">${star}<span class="cast-name">${escapeHtml(cast.ability)}</span></div>`;
    }).join('');
    const countBadge = mob.instances > 1 ? ` <span class="cast-mob-count">\u00d7${mob.instances}</span>` : '';
    return `<div class="cast-mob cast-top-${mob.topPriority}"><div class="cast-mob-name">${escapeHtml(mob.mobName)}${countBadge}</div><div class="cast-list">${rows}</div></div>`;
  }).join('');
  castAlertPanelEl.innerHTML = `${header}${blocks}`;
}

// The hero (character) of the latest run in the active log: the local player
// is recentSkillsPlayerId and their className is the hero name (Sylvie,
// Helena, Xavian, ...). Null until a run has been parsed.
function getCurrentHeroName(): string | null {
  if (!latestData) return null;
  const localPlayer = (latestData.players || []).find((player) => player.id === latestData?.recentSkillsPlayerId) || null;
  const heroName = String(localPlayer?.className || '').trim();
  if (!heroName || heroName.toLowerCase().startsWith('unknown')) return null;
  return heroName;
}

function renderDungeonScoresPanel(): void {
  lastRenderedHero = getCurrentHeroName();
  renderDungeonScoresPanelShared({
    currentLanguage,
    currentHero: lastRenderedHero,
    selectedHero: selectedDungeonScoresHero,
    dungeonBestScores,
    dungeonScoresPanelEl,
    translate: t,
    onSelectHero: selectDungeonScoresHero,
    updateDungeonScoresPanelVisibility,
  });
}

// User tapped a hero tab in the dungeon-scores panel: pin that hero and
// re-render so only their key levels show.
function selectDungeonScoresHero(hero: string): void {
  selectedDungeonScoresHero = hero;
  renderDungeonScoresPanel();
}

function getAbilityCatalogEntry(classId: number | null, abilityId: number | null) {
  return getAbilityCatalogEntryShared(skillCatalog, classId, abilityId);
}

function resolveRecentSkillIcon(entry: RecentSkillActivation | null | undefined): string {
  return resolveRecentSkillIconShared(skillCatalog, entry);
}

function renderRecentSkillsPanel(recentSkills: RecentSkillActivation[] = []): void {
  renderRecentSkillsPanelShared({
    currentLanguage,
    getCardWidthForIconCount,
    recentSkillsLayoutDirection,
    recentSkillsGrowthDirection,
    recentSkillsTrackCount,
    recentSkills,
    recentSkillsLimit,
    recentSkillsPanelEl,
    skillCatalog,
    translate: t,
    updateRecentSkillsPanelVisibility,
  });
}

function renderPullInfo(currentPull: CurrentPullSummary | null | undefined, dungeon: FinalizedDungeonState | null | undefined): void {
  renderPullInfoShared({
    currentLanguage,
    currentPull,
    dungeon,
    pullInfoEl,
    renderRecentSkillsPanelEmpty: () => renderRecentSkillsPanel([]),
    translate: t,
    updatePullPanelVisibility,
    updateRecentSkillsPanelVisibility,
  });
}

function loadPositions(): PlayerPositions {
  return settingsController.loadPositions();
}

function savePositions(positions: PlayerPositions): void {
  settingsController.savePositions(positions);
}

function loadPullPanelPosition(): Point {
  return settingsController.loadPullPanelPosition();
}

function savePullPanelPosition(position: Point): void {
  settingsController.savePullPanelPosition(position);
}

function loadRecentSkillsPanelPosition(): Point {
  return settingsController.loadRecentSkillsPanelPosition();
}

function saveRecentSkillsPanelPosition(position: Point): void {
  settingsController.saveRecentSkillsPanelPosition(position);
}

function loadDungeonScoresPanelPosition(): Point {
  return settingsController.loadDungeonScoresPanelPosition();
}

function saveDungeonScoresPanelPosition(position: Point): void {
  settingsController.saveDungeonScoresPanelPosition(position);
}

function saveVisibilitySettings(): void {
  settingsController.saveVisibilitySettings(visibilitySettings);
}

function updateOverlayVisibility(): void {
  overlayRoot.classList.toggle('party-hidden', !visibilitySettings.showParty);
  overlayRoot.classList.toggle('pull-hidden', !visibilitySettings.showPull);
  overlayRoot.classList.toggle('recent-skills-hidden', !visibilitySettings.showRecentSkills);
  overlayRoot.classList.toggle('dungeon-scores-hidden', !visibilitySettings.showDungeonScores);
  overlayRoot.classList.toggle('death-log-hidden', !visibilitySettings.showDeathLog);
  overlayRoot.classList.toggle('cast-alerts-hidden', !visibilitySettings.showCastAlerts);
  recentSkillsSettingsGroup.classList.toggle('hidden', !visibilitySettings.showRecentSkills);
}

function setPartyVisibility(enabled: boolean): void {
  visibilitySettings = { ...visibilitySettings, showParty: !!enabled };
  saveVisibilitySettings();
  updateOverlayVisibility();
}

function setPullVisibility(enabled: boolean): void {
  visibilitySettings = { ...visibilitySettings, showPull: !!enabled };
  saveVisibilitySettings();
  updateOverlayVisibility();
  updatePullPanelVisibility();
}

function setRecentSkillsVisibility(enabled: boolean): void {
  visibilitySettings = { ...visibilitySettings, showRecentSkills: !!enabled };
  saveVisibilitySettings();
  updateOverlayVisibility();
  updateRecentSkillsPanelVisibility();
}

function setDungeonScoresVisibility(enabled: boolean): void {
  visibilitySettings = { ...visibilitySettings, showDungeonScores: !!enabled };
  saveVisibilitySettings();
  updateOverlayVisibility();
  updateDungeonScoresPanelVisibility();
}

function saveSkillSelections(): void {
  settingsController.saveSkillSelections(selectedSkillsByClass);
}

function setRecentSkillsLimit(value: unknown): void {
  recentSkillsLimit = settingsController.normalizeRecentSkillsLimit(value);
  recentSkillsLimitInput.value = String(recentSkillsLimit);
  settingsController.saveRecentSkillsLimit(recentSkillsLimit);
  renderRecentSkillsPanel(latestData?.recentSkills || []);
}

function updateAutoHideUi(): void {
  if (autoHideWithWindowToggle) autoHideWithWindowToggle.checked = !!autoHideWithGameWindow;
}

function updateCardScaleUi(): void {
  overlayRoot.style.setProperty('--card-scale', String(getEffectiveCardScale()));
  cardSizeValueEl.textContent = Math.round(cardScale * 100) + '%';
}

function applyAppearanceVariables(): void {
  overlayRoot.style.setProperty('--party-gap', `${frameGap}px`);
  overlayRoot.style.setProperty('--panel-bg-alpha', String(panelOpacity));
  overlayRoot.dataset.layoutDirection = layoutDirection;
  overlayRoot.dataset.iconsPerRow = String(iconsPerRow);
}

function updateFrameGapUi(): void {
  frameGapValueEl.textContent = `${frameGap}px`;
}

function updateIconsPerRowUi(): void {
  iconsPerRowValueEl.textContent = String(iconsPerRow);
}

function updatePanelOpacityUi(): void {
  const percent = Math.round(panelOpacity * 100);
  panelOpacitySlider.value = String(percent);
  panelOpacityValueEl.textContent = `${percent}%`;
}

function updateLayoutDirectionUi(): void {
  layoutDirectionSelect.value = layoutDirection === 'horizontal' ? 'horizontal' : 'vertical';
}

function updateRecentSkillsLayoutUi(): void {
  recentSkillsLayoutDirectionSelect.value = recentSkillsLayoutDirection;
  const isHorizontal = recentSkillsLayoutDirection === 'horizontal';
  recentSkillsGrowthDirectionSelect.innerHTML = isHorizontal
    ? `<option value="right">${escapeHtml(t('growthRight'))}</option><option value="left">${escapeHtml(t('growthLeft'))}</option>`
    : `<option value="down">${escapeHtml(t('growthDown'))}</option><option value="up">${escapeHtml(t('growthUp'))}</option>`;
  const normalizedGrowth = settingsController.normalizeRecentSkillsGrowthDirection(recentSkillsGrowthDirection);
  recentSkillsGrowthDirection = isHorizontal
    ? (normalizedGrowth === 'left' ? 'left' : 'right')
    : (normalizedGrowth === 'up' ? 'up' : 'down');
  recentSkillsGrowthDirectionSelect.value = recentSkillsGrowthDirection;
  recentSkillsTrackCountValueEl.textContent = String(recentSkillsTrackCount);
  recentSkillsTrackCountLabel.textContent = isHorizontal ? t('recentSkillsTrackCountRows') : t('recentSkillsTrackCountColumns');
}

function rerenderPlayersIfNeeded(): void {
  if (latestData?.players) renderPlayers(latestData.players);
}

function setAutoHideWithGameWindow(enabled: boolean): void {
  const normalized = !!enabled;
  if (normalized === autoHideWithGameWindow) return;
  autoHideWithGameWindow = normalized;
  settingsController.saveAutoHideWithGameWindow(autoHideWithGameWindow);
  updateAutoHideUi();
}

function setCardScale(nextScale: number): void {
  const normalized = settingsController.normalizeCardScaleValue(nextScale);
  if (normalized === cardScale) return;
  cardScale = normalized;
  settingsController.saveCardScale(cardScale);
  updateCardScaleUi();
  if (latestData?.players) renderPlayers(latestData.players);
}

function setFrameGap(nextValue: unknown): void {
  const normalized = settingsController.normalizeFrameGap(nextValue);
  if (normalized === frameGap) return;
  frameGap = normalized;
  settingsController.saveFrameGap(frameGap);
  applyAppearanceVariables();
  updateFrameGapUi();
  rerenderPlayersIfNeeded();
}

function setIconsPerRow(nextValue: unknown): void {
  const normalized = settingsController.normalizeIconsPerRow(nextValue);
  if (normalized === iconsPerRow) return;
  iconsPerRow = normalized;
  settingsController.saveIconsPerRow(iconsPerRow);
  applyAppearanceVariables();
  updateIconsPerRowUi();
  rerenderPlayersIfNeeded();
}

function setPanelOpacity(nextValue: unknown): void {
  const normalized = settingsController.normalizePanelOpacity(nextValue);
  if (normalized === panelOpacity) return;
  panelOpacity = normalized;
  settingsController.savePanelOpacity(panelOpacity);
  applyAppearanceVariables();
  updatePanelOpacityUi();
}

function setLayoutDirection(nextValue: unknown): void {
  const normalized = settingsController.normalizeLayoutDirection(nextValue);
  if (normalized === layoutDirection) return;
  layoutDirection = normalized;
  settingsController.saveLayoutDirection(layoutDirection);
  applyAppearanceVariables();
  updateLayoutDirectionUi();
  rerenderPlayersIfNeeded();
}

function rerenderRecentSkillsPanel(): void {
  renderRecentSkillsPanel(latestData?.recentSkills || []);
}

function setRecentSkillsLayoutDirection(nextValue: unknown): void {
  const normalized = settingsController.normalizeRecentSkillsLayoutDirection(nextValue);
  if (normalized === recentSkillsLayoutDirection) return;
  recentSkillsLayoutDirection = normalized;
  recentSkillsGrowthDirection = normalized === 'horizontal'
    ? (recentSkillsGrowthDirection === 'left' ? 'left' : 'right')
    : (recentSkillsGrowthDirection === 'up' ? 'up' : 'down');
  settingsController.saveRecentSkillsLayoutDirection(recentSkillsLayoutDirection);
  settingsController.saveRecentSkillsGrowthDirection(recentSkillsGrowthDirection);
  updateRecentSkillsLayoutUi();
  rerenderRecentSkillsPanel();
}

function setRecentSkillsGrowthDirection(nextValue: unknown): void {
  const normalized = settingsController.normalizeRecentSkillsGrowthDirection(nextValue);
  const allowed = recentSkillsLayoutDirection === 'horizontal'
    ? (normalized === 'left' ? 'left' : 'right')
    : (normalized === 'up' ? 'up' : 'down');
  if (allowed === recentSkillsGrowthDirection) return;
  recentSkillsGrowthDirection = allowed;
  settingsController.saveRecentSkillsGrowthDirection(recentSkillsGrowthDirection);
  updateRecentSkillsLayoutUi();
  rerenderRecentSkillsPanel();
}

function setRecentSkillsTrackCount(nextValue: number): void {
  const normalized = settingsController.normalizeRecentSkillsTrackCount(nextValue);
  if (normalized === recentSkillsTrackCount) return;
  recentSkillsTrackCount = normalized;
  settingsController.saveRecentSkillsTrackCount(recentSkillsTrackCount);
  updateRecentSkillsLayoutUi();
  rerenderRecentSkillsPanel();
}

function setHudActiveState(active: boolean, foregroundExe: string | null = null): void {
  hudActive = !!active;
  overlayRoot.classList.toggle('hud-hidden', !hudActive);
  const suffix = foregroundExe ? ` (${foregroundExe})` : '';
  hudStatusEl.textContent = hudActive ? t('hudActive') : `${t('hudHidden')}${suffix}`;
}

function renderPlayers(players: FinalizedState['players'] = []): void {
  playerCardRenderer?.renderPlayers(players);
}

function tickCooldowns(): void {
  playerCardRenderer?.tickCooldowns();
}

function renderSkillsModal(): void {
  renderSkillsModalShared({
    latestData: () => latestData,
    renderPlayers,
    saveSkillSelections,
    selectedSkillsByClass,
    skillCatalog,
    skillsCatalogEl,
    t,
  });
}

function handleHotkeyCapture(event: KeyboardEvent): void {
  if (!listeningHotkeyAction) return;

  event.preventDefault();
  event.stopPropagation();

  const accelerator = keyEventToAccelerator(event);
  if (accelerator === '__cancel__') {
    endHotkeyCapture();
    setHotkeyStatus();
    return;
  }
  if (!accelerator) {
    setHotkeyStatus('hotkeyInvalid');
    return;
  }

  const duplicate = Object.entries(hotkeys).find(([action, value]) => action !== listeningHotkeyAction && value === accelerator);
  if (duplicate) {
    setHotkeyStatus('hotkeyDuplicate');
    return;
  }

  saveHotkeys({
    ...hotkeys,
    [listeningHotkeyAction]: accelerator,
  });
  endHotkeyCapture();
}

function applyTranslations(): void {
  applyTranslationsShared({
    appearanceSettingsTitle,
    autoHideWithWindowToggle,
    autoHideWithWindowToggleLabel,
    cardSizeControls,
    cardSizeLabel,
    currentLanguage,
    filePathEl,
    frameGapControls,
    frameGapLabel,
    hotkeyOpenSettingsLabel,
    hotkeyPickLogLabel,
    hotkeyToggleInteractionLabel,
    hotkeyToggleVisibilityLabel,
    hotkeysSettingsTitle,
    hudActive,
    iconsPerRowControls,
    iconsPerRowLabel,
    languageLabel,
    languageSelect,
    layoutDirection,
    layoutDirectionLabel,
    layoutDirectionSelect,
    lastWatchStatusMessage,
    latestData,
    logSettingsTitle,
    overlayLocked,
    overlaySettingsTitle,
    panelOpacityLabel,
    pickFileBtn,
    recentSkillsGrowthDirection,
    recentSkillsGrowthDirectionLabel,
    recentSkillsGrowthDirectionSelect,
    recentSkillsLayoutDirection,
    recentSkillsLayoutDirectionLabel,
    recentSkillsLayoutDirectionSelect,
    recentSkillsLimit,
    recentSkillsLimitInput,
    recentSkillsLimitLabel,
    recentSkillsTrackCount,
    recentSkillsTrackCountControls,
    recentSkillsTrackCountLabel,
    recentSkillsTrackCountTitle,
    reloadBtn,
    renderPlayers,
    renderPullInfo,
    renderRecentSkillsPanel,
    renderSkillsModal,
    setHudActiveState,
    settingsModalSubtitle,
    settingsModalTitle,
    showPartyToggle,
    showPartyToggleLabel,
    showPullToggle,
    showPullToggleLabel,
    showRecentSkillsToggle,
    showRecentSkillsToggleLabel,
    skillsBtn,
    skillsModalSubtitle,
    skillsModalTitle,
    toggleLockBtn,
    updateOverlayVisibility,
    updatePullPanelVisibility,
    updateRecentSkillsPanelVisibility,
    visibilitySettings,
    watchStatusEl,
  });
  if (showDungeonScoresToggleLabel) showDungeonScoresToggleLabel.textContent = t('showDungeonScores');
  if (showDungeonScoresToggle) showDungeonScoresToggle.checked = !!visibilitySettings.showDungeonScores;
  renderDungeonScoresPanel();
  if (showDeathLogToggleLabel) showDeathLogToggleLabel.textContent = t('showDeathLog');
  if (showDeathLogToggle) showDeathLogToggle.checked = !!visibilitySettings.showDeathLog;
  renderDeathLogPanel();
  if (showCastAlertsToggleLabel) showCastAlertsToggleLabel.textContent = t('showCastAlerts');
  if (previewCastAlertsToggleLabel) previewCastAlertsToggleLabel.textContent = t('previewCastAlerts');
  if (showCastAlertsToggle) showCastAlertsToggle.checked = !!visibilitySettings.showCastAlerts;
  renderCastAlertPanel();
  if (!listeningHotkeyAction) setHotkeyStatus();
  updateHotkeyButtons();
}

async function ensureSkillCatalog(): Promise<void> {
  if (skillCatalog.classes?.length) return;
  skillCatalog = await window.api.getSkillCatalog();
  renderSkillsModal();
  updateRecentSkillsPanelVisibility();
}

async function openSettingsModal(): Promise<void> {
  applyAppearanceVariables();
  updateCardScaleUi();
  updateFrameGapUi();
  updateIconsPerRowUi();
  updatePanelOpacityUi();
  updateLayoutDirectionUi();
  updateRecentSkillsLayoutUi();
  settingsModal.classList.remove('hidden');
  settingsModalOpen = true;
  await window.api.setSettingsModalOpen(true);
}

async function closeSettingsModal(): Promise<void> {
  settingsModal.classList.add('hidden');
  settingsModalOpen = false;
  if (listeningHotkeyAction) {
    endHotkeyCapture();
    setHotkeyStatus();
  }
  await window.api.setSettingsModalOpen(false);
  await window.api.closeInteractiveModal();
}

function openSkillsModal(): void {
  updateCardScaleUi();
  void ensureSkillCatalog();
  skillsModal.classList.remove('hidden');
}

function closeSkillsModal(): void {
  skillsModal.classList.add('hidden');
}

playerCardRenderer = createPlayerCardRenderer({
  applyCardLayout,
  cardMap,
  formatNumber,
  getCardScale: () => getEffectiveCardScale(),
  getDefaultPosition,
  getFrameGap: () => frameGap,
  getIconsPerRow: () => iconsPerRow,
  getLayoutDirection: () => layoutDirection,
  getLatestData: () => latestData,
  getOverlayLocked: () => overlayLocked,
  getPartySlotIndex,
  getPlayerLayoutKey,
  getSelectedSkillsByClass: () => selectedSkillsByClass,
  getSkillCatalog: () => skillCatalog,
  loadPositions,
  makeCardDraggable,
  playersContainer,
  renderPullInfo,
  renderRecentSkillsPanel,
  savePositions,
  t,
});

initializePanel({
  panel: pullInfoEl,
  position: loadPullPanelPosition(),
  getDragHandle: () => pullInfoEl?.querySelector<HTMLElement>('.pull-drag-handle'),
  getOverlayLocked: () => overlayLocked,
  savePosition: savePullPanelPosition,
});

initializePanel({
  panel: recentSkillsPanelEl,
  position: loadRecentSkillsPanelPosition(),
  getDragHandle: () => recentSkillsPanelEl?.querySelector<HTMLElement>('.drag-handle'),
  getOverlayLocked: () => overlayLocked,
  savePosition: saveRecentSkillsPanelPosition,
});

initializePanel({
  panel: dungeonScoresPanelEl,
  position: loadDungeonScoresPanelPosition(),
  getDragHandle: () => dungeonScoresPanelEl?.querySelector<HTMLElement>('.drag-handle'),
  getOverlayLocked: () => overlayLocked,
  savePosition: saveDungeonScoresPanelPosition,
});

initializePanel({
  panel: deathLogPanelEl,
  position: deathLogPanelPosition,
  getDragHandle: () => deathLogPanelEl?.querySelector<HTMLElement>('.drag-handle'),
  getOverlayLocked: () => overlayLocked,
  savePosition: (position: Point) => { deathLogPanelPosition = position; },
});

initializePanel({
  panel: castAlertPanelEl,
  position: castAlertPanelPosition,
  getDragHandle: () => castAlertPanelEl?.querySelector<HTMLElement>('.drag-handle'),
  getOverlayLocked: () => overlayLocked,
  savePosition: (position: Point) => { castAlertPanelPosition = position; },
});

// Paint an initial (empty-state) render so the panels are never a blank
// zero-size box before the first log-data event arrives.
renderDeathLogPanel();
renderCastAlertPanel();

pickFileBtn.addEventListener('click', async () => {
  const result = await window.api.pickLogFile();
  if (!result?.canceled) setLogSourceText(result);
  updatePullPanelVisibility();
  updateRecentSkillsPanelVisibility();
});

reloadBtn.addEventListener('click', async () => {
  await window.api.reloadCurrentFile();
});

toggleLockBtn.addEventListener('click', async () => {
  await window.api.toggleOverlayLock();
});

skillsBtn.addEventListener('click', openSkillsModal);
showPartyToggle?.addEventListener('change', (event: Event) => {
  setPartyVisibility((event.currentTarget as HTMLInputElement).checked);
});
showPullToggle?.addEventListener('change', (event: Event) => {
  setPullVisibility((event.currentTarget as HTMLInputElement).checked);
});
showRecentSkillsToggle?.addEventListener('change', (event: Event) => {
  setRecentSkillsVisibility((event.currentTarget as HTMLInputElement).checked);
});
showDungeonScoresToggle?.addEventListener('change', (event: Event) => {
  setDungeonScoresVisibility((event.currentTarget as HTMLInputElement).checked);
});

showDeathLogToggle?.addEventListener('change', (event: Event) => {
  visibilitySettings = { ...visibilitySettings, showDeathLog: (event.currentTarget as HTMLInputElement).checked };
  saveVisibilitySettings();
  updateOverlayVisibility();
  renderDeathLogPanel();
});

previewCastAlertsToggle?.addEventListener('change', (event: Event) => {
  castAlertPreview = (event.currentTarget as HTMLInputElement).checked;
  renderCastAlertPanel();
});

showCastAlertsToggle?.addEventListener('change', (event: Event) => {
  visibilitySettings = { ...visibilitySettings, showCastAlerts: (event.currentTarget as HTMLInputElement).checked };
  saveVisibilitySettings();
  updateOverlayVisibility();
  renderCastAlertPanel();
});
recentSkillsLimitInput.addEventListener('change', (event: Event) => {
  setRecentSkillsLimit((event.currentTarget as HTMLInputElement).value);
});
recentSkillsLimitInput.addEventListener('input', (event: Event) => {
  const input = event.currentTarget as HTMLInputElement;
  const value = clamp(Number(input.value || 7), 1, 20);
  input.value = String(value);
});
recentSkillsLayoutDirectionSelect.addEventListener('change', (event: Event) => {
  setRecentSkillsLayoutDirection((event.currentTarget as HTMLSelectElement).value);
});
recentSkillsGrowthDirectionSelect.addEventListener('change', (event: Event) => {
  setRecentSkillsGrowthDirection((event.currentTarget as HTMLSelectElement).value);
});
recentSkillsTrackCountDownBtn.addEventListener('click', () => setRecentSkillsTrackCount(recentSkillsTrackCount - 1));
recentSkillsTrackCountUpBtn.addEventListener('click', () => setRecentSkillsTrackCount(recentSkillsTrackCount + 1));
frameGapDownBtn.addEventListener('click', () => setFrameGap(frameGap - FRAME_GAP_STEP));
frameGapUpBtn.addEventListener('click', () => setFrameGap(frameGap + FRAME_GAP_STEP));
iconsPerRowDownBtn.addEventListener('click', () => setIconsPerRow(iconsPerRow - 1));
iconsPerRowUpBtn.addEventListener('click', () => setIconsPerRow(iconsPerRow + 1));
autoHideWithWindowToggle?.addEventListener('change', (event: Event) => {
  setAutoHideWithGameWindow((event.currentTarget as HTMLInputElement).checked);
});

panelOpacitySlider.addEventListener('input', (event: Event) => {
  const value = Number((event.currentTarget as HTMLInputElement).value || Math.round(DEFAULT_PANEL_OPACITY * 100));
  setPanelOpacity(value / 100);
});
layoutDirectionSelect.addEventListener('change', (event: Event) => {
  setLayoutDirection((event.currentTarget as HTMLSelectElement).value || DEFAULT_LAYOUT_DIRECTION);
});
cardSizeDownBtn.addEventListener('click', () => setCardScale(cardScale - CARD_SCALE_STEP));
cardSizeUpBtn.addEventListener('click', () => setCardScale(cardScale + CARD_SCALE_STEP));
closeSkillsModalBtn.addEventListener('click', closeSkillsModal);
closeSettingsModalBtn.addEventListener('click', () => {
  void closeSettingsModal();
});
hotkeyToggleInteractionBtn.addEventListener('click', () => beginHotkeyCapture('toggleInteraction'));
hotkeyPickLogBtn.addEventListener('click', () => beginHotkeyCapture('pickLog'));
hotkeyToggleVisibilityBtn.addEventListener('click', () => beginHotkeyCapture('toggleVisibility'));
hotkeyOpenSettingsBtn.addEventListener('click', () => beginHotkeyCapture('openSettings'));
languageSelect.addEventListener('change', async (event: Event) => {
  const nextLanguage = (event.currentTarget as HTMLSelectElement).value === 'en' ? 'en' : 'ru';
  const result = await window.api.setLanguage(nextLanguage);
  setLanguage(result?.language || nextLanguage);
});
skillsModal.addEventListener('mousedown', (event: MouseEvent) => {
  if (event.target === skillsModal) closeSkillsModal();
});
settingsModal.addEventListener('mousedown', (event: MouseEvent) => {
  if (event.target === settingsModal) {
    void closeSettingsModal();
  }
});
document.addEventListener('keydown', handleHotkeyCapture, true);

window.api.onWatchStatus((payload) => {
  lastWatchStatusMessage = payload?.message || t('noWatching');
  watchStatusEl.textContent = lastWatchStatusMessage;
});

window.api.onOverlayMode((payload) => {
  overlayLocked = !!payload?.locked;
  toggleLockBtn.textContent = overlayLocked ? t('unlockOverlay') : t('lockOverlay');
  rerenderPlayersIfNeeded();
});

window.api.onOpenSettings(() => {
  void openSettingsModal();
});

window.api.onRequestCloseSettings(() => {
  if (!settingsModalOpen) return;
  void closeSettingsModal();
});

window.api.onLogData((payload) => {
  setLogSourceText(payload);

  if (!payload?.ok) {
    latestData = null;
    playersContainer.innerHTML = `<div class="panel player-card interactive floating-card" style="left:16px;top:64px;">${escapeHtml(t('errorPrefix'))}: ${escapeHtml(payload?.error || 'unknown')}</div>`;
    cardMap.clear();
    renderRecentSkillsPanel([]);
    renderDeathLogPanel();
    renderCastAlertPanel();
    updatePullPanelVisibility();
    updateRecentSkillsPanelVisibility();
    return;
  }

  latestData = payload.data || null;
  renderPlayers(latestData?.players || []);
  renderDeathLogPanel();
  renderCastAlertPanel();
  updateRecentSkillsPanelVisibility();
  // Re-render (not just re-show) when the detected hero changes so the
  // current character's section moves to the top after a role swap.
  if (getCurrentHeroName() !== lastRenderedHero) {
    renderDungeonScoresPanel();
  } else {
    updateDungeonScoresPanelVisibility();
  }

  if (!cooldownTimer) cooldownTimer = setInterval(tickCooldowns, 1000);
});

window.api.onDungeonScores((payload) => {
  dungeonBestScores = payload?.dungeonBestScores || {};
  renderDungeonScoresPanel();
});

window.api.onLanguageChanged((payload) => {
  setLanguage(payload?.language || 'ru');
});

window.api.onHudActivity((payload) => {
  setHudActiveState(!!payload?.active, payload?.foregroundExe || null);
});

window.api.getCurrentFile().then((result) => {
  setLogSourceText(result);
  updatePullPanelVisibility();
  updateRecentSkillsPanelVisibility();
});

window.api.getLanguage().then((result) => {
  setLanguage(result?.language || 'ru');
});

void ensureSkillCatalog();
applyAppearanceVariables();
updateCardScaleUi();
updateAutoHideUi();
updateFrameGapUi();
updateIconsPerRowUi();
updatePanelOpacityUi();
updateLayoutDirectionUi();
updateRecentSkillsLayoutUi();
updateOverlayVisibility();
applyTranslations();
updatePullPanelVisibility();
updateRecentSkillsPanelVisibility();

})();
