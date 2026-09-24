/**
 * 东方Project / 其他游戏 / 流行&动漫 / 音击・中二节奏 分类曲目
 */
import type { SongDef } from '../types';
import {
  S, bass8, bass16, bassOct, bassWalk, prog, shift,
  DHARDCORE, DROCK, DROCK_FAST, DMETAL, DJAZZ, DOUEN, D4, DPOP, DHALF,
  ARP_UP, ARP_UPDOWN,
} from './style';

/* ================= 最終鬼畜妹フランドール・S / ビートまりお ================= */
// 155 BPM · A 小调 · 鬼畜哈核
const SAIKYO_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [1, 9, 1], [2, 11, 2], [4, 12, 1], [5, 11, 1], [6, 9, 2], [8, 7, 1], [9, 9, 1], [10, 11, 2],
  [12, 13, 2], [14, 12, 2], [16, 11, 1], [17, 12, 1], [18, 13, 2], [20, 11, 1], [21, 9, 1], [22, 11, 2], [24, 7, 4],
  [28, 9, 1], [29, 10, 1], [30, 11, 2], [32, 12, 2], [34, 13, 2], [36, 14, 2], [38, 13, 2],
  [40, 12, 1], [41, 11, 1], [42, 10, 1], [43, 11, 1], [44, 12, 2], [46, 9, 2], [48, 7, 8],
];

export const saikyo: SongDef = {
  id: 'saikyo',
  title: '最終鬼畜妹フランドール・S',
  artist: 'ビートまりお（COOL&CREATE）',
  genre: 'HAPPY HARDCORE',
  category: '东方Project',
  version: 'FiNALE',
  bpm: 155,
  key: { root: 57, scale: 'minor' },
  jacket: '/assets/jackets/saikyo.png',
  color: '#ff4757',
  color2: '#ffd5da',
  previewBeat: 152,
  style: 'kichiku-hardcore',
  sections: [
    S('intro', 4, 0.3, {
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      pluck: [[0, 7, 2], [4, 10, 2], [8, 12, 2], [12, 11, 4]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.7, {
      drums: DHARDCORE({ crashBars: [0] }),
      bass: bass16(8, [0, 0, 6, 6, 5, 5, 4, 4]),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']], 'stab'),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('pre', 4, 0.62, {
      drums: DHARDCORE({ snare: '....x...x...x.xx' }),
      bass: bass8(4, [0, 6, 5, 4]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 6, 6, 5, 5, 4, 4]),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      lead: SAIKYO_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('musicbox', 4, 0.26, {
      chords: prog([[0, 'min'], [4, 'maj'], [0, 'min'], [4, 'maj']]),
      pluck: [[0, 11, 2], [4, 12, 2], [8, 14, 2], [12, 12, 2], [16, 11, 2], [20, 9, 2], [24, 11, 6]],
    }),
    S('pre2', 4, 0.65, {
      drums: DHARDCORE({ snare: '....x...x...x.xx' }),
      bass: bass8(4, [0, 6, 5, 4]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 2, 4, 6] }),
      bass: bass16(8, [0, 0, 6, 6, 5, 5, 4, 4]),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'maj']]),
      lead: SAIKYO_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('chorus3', 8, 1.0, {
      drums: DHARDCORE({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 6, 6, 5, 5, 4, 4]),
      chords: prog([[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'dom7']]),
      lead: shift(SAIKYO_LEAD, 0),
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [4, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 11, 2], [8, 14, 4], [16, 12, 2], [20, 7, 8]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 4.0, ADVANCED: 7.0, EXPERT: 10.0, MASTER: 11.0, REMASTER: 13.7 },
};

/* ================= ソリッド / 豚乙女 ================= */
// 175 BPM · D 小调 · 东方系疾走摇滚
const SOLID_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 8, 1], [3, 9, 1], [4, 10, 2], [6, 12, 2], [8, 11, 2], [10, 9, 2], [12, 10, 4],
  [16, 9, 2], [18, 10, 1], [19, 11, 1], [20, 12, 2], [22, 14, 2], [24, 13, 2], [26, 12, 2], [28, 11, 4],
  [32, 12, 2], [34, 14, 2], [36, 15, 3], [40, 14, 2], [42, 12, 2], [44, 11, 2], [46, 12, 2],
  [48, 13, 2], [50, 12, 1], [51, 11, 1], [52, 10, 2], [54, 11, 2], [56, 12, 8],
];

export const solid: SongDef = {
  id: 'solid',
  title: 'ソリッド',
  artist: '豚乙女',
  genre: 'TOUHOU ROCK',
  category: '东方Project',
  version: '舞萌DX',
  bpm: 175,
  key: { root: 50, scale: 'minor' },
  jacket: '/assets/jackets/solid.png',
  color: '#8d99ae',
  color2: '#edf0f4',
  previewBeat: 152,
  style: 'touhou-rock',
  sections: [
    S('intro', 4, 0.45, {
      drums: DROCK_FAST({ crashBars: [0] }),
      bass: bass8(4, [0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'maj']], 'stab'),
      pluck: [[0, 7, 1], [2, 10, 1], [4, 12, 1], [6, 13, 2], [8, 12, 1], [10, 10, 1], [12, 12, 4]],
    }),
    S('verse', 8, 0.7, {
      drums: DROCK_FAST(),
      bass: bass8(8, [0, 0, 5, 5, 6, 6, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre', 4, 0.62, {
      drums: DROCK_FAST({ snare: '....x...x...x.x.' }),
      bass: bass8(4, [0, 5, 6, 4]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DROCK_FAST({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 5, 6, 4, 0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'maj']]),
      lead: SOLID_LEAD,
    }),
    S('verse2', 8, 0.72, {
      drums: DROCK_FAST({ clap: '....x.......x...' }),
      bass: bass8(8, [0, 0, 5, 5, 6, 6, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'maj']]),
      arp: { pattern: [0, 2, 1, 3], rate: 8 },
    }),
    S('pre2', 4, 0.64, {
      drums: DROCK_FAST({ snare: '....x...x...x.x.' }),
      bass: bass8(4, [0, 5, 6, 4]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 5, 6, 4, 0, 5, 6, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [6, 'maj'], [4, 'maj']]),
      lead: SOLID_LEAD,
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [4, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 10, 2], [8, 12, 4], [16, 13, 2], [20, 12, 8]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 4.0, ADVANCED: 7.7, EXPERT: 10.7, MASTER: 13.0 },
};

/* ================= 天国と地獄 -言ノ葉リンネ- ================= */
// 174 BPM · G 大调 · 爵士摇摆（康康舞主题属公有领域）
const TENGOKU_HEAD: Array<[number, number, number]> = [
  [0, 0, 1], [1, 1, 1], [2, 2, 1], [3, 3, 1], [4, 4, 2], [6, 4, 2],
  [8, 4, 1], [9, 3, 1], [10, 2, 1], [11, 1, 1], [12, 0, 2], [14, 0, 2],
  [16, 0, 1], [17, 1, 1], [18, 2, 1], [19, 3, 1], [20, 4, 2], [22, 5, 2],
  [24, 7, 3], [28, 6, 2], [30, 5, 2],
  [32, 0, 1], [33, 1, 1], [34, 2, 1], [35, 3, 1], [36, 4, 1], [37, 5, 1], [38, 6, 1], [39, 7, 1],
  [40, 9, 4], [44, 8, 2], [46, 7, 2], [48, 6, 1], [49, 5, 1], [50, 4, 1], [51, 5, 1], [52, 6, 2], [54, 4, 2],
];

export const tengoku: SongDef = {
  id: 'tengoku',
  title: '天国と地獄 -言ノ葉リンネ-',
  artist: '伊東歌詞太郎・ろん×れるりり',
  genre: 'JAZZ WALTZ×SWING',
  category: '舞萌',
  version: 'MURASAKi PLUS',
  bpm: 174,
  key: { root: 55, scale: 'major' },
  swing: 0.85,
  jacket: '/assets/jackets/tengoku.png',
  color: '#e0a458',
  color2: '#fff2dd',
  previewBeat: 152,
  style: 'swing-jazz',
  sections: [
    S('intro', 8, 0.3, {
      drums: DJAZZ({ kick: 'x...............', hat: 'x.x.x.x.x.x.x.x.' }),
      chords: prog([[0, 'maj7'], [5, 'min7'], [2, 'min7'], [6, 'dom7']]),
      pluck: [[0, 7, 3], [6, 9, 3], [12, 11, 4], [32, 12, 3], [38, 11, 3], [44, 9, 4]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.62, {
      drums: DJAZZ(),
      bass: bassWalk(8, [[0, 4, 5, 4], [0, 2, 1, 4], [5, 4, 2, 0], [0, 4, 6, 5]]),
      chords: prog([[0, 'maj7'], [5, 'min7'], [2, 'min7'], [6, 'dom7']]),
    }),
    S('pre', 4, 0.58, {
      drums: DJAZZ({ snare: '....x...x...x.x.' }),
      chords: prog([[3, 'maj7'], [6, 'dom7'], [2, 'min7'], [6, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DJAZZ({ clap: '....x.......x...', crashBars: [0, 4] }),
      bass: bassWalk(8, [[0, 4, 5, 7], [0, 2, 1, 4], [5, 4, 2, 0], [0, 4, 6, 5]]),
      chords: prog([[0, 'maj'], [5, 'min7'], [2, 'min7'], [6, 'dom7']]),
      lead: TENGOKU_HEAD,
      pluck: [[0, 2, 2], [4, 4, 2], [8, 7, 2], [12, 4, 2], [32, 4, 2], [36, 5, 2], [40, 9, 2], [44, 7, 2]],
    }),
    S('bridge', 4, 0.4, {
      drums: DJAZZ({ kick: 'x...............' }),
      bass: bassWalk(4, [[2, 3, 4, 2], [5, 4, 2, 0]]),
      chords: prog([[2, 'min7'], [5, 'dom7'], [0, 'maj7'], [6, 'dom7']]),
      pluck: [[0, 9, 3], [8, 11, 3], [16, 12, 3], [24, 14, 4]],
    }),
    S('pre2', 4, 0.62, {
      drums: DJAZZ({ snare: '....x...x...x.x.' }),
      chords: prog([[3, 'maj7'], [6, 'dom7'], [2, 'min7'], [6, 'dom7']]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DJAZZ({ clap: '....x.......x...', crashBars: [0, 4] }),
      bass: bassWalk(8, [[0, 4, 5, 7], [0, 2, 1, 4], [5, 4, 2, 0], [0, 4, 6, 5]]),
      chords: prog([[0, 'maj'], [5, 'min7'], [2, 'min7'], [6, 'dom7']]),
      lead: TENGOKU_HEAD,
      pluck: [[0, 4, 2], [4, 6, 2], [8, 9, 2], [12, 6, 2], [32, 6, 2], [36, 7, 2], [40, 11, 2], [44, 9, 2]],
    }),
    S('chorus3', 8, 1.0, {
      drums: DJAZZ({ clap: '....x.......x...', crashBars: [0, 4], snare: '....x.......x.x.' }),
      bass: bassWalk(8, [[0, 4, 5, 7], [0, 2, 1, 4], [5, 4, 2, 0], [0, 4, 6, 5]]),
      chords: prog([[0, 'maj'], [5, 'min7'], [2, 'min7'], [6, 'dom7']]),
      lead: shift(TENGOKU_HEAD, 0),
    }),
    S('outro', 4, 0.24, {
      drums: DJAZZ({ kick: 'x...............', snare: '................' }),
      chords: prog([[0, 'maj7'], [6, 'dom7'], [0, 'maj'], [0, 'maj']]),
      pluck: [[0, 4, 2], [4, 7, 2], [8, 11, 2], [12, 14, 2], [16, 12, 4], [24, 11, 8]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 4.0, ADVANCED: 6.0, EXPERT: 10.7, MASTER: 12.7 },
};

/* ================= セイクリッド　ルイン / Drop＆祇羽 ================= */
// 190 BPM · D 小调 · 重金属
const RUIN_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [1, 10, 1], [2, 12, 2], [4, 13, 1], [5, 12, 1], [6, 10, 2], [8, 7, 1], [9, 10, 1], [10, 12, 2],
  [12, 14, 2], [14, 13, 2], [16, 12, 1], [17, 13, 1], [18, 14, 2], [20, 15, 2], [22, 14, 2], [24, 12, 4],
  [28, 10, 2], [30, 12, 2], [32, 13, 2], [34, 14, 1], [35, 15, 1], [36, 16, 4],
  [40, 15, 2], [42, 14, 2], [44, 13, 2], [46, 12, 2], [48, 13, 8],
];

export const sacredruin: SongDef = {
  id: 'sacredruin',
  title: 'セイクリッド　ルイン',
  artist: 'Drop＆祇羽 feat. 葉月ゆら「太鼓の達人」より',
  genre: 'HEAVY METAL',
  category: '其他游戏',
  version: 'FiNALE',
  bpm: 190,
  key: { root: 50, scale: 'minor' },
  jacket: '/assets/jackets/sacredruin.png',
  color: '#9d4edd',
  color2: '#e5ccff',
  previewBeat: 152,
  style: 'heavy-metal',
  sections: [
    S('intro', 8, 0.4, {
      drums: DROCK({ kick: 'x.......x.......', hat: 'x.......x.......' }),
      chords: prog([[0, 'min'], [5, 'maj'], [3, 'min'], [4, 'dom7']]),
      pluck: [[0, 12, 4], [8, 13, 4], [16, 15, 4], [24, 14, 6], [48, 12, 4], [56, 10, 8]],
      fx: ['impact'],
    }),
    S('verse', 8, 0.72, {
      drums: DROCK_FAST(),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [3, 'min'], [4, 'dom7']], 'stab'),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre', 4, 0.64, {
      drums: DROCK_FAST({ snare: '....x...x...x.xx' }),
      bass: bass16(4, [0, 5, 3, 4]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [3, 'min'], [4, 'dom7']]),
      lead: RUIN_LEAD,
    }),
    S('bridge', 4, 0.36, {
      drums: DHALF(),
      chords: prog([[3, 'min7'], [4, 'dom7'], [5, 'maj'], [4, 'dom7']]),
      pluck: [[0, 10, 4], [16, 12, 4], [32, 13, 4], [48, 15, 8]],
    }),
    S('pre2', 4, 0.66, {
      drums: DROCK_FAST({ snare: '....x...x...x.xx' }),
      bass: bass16(4, [0, 5, 3, 4]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DMETAL({ crashBars: [0, 4] }),
      bass: bass16(8, [0, 0, 5, 5, 3, 3, 4, 4]),
      chords: prog([[0, 'min'], [5, 'maj'], [3, 'min'], [4, 'dom7']]),
      lead: RUIN_LEAD,
      arp: { pattern: ARP_UP, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      chords: prog([[0, 'min'], [4, 'dom7'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 12, 2], [8, 15, 4], [16, 13, 2], [20, 12, 8]],
      fx: ['impact'],
    }),
  ],
  stdCharts: { BASIC: 6.0, ADVANCED: 8.7, EXPERT: 11.0, MASTER: 13.7 },
};

/* ================= オーケー？　オーライ！ / 五十嵐撫子 ================= */
// 180 BPM · D 大调 · 应援摇滚
const OK_LEAD: Array<[number, number, number]> = [
  [0, 7, 2], [2, 9, 2], [4, 11, 3], [8, 9, 1], [9, 7, 1], [10, 9, 4],
  [16, 7, 2], [18, 9, 2], [20, 12, 3], [24, 11, 1], [25, 9, 1], [26, 11, 4],
  [32, 11, 2], [34, 12, 2], [36, 14, 2], [38, 12, 2], [40, 11, 4], [44, 9, 4],
  [48, 9, 2], [50, 11, 2], [52, 12, 2], [54, 14, 2], [56, 12, 4], [60, 11, 4],
];
const OK_CALL: Array<[number, number, number]> = [
  [0, 11, 1], [2, 11, 1], [4, 11, 1], [8, 14, 1], [10, 14, 1], [12, 14, 1],
  [16, 11, 1], [18, 11, 1], [20, 11, 1], [24, 12, 1], [26, 12, 1], [28, 12, 1],
];

export const okorai: SongDef = {
  id: 'okorai',
  title: 'オーケー？　オーライ！',
  artist: '五十嵐 撫子（CV:花井 美春）',
  genre: 'OUENDAN ROCK',
  category: '音击/中二节奏',
  version: '舞萌DX 2022',
  bpm: 180,
  key: { root: 50, scale: 'major' },
  jacket: '/assets/jackets/okorai.png',
  color: '#ffca3a',
  color2: '#fff5d6',
  previewBeat: 144,
  style: 'ouendan-rock',
  sections: [
    S('intro', 4, 0.5, {
      drums: DOUEN({ crashBars: [0] }),
      bass: bass8(4, [0, 4, 4, 5]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'maj'], [4, 'maj']], 'stab'),
      pluck: OK_CALL,
    }),
    S('verse', 8, 0.68, {
      drums: DOUEN(),
      bass: bass8(8, [0, 0, 4, 4, 5, 5, 1, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'maj'], [1, 'min']]),
      pluck: OK_CALL,
    }),
    S('pre', 4, 0.62, {
      drums: DOUEN({ snare: '....x...x...x.x.', clap: '....x...x...x.x.' }),
      bass: bass8(4, [4, 5, 1, 5]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: DOUEN({ crashBars: [0, 4], clap: '....x.......x.x.' }),
      bass: bass8(8, [4, 5, 1, 0, 4, 5, 1, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [1, 'min'], [0, 'maj']]),
      lead: OK_LEAD,
    }),
    S('verse2', 8, 0.7, {
      drums: DOUEN(),
      bass: bass8(8, [0, 0, 4, 4, 5, 5, 1, 4]),
      chords: prog([[0, 'maj'], [4, 'maj'], [5, 'maj'], [1, 'min']]),
      pluck: OK_CALL,
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre2', 4, 0.64, {
      drums: DOUEN({ snare: '....x...x...x.x.', clap: '....x...x...x.x.' }),
      bass: bass8(4, [4, 5, 1, 5]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: DOUEN({ crashBars: [0, 4], clap: '....x.......x.x.' }),
      bass: bass8(8, [4, 5, 1, 0, 4, 5, 1, 5]),
      chords: prog([[4, 'maj'], [5, 'maj'], [1, 'min'], [0, 'maj']]),
      lead: OK_LEAD,
    }),
    S('outro', 4, 0.24, {
      drums: DOUEN({ crashBars: [0], snare: '................' }),
      chords: prog([[0, 'maj'], [4, 'maj'], [0, 'maj'], [0, 'maj']]),
      pluck: [[0, 7, 1], [2, 7, 1], [4, 12, 2], [8, 11, 1], [10, 11, 1], [12, 14, 4]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 4.0, ADVANCED: 7.0, EXPERT: 9.0, MASTER: 12.7 },
};

/* ================= HOT LIMIT / T.M.Revolution ================= */
// 165 BPM · B 小调 · 90年代 J-Pop 欧陆摇滚
const HOT_LEAD: Array<[number, number, number]> = [
  [0, 7, 1], [2, 9, 1], [4, 11, 2], [6, 12, 1], [8, 11, 1], [10, 9, 2], [12, 11, 4],
  [16, 9, 1], [18, 11, 1], [20, 12, 2], [22, 14, 1], [24, 12, 1], [26, 11, 2], [28, 9, 4],
  [32, 11, 2], [34, 12, 2], [36, 13, 3], [40, 12, 2], [42, 11, 2], [44, 9, 2], [46, 11, 2],
  [48, 12, 2], [50, 14, 2], [52, 15, 3], [56, 14, 2], [58, 12, 2], [60, 11, 4],
];

export const hotlimit: SongDef = {
  id: 'hotlimit',
  title: 'HOT LIMIT',
  artist: 'T.M.Revolution [covered by 光吉猛修]',
  genre: 'EURO J-POP',
  category: '流行&动漫',
  version: '舞萌DX',
  bpm: 165,
  key: { root: 59, scale: 'minor' },
  jacket: '/assets/jackets/hotlimit.png',
  color: '#ff6b35',
  color2: '#ffe0d0',
  previewBeat: 144,
  style: 'euro-pop',
  sections: [
    S('intro', 4, 0.45, {
      drums: D4({ crashBars: [0] }),
      bass: bassOct(4, [0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], 'stab'),
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse', 8, 0.65, {
      drums: D4({ clap: '....x.......x...' }),
      bass: bassOct(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 2, 1, 2], rate: 8 },
    }),
    S('pre', 4, 0.6, {
      drums: D4({ snare: '....x...x...x.x.', clap: '....x...x...x.x.' }),
      bass: bassOct(4, [0, 5, 2, 6]),
      fx: ['riser'],
    }),
    S('chorus', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bassOct(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: HOT_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('verse2', 8, 0.68, {
      drums: D4({ clap: '....x.......x...' }),
      bass: bassOct(8, [0, 0, 5, 5, 2, 2, 6, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      arp: { pattern: [0, 1, 2, 1], rate: 8 },
    }),
    S('pre2', 4, 0.62, {
      drums: D4({ snare: '....x...x...x.x.', clap: '....x...x...x.x.' }),
      bass: bassOct(4, [0, 5, 2, 6]),
      fx: ['riser'],
    }),
    S('chorus2', 8, 1.0, {
      drums: D4({ crashBars: [0, 4], clap: '....x.......x...' }),
      bass: bassOct(8, [0, 5, 2, 6, 0, 5, 2, 6]),
      chords: prog([[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']]),
      lead: HOT_LEAD,
      arp: { pattern: ARP_UPDOWN, rate: 16 },
    }),
    S('outro', 4, 0.22, {
      drums: DPOP({ hat: '..x...x...x...x.' }),
      chords: prog([[0, 'min'], [6, 'maj'], [0, 'min'], [0, 'min']]),
      pluck: [[0, 7, 2], [4, 11, 2], [8, 12, 2], [12, 14, 4]],
      fx: ['impact'],
    }),
  ],
  dxCharts: { BASIC: 4.0, ADVANCED: 6.0, EXPERT: 9.0, MASTER: 11.7 },
};
