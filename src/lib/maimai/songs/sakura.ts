/**
 * 曲目 1：桜花螺旋 (Sakura Spiral)
 * 140 BPM / F# minor / Future Bass
 */
import type { SongDef } from '../types';
import { S, bass8, prog } from './helpers';

// ---- 主旋律（副歌 8 小节，音级：0=F# 2=A 4=C# 5=D 6=E 7=F#5 9=A5 11=C#6 12=D6 13=E6 14=F#6）----
const CHORUS_LEAD: Array<[number, number, number]> = [
  // 第 1-2 小节
  [0, 7, 1], [2, 7, 1], [4, 9, 1], [6, 11, 1], [8, 12, 4], [14, 11, 1],
  [16, 9, 2], [20, 7, 3], [24, 4, 1], [26, 5, 1], [28, 4, 1], [30, 2, 1],
  // 第 3-4 小节
  [32, 6, 1], [34, 6, 1], [36, 7, 1], [38, 6, 1], [40, 4, 4], [46, 4, 1],
  [48, 2, 2], [52, 4, 2], [56, 2, 4], [62, 2, 1],
  // 第 5-6 小节（重复第 1-2 小节）
  [64, 7, 1], [66, 7, 1], [68, 9, 1], [70, 11, 1], [72, 12, 4], [78, 11, 1],
  [80, 9, 2], [84, 7, 3], [88, 4, 1], [90, 5, 1], [92, 4, 1], [94, 6, 1],
  // 第 7-8 小节（爬升到高潮）
  [96, 11, 1], [98, 12, 1], [100, 13, 1], [102, 14, 3], [106, 13, 1], [108, 12, 1], [110, 11, 1],
  [112, 12, 6], [120, 9, 2], [122, 11, 2], [126, 9, 1],
];

// ---- 拨弦旋律（主歌）----
const VERSE_PLUCK: Array<[number, number, number]> = [
  [0, 9, 2], [4, 7, 2], [8, 4, 2], [12, 2, 2],
  [16, 9, 2], [20, 7, 2], [24, 5, 2], [28, 4, 2],
  [32, 2, 2], [36, 4, 2], [40, 5, 2], [44, 6, 2],
  [48, 7, 2], [52, 6, 2], [56, 4, 4], [64, 9, 2], [68, 11, 2], [72, 12, 4], [78, 11, 2],
  [80, 9, 2], [84, 7, 2], [88, 6, 2], [92, 4, 2],
  [96, 5, 2], [100, 6, 2], [104, 7, 4], [112, 4, 2], [116, 2, 4],
];

// 和弦进行 F#m - D - A - E
const PROG_MAIN = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'pad');
const PROG_STAB = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab');

export const sakuraSpiral: SongDef = {
  id: 'sakura',
  title: '桜花螺旋',
  titleSub: 'Sakura Spiral',
  artist: '桜庭みるく',
  genre: '流行&动漫',
  bpm: 140,
  key: { root: 54, scale: 'minor' },
  jacket: '/assets/jackets/sakura.png',
  color: '#ff8ec6',
  color2: '#ffd3e8',
  previewBeat: 64, // 副歌起点
  sections: [
    S('intro', 4, 0.15, {
      drums: { hat: 'x.x.x.x.x.x.x.x.' },
      chords: PROG_MAIN,
      pluck: [[32, 7, 2], [40, 9, 2], [48, 11, 2], [56, 12, 2]],
      fx: ['riser'],
    }),
    S('verse1', 8, 0.4, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
      },
      chords: PROG_MAIN,
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      pluck: VERSE_PLUCK,
    }),
    S('pre1', 4, 0.6, {
      drums: {
        kick: 'x...x...x...x..x',
        snare: '....x.......x..x',
        hat: 'x.x.x.x.x.x.xxxx',
        clap: '....x.......x...',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 0, 5, 6], 1),
      fx: ['riser'],
    }),
    S('chorus1', 8, 0.95, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        openhat: '..x...x...x...x.',
        hat: 'x.x.x.x.x.x.x.x.',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 1, 2, 3, 2, 1], rate: 16 },
    }),
    S('verse2', 8, 0.5, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
      },
      chords: PROG_MAIN,
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      pluck: VERSE_PLUCK.map(([s, d, l]) => [s, d, l] as [number, number, number]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre2', 4, 0.68, {
      drums: {
        kick: 'x...x...x..xx.x.',
        snare: '....x...x.x.xxxx',
        hat: 'xxxxxxxxxxxxxxxx',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 2, 6], 1),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        openhat: '..x...x...x...x.',
        hat: 'x.x.x.x.x.x.x.x.',
        clap: '....x.......x...',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 1, 2, 3, 4, 3, 2, 1], rate: 16 },
    }),
    S('break', 4, 0.25, {
      drums: { hat: 'x.......x.......' },
      chords: prog([[0, 'min9'], [5, 'maj'], [2, 'add9'], [6, 'maj']], 'pad'),
      pluck: [[0, 11, 2], [8, 12, 2], [16, 11, 2], [24, 9, 2], [32, 7, 4], [48, 9, 2], [56, 7, 4]],
    }),
    S('chorus3', 8, 1.0, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        openhat: '..x...x...x...x.',
        hat: 'x.x.x.x.x.x.x.x.',
        clap: '....x.......x...',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 4, 2, 0, 2, 4, 2], rate: 16 },
    }),
    S('outro', 4, 0.1, {
      chords: prog([[0, 'min9'], [5, 'maj7']], 'pad'),
      pluck: [[16, 9, 2], [32, 7, 2], [48, 4, 4]],
    }),
  ],
  charts: {
    BASIC: 3.0,
    ADVANCED: 6.0,
    EXPERT: 9.7,
    MASTER: 12.3,
  },
};
