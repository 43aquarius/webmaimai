/**
 * Web Audio 合成乐器库 — 为 maimai Web 提供全部声音
 * 所有乐器函数：在 ctx 时间 t 精确调度，节点自动回收
 */

export interface InstCtx {
  ctx: AudioContext;
  musicBus: GainNode;   // 音乐总线上有 sidechain duck
  dryBus: GainNode;     // 直达
  delayBus: GainNode;   // 延迟发送
  sfxBus: GainNode;
  registry: Set<AudioScheduledSourceNode>;  // 用于停止时清理
  noiseBuf: AudioBuffer;
}

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function makeNoise(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // 白噪声 + 轻微低通去毛刺
    const w = Math.random() * 2 - 1;
    last = last * 0.15 + w * 0.85;
    d[i] = last;
  }
  return buf;
}

export function createInstCtx(ctx: AudioContext): InstCtx {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 18;
  comp.ratio.value = 5;
  comp.attack.value = 0.004;
  comp.release.value = 0.16;
  comp.connect(master);
  master.connect(ctx.destination);

  const musicBus = ctx.createGain();   // 被侧链 duck
  const dryBus = ctx.createGain();
  const sfxBus = ctx.createGain();
  musicBus.gain.value = 1;
  dryBus.gain.value = 1;
  sfxBus.gain.value = 1;
  musicBus.connect(comp);
  dryBus.connect(comp);
  sfxBus.connect(comp);

  // 延迟总线（附点8分回声）
  const delayBus = ctx.createGain();
  const dl = ctx.createDelay(1.5);
  dl.delayTime.value = 0.36;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const dlp = ctx.createBiquadFilter();
  dlp.type = 'lowpass';
  dlp.frequency.value = 2600;
  delayBus.connect(dl);
  dl.connect(dlp);
  dlp.connect(fb);
  fb.connect(dl);
  dlp.connect(musicBus);
  const delayLvl = ctx.createGain();
  delayLvl.gain.value = 0.5;
  dlp.connect(delayLvl);
  delayLvl.connect(comp);

  return { ctx, musicBus, dryBus, delayBus, sfxBus, registry: new Set(), noiseBuf: makeNoise(ctx) };
}

function reg(I: InstCtx, node: AudioScheduledSourceNode, t0: number, t1: number) {
  I.registry.add(node);
  node.start(t0);
  node.stop(t1 + 0.05);
  node.onended = () => I.registry.delete(node);
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number, sustain = 0, release = 0.05) {
  const v = g.gain;
  v.setValueAtTime(0.0001, t);
  v.linearRampToValueAtTime(peak, t + attack);
  if (sustain > 0) {
    v.exponentialRampToValueAtTime(Math.max(peak * sustain, 0.001), t + attack + decay);
    v.setValueAtTime(Math.max(peak * sustain, 0.001), t + attack + decay + 0.0001);
  } else {
    v.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
}

function noiseSrc(I: InstCtx, t: number, dur: number) {
  const s = I.ctx.createBufferSource();
  s.buffer = I.noiseBuf;
  s.loop = true;
  s.playbackRate.value = 0.9 + Math.random() * 0.2;
  reg(I, s, t, t + dur);
  return s;
}

/* ================= 鼓组 ================= */

export function kick(I: InstCtx, t: number, vel = 1) {
  const o = I.ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(170, t);
  o.frequency.exponentialRampToValueAtTime(44, t + 0.085);
  const g = I.ctx.createGain();
  env(g, t, 1.05 * vel, 0.002, 0.24, 0, 0);
  o.connect(g);
  g.connect(I.dryBus);
  reg(I, o, t, t + 0.3);
  // 起振 click
  const c = noiseSrc(I, t, 0.012);
  const cf = I.ctx.createBiquadFilter();
  cf.type = 'bandpass';
  cf.frequency.value = 3400;
  const cg = I.ctx.createGain();
  env(cg, t, 0.35 * vel, 0.001, 0.012, 0, 0);
  c.connect(cf); cf.connect(cg); cg.connect(I.dryBus);
  // 侧链 duck（和弦总线呼吸感）
  const duck = I.musicBus.gain;
  duck.setValueAtTime(0.32, t);
  duck.linearRampToValueAtTime(1, t + 0.22);
}

export function snare(I: InstCtx, t: number, vel = 1) {
  const n = noiseSrc(I, t, 0.2);
  const bp = I.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1900;
  bp.Q.value = 0.8;
  const g = I.ctx.createGain();
  env(g, t, 0.5 * vel, 0.001, 0.16, 0, 0);
  n.connect(bp); bp.connect(g); g.connect(I.dryBus);
  const o = I.ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(210, t);
  o.frequency.exponentialRampToValueAtTime(150, t + 0.07);
  const og = I.ctx.createGain();
  env(og, t, 0.35 * vel, 0.001, 0.08, 0, 0);
  o.connect(og); og.connect(I.dryBus);
  reg(I, o, t, t + 0.1);
}

export function clap(I: InstCtx, t: number, vel = 1) {
  for (let i = 0; i < 3; i++) {
    const tt = t + i * 0.011;
    const n = noiseSrc(I, tt, 0.1);
    const bp = I.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1250;
    bp.Q.value = 1.4;
    const g = I.ctx.createGain();
    env(g, tt, (i === 2 ? 0.42 : 0.25) * vel, 0.001, i === 2 ? 0.11 : 0.02, 0, 0);
    n.connect(bp); bp.connect(g); g.connect(I.dryBus);
  }
}

export function hat(I: InstCtx, t: number, vel = 0.7, open = false) {
  const dur = open ? 0.24 : 0.045;
  const n = noiseSrc(I, t, dur + 0.05);
  const hp = I.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 8200;
  const g = I.ctx.createGain();
  env(g, t, 0.24 * vel, 0.001, dur, 0, 0);
  n.connect(hp); hp.connect(g); g.connect(I.dryBus);
}

export function crash(I: InstCtx, t: number, vel = 0.9) {
  const n = noiseSrc(I, t, 1.6);
  const hp = I.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 4800;
  const g = I.ctx.createGain();
  env(g, t, 0.34 * vel, 0.002, 1.5, 0, 0);
  n.connect(hp); hp.connect(g); g.connect(I.dryBus);
  g.connect(I.delayBus);
}

export function impact(I: InstCtx, t: number, vel = 1) {
  const o = I.ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
  const g = I.ctx.createGain();
  env(g, t, 0.9 * vel, 0.002, 0.6, 0, 0);
  o.connect(g); g.connect(I.dryBus);
  reg(I, o, t, t + 0.7);
  const n = noiseSrc(I, t, 0.5);
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(6000, t);
  lp.frequency.exponentialRampToValueAtTime(300, t + 0.4);
  const ng = I.ctx.createGain();
  env(ng, t, 0.4 * vel, 0.001, 0.45, 0, 0);
  n.connect(lp); lp.connect(ng); ng.connect(I.dryBus);
}

export function riser(I: InstCtx, t: number, len: number, vel = 1) {
  const n = noiseSrc(I, t, len + 0.1);
  const bp = I.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(260, t);
  bp.frequency.exponentialRampToValueAtTime(7200, t + len);
  const g = I.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32 * vel, t + len * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.03);
  n.connect(bp); bp.connect(g); g.connect(I.dryBus);
  const o = I.ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(880, t + len);
  const og = I.ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.06 * vel, t + len * 0.9);
  og.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.03);
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3000;
  o.connect(lp); lp.connect(og); og.connect(I.dryBus);
  reg(I, o, t, t + len + 0.1);
}

/* ================= 旋律乐器 ================= */

/** 贝斯：锯齿+方波，滤波包络 */
export function bass(I: InstCtx, t: number, midi: number, len: number, vel = 1) {
  const f = mtof(midi);
  const dur = len;
  const o1 = I.ctx.createOscillator();
  o1.type = 'sawtooth';
  o1.frequency.value = f;
  const o2 = I.ctx.createOscillator();
  o2.type = 'square';
  o2.frequency.value = f / 2;
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 6;
  lp.frequency.setValueAtTime(Math.min(f * 5, 900), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.4, 90), t + 0.12);
  lp.frequency.setTargetAtTime(Math.max(f * 1.2, 70), t + 0.12, 0.1);
  const g = I.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.34 * vel, t + 0.006);
  g.gain.setValueAtTime(0.34 * vel, t + Math.max(dur - 0.05, 0.02));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.03);
  const g2 = I.ctx.createGain();
  g2.gain.value = 0.5;
  o1.connect(lp);
  o2.connect(g2); g2.connect(lp);
  lp.connect(g); g.connect(I.dryBus);
  reg(I, o1, t, t + dur + 0.1);
  reg(I, o2, t, t + dur + 0.1);
}

/** 超锯和声（sidechain 由 kick 触发） */
export function chord(I: InstCtx, t: number, midis: number[], len: number, vel = 1, pad = false) {
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(pad ? 900 : 2400, t);
  lp.Q.value = 0.6;
  const g = I.ctx.createGain();
  const peak = (pad ? 0.14 : 0.11) * vel;
  if (pad) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.18);
    g.gain.setValueAtTime(peak, t + len - 0.12);
    g.gain.linearRampToValueAtTime(0.0001, t + len + 0.06);
  } else {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(peak * 0.55, t + len * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + len + 0.03);
  }
  lp.connect(g);
  g.connect(I.musicBus);
  for (const m of midis) {
    for (const det of [-9, 0, 9]) {
      const o = I.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = mtof(m);
      o.detune.value = det;
      const og = I.ctx.createGain();
      og.gain.value = 1 / (midis.length * 3);
      o.connect(og); og.connect(lp);
      reg(I, o, t, t + len + 0.15);
    }
  }
}

/** 主音lead：锯齿+脉冲感，颤音，进延迟 */
export function lead(I: InstCtx, t: number, midi: number, len: number, vel = 1) {
  const f = mtof(midi);
  const o1 = I.ctx.createOscillator();
  o1.type = 'sawtooth';
  o1.frequency.value = f;
  const o2 = I.ctx.createOscillator();
  o2.type = 'square';
  o2.frequency.value = f;
  o2.detune.value = 7;
  const lfo = I.ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 5.4;
  const lfoG = I.ctx.createGain();
  lfoG.gain.setValueAtTime(0, t);
  lfoG.gain.linearRampToValueAtTime(7, t + 0.18);
  lfo.connect(lfoG);
  lfoG.connect(o1.detune);
  lfoG.connect(o2.detune);
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 2;
  lp.frequency.setValueAtTime(3400, t);
  lp.frequency.exponentialRampToValueAtTime(2000, t + len * 0.8);
  const g = I.ctx.createGain();
  const peak = 0.26 * vel;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.setValueAtTime(peak, t + Math.max(len - 0.06, 0.03));
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
  const o2g = I.ctx.createGain();
  o2g.gain.value = 0.4;
  o1.connect(lp);
  o2.connect(o2g); o2g.connect(lp);
  lp.connect(g);
  g.connect(I.musicBus);
  const send = I.ctx.createGain();
  send.gain.value = 0.5;
  g.connect(send); send.connect(I.delayBus);
  reg(I, o1, t, t + len + 0.1);
  reg(I, o2, t, t + len + 0.1);
  reg(I, lfo, t, t + len + 0.1);
}

/** 拨弦pluck：三角+锯齿快衰减 */
export function pluck(I: InstCtx, t: number, midi: number, len: number, vel = 1) {
  const f = mtof(midi);
  const o = I.ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = f;
  const o2 = I.ctx.createOscillator();
  o2.type = 'sawtooth';
  o2.frequency.value = f;
  const o2g = I.ctx.createGain();
  o2g.gain.value = 0.35;
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(4200, t);
  lp.frequency.exponentialRampToValueAtTime(700, t + Math.min(len, 0.3));
  const g = I.ctx.createGain();
  const dur = Math.min(len + 0.05, 0.4);
  env(g, t, 0.2 * vel, 0.004, dur, 0, 0);
  o.connect(lp);
  o2.connect(o2g); o2g.connect(lp);
  lp.connect(g);
  g.connect(I.musicBus);
  const send = I.ctx.createGain();
  send.gain.value = 0.35;
  g.connect(send); send.connect(I.delayBus);
  reg(I, o, t, t + dur + 0.1);
  reg(I, o2, t, t + dur + 0.1);
}

/** 琶音arp：明亮短促 */
export function arp(I: InstCtx, t: number, midi: number, vel = 1) {
  const f = mtof(midi);
  const o = I.ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = f;
  const lp = I.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(5200, t);
  lp.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
  const g = I.ctx.createGain();
  env(g, t, 0.12 * vel, 0.003, 0.11, 0, 0);
  o.connect(lp); lp.connect(g);
  g.connect(I.musicBus);
  const send = I.ctx.createGain();
  send.gain.value = 0.3;
  g.connect(send); send.connect(I.delayBus);
  reg(I, o, t, t + 0.15);
}

/* ================= 音效（SFX） ================= */

function blip(I: InstCtx, t: number, f0: number, f1: number, dur: number, vol: number, type: OscillatorType = 'square') {
  const o = I.ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  const g = I.ctx.createGain();
  env(g, t, vol, 0.002, dur, 0, 0);
  o.connect(g); g.connect(I.sfxBus);
  reg(I, o, t, t + dur + 0.05);
}

export const SFX = {
  /** 打击音：maimai 式清脆"嗒" */
  tap(I: InstCtx, t: number) {
    blip(I, t, 1900, 700, 0.035, 0.32, 'square');
    const n = noiseSrc(I, t, 0.02);
    const bp = I.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600;
    const g = I.ctx.createGain();
    env(g, t, 0.2, 0.001, 0.018, 0, 0);
    n.connect(bp); bp.connect(g); g.connect(I.sfxBus);
  },
  /** CRITICAL 加成亮音 */
  crit(I: InstCtx, t: number) {
    SFX.tap(I, t);
    blip(I, t + 0.004, 2600, 3900, 0.06, 0.16, 'sine');
    blip(I, t + 0.004, 3900, 5200, 0.05, 0.1, 'sine');
  },
  /** BREAK 碎裂金属音 */
  breakHit(I: InstCtx, t: number) {
    blip(I, t, 2400, 300, 0.12, 0.3, 'square');
    const n = noiseSrc(I, t, 0.16);
    const bp = I.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3400, t);
    bp.frequency.exponentialRampToValueAtTime(700, t + 0.14);
    bp.Q.value = 2;
    const g = I.ctx.createGain();
    env(g, t, 0.34, 0.001, 0.15, 0, 0);
    n.connect(bp); bp.connect(g); g.connect(I.sfxBus);
    blip(I, t, 520, 260, 0.09, 0.14, 'triangle');
  },
  /** TOUCH 软pop */
  touch(I: InstCtx, t: number) {
    blip(I, t, 900, 1500, 0.05, 0.18, 'sine');
  },
  miss(I: InstCtx, t: number) {
    blip(I, t, 220, 90, 0.12, 0.12, 'triangle');
  },
  holdGrab(I: InstCtx, t: number) {
    blip(I, t, 800, 1200, 0.06, 0.14, 'sine');
  },
  slideStart(I: InstCtx, t: number) {
    const n = noiseSrc(I, t, 0.3);
    const bp = I.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(800, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.26);
    bp.Q.value = 2;
    const g = I.ctx.createGain();
    env(g, t, 0.13, 0.02, 0.26, 0, 0);
    n.connect(bp); bp.connect(g); g.connect(I.sfxBus);
  },
  slideEnd(I: InstCtx, t: number) {
    blip(I, t, 1600, 2400, 0.08, 0.22, 'square');
    blip(I, t + 0.01, 2400, 3200, 0.06, 0.12, 'sine');
  },
  uiMove(I: InstCtx, t: number) { blip(I, t, 620, 780, 0.04, 0.14, 'square'); },
  uiSelect(I: InstCtx, t: number) {
    blip(I, t, 700, 900, 0.05, 0.16, 'square');
    blip(I, t + 0.06, 1050, 1250, 0.09, 0.16, 'square');
  },
  uiBack(I: InstCtx, t: number) { blip(I, t, 500, 320, 0.08, 0.14, 'square'); },
  songDecide(I: InstCtx, t: number) {
    const notes = [76, 81, 85, 88];
    notes.forEach((m, i) => {
      const o = I.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = mtof(m);
      const g = I.ctx.createGain();
      env(g, t + i * 0.09, 0.13, 0.005, 0.22, 0, 0);
      o.connect(g); g.connect(I.sfxBus);
      reg(I, o, t + i * 0.09, t + i * 0.09 + 0.3);
    });
  },
  ready(I: InstCtx, t: number) {
    blip(I, t, 880, 880, 0.09, 0.15, 'square');
    blip(I, t + 0.5, 1174, 1174, 0.2, 0.17, 'square');
  },
  clear(I: InstCtx, t: number) {
    const notes = [72, 76, 79, 84];
    notes.forEach((m, i) => {
      const o = I.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = mtof(m);
      const g = I.ctx.createGain();
      env(g, t + i * 0.11, 0.15, 0.005, 0.3, 0, 0);
      o.connect(g); g.connect(I.sfxBus);
      const send = I.ctx.createGain();
      send.gain.value = 0.4;
      g.connect(send); send.connect(I.delayBus);
      reg(I, o, t + i * 0.11, t + i * 0.11 + 0.4);
    });
  },
  coin(I: InstCtx, t: number) {
    blip(I, t, 988, 988, 0.08, 0.15, 'square');
    blip(I, t + 0.08, 1319, 1319, 0.25, 0.15, 'square');
  },
};
