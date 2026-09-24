/**
 * 曲目 4：逆行特急 (ORBIT EXPRESS)
 * 200 BPM / E minor / Hardcore
 */
import type { SongDef } from '../types';
import { S, bass8, bassOff, prog } from './helpers';

// ---- 副歌 anthem 主旋律（E 小调音级：0=E 2=G 3=A 4=B 5=C 6=D 7=E5 9=G5 11=B5 12=C6 14=E6）----
const CHORUS_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [2, 9, 1], [4, 10, 1], [6, 11, 1], [8, 12, 2], [12, 11, 2], [14, 10, 1],
  [16, 11, 1], [18, 9, 1], [20, 11, 2], [24, 12, 2], [28, 14, 2],
  [32, 7, 1], [34, 9, 1], [36, 10, 1], [38, 11, 1], [40, 14, 3], [44, 12, 1], [46, 11, 1],
  [48, 12, 2], [52, 11, 2], [56, 9, 2], [60, 7, 2],
  [64, 7, 1], [66, 9, 1], [68, 10, 1], [70, 11, 1], [72, 12, 2], [76, 11, 2], [78, 10, 1],
  [80, 11, 1], [82, 9, 1], [84, 11, 2], [88, 12, 2], [92, 14, 2],
  [96, 17, 2], [100, 16, 1], [102, 14, 1], [104, 12, 4], [110, 11, 1], [112, 12, 2], [116, 11, 2],
  [120, 9, 2], [122, 11, 1], [124, 12, 1], [126, 14, 1],
];

// ---- 主歌 riff ----
const VERSE_RIFF: Array<[number, number, number]> = [
  [0, 7, 1], [2, 7, 1], [4, 10, 1], [6, 7, 1], [8, 11, 2], [12, 10, 1], [14, 7, 1],
  [16, 7, 1], [18, 10, 1], [20, 12, 1], [22, 10, 1], [24, 9, 2], [28, 10, 2],
  [32, 7, 1], [34, 7, 1], [36, 10, 1], [38, 7, 1], [40, 11, 2], [44, 14, 2],
  [48, 12, 1], [50, 11, 1], [52, 9, 1], [54, 11, 1], [56, 12, 4], [62, 10, 1],
  [64, 7, 1], [66, 7, 1], [68, 10, 1], [70, 7, 1], [72, 11, 2], [76, 10, 1], [78, 7, 1],
  [80, 7, 1], [82, 10, 1], [84, 12, 1], [86, 10, 1], [88, 9, 2], [92, 10, 2],
  [96, 7, 1], [98, 10, 1], [100, 12, 1], [102, 14, 1], [104, 17, 3], [108, 14, 1], [110, 12, 1],
  [112, 11, 2], [116, 12, 2], [120, 14, 4],
];

// Em - C - G - D
const PROG_MAIN = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'pad');
const PROG_STAB = prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab');

export const orbitExpress: SongDef = {
  id: 'orbit',
  title: '逆行特急',
  titleSub: 'ORBIT EXPRESS',
  artist: 'Shiden',
  genre: 'maimai',
  bpm: 200,
  key: { root: 52, scale: 'minor' },
  jacket: '/assets/jackets/orbit.png',
  color: '#ff5a4e',
  color2: '#ffb3ab',
  previewBeat: 96, // chorus2
  sections: [
    S('intro', 4, 0.2, {
      drums: { hat: 'x.x.x.x.x.x.x.x.' },
      chords: PROG_MAIN,
      pluck: [[16, 14, 2], [24, 12, 2], [32, 11, 2], [48, 12, 2], [56, 14, 2]],
      fx: ['impact', 'riser'],
    }),
    S('verse1', 8, 0.55, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: VERSE_RIFF,
    }),
    S('chorus1', 8, 0.9, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '..x...x...x...x.',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 1, 2], rate: 16 },
    }),
    S('verse2', 8, 0.6, {
      drums: {
        kick: 'x...x...x...x..x',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
      },
      chords: PROG_STAB,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: VERSE_RIFF,
    }),
    S('chorus2', 8, 1.0, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '..x...x...x...x.',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 4, 2], rate: 16 },
    }),
    S('break', 4, 0.3, {
      drums: { kick: 'x.......x.......', hat: 'x.......x.......' },
      chords: prog([[0, 'min9'], [5, 'maj7']], 'pad'),
      pluck: [[0, 16, 2], [10, 14, 2], [20, 12, 2], [32, 14, 3], [44, 12, 2], [56, 11, 3]],
    }),
    S('build', 4, 0.8, {
      drums: {
        kick: 'x...x...x..xx.xx',
        snare: '....x...xxxxxxxx',
        hat: 'xxxxxxxxxxxxxxxx',
        clap: '....x.......x...',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 5, 2, 6], 1),
      fx: ['riser', 'impact'],
    }),
    S('chorus3', 8, 1.0, {
      drums: {
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '..x...x...x...x.',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bassOff(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 4, 6, 4, 2], rate: 16 },
    }),
    S('outro', 4, 0.1, {
      drums: { crashBars: [0] },
      chords: prog([[0, 'min'], [5, 'maj']], 'pad'),
      pluck: [[16, 11, 2], [32, 7, 2], [48, 0, 4]],
    }),
  ],
  charts: {
    BASIC: 4.0,
    ADVANCED: 7.7,
    EXPERT: 11.7,
    MASTER: 14.0,
  },
};
