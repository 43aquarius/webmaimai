/**
 * 曲目 2：Splash Circuit
 * 178 BPM / D major / Drum & Bass
 */
import type { SongDef } from '../types';
import { S, bass8, bassOff, prog } from './helpers';

// ---- 副歌主旋律（D 大调音级：0=D 2=F# 4=A 5=B 7=D5 9=F#5 11=A5 12=B5 14=D6）----
const DROP_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 1], [4, 11, 1], [6, 9, 1], [8, 7, 3], [12, 5, 1], [14, 4, 1],
  [16, 4, 2], [20, 5, 2], [24, 7, 3], [28, 4, 1], [30, 2, 1],
  [32, 7, 2], [34, 9, 1], [36, 11, 1], [38, 12, 1], [40, 11, 3], [44, 9, 1], [46, 7, 1],
  [48, 5, 2], [52, 4, 2], [56, 2, 4],
  [64, 7, 2], [66, 9, 1], [68, 11, 1], [70, 9, 1], [72, 7, 3], [76, 5, 1], [78, 4, 1],
  [80, 4, 2], [84, 5, 2], [88, 7, 3], [92, 9, 1], [94, 11, 1],
  [96, 14, 2], [98, 12, 1], [100, 11, 1], [102, 12, 1], [104, 11, 3], [108, 9, 1], [110, 7, 1],
  [112, 9, 4], [118, 7, 1], [120, 4, 3], [124, 5, 2],
];

// ---- 段落拨弦（Break 用）----
const BREAK_PLUCK: Array<[number, number, number]> = [
  [0, 11, 2], [6, 9, 2], [12, 7, 2],
  [20, 9, 2], [28, 11, 2],
  [32, 12, 2], [38, 11, 2], [44, 9, 2],
  [52, 7, 4], [60, 5, 2],
  [64, 11, 2], [70, 9, 2], [76, 7, 2],
  [84, 9, 2], [92, 12, 2],
  [96, 14, 2], [102, 12, 2], [108, 11, 4],
  [116, 9, 4], [124, 7, 2],
];

// D - Bm - G - A
const PROG_A = prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']], 'pad');
const PROG_STAB = prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']], 'stab');

export const splashCircuit: SongDef = {
  id: 'splash',
  title: 'Splash Circuit',
  artist: 'AQUA@RiUM',
  genre: 'maimai',
  bpm: 178,
  key: { root: 50, scale: 'major' },
  jacket: '/assets/jackets/splash.png',
  color: '#38e1ff',
  color2: '#b8f4ff',
  previewBeat: 96, // Drop1 起点
  sections: [
    S('intro', 4, 0.2, {
      drums: { hat: 'x.x.x.x.x.x.x.x.' },
      chords: PROG_A,
      arp: { pattern: [0, 2, 1, 3, 2, 4, 3, 5], rate: 16 },
      fx: ['riser'],
    }),
    S('verse', 8, 0.45, {
      drums: {
        kick: 'x......x..x.....',
        snare: '....x.......x...',
        hat: 'x.xxx.x.x.xxx.x.',
      },
      chords: PROG_A,
      bass: bassOff(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      pluck: [[8, 7, 2], [24, 9, 2], [40, 11, 2], [56, 9, 2], [72, 7, 2], [88, 5, 2], [104, 4, 2], [120, 5, 2]],
    }),
    S('bassline', 8, 0.6, {
      drums: {
        kick: 'x......x..x.....',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.xxx.x.x.xxx.xx',
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      pluck: [[0, 11, 2], [10, 9, 2], [22, 7, 2], [32, 9, 2], [42, 11, 2], [52, 12, 2], [64, 11, 2], [74, 9, 2], [86, 7, 2], [96, 9, 2], [106, 12, 2], [116, 14, 2]],
    }),
    S('pre', 4, 0.7, {
      drums: {
        kick: 'x...x...x..xx.x.',
        snare: '....x...x.x.xxxx',
        hat: 'xxxxxxxxxxxxxxxx',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 3, 4], 1),
      fx: ['riser'],
    }),
    S('drop1', 8, 1.0, {
      drums: {
        kick: 'x......x..x....x',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.xxx.x.x.xxx.x.',
        openhat: '..............x.',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      lead: DROP_LEAD,
      arp: { pattern: [0, 2, 4, 2], rate: 16 },
    }),
    S('break', 8, 0.3, {
      drums: {
        kick: 'x.......x.......',
        snare: '................',
        hat: 'x.......x.......',
      },
      chords: prog([[0, 'maj7'], [5, 'min9'], [3, 'maj'], [4, 'add9']], 'pad'),
      pluck: BREAK_PLUCK,
    }),
    S('build', 4, 0.75, {
      drums: {
        kick: 'x...x...x..xx.xx',
        snare: '....x...xxxxxxxx',
        hat: 'xxxxxxxxxxxxxxxx',
        clap: '....x.......x...',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 3, 4], 1),
      fx: ['riser', 'impact'],
    }),
    S('drop2', 8, 1.0, {
      drums: {
        kick: 'x......x..x....x',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.xxx.x.x.xxx.x.',
        openhat: '..............x.',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      lead: DROP_LEAD,
      arp: { pattern: [0, 2, 4, 6, 4, 2], rate: 16 },
    }),
    S('outro', 4, 0.12, {
      drums: { hat: 'x.......x.......' },
      chords: prog([[0, 'maj7'], [3, 'maj9']], 'pad'),
      pluck: [[16, 11, 2], [32, 9, 2], [48, 7, 4]],
    }),
  ],
  charts: {
    BASIC: 4.0,
    ADVANCED: 7.0,
    EXPERT: 11.0,
    MASTER: 13.7,
  },
};
