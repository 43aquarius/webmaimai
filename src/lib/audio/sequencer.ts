/**
 * 音乐时序器 — 基于 AudioContext 时钟的 lookahead 调度
 */
import type { MusicEvent, SongDef } from '../maimai/types';
import { compileMusic } from '../maimai/score';
import {
  createInstCtx, kick, snare, hat, clap, crash, impact, riser,
  bass, chord, lead, arp, pluck, type InstCtx,
} from './instruments';

const LOOKAHEAD = 0.18;    // 调度前瞻（秒）
const TICK_MS = 30;

export class MusicSequencer {
  ctx: AudioContext | null = null;
  I: InstCtx | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private events: MusicEvent[] = [];
  private idx = 0;
  private songStart = 0;         // ctx time of beat 0
  /** 暴露给引擎：beat 0 的 ctx 时间 */
  get startTime(): number { return this.songStart; }
  private spb = 0.5;             // 秒/拍
  private endBeat = 0;
  private previewLoop: { startBeat: number; endBeat: number } | null = null;
  private volume = 0.85;
  private startDelay = 1.0;      // 起播留白（秒）

  /** 设置起播留白（须在 playSong 前调用） */
  setStartDelay(sec: number) {
    this.startDelay = Math.max(0.2, sec);
  }

  /** 必须在用户手势后调用 */
  init(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.I = createInstCtx(this.ctx);
      this.setVolume(this.volume);
      return this.ctx;
    } catch {
      return null;
    }
  }

  get audioTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /** 当前乐曲时间（秒，beat0 为 0，起播前为负） */
  get songTime(): number {
    if (!this.ctx) return -this.startDelay;
    return this.ctx.currentTime - this.songStart;
  }

  /** 当前拍数 */
  get songBeat(): number {
    return this.songTime / this.spb;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.I) {
      this.I.dryBus.gain.value = 1.15 * v;
      this.I.musicBus.gain.value = 1.0 * v;
      this.I.sfxBus.gain.value = 1.0 * v;
    }
  }

  /** 全曲播放 */
  playSong(song: SongDef, startBeat = 0) {
    const compiled = compileMusic(song);
    this._begin(compiled.events, compiled.totalBeats, song.bpm, startBeat, null);
  }

  /** 试听循环（选曲界面） */
  playPreview(song: SongDef) {
    const compiled = compileMusic(song);
    const startBeat = song.previewBeat;
    const endBeat = Math.min(startBeat + 32, compiled.totalBeats - 8);
    this._begin(compiled.events, compiled.totalBeats, song.bpm, startBeat, { startBeat, endBeat });
  }

  private _begin(events: MusicEvent[], totalBeats: number, bpm: number, startBeat: number, loop: { startBeat: number; endBeat: number } | null) {
    this.stop();
    if (!this.ctx || !this.I) return;
    this.events = events;
    this.spb = 60 / bpm;
    this.endBeat = totalBeats;
    this.previewLoop = loop;
    const startSec = startBeat * this.spb;
    this.idx = events.findIndex((e) => e.t * this.spb >= startSec - 0.001);
    if (this.idx < 0) this.idx = events.length;
    this.songStart = this.ctx.currentTime + this.startDelay - startSec;
    if (loop) {
      // 预览模式提前进入（0.3s 淡入感）
      this.songStart = this.ctx.currentTime + 0.35 - startSec;
    }
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  private tick() {
    if (!this.ctx || !this.I) return;
    const now = this.ctx.currentTime;
    const horizon = now + LOOKAHEAD;

    while (this.idx < this.events.length) {
      const e = this.events[this.idx];
      const when = this.songStart + e.t * this.spb;
      if (when > horizon) break;
      this.idx++;
      if (when < now - 0.02) continue; // 过期跳过
      this.dispatch(e, Math.max(when, now + 0.005));
    }

    // 预览循环
    if (this.previewLoop) {
      const curBeat = this.songBeat;
      if (curBeat >= this.previewLoop.endBeat) {
        const events = this.events;
        const loop = this.previewLoop;
        const spb = this.spb;
        const total = this.endBeat;
        // 重启循环
        this.stopMusicOnly();
        this._beginLoopAgain(events, total, spb, loop);
      }
    }
  }

  private _beginLoopAgain(events: MusicEvent[], totalBeats: number, spb: number, loop: { startBeat: number; endBeat: number }) {
    if (!this.ctx) return;
    this.events = events;
    this.spb = spb;
    this.endBeat = totalBeats;
    this.previewLoop = loop;
    const startSec = loop.startBeat * spb;
    this.idx = events.findIndex((e) => e.t * spb >= startSec - 0.001);
    if (this.idx < 0) this.idx = events.length;
    this.songStart = this.ctx.currentTime + 0.6 - startSec;
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  private dispatch(e: MusicEvent, when: number) {
    const I = this.I!;
    switch (e.inst) {
      case 'kick': kick(I, when, e.vel ?? 1); break;
      case 'snare': snare(I, when, e.vel ?? 1); break;
      case 'hat': hat(I, when, (e.vel ?? 0.7), false); break;
      case 'openhat': hat(I, when, (e.vel ?? 0.8), true); break;
      case 'clap': clap(I, when, e.vel ?? 1); break;
      case 'crash': crash(I, when, e.vel ?? 1); break;
      case 'impact': impact(I, when, e.vel ?? 1); break;
      case 'riser': riser(I, when, e.len ?? 2, e.vel ?? 1); break;
      case 'bass': bass(I, when, e.midi!, e.len ?? 0.4, e.vel ?? 1); break;
      case 'chord': chord(I, when, e.chord!, e.len ?? 2, e.vel ?? 1, (e.len ?? 2) >= 3.5); break;
      case 'lead': lead(I, when, e.midi!, e.len ?? 0.4, e.vel ?? 1); break;
      case 'arp': arp(I, when, e.midi!, e.vel ?? 1); break;
      case 'pluck': pluck(I, when, e.midi!, e.len ?? 0.3, e.vel ?? 1); break;
    }
  }

  private stopMusicOnly() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.killScheduled();
  }

  /** 停止并静音所有已调度音符 */
  stop() {
    this.stopMusicOnly();
    this.previewLoop = null;
    this.events = [];
    this.idx = 0;
  }

  private killScheduled() {
    if (!this.I) return;
    const now = this.ctx?.currentTime ?? 0;
    for (const node of Array.from(this.I.registry)) {
      try { node.stop(now); } catch { /* noop */ }
    }
    this.I.registry.clear();
  }

  /** 暂停（游戏内） */
  pause() {
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  get isPlaying(): boolean {
    return this.timer !== null;
  }

  get totalDuration(): number {
    return this.endBeat * this.spb;
  }
}
