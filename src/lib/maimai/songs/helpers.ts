/**
 * 曲目数据公共辅助
 */
import type { SectionDef, SongDef } from '../types';

/** 段落构造简写 */
export const S = (name: string, bars: number, intensity: number, extra: Partial<SectionDef> = {}): SectionDef => ({
  name, bars, intensity, ...extra,
});

/** 小节起始步 */
export const bar = (n: number) => n * 16;

/** 乐句平移（重复段落用） */
export const shift = (ph: Array<[number, number, number]>, offset: number): Array<[number, number, number]> =>
  ph.map(([s, d, l]) => [s + offset, d, l]);

/** 8 分贝斯律动：每小节按 degs 循环取根音 */
export const bass8 = (bars: number, degs: number[], octShift = 0): Array<[number, number, number]> => {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    const d = degs[b % degs.length] + 7 * octShift;
    for (const s of [0, 2, 4, 6, 8, 10, 12, 14]) out.push([b * 16 + s, d, 2]);
  }
  return out;
};

/** 切分贝斯：反拍重音 */
export const bassOff = (bars: number, degs: number[]): Array<[number, number, number]> => {
  const out: Array<[number, number, number]> = [];
  for (let b = 0; b < bars; b++) {
    const d = degs[b % degs.length];
    for (const s of [2, 6, 10, 14]) out.push([b * 16 + s, d, 2]);
  }
  return out;
};

/** 和弦进行 → ChordSpec */
export const prog = (p: Array<[number, string]>, style: 'pad' | 'stab' | 'off' = 'pad') => ({ prog: p, style });

export type { SongDef };
