/**
 * Canvas 渲染器 — 圆形游玩界面的全部视觉呈现
 * 还原 maimai DX：8 键环 / 音符外飞 / 判定特效 / HUD
 */
import type { CompiledChart, Judgement, SongDef } from './types';
import { JUDGE_TEXT, lvText as lvTextOf } from './types';
import type { MaimaiEngine, EngineEvent, RuntimeNote } from './engine';

const FONT = '"M PLUS Rounded 1c", "Yuanti SC", "PingFang SC", "Microsoft YaHei", sans-serif';

/* 颜色 */
const C = {
  bgDeep: '#060a1c',
  ringIdle: 'rgba(30, 58, 138, 0.55)',
  ringIdleEdge: 'rgba(80, 140, 255, 0.45)',
  ringPress: '#3ee6ff',
  ringPressEdge: '#b8f6ff',
  judgeLine: 'rgba(160, 220, 255, 0.9)',
  tapOut: '#ff4fa0',
  tapIn: '#ff8fc9',
  breakGold: '#ffd24a',
  breakRim: '#ff7043',
  holdYellow: '#ffd24a',
  slideCyan: '#41f2ff',
  touchGreen: '#3dff9c',
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string; grav: number;
}

interface RingFlash {
  pos: number; life: number; judge: Judgement;
}

export interface RenderOpts {
  dark?: boolean;
}

export class PlayfieldRenderer {
  private ctx: CanvasRenderingContext2D;
  private engine: MaimaiEngine;
  private song: SongDef;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private cx = 0;
  private cy = 0;
  private R = 0;

  private particles: Particle[] = [];
  private ringFlashes: RingFlash[] = [];
  private judgementPopup: { judge: Judgement; time: number; delta: number } | null = null;
  private comboPulse = 0;
  private comboBurstT = -10;
  private readyT = -10;
  private endT = -10;
  private jacketImg: HTMLImageElement | null = null;
  private bgImg: HTMLImageElement | null = null;
  private lastNow = 0;

  constructor(canvas: HTMLCanvasElement, engine: MaimaiEngine, song: SongDef) {
    this.ctx = canvas.getContext('2d')!;
    this.engine = engine;
    this.song = song;
    const j = new Image();
    j.src = song.jacket;
    j.onload = () => { this.jacketImg = j; };
    const b = new Image();
    b.src = '/assets/bg/stage_wide.png';
    b.onload = () => { this.bgImg = b; };
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w; this.h = h; this.dpr = dpr;
    this.cx = w / 2;
    this.cy = h * 0.545;
    this.R = Math.min(w * 0.465, h * 0.44);
  }

  /* 几何 */
  private posAngle(pos: number) {
    return -Math.PI / 2 + (pos * Math.PI) / 4;
  }

  private diffColor(d: string): string {
    switch (d) {
      case 'BASIC': return '#22c55e';
      case 'ADVANCED': return '#fbbf24';
      case 'EXPERT': return '#fb4d6d';
      case 'MASTER': return '#c084fc';
      default: return '#f5d0fe';
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  private ringOuter() { return this.R * 0.985; }
  private ringInner() { return this.R * 0.775; }
  private judgeR() { return this.R * 0.775; }
  private spawnR() { return this.R * 0.1; }
  private noteR() { return this.R * 0.082; }
  private touchR() { return this.R * 0.42; }

  /* ---------------- 主渲染 ---------------- */

  render(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    this.lastNow = now;
    ctx.save();
    ctx.clearRect(0, 0, this.w, this.h);

    this.drawBackground(now);
    this.drawCenterDecor(now);
    this.drawLanes();
    this.drawRing(now);
    this.drawNotes(now);
    this.drawParticles(now);
    this.drawEffects(now);
    this.drawCombo(now);
    this.drawJudgement(now);
    this.drawHUD(now);
    ctx.restore();

    // 消费引擎事件
    this.consumeEvents();
    // 衰减
    this.comboPulse = Math.max(0, this.comboPulse - 0.05);
  }

  /* ---------------- 背景 ---------------- */

  private drawBackground(now: number) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(this.cx, this.cy, this.R * 0.2, this.cx, this.cy, this.R * 2.2);
    g.addColorStop(0, '#101a3f');
    g.addColorStop(0.55, '#0a1030');
    g.addColorStop(1, C.bgDeep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    if (this.bgImg) {
      ctx.globalAlpha = 0.16;
      const iw = this.w;
      const ih = iw * (this.bgImg.height / this.bgImg.width);
      ctx.drawImage(this.bgImg, 0, (this.h - ih) / 2 + Math.sin(now * 0.1) * 8, iw, ih);
      ctx.globalAlpha = 1;
    }

    // 节拍脉冲光
    const beat = (now * this.song.bpm) / 60;
    const beatFrac = beat - Math.floor(beat);
    const pulse = Math.pow(1 - beatFrac, 2.2) * 0.11;
    const rg = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.R * 1.25);
    rg.addColorStop(0, `${this.song.color}`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = pulse;
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.R * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---------------- 中央装饰 ---------------- */

  private drawCenterDecor(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    // 旋转装饰环
    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(now * 0.12);
    ctx.strokeStyle = `${this.song.color}33`;
    ctx.lineWidth = this.R * 0.012;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, this.R * (0.30 + i * 0.06), i * 0.8, i * 0.8 + Math.PI * 1.3);
      ctx.stroke();
    }
    ctx.restore();

    // 封面
    if (this.jacketImg) {
      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(Math.sin(now * 0.3) * 0.03);
      const r = this.R * 0.27;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = 0.22;
      ctx.drawImage(this.jacketImg, -r, -r, r * 2, r * 2);
      ctx.restore();
    }
  }

  /* ---------------- 车道辅助线 ---------------- */

  private drawLanes() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 170, 255, 0.10)';
    ctx.lineWidth = Math.max(1, this.R * 0.004);
    for (let p = 0; p < 8; p++) {
      const a = this.posAngle(p) + Math.PI / 8;
      ctx.beginPath();
      ctx.moveTo(this.cx + Math.cos(a) * this.spawnR(), this.cy + Math.sin(a) * this.spawnR());
      ctx.lineTo(this.cx + Math.cos(a) * this.ringInner(), this.cy + Math.sin(a) * this.ringInner());
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------------- 8 键环 ---------------- */

  private drawRing(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    const ri = this.ringInner();
    const ro = this.ringOuter();
    const gap = 0.035; // 弧度间隙

    // 判定线
    ctx.save();
    ctx.strokeStyle = C.judgeLine;
    ctx.lineWidth = Math.max(1.5, this.R * 0.006);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, ri, 0, Math.PI * 2);
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.restore();

    for (let p = 0; p < 8; p++) {
      const a0 = this.posAngle(p) - Math.PI / 8 + gap;
      const a1 = this.posAngle(p) + Math.PI / 8 - gap;
      const pressed = eng.held.has(p) || (eng.autoPlay && eng.state === 'playing' && eng.notes.some((rn) =>
        rn.note.type === 'TAP' && rn.note.pos === p && Math.abs(rn.note.t - now) < 0.05));

      ctx.save();
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, ro, a0, a1);
      ctx.arc(this.cx, this.cy, ri, a1, a0, true);
      ctx.closePath();

      if (pressed) {
        const g = ctx.createRadialGradient(this.cx, this.cy, ri, this.cx, this.cy, ro);
        g.addColorStop(0, 'rgba(62, 230, 255, 0.35)');
        g.addColorStop(1, 'rgba(62, 230, 255, 0.95)');
        ctx.fillStyle = g;
        ctx.shadowColor = C.ringPress;
        ctx.shadowBlur = this.R * 0.06;
      } else {
        const g = ctx.createRadialGradient(this.cx, this.cy, ri, this.cx, this.cy, ro);
        g.addColorStop(0, 'rgba(18, 32, 84, 0.25)');
        g.addColorStop(1, C.ringIdle);
        ctx.fillStyle = g;
        ctx.shadowColor = 'transparent';
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(1.5, this.R * 0.006);
      ctx.strokeStyle = pressed ? C.ringPressEdge : C.ringIdleEdge;
      ctx.stroke();

      // 键位数字
      const mid = (ri + ro) / 2;
      const ma = this.posAngle(p);
      ctx.fillStyle = pressed ? '#ffffff' : 'rgba(190, 220, 255, 0.85)';
      ctx.font = `800 ${Math.round(this.R * 0.075)}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p + 1), this.cx + Math.cos(ma) * mid, this.cy + Math.sin(ma) * mid);
      ctx.restore();
    }

    // 外框细环
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, this.R * 0.006);
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, ro + this.R * 0.008, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, ri - this.R * 0.008, 0, Math.PI * 2);
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------- 音符 ---------------- */

  private noteProgress(hitTime: number, now: number): number {
    const travel = this.engine.travelTime;
    return 1 - (hitTime - now) / travel; // 0(中心) → 1(判定圈)
  }

  private drawNotes(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    const travel = eng.travelTime;
    const visible = eng.notes.filter(
      (rn) => {
        const n = rn.note;
        const start = n.type === 'SLIDE' ? n.t : n.t;
        const end = n.type === 'HOLD' ? (n.end ?? n.t) : n.type === 'SLIDE' ? (n.end ?? n.t) : n.t;
        return end >= now - 0.35 && start <= now + travel + 0.2 && rn.state !== 'DONE' || (n.type === 'HOLD' && rn.state === 'HELD');
      },
    );

    // 先画 HOLD 光带 / SLIDE 轨道（底层）
    for (const rn of visible) {
      const n = rn.note;
      if (n.type === 'HOLD' && rn.state !== 'DONE') this.drawHoldRibbon(n, rn, now);
      if (n.type === 'SLIDE') this.drawSlidePath(n, now);
    }

    // 音符本体（远→近绘制）
    for (let i = visible.length - 1; i >= 0; i--) {
      const rn = visible[i];
      const n = rn.note;
      switch (n.type) {
        case 'TAP': this.drawTap(n, now); break;
        case 'BREAK': this.drawBreak(n, now); break;
        case 'HOLD': this.drawHoldHead(n, rn, now); break;
        case 'SLIDE': this.drawSlideStar(n, now); break;
        case 'TOUCH': this.drawTouch(n, now); break;
      }
    }
  }

  private polar(r: number, a: number): [number, number] {
    return [this.cx + Math.cos(a) * r, this.cy + Math.sin(a) * r];
  }

  private drawTapBody(pos: number, prog: number, scale: number, isBreak = false) {
    const ctx = this.ctx;
    const a = this.posAngle(pos);
    const r = this.spawnR() + (this.judgeR() - this.spawnR()) * Math.min(prog, 1);
    const [x, y] = this.polar(r, a);
    const size = this.noteR() * scale * (0.85 + 0.15 * Math.min(prog, 1));

    ctx.save();
    ctx.translate(x, y);
    // 拖尾
    if (prog > 0.15 && prog < 1) {
      const [tx, ty] = this.polar(r - this.R * 0.09, a);
      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, isBreak ? 'rgba(255,210,74,0.5)' : 'rgba(255,79,160,0.5)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = size * 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx - x, ty - y);
      ctx.lineTo(0, 0);
      ctx.stroke();
    }
    // 主体
    const g = ctx.createRadialGradient(0, -size * 0.25, size * 0.15, 0, 0, size);
    if (isBreak) {
      g.addColorStop(0, '#fff6d8');
      g.addColorStop(0.45, C.breakGold);
      g.addColorStop(1, C.breakRim);
    } else {
      g.addColorStop(0, C.tapIn);
      g.addColorStop(0.55, C.tapOut);
      g.addColorStop(1, '#d92b7e');
    }
    ctx.shadowColor = isBreak ? C.breakGold : C.tapOut;
    ctx.shadowBlur = size * 0.55;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 白描边
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = size * 0.09;
    ctx.stroke();
    // BREAK 星形
    if (isBreak) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      this.drawStarPath(0, 0, size * 0.55, size * 0.22, 5, 0);
      ctx.fill();
    }
    // 键位数字
    ctx.fillStyle = isBreak ? '#7a4a00' : '#ffffff';
    ctx.font = `900 ${Math.round(size * 0.82)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(pos + 1), 0, size * 0.06);
    ctx.restore();
  }

  private drawStarPath(cx: number, cy: number, outer: number, inner: number, points: number, rot: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 === 0 ? outer : inner;
      const a = rot + (i * Math.PI) / points;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  private drawTap(n: { t: number; pos: number }, now: number) {
    const prog = this.noteProgress(n.t, now);
    if (prog < -0.05 || prog > 1.12) return;
    this.drawTapBody(n.pos, prog, 1);
  }

  private drawBreak(n: { t: number; pos: number }, now: number) {
    const prog = this.noteProgress(n.t, now);
    if (prog < -0.05 || prog > 1.12) return;
    this.drawTapBody(n.pos, prog, 1.12, true);
  }

  /* ----- HOLD ----- */

  private drawHoldRibbon(n: { t: number; pos: number; end?: number }, rn: RuntimeNote, now: number) {
    const ctx = this.ctx;
    const a = this.posAngle(n.pos);
    const ri = this.ringInner();
    const headProg = Math.min(this.noteProgress(n.t, now), 1);
    const headR = this.spawnR() + (ri - this.spawnR()) * headProg;
    const end = n.end ?? n.t;
    const held = rn.state === 'HELD';
    const tailProg = held ? Math.min(this.noteProgress(end, now), 1) : 0;

    ctx.save();
    // 光带（中心→头部）
    const from = held ? ri : this.spawnR();
    const to = held ? ri : headR;
    if (to > from) {
      const [x0, y0] = this.polar(from, a);
      const [x1, y1] = this.polar(to, a);
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, 'rgba(255,210,74,0.06)');
      grad.addColorStop(1, 'rgba(255,210,74,0.5)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.noteR() * 1.15;
      ctx.lineCap = 'round';
      ctx.shadowColor = C.holdYellow;
      ctx.shadowBlur = this.R * 0.02;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    // 长按中的环上光柱
    if (held) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 12);
      const [x, y] = this.polar((ri + this.ringOuter()) / 2, a);
      ctx.globalAlpha = 0.4 + 0.3 * pulse;
      const [x2, y2] = this.polar(this.spawnR(), a);
      const grad2 = ctx.createLinearGradient(x2, y2, x, y);
      grad2.addColorStop(0, 'rgba(255,210,74,0.05)');
      grad2.addColorStop(1, 'rgba(255,230,150,0.75)');
      ctx.strokeStyle = grad2;
      ctx.lineWidth = this.noteR() * (0.9 + 0.15 * pulse);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 尾星（长按时从中心飞出）
    if (held && tailProg > 0 && tailProg < 1) {
      const [tx, ty] = this.polar(this.spawnR() + (ri - this.spawnR()) * tailProg, a);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(now * 5);
      ctx.fillStyle = C.holdYellow;
      ctx.shadowColor = C.holdYellow;
      ctx.shadowBlur = this.R * 0.03;
      this.drawStarPath(0, 0, this.noteR() * 0.5, this.noteR() * 0.2, 5, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  private drawHoldHead(n: { t: number; pos: number }, rn: RuntimeNote, now: number) {
    if (rn.state === 'HELD') return; // 头部已被吃掉
    const prog = this.noteProgress(n.t, now);
    if (prog < -0.05 || prog > 1.12) return;
    this.drawTapBody(n.pos, prog, 1);
  }

  /* ----- SLIDE ----- */

  private drawSlidePath(n: { t: number; pos: number; end?: number; endPos?: number }, now: number) {
    const ctx = this.ctx;
    const arrival = n.end ?? n.t;
    if (now > arrival + 0.1) return;
    if (now < n.t - this.engine.travelTime) return;
    const from = this.posAngle(n.pos);
    const to = this.posAngle(n.endPos ?? n.pos);
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const rMid = (this.ringInner() + this.ringOuter()) / 2;

    ctx.save();
    // 轨道弧线
    const appear = Math.min(1, Math.max(0, (now - (n.t - this.engine.travelTime)) / this.engine.travelTime));
    ctx.globalAlpha = 0.25 + 0.5 * appear;
    ctx.strokeStyle = C.slideCyan;
    ctx.shadowColor = C.slideCyan;
    ctx.shadowBlur = this.R * 0.02;
    ctx.lineWidth = this.R * 0.018;
    ctx.setLineDash([this.R * 0.035, this.R * 0.03]);
    ctx.lineDashOffset = -now * this.R * 0.15;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, rMid, from, from + diff);
    ctx.stroke();
    ctx.setLineDash([]);
    // 终点圈
    const [ex, ey] = this.polar(this.judgeR(), to);
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = this.R * 0.008;
    ctx.beginPath();
    ctx.arc(ex, ey, this.noteR() * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawSlideStar(n: { t: number; pos: number; end?: number; endPos?: number }, now: number) {
    const ctx = this.ctx;
    const arrival = n.end ?? n.t;
    if (now > arrival + 0.05) return;
    // 滑星飞行进度：departure t → arrival end
    const total = arrival - n.t;
    const prog = total > 0 ? Math.min(Math.max((now - n.t) / total, 0), 1) : 1;
    const from = this.posAngle(n.pos);
    const to = this.posAngle(n.endPos ?? n.pos);
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const ang = from + diff * prog;
    const rMid = (this.ringInner() + this.ringOuter()) / 2;
    const [x, y] = this.polar(rMid, ang);

    ctx.save();
    ctx.translate(x, y);
    // 拖尾星
    for (let k = 1; k <= 3; k++) {
      const p2 = Math.max(0, prog - k * 0.06);
      const [tx, ty] = this.polar(rMid, from + diff * p2);
      ctx.globalAlpha = 0.3 / k;
      ctx.fillStyle = C.slideCyan;
      this.drawStarPath(tx - x, ty - y, this.noteR() * 0.42, this.noteR() * 0.17, 5, now * 5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.rotate(now * 6);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.noteR() * 0.62);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.6, C.slideCyan);
    g.addColorStop(1, '#0aa8cc');
    ctx.fillStyle = g;
    ctx.shadowColor = C.slideCyan;
    ctx.shadowBlur = this.R * 0.05;
    this.drawStarPath(0, 0, this.noteR() * 0.62, this.noteR() * 0.25, 5, 0);
    ctx.fill();
    ctx.restore();
  }

  /* ----- TOUCH ----- */

  private drawTouch(n: { t: number; pos: number }, now: number) {
    const ctx = this.ctx;
    const prog = this.noteProgress(n.t, now);
    if (prog < -0.05 || prog > 1.1) return;
    const a = this.posAngle(n.pos);
    const r0 = this.R * 0.16;
    const r1 = this.touchR();
    const r = r0 + (r1 - r0) * Math.min(prog, 1);
    const [x, y] = this.polar(r, a);
    const size = this.R * 0.055 * (0.8 + 0.2 * prog);

    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.9;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    g.addColorStop(0, 'rgba(220,255,240,0.95)');
    g.addColorStop(0.7, C.touchGreen);
    g.addColorStop(1, 'rgba(61,255,156,0.25)');
    ctx.fillStyle = g;
    ctx.shadowColor = C.touchGreen;
    ctx.shadowBlur = size * 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = size * 0.12;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 目标区提示
    if (prog < 0.95) {
      const [zx, zy] = this.polar(r1, a);
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(now * 8);
      ctx.strokeStyle = C.touchGreen;
      ctx.lineWidth = this.R * 0.005;
      ctx.beginPath();
      ctx.arc(zx, zy, this.R * 0.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------------- 特效 ---------------- */

  consumeEvents() {
    const evts = this.engine.drainEvents();
    for (const e of evts) this.onEvent(e);
  }

  private onEvent(e: EngineEvent) {
    const now = e.time;
    switch (e.kind) {
      case 'ringFlash': {
        this.ringFlashes.push({ pos: e.pos ?? 0, life: 1, judge: e.judgement ?? 'PERFECT' });
        const a = this.posAngle(e.pos ?? 0);
        const [x, y] = this.polar(this.judgeR(), a);
        const j = e.judgement ?? 'PERFECT';
        const n = j === 'CP' ? 14 : j === 'PERFECT' ? 10 : j === 'GREAT' ? 7 : 4;
        const col = j === 'CP' ? '#ffe95c' : j === 'PERFECT' ? '#ffd84a' : j === 'GREAT' ? '#ff5fa8' : '#a78fd4';
        for (let i = 0; i < n; i++) {
          const ang = a + (Math.random() - 0.5) * 1.2;
          const sp = this.R * (0.5 + Math.random() * 0.9);
          this.particles.push({
            x, y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            life: 0.5 + Math.random() * 0.3, maxLife: 0.8,
            size: this.R * (0.008 + Math.random() * 0.014),
            color: col, grav: 0.6,
          });
        }
        break;
      }
      case 'breakShatter': {
        const a = this.posAngle(e.pos ?? 0);
        const [x, y] = this.polar(this.judgeR(), a);
        for (let i = 0; i < 26; i++) {
          const ang = a + (Math.random() - 0.5) * 2.4;
          const sp = this.R * (0.8 + Math.random() * 1.6);
          this.particles.push({
            x, y,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            life: 0.6 + Math.random() * 0.4, maxLife: 1.0,
            size: this.R * (0.01 + Math.random() * 0.02),
            color: Math.random() < 0.6 ? '#ffd24a' : '#ff7043', grav: 1.2,
          });
        }
        break;
      }
      case 'judgement': {
        this.judgementPopup = { judge: e.judgement ?? 'PERFECT', time: now, delta: e.delta ?? 0 };
        this.comboPulse = 1;
        break;
      }
      case 'comboBurst': {
        this.comboBurstT = now;
        const cx = this.cx, cy = this.cy;
        for (let i = 0; i < 40; i++) {
          const ang = (i / 40) * Math.PI * 2;
          const sp = this.R * (1.2 + Math.random() * 0.8);
          this.particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            life: 0.7, maxLife: 0.7,
            size: this.R * 0.012,
            color: i % 2 ? '#ffe95c' : '#3ee6ff', grav: 0,
          });
        }
        break;
      }
      case 'readyGo': this.readyT = now; break;
      case 'trackEnd': this.endT = now; break;
      default: break;
    }
  }

  private drawParticles(now: number) {
    const ctx = this.ctx;
    const dt = 1 / 60;
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      if (p.life <= 0) return false;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.grav * this.R * dt;
      p.vx *= 0.97;
      p.vy *= 0.97;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;
  }

  private drawEffects(now: number) {
    const ctx = this.ctx;
    this.ringFlashes = this.ringFlashes.filter((f) => {
      f.life -= 0.06;
      if (f.life <= 0) return false;
      const a0 = this.posAngle(f.pos) - Math.PI / 8;
      const a1 = this.posAngle(f.pos) + Math.PI / 8;
      const alpha = f.life * 0.85;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = f.judge === 'MISS' ? '#6b83a8' : '#ffffff';
      ctx.lineWidth = this.R * 0.02 * f.life;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = this.R * 0.04;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.judgeR() + this.R * 0.02 * (1 - f.life), a0, a1);
      ctx.stroke();
      ctx.restore();
      return true;
    });
  }

  /* ---------------- 连击 / 判定文字 ---------------- */

  private drawCombo(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    if (eng.combo < 3) return;
    const scale = 1 + this.comboPulse * 0.14;
    const gold = eng.combo >= 100;

    ctx.save();
    ctx.translate(this.cx, this.cy + this.R * 0.02);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(this.R * 0.15)}px ${FONT}`;
    ctx.lineWidth = this.R * 0.014;
    ctx.strokeStyle = 'rgba(10, 20, 60, 0.9)';
    ctx.strokeText(String(eng.combo), 0, 0);
    const g = ctx.createLinearGradient(0, -this.R * 0.08, 0, this.R * 0.08);
    if (gold) { g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#ffb340'); }
    else { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#9fd8ff'); }
    ctx.fillStyle = g;
    ctx.fillText(String(eng.combo), 0, 0);
    ctx.font = `800 ${Math.round(this.R * 0.038)}px ${FONT}`;
    ctx.strokeText('COMBO', 0, this.R * 0.095);
    ctx.fillStyle = gold ? '#ffd76a' : 'rgba(190, 225, 255, 0.95)';
    ctx.fillText('COMBO', 0, this.R * 0.095);
    ctx.restore();

    // 连击里程碑闪光
    if (now - this.comboBurstT < 0.5 && this.comboBurstT > -5) {
      const p = (now - this.comboBurstT) / 0.5;
      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.5;
      ctx.strokeStyle = '#ffe95c';
      ctx.lineWidth = this.R * 0.012;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.R * (0.2 + p * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawJudgement(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    const j = eng.getJudgement();
    if (!j) return;
    const age = now - j.time;
    if (age > 0.6 || age < -0.1) return;
    const info = JUDGE_TEXT[j.j];
    const p = Math.min(age / 0.12, 1);
    const scale = 1.35 - 0.35 * p;
    const alpha = age > 0.35 ? 1 - (age - 0.35) / 0.25 : 1;

    ctx.save();
    ctx.translate(this.cx, this.cy - this.R * 0.13);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const size = Math.round(this.R * (j.j === 'CP' ? 0.052 : 0.068));
    ctx.font = `900 ${size}px ${FONT}`;

    if (info.rainbow) {
      const g = ctx.createLinearGradient(-this.R * 0.3, 0, this.R * 0.3, 0);
      const hue = (now * 300) % 360;
      for (let i = 0; i <= 5; i++) {
        g.addColorStop(i / 5, `hsl(${(hue + i * 60) % 360}, 100%, 62%)`);
      }
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = info.color;
    }
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = this.R * 0.02;
    ctx.fillText(info.text, 0, 0);

    // FAST / SLOW 指示（官方设定：GREAT/GOOD 时显示快慢）
    if ((j.j === 'GREAT' || j.j === 'GOOD') && Math.abs(j.delta) > 0.016) {
      ctx.font = `900 ${Math.round(this.R * 0.036)}px ${FONT}`;
      ctx.fillStyle = j.delta < 0 ? '#5ec8ff' : '#ffb84d';
      ctx.fillText(j.delta < 0 ? 'FAST' : 'SLOW', 0, this.R * 0.075);
    }
    ctx.restore();
  }

  /* ---------------- HUD ---------------- */

  private drawHUD(now: number) {
    const ctx = this.ctx;
    const eng = this.engine;
    const chart = eng.chart as CompiledChart;

    // 顶部达成率
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `900 ${Math.round(this.R * 0.072)}px ${FONT}`;
    const ach = eng.achievement;
    const g = ctx.createLinearGradient(0, 0, 0, this.R * 0.1);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#7fd0ff');
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(`${ach.toFixed(4)}%`, this.cx, this.h * 0.028);
    ctx.font = `700 ${Math.round(this.R * 0.03)}px ${FONT}`;
    ctx.fillStyle = 'rgba(180, 215, 255, 0.85)';
    ctx.fillText('达成率 ACHIEVEMENT', this.cx, this.h * 0.028 + this.R * 0.082);

    // 左上：难度 + 曲目信息
    ctx.textAlign = 'left';
    const diffLabel = eng.difficulty === 'REMASTER' ? 'Re:MASTER' : eng.difficulty;
    const lv = chart.level;
    const lvText = lvTextOf(lv);
    ctx.font = `900 ${Math.round(this.R * 0.034)}px ${FONT}`;
    const pillTextW = ctx.measureText(`${diffLabel} ${lvText}`).width;
    ctx.fillStyle = this.diffColor(eng.difficulty);
    this.roundRect(this.w * 0.022, this.h * 0.03, pillTextW + this.R * 0.05, this.R * 0.052, this.R * 0.012);
    ctx.fill();
    ctx.fillStyle = eng.difficulty === 'ADVANCED' || eng.difficulty === 'REMASTER' ? '#3a2200' : '#fff';
    ctx.fillText(`${diffLabel} ${lvText}`, this.w * 0.022 + this.R * 0.025, this.h * 0.03 + this.R * 0.037);
    // 谱面类型徽章（STD 绿 / DX 黄）
    {
      const isDx = eng.chartType === 'DX';
      const bx = this.w * 0.022 + pillTextW + this.R * 0.07;
      const bw = this.R * 0.075;
      ctx.font = `900 ${Math.round(this.R * 0.028)}px ${FONT}`;
      ctx.fillStyle = isDx ? 'rgba(255,211,77,0.22)' : 'rgba(61,220,132,0.22)';
      this.roundRect(bx, this.h * 0.03, bw, this.R * 0.052, this.R * 0.012);
      ctx.fill();
      ctx.strokeStyle = isDx ? '#ffd34d' : '#3ddc84';
      ctx.lineWidth = 1.5;
      this.roundRect(bx, this.h * 0.03, bw, this.R * 0.052, this.R * 0.012);
      ctx.stroke();
      ctx.fillStyle = isDx ? '#ffd34d' : '#3ddc84';
      ctx.textAlign = 'center';
      ctx.fillText(isDx ? 'DX' : 'STD', bx + bw / 2, this.h * 0.03 + this.R * 0.037);
      ctx.textAlign = 'left';
    }
    ctx.fillStyle = 'rgba(140, 200, 255, 0.95)';
    ctx.font = `800 ${Math.round(this.R * 0.03)}px ${FONT}`;
    ctx.fillText('TRACK 01', this.w * 0.025, this.h * 0.03 + this.R * 0.085);
    ctx.font = `800 ${Math.round(this.R * 0.034)}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText(this.song.title, this.w * 0.025, this.h * 0.03 + this.R * 0.132);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `600 ${Math.round(this.R * 0.026)}px ${FONT}`;
    ctx.fillText(`${this.song.artist} / BPM ${this.song.bpm}`, this.w * 0.025, this.h * 0.03 + this.R * 0.172);

    // 右上：AUTO 标记 + DX分数（下移避开暂停按钮）
    ctx.textAlign = 'right';
    const rightY = this.h * 0.03 + (eng.autoPlay ? this.R * 0.052 : 0);
    if (eng.autoPlay) {
      const blink = 0.55 + 0.45 * Math.sin(now * 6);
      ctx.globalAlpha = blink;
      ctx.font = `900 ${Math.round(this.R * 0.042)}px ${FONT}`;
      ctx.fillStyle = '#ffe95c';
      ctx.fillText('AUTO PLAY', this.w * 0.975, this.h * 0.032);
      ctx.globalAlpha = 1;
    }
    ctx.font = `700 ${Math.round(this.R * 0.03)}px ${FONT}`;
    ctx.fillStyle = 'rgba(255, 220, 120, 0.9)';
    ctx.fillText(`DX ${eng.dxScore} / ${chart.totalJudgments * 3}`, this.w * 0.975, rightY + this.R * 0.09);
    ctx.restore();

    // 进度条
    const total = chart.duration;
    const p = Math.min(Math.max(now / Math.max(total, 1), 0), 1);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(this.w * 0.25, this.h * 0.965, this.w * 0.5, 4);
    const pg = ctx.createLinearGradient(this.w * 0.25, 0, this.w * 0.75, 0);
    pg.addColorStop(0, this.song.color);
    pg.addColorStop(1, '#ffffff');
    ctx.fillStyle = pg;
    ctx.fillRect(this.w * 0.25, this.h * 0.965, this.w * 0.5 * p, 4);
    ctx.restore();

    // READY / 曲终
    if (this.readyT > -5) {
      const age = now - this.readyT;
      if (age >= 0 && age < 2.2) {
        const alpha = age < 1.6 ? 1 : 1 - (age - 1.6) / 0.6;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const s = Math.min(age / 0.15, 1);
        ctx.translate(this.cx, this.cy);
        ctx.scale(0.7 + 0.3 * s, 0.7 + 0.3 * s);
        ctx.font = `900 ${Math.round(this.R * 0.1)}px ${FONT}`;
        const g2 = ctx.createLinearGradient(0, -this.R * 0.06, 0, this.R * 0.06);
        g2.addColorStop(0, '#fff');
        g2.addColorStop(1, '#ffd76a');
        ctx.fillStyle = g2;
        ctx.shadowColor = '#ffb340';
        ctx.shadowBlur = this.R * 0.05;
        ctx.fillText('ARE YOU READY?', 0, -this.R * 0.02);
        ctx.restore();
      }
    }
    if (this.endT > -5) {
      const age = now - this.endT;
      if (age >= 0) {
        ctx.save();
        const s = Math.min(age / 0.2, 1);
        ctx.globalAlpha = Math.min(1, s);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(this.cx, this.cy);
        ctx.scale(0.8 + 0.2 * s, 0.8 + 0.2 * s);
        ctx.font = `900 ${Math.round(this.R * 0.12)}px ${FONT}`;
        const g3 = ctx.createLinearGradient(0, -this.R * 0.08, 0, this.R * 0.08);
        g3.addColorStop(0, '#fff');
        g3.addColorStop(1, '#3ee6ff');
        ctx.fillStyle = g3;
        ctx.shadowColor = '#3ee6ff';
        ctx.shadowBlur = this.R * 0.06;
        ctx.fillText('TRACK COMPLETE', 0, 0);
        ctx.restore();
      }
    }
  }
}
