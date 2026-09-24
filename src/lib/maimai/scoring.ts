/**
 * 计分系统 — 达成率 / 评价 / DX Rating
 * 规则对齐 maimai DX：
 * - 音符基础分 TAP/TOUCH 500, HOLD 1000, SLIDE 1500, BREAK 2500
 * - BREAK 加成 CP +100 / P +50 / GR +0
 * - 达成率 = 实得分 / Σ基础分 ×100（上限约 101%）
 * - DX 分数 CP=3 P=2 GR=1
 */
import type { Difficulty, Judgement, NoteType } from './types';
import { NOTE_BASE, DX_SCORE } from './types';

/** 单音符得分（含 BREAK 加成） */
export function noteScore(type: NoteType, j: Judgement): number {
  const base = NOTE_BASE[type];
  switch (j) {
    case 'CP': return type === 'BREAK' ? base + 100 : base;
    case 'PERFECT': return type === 'BREAK' ? base + 50 : base;
    case 'GREAT': return type === 'BREAK' ? base : base * 0.8;
    case 'GOOD': return type === 'BREAK' ? base * 0.7 : base * 0.5;
    case 'MISS': return 0;
  }
}

export function dxOf(j: Judgement): number {
  return DX_SCORE[j];
}

/** 评价等级 */
export const RANK_TABLE: Array<{ min: number; rank: string; color: string }> = [
  { min: 100.5, rank: 'SSS+', color: '#ffe95c' },
  { min: 100.0, rank: 'SSS', color: '#ffd700' },
  { min: 99.5, rank: 'SS+', color: '#ffb347' },
  { min: 99.0, rank: 'SS', color: '#ff9f1c' },
  { min: 98.0, rank: 'S+', color: '#ff7b54' },
  { min: 97.0, rank: 'S', color: '#ff5e5b' },
  { min: 94.0, rank: 'AAA', color: '#e8590c' },
  { min: 90.0, rank: 'AA', color: '#d9480f' },
  { min: 80.0, rank: 'B', color: '#845ef7' },
  { min: 70.0, rank: 'C', color: '#5f3dc4' },
  { min: 60.0, rank: 'D', color: '#495057' },
  { min: 40.0, rank: 'E', color: '#343a40' },
  { min: 0, rank: 'F', color: '#212529' },
];

export function rankOf(achievement: number): string {
  for (const r of RANK_TABLE) if (achievement >= r.min) return r.rank;
  return 'F';
}

export function rankColor(rank: string): string {
  return RANK_TABLE.find((r) => r.rank === rank)?.color ?? '#495057';
}

/** Rating 系数（SS 及以上对齐官方表；AA 以下为近似平滑） */
export function ratingFactor(achievement: number): number {
  if (achievement >= 100.5) return 0.224;
  if (achievement >= 100.0) return 0.216;
  if (achievement >= 99.5) return 0.211;
  if (achievement >= 99.0) return 0.208;
  if (achievement >= 98.0) return 0.203;
  if (achievement >= 97.0) return 0.198;
  if (achievement >= 94.0) return 0.194;
  if (achievement >= 90.0) return 0.190;
  return 0.19 * Math.pow(Math.max(achievement, 0) / 90, 1.15);
}

/** 单曲 Rating = floor(定数 × 达成率 × 系数) + AP 奖励1 */
export function ratingOf(level: number, achievement: number, isAP: boolean): number {
  const r = Math.floor(level * achievement * ratingFactor(achievement));
  return r + (isAP ? 1 : 0);
}

/** 达成率格式化：97.3212% */
export function fmtAchievement(a: number): string {
  return `${a.toFixed(4)}%`;
}

export function isFullCombo(counts: { GOOD: number; MISS: number }): boolean {
  return counts.GOOD === 0 && counts.MISS === 0;
}

export function isAllPerfect(counts: { PERFECT: number; GREAT: number; GOOD: number; MISS: number }): boolean {
  return counts.GREAT === 0 && counts.GOOD === 0 && counts.MISS === 0;
}

/** 难度图标颜色（选曲界面用） */
export const DIFF_COLORS: Record<Difficulty, { main: string; dark: string; text: string }> = {
  BASIC: { main: '#22c55e', dark: '#166534', text: '#fff' },
  ADVANCED: { main: '#fbbf24', dark: '#a16207', text: '#000' },
  EXPERT: { main: '#fb4d6d', dark: '#a3133a', text: '#fff' },
  MASTER: { main: '#c084fc', dark: '#6d28d9', text: '#fff' },
  REMASTER: { main: '#f5d0fe', dark: '#a21caf', text: '#000' },
};
