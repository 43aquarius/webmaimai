# webmaimai — 舞萌 Web 复刻版

基于 **Next.js 16 + Canvas 2D + Web Audio API** 的街机音游《舞萌 maimai DX》粉丝向 Web 复刻。

![maimai web](public/assets/bg/stage_wide.png)

## ✨ 特性

### 游玩系统（对齐 maimai DX 官方规则）
- **圆形谱面**：8 键环 + 外圈传感器，音符从中心向外飞出
- **5 种音符**：TAP / HOLD / SLIDE / TOUCH / BREAK
- **双谱面类型**：STD（白谱，无触摸）与 DX（黄谱，含触摸），难度独立、成绩分开记录
- **5 档难度**：BASIC / ADVANCED / EXPERT / MASTER / Re:MASTER，难度定数与 "+" 显示对齐国服数据
- **判定窗口**：CRITICAL PERFECT ±33ms · PERFECT ±67ms · GREAT ±100ms · GOOD ±134ms
- **官方配色判定**：CP 彩虹 / P 金 / GR 粉 / GOOD 绿 / MISS 灰，含 FAST/SLOW 快慢指示
- **计分系统**：达成率（BREAK 加成最高 101%）、RANK（F→SSS+）、AP/FC、DX 分数（CP3/P2/GR1）
- **DX Rating**：定数 × 达成率 × 评级系数，公式对齐官方

### 曲库（20 首真实曲目）
- 曲目元数据（标题 / 艺术家 / 分类 / 版本 / 难度）来自国服《舞萌DX》曲目数据库
- 6 大分类：舞萌 / niconico＆VOCALOID™ / 东方Project / 流行&动漫 / 其他游戏 / 音击・中二节奏
- 收录 PANDORA PARADOXXX（Re:MASTER 15）、天火明命、Caliburne、ジングルベル、フォニイ、
  神っぽいな、最終鬼畜妹フランドール・S、天国と地獄 -言ノ葉リンネ- 等知名曲目
- 真实游戏封面；音乐由内置 **Web Audio 合成引擎**（14 种乐器 + lookahead 调度器）实时演奏风格化编曲

### 界面
- SEGA 风格标题画面 → 封面转盘选曲（分类页签 / 试听 / 最佳成绩）→ 游玩 → 结算（达成率滚动 + RANK 揭示）
- 单 HTML 版：`webmaimai.html`，双击即玩、离线可用

## 🎮 操作

| 键位 | 功能 |
|---|---|
| `D F J K E R I U` | 1-8 号键（对应街机 8 键） |
| `空格` | 触摸音符（任意键亦可） |
| `← →` | 选曲 |
| `↑ ↓` | 切换难度 |
| `Tab` | 切换 STD / DX 谱面 |
| `Enter` | 决定 |
| `Esc` | 暂停 / 返回 |

移动端支持触摸点击 8 键区域与触摸音符区。

## 🛠 技术栈

- **Next.js 16**（App Router）+ React 19 + TypeScript
- **Canvas 2D** 渲染：8 键环 / 音符外飞 / 粒子特效 / 判定文字
- **Web Audio API**：合成器乐器（鼓组 / 贝斯 / 和声 / 主旋律 / 琶音 / 拨弦 / FX），swing 摆动节奏支持
- **谱面生成器**：从音乐事件流（鼓点/旋律/和声变化）程序化生成谱面，密度随定数缩放
- **localStorage**：设置 / 最佳成绩 / Rating 持久化
- Tailwind CSS 4 + framer-motion

## 📁 结构

```
src/
├── app/                    # Next.js 页面（游戏状态机）
├── components/maimai/      # 标题/选曲/游戏/结算/设置/说明
└── lib/
    ├── audio/              # 合成器乐器 + 时序器
    └── maimai/
        ├── types.ts        # 核心类型（判定/音符/谱面/结果）
        ├── score.ts        # 音乐编译器（DSL → 事件流）
        ├── chartgen.ts     # 谱面生成器（STD/DX × 5 难度）
        ├── engine.ts       # 判定引擎（HOLD 头尾/SLIDE/TOUCH/自动演示）
        ├── renderer.ts     # Canvas 渲染器
        ├── scoring.ts      # 达成率/RANK/Rating
        └── songs/          # 20 首曲目编曲数据
scripts/validate-charts.ts  # 谱面 sanity 校验
```

## 🚀 运行

```bash
bun install        # 或 npm install
bun run dev        # http://localhost:3000
```

谱面校验：`bun run scripts/validate-charts.ts`

## ⚖️ 声明

本项目为粉丝向非营利复刻，仅供学习交流。maimai / 舞萌 DX 相关权利归 SEGA 所有。曲目元数据来自公开的国服曲目数据库；封面为游戏内真实封面；音乐为合成引擎实时演奏的风格化编曲（非原版音频）。如有侵权请联系删除。
