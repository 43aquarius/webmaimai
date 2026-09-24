/**
 * 音乐编译器 — 将 SectionDef 乐谱编译为 MusicEvent 事件流
 */
import type { MusicEvent, SectionDef, SongDef } from './types';

const SCALES: Record<string, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

const CHORD_TONES: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  min9: [0, 3, 7, 14],
  dim: [0, 3, 6],
};

/** 音级 → MIDI（deg 可为任意整数，跨越八度自动进位） */
export function degToMidi(root: number, scale: string[], deg: number, octave = 0): number {
  const n = SCALES[scale] ?? SCALES.minor!;
  const oct = Math.floor(deg / 7);
  const idx = ((deg % 7) + 7) % 7;
  return root + n[idx] + 12 * (oct + octave);
}

/** 字符画节奏展开：字符串按小节平铺到 bars 小节 */
function tilePattern(pat: string, bars: number): string[] {
  const one = pat.replace(/\s/g, '');
  const out: string[] = [];
  for (let b = 0; b < bars; b++) out.push(one);
  return out;
}

export interface CompiledMusic {
  events: MusicEvent[];    // 按 t 排序
  totalBeats: number;
  sectionSpans: Array<{ name: string; startBeat: number; beats: number; intensity: number }>;
}

export function compileMusic(song: SongDef): CompiledMusic {
  const events: MusicEvent[] = [];
  const sectionSpans: CompiledMusic['sectionSpans'] = [];
  const scaleName = song.key.scale;
  const scaleArr = SCALES[scaleName]!;
  const root = song.key.root;
  let beat = 0;

  const push = (e: MusicEvent) => events.push(e);

  for (const sec of song.sections) {
    sectionSpans.push({ name: sec.name, startBeat: beat, beats: sec.bars * 4, intensity: sec.intensity });
    const secStart = beat;

    // ---- 鼓组 ----
    if (sec.drums) {
      const d = sec.drums;
      const kickP = d.kick ? tilePattern(d.kick, sec.bars) : [];
      const snareP = d.snare ? tilePattern(d.snare, sec.bars) : [];
      const hatP = d.hat ? tilePattern(d.hat, sec.bars) : [];
      const openP = d.openhat ? tilePattern(d.openhat, sec.bars) : [];
      const clapP = d.clap ? tilePattern(d.clap, sec.bars) : [];
      for (let b = 0; b < sec.bars; b++) {
        for (let s = 0; s < 16; s++) {
          const t = secStart + b * 4 + s / 4;
          const ch = (arr: string[]) => (arr[b] ? arr[b][s] ?? '.' : '.');
          if (ch(kickP) === 'x') push({ t, inst: 'kick', vel: s % 4 === 0 ? 1 : 0.86 });
          if (ch(snareP) === 'x') push({ t, inst: 'snare', vel: 0.9 });
          if (ch(openP) === 'x') push({ t, inst: 'hat', vel: 0.9 });
          else if (ch(hatP) === 'x') push({ t, inst: 'hat', vel: s % 2 === 0 ? 0.75 : 0.5 });
          if (ch(clapP) === 'x') push({ t, inst: 'clap', vel: 0.9 });
        }
        if (d.crashBars?.includes(b)) push({ t: secStart + b * 4, inst: 'crash', vel: 1 });
      }
    }

    // ---- 和弦 ----
    if (sec.chords && sec.chords.style !== 'off') {
      const prog = sec.chords.prog;
      for (let b = 0; b < sec.bars; b++) {
        const [deg, quality] = prog[b % prog.length];
        const chordRootMidi = degToMidi(root, scaleName, deg, 1);
        const tones = CHORD_TONES[quality] ?? CHORD_TONES.maj!;
        const midis = tones.map((iv) => chordRootMidi + iv);
        const t = secStart + b * 4;
        if (sec.chords.style === 'pad') {
          push({ t, inst: 'chord', chord: midis, len: 4, vel: 1 });
        } else {
          // stab：反拍节奏
          for (const s of [2, 6, 10, 14]) {
            push({ t: t + s / 4, inst: 'chord', chord: midis, len: 0.4, vel: 0.8 });
          }
        }
      }
    }

    // ---- 琶音（跟随和弦） ----
    if (sec.arp && sec.chords) {
      const rate = sec.arp.rate ?? 16;
      const stepsPerBeat = rate / 4;
      const prog = sec.chords.prog;
      let pi = 0;
      const totalSteps = sec.bars * 16;
      for (let s = 0; s < totalSteps; s += 16 / rate) {
        const bar = Math.floor(s / 16);
        const [deg, quality] = prog[bar % prog.length];
        const chordRoot = degToMidi(root, scaleName, deg, 2);
        const tones = CHORD_TONES[quality] ?? CHORD_TONES.maj!;
        const patIdx = sec.arp.pattern[pi % sec.arp.pattern.length];
        pi++;
        const midi = chordRoot + (tones[patIdx % tones.length] ?? 0) + 12 * Math.floor(patIdx / tones.length);
        push({ t: secStart + s / 4, inst: 'arp', midi, vel: 0.9 });
      }
    }

    // ---- 贝斯 ----
    if (sec.bass) {
      for (const [step, deg, lenSteps] of sec.bass) {
        push({
          t: secStart + step / 4,
          inst: 'bass',
          midi: degToMidi(root, scaleName, deg, -1),
          len: (lenSteps / 4) * 0.92,
          vel: 1,
        });
      }
    }

    // ---- 主旋律 ----
    if (sec.lead) {
      for (const [step, deg, lenSteps] of sec.lead) {
        push({
          t: secStart + step / 4,
          inst: 'lead',
          midi: degToMidi(root, scaleName, deg, 1),
          len: (lenSteps / 4) * 0.94,
          vel: 1,
        });
      }
    }

    // ---- 拨弦 ----
    if (sec.pluck) {
      for (const [step, deg, lenSteps] of sec.pluck) {
        push({
          t: secStart + step / 4,
          inst: 'pluck',
          midi: degToMidi(root, scaleName, deg, 1),
          len: lenSteps / 4,
          vel: 1,
        });
      }
    }

    // ---- 效果 ----
    if (sec.fx) {
      for (const fx of sec.fx) {
        if (fx === 'riser') push({ t: secStart, inst: 'riser', len: sec.bars * 4 * 0.96, vel: 1 });
        if (fx === 'impact') push({ t: secStart, inst: 'impact', vel: 1 });
      }
    }

    beat += sec.bars * 4;
  }

  events.sort((a, b) => a.t - b.t);
  return { events, totalBeats: beat, sectionSpans };
}
