import { app, Notification, shell } from 'electron';

const REPO = 'RaizQQW/FellowshipDungeonscoreOverlay';
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;
const LATEST_API = `https://api.github.com/repos/${REPO}/releases/latest`;

function parseVersion(value: string): number[] {
  return String(value).replace(/^v/i, '').split('.').map((part) => parseInt(part, 10) || 0);
}

function isNewer(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

async function fetchLatestTag(): Promise<{ tag: string; url: string } | null> {
  try {
    const res = await fetch(LATEST_API, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'FellowshipDungeonScoreOverlay' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name?: string; html_url?: string };
    const tag = String(data.tag_name || '').trim();
    if (!tag) return null;
    return { tag, url: data.html_url || RELEASES_PAGE };
  } catch {
    return null;
  }
}

// Portable builds can't self-install (electron-updater needs the NSIS target),
// so we notify instead: check GitHub Releases on startup and, if a newer tag
// exists, show a click-to-download notification. Fails silently offline.
async function notifyIfUpdateAvailable(): Promise<void> {
  const latest = await fetchLatestTag();
  if (!latest) return;
  if (!isNewer(latest.tag, app.getVersion())) return;
  if (!Notification.isSupported()) return;
  const notification = new Notification({
    title: 'Fellowship Overlay update available',
    body: `${latest.tag} is out (you have v${app.getVersion()}). Click to open the download page.`,
  });
  notification.on('click', () => { void shell.openExternal(latest.url); });
  notification.show();
}

export { notifyIfUpdateAvailable };
