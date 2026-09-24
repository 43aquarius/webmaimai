# Worklog — Web 版舞萌 (maimai DX 复刻)

项目：用 Next.js + Canvas + Web Audio 复刻街机音游《舞萌》核心体验
路径：/home/z/my-project (Next.js 16 App Router, 仅 `/` 路由)

---
Task ID: 1
Agent: main
Task: 环境初始化 + 技能加载

Work Log:
- 加载 fullstack-dev / image-search / image-generation / web-search 技能
- curl init-fullstack.sh 初始化完成，dev server 后台启动 (端口 3000)
- 确认技术栈: Next.js 16, React 19, Tailwind 4, shadcn/ui, framer-motion, zustand

Stage Summary:
- 项目环境就绪，开始资料核实与素材收集

---
Task ID: 2
Agent: main
Task: 资料核实 + 素材收集

Work Log:
- web-search 核实规则: 评价线 F/E/D/C/B/AA(90)/AAA(94)/S(97)/S+(98)/SS(99)/SS+(99.5)/SSS(100)/SSS+(100.5)
- Rating 公式: floor(定数×达成率×系数), 系数 SSS+ 0.224/SSS 0.216/SS+ 0.211/SS 0.208/S+ 0.203
- 音符基础分: Tap/Touch 500, Hold 1000, Slide 1500, Break 2500(CP2600/P2550/GR2500); DX分 CP3/P2/GR1
- image-search 下载 22 张候选图，vision 评估出 char_2(粉蓝发DJ少女)与char_1可用 → 标题立绘
- image-generation 生成 5 张歌曲封面 (sakura/splash/asterisk/orbit/hexa) + stage_wide 舞台背景
- 下载 M PLUS Rounded 1c 四字重 (Regular/Medium/Bold/Black) → public/fonts

Stage Summary:
- 素材与规则数据全部就绪，进入代码编写阶段

---
Task ID: 3
Agent: main
Task: 核心代码 + UI + 端到端验证

Work Log:
- 音频: instruments.ts 合成器(14种乐器+SFX) + sequencer.ts lookahead调度器(试听循环/暂停恢复)
- 音乐: 5首原创曲目 (140-200 BPM, 小调大调, future bass/DnB/city pop/hardcore/melodic dubstep)
- 谱面: chartgen.ts 从音乐事件生成5难度谱面 (锚点对齐/阶梯环扫/对拍镜像/HOLD长音/SLIDE滑星/TOUCH触摸/BREAK重音)
- 引擎: engine.ts 判定(CP±33ms/P±67ms/GR±100ms/GD±134ms)/HOLD头尾判定/SLIDE终点判定/TOUCH任意键/自动演示
- 渲染: renderer.ts Canvas圆形界面(8键环/音符外飞/粒子特效/判定文字/连击/HUD)
- UI: 标题(SEGA风格)/选曲(转盘+难度+成绩+试听)/游戏(暂停菜单)/结算(达成率滚动+RANK揭示)/设置/玩法说明
- 修复关键bug: 判定扫描窗口不含当前时刻音符(nextIdx游标逻辑)
- E2E(agent-browser): 标题/选曲/游戏/结算全流程验证; 精确按键dt=-0.002→CP; 自动演示全曲ALL PERFECT
- 数值验证: 达成率100.4092%→SSS正确; DX 987/987; Rating= floor(14×100.4092×0.216)+1=304 与官方公式一致
- 移动端390x844验证通过; lint全绿; 0 console errors

Stage Summary:
- 交付完整可玩的舞萌Web复刻版, 5曲×5难度, 计分系统对齐官方公式
