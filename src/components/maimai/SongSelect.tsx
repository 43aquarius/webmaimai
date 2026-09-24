'use client';

/**
 * 选曲界面 — DX 风格封面转盘 / 谱面类型(STD/DX) / 难度选择 / 试听
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChartType, Difficulty, SongDef } from '@/lib/maimai/types';
import { CHART_TYPE_INFO, DIFF_INFO, DIFFICULTIES, chartTypesOf, chartsOf, lvText } from '@/lib/maimai/types';
import { generateChart } from '@/lib/maimai/chartgen';
import { getBest, totalRating } from '@/lib/maimai/storage';
import { fmtAchievement, rankColor } from '@/lib/maimai/scoring';
import type { MusicSequencer } from '@/lib/audio/sequencer';
import { SFX } from '@/lib/audio/instruments';

export default function SongSelect({
  seq, songs, genres, genre, onGenre,
  onSong, onDifficulty, onChartType, onPlay, onBack, onSettings, onHowto,
  selectedSong, selectedDifficulty, selectedChartType, unlockAudio,
}: {
  seq: MusicSequencer;
  songs: SongDef[];
  genres: string[];
  genre: string;
  onGenre: (g: string) => void;
  onSong: (s: SongDef) => void;
  onDifficulty: (d: Difficulty) => void;
  onChartType: (t: ChartType) => void;
  onPlay: (s: SongDef, d: Difficulty, t: ChartType) => void;
  onBack: () => void;
  onSettings: () => void;
  onHowto: () => void;
  selectedSong: SongDef;
  selectedDifficulty: Difficulty;
  selectedChartType: ChartType;
  unlockAudio: () => void;
}) {
  const [rating, setRating] = useState(0);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setRating(totalRating()), 0);
    return () => clearTimeout(t);
  }, []);

  const focusIdx = Math.max(0, songs.findIndex((s) => s.id === selectedSong.id));
  const focused = songs[focusIdx] ?? songs[0];

  /* 谱面类型守恒：切歌后若当前类型不可用则切到可用类型 */
  const availTypes = useMemo(() => chartTypesOf(focused), [focused]);
  const chartType: ChartType = availTypes.includes(selectedChartType) ? selectedChartType : availTypes[0];
  const charts = useMemo(() => chartsOf(focused, chartType), [focused, chartType]);

  const chartInfo = useMemo<{ total: number } | null>(() => {
    try {
      const c = generateChart(focused, selectedDifficulty, chartType);
      return { total: c.counts.total };
    } catch {
      return null;
    }
  }, [focused, selectedDifficulty, chartType]);

  useEffect(() => {
    if (!focused) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      unlockAudio();
      seq.playPreview(focused);
    }, 240);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [focused?.id]);

  const move = useCallback((d: number) => {
    const next = (focusIdx + d + songs.length) % songs.length;
    if (seq.I) SFX.uiMove(seq.I, seq.audioTime);
    onSong(songs[next]);
  }, [focusIdx, songs, seq, onSong]);

  const moveDiff = useCallback((d: number) => {
    const avail = DIFFICULTIES.filter((x) => charts[x] !== undefined);
    const cur = avail.indexOf(selectedDifficulty);
    const next = avail[(cur + d + avail.length) % avail.length];
    if (seq.I) SFX.uiMove(seq.I, seq.audioTime);
    onDifficulty(next);
  }, [charts, selectedDifficulty, seq, onDifficulty]);

  const switchType = useCallback((t: ChartType) => {
    if (seq.I) SFX.uiMove(seq.I, seq.audioTime);
    onChartType(t);
  }, [seq, onChartType]);

  const play = useCallback(() => {
    onPlay(focused, selectedDifficulty, chartType);
  }, [focused, selectedDifficulty, chartType, onPlay]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft': e.preventDefault(); move(-1); break;
        case 'ArrowRight': e.preventDefault(); move(1); break;
        case 'ArrowUp': e.preventDefault(); moveDiff(-1); break;
        case 'ArrowDown': e.preventDefault(); moveDiff(1); break;
        case 'Tab': e.preventDefault(); switchType(availTypes[(availTypes.indexOf(chartType) + 1) % availTypes.length]); break;
        case 'Enter': e.preventDefault(); play(); break;
        case 'Escape': e.preventDefault(); onBack(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, moveDiff, play, onBack, switchType, availTypes, chartType]);

  const availDiffs = useMemo(
    () => DIFFICULTIES.filter((d) => charts[d] !== undefined),
    [charts],
  );

  return (
    <div className="fixed inset-0 overflow-hidden" tabIndex={-1}>
      {/* 背景（歌曲主题色） */}
      <AnimatePresence mode="wait">
        <motion.div
          key={focused.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${focused.jacket}')`, filter: 'blur(60px) brightness(0.35) saturate(1.4)', transform: 'scale(1.4)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060a1c]/60 via-[#060a1c]/30 to-[#060a1c]/95" />
        </motion.div>
      </AnimatePresence>

      {/* 顶栏：分类 Tab */}
      <div className="relative z-10 flex items-center gap-1.5 md:gap-2 px-3 md:px-8 pt-3 md:pt-4 flex-wrap">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => { if (seq.I) SFX.uiMove(seq.I, seq.audioTime); onGenre(g); }}
            className={`px-2.5 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
              genre === g
                ? 'bg-cyan-400 text-[#062033] shadow-[0_0_18px_rgba(62,230,255,0.5)]'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {g}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/40">
            <span className="text-amber-300 text-sm font-black">★ DX RATING</span>
            <span className="text-white font-black text-lg">{rating}</span>
          </div>
          <button onClick={onHowto} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold cursor-pointer">? 说明</button>
          <button onClick={onSettings} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold cursor-pointer">⚙ 设置</button>
        </div>
      </div>

      {/* 主体三栏 */}
      <div className="relative z-10 h-[calc(100%-210px)] flex items-center justify-center gap-4 md:gap-10 px-4 md:px-10 pt-2">
        {/* 左：歌曲信息 */}
        <div className="hidden lg:flex flex-col w-64 xl:w-72">
          <div className="text-cyan-300/80 text-xs tracking-[0.3em] font-bold mb-1">NOW SELECTING</div>
          <h2 className="text-2xl xl:text-3xl font-black leading-tight" style={{ color: focused.color }}>
            {focused.title}
          </h2>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/50">艺术家</span>
              <span className="font-bold text-right max-w-[190px] truncate">{focused.artist}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/50">分类</span>
              <span className="font-bold">{focused.category}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/50">版本</span>
              <span className="font-bold">{focused.version}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/50">BPM</span>
              <span className="font-bold">{focused.bpm}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/50">类型</span>
              <span className="font-bold">{focused.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">音符数</span>
              <span className="font-bold">{chartInfo ? `${chartInfo.total}` : '…'}</span>
            </div>
          </div>

          {/* 各难度最佳成绩 */}
          <div className="mt-4 space-y-1.5">
            <div className="text-white/40 text-xs tracking-widest">
              最佳成绩 · {chartType === 'DX' ? 'DX 谱面' : 'STD 谱面'}
            </div>
            {availDiffs.map((d) => {
              const best = getBest(focused.id, d, chartType);
              return (
                <div key={d} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-24 text-center py-0.5 rounded text-xs font-black"
                    style={{ background: DIFF_INFO[d].color, color: d === 'REMASTER' ? '#7a1fa8' : '#fff' }}
                  >
                    {DIFF_INFO[d].label}
                  </span>
                  {best ? (
                    <>
                      <span className="font-black" style={{ color: rankColor(best.rank) }}>{best.rank}</span>
                      <span className="text-white/85 font-bold tabular-nums">{fmtAchievement(best.achievement)}</span>
                      {best.isAP && <span className="text-[10px] px-1 rounded bg-fuchsia-500/40 font-black">AP</span>}
                      {best.isFC && !best.isAP && <span className="text-[10px] px-1 rounded bg-amber-400/40 text-black font-black">FC</span>}
                    </>
                  ) : (
                    <span className="text-white/30">— 未游玩</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 中：封面转盘 */}
        <div className="relative flex-1 max-w-xl h-full flex items-center justify-center">
          <button
            aria-label="上一首"
            className="absolute left-0 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-2xl cursor-pointer"
            onClick={() => move(-1)}
          >
            ‹
          </button>
          <button
            aria-label="下一首"
            className="absolute right-0 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-2xl cursor-pointer"
            onClick={() => move(1)}
          >
            ›
          </button>

          <div className="relative w-full h-[75%] flex items-center justify-center">
            {songs.map((s, i) => {
              const offset = i - focusIdx;
              const abs = Math.abs(offset);
              if (abs > 2) return null;
              const isFocus = offset === 0;
              return (
                <motion.button
                  key={s.id}
                  className="absolute cursor-pointer"
                  style={{ zIndex: 10 - abs }}
                  animate={{
                    x: `${offset * 36}%`,
                    scale: isFocus ? 1 : 0.62,
                    rotateY: offset * -28,
                    opacity: abs > 1 ? 0.35 : 1,
                    filter: isFocus ? 'brightness(1)' : 'brightness(0.55)',
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  onClick={() => {
                    if (!isFocus) { move(offset); }
                  }}
                >
                  <div
                    className={`relative aspect-square rounded-2xl overflow-hidden border-4 ${
                      isFocus ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.35)]' : 'border-white/30'
                    }`}
                    style={{ width: 'min(38vh, 30vw)' }}
                  >
                    <img src={s.jacket} alt={s.title} className="w-full h-full object-cover" draggable={false} />
                    {isFocus && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8 text-left">
                        <div className="font-black text-lg leading-tight">{s.title}</div>
                        <div className="text-white/70 text-xs truncate">{s.artist} · {s.version}</div>
                      </div>
                    )}
                  </div>
                  {/* 定数徽章 */}
                  {isFocus && (
                    <div
                      className="absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-lg"
                      style={{ background: DIFF_INFO[selectedDifficulty].color, color: selectedDifficulty === 'REMASTER' ? '#7a1fa8' : '#fff' }}
                    >
                      {lvText(charts[selectedDifficulty] ?? 0)}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 右：操作提示 */}
        <div className="hidden lg:flex flex-col w-56 gap-3 text-sm">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="text-white/40 text-xs tracking-widest mb-1">操作</div>
            <div className="flex items-center gap-2"><kbd className="kbd">←</kbd><kbd className="kbd">→</kbd><span className="text-white/70">切歌</span></div>
            <div className="flex items-center gap-2"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd><span className="text-white/70">难度</span></div>
            <div className="flex items-center gap-2"><kbd className="kbd">Tab</kbd><span className="text-white/70">STD/DX</span></div>
            <div className="flex items-center gap-2"><kbd className="kbd">Enter</kbd><span className="text-white/70">决定</span></div>
            <div className="flex items-center gap-2"><kbd className="kbd">Esc</kbd><span className="text-white/70">返回</span></div>
          </div>
          <button
            onClick={play}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-400 text-[#081226] font-black text-xl tracking-widest
                       hover:scale-[1.03] active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,79,160,0.4)] cursor-pointer"
          >
            ▶ 开始游玩
          </button>
        </div>
      </div>

      {/* 底部：谱面类型 + 难度选择条 */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-4 md:px-8">
        {/* STD / DX 切换 */}
        {availTypes.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-2.5">
            {availTypes.map((t) => {
              const active = t === chartType;
              const info = CHART_TYPE_INFO[t];
              return (
                <button
                  key={t}
                  onClick={() => switchType(t)}
                  className={`relative px-6 py-1.5 rounded-full font-black text-sm tracking-widest transition-all cursor-pointer border-2 ${
                    active ? 'scale-105' : 'opacity-50 hover:opacity-90'
                  }`}
                  style={{
                    background: active ? info.bg : 'rgba(255,255,255,0.04)',
                    borderColor: info.color,
                    color: info.color,
                    boxShadow: active ? `0 0 18px ${info.color}55` : 'none',
                  }}
                >
                  {t === 'DX' ? '★ DX' : 'STD'}
                  <span className="ml-2 text-[10px] opacity-80">{info.label}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          {availDiffs.map((d) => {
            const lv = charts[d] ?? 0;
            const active = d === selectedDifficulty;
            return (
              <button
                key={d}
                onClick={() => { if (seq.I) SFX.uiMove(seq.I, seq.audioTime); onDifficulty(d); }}
                className={`relative px-3 md:px-5 py-2.5 rounded-xl font-black transition-all cursor-pointer overflow-hidden ${
                  active ? 'scale-110 shadow-[0_0_25px_rgba(255,255,255,0.3)]' : 'opacity-60 hover:opacity-90 scale-100'
                }`}
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${DIFF_INFO[d].color}, ${DIFF_INFO[d].color2})`
                    : 'rgba(255,255,255,0.08)',
                  color: active ? (d === 'REMASTER' || d === 'ADVANCED' ? '#3a2200' : '#fff') : 'rgba(255,255,255,0.75)',
                }}
              >
                <div className="text-[10px] md:text-xs tracking-wider leading-none mb-1">{DIFF_INFO[d].label}</div>
                <div className="text-xl md:text-2xl leading-none">{lvText(lv)}</div>
                {active && (
                  <div className="absolute inset-0 pointer-events-none" style={{ animation: 'mm-shine 1.8s infinite' }}>
                    <div className="absolute inset-y-0 w-1/3 bg-white/25 blur-md" />
                  </div>
                )}
              </button>
            );
          })}
          <button
            onClick={play}
            className="lg:hidden ml-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-400 text-[#081226] font-black text-lg cursor-pointer active:scale-95 transition-transform"
          >
            ▶ GO
          </button>
        </div>
        <div className="mt-2 text-center text-white/35 text-xs tracking-widest">
          ← → 选择乐曲 · ↑ ↓ 选择难度 {availTypes.length > 1 && '· TAB 切换 STD/DX'} · ENTER 决定 · ESC 返回
        </div>
      </div>

    </div>
  );
}
