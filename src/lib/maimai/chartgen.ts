/**
 * 谱面生成器 — 从音乐事件流生成 maimai 风格谱面
 *
 * 原则：
 * - 音符对齐音乐事件（鼓点/旋律/和弦变化）
 * - 位置编排模拟 maimai 谱面语言：交替、阶梯、环扫、对拍、镜像
 * - HOLD 对应长音旋律、SLIDE 对应过渡段/副歌、TOUCH 对应安静段、BREAK 对应重音
 */
import type {
  ChartNote, CompiledChart, Difficulty, MusicEvent, SongDef,
} from './types';
import { compileMusic } from './score';
import { NOTE_BASE } from './types';

/* ---------- 确定性随机 ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ---------- 难度档位 ---------- */
interface DiffProfile {
  density: number;          // 密度（每拍音符数 @intensity=1）
  grid: 4 | 8 | 16;         // 允许的最细网格
  maxSimul: number;
  holdChance: number;
  slideChance: number;
  touchChance: number;
  breakEveryBeats: number;  // 平均每 N 拍一个 BREAK
  stream16th: number;       // 高潮段 16 分权重
  stairs: number;           // 阶梯使用率
}

const PROFILES: Record<Difficulty, DiffProfile> = {
  BASIC: { density: 0.8, grid: 4, maxSimul: 1, holdChance: 0.8, slideChance: 0, touchChance: 0, breakEveryBeats: 60, stream16th: 0, stairs: 0.15 },
  ADVANCED: { density: 1.15, grid: 8, maxSimul: 2, holdChance: 0.7, slideChance: 0.3, touchChance: 0.1, breakEveryBeats: 40, stream16th: 0.1, stairs: 0.3 },
  EXPERT: { density: 1.7, grid: 16, maxSimul: 2, holdChance: 0.55, slideChance: 0.55, touchChance: 0.4, breakEveryBeats: 24, stream16th: 0.45, stairs: 0.55 },
  MASTER: { density: 2.55, grid: 16, maxSimul: 3, holdChance: 0.5, slideChance: 0.75, touchChance: 0.7, breakEveryBeats: 16, stream16th: 0.8, stairs: 0.8 },
  REMASTER: { density: 2.85, grid: 16, maxSimul: 4, holdChance: 0.55, slideChance: 0.9, touchChance: 0.85, breakEveryBeats: 12, stream16th: 0.9, stairs: 0.9 },
};

/* ---------- 音乐骨架分析 ---------- */
interface StepInfo {
  step: number;
  beat: number;
  intensity: number;
  sectionName: string;
  isSectionStart: boolean;
  isRiser: boolean;
  kick: boolean;
  snare: boolean;
  clap: boolean;
  crash: boolean;
  melody: boolean;
  melodyLen: number;
  melodyDeg: number;
  chordChange: boolean;
  arp: boolean;
  isBreak: boolean;
}

function analyze(song: SongDef) {
  const { events, sectionSpans } = compileMusic(song);
  const spb = 60 / song.bpm;
  const totalBeats = sectionSpans.reduce((a, s) => a + s.beats, 0);
  const totalSteps = Math.round(totalBeats * 4);

  const steps: StepInfo[] = Array.from({ length: totalSteps }, (_, i) => ({
    step: i, beat: i / 4, intensity: 0, sectionName: '', isSectionStart: false, isRiser: false,
    kick: false, snare: false, clap: false, crash: false,
    melody: false, melodyLen: 0, melodyDeg: -1, chordChange: false, arp: false, isBreak: false,
  }));

  for (const span of sectionSpans) {
    const startStep = Math.round(span.startBeat * 4);
    const endStep = Math.round((span.startBeat + span.beats) * 4);
    for (let s = startStep; s < endStep && s < totalSteps; s++) {
      steps[s].intensity = span.intensity;
      steps[s].sectionName = span.name;
      steps[s].isSectionStart = s === startStep;
      steps[s].isBreak = span.intensity <= 0.35;
    }
  }
  for (const s of steps) if (/pre|build/.test(s.sectionName)) s.isRiser = true;

  const melodyNotes: Array<{ step: number; lenSteps: number; deg: number }> = [];
  for (const e of events) {
    const step = Math.round(e.t * 4);
    if (step < 0 || step >= totalSteps) continue;
    const st = steps[step];
    switch (e.inst) {
      case 'kick': st.kick = true; break;
      case 'snare': st.snare = true; break;
      case 'clap': st.clap = true; break;
      case 'crash': st.crash = true; break;
      case 'chord': if (Math.abs(e.t % 4) < 0.01) st.chordChange = true; break;
      case 'arp': st.arp = true; break;
      case 'lead': case 'pluck':
        st.melody = true;
        st.melodyDeg = 0;
        melodyNotes.push({ step, lenSteps: Math.round((e.len ?? 0.5) * 4), deg: e.midi ?? 60 });
        break;
      default: break;
    }
  }
  for (const m of melodyNotes) {
    const st = steps[m.step];
    if (st) { st.melodyLen = Math.max(1, m.lenSteps); st.melodyDeg = m.deg; }
  }
  return { steps, totalSteps, spb, sectionSpans };
}

/* ---------- 生成器 ---------- */
export function generateChart(song: SongDef, difficulty: Difficulty): CompiledChart {
  const level = song.charts[difficulty] ?? 5.0;
  const prof = PROFILES[difficulty];
  const rnd = mulberry32(hashStr(song.id + difficulty));
  const { steps, totalSteps, spb, sectionSpans } = analyze(song);

  const notes: ChartNote[] = [];
  const touchZones = [0, 2, 4, 6];
  let lastPos = 0;
  let dir: 1 | -1 = 1;
  let streak = 0;
  let sinceBreakSteps = 9999;
  let sinceSlideSteps = 9999;
  let phraseStep = 0;
  const holdUntil = new Map<number, number>();
  let melodyHoldUntilStep = -1;

  const stepTime = (step: number) => step * (spb / 4);
  const place = (n: ChartNote) => notes.push(n);
  const busy = (pos: number, step: number) => {
    const until = holdUntil.get(pos);
    return until !== undefined && step < until;
  };

  const pickPos = (step: number, opts: { prefer?: number } = {}): number => {
    let pos: number;
    if (opts.prefer !== undefined) {
      pos = opts.prefer;
    } else if (rnd() < prof.stairs) {
      pos = (lastPos + dir + 8) % 8;
      streak++;
      if (streak >= 3 + Math.floor(rnd() * 3)) {
        dir = (dir === 1 ? -1 : 1) as 1 | -1;
        streak = 0;
      }
    } else {
      const jump = rnd() < 0.5 ? 2 : 4;
      pos = (lastPos + (rnd() < 0.5 ? jump : 8 - jump)) % 8;
    }
    if (busy(pos, step)) {
      for (let k = 1; k <= 7; k++) {
        const c = (pos + k) % 8;
        if (!busy(c, step)) { pos = c; break; }
      }
    }
    lastPos = pos;
    return pos;
  };

  for (let step = 0; step < totalSteps; step++) {
    const st = steps[step];
    phraseStep++;
    if (phraseStep >= 16) {
      phraseStep = 0;
      if (rnd() < 0.22) lastPos = (lastPos + 4) % 8;
    }
    if (st.intensity <= 0.01) continue;
    if (step < 16) continue; // 首小节留空（开场缓冲）

    const t = stepTime(step);
    const gridPos = step % 4;
    const inGrid = prof.grid === 16 || (prof.grid === 8 && step % 2 === 0) || (prof.grid === 4 && gridPos === 0);
    if (!inGrid) continue;

    sinceBreakSteps++;
    sinceSlideSteps++;

    /* ----- BREAK：crash / 小节重拍重音 ----- */
    const accent =
      st.crash ||
      (st.isSectionStart && st.intensity >= 0.8) ||
      (st.kick && step % 16 === 0 && st.intensity >= 0.85);
    if (accent && sinceBreakSteps >= prof.breakEveryBeats * 4 && rnd() < 0.85) {
      const pos = pickPos(step);
      place({ t, type: 'BREAK', pos });
      sinceBreakSteps = 0;
      if (prof.maxSimul >= 2 && st.intensity >= 0.9 && rnd() < 0.5) {
        place({ t, type: 'TAP', pos: (pos + 4) % 8 });
      }
      continue;
    }

    /* ----- 过渡段 → SLIDE（每 8 步可排） ----- */
    if (
      st.isRiser && prof.slideChance > 0 &&
      sinceSlideSteps >= 8 && step % 8 === 0 && rnd() < prof.slideChance
    ) {
      const startPos = pickPos(step, { prefer: (lastPos + 1) % 8 });
      const span = [1, 2, 3, 4, -1, -2][Math.floor(rnd() * 6)];
      const endPos = (startPos + span + 8) % 8;
      const dur = spb * (Math.abs(span) >= 3 ? 2 : 1);
      if (!busy(startPos, step)) {
        place({ t, type: 'TAP', pos: startPos });
        place({ t, type: 'SLIDE', pos: startPos, end: t + dur, endPos });
        sinceSlideSteps = 0;
        lastPos = endPos;
        continue;
      }
    }

    /* ----- 长音/和弦长拍 → HOLD ----- */
    const melodySustain = st.melody && st.melodyLen >= 4;
    const chordSustain = st.chordChange && st.intensity >= 0.85 && step % 16 === 0;
    if ((melodySustain || chordSustain) && st.intensity > 0.25 && !st.isBreak && rnd() < prof.holdChance) {
      const lenSteps = melodySustain ? Math.min(st.melodyLen, 16) : 8;
      const pos = pickPos(step);
      if (!busy(pos, step)) {
        place({ t, type: 'HOLD', pos, end: stepTime(step + lenSteps) });
        holdUntil.set(pos, step + lenSteps);
        melodyHoldUntilStep = Math.max(melodyHoldUntilStep, step + lenSteps);
        if (prof.touchChance > 0 && rnd() < prof.touchChance * 0.55) {
          const zone = touchZones[Math.floor(rnd() * 4)];
          if (zone !== pos) place({ t: stepTime(step + 4), type: 'TOUCH', pos: zone });
        }
        continue;
      }
    }

    /* ----- 安静段 → TOUCH ----- */
    if (st.isBreak && st.melody && prof.touchChance > 0 && rnd() < prof.touchChance) {
      const zone = touchZones[Math.floor(rnd() * 4)];
      place({ t, type: 'TOUCH', pos: zone });
      if (prof.grid >= 8 && rnd() < 0.4) place({ t, type: 'TAP', pos: pickPos(step) });
      continue;
    }

    /* ----- 常规 TAP ----- */
    const anchor =
      (st.kick ? 1.0 : 0) + (st.snare ? 0.85 : 0) + (st.clap ? 0.7 : 0) +
      (st.melody ? 0.9 : 0) + (st.chordChange ? 0.5 : 0) + (st.arp ? 0.3 : 0);
    if (anchor <= 0) continue;

    const base = (st.intensity * prof.density) / 4;
    let w: number;
    if (gridPos === 0) w = 1.35;
    else if (gridPos === 2) w = 1.0;
    else w = st.intensity >= 0.85 ? prof.stream16th : 0.3;
    let p = base * w;
    if (anchor < 0.5) p *= 0.3;
    else if (anchor >= 1.5) p *= 1.15;
    if (step < melodyHoldUntilStep && st.melody) p *= 0.35;
    if (rnd() > Math.min(p, 0.95)) continue;

    const pos = pickPos(step);
    if (busy(pos, step)) continue;
    place({ t, type: 'TAP', pos });

    /* ----- 双押/三押 ----- */
    if (prof.maxSimul >= 2 && (st.snare || st.clap || (st.crash && gridPos === 0)) && gridPos === 0 && rnd() < 0.3 * prof.density) {
      const partner = rnd() < 0.6 ? (pos + 4) % 8 : (pos + 1) % 8;
      if (!busy(partner, step)) place({ t, type: 'TAP', pos: partner });
      if (prof.maxSimul >= 3 && st.intensity >= 0.95 && rnd() < 0.3) {
        const third = (pos + 6) % 8;
        if (!busy(third, step)) place({ t, type: 'TAP', pos: third });
      }
    }
  }

  /* ----- 副歌滑星补充（EXPERT+ 每 2 小节一个滑星组） ----- */
  if (prof.slideChance >= 0.55) {
    for (const span of sectionSpans) {
      if (!/chorus|drop/.test(span.name)) continue;
      const spanSteps = span.beats * 4;
      for (let off = 32; off < spanSteps - 16; off += 32) {
        const startStep = Math.round(span.startBeat * 4) + off;
        if (startStep >= totalSteps - 24) break;
        if (rnd() > prof.slideChance * 0.85) continue;
        const t = stepTime(startStep);
        const startPos = Math.floor(rnd() * 8);
        const s2 = [2, 3, 4, -2, -3][Math.floor(rnd() * 5)];
        const endPos = (startPos + s2 + 8) % 8;
        const dur = spb * 2;
        place({ t, type: 'TAP', pos: startPos });
        place({ t, type: 'SLIDE', pos: startPos, end: t + dur, endPos });
        // MASTER+ 追加反向滑（滑星链）
        if (prof.slideChance >= 0.75 && rnd() < 0.55) {
          const t2 = stepTime(startStep + 8);
          place({ t: t2, type: 'TAP', pos: endPos });
          place({ t: t2, type: 'SLIDE', pos: endPos, end: t2 + spb, endPos: startPos });
        }
      }
    }
  }

  /* ----- 后处理 ----- */
  notes.sort((a, b) => a.t - b.t || a.pos - b.pos);

  const out: ChartNote[] = [];
  const seen = new Set<string>();
  const timeBuckets = new Map<number, number>();
  for (const n of notes) {
    const key = `${Math.round(n.t * 1000)}:${n.pos}:${n.type}`;
    if (seen.has(key)) continue;
    let blocked = false;
    for (const prev of out) {
      if (prev === n) continue;
      if (prev.type === 'HOLD' && prev.pos === n.pos && n.t < (prev.end ?? 0) + 0.1) { blocked = true; break; }
      if (n.type === 'HOLD' && prev.pos === n.pos && prev.type !== 'TAP' && prev.t < (n.end ?? 0) + 0.1) { blocked = true; break; }
      if (n.type === 'HOLD' && prev.type === 'TAP' && prev.pos === n.pos && Math.abs(prev.t - n.t) < 0.12) { blocked = true; break; }
    }
    if (blocked) continue;
    seen.add(key);
    const bk = Math.round(n.t * 1000);
    const cnt = timeBuckets.get(bk) ?? 0;
    if (cnt >= prof.maxSimul) continue;
    timeBuckets.set(bk, cnt + 1);
    out.push(n);
  }

  // 同键最小间隔
  const lastAtPos = new Map<number, number>();
  const final: ChartNote[] = [];
  for (const n of out) {
    if (n.type === 'SLIDE') { final.push(n); continue; }
    const last = lastAtPos.get(n.pos) ?? -1;
    if (n.t - last < 0.125) continue;
    lastAtPos.set(n.pos, n.t);
    final.push(n);
  }
  final.sort((a, b) => a.t - b.t || a.pos - b.pos);

  /* ----- 统计 ----- */
  const counts = { tap: 0, hold: 0, slide: 0, touch: 0, break: 0, total: 0 };
  let totalBase = 0;
  let totalMax = 0;
  for (const n of final) {
    counts[n.type === 'BREAK' ? 'break' : n.type.toLowerCase() as 'tap' | 'hold' | 'slide' | 'touch']++;
    totalBase += NOTE_BASE[n.type];
    totalMax += n.type === 'BREAK' ? NOTE_BASE.BREAK + 100 : NOTE_BASE[n.type];
  }
  counts.total = final.length;
  const totalJudgments = final.length + counts.hold;

  const levelText = `${Math.floor(level)}${level % 1 >= 0.7 ? '+' : ''}`;

  return {
    difficulty,
    level,
    levelText,
    notes: final,
    counts,
    totalBase,
    totalMax,
    totalJudgments,
    duration: (totalSteps / 4) * spb,
  };
}
