/**
 * maimai Web 复刻 — 核心类型定义
 */

export type Judgement = 'CP' | 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

export type NoteType = 'TAP' | 'HOLD' | 'SLIDE' | 'TOUCH' | 'BREAK';

/** 谱面类型：STD（旧白谱） / DX（黄谱，含触摸） */
export type ChartType = 'STD' | 'DX';

export type Difficulty = 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER' | 'REMASTER';

export const DIFFICULTIES: Difficulty[] = ['BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'REMASTER'];

export const CHART_TYPE_INFO: Record<ChartType, { label: string; color: string; bg: string }> = {
  STD: { label: 'STANDARD', color: '#3ddc84', bg: 'rgba(61,220,132,0.18)' },
  DX: { label: 'DELUXE', color: '#ffd34d', bg: 'rgba(255,211,77,0.18)' },
};

export const DIFF_INFO: Record<Difficulty, { label: string; short: string; color: string; color2: string }> = {
  BASIC: { label: 'BASIC', short: '绿', color: '#22c55e', color2: '#0e7a37' },
  ADVANCED: { label: 'ADVANCED', short: '黄', color: '#fbbf24', color2: '#a16207' },
  EXPERT: { label: 'EXPERT', short: '红', color: '#fb4d6d', color2: '#a3133a' },
  MASTER: { label: 'MASTER', short: '紫', color: '#c084fc', color2: '#7c3aed' },
  REMASTER: { label: 'Re:MASTER', short: '白', color: '#f8e8ff', color2: '#d59df2' },
};

/** 音符基础分（达成率权重） */
export const NOTE_BASE: Record<NoteType, number> = {
  TAP: 500,
  HOLD: 1000,
  SLIDE: 1500,
  TOUCH: 500,
  BREAK: 2500,
};

/** DX 分数（CP=3 / P=2 / GR=1） */
export const DX_SCORE: Record<Judgement, number> = {
  CP: 3,
  PERFECT: 2,
  GREAT: 1,
  GOOD: 0,
  MISS: 0,
};

/** 判定达成率倍率（BREAK 加成在 scoring 中处理） */
export const JUDGE_MULT: Record<Judgement, number> = {
  CP: 1.0,
  PERFECT: 1.0,
  GREAT: 0.8,
  GOOD: 0.5,
  MISS: 0,
};

/** 判定窗口（毫秒） */
export const JUDGE_WINDOWS: Record<Judgement, number> = {
  CP: 33,
  PERFECT: 67,
  GREAT: 100,
  GOOD: 134,
  MISS: 999,
};

/** 判定显示信息（官方配色：PERFECT 金黄 / GREAT 粉 / GOOD 绿 / MISS 灰） */
export const JUDGE_TEXT: Record<Judgement, { text: string; color: string; rainbow?: boolean }> = {
  CP: { text: 'CRITICAL PERFECT', color: '#ffe95c', rainbow: true },
  PERFECT: { text: 'PERFECT', color: '#ffd84a' },
  GREAT: { text: 'GREAT', color: '#ff5fa8' },
  GOOD: { text: 'GOOD', color: '#7dff7d' },
  MISS: { text: 'MISS', color: '#8b9dc3' },
};

/** 谱面音符（生成产物） */
export interface ChartNote {
  t: number;        // 判定时刻（秒）
  type: NoteType;
  pos: number;      // 0-7（1-8 号键）
  end?: number;     // HOLD 尾 / SLIDE 到达时刻
  endPos?: number;  // SLIDE 目标键位
}

export interface ChartCounts {
  tap: number; hold: number; slide: number; touch: number; break: number; total: number;
}

export interface CompiledChart {
  difficulty: Difficulty;
  chartType: ChartType;    // STD / DX
  level: number;         // 谱面定数
  levelText: string;     // "12" / "13+"
  notes: ChartNote[];    // 按 t 排序
  counts: ChartCounts;
  totalBase: number;     // Σ 基础分
  totalMax: number;      // Σ 满分（含 BREAK CP 加成）
  totalJudgments: number; // 判定总数（HOLD 算 2）
  duration: number;      // 谱面时长（秒）
}

/* ---------------- 音乐 DSL ---------------- */

export type Instrument =
  | 'kick' | 'snare' | 'hat' | 'openhat' | 'clap' | 'crash'
  | 'bass' | 'chord' | 'lead' | 'arp' | 'pluck'
  | 'riser' | 'impact';

export interface MusicEvent {
  t: number;          // 拍（beat）
  inst: Instrument;
  midi?: number;      // 音高
  len?: number;       // 时值（拍）
  vel?: number;      // 力度 0-1
  chord?: number[];   // 和弦音符列表
}

export interface DrumSpec {
  kick?: string;      // 每小节 16 步字符画 "x...x...x...x..."
  snare?: string;
  hat?: string;
  openhat?: string;
  clap?: string;
  crashBars?: number[]; // 哪些小节（0 起）有 crash
}

export interface ChordSpec {
  /** 每小节一个 [音级, 和弦性质]；音级为调式音阶 index */
  prog: Array<[number, string]>;
  style: 'pad' | 'stab' | 'off';
}

export interface ArpSpec {
  /** 相对和弦根音的和弦内音序列（可跨八度） */
  pattern: number[];
  rate?: 8 | 16;
}

export interface SectionDef {
  name: string;
  bars: number;
  intensity: number;           // 0-1 谱面密度驱动
  drums?: DrumSpec;
  bass?: Array<[number, number, number]>;  // [步(16分,段落内绝对), 音级, 时值(步)]
  chords?: ChordSpec;
  arp?: ArpSpec;
  lead?: Array<[number, number, number]>;  // [步, 音级, 时值(步)]
  pluck?: Array<[number, number, number]>;
  fx?: Array<'riser' | 'impact'>;
}

export interface SongDef {
  id: string;
  title: string;
  titleSub?: string;
  artist: string;
  genre: string;          // 风格描述（自由文本）
  category: string;       // 官方分类（选曲页签）
  version: string;        // 收录版本
  bpm: number;
  /** 调性：主音 MIDI 与音阶 */
  key: { root: number; scale: 'minor' | 'major' | 'dorian' };
  /** 摆动节奏强度 0-1（爵士用） */
  swing?: number;
  jacket: string;
  color: string;
  color2: string;
  previewBeat: number;
  sections: SectionDef[];
  /** STD（白谱）定数 */
  stdCharts?: Partial<Record<Difficulty, number>>;
  /** DX（黄谱）定数 */
  dxCharts?: Partial<Record<Difficulty, number>>;
  /** 谱面装饰用风格标记 */
  style?: string;
}

/** 难度定数 → 显示文本（"12" / "12+"），避免浮点误差 */
export function lvText(lv: number): string {
  const frac = Math.round((lv - Math.floor(lv)) * 10);
  return `${Math.floor(lv)}${frac >= 7 ? '+' : ''}`;
}

/** 全部可用谱面类型 */
export function chartTypesOf(song: SongDef): ChartType[] {
  const out: ChartType[] = [];
  if (song.stdCharts && Object.keys(song.stdCharts).length > 0) out.push('STD');
  if (song.dxCharts && Object.keys(song.dxCharts).length > 0) out.push('DX');
  return out;
}

export function chartsOf(song: SongDef, type: ChartType): Partial<Record<Difficulty, number>> {
  return (type === 'DX' ? song.dxCharts : song.stdCharts) ?? {};
}

/* ---------------- 游戏结果 ---------------- */

export interface JudgementCounts {
  CP: number; PERFECT: number; GREAT: number; GOOD: number; MISS: number;
}

export interface PlayResult {
  songId: string;
  difficulty: Difficulty;
  chartType: ChartType;
  level: number;
  achievement: number;      // 0-101.xxxx（百分比数值）
  rank: string;
  isFC: boolean;
  isAP: boolean;
  counts: JudgementCounts;
  dxScore: number;
  dxScoreMax: number;
  maxCombo: number;
  totalNotes: number;
  rating: number;           // 单曲 rating
  fastSlow: { fast: number; slow: number };
  autoplay: boolean;
}

/* ---------------- 设置与存档 ---------------- */

export interface GameSettings {
  speed: number;        // 音符速度 1.0-10.0
  offsetMs: number;     // 判定偏移 -100~100
  volume: number;       // 0-1
  autoPlay: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  speed: 5.0,
  offsetMs: 0,
  volume: 0.85,
  autoPlay: false,
};

export interface BestRecord {
  achievement: number;
  rank: string;
  isFC: boolean;
  isAP: boolean;
  dxScore: number;
  maxCombo: number;
  rating: number;
}
