'use client';

/**
 * 结算画面 — DX 风格达成率演出
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlayResult, SongDef } from '@/lib/maimai/types';
import { DIFF_INFO } from '@/lib/maimai/types';
import { rankColor, fmtAchievement } from '@/lib/maimai/scoring';
import { recordResult, totalRating } from '@/lib/maimai/storage';

function useCountUp(target: number, durationMs: number, delayMs = 0) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / durationMs, 1);
        // easeOutQuart
        const e = 1 - Math.pow(1 - p, 4);
        setValue(target * e);
        if (p < 1) raf = requestAnimationFrame(step);
        else setValue(target);
      };
      raf = requestAnimationFrame(step);
    }, delayMs);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); startRef.current = null; };
  }, [target, durationMs, delayMs]);
  return value;
}

export default function ResultsScreen({
  result, song, onRetry, onSelect,
}: {
  result: PlayResult;
  song: SongDef;
  onRetry: () => void;
  onSelect: () => void;
}) {
  const [showRank, setShowRank] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [ratingTotal, setRatingTotal] = useState(0);
  const rankRef = useRef<HTMLDivElement>(null);

  const ach = useCountUp(result.achievement, 2100, 350);
  const rainbow = result.achievement >= 100.5;

  useEffect(() => {
    const t0 = setTimeout(() => {
      const { isNewBest } = recordResult(result);
      setNewRecord(isNewBest && !result.autoplay);
      setRatingTotal(totalRating());
    }, 0);
    const t1 = setTimeout(() => setShowRank(true), 2500);
    const t2 = setTimeout(() => setShowStats(true), 3100);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const diffInfo = DIFF_INFO[result.difficulty];
  const judgeRows = useMemo(() => ([
    { label: 'CRITICAL PERFECT', value: result.counts.CP, color: '#ffe95c' },
    { label: 'PERFECT', value: result.counts.PERFECT, color: '#ffd84a' },
    { label: 'GREAT', value: result.counts.GREAT, color: '#ff5fa8' },
    { label: 'GOOD', value: result.counts.GOOD, color: '#a78fd4' },
    { label: 'MISS', value: result.counts.MISS, color: '#6b83a8' },
  ]), [result]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* DX 斜条纹背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f38] via-[#0a1030] to-[#301b4e]" />
      <div className="absolute inset-0 mm-stripes opacity-60" />
      <div className="absolute inset-0 bg-[#060a1c]/40" />

      <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-14 px-6 py-8">
        {/* 左：封面 */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -4 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-4 shrink-0"
        >
          <div
            className="rounded-2xl overflow-hidden border-4 border-white/90 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
            style={{ width: 'min(30vh, 240px)', animation: 'mm-jacket-in 0.5s ease-out' }}
          >
            { }
            <img src={song.jacket} alt={song.title} className="w-full aspect-square object-cover" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-black">{song.title}</div>
            <div className="text-white/60 text-sm">{song.artist}</div>
            <div
              className="inline-block mt-2 px-3 py-1 rounded-lg text-sm font-black"
              style={{ background: diffInfo.color, color: result.difficulty === 'REMASTER' || result.difficulty === 'ADVANCED' ? '#3a2200' : '#fff' }}
            >
              {diffInfo.label} {Math.floor(result.level)}{result.level % 1 >= 0.7 ? '+' : ''}
            </div>
            {result.autoplay && (
              <div className="mt-2 text-xs font-black text-amber-300" style={{ animation: 'mm-blink 1s infinite' }}>
                AUTO PLAY（不计入成绩）
              </div>
            )}
          </div>
        </motion.div>

        {/* 中：达成率 + RANK */}
        <div className="flex flex-col items-center shrink-0">
          <div className="text-white/60 tracking-[0.35em] text-sm font-bold mb-1">ACHIEVEMENT 达成率</div>
          <div
            className={`text-6xl md:text-7xl font-black tabular-nums ${rainbow ? 'mm-rainbow-text' : ''}`}
            style={!rainbow ? { color: '#ffffff', textShadow: '0 0 30px rgba(62,230,255,0.5)' } : undefined}
          >
            {ach.toFixed(4)}
            <span className="text-3xl md:text-4xl">%</span>
          </div>

          {/* RANK 徽章 */}
          <div ref={rankRef} className="relative mt-4 h-36 w-44 flex items-center justify-center">
            {showRank && (
              <motion.div
                initial={false}
                style={{ animation: 'mm-rank-reveal 0.55s cubic-bezier(0.2,1.6,0.4,1) both' }}
                className="flex flex-col items-center"
              >
                <div
                  className="text-8xl font-black italic leading-none"
                  style={{
                    color: result.rank.startsWith('SSS') || rainbow ? undefined : rankColor(result.rank),
                    ...(result.rank.startsWith('SSS') || rainbow
                      ? { background: 'linear-gradient(135deg,#ff5f6d,#ffc371,#7ee8a2,#4facfe,#b06ab3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                      : {}),
                    textShadow: result.rank.startsWith('SSS') ? 'none' : `0 0 40px ${rankColor(result.rank)}66`,
                  }}
                >
                  {result.rank}
                </div>
                {result.isAP && (
                  <div
                    className="mt-2 px-6 py-1.5 rounded-full font-black text-lg mm-rainbow-text border-2 border-white/70"
                    style={{ animation: 'mm-badge-in 0.5s 0.3s cubic-bezier(0.2,1.8,0.4,1) both' }}
                  >
                    ALL PERFECT
                  </div>
                )}
                {result.isFC && !result.isAP && (
                  <div
                    className="mt-2 px-6 py-1.5 rounded-full font-black text-lg text-amber-200 border-2 border-amber-300/70 bg-amber-400/15"
                    style={{ animation: 'mm-badge-in 0.5s 0.3s cubic-bezier(0.2,1.8,0.4,1) both' }}
                  >
                    FULL COMBO
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {newRecord && showRank && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: -6 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              className="mt-1 px-4 py-1 bg-gradient-to-r from-pink-500 to-amber-400 text-white font-black rounded-lg -rotate-6 shadow-lg"
            >
              NEW RECORD!
            </motion.div>
          )}

          {/* DX Rating */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-3"
            >
              <div className="px-5 py-2 rounded-xl bg-amber-400/15 border border-amber-300/40 text-center">
                <div className="text-amber-300 text-xs font-black tracking-widest">DX RATING</div>
                <div className="text-3xl font-black text-amber-100">{result.rating}</div>
              </div>
              <div className="text-white/45 text-xs leading-relaxed">
                总 Rating<br />
                <span className="text-white font-black text-lg">{ratingTotal}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 右：判定明细 */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: showStats ? 1 : 0.25, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-3"
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2.5 backdrop-blur-sm">
            <div className="text-white/40 text-xs tracking-[0.3em] font-bold">判定明细</div>
            {judgeRows.map((r, i) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-b border-white/8 pb-1.5"
                style={{ transition: 'opacity 0.4s', opacity: showStats ? 1 : 0.4 }}
              >
                <span className="font-bold text-sm" style={{ color: r.color }}>{r.label}</span>
                <span className="font-black text-xl tabular-nums">{r.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-sm text-cyan-200">最大连击</span>
              <span className="font-black text-xl tabular-nums">{result.maxCombo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-200">音符 / 判定总数</span>
              <span className="font-black text-xl tabular-nums">{result.totalNotes} / {result.dxScoreMax / 3}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-200">DX 分数</span>
              <span className="font-black text-xl tabular-nums text-amber-200">
                {result.dxScore} <span className="text-white/40 text-sm">/ {result.dxScoreMax}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white/50">FAST / SLOW</span>
              <span className="font-bold text-sm tabular-nums text-white/70">{result.fastSlow.fast} / {result.fastSlow.slow}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 font-black text-lg hover:scale-[1.03] active:scale-95 transition-transform cursor-pointer"
            >
              ↻ 再来一次
            </button>
            <button
              onClick={onSelect}
              className="flex-1 py-3.5 rounded-xl bg-white/10 border border-white/20 font-black text-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              ☰ 返回选曲
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
