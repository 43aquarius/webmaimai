/**
 * 游戏引擎 — 判定 / 连击 / 计分 / 自动演示
 */
import type {
  ChartNote, ChartType, CompiledChart, Difficulty, GameSettings, Judgement,
  JudgementCounts, PlayResult, SongDef,
} from './types';
import { JUDGE_WINDOWS } from './types';
import { noteScore, dxOf, rankOf, ratingOf, isFullCombo, isAllPerfect } from './scoring';
import type { MusicSequencer } from '../audio/sequencer';
import { SFX } from '../audio/instruments';

export interface RuntimeNote {
  note: ChartNote;
  idx: number;
  state: 'PENDING' | 'HELD' | 'DONE';
  headJudge?: Judgement;
  tailJudge?: Judgement;
  lastDelta?: number;
}

export interface EngineEvent {
  kind: 'ringFlash' | 'judgement' | 'breakShatter' | 'slideEnd' | 'holdFlash' | 'touchPop' | 'comboBurst' | 'readyGo' | 'trackEnd';
  pos?: number;
  judgement?: Judgement;
  delta?: number;
  time: number;   // songTime 秒
}

export type EngineState = 'intro' | 'playing' | 'finishing' | 'done';

export class MaimaiEngine {
  readonly song: SongDef;
  readonly chart: CompiledChart;
  readonly difficulty: Difficulty;
  readonly chartType: ChartType;
  readonly settings: GameSettings;
  readonly sequencer: MusicSequencer;
  readonly autoPlay: boolean;

  state: EngineState = 'intro';
  notes: RuntimeNote[] = [];
  private nextIdx = 0;          // 下一个可能进入判定窗口的音符
  private firstVisible = 0;     // 渲染窗口起始
  counts: JudgementCounts = { CP: 0, PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 };
  dxScore = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  fast = 0;
  slow = 0;
  events: EngineEvent[] = [];
  held = new Set<number>();
  finished = false;
  private lastJudgement: { j: Judgement; time: number; delta: number } | null = null;
  private endTimer = 0;

  constructor(opts: {
    song: SongDef; chart: CompiledChart; difficulty: Difficulty; chartType?: ChartType;
    settings: GameSettings; sequencer: MusicSequencer;
  }) {
    this.song = opts.song;
    this.chart = opts.chart;
    this.difficulty = opts.difficulty;
    this.chartType = opts.chart?.chartType ?? opts.chartType ?? 'DX';
    this.settings = opts.settings;
    this.sequencer = opts.sequencer;
    this.autoPlay = opts.settings.autoPlay;
    this.notes = opts.chart.notes.map((note, idx) => ({ note, idx, state: 'PENDING' }));
  }

  /** 音符飞行时间（秒） */
  get travelTime(): number {
    return Math.max(0.22, 1.6 - this.settings.speed * 0.14);
  }

  /** 当前乐曲时间（已含判定偏移） */
  get songTime(): number {
    return this.sequencer.songTime - this.settings.offsetMs / 1000;
  }

  get achievement(): number {
    if (this.chart.totalBase === 0) return 0;
    return (this.score / this.chart.totalBase) * 100;
  }

  private touchWindowMs = JUDGE_WINDOWS.GOOD + 34;

  /* ---------------- 主循环 ---------------- */

  update(dtMs: number) {
    if (this.state === 'done') return;
    const now = this.songTime;

    // 开场状态机
    if (this.state === 'intro') {
      if (now >= -1.0 && this.events.every((e) => e.kind !== 'readyGo')) {
        this.events.push({ kind: 'readyGo', time: now });
      }
      if (now >= 0) this.state = 'playing';
    }

    // 推进可见窗口
    while (
      this.firstVisible < this.notes.length &&
      this.notes[this.firstVisible].note.t < now - 1.0
    ) this.firstVisible++;

    // 判定扫描窗口：覆盖 [过去, now+0.2s]（含当前可命中音符）
    while (
      this.nextIdx < this.notes.length &&
      this.notes[this.nextIdx].note.t < now + 0.2
    ) this.nextIdx++;

    // MISS / 自动演奏处理
    for (let i = this.firstVisible; i < this.nextIdx && i < this.notes.length; i++) {
      const rn = this.notes[i];
      const n = rn.note;
      if (rn.state === 'DONE') continue;

      if (this.autoPlay) {
        this.autoPlayNote(rn, now);
        continue;
      }

      const goodWin = (n.type === 'TOUCH' ? this.touchWindowMs : JUDGE_WINDOWS.GOOD) / 1000;
      switch (n.type) {
        case 'TAP': case 'BREAK': case 'TOUCH':
          if (now - n.t > goodWin) this.judge(rn, 'MISS', 0);
          break;
        case 'HOLD': {
          if (rn.state === 'PENDING' && now - n.t > goodWin) {
            this.judge(rn, 'MISS', 0);
          } else if (rn.state === 'HELD') {
            // 一直按到尾部 → 尾判 CP
            if (this.held.has(n.pos) || this.autoPlay) {
              if (now >= (n.end ?? n.t)) {
                this.judgeTail(rn, 'CP', 0);
              }
            }
          }
          break;
        }
        case 'SLIDE': {
          const arrival = n.end ?? n.t;
          if (now - arrival > goodWin) this.judge(rn, 'MISS', 0);
          break;
        }
      }
    }

    // HOLD 尾部漏判兜底（松手后未再处理）
    for (let i = this.firstVisible; i < this.nextIdx && i < this.notes.length; i++) {
      const rn = this.notes[i];
      if (rn.note.type === 'HOLD' && rn.state === 'HELD' && !this.held.has(rn.note.pos) && !this.autoPlay) {
        const end = rn.note.end ?? rn.note.t;
        // 早已松手：在松手时判定（由 release 处理），这里兜底超窗
        if (now > end + JUDGE_WINDOWS.GOOD / 1000 + 0.4) this.judgeTail(rn, 'MISS', 0);
      }
    }

    // 结束检测
    if (this.state === 'playing') {
      const lastEnd = Math.max(
        ...this.chart.notes.slice(-8).map((n) => n.end ?? n.t),
      );
      if (now > lastEnd + 1.6) {
        this.state = 'finishing';
        this.events.push({ kind: 'trackEnd', time: now });
        this.endTimer = 1.4;
      }
    } else if (this.state === 'finishing') {
      this.endTimer -= dtMs / 1000;
      if (this.endTimer <= 0) {
        this.state = 'done';
        this.finished = true;
      }
    }
  }

  private autoPlayNote(rn: RuntimeNote, now: number) {
    const n = rn.note;
    switch (n.type) {
      case 'TAP': case 'BREAK': case 'TOUCH':
        if (now >= n.t) this.judge(rn, 'CP', 0);
        break;
      case 'HOLD':
        if (rn.state === 'PENDING' && now >= n.t) this.judge(rn, 'CP', 0);
        if (rn.state === 'HELD' && now >= (n.end ?? n.t)) this.judgeTail(rn, 'CP', 0);
        break;
      case 'SLIDE':
        if (now >= (n.end ?? n.t)) this.judge(rn, 'CP', 0);
        break;
    }
  }

  /* ---------------- 输入 ---------------- */

  press(pos: number, audioTime: number) {
    if (this.state === 'done' || this.state === 'finishing') return;
    const now = audioTime - this.sequencer.startTime - this.settings.offsetMs / 1000;
    this.held.add(pos);

    // TOUCH：任意输入命中最近触摸音符
    const touchCandidate = this.findTouchCandidate(now);
    // 常规：找同位置最优音符
    const candidate = this.findCandidate(pos, now);

    if (touchCandidate && (!candidate || Math.abs(touchCandidate.delta) < Math.abs(candidate.delta))) {
      this.judge(touchCandidate.rn, touchCandidate.j, touchCandidate.delta);
      return;
    }
    if (candidate) {
      this.judge(candidate.rn, candidate.j, candidate.delta);
    }
    // 空拍：无惩罚（DX 无 ghost tap 惩罚）
  }

  release(pos: number, audioTime: number) {
    this.held.delete(pos);
    if (this.state === 'done') return;
    const now = audioTime - this.sequencer.startTime - this.settings.offsetMs / 1000;
    // HOLD 松手判定
    for (let i = this.firstVisible; i < this.nextIdx && i < this.notes.length; i++) {
      const rn = this.notes[i];
      if (rn.note.type !== 'HOLD' || rn.state !== 'HELD' || rn.note.pos !== pos) continue;
      const end = rn.note.end ?? rn.note.t;
      const dt = now - end;
      if (dt >= -JUDGE_WINDOWS.GOOD / 1000 - 0.001) {
        // 已过尾判时刻才松手 → 由 update 判 CP；此处只在未达尾判时处理
      } else if (dt < -JUDGE_WINDOWS.GOOD / 1000) {
        this.judgeTail(rn, 'MISS', dt);
      } else {
        // 提前一点松手：立即按差值判
        this.judgeTail(rn, this.judgeOf(Math.abs(dt)), dt);
      }
    }
  }

  private findCandidate(pos: number, now: number): { rn: RuntimeNote; j: Judgement; delta: number } | null {
    let best: { rn: RuntimeNote; j: Judgement; delta: number } | null = null;
    for (let i = this.firstVisible; i < this.nextIdx && i < this.notes.length; i++) {
      const rn = this.notes[i];
      const n = rn.note;
      if (rn.state !== 'PENDING') continue;
      let targetTime = n.t;
      let targetPos = n.pos;
      if (n.type === 'SLIDE') { targetTime = n.end ?? n.t; targetPos = n.endPos ?? n.pos; }
      if (n.type === 'TOUCH') continue; // 触摸单独处理
      if (targetPos !== pos) continue;
      const delta = now - targetTime;
      const abs = Math.abs(delta);
      if (abs > JUDGE_WINDOWS.GOOD / 1000 + 0.02) continue;
      const j = this.judgeOf(abs);
      if (!best || abs < Math.abs(best.delta)) best = { rn, j, delta };
    }
    return best;
  }

  private findTouchCandidate(now: number): { rn: RuntimeNote; j: Judgement; delta: number } | null {
    let best: { rn: RuntimeNote; j: Judgement; delta: number } | null = null;
    for (let i = this.firstVisible; i < this.nextIdx && i < this.notes.length; i++) {
      const rn = this.notes[i];
      const n = rn.note;
      if (n.type !== 'TOUCH' || rn.state !== 'PENDING') continue;
      const delta = now - n.t;
      const abs = Math.abs(delta);
      if (abs > this.touchWindowMs / 1000) continue;
      const j = this.judgeOf(abs, true);
      if (!best || abs < Math.abs(best.delta)) best = { rn, j, delta };
    }
    return best;
  }

  private judgeOf(absSec: number, lenient = false): Judgement {
    const scale = lenient ? 1.5 : 1;
    if (absSec <= JUDGE_WINDOWS.CP / 1000 * scale) return 'CP';
    if (absSec <= JUDGE_WINDOWS.PERFECT / 1000 * scale) return 'PERFECT';
    if (absSec <= JUDGE_WINDOWS.GREAT / 1000 * scale) return 'GREAT';
    return 'GOOD';
  }

  /* ---------------- 判定结算 ---------------- */

  private judge(rn: RuntimeNote, j: Judgement, delta: number) {
    if (rn.state === 'DONE') return;
    const n = rn.note;
    if (n.type === 'HOLD') {
      // 头判
      rn.state = j === 'MISS' ? 'DONE' : 'HELD';
      rn.headJudge = j;
      this.apply(n, j, delta, 'head');
      if (j === 'MISS') {
        rn.tailJudge = 'MISS';
        this.apply(n, 'MISS', 0, 'tail');
      }
      return;
    }
    rn.state = 'DONE';
    rn.headJudge = j;
    this.apply(n, j, delta, 'single');
  }

  private judgeTail(rn: RuntimeNote, j: Judgement, delta: number) {
    if (rn.state !== 'HELD') return;
    rn.state = 'DONE';
    rn.tailJudge = j;
    this.apply(rn.note, j, delta, 'tail');
  }

  private apply(n: ChartNote, j: Judgement, delta: number, part: 'head' | 'tail' | 'single') {
    this.counts[j]++;
    // HOLD 头/尾各占一半基础分（与 maimai 判定内訳一致）
    const score = part === 'single' ? noteScore(n.type, j) : noteScore(n.type, j) / 2;
    this.score += score;
    this.dxScore += dxOf(j);
    if (j === 'GOOD' || j === 'MISS') {
      this.combo = 0;
    } else {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      if (this.combo > 0 && this.combo % 100 === 0) {
        this.events.push({ kind: 'comboBurst', time: this.songTime });
      }
    }
    if (j === 'GREAT' || j === 'GOOD') {
      if (delta < 0) this.fast++; else this.slow++;
    }
    this.lastJudgement = { j, time: this.songTime, delta };

    // 特效事件
    const targetPos = n.type === 'SLIDE' ? (n.endPos ?? n.pos) : n.pos;
    this.events.push({ kind: 'ringFlash', pos: targetPos, judgement: j, delta, time: this.songTime });
    this.events.push({ kind: 'judgement', judgement: j, delta, time: this.songTime });
    if (n.type === 'BREAK' && part !== 'head') this.events.push({ kind: 'breakShatter', pos: targetPos, time: this.songTime });
    if (n.type === 'SLIDE') this.events.push({ kind: 'slideEnd', pos: targetPos, time: this.songTime });
    if (n.type === 'TOUCH') this.events.push({ kind: 'touchPop', pos: n.pos, time: this.songTime });
  }

  getJudgement(): { j: Judgement; time: number; delta: number } | null {
    return this.lastJudgement;
  }

  /** 供渲染器消费并清理的事件 */
  drainEvents(): EngineEvent[] {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  /* ---------------- 结果 ---------------- */

  buildResult(): PlayResult {
    const ach = Math.min(this.achievement, 101);
    const fc = isFullCombo(this.counts);
    const ap = isAllPerfect(this.counts);
    const level = this.chart.level;
    return {
      songId: this.song.id,
      difficulty: this.difficulty,
      chartType: this.chartType,
      level,
      achievement: ach,
      rank: rankOf(ach),
      isFC: fc,
      isAP: ap,
      counts: { ...this.counts },
      dxScore: this.dxScore,
      dxScoreMax: this.chart.totalJudgments * 3,
      maxCombo: this.maxCombo,
      totalNotes: this.chart.counts.total,
      rating: ratingOf(level, ach, ap),
      fastSlow: { fast: this.fast, slow: this.slow },
      autoplay: this.autoPlay,
    };
  }
}
