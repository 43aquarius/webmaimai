'use client';

/**
 * 玩法说明 — 键位图 + 音符图鉴
 */
import { motion, AnimatePresence } from 'framer-motion';
import { KEY_HELP } from '@/lib/maimai/input';

const NOTE_TYPES = [
  { name: 'TAP', color: '#ff4fa0', desc: '粉色圆音符，飞到对应按键时按下即可', key: '基础音符' },
  { name: 'HOLD', color: '#ffd24a', desc: '黄色长条，按住头部后保持到尾部松开', key: '长按' },
  { name: 'SLIDE', color: '#41f2ff', desc: '青色星形，沿外环滑行，在终点按键接住', key: '滑星' },
  { name: 'TOUCH', color: '#3dff9c', desc: '绿色光点，出现在内圈区域，任意按键/空格即可判定', key: '触摸' },
  { name: 'BREAK', color: '#ffd24a', desc: '金色星星音符，分数是 TAP 的 5 倍，达成率加成关键', key: '高分' },
];

const JUDGES = [
  { name: 'CRITICAL PERFECT', color: 'mm-rainbow-text', desc: '±33ms 完美中心' },
  { name: 'PERFECT', color: 'text-amber-300', desc: '±67ms' },
  { name: 'GREAT', color: 'text-pink-400', desc: '±100ms，维持连击' },
  { name: 'GOOD', color: 'text-green-300', desc: '±134ms，断连击' },
  { name: 'MISS', color: 'text-slate-400', desc: '错过音符' },
];

export default function HowtoOverlay({
  open, onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 30 }}
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto mm-scroll rounded-3xl bg-[#0d1533] border border-white/15 p-6 md:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-black text-cyan-200">? 玩法说明</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 cursor-pointer">✕</button>
            </div>

            {/* 键位图 */}
            <section className="mb-7">
              <h4 className="font-black text-lg mb-3 text-white/90">⌨ 键盘键位</h4>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* 环形键位图 */}
                <div className="relative w-44 h-44 shrink-0">
                  {KEY_HELP.map(({ pos, key }) => {
                    const angle = (-90 + pos * 45) * (Math.PI / 180);
                    const x = 50 + Math.cos(angle) * 36;
                    const y = 50 + Math.sin(angle) * 36;
                    return (
                      <div
                        key={pos}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border-2 border-cyan-300/60 flex items-center justify-center font-black text-cyan-100">
                          {key}
                        </div>
                        <div className="text-[10px] text-white/45 mt-0.5">{pos + 1}号</div>
                      </div>
                    );
                  })}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-white/40 text-xs text-center leading-tight">
                      触摸区<br />SPACE
                    </div>
                  </div>
                </div>
                <div className="text-sm text-white/70 space-y-2 flex-1">
                  <p>· <b className="text-white">W E D C X Z A Q</b> 八键环形对应 <b className="text-white">1-8 号</b>外圈按键（与街机按钮位置一致，1 号在正上方顺时针排列）</p>
                  <p>· 数字键 <b className="text-white">1-8</b> 也可直接对应按键</p>
                  <p>· <b className="text-white">空格</b> 或点击屏幕中央 = 触摸（TOUCH 音符可用任意键判定）</p>
                  <p>· 鼠标 / 触屏：直接点击外环对应扇区，支持多点触控</p>
                  <p>· <b className="text-white">ESC</b> 暂停</p>
                </div>
              </div>
            </section>

            {/* 音符图鉴 */}
            <section className="mb-7">
              <h4 className="font-black text-lg mb-3 text-white/90">♪ 音符类型</h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {NOTE_TYPES.map((n) => (
                  <div key={n.name} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                    <div
                      className="w-9 h-9 rounded-full shrink-0 border-2 border-white/60 flex items-center justify-center text-xs font-black"
                      style={{ background: n.color, color: n.name === 'BREAK' ? '#7a4a00' : '#081226' }}
                    >
                      {n.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-sm" style={{ color: n.color }}>
                        {n.name} <span className="text-white/40 text-xs font-bold">{n.key}</span>
                      </div>
                      <div className="text-xs text-white/60 leading-relaxed">{n.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 判定 */}
            <section className="mb-7">
              <h4 className="font-black text-lg mb-3 text-white/90">◎ 判定说明</h4>
              <div className="space-y-1.5 text-sm">
                {JUDGES.map((j) => (
                  <div key={j.name} className="flex justify-between items-center border-b border-white/8 pb-1.5">
                    <span className={`font-black ${j.color}`}>{j.name}</span>
                    <span className="text-white/55 text-xs">{j.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 计分 */}
            <section className="mb-7">
              <h4 className="font-black text-lg mb-3 text-white/90">🏆 计分系统（对齐 maimai DX）</h4>
              <div className="text-sm text-white/70 space-y-2 leading-relaxed">
                <p>· <b className="text-cyan-200">达成率</b>：满分 100%，BREAK 音符加成可超过 100%，理论上限 101%</p>
                <p>· <b className="text-cyan-200">评价</b>：AA 90% · AAA 94% · S 97% · SS 99% · SSS 100% · SSS+ 100.5%</p>
                <p>· <b className="text-cyan-200">AP / FC</b>：全 PERFECT 以上 = ALL PERFECT；无 GOOD/MISS = FULL COMBO</p>
                <p>· <b className="text-cyan-200">DX Rating</b>：定数 × 达成率 × 评级系数（如 SSS+ 0.224）</p>
                <p>· <b className="text-cyan-200">DX 分数</b>：CP=3 / P=2 / GR=1，满分 = 判定数 × 3</p>
              </div>
            </section>

            {/* 谱面类型 */}
            <section className="mb-7">
              <h4 className="font-black text-lg mb-3 text-white/90">💿 谱面类型 STD / DX</h4>
              <div className="text-sm text-white/70 space-y-2 leading-relaxed">
                <p>· <b className="text-green-300">STD（STANDARD）</b>：旧世代白谱，无 TOUCH 触摸音符，纯按键谱面</p>
                <p>· <b className="text-amber-300">DX（DELUXE）</b>：黄谱，包含 TOUCH 触摸音符与更复杂的配置</p>
                <p>· 每首曲目的 STD / DX 谱面难度相互独立，成绩分开记录；选曲时按 <kbd className="kbd">Tab</kbd> 或点击切换</p>
              </div>
            </section>

            {/* 来源声明 */}
            <section className="mb-2">
              <h4 className="font-black text-lg mb-3 text-white/90">ℹ️ 关于本复刻</h4>
              <div className="text-sm text-white/70 space-y-2 leading-relaxed">
                <p>· 曲目元数据（标题 / 艺术家 / 分类 / 版本 / 难度）来自国服《舞萌DX》曲目数据库，共 20 首真实曲目</p>
                <p>· 封面图为游戏内真实封面；音乐为 Web Audio 合成引擎实时演奏的风格化编曲（非原版音频）</p>
                <p>· 本项目为粉丝向非营利复刻，SEGA / maimai DX 相关权利归 SEGA 所有</p>
              </div>
            </section>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 rounded-xl bg-cyan-400 text-[#062033] font-black cursor-pointer hover:scale-[1.02] transition-transform"
            >
              明白了！
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
