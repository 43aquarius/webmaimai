/**
 * 本地存储 — 设置 / 最佳成绩 / Rating 汇总
 */
import type { BestRecord, ChartType, GameSettings, PlayResult } from './types';
import { DEFAULT_SETTINGS } from './types';

const KEY = 'maimai-web-save-v1';

interface SaveData {
  settings: GameSettings;
  best: Record<string, BestRecord>;
}

function load(): SaveData {
  if (typeof window === 'undefined') return { settings: { ...DEFAULT_SETTINGS }, best: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { settings: { ...DEFAULT_SETTINGS }, best: {} };
    const data = JSON.parse(raw) as SaveData;
    return {
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      best: data.best ?? {},
    };
  } catch {
    return { settings: { ...DEFAULT_SETTINGS }, best: {} };
  }
}

function save(d: SaveData) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(d));
  } catch { /* ignore */ }
}

export function getSettings(): GameSettings {
  return load().settings;
}

export function setSettings(s: GameSettings) {
  const d = load();
  d.settings = s;
  save(d);
}

export function getBest(songId: string, diff: string, chartType: string = 'DX'): BestRecord | null {
  const best = load().best;
  return best[`${songId}:${chartType}:${diff}`] ?? best[`${songId}:${diff}`] ?? null;
}

export function getAllBest(): Record<string, BestRecord> {
  return load().best;
}

export function recordResult(r: PlayResult): { isNewBest: boolean } {
  const d = load();
  const key = `${r.songId}:${r.chartType}:${r.difficulty}`;
  const prev = d.best[key];
  if (r.autoplay) return { isNewBest: false };
  const better = !prev || r.achievement > prev.achievement;
  if (better) {
    d.best[key] = {
      achievement: r.achievement,
      rank: r.rank,
      isFC: r.isFC,
      isAP: r.isAP,
      dxScore: r.dxScore,
      maxCombo: r.maxCombo,
      rating: r.rating,
    };
    save(d);
  }
  return { isNewBest: better };
}

/** 总 DX Rating（全部最佳成绩之和） */
export function totalRating(): number {
  const best = load().best;
  return Object.values(best).reduce((a, b) => a + (b.rating ?? 0), 0);
}
