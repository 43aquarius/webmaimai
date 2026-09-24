/**
 * 「niconico＆VOCALOID™」分类 — 8 首真实曲目
 */
import type { SongDef } from '../types';
import {
  S, bass8, bass16, bassOct, bassPad, prog, shift,
  D4, DROCK, DROCK_FAST, DHALF, DSTEP, DFUNK, DPOP, ARP_UP, ARP_UPDOWN,
} from './style';

/* ================= フォニイ / ツミキ feat. 可不 ================= */
// 180 BPM · F# 小调 · Future Bass
const PHONY_LEAD: Array<[number, number, number]> = [
  [0, 9, 2], [2, 11, 1], [4, 12, 1], [6, 14, 3], [10, 12, 2], [12, 11, 2], [14, 9, 2],
  [16, 9, 1], [18, 10, 1], [20, 11, 2], [22, 11, 1], [24, 13, 1], [26, 11, 3],
  [28, 9, 2], [30, 7, 2], [32, 9, 2], [34, 11, 1], [36, 12, 1], [38, 14, 3],
  [42, 16, 2], [44, 14, 2], [46, 12, 2], [48, 11, 4], [52, 9, 2], [54, 11, 2], [56, 12, 6],
];

export const phony: SongDef = {
  id: 'phony',
  title: 'フォニイ',
  artist: 'ツミキ feat. 音楽的同位体 可不（KAFU）',
  genre: 'FUTURE BASS',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX 2023',
  bpm: 180,
  key: { root: 54, scale: 'minor' },
  jacket: '/assets/jackets/phony.png',
  color: '#7ee8a2',
  color2: '#e6fff0',
  previewBeat: 148,
  style: 'future-bass',
  sections: [
    S('intro', 4, 0.25, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      pluck: [[0, 7, 2], [4, 9, 2], [8, 11, 2], [12, 14, 4]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.6, {
      drums: DSTEP(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 16 },
    }),
    S('pre', 4, 0.58, {
      drums: DSTEP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DHALF({ crashBars: [0, 4] }),
      bass: bassPad(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: PHONY_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.65, {
      drums: DSTEP({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 3, 1, 2], rate: 16 },
    }),
    S('break', 4, 0.3, {
      chords: prog([[4, 'min7'], [6, 'maj'], [5, 'maj'], [4, 'dom7']]),
      pluck: [[0, 11, 3], [8, 13, 3], [16, 14, 3], [24, 13, 4]],
    }),
    S('pre2', 4, 0.62, {
      drums: DSTEP({ snare: '....x...x...x.xx' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DHALF({ crashBars: [0, 4] }),
      bass: bassPad(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: PHONY_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('chorus3', 8, 1.0, {
      drums: D4({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: PHONY_LEAD,
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 4], [16, 11, 4], [32, 14, 4], [48, 16, 12]],
    }),
  ],
  dxCharts: { BASIC: 2.0, ADVANCED: 6.0, EXPERT: 9.7, MASTER: 11.0, REMASTER: 13.0 },
};

/* ================= グッバイ宣言 / Chinozo ================= */
// 145 BPM · D 大调 · 流行摇滚
const GB_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 6, 2], [4, 7, 4], [8, 9, 2], [10, 7, 2], [12, 6, 4],
  [16, 7, 2], [18, 9, 2], [20, 11, 4], [24, 9, 2], [26, 7, 2], [28, 6, 4],
  [32, 4, 2], [34, 6, 2], [36, 7, 4], [40, 9, 2], [42, 11, 2], [44, 12, 4],
  [48, 11, 2], [50, 9, 2], [52, 7, 2], [54, 9, 2], [56, 7, 8],
];
const GB_RIFF: Array<[number, number, number]> = [
  [0, 7, 1], [2, 7, 1], [4, 9, 1], [6, 11, 2], [10, 9, 1], [12, 7, 2],
  [16, 7, 1], [18, 7, 1], [20, 9, 1], [22, 12, 2], [26, 11, 1], [28, 9, 2],
];

export const goodbye: SongDef = {
  id: 'goodbye',
  title: 'グッバイ宣言',
  artist: 'Chinozo',
  genre: 'POP ROCK',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX 2022',
  bpm: 145,
  key: { root: 50, scale: 'major' },
  jacket: '/assets/jackets/goodbye.png',
  color: '#ffd166',
  color2: '#fff3d0',
  previewBeat: 144,
  style: 'pop-rock',
  sections: [
    S('intro', 4, 0.45, {
      drums: DROCK({ hat: '..x...x...x...x.' }),
      bass: bass8(4, [0, 4, 5, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']], 'stab'),
      pluck: GB_RIFF,
    }),
    S('verse', 8, 0.65, {
      drums: DROCK(),
      bass: bass8(8, [0, 1, 4, 5, 0, 1, 4, 5]),
      chords: prog([[0, 'maj'], [1, 'min'], [4, 'maj'], [5, 'maj']]),
      pluck: GB_RIFF,
    }),
    S('pre', 4, 0.62, {
      drums: DROCK({ snare: '....x...x...x.x.' }),
      bass: bass8(4, [4, 5, 1, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [1, 'min'], [5, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [4, 5, 0, 1, 4, 5, 0, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [0, 'maj'], [1, 'min']]),
      lead: GB_LEAD,
    }),
    S('riff', 4, 0.5, {
      drums: DROCK({ hat: '..x...x...x...x.' }),
      bass: bass8(4, [0, 4, 5, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'min'], [4, 'maj']], 'stab'),
      pluck: GB_RIFF,
    }),
    S('verse2', 8, 0.68, {
      drums: DROCK({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 1, 4, 5, 0, 1, 4, 5]),
      chords: prog([[0, 'maj'], [1, 'min'], [4, 'maj'], [5, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre2', 4, 0.64, {
      drums: DROCK({ snare: '....x...x...x.x.' }),
      bass: bass8(4, [4, 5, 1, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [1, 'min'], [5, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [4, 5, 0, 1, 4, 5, 0, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [0, 'maj'], [1, 'min']]),
      lead: GB_LEAD,
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'maj'], [4, 'maj'], [0, 'maj'], [0, 'maj']]),
      pluck: [[0, 7, 2], [4, 11, 2], [8, 12, 2], [12, 14, 4]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 3.0, ADVANCED: 7.0, EXPERT: 9.7, MASTER: 12.0 },
};

/* ================= 神っぽいな / ピノキオピー ================= */
// 158 BPM · E 小调 · 放克流行
const KAMI_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [1, 9, 1], [2, 10, 2], [4, 10, 1], [5, 9, 1], [6, 7, 2], [8, 9, 1], [9, 7, 1], [10, 6, 2],
  [12, 7, 2], [14, 9, 2], [16, 10, 1], [17, 12, 1], [18, 10, 2], [20, 9, 1], [21, 10, 1], [22, 9, 2], [24, 7, 4],
  [28, 6, 1], [29, 7, 1], [30, 9, 2], [32, 10, 2], [34, 12, 2], [36, 11, 1], [37, 10, 1], [38, 11, 2], [40, 12, 4],
  [44, 14, 1], [45, 12, 1], [46, 11, 2], [48, 10, 2], [50, 9, 2], [52, 7, 8],
];

export const kamipoi: SongDef = {
  id: 'kamipoi',
  title: '神っぽいな',
  artist: 'ピノキオピー',
  genre: 'FUNKY POP',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX 2024',
  bpm: 158,
  key: { root: 52, scale: 'minor' },
  jacket: '/assets/jackets/kamipoi.png',
  color: '#ffb703',
  color2: '#fff0cc',
  previewBeat: 152,
  style: 'funky-pop',
  sections: [
    S('intro', 4, 0.4, {
      drums: DFUNK({ hat: '..x...x...x...x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      pluck: [[0, 7, 1], [2, 10, 1], [4, 12, 2], [8, 11, 1], [10, 10, 1], [12, 7, 3]],
    }),
    S('verse', 8, 0.66, {
      drums: DFUNK(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      pluck: [[0, 7, 2], [6, 9, 2], [12, 10, 2], [32, 9, 2], [38, 10, 2], [44, 12, 4]],
    }),
    S('pre', 4, 0.6, {
      drums: DFUNK({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DFUNK({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: KAMI_LEAD,
    }),
    S('verse2', 8, 0.68, {
      drums: DFUNK(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      arp: { pattern: [0, 2, 1, 2], rate: 16 },
    }),
    S('pre2', 4, 0.62, {
      drums: DFUNK({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DFUNK({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: KAMI_LEAD,
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [6, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 10, 2], [8, 12, 4], [16, 11, 2], [20, 7, 8]],
    }),
  ],
  dxCharts: { BASIC: 2.0, ADVANCED: 6.0, EXPERT: 8.7, MASTER: 11.7, REMASTER: 13.0 },
};

/* ================= ダンスロボットダンス / ナユタン星人 ================= */
// 145 BPM · G 小调 · 宇宙电音流行
const DRD_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 1], [4, 11, 1], [6, 9, 2], [8, 12, 2], [10, 11, 2], [12, 9, 2], [14, 7, 2],
  [16, 7, 1], [18, 8, 1], [20, 9, 2], [22, 9, 1], [24, 10, 1], [26, 9, 2], [28, 7, 4],
  [32, 11, 2], [34, 12, 1], [36, 14, 1], [38, 12, 2], [40, 11, 2], [42, 9, 2], [44, 11, 4],
  [48, 12, 2], [50, 11, 1], [52, 9, 1], [54, 7, 2], [56, 9, 2], [58, 11, 4],
];

export const drd: SongDef = {
  id: 'drd',
  title: 'ダンスロボットダンス',
  artist: 'ナユタン星人',
  genre: 'ELECTRO POP',
  category: 'niconico＆VOCALOID™',
  version: 'MiLK',
  bpm: 145,
  key: { root: 55, scale: 'minor' },
  jacket: '/assets/jackets/drd.png',
  color: '#4cc9f0',
  color2: '#d9f6ff',
  previewBeat: 144,
  style: 'electro-pop',
  sections: [
    S('intro', 4, 0.3, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: ARP_UP, rate: 16 },
      fx: ['impact'],
    }),
    S('verse', 8, 0.65, {
      drums: DSTEP(),
      bass: bassOct(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 16 },
    }),
    S('pre', 4, 0.6, {
      drums: DSTEP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bassOct(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: DRD_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.68, {
      drums: DSTEP({ hat: '..x..x....x..x..' }),
      bass: bassOct(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 1, 2, 1], rate: 16 },
    }),
    S('pre2', 4, 0.62, {
      drums: DSTEP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bassOct(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      lead: DRD_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      arp: { pattern: ARP_UP, rate: 8 },
      pluck: [[0, 7, 4], [16, 11, 4], [32, 12, 4], [48, 14, 8]],
    }),
  ],
  stdCharts: { BASIC: 5.0, ADVANCED: 7.0, EXPERT: 10.0, MASTER: 12.7 },
  dxCharts: { BASIC: 4.0, ADVANCED: 7.0, EXPERT: 9.0, MASTER: 12.7 },
};

/* ================= エイリアンエイリアン / ナユタン星人 ================= */
// 158 BPM · A 小调 · 宇宙泡泡电音
const ALIEN_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [2, 9, 1], [4, 11, 2], [6, 12, 1], [8, 11, 1], [10, 9, 2], [12, 11, 4],
  [16, 9, 1], [18, 11, 1], [20, 13, 2], [22, 14, 1], [24, 13, 1], [26, 11, 2], [28, 9, 4],
  [32, 11, 2], [34, 13, 2], [36, 14, 2], [38, 16, 2], [40, 14, 4], [44, 13, 4],
  [48, 12, 1], [50, 11, 1], [52, 9, 2], [54, 11, 2], [56, 12, 2], [58, 14, 4],
];

export const alien: SongDef = {
  id: 'alien',
  title: 'エイリアンエイリアン',
  artist: 'ナユタン星人',
  genre: 'SPACE POP',
  category: 'niconico＆VOCALOID™',
  version: 'MURASAKi PLUS',
  bpm: 158,
  key: { root: 57, scale: 'minor' },
  jacket: '/assets/jackets/alien.png',
  color: '#b388ff',
  color2: '#eadcff',
  previewBeat: 144,
  style: 'space-pop',
  sections: [
    S('intro', 4, 0.28, {
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: ARP_UP, rate: 16 },
      fx: ['impact'],
    }),
    S('verse', 8, 0.62, {
      drums: DPOP(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 16 },
    }),
    S('pre', 4, 0.58, {
      drums: DPOP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: ALIEN_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.66, {
      drums: DSTEP(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 3, 1, 2], rate: 16 },
    }),
    S('pre2', 4, 0.6, {
      drums: DPOP({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: ALIEN_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      arp: { pattern: ARP_UP, rate: 16 },
      pluck: [[0, 7, 4], [16, 11, 4], [32, 12, 4], [48, 16, 8]],
    }),
  ],
  stdCharts: { BASIC: 4.0, ADVANCED: 7.0, EXPERT: 9.0, MASTER: 12.0 },
};

/* ================= テオ / Omoi ================= */
// 170 BPM · F# 小调 · 疾走摇滚
const TEO_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 2], [4, 10, 3], [8, 9, 1], [9, 10, 1], [10, 12, 3], [14, 11, 2],
  [16, 9, 2], [18, 10, 2], [20, 12, 3], [24, 11, 1], [25, 9, 1], [26, 11, 3],
  [32, 12, 2], [34, 13, 2], [36, 15, 3], [40, 13, 2], [42, 12, 2], [44, 13, 4],
  [48, 12, 2], [50, 11, 1], [51, 12, 1], [52, 13, 2], [54, 12, 2], [56, 11, 2], [58, 9, 6],
];

export const teo: SongDef = {
  id: 'teo',
  title: 'テオ',
  artist: 'Omoi',
  genre: 'ROCK',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX 2024',
  bpm: 170,
  key: { root: 54, scale: 'minor' },
  jacket: '/assets/jackets/teo.png',
  color: '#6ee7ff',
  color2: '#e0f9ff',
  previewBeat: 144,
  style: 'speed-rock',
  sections: [
    S('intro', 4, 0.5, {
      drums: DROCK_FAST({ crashBars: [0] }),
      bass: bass8(4, [0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      pluck: [[0, 7, 1], [2, 11, 1], [4, 12, 1], [6, 14, 2], [8, 12, 1], [10, 11, 1], [12, 12, 4]],
    }),
    S('verse', 8, 0.68, {
      drums: DROCK_FAST(),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre', 4, 0.62, {
      drums: DROCK_FAST({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: TEO_LEAD,
    }),
    S('verse2', 8, 0.7, {
      drums: DROCK_FAST({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 8 },
    }),
    S('pre2', 4, 0.64, {
      drums: DROCK_FAST({ snare: '....x...x...x.x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [6, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass8(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: TEO_LEAD,
    }),
    S('outro', 4, 0.22, {
      drums: DROCK({ hat: 'x.......x.......' }),
      chords: prog([[0, 'min'], [5, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 11, 2], [8, 14, 2], [12, 18, 4]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 5.0, ADVANCED: 7.7, EXPERT: 10.7, MASTER: 13.0 },
};

/* ================= アンドロイドガール / DECO*27 ================= */
// 190 BPM · C# 小调 · 暗黑电子摇滚
const AG_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 7, 1], [4, 9, 1], [6, 10, 3], [10, 9, 2], [12, 7, 2], [14, 6, 2],
  [16, 7, 2], [18, 9, 1], [20, 10, 1], [22, 12, 3], [26, 11, 2], [28, 9, 2],
  [32, 12, 2], [34, 11, 1], [36, 9, 1], [38, 11, 3], [42, 12, 2], [44, 14, 2], [46, 13, 2],
  [48, 12, 2], [50, 11, 2], [52, 9, 2], [54, 11, 2], [56, 12, 8],
];

export const android: SongDef = {
  id: 'android',
  title: 'アンドロイドガール',
  artist: 'DECO*27',
  genre: 'ELECTRO ROCK',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX',
  bpm: 190,
  key: { root: 49, scale: 'minor' },
  jacket: '/assets/jackets/android.png',
  color: '#ff6b9d',
  color2: '#ffdce9',
  previewBeat: 152,
  style: 'electro-rock',
  sections: [
    S('intro', 4, 0.35, {
      drums: DSTEP({ hat: '..x..x....x..x..' }),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']], 'stab'),
      pluck: [[0, 7, 1], [2, 10, 1], [4, 12, 2], [8, 11, 1], [10, 7, 1], [12, 9, 3]],
    }),
    S('verse', 8, 0.68, {
      drums: DSTEP({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 6, 6, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']], 'stab'),
      arp: { pattern: [0, 1, 0, 2], rate: 16 },
    }),
    S('pre', 4, 0.62, {
      drums: DSTEP({ snare: '....x...x...x.xx' }),
      bass: bass8(4, [0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [4, 'min'], [6, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 6, 4, 0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      lead: AG_LEAD,
    }),
    S('verse2', 8, 0.7, {
      drums: DSTEP({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 6, 6, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']], 'stab'),
      arp: { pattern: [0, 2, 1, 0], rate: 16 },
    }),
    S('pre2', 4, 0.64, {
      drums: DSTEP({ snare: '....x...x...x.xx' }),
      bass: bass8(4, [0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [4, 'min'], [6, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 6, 4, 0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'min']]),
      lead: AG_LEAD,
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [6, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 10, 2], [8, 12, 4], [16, 9, 2], [20, 12, 8]],
    }),
  ],
  dxCharts: { BASIC: 4.0, ADVANCED: 7.7, EXPERT: 10.0, MASTER: 12.7 },
};

/* ================= ハッピーシンセサイザ / EasyPop ================= */
// 129 BPM · F 大调 · 甜蜜电音
const HS_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 8, 2], [4, 9, 3], [8, 9, 1], [9, 8, 1], [10, 7, 3], [14, 9, 2],
  [16, 7, 2], [18, 9, 2], [20, 11, 3], [24, 11, 1], [25, 9, 1], [26, 11, 3],
  [32, 9, 2], [34, 11, 2], [36, 12, 3], [40, 11, 2], [42, 9, 2], [44, 7, 3],
  [48, 9, 2], [50, 11, 2], [52, 13, 2], [54, 12, 2], [56, 11, 2], [58, 9, 6],
];
const HS_HARMONY: Array<[number, number, number]> = [
  [0, 4, 2], [2, 5, 2], [4, 6, 3], [8, 6, 1], [9, 5, 1], [10, 4, 3], [14, 6, 2],
  [16, 4, 2], [18, 6, 2], [20, 8, 3], [24, 8, 1], [25, 6, 1], [26, 8, 3],
  [32, 6, 2], [34, 8, 2], [36, 9, 3], [40, 8, 2], [42, 6, 2], [44, 4, 3],
  [48, 6, 2], [50, 8, 2], [52, 10, 2], [54, 9, 2], [56, 8, 2], [58, 6, 6],
];

export const happysyn: SongDef = {
  id: 'happysyn',
  title: 'ハッピーシンセサイザ',
  artist: 'EasyPop',
  genre: 'SWEET POP',
  category: 'niconico＆VOCALOID™',
  version: '舞萌DX 2025',
  bpm: 129,
  key: { root: 53, scale: 'major' },
  jacket: '/assets/jackets/happysyn.png',
  color: '#ff9ecb',
  color2: '#ffe4f1',
  previewBeat: 120,
  style: 'sweet-pop',
  sections: [
    S('intro', 4, 0.3, {
      chords: prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']]),
      arp: { pattern: ARP_UP, rate: 8 },
      pluck: [[0, 7, 2], [4, 9, 2], [8, 11, 2], [12, 14, 4]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.6, {
      drums: DPOP(),
      bass: bass8(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 16 },
    }),
    S('pre', 4, 0.58, {
      drums: DPOP({ snare: '....x...x...x.x.' }),
      chords: prog([[5, 'min'], [4, 'maj'], [0, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 3, 4, 0, 5, 3, 4]),
      chords: prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']]),
      lead: HS_LEAD,
      pluck: HS_HARMONY,
    }),
    S('verse2', 8, 0.64, {
      drums: DPOP({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']]),
      arp: { pattern: [0, 3, 1, 2], rate: 16 },
    }),
    S('pre2', 4, 0.6, {
      drums: DPOP({ snare: '....x...x...x.x.' }),
      chords: prog([[5, 'min'], [4, 'maj'], [0, 'maj'], [4, 'maj']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bass8(8, [0, 5, 3, 4, 0, 5, 3, 4]),
      chords: prog([[0, 'maj'], [5, 'min'], [3, 'maj'], [4, 'maj']]),
      lead: HS_LEAD,
      pluck: HS_HARMONY,
    }),
    S('outro', 4, 0.2, {
      chords: prog([[0, 'maj'], [4, 'maj'], [0, 'maj'], [0, 'maj']]),
      arp: { pattern: ARP_UP, rate: 8 },
      pluck: [[0, 7, 4], [16, 11, 4], [32, 14, 4], [48, 16, 12]],
    }),
  ],
  dxCharts: { BASIC: 3.0, ADVANCED: 6.0, EXPERT: 9.0, MASTER: 12.7 },
};
