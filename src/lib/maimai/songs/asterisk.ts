/**
 * 曲目 3：星号旅行 (Asterisk Trip)
 * 128 BPM / A minor / Future Funk · City Pop
 */
import type { SongDef } from '../types';
import { S, bass8, bassOff, prog } from './helpers';

// ---- 副歌主旋律（A 小调音级：0=A 1=B 2=C 3=D 4=E 5=F 6=G 7=A5 9=C6 11=E6 12=F6）----
const CHORUS_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [2, 7, 1], [4, 9, 2], [8, 6, 1], [10, 4, 1], [12, 6, 3],
  [16, 4, 1], [18, 3, 1], [20, 4, 2], [24, 3, 2], [28, 2, 3],
  [32, 7, 1], [34, 7, 1], [36, 9, 2], [40, 11, 2], [44, 12, 3],
  [48, 11, 1], [50, 9, 1], [52, 11, 4], [58, 9, 1], [60, 7, 2],
  [64, 7, 1], [66, 7, 1], [68, 9, 2], [72, 6, 1], [74, 4, 1], [76, 6, 3],
  [80, 4, 1], [82, 3, 1], [84, 4, 2], [88, 3, 2], [92, 2, 3],
  [96, 14, 2], [100, 13, 1], [102, 12, 1], [104, 11, 4], [110, 9, 1], [112, 11, 2], [116, 9, 2],
  [120, 7, 4], [126, 4, 2],
];

// ---- 主歌拨弦 ----
const VERSE_PLUCK: Array<[number, number, number]> = [
  [0, 7, 2], [6, 9, 2], [12, 11, 2],
  [20, 9, 2], [28, 7, 2],
  [32, 6, 2], [38, 7, 2], [44, 9, 2],
  [52, 6, 2], [60, 4, 2],
  [64, 7, 2], [70, 9, 2], [76, 11, 2],
  [84, 12, 2], [92, 11, 2],
  [96, 11, 2], [102, 9, 2], [108, 7, 2],
  [116, 6, 2], [124, 4, 2],
];

// Am7 - Dm7 - G maj7 - C maj7
const PROG_MAIN = prog([[0, 'min7'], [3, 'min7'], [6, 'maj'], [2, 'maj']], 'pad');
const PROG_STAB = prog([[0, 'min7'], [3, 'min7'], [6, 'maj'], [2, 'maj']], 'stab');

export const asteriskTrip: SongDef = {
  id: 'asterisk',
  title: '星号旅行',
  titleSub: 'Asterisk Trip',
  artist: 'Yukiri',
  genre: '其他',
  bpm: 128,
  key: { root: 57, scale: 'minor' },
  jacket: '/assets/jackets/asterisk.png',
  color: '#b98cff',
  color2: '#e6d9ff',
  previewBeat: 64, // 副歌
  sections: [
    S('intro', 4, 0.15, {
      drums: { hat: 'x..x..x.x..x..x.' },
      chords: PROG_MAIN,
      pluck: [[16, 11, 2], [24, 9, 2], [32, 7, 2], [48, 9, 2], [56, 11, 2]],
      fx: ['riser'],
    }),
    S('verse1', 8, 0.4, {
      drums: {
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        hat: 'x..x..x.x..x..x.',
      },
      chords: PROG_MAIN,
      bass: bass8(8, [0, 0, 3, 3, 6, 6, 2, 2]),
      pluck: VERSE_PLUCK,
    }),
    S('pre', 4, 0.55, {
      drums: {
        kick: 'x.....x...x...x.',
        snare: '....x.......x..x',
        hat: 'x.x.x.x.x.x.xxxx',
        clap: '....x.......x...',
      },
      chords: PROG_STAB,
      bass: bass8(4, [0, 3, 6, 2], 1),
      fx: ['riser'],
    }),
    S('chorus1', 8, 0.9, {
      drums: {
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '......x.......x.',
        crashBars: [0],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 3, 3, 6, 6, 2, 2]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 1, 3], rate: 8 },
    }),
    S('verse2', 8, 0.5, {
      drums: {
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        clap: '....x.......x...',
        hat: 'x..x..x.x..x..x.',
      },
      chords: PROG_MAIN,
      bass: bass8(8, [0, 0, 3, 3, 6, 6, 2, 2]),
      pluck: VERSE_PLUCK,
      arp: { pattern: [0, 1, 2, 1], rate: 8 },
    }),
    S('chorus2', 8, 0.95, {
      drums: {
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '......x.......x.',
        clap: '....x.......x...',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 3, 3, 6, 6, 2, 2]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 4, 2], rate: 16 },
    }),
    S('break', 4, 0.28, {
      drums: { hat: 'x.......x.......' },
      chords: prog([[0, 'min9'], [3, 'min7']], 'pad'),
      pluck: [[0, 12, 2], [10, 11, 2], [20, 9, 2], [32, 11, 3], [44, 9, 2], [56, 7, 3]],
    }),
    S('chorus3', 8, 1.0, {
      drums: {
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        openhat: '......x.......x.',
        clap: '....x.......x...',
        crashBars: [0, 4],
      },
      chords: PROG_STAB,
      bass: bass8(8, [0, 0, 3, 3, 6, 6, 2, 2]),
      lead: CHORUS_LEAD,
      arp: { pattern: [0, 2, 4, 6, 4, 2, 0, 2], rate: 16 },
    }),
    S('outro', 4, 0.1, {
      chords: prog([[0, 'min9'], [2, 'maj7']], 'pad'),
      pluck: [[16, 9, 2], [32, 7, 2], [48, 4, 4]],
    }),
  ],
  charts: {
    BASIC: 2.0,
    ADVANCED: 5.0,
    EXPERT: 8.7,
    MASTER: 11.3,
  },
};
