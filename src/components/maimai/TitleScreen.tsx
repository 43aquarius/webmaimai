'use client';

/**
 * 标题画面 — maimai 风格开机界面
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TitleScreen({
  onStart,
  onHowto,
}: {
  onStart: () => void;
  onHowto: () => void;
}) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (booting) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-2xl tracking-[0.5em] text-cyan-300 font-black">
            SEGA
          </div>
          <div className="mt-3 text-xs tracking-[0.35em] text-white/50">
            AMUSEMENT MACHINE
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-pointer"
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onStart();
      }}
      aria-label="开始游戏"
    >
      {/* 背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: "url('/assets/bg/stage_wide.png')", filter: 'brightness(0.5) saturate(1.2)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a1c]/70 via-transparent to-[#060a1c]/90" />
      {/* 装饰光 */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(closest-side, #3ee6ff, transparent)' }} />
      <div className="absolute -bottom-40 -left-20 w-[50vw] h-[36vh] rounded-full blur-3xl opacity-25"
        style={{ background: 'radial-gradient(closest-side, #ff4fa0, transparent)' }} />

      {/* 角色立绘 */}
      <motion.img
        src="/assets/bg/character_dj.jpg"
        alt="角色立绘"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        className="absolute right-[2%] bottom-0 h-[86%] object-contain drop-shadow-[0_0_40px_rgba(255,79,160,0.35)]"
        style={{ animation: 'mm-float 5s ease-in-out infinite' }}
        draggable={false}
      />

      {/* 左侧标题区 */}
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <div className="text-white/60 text-sm tracking-[0.4em] mb-2">SEGA · rhythm game</div>
          <h1 className="leading-none">
            <span
              className="block text-[13vw] md:text-[8rem] font-black italic tracking-tight mm-pink-glow"
              style={{ color: '#ff4fa0' }}
            >
              maimai
            </span>
            <span className="block mt-1 text-[6vw] md:text-[3.2rem] font-black text-white mm-text-glow tracking-widest">
              舞萌 for WEB
            </span>
          </h1>
          <div className="mt-4 text-white/70 text-sm md:text-base leading-relaxed">
            DX VERSION · 段位认定 MODE · WEB 复刻版
          </div>
        </motion.div>

        {/* PRESS START */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 group cursor-pointer text-left"
          onClick={(e) => { e.stopPropagation(); onStart(); }}
        >
          <div
            className="px-10 py-4 rounded-full border-2 border-cyan-300/70 bg-cyan-400/10 backdrop-blur-sm
                       hover:bg-cyan-400/25 hover:border-cyan-200 transition-all duration-200
                       shadow-[0_0_30px_rgba(62,230,255,0.25)]"
            style={{ animation: 'mm-pulse-glow 1.6s ease-in-out infinite' }}
          >
            <span className="text-xl md:text-2xl font-black tracking-[0.25em] text-cyan-100">
              PRESS START
            </span>
            <span className="ml-3 text-sm text-cyan-200/80">点击 / 回车开始</span>
          </div>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-6 flex gap-3"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onHowto(); }}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold transition-colors cursor-pointer"
          >
            ? 玩法说明
          </button>
        </motion.div>
      </div>

      {/* 底部版本信息 */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-6 text-[11px] text-white/40 tracking-wider">
        <span>maimai Web Recreation · Fan-made · 仅供学习交流</span>
        <span>Ver. 1.0.0 · 2026</span>
      </div>
    </div>
  );
}
