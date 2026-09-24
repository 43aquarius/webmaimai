'use client';

/**
 * 设置面板 — 流速 / 判定偏移 / 音量 / 自动演示
 */
import { motion, AnimatePresence } from 'framer-motion';
import type { GameSettings } from '@/lib/maimai/types';

export default function SettingsPanel({
  open, settings, onChange, onClose,
}: {
  open: boolean;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 24 }}
            className="w-full max-w-md rounded-3xl bg-[#0d1533] border border-white/15 p-6 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-cyan-200">⚙ 游戏设置</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 cursor-pointer">✕</button>
            </div>

            {/* 音符速度 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white/85">音符速度</span>
                <span className="font-black text-cyan-300 tabular-nums">{settings.speed.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={settings.speed}
                onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 mt-1">
                <span>慢 1.0</span><span>标准 5.0</span><span>快 10.0</span>
              </div>
            </div>

            {/* 判定偏移 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white/85">判定偏移</span>
                <span className="font-black text-cyan-300 tabular-nums">
                  {settings.offsetMs > 0 ? '+' : ''}{settings.offsetMs} ms
                </span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                step={5}
                value={settings.offsetMs}
                onChange={(e) => onChange({ offsetMs: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 mt-1">
                <span>提前 -100</span><span>0</span><span>延后 +100</span>
              </div>
              <div className="text-[11px] text-white/45 mt-2 leading-relaxed">
                总是提前（FAST 多）→ 调大偏移；总是偏晚（SLOW 多）→ 调小偏移。
              </div>
            </div>

            {/* 音量 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white/85">音量</span>
                <span className="font-black text-cyan-300 tabular-nums">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.volume * 100)}
                onChange={(e) => onChange({ volume: parseInt(e.target.value, 10) / 100 })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* 自动演示 */}
            <button
              onClick={() => onChange({ autoPlay: !settings.autoPlay })}
              className={`w-full py-3.5 rounded-2xl font-black text-lg transition-all cursor-pointer ${
                settings.autoPlay
                  ? 'bg-amber-400 text-[#3a2200] shadow-[0_0_25px_rgba(255,210,74,0.5)]'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              🤖 自动演示（AUTO PLAY）{settings.autoPlay ? '：开启' : '：关闭'}
            </button>
            <div className="text-[11px] text-white/45 -mt-3">
              开启后自动全 PERFECT 演示，成绩不会保存。适合观赏谱面。
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-400 text-[#062033] font-black cursor-pointer hover:scale-[1.02] transition-transform"
            >
              确定
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
