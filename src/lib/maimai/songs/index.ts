/**
 * 曲目总表 — 20 首真实舞萌曲目
 * 元数据（标题/艺术家/分类/版本/难度定数/封面）来自国服曲目数据库
 */
import type { ChartType, Difficulty, SongDef } from '../types';
import { chartTypesOf, chartsOf } from '../types';
import { pandora, tenka, caliburne, fakeface, jinglebell, yumehibana } from './originals';
import { phony, goodbye, kamipoi, drd, alien, teo, android, happysyn } from './vocaloid';
import { saikyo, solid, tengoku, sacredruin, okorai, hotlimit } from './mixed';

export const SONGS: SongDef[] = [
  pandora,
  tenka,
  caliburne,
  fakeface,
  jinglebell,
  yumehibana,
  phony,
  goodbye,
  kamipoi,
  drd,
  alien,
  teo,
  android,
  happysyn,
  saikyo,
  solid,
  tengoku,
  sacredruin,
  okorai,
  hotlimit,
];

/** 官方分类页签（顺序对齐选曲界面） */
export const GENRES = [
  '全部', '舞萌', 'niconico＆VOCALOID™', '东方Project', '流行&动漫', '其他游戏', '音击/中二节奏',
] as const;

export function getSong(id: string): SongDef {
  return SONGS.find((s) => s.id === id) ?? SONGS[0];
}

export function hasChart(song: SongDef, diff: Difficulty, type: ChartType = 'DX'): boolean {
  return chartsOf(song, type)[diff] !== undefined;
}

export { chartTypesOf, chartsOf };
