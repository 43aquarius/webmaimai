/**
 * 验证脚本：音乐编译 + 谱面生成 sanity check
 * 运行: bun run scripts/validate-charts.ts
 */
import { SONGS } from '../src/lib/maimai/songs';
import { compileMusic } from '../src/lib/maimai/score';
import { generateChart } from '../src/lib/maimai/chartgen';
import { DIFFICULTIES } from '../src/lib/maimai/types';
import type { Difficulty } from '../src/lib/maimai/types';

let fail = 0;

for (const song of SONGS) {
  const music = compileMusic(song);
  const dur = (music.totalBeats * 60) / song.bpm;
  const evByInst: Record<string, number> = {};
  for (const e of music.events) evByInst[e.inst] = (evByInst[e.inst] ?? 0) + 1;
  console.log(`\n=== ${song.title} (${song.bpm} BPM) ===`);
  console.log(`  总拍数 ${music.totalBeats} → 时长 ${dur.toFixed(1)}s | 事件 ${music.events.length} 条`);
  console.log('  乐器分布:', JSON.stringify(evByInst));

  if (music.events.length < 200) { console.log('  ⚠️ 事件过少!'); fail++; }
  if (dur < 50 || dur > 130) { console.log('  ⚠️ 时长异常!'); fail++; }

  // 事件时间严格递增 & 无 NaN
  let prev = -1;
  for (const e of music.events) {
    if (!Number.isFinite(e.t) || e.t < prev - 1e-9) { console.log(`  ⚠️ 事件顺序异常 @${e.t}`); fail++; break; }
    prev = e.t;
  }

  for (const diff of DIFFICULTIES) {
    if (song.charts[diff] === undefined) continue;
    const chart = generateChart(song, diff);
    const nps = chart.counts.total / dur;
    // 检查排序/冲突
    let orderOk = true;
    const lastAtPos = new Map<number, number>();
    let conflicts = 0;
    let badEnd = 0;
    for (const n of chart.notes) {
      if (n.type === 'HOLD' && (n.end ?? 0) <= n.t) badEnd++;
      if (n.type === 'SLIDE' && ((n.end ?? 0) <= n.t || n.endPos === undefined)) badEnd++;
      if (n.type !== 'SLIDE') {
        const last = lastAtPos.get(n.pos) ?? -999;
        if (n.t - last < 0.119) conflicts++;
        lastAtPos.set(n.pos, n.t);
      }
    }
    const sorted = chart.notes.every((n, i, a) => i === 0 || a[i - 1].t <= n.t + 1e-9);
    if (!sorted) orderOk = false;
    console.log(
      `  ${diff.padEnd(9)} 定数${song.charts[diff]} → ${String(chart.counts.total).padStart(4)} notes ` +
      `(${nps.toFixed(1)}/s) TAP${chart.counts.tap} HOLD${chart.counts.hold} SLI${chart.counts.slide} ` +
      `TCH${chart.counts.touch} BRK${chart.counts.break} | max=${chart.totalMax} 判定${chart.totalJudgments}` +
      `${orderOk ? '' : ' ⚠️乱序'}${conflicts ? ` ⚠️同键冲突${conflicts}` : ''}${badEnd ? ` ⚠️异常音符${badEnd}` : ''}`,
    );
    if (!orderOk || conflicts > 0 || badEnd > 0) fail++;
    // 基础合理性: 密度范围
    if (nps > 7.5) { console.log('    ⚠️ 密度过高!'); fail++; }
    if (diff === 'BASIC' && nps > 2.2) { console.log('    ⚠️ BASIC 过密!'); fail++; }
    if (diff === 'MASTER' && nps < 2.5) { console.log('    ⚠️ MASTER 过疏!'); fail++; }
  }
}

console.log(fail === 0 ? '\n✅ 全部校验通过' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
