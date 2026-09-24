/**
 * 曲目 5：Hexa†Nova
 * 160 BPM / C# minor / Melodic Dubstep
 */
import type { SongDef } from '../types';
import { S, bass8, bassOff, prog } from './helpers';

// ---- Drop 主旋律（C# 小调音级：0=C# 2=E 4=F# 5=G 6=A 7=C#5 9=E5 11=G#5 12=A5 14=C#6）----
const DROP_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [4, 9, 2], [8, 11, 3], [12, 12, 3],
  [16, 11, 2], [20, 9, 2], [24, 7, 6], [32, 4, 2], [36, 5, 2], [40, 6, 4], [46, 5, 1],
  [48, 4, 4], [56, 2, 4], [62, 4, 2],
  [64, 7, 2], [68, 9, 2], [72, 11, 3], [76, 12, 3],
  [80, 14, 2], [84, 12, 2], [88, 11, 4], [94, 9, 1], [96, 11, 4],
  [104, 12, 4], [112, 11, 4], [120, 9, 4], [126, 7, 2],
];

// ---- 段落拨弦 ----
const VERSE_PLUCK: Array<[number, number, number]> = [
  [0, 11, 2], [8, 9, 2], [16, 7, 2], [24, 9, 2],
  [32, 11, 2], [40, 12, 2], [48, 11, 2], [56, 9, 2],
  [64, 7, 2], [72, 9, 2], [80, 11, 2], [88, 12, 2],
  [96, 14, 2], [104, 12, 2], [112, 11, 4], [120, 9, 2],
];

// C#m - A - E - B
const PROG_MAIN = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'pad');
const PROG_STAB = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab');

export const hexaNova: SongDef = {
  id: 'hexa',
  title: 'Hexa†Nova',
  artist: 'AsterNote',
  genre: 'maimai',
  bpm: 160,
  key: { root: 49, scale: 'minor' },
  jacket: '/assets/jackets/hexa.png',
  color: '#ffd76a',
  color2: '#6ab8ff',
  previewBeat: 64, // drop1
  sections: [
    S('intro', 4, 0.15, {
      drums: { hat: 'x.......x.......' },
      chords: PROG_MAIN,
      pluck: [[16, 11, 2], [32, 14, 2], [48, 12, 2], [56, 11, 2]],
      fx: ['riser'],
    }),
    S('verse', 8, 0.4, {
      drums: {
        kick: 'x.......x.......',
        snare: '........x.......',
        hat: '..x...x...x...x.',
      },
      chords: PROG_MAIN,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      pluck: VERSE_PLUCK,
    }),
    S('pre', 4, 0.6, {
      drums: {
        kick: 'x.....x.x.x.x.x.',
        snare: '........x...xxxx',
        hat: 'xxxxxxxxxxxxxxxx',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 2, 6], 1),
      fx: ['riser'],
    }),
    S('drop1', 8, 0.95, {
      drums: {
        kick: 'x.......x...x...',
        snare: '........x.......',
        clap: '........x.......',
        hat: '..x...x...x...x.',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: [
        ...bassOff(4, [0, 0, 5, 5]),
        [64, 0, 2], [66, 0, 2], [70, 0, 1], [72, 0, 1], [74, 0, 2], [80, 5, 2], [82, 5, 2], [86, 5, 1], [88, 5, 1], [90, 5, 2],
        [96, 2, 2], [98, 2, 2], [102, 2, 1], [104, 2, 1], [106, 2, 2], [112, 6, 2], [114, 6, 2], [118, 6, 1], [120, 6, 1], [122, 6, 2],
      ],
      lead: DROP_LEAD,
      arp: { pattern: [0, 2, 1, 3], rate: 16 },
    }),
    S('break', 8, 0.3, {
      drums: { hat: 'x.......x.......' },
      chords: prog([[0, 'min9'], [5, 'maj9']], 'pad'),
      pluck: [
        [0, 12, 2], [10, 11, 2], [20, 9, 2], [32, 11, 3], [44, 9, 2], [56, 7, 3],
        [64, 12, 2], [74, 14, 2], [84, 12, 2], [96, 11, 4], [112, 9, 4], [124, 7, 3],
      ],
    }),
    S('pre2', 4, 0.68, {
      drums: {
        kick: 'x.....x.x.x.x.x.',
        snare: '........x...xxxx',
        hat: 'xxxxxxxxxxxxxxxx',
        clap: '........x.......',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 2, 6], 1),
      fx: ['riser', 'impact'],
    }),
    S('drop2', 8, 1.0, {
      drums: {
        kick: 'x.......x...x...',
        snare: '........x.......',
        clap: '........x.......',
        hat: '..x...x...x...x.',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: [
        ...bassOff(4, [0, 0, 5, 5]),
        [64, 0, 2], [66, 0, 2], [70, 0, 1], [72, 0, 1], [74, 0, 2], [80, 5, 2], [82, 5, 2], [86, 5, 1], [88, 5, 1], [90, 5, 2],
        [96, 2, 2], [98, 2, 2], [102, 2, 1], [104, 2, 1], [106, 2, 2], [112, 6, 2], [114, 6, 2], [118, 6, 1], [120, 6, 1], [122, 6, 2],
      ],
      lead: DROP_LEAD,
      arp: { pattern: [0, 2, 4, 2, 0, 2, 4, 6], rate: 16 },
    }),
    S('outro', 4, 0.1, {
      drums: { crashBars: [0] },
      chords: prog([[0, 'min9'], [5, 'maj']], 'pad'),
      pluck: [[16, 9, 2], [32, 7, 2], [48, 4, 4]],
    }),
  ],
  charts: {
    BASIC: 3.0,
    ADVANCED: 6.7,
    EXPERT: 10.3,
    MASTER: 12.7,
    REMASTER: 14.3,
  },
};
