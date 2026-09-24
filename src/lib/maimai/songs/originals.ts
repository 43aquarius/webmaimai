/**
 * 「舞萌」分类 — maimai 原创曲目（真实曲目元数据 + 风格化编曲）
 * 元数据来源：国服曲目数据库；音乐为本作合成引擎的风格化编曲
 */
import type { SongDef } from '../types';
import {
  S, bass8, bass16, prog, shift,
  D4, DHARDCORE, DROCK, DROCK_FAST, DMETAL, DSTEP, DHALF, ARP_UP, ARP_UPDOWN,
} from './style';

/* ================= PANDORA PARADOXXX / 削除 ================= */
// 200 BPM · A 小调 · 钢琴驱动 hardcore
const PANDORA_PIANO: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 2], [4, 11, 2], [6, 9, 2], [8, 7, 2], [10, 9, 2], [12, 11, 4],
  [16, 11, 2], [18, 12, 2], [20, 14, 2], [22, 12, 2], [24, 11, 2], [26, 9, 2], [28, 11, 4],
  [32, 12, 2], [34, 11, 2], [36, 9, 2], [38, 11, 2], [40, 12, 2], [42, 14, 2], [44, 16, 4],
  [48, 14, 2], [50, 12, 2], [52, 11, 2], [54, 12, 2], [56, 14, 3], [60, 11, 3],
];
const PANDORA_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 7, 1], [4, 8, 1], [6, 9, 2], [8, 9, 1], [10, 8, 1], [12, 7, 2], [14, 9, 2],
  [16, 11, 2], [18, 11, 1], [20, 12, 1], [22, 14, 2], [24, 13, 1], [26, 12, 1], [28, 11, 3], [32, 9, 2],
  [34, 9, 1], [36, 10, 1], [38, 11, 2], [40, 11, 1], [42, 10, 1], [44, 9, 2], [46, 11, 2], [48, 12, 2],
  [50, 14, 1], [52, 15, 1], [54, 16, 4], [60, 14, 2], [62, 11, 2],
  // 下半：模进升调
  [64, 7, 2], [66, 7, 1], [68, 8, 1], [70, 9, 2], [72, 9, 1], [74, 8, 1], [76, 7, 2], [78, 9, 2],
  [80, 11, 2], [82, 11, 1], [84, 12, 1], [86, 14, 2], [88, 13, 1], [90, 12, 1], [92, 11, 3], [96, 9, 2],
  [98, 9, 1], [100, 10, 1], [102, 11, 2], [104, 11, 1], [106, 10, 1], [108, 9, 2], [110, 11, 2], [112, 14, 2],
  [114, 16, 1], [116, 15, 1], [118, 14, 2], [120, 18, 6],
];

export const pandora: SongDef = {
  id: 'pandora',
  title: 'PANDORA PARADOXXX',
  artist: '削除',
  genre: 'HARDCORE',
  category: '舞萌',
  version: 'FiNALE',
  bpm: 200,
  key: { root: 57, scale: 'minor' },
  jacket: '/assets/jackets/pandora.png',
  color: '#ff5f8f',
  color2: '#ffd0dc',
  previewBeat: 176,
  style: 'piano-hardcore',
  sections: [
    S('intro', 8, 0.22, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      pluck: PANDORA_PIANO,
      fx: ['impact'],
    }),
    S('pre', 4, 0.5, {
      drums: D4({ snare: '....x.......x.x.' }),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      fx: ['riser'],
    }),
    S('drop', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      arp: { pattern: ARP_UP, rate: 16 },
      lead: PANDORA_LEAD,
    }),
    S('verse', 8, 0.72, {
      drums: D4({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      pluck: shift(PANDORA_PIANO, 0),
    }),
    S('pre2', 4, 0.6, {
      drums: D4({ snare: '....x...x...x.xx' }),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
      chords: prog([[3, 'min'], [6, 'maj'], [2, 'maj'], [4, 'dom7']], 'stab'),
      fx: ['riser'],
    }),
    S('break', 4, 0.28, {
      chords: prog([[3, 'min7'], [6, 'maj'], [2, 'maj7'], [4, 'dom7']]),
      pluck: [[0, 9, 3], [4, 11, 3], [8, 12, 3], [12, 14, 4]],
    }),
    S('pre3', 4, 0.65, {
      drums: D4({ snare: '....x...x...x.xx' }),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
      bass: bass8(4, [0, 3, 5, 4]),
      fx: ['riser'],
    }),
    S('drop2', 12, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4, 8] }),
      bass: bass16(12, [0, 0, 5, 5, 2, 2, 6, 6, 0, 0, 5, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
      lead: PANDORA_LEAD,
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [6, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 11, 2], [8, 12, 2], [12, 7, 4]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 7.7, ADVANCED: 10.7, EXPERT: 13.7, MASTER: 14.7, REMASTER: 15.0 },
};

/* ================= 天火明命 / 削除 ================= */
// 190 BPM · D 小调 · 和风奥义摇滚
const TENKA_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 8, 2], [4, 10, 3], [8, 10, 1], [10, 9, 1], [12, 7, 4],
  [16, 9, 2], [18, 10, 2], [20, 12, 3], [24, 12, 1], [26, 10, 1], [28, 9, 4],
  [32, 14, 2], [34, 12, 2], [36, 10, 3], [40, 9, 1], [42, 10, 1], [44, 12, 4],
  [48, 10, 2], [50, 9, 2], [52, 7, 2], [56, 9, 2], [58, 10, 2], [60, 12, 4],
];

export const tenka: SongDef = {
  id: 'tenka',
  title: '天火明命',
  artist: '削除',
  genre: 'ORCHESTRAL ROCK',
  category: '舞萌',
  version: 'MURASAKi',
  bpm: 190,
  key: { root: 50, scale: 'minor' },
  jacket: '/assets/jackets/tenka.png',
  color: '#ff8c42',
  color2: '#ffe3c2',
  previewBeat: 160,
  style: 'wafu-rock',
  sections: [
    S('intro', 8, 0.3, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      drums: DROCK({ hat: 'x.......x.......' }),
      pluck: [[0, 7, 3], [6, 9, 3], [12, 11, 4], [32, 12, 3], [38, 11, 3], [44, 9, 4]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.7, {
      drums: DROCK(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre', 4, 0.6, {
      drums: DROCK({ kick: 'x...x..x.x..x...' }),
      chords: prog([[3, 'min'], [2, 'maj'], [5, 'maj'], [4, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 3, 5, 4, 0, 3, 5, 4]),
      chords: prog([[0, 'min'], [3, 'min'], [5, 'maj'], [4, 'dom7']]),
      lead: TENKA_LEAD,
    }),
    S('verse2', 8, 0.72, {
      drums: DROCK(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 16 },
    }),
    S('pre2', 4, 0.62, {
      drums: DROCK({ kick: 'x...x..x.x..x...' }),
      chords: prog([[3, 'min'], [2, 'maj'], [5, 'maj'], [4, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 3, 5, 4, 0, 3, 5, 4]),
      chords: prog([[0, 'min'], [3, 'min'], [5, 'maj'], [4, 'dom7']]),
      lead: TENKA_LEAD,
    }),
    S('break', 4, 0.3, {
      chords: prog([[0, 'min'], [4, 'dom7'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 12, 3], [8, 10, 3], [16, 9, 3], [24, 7, 6]],
    }),
    S('chorus3', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 3, 5, 4, 0, 3, 5, 4]),
      chords: prog([[0, 'min'], [3, 'min'], [5, 'maj'], [4, 'dom7']]),
      lead: shift(TENKA_LEAD, 0),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [0, 'min'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 4], [8, 10, 4], [16, 12, 4], [24, 14, 8]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 5.0, ADVANCED: 8.7, EXPERT: 12.7, MASTER: 13.7 },
};

/* ================= Caliburne / Project Grimoire ================= */
// 175 BPM · E 小调 · 交响金属
const CALI_LEAD: Array<[number, number, number]> = [
  [0, 7, 3], [4, 8, 3], [8, 10, 4], [12, 7, 4],
  [16, 10, 2], [18, 11, 2], [20, 12, 4], [24, 11, 2], [26, 10, 2],
  [32, 12, 3], [36, 11, 3], [40, 9, 4], [44, 8, 4],
  [48, 9, 2], [50, 10, 2], [52, 12, 2], [54, 14, 2], [56, 13, 4], [60, 11, 4],
];

export const caliburne: SongDef = {
  id: 'caliburne',
  title: 'Caliburne ～Story of the Legendary sword～',
  artist: 'Project Grimoire',
  genre: 'SYMPHONIC METAL',
  category: '舞萌',
  version: 'ORANGE',
  bpm: 175,
  key: { root: 52, scale: 'minor' },
  jacket: '/assets/jackets/caliburne.png',
  color: '#c9a84c',
  color2: '#fff0c8',
  previewBeat: 192,
  style: 'symphonic-metal',
  sections: [
    S('intro', 8, 0.35, {
      chords: prog([[0, 'min'], [4, 'maj'], [5, 'maj'], [3, 'min']]),
      arp: { pattern: ARP_UPDOWN, rate: 8 },
      pluck: [[0, 14, 4], [8, 13, 4], [16, 11, 4], [24, 12, 8], [48, 14, 4], [56, 16, 8]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.7, {
      drums: DROCK(),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [4, 'maj'], [5, 'maj'], [3, 'min']], 'stab'),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('pre', 4, 0.62, {
      drums: DROCK({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [4, 'maj'], [5, 'maj'], [3, 'min']]),
      lead: CALI_LEAD,
    }),
    S('verse2', 8, 0.72, {
      drums: DROCK(),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [4, 'maj'], [5, 'maj'], [3, 'min']], 'stab'),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('bridge', 4, 0.35, {
      chords: prog([[3, 'min7'], [4, 'maj'], [5, 'maj7'], [6, 'dom7']]),
      pluck: [[0, 12, 4], [16, 11, 4], [32, 9, 4], [48, 12, 8]],
    }),
    S('pre2', 4, 0.65, {
      drums: DROCK({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [4, 'maj'], [5, 'maj'], [3, 'min']]),
      lead: CALI_LEAD,
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [0, 'min'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 4], [16, 11, 4], [32, 14, 4], [48, 19, 12]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 6.0, ADVANCED: 8.0, EXPERT: 12.0, MASTER: 14.0 },
};

/* ================= フェイクフェイス・フェイルセイフ / カラスヤサボウ ================= */
// 180 BPM · C# 小调 · Future Pop
const FF_LEAD: Array<[number, number, number]> = [
  [2, 7, 2], [6, 9, 2], [10, 11, 2], [14, 12, 2],
  [18, 11, 1], [20, 9, 1], [22, 11, 2], [26, 9, 2], [30, 7, 2],
  [34, 9, 2], [38, 11, 2], [42, 13, 2], [46, 12, 2],
  [50, 13, 1], [52, 12, 1], [54, 11, 2], [58, 12, 4],
];

export const fakeface: SongDef = {
  id: 'fakeface',
  title: 'フェイクフェイス・フェイルセイフ',
  artist: 'カラスヤサボウ feat. もるでお',
  genre: 'FUTURE POP',
  category: '舞萌',
  version: '舞萌DX 2024',
  bpm: 180,
  key: { root: 49, scale: 'minor' },
  jacket: '/assets/jackets/fakeface.png',
  color: '#5fd4ff',
  color2: '#d8f4ff',
  previewBeat: 160,
  style: 'future-pop',
  sections: [
    S('intro', 4, 0.25, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      pluck: [[0, 7, 2], [4, 10, 2], [8, 12, 2], [12, 14, 3]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.65, {
      drums: DSTEP(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 16 },
    }),
    S('pre', 4, 0.6, {
      drums: DSTEP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DHALF({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6], -1),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: FF_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.68, {
      drums: DSTEP({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 3, 1, 2], rate: 16 },
    }),
    S('break', 4, 0.3, {
      chords: prog([[4, 'min7'], [6, 'maj'], [5, 'maj'], [6, 'dom7']]),
      pluck: [[0, 11, 3], [8, 13, 3], [16, 14, 3], [24, 13, 4]],
    }),
    S('pre2', 4, 0.62, {
      drums: DSTEP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DHALF({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6], -1),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: FF_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('chorus3', 8, 1.0, {
      drums: D4({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6], -1),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: shift(FF_LEAD, 0),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 4], [16, 11, 4], [32, 12, 4], [48, 14, 8]],
    }),
  ],
  dxCharts: { BASIC: 5.0, ADVANCED: 7.7, EXPERT: 11.7, MASTER: 13.7 },
};

/* ================= ジングルベル / SEGA Sound Unit [H.] ================= */
// 190 BPM · C 大调 · 硬核圣诞（铃儿响叮当旋律属公有领域）
const JINGLE_MOTIF: Array<[number, number, number]> = [
  [0, 2, 2], [2, 2, 2], [4, 2, 8],
  [16, 2, 2], [18, 2, 2], [20, 2, 8],
  [32, 2, 2], [34, 4, 2], [36, 7, 2], [38, 8, 2], [40, 9, 10],
  [52, 3, 2], [54, 3, 2], [56, 3, 2], [58, 3, 1], [59, 3, 1],
  [60, 2, 2], [62, 2, 1], [63, 2, 1], [64, 2, 2], [66, 2, 4],
  [72, 2, 2], [74, 1, 2], [76, 1, 2], [78, 2, 2], [80, 1, 4], [84, 4, 8],
];

export const jinglebell: SongDef = {
  id: 'jinglebell',
  title: 'ジングルベル',
  artist: 'SEGA Sound Unit [H.]',
  genre: 'HARDCORE CHRISTMAS',
  category: '舞萌',
  version: '舞萌DX 2023',
  bpm: 190,
  key: { root: 60, scale: 'major' },
  jacket: '/assets/jackets/jinglebell.png',
  color: '#ff4d6d',
  color2: '#ffe0e6',
  previewBeat: 168,
  style: 'hardcore-christmas',
  sections: [
    S('intro', 4, 0.3, {
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']]),
      pluck: JINGLE_MOTIF,
      fx: ['impact'],
    }),
    S('verse', 8, 0.7, {
      drums: DHARDCORE({ crashBars: [0] }),
      bass: bass8(8, [0, 0, 4, 4, 5, 5, 4, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']], 'stab'),
      pluck: shift(JINGLE_MOTIF, 0),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('pre', 4, 0.6, {
      drums: DHARDCORE({ snare: '....x...x...x.xx' }),
      chords: prog([[5, 'min'], [4, 'maj'], [0, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 4, 4, 5, 5, 4, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']]),
      lead: JINGLE_MOTIF,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('musicbox', 4, 0.28, {
      chords: prog([[5, 'min'], [4, 'maj'], [0, 'maj'], [4, 'maj']]),
      pluck: [[0, 7, 2], [4, 9, 2], [8, 12, 2], [12, 9, 2], [16, 7, 2], [20, 9, 2], [24, 11, 2], [28, 12, 4]],
    }),
    S('pre2', 4, 0.65, {
      drums: DHARDCORE({ snare: '....x...x...x.xx' }),
      bass: bass8(4, [5, 4, 0, 4]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 4, 4, 5, 5, 4, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']]),
      lead: JINGLE_MOTIF,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('chorus3', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 2, 4, 6] }),
      bass: bass16(8, [0, 0, 4, 4, 5, 5, 4, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']]),
      lead: shift(JINGLE_MOTIF, 0),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'maj'], [4, 'maj'], [0, 'maj'], [0, 'maj']]),
      pluck: [[0, 2, 2], [2, 2, 2], [4, 2, 8], [16, 4, 2], [18, 7, 2], [20, 12, 12]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 5.0, ADVANCED: 7.0, EXPERT: 9.7, MASTER: 14.0, REMASTER: 14.0 },
  dxCharts: { BASIC: 5.0, ADVANCED: 7.7, EXPERT: 10.7, MASTER: 14.7 },
};

/* ================= ユメヒバナ / RD-Sounds ================= */
// 172 BPM · B 小调 · 梦幻 J-Core
const YUME_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 2], [4, 11, 4], [8, 10, 2], [10, 9, 2], [12, 7, 4],
  [16, 9, 2], [18, 11, 2], [20, 12, 4], [24, 11, 2], [26, 9, 2], [28, 11, 4],
  [32, 12, 2], [34, 13, 2], [36, 14, 4], [40, 13, 2], [42, 12, 2], [44, 11, 4],
  [48, 14, 2], [50, 13, 2], [52, 11, 2], [54, 9, 2], [56, 11, 8],
];

export const yumehibana: SongDef = {
  id: 'yumehibana',
  title: 'ユメヒバナ',
  artist: 'RD-Sounds feat.中恵光城',
  genre: 'DREAM CORE',
  category: '舞萌',
  version: '舞萌DX 2021',
  bpm: 172,
  key: { root: 59, scale: 'minor' },
  jacket: '/assets/jackets/yumehibana.png',
  color: '#9f8cff',
  color2: '#e6dfff',
  previewBeat: 168,
  style: 'dream-core',
  sections: [
    S('intro', 8, 0.25, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: ARP_UPDOWN, rate: 8 },
      pluck: [[0, 7, 3], [8, 11, 3], [16, 12, 3], [24, 14, 6], [48, 13, 3], [56, 11, 6]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.62, {
      drums: D4({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 16 },
    }),
    S('pre', 4, 0.58, {
      drums: D4({ snare: '....x...x...x.x.' }),
      chords: prog([[3, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], openhat: '......x.......x.' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: YUME_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.66, {
      drums: D4({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 3, 2, 1], rate: 16 },
    }),
    S('pre2', 4, 0.6, {
      drums: D4({ snare: '....x...x...x.x.' }),
      chords: prog([[3, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], openhat: '......x.......x.' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: YUME_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 4], [16, 11, 4], [32, 14, 4], [48, 19, 12]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 5.0, ADVANCED: 7.0, EXPERT: 10.0, MASTER: 13.0 },
};
