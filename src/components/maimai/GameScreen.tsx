'use client';

/**
 * 游戏画面 — Canvas 渲染 + 引擎 + 输入接线
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChartType, Difficulty, GameSettings, PlayResult, SongDef } from '@/lib/maimai/types';
import { generateChart } from '@/lib/maimai/chartgen';
import { MaimaiEngine } from '@/lib/maimai/engine';
import { PlayfieldRenderer } from '@/lib/maimai/renderer';
import { InputManager } from '@/lib/maimai/input';
import type { MusicSequencer } from '@/lib/audio/sequencer';
import { SFX } from '@/lib/audio/instruments';
import { KEY_HELP } from '@/lib/maimai/input';

export default function GameScreen({
  song, difficulty, chartType, settings, seq, onFinish, onQuit, onRetry,
}: {
  song: SongDef;
  difficulty: Difficulty;
  chartType: ChartType;
  settings: GameSettings;
  seq: MusicSequencer;
  onFinish: (r: PlayResult) => void;
  onQuit: () => void;
  onRetry: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const engineRef = useRef<MaimaiEngine | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 谱面 + 引擎
    const chart = generateChart(song, difficulty, chartType);
    const engine = new MaimaiEngine({ song, chart, difficulty, chartType, settings, sequencer: seq });
    engineRef.current = engine;
    const renderer = new PlayfieldRenderer(canvas, engine, song);
    // 调试句柄（开发期自检用）
    (window as unknown as { __mmEngine?: MaimaiEngine }).__mmEngine = engine;

    // 尺寸
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderer.resize(w, h, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // 输入
    const input = new InputManager({
      canvas,
      onPress: (pos, t) => { if (!pausedRef.current) engine.press(pos, t); },
      onRelease: (pos, t) => { if (!pausedRef.current) engine.release(pos, t); },
      getAudioTime: () => seq.audioTime,
      geometry: () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h * 0.545;
        const R = Math.min(w * 0.465, h * 0.44);
        return { cx, cy, ringInner: R * 0.775, ringOuter: R * 0.985, touchR: R * 0.42 };
      },
    });
    input.setEnabled(true);

    // 开始音乐（带 2.2 秒 READY 留白）
    seq.setStartDelay(2.2);
    seq.playSong(song, 0);
    if (seq.I) SFX.ready(seq.I, seq.audioTime + 1.0);

    // 主循环
    let raf = 0;
    let lastTs = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(ts - lastTs, 100);
      lastTs = ts;
      if (!pausedRef.current) {
        engine.update(dt);
        renderer.render(engine.songTime);
        if (engine.finished) {
          engine.finished = false;
          const result = engine.buildResult();
          if (seq.I) SFX.clear(seq.I, seq.audioTime);
          setTimeout(() => onFinish(result), 200);
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const hintTimer = setTimeout(() => setHintVisible(false), 5000);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      input.setEnabled(false);
      seq.stop();
      clearTimeout(hintTimer);
      delete (window as unknown as { __mmEngine?: MaimaiEngine }).__mmEngine;
    };
     
  }, []);

  /* ---------- 暂停 ---------- */
  const togglePause = useCallback((v?: boolean) => {
    const next = v ?? !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (next) seq.pause();
    else seq.resume();
  }, [seq]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  return (
    <div ref={wrapRef} className="fixed inset-0 bg-[#060a1c]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* 键位提示（开场淡出） */}
      {hintVisible && !settings.autoPlay && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-700"
          style={{ opacity: 0.95 }}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {KEY_HELP.map(({ pos, key }) => (
              <div key={pos} className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-sm font-black">
                  {key}
                </div>
                <div className="text-[10px] text-white/50">{pos + 1}号</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 暂停按钮（移动端） */}
      <button
        onClick={() => togglePause()}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-lg cursor-pointer"
        aria-label="暂停"
      >
        ❚❚
      </button>

      {/* 暂停菜单 */}
      {paused && (
        <div className="absolute inset-0 z-30 bg-[#060a1c]/85 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-4xl font-black tracking-widest text-cyan-200">PAUSED</div>
            <div className="text-white/60 text-sm">乐曲已暂停 · 游戏中</div>
            <div className="flex flex-col gap-3 min-w-[240px]">
              <button
                onClick={() => togglePause(false)}
                className="px-8 py-3 rounded-xl bg-cyan-400 text-[#062033] font-black text-lg hover:scale-105 transition-transform cursor-pointer"
              >
                ▶ 继续游戏
              </button>
              <button
                onClick={onRetry}
                className="px-8 py-3 rounded-xl bg-pink-500 text-white font-black text-lg hover:scale-105 transition-transform cursor-pointer"
              >
                ↻ 重新开始
              </button>
              <button
                onClick={onQuit}
                className="px-8 py-3 rounded-xl bg-white/10 text-white/80 font-bold hover:bg-white/20 transition-colors cursor-pointer"
              >
                ✕ 放弃并返回选曲
              </button>
            </div>
            <div className="text-white/35 text-xs">ESC 继续</div>
          </div>
        </div>
      )}
    </div>
  );
}
