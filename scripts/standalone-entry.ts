/**
 * 单文件版入口 — vanilla DOM UI（复用全部核心 lib）
 * 打包: bun build scripts/standalone-entry.ts --bundle --minify
 * 由 build_standalone.py 组装为最终 webmaimai.html
 */
import { SONGS, GENRES } from '../src/lib/maimai/songs';
import { generateChart } from '../src/lib/maimai/chartgen';
import { MaimaiEngine } from '../src/lib/maimai/engine';
import { PlayfieldRenderer } from '../src/lib/maimai/renderer';
import { InputManager, KEY_HELP } from '../src/lib/maimai/input';
import { MusicSequencer } from '../src/lib/audio/sequencer';
import { SFX } from '../src/lib/audio/instruments';
import {
  DIFF_INFO, DIFFICULTIES, CHART_TYPE_INFO, JUDGE_TEXT,
  chartTypesOf, chartsOf, lvText,
} from '../src/lib/maimai/types';
import type { ChartType, Difficulty, GameSettings, PlayResult, SongDef } from '../src/lib/maimai/types';
import { rankColor, fmtAchievement } from '../src/lib/maimai/scoring';
import { getSettings, setSettings, getBest, totalRating, recordResult } from '../src/lib/maimai/storage';

/* ---------------- 资源注入（单文件版由构建脚本写入 window.__JACKETS__ / __ASSETS__） ---------------- */
const JACKETS = (window as unknown as { __JACKETS__?: Record<string, string> }).__JACKETS__;
const ASSETS = (window as unknown as { __ASSETS__?: Record<string, string> }).__ASSETS__;
if (JACKETS) for (const s of SONGS) { if (JACKETS[s.id]) s.jacket = JACKETS[s.id]; }

/* ---------------- 全局状态 ---------------- */
type Screen = 'title' | 'select' | 'game' | 'results';
const seq = new MusicSequencer();
let screen: Screen = 'title';
let song: SongDef = SONGS[0];
let difficulty: Difficulty = 'MASTER';
let chartType: ChartType = 'STD';
let genre = '全部';
let result: PlayResult | null = null;
let settings: GameSettings = { speed: 5, offsetMs: 0, volume: 0.85, autoPlay: false };
try { settings = getSettings(); } catch { /* ignore */ }

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;
const root = () => document.getElementById('app')!;
const el = (html: string): HTMLElement => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild as HTMLElement;
};
const clickSfx = () => { if (seq.I) SFX.uiMove(seq.I, seq.audioTime); };

function unlockAudio() {
  const ctx = seq.init();
  if (ctx) seq.setVolume(settings.volume);
  return ctx;
}

/* ================= 标题画面 ================= */
function renderTitle() {
  const charBg = ASSETS?.character
    ? `background-image:url('${ASSETS.character}');background-size:cover;background-position:center 20%;`
    : `background: radial-gradient(ellipse at 50% 80%, #1a2a6c 0%, #060a1c 70%);`;
  root().innerHTML = `
  <div class="screen title-screen">
    <div class="title-bg" style="${charBg}"></div>
    <div class="title-overlay"></div>
    <div class="title-content">
      <div class="title-sega">SEGA</div>
      <h1 class="title-logo">舞萌<br><span>maimai</span></h1>
      <div class="title-sub">DX WEB PLAYER · 粉丝复刻版</div>
      <div class="title-press" id="title-press">PRESS ENTER · 点击开始</div>
      <div class="title-rating" id="title-rating"></div>
      <div class="title-btns">
        <button class="btn ghost" id="btn-howto">? 玩法说明</button>
        <button class="btn ghost" id="btn-settings">⚙ 设置</button>
      </div>
      <div class="title-foot">本项目为粉丝向非营利复刻 · maimai 相关权利归 SEGA 所有</div>
    </div>
  </div>`;
  const rating = totalRating();
  const rEl = $('#title-rating');
  if (rEl && rating > 0) rEl.innerHTML = `★ DX RATING <b>${rating}</b>`;
  $('#title-press')!.addEventListener('click', startFromTitle);
  root().querySelector('.title-content')!.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    startFromTitle();
  });
  $('#btn-howto')!.addEventListener('click', (e) => { e.stopPropagation(); clickSfx(); openHowto(); });
  $('#btn-settings')!.addEventListener('click', (e) => { e.stopPropagation(); clickSfx(); openSettings(); });
}

function startFromTitle() {
  const ctx = unlockAudio();
  if (ctx && seq.I) SFX.coin(seq.I, seq.audioTime);
  setTimeout(() => { screen = 'select'; renderSelect(); }, 240);
}

/* ================= 选曲画面 ================= */
let previewTimer: ReturnType<typeof setTimeout> | null = null;

function songsOfGenre(): SongDef[] {
  return genre === '全部' ? SONGS : SONGS.filter((s) => s.category === genre);
}

function curTypes(): ChartType[] { return chartTypesOf(song); }
function curType(): ChartType { return curTypes().includes(chartType) ? chartType : curTypes()[0]; }
function curCharts() { return chartsOf(song, curType()); }

function renderSelect() {
  const songs = songsOfGenre();
  if (!songs.some((s) => s.id === song.id)) song = songs[0] ?? SONGS[0];
  const tabs = GENRES.map((g) =>
    `<button class="tab ${g === genre ? 'on' : ''}" data-g="${g}">${g}</button>`).join('');
  root().innerHTML = `
  <div class="screen select-screen" id="select-root">
    <div class="select-bg" id="select-bg"></div>
    <div class="select-top">
      <div class="tabs" id="tabs">${tabs}</div>
      <div class="top-right">
        <div class="rating-pill">★ DX RATING <b id="rating-num">${totalRating()}</b></div>
        <button class="btn ghost sm" id="btn-howto">? 说明</button>
        <button class="btn ghost sm" id="btn-settings">⚙ 设置</button>
      </div>
    </div>
    <div class="select-main">
      <div class="song-info" id="song-info"></div>
      <div class="carousel" id="carousel">
        <button class="nav-btn" id="prev">‹</button>
        <button class="nav-btn" id="next">›</button>
        <div class="carousel-inner" id="carousel-inner"></div>
      </div>
      <div class="side-panel">
        <div class="help-box">
          <div class="help-title">操作</div>
          <div class="help-row"><kbd>←</kbd><kbd>→</kbd> 切歌</div>
          <div class="help-row"><kbd>↑</kbd><kbd>↓</kbd> 难度</div>
          <div class="help-row"><kbd>Tab</kbd> STD / DX</div>
          <div class="help-row"><kbd>Enter</kbd> 决定</div>
          <div class="help-row"><kbd>Esc</kbd> 返回</div>
        </div>
        <button class="btn play" id="btn-play">▶ 开始游玩</button>
      </div>
    </div>
    <div class="select-bottom">
      <div class="type-toggle" id="type-toggle"></div>
      <div class="diff-bar" id="diff-bar"></div>
      <div class="select-hint">← → 选择乐曲 · ↑ ↓ 选择难度 · ENTER 决定 · ESC 返回</div>
    </div>
  </div>`;
  $('#tabs')!.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => { clickSfx(); genre = (t as HTMLElement).dataset.g!; renderSelect(); }));
  $('#prev')!.addEventListener('click', () => move(-1));
  $('#next')!.addEventListener('click', () => move(1));
  $('#btn-play')!.addEventListener('click', play);
  $('#btn-howto')!.addEventListener('click', () => { clickSfx(); openHowto(); });
  $('#btn-settings')!.addEventListener('click', () => { clickSfx(); openSettings(); });
  updateSelect();
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => { unlockAudio(); seq.playPreview(song); }, 240);
}

function updateSelect() {
  const songs = songsOfGenre();
  const focusIdx = Math.max(0, songs.findIndex((s) => s.id === song.id));
  const bg = $('#select-bg');
  if (bg) {
    (bg as HTMLElement).style.backgroundImage = `url('${song.jacket}')`;
  }
  /* 封面转盘 */
  const inner = $('#carousel-inner')!;
  const items = songs.map((s, i) => {
    const off = i - focusIdx;
    const abs = Math.abs(off);
    if (abs > 2) return '';
    const isFocus = off === 0;
    return `<div class="jacket-card ${isFocus ? 'focus' : ''}" style="--off:${off};z-index:${10 - abs}">
      <img src="${s.jacket}" alt="" draggable="false">
      ${isFocus ? `<div class="jacket-caption"><div class="j-title">${s.title}</div><div class="j-sub">${s.artist} · ${s.version}</div></div>
      <div class="lv-badge">${lvText(curCharts()[difficulty] ?? 0)}</div>` : ''}
    </div>`;
  }).join('');
  inner.innerHTML = items;
  inner.querySelectorAll('.jacket-card:not(.focus)').forEach((c, i) => {
    (c as HTMLElement).addEventListener('click', () => {
      const idx = focusIdx + parseInt((c as HTMLElement).style.getPropertyValue('--off'), 10);
      const s = songs[idx];
      if (s) { clickSfx(); song = s; updateSelect(); restartPreview(); }
    });
  });
  /* 左侧信息 */
  const charts = curCharts();
  const info = $('#song-info')!;
  let noteCount = 0;
  try { noteCount = generateChart(song, difficulty, curType()).counts.total; } catch { noteCount = 0; }
  const diffRows = DIFFICULTIES.filter((d) => charts[d] !== undefined).map((d) => {
    const best = getBest(song.id, d, curType());
    return `<div class="best-row">
      <span class="diff-chip" style="background:${DIFF_INFO[d].color};color:${d === 'REMASTER' ? '#7a1fa8' : '#fff'}">${DIFF_INFO[d].label}</span>
      ${best
        ? `<b style="color:${rankColor(best.rank)}">${best.rank}</b><span class="mono">${fmtAchievement(best.achievement)}</span>
           ${best.isAP ? '<i class="tag ap">AP</i>' : best.isFC ? '<i class="tag fc">FC</i>' : ''}`
        : '<span class="none">— 未游玩</span>'}
    </div>`;
  }).join('');
  info.innerHTML = `
    <div class="now-selecting">NOW SELECTING</div>
    <h2 style="color:${song.color}">${song.title}</h2>
    <table class="info-table">
      <tr><td>艺术家</td><td class="ar">${song.artist}</td></tr>
      <tr><td>分类</td><td>${song.category}</td></tr>
      <tr><td>版本</td><td>${song.version}</td></tr>
      <tr><td>BPM</td><td>${song.bpm}</td></tr>
      <tr><td>类型</td><td>${song.genre}</td></tr>
      <tr><td>音符数</td><td>${noteCount}</td></tr>
    </table>
    <div class="best-title">最佳成绩 · ${curType() === 'DX' ? 'DX 谱面' : 'STD 谱面'}</div>
    ${diffRows}`;
  /* 谱面类型切换 */
  const types = curTypes();
  const tt = $('#type-toggle')!;
  tt.innerHTML = types.length > 1
    ? types.map((t) => `<button class="type-btn ${t === curType() ? 'on' : ''}" data-t="${t}">${t === 'DX' ? '★ DX' : 'STD'}<span>${CHART_TYPE_INFO[t].label}</span></button>`).join('')
    : '';
  tt.querySelectorAll('.type-btn').forEach((b) =>
    b.addEventListener('click', () => { clickSfx(); chartType = (b as HTMLElement).dataset.t as ChartType; updateSelect(); }));
  /* 难度条 */
  const bar = $('#diff-bar')!;
  bar.innerHTML = DIFFICULTIES.filter((d) => charts[d] !== undefined).map((d) => {
    const active = d === difficulty;
    const c = DIFF_INFO[d];
    const dark = d === 'REMASTER' || d === 'ADVANCED';
    return `<button class="diff-btn ${active ? 'on' : ''}" data-d="${d}"
      style="${active ? `background:linear-gradient(135deg,${c.color},${c.color2});color:${dark ? '#3a2200' : '#fff'}` : ''}">
      <div class="d-label">${c.label}</div><div class="d-lv">${lvText(charts[d] ?? 0)}</div></button>`;
  }).join('') + `<button class="btn play mobile-go" id="btn-play-m">▶ GO</button>`;
  bar.querySelectorAll('.diff-btn').forEach((b) =>
    b.addEventListener('click', () => { clickSfx(); difficulty = (b as HTMLElement).dataset.d as Difficulty; updateSelect(); }));
  $('#btn-play-m')!.addEventListener('click', play);
}

function move(d: number) {
  const songs = songsOfGenre();
  const idx = Math.max(0, songs.findIndex((s) => s.id === song.id));
  song = songs[(idx + d + songs.length) % songs.length];
  clickSfx();
  updateSelect();
  restartPreview();
}
function restartPreview() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => { unlockAudio(); seq.playPreview(song); }, 240);
}
function moveDiff(d: number) {
  const charts = curCharts();
  const avail = DIFFICULTIES.filter((x) => charts[x] !== undefined);
  const cur = avail.indexOf(difficulty);
  difficulty = avail[(cur + d + avail.length) % avail.length];
  clickSfx();
  updateSelect();
}
function play() {
  chartType = curType();
  unlockAudio();
  if (seq.I) SFX.songDecide(seq.I, seq.audioTime);
  screen = 'game';
  renderGame();
}

/* ================= 游戏画面 ================= */
let gameCleanup: (() => void) | null = null;

function renderGame() {
  seq.stop();
  root().innerHTML = `
  <div class="screen game-screen">
    <canvas id="game-canvas"></canvas>
    <div class="key-hint" id="key-hint"></div>
    <button class="pause-btn" id="pause-btn" aria-label="暂停">❚❚</button>
    <div class="pause-overlay" id="pause-overlay" style="display:none">
      <div class="pause-box">
        <div class="pause-title">PAUSED</div>
        <div class="pause-sub">乐曲已暂停 · 游戏中</div>
        <button class="btn cyan" id="btn-resume">▶ 继续游戏</button>
        <button class="btn pink" id="btn-retry">↻ 重新开始</button>
        <button class="btn ghost2" id="btn-quit">✕ 放弃并返回选曲</button>
        <div class="pause-esc">ESC 继续</div>
      </div>
    </div>
  </div>`;
  const canvas = $('#game-canvas') as HTMLCanvasElement;
  const chart = generateChart(song, difficulty, chartType);
  const engine = new MaimaiEngine({ song, chart, difficulty, chartType, settings, sequencer: seq });
  (window as unknown as { __mmEngine?: MaimaiEngine }).__mmEngine = engine;
  const renderer = new PlayfieldRenderer(canvas, engine, song);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth; const h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    canvas.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderer.resize(w, h, dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  let paused = false;
  const pausedRef = { v: false };
  const input = new InputManager({
    canvas,
    onPress: (pos, t) => { if (!pausedRef.v) engine.press(pos, t); },
    onRelease: (pos, t) => { if (!pausedRef.v) engine.release(pos, t); },
    getAudioTime: () => seq.audioTime,
    geometry: () => {
      const w = window.innerWidth; const h = window.innerHeight;
      const cx = w / 2; const cy = h * 0.545;
      const R = Math.min(w * 0.465, h * 0.44);
      return { cx, cy, ringInner: R * 0.775, ringOuter: R * 0.985, touchR: R * 0.42 };
    },
  });
  input.setEnabled(true);

  seq.setStartDelay(2.2);
  seq.playSong(song, 0);
  if (seq.I) SFX.ready(seq.I, seq.audioTime + 1.0);

  let raf = 0;
  let lastTs = performance.now();
  const loop = (ts: number) => {
    const dt = Math.min(ts - lastTs, 100);
    lastTs = ts;
    if (!pausedRef.v) {
      engine.update(dt);
      renderer.render(engine.songTime);
      if (engine.finished) {
        engine.finished = false;
        const r = engine.buildResult();
        if (seq.I) SFX.clear(seq.I, seq.audioTime);
        setTimeout(() => { result = r; try { recordResult(r); } catch { /* ignore */ } screen = 'results'; renderResults(); }, 200);
        cleanupGame();
        return;
      }
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const togglePause = (v?: boolean) => {
    paused = v ?? !paused;
    pausedRef.v = paused;
    ($('#pause-overlay') as HTMLElement).style.display = paused ? 'flex' : 'none';
    if (paused) seq.pause(); else seq.resume();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Escape') { e.preventDefault(); togglePause(); }
  };
  window.addEventListener('keydown', onKey);
  $('#pause-btn')!.addEventListener('click', () => togglePause());
  $('#btn-resume')!.addEventListener('click', () => togglePause(false));
  $('#btn-retry')!.addEventListener('click', () => { cleanupGame(); renderGame(); });
  $('#btn-quit')!.addEventListener('click', () => { cleanupGame(); screen = 'select'; renderSelect(); });

  /* 键位提示 */
  const hint = $('#key-hint')!;
  if (!settings.autoPlay) {
    hint.innerHTML = KEY_HELP.map(({ pos, key }) =>
      `<div class="kh"><div class="kh-key">${key}</div><div class="kh-pos">${pos + 1}号</div></div>`).join('');
    setTimeout(() => { hint.style.opacity = '0'; }, 5000);
  } else { hint.innerHTML = ''; }

  function cleanupGame() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
    input.setEnabled(false);
    seq.stop();
    delete (window as unknown as { __mmEngine?: MaimaiEngine }).__mmEngine;
    gameCleanup = null;
  }
  gameCleanup = cleanupGame;
}

/* ================= 结算画面 ================= */
function renderResults() {
  const r = result!;
  const diffInfo = DIFF_INFO[r.difficulty];
  const rainbow = r.rank.startsWith('SSS') || r.isAP;
  const rankStyle = rainbow
    ? 'background:linear-gradient(135deg,#ff5f6d,#ffc371,#7ee8a2,#4facfe,#b06ab3);-webkit-background-clip:text;background-clip:text;color:transparent;'
    : `color:${rankColor(r.rank)};text-shadow:0 0 40px ${rankColor(r.rank)}66;`;
  const rows: Array<[string, string, string]> = [
    ['CRITICAL PERFECT', String(r.counts.CP), JUDGE_TEXT.CP.color],
    ['PERFECT', String(r.counts.PERFECT), JUDGE_TEXT.PERFECT.color],
    ['GREAT', String(r.counts.GREAT), JUDGE_TEXT.GREAT.color],
    ['GOOD', String(r.counts.GOOD), JUDGE_TEXT.GOOD.color],
    ['MISS', String(r.counts.MISS), JUDGE_TEXT.MISS.color],
  ];
  root().innerHTML = `
  <div class="screen results-screen">
    <div class="select-bg" style="background-image:url('${song.jacket}')"></div>
    <div class="results-panel">
      <div class="results-song">
        <div class="results-jacket"><img src="${song.jacket}"></div>
        <div class="results-title">${song.title}</div>
        <div class="results-artist">${song.artist}</div>
        <div class="results-badges">
          <span class="diff-chip lg" style="background:${diffInfo.color};color:${r.difficulty === 'REMASTER' || r.difficulty === 'ADVANCED' ? '#3a2200' : '#fff'}">${diffInfo.label} ${lvText(r.level)}</span>
          <span class="type-chip ${r.chartType === 'DX' ? 'dx' : 'std'}">${r.chartType === 'DX' ? '★ DX 谱面' : 'STD 谱面'}</span>
        </div>
        ${r.autoplay ? '<div class="autoplay-note">AUTO PLAY（不计入成绩）</div>' : ''}
      </div>
      <div class="results-ach">
        <div class="ach-label">ACHIEVEMENT 达成率</div>
        <div class="ach-num ${rainbow ? 'rainbow' : ''}" id="ach-num">0.0000<span>%</span></div>
        <div class="rank-badge" id="rank-badge" style="display:none"><span style="${rankStyle}">${r.rank}</span></div>
        <div class="fc-badge">${r.isAP ? '<i class="tag ap lg">ALL PERFECT</i>' : r.isFC ? '<i class="tag fc lg">FULL COMBO</i>' : ''}</div>
        <div class="rating-row">DX RATING <b>${r.rating}</b> · 总 Rating <b>${totalRating()}</b></div>
      </div>
      <div class="results-detail">
        <div class="detail-title">判定明细</div>
        ${rows.map(([n, c, col]) => `<div class="detail-row"><span style="color:${col};font-weight:900">${n}</span><b class="mono">${c}</b></div>`).join('')}
        <div class="detail-row"><span>最大连击</span><b class="mono">${r.maxCombo}</b></div>
        <div class="detail-row"><span>音符 / 判定总数</span><b class="mono">${r.totalNotes} / ${r.dxScoreMax / 3}</b></div>
        <div class="detail-row"><span>DX 分数</span><b class="mono">${r.dxScore} / ${r.dxScoreMax}</b></div>
        <div class="detail-row"><span>FAST / SLOW</span><b class="mono">${r.fastSlow.fast} / ${r.fastSlow.slow}</b></div>
      </div>
    </div>
    <div class="results-btns">
      <button class="btn pink" id="btn-retry">↻ 再来一次</button>
      <button class="btn cyan" id="btn-select">☰ 返回选曲</button>
      <button class="btn ghost" id="btn-settings2">⚙ 游戏设置</button>
    </div>
  </div>`;
  $('#btn-retry')!.addEventListener('click', () => { clickSfx(); screen = 'game'; renderGame(); });
  $('#btn-select')!.addEventListener('click', () => { clickSfx(); screen = 'select'; renderSelect(); });
  $('#btn-settings2')!.addEventListener('click', () => { clickSfx(); openSettings(); });

  /* 达成率滚动 + RANK 揭示 */
  const achEl = $('#ach-num')!;
  const t0 = performance.now();
  const dur = 1400;
  const tick = () => {
    const p = Math.min((performance.now() - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const v = r.achievement * ease;
    achEl.innerHTML = `${v.toFixed(4)}<span>%</span>`;
    if (p < 1) requestAnimationFrame(tick);
    else {
      achEl.innerHTML = `${r.achievement.toFixed(4)}<span>%</span>`;
      setTimeout(() => { const rb = $('#rank-badge'); if (rb) rb.style.display = 'flex'; }, 150);
    }
  };
  requestAnimationFrame(tick);
}

/* ================= 设置 / 说明 弹窗 ================= */
function openSettings() {
  const wrap = el(`<div class="overlay"><div class="modal">
    <div class="modal-head">⚙ 设置<button class="modal-close">✕</button></div>
    <div class="setting-row">
      <label>音符速度 <b id="v-speed">${settings.speed.toFixed(1)}</b></label>
      <input type="range" id="s-speed" min="1" max="10" step="0.5" value="${settings.speed}">
      <div class="range-marks"><span>慢 1.0</span><span>标准 5.0</span><span>快 10.0</span></div>
    </div>
    <div class="setting-row">
      <label>判定偏移 <b id="v-offset">${settings.offsetMs} ms</b></label>
      <input type="range" id="s-offset" min="-100" max="100" step="1" value="${settings.offsetMs}">
      <div class="range-marks"><span>提前 -100</span><span>0</span><span>延后 +100</span></div>
      <div class="setting-tip">总是提前（FAST 多）→ 调大偏移；总是偏晚（SLOW 多）→ 调小偏移。</div>
    </div>
    <div class="setting-row">
      <label>音量 <b id="v-vol">${Math.round(settings.volume * 100)}%</b></label>
      <input type="range" id="s-vol" min="0" max="100" step="1" value="${Math.round(settings.volume * 100)}">
    </div>
    <button class="toggle-row ${settings.autoPlay ? 'on' : ''}" id="t-auto">
      🤖 自动演示（AUTO PLAY）：${settings.autoPlay ? '开启' : '关闭'}
    </button>
    <div class="setting-tip">开启后自动全 PERFECT 演示，成绩不会保存。适合观赏谱面。</div>
    <button class="btn cyan" id="s-ok">确定</button>
  </div></div>`);
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  wrap.querySelector('.modal-close')!.addEventListener('click', close);
  const bind = (id: string, vId: string, fmt: (v: number) => string, apply: (v: number) => void) => {
    const inp = wrap.querySelector(id) as HTMLInputElement;
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      (wrap.querySelector(vId) as HTMLElement).textContent = fmt(v);
      apply(v);
      setSettings(settings);
      seq.setVolume(settings.volume);
    });
  };
  bind('#s-speed', '#v-speed', (v) => v.toFixed(1), (v) => { settings.speed = v; });
  bind('#s-offset', '#v-offset', (v) => `${v} ms`, (v) => { settings.offsetMs = v; });
  bind('#s-vol', '#v-vol', (v) => `${Math.round(v)}%`, (v) => { settings.volume = v / 100; });
  const auto = wrap.querySelector('#t-auto') as HTMLElement;
  auto.addEventListener('click', () => {
    settings.autoPlay = !settings.autoPlay;
    auto.classList.toggle('on', settings.autoPlay);
    auto.textContent = `🤖 自动演示（AUTO PLAY）：${settings.autoPlay ? '开启' : '关闭'}`;
    setSettings(settings);
  });
  wrap.querySelector('#s-ok')!.addEventListener('click', close);
}

function openHowto() {
  const notes: Array<[string, string, string, string]> = [
    ['TAP', '#ff4fa0', '基础', '粉色圆音符，飞到对应按键时按下'],
    ['HOLD', '#ffd24a', '长按', '黄色长条，按住头部后保持到尾部'],
    ['SLIDE', '#41f2ff', '滑星', '青色星形沿外环滑行，在终点按键接住'],
    ['TOUCH', '#3dff9c', '触摸', '绿色光点出现在内圈，任意按键/空格判定'],
    ['BREAK', '#ffd24a', '高分', '金色星星，分数是 TAP 的 5 倍'],
  ];
  const judges: Array<[string, string, string]> = [
    ['CRITICAL PERFECT', '#ffe95c', '±33ms 完美中心'],
    ['PERFECT', '#ffd84a', '±67ms'],
    ['GREAT', '#ff5fa8', '±100ms，维持连击'],
    ['GOOD', '#7dff7d', '±134ms，断连击'],
    ['MISS', '#8b9dc3', '错过音符'],
  ];
  const wrap = el(`<div class="overlay"><div class="modal howto">
    <div class="modal-head">? 玩法说明<button class="modal-close">✕</button></div>
    <h4>⌨ 键盘键位</h4>
    <div class="howto-keys">${KEY_HELP.map(({ pos, key }) =>
      `<div class="kh"><div class="kh-key">${key}</div><div class="kh-pos">${pos + 1}号</div></div>`).join('')}
      <div class="kh"><div class="kh-key sp">空间</div><div class="kh-pos">触摸</div></div>
    </div>
    <h4>♪ 音符类型</h4>
    ${notes.map(([n, c, k, d]) => `<div class="note-row"><span class="note-dot" style="background:${c};color:${n === 'BREAK' ? '#7a4a00' : '#081226'}">${n[0]}</span><b style="color:${c}">${n}</b><i>${k}</i><span>${d}</span></div>`).join('')}
    <h4>◎ 判定说明</h4>
    ${judges.map(([n, c, d]) => `<div class="judge-row"><b style="color:${c}">${n}</b><span>${d}</span></div>`).join('')}
    <h4>🏆 计分系统（对齐 maimai DX）</h4>
    <div class="howto-text">
      <p>· <b>达成率</b>：满分 100%，BREAK 加成上限约 101%</p>
      <p>· <b>评价</b>：AA 90% · AAA 94% · S 97% · SS 99% · SSS 100% · SSS+ 100.5%</p>
      <p>· <b>DX Rating</b>：定数 × 达成率 × 评级系数</p>
    </div>
    <h4>💿 谱面类型 STD / DX</h4>
    <div class="howto-text">
      <p>· <b style="color:#3ddc84">STD</b>：旧世代白谱，无 TOUCH，纯按键谱面</p>
      <p>· <b style="color:#ffd34d">DX</b>：黄谱，包含 TOUCH 触摸音符</p>
      <p>· 选曲时按 <kbd>Tab</kbd> 切换，成绩分开记录</p>
    </div>
    <h4>ℹ️ 关于本复刻</h4>
    <div class="howto-text">
      <p>· 曲目元数据来自国服《舞萌DX》曲目数据库，共 20 首真实曲目</p>
      <p>· 音乐为 Web Audio 合成引擎实时演奏的风格化编曲（非原版音频）</p>
      <p>· 粉丝向非营利复刻，相关权利归 SEGA 所有</p>
    </div>
    <button class="btn cyan" id="h-ok">明白了！</button>
  </div></div>`);
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  wrap.querySelector('.modal-close')!.addEventListener('click', close);
  wrap.querySelector('#h-ok')!.addEventListener('click', close);
}

/* ================= 全局键盘 ================= */
window.addEventListener('keydown', (e) => {
  const overlayOpen = document.querySelector('.overlay') !== null;
  if (overlayOpen) return;
  if (screen === 'title') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyS') {
      e.preventDefault(); startFromTitle();
    }
  } else if (screen === 'select') {
    switch (e.code) {
      case 'ArrowLeft': e.preventDefault(); move(-1); break;
      case 'ArrowRight': e.preventDefault(); move(1); break;
      case 'ArrowUp': e.preventDefault(); moveDiff(-1); break;
      case 'ArrowDown': e.preventDefault(); moveDiff(1); break;
      case 'Tab': {
        e.preventDefault();
        const types = curTypes();
        chartType = types[(types.indexOf(curType()) + 1) % types.length];
        clickSfx(); updateSelect();
        break;
      }
      case 'Enter': e.preventDefault(); play(); break;
      case 'Escape': e.preventDefault(); seq.stop(); screen = 'title'; renderTitle(); break;
      default: break;
    }
  } else if (screen === 'results') {
    if (e.code === 'Enter') { e.preventDefault(); screen = 'select'; renderSelect(); }
    if (e.code === 'Escape') { e.preventDefault(); screen = 'select'; renderSelect(); }
  }
});

/* ================= 启动 ================= */
renderTitle();
