/**
 * 曲目编曲风格库 — 鼓组/贝斯/进行 预设
 * 所有节奏字符画均为 16 步/小节（4/4 拍，16 分音符网格）
 */
import type { DrumSpec } from '../types';

/* ---------------- 鼓组预设 ---------------- */

/** 四踩舞曲（house / hardcore 基底） */
export const D4 = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x...x...x...x...',
  hat: '..x...x...x...x.',
  ...extra,
});

/** Happy Hardcore：四踩 + 2/4 拍手拍 + 反拍开镲 */
export const DHARDCORE = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x...x...x...x...',
  snare: '....x.......x...',
  hat: '..x...x...x...x.',
  openhat: '..............x.',
  clap: '....x.......x...',
  ...extra,
});

/** 标准摇滚 */
export const DROCK = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.....x...x.....',
  snare: '....x.......x...',
  hat: 'x.x.x.x.x.x.x.x.',
  ...extra,
});

/** 疾走摇滚（8 分踩镲全开 + 底鼓驱动） */
export const DROCK_FAST = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x...x..x.x..x...',
  snare: '....x.......x...',
  hat: 'x.x.x.x.x.x.x.x.',
  ...extra,
});

/** 双踩金属（16 分底鼓连音段） */
export const DMETAL = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.x.x.x.x.x.x.x.',
  snare: '....x.......x...',
  hat: 'x.x.x.x.x.x.x.x.',
  ...extra,
});

/** 半拍（future bass / trap 副歌） */
export const DHALF = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.......x.......',
  snare: '........x.......',
  hat: 'x.x.x.x.x.x.x.x.',
  ...extra,
});

/** 2-Step（UK Garage / future pop 主歌） */
export const DSTEP = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.......x.......',
  snare: '....x.......x...',
  hat: '..x..x....x..x..',
  ...extra,
});

/** Drum & Bass */
export const DDNB = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.....x...x.....',
  snare: '....x.......x..x',
  hat: '..x...x...x...x.',
  ...extra,
});

/** 爵士摇摆（直写 8 分，swing 后处理负责摆动） */
export const DJAZZ = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.......x.......',
  snare: '....x.......x..x',
  hat: 'x.x.x.x.x.x.x.x.',
  ...extra,
});

/** 放克 / Disco */
export const DFUNK = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x..x..x...x..x..',
  snare: '....x.......x...',
  hat: '..x...x...x...x.',
  openhat: '......x.......x.',
  ...extra,
});

/** 流行抒情 */
export const DPOP = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x.......x.......',
  snare: '....x.......x...',
  hat: '..x...x...x...x.',
  ...extra,
});

/** 应援摇滚（オーケー？オーライ！用） */
export const DOUEN = (extra: Partial<DrumSpec> = {}): DrumSpec => ({
  kick: 'x...x...x...x...',
  snare: '....x.......x...',
  hat: 'x.x.x.x.x.x.x.x.',
  clap: '....x.......x.x.',
  ...extra,
});

/* ---------------- 贝斯律动 ---------------- */

/** 16 分驱动（hardcore / metal） */
export function bass16(bars: number, degs: number[], oct = 0): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    const d = degs[b % degs.length] + 7 * oct;
    for (let s = 0; s < 16; s += 2) out.push([b * 16 + s, d, 2]);
  }
  return out;
}

/** 全音符长贝斯（future bass 副歌） */
export function bassPad(bars: number, degs: number[]): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    out.push([b * 16, degs[b % degs.length], 16]);
  }
  return out;
}

/** 八分跳音（disco / 电音流行） */
export function bassOct(bars: number, degs: number[]): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    const d = degs[b % degs.length];
    for (let s = 0; s < 16; s += 4) {
      out.push([b * 16 + s, d, 3]);
      out.push([b * 16 + s + 2, d + 7, 3]);
    }
  }
  return out;
}

/** 行走贝斯（爵士：每拍级进） */
export function bassWalk(bars: number, degs: number[][]): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    const bar = degs[b % degs.length];
    for (let beat = 0; beat < 4; beat++) {
      out.push([b * 16 + beat * 4, bar[beat] ?? bar[0], 3]);
    }
  }
  return out;
}

/* ---------------- 琶音模式 ---------------- */

export const ARP_UP = [0, 1, 2, 3];
export const ARP_UPDOWN = [0, 1, 2, 3, 2, 1];
export const ARP_PINCH = [0, 2, 1, 3];

export { S, bar, shift, bass8, bassOff, prog } from './helpers';
