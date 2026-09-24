/**
 * 曲目总表
 */
import type { SongDef, Difficulty } from '../types';
import { sakuraSpiral } from './sakura';
import { splashCircuit } from './splash';
import { asteriskTrip } from './asterisk';
import { orbitExpress } from './orbit';
import { hexaNova } from './hexa';

export const SONGS: SongDef[] = [
  sakuraSpiral,
  splashCircuit,
  asteriskTrip,
  orbitExpress,
  hexaNova,
];

export const GENRES = ['全部', 'maimai', '流行&动漫', '其他'] as const;

export function getSong(id: string): SongDef {
  return SONGS.find((s) => s.id === id) ?? SONGS[0];
}

export function hasChart(song: SongDef, diff: Difficulty): boolean {
  return song.charts[diff] !== undefined;
}
