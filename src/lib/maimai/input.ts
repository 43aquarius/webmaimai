/**
 * 输入管理 — 键盘（8键环形映射）/ 鼠标 / 多点触控
 */
export type PressCb = (pos: number, audioTime: number) => void;

/** 环形键位：W=1号(上) 顺时针 E D C X Z A Q */
export const KEY_RING: Record<string, number> = {
  KeyW: 0, KeyE: 1, KeyD: 2, KeyC: 3,
  KeyX: 4, KeyZ: 5, KeyA: 6, KeyQ: 7,
};

export const KEY_HELP: Array<{ pos: number; key: string }> = [
  { pos: 0, key: 'W' }, { pos: 1, key: 'E' }, { pos: 2, key: 'D' }, { pos: 3, key: 'C' },
  { pos: 4, key: 'X' }, { pos: 5, key: 'Z' }, { pos: 6, key: 'A' }, { pos: 7, key: 'Q' },
];

export class InputManager {
  private keyDown = new Set<string>();
  private mouseDown = new Map<number, number>(); // button → pos
  private touchMap = new Map<number, number>();  // identifier → pos
  private onPress: PressCb;
  private onRelease: PressCb;
  private getAudioTime: () => number;
  private canvas: HTMLCanvasElement;
  private geometry: () => { cx: number; cy: number; ringInner: number; ringOuter: number; touchR: number };
  private enabled = false;

  constructor(opts: {
    canvas: HTMLCanvasElement;
    onPress: PressCb;
    onRelease: PressCb;
    getAudioTime: () => number;
    geometry: () => { cx: number; cy: number; ringInner: number; ringOuter: number; touchR: number };
  }) {
    this.canvas = opts.canvas;
    this.onPress = opts.onPress;
    this.onRelease = opts.onRelease;
    this.getAudioTime = opts.getAudioTime;
    this.geometry = opts.geometry;
  }

  setEnabled(v: boolean) {
    if (v === this.enabled) return;
    this.enabled = v;
    if (v) this.attach();
    else this.detach();
  }

  private attach() {
    window.addEventListener('keydown', this.kd);
    window.addEventListener('keyup', this.ku);
    this.canvas.addEventListener('mousedown', this.md);
    window.addEventListener('mouseup', this.mu);
    this.canvas.addEventListener('touchstart', this.ts, { passive: false });
    this.canvas.addEventListener('touchend', this.te, { passive: false });
    this.canvas.addEventListener('touchcancel', this.te, { passive: false });
  }

  private detach() {
    window.removeEventListener('keydown', this.kd);
    window.removeEventListener('keyup', this.ku);
    this.canvas.removeEventListener('mousedown', this.md);
    window.removeEventListener('mouseup', this.mu);
    this.canvas.removeEventListener('touchstart', this.ts);
    this.canvas.removeEventListener('touchend', this.te);
    this.canvas.removeEventListener('touchcancel', this.te);
    this.keyDown.clear();
    this.mouseDown.clear();
    this.touchMap.clear();
  }

  private kd = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const code = e.code;
    let pos: number | null = null;
    if (code in KEY_RING) pos = KEY_RING[code];
    else if (/^Digit[1-8]$/.test(code)) pos = parseInt(code.slice(5), 10) - 1;
    else if (code === 'Space') pos = -1; // 触摸任意
    if (pos === null) return;
    e.preventDefault();
    this.keyDown.add(code);
    this.onPress(pos, this.getAudioTime());
  };

  private ku = (e: KeyboardEvent) => {
    const code = e.code;
    if (!this.keyDown.has(code)) return;
    this.keyDown.delete(code);
    let pos: number | null = null;
    if (code in KEY_RING) pos = KEY_RING[code];
    else if (/^Digit[1-8]$/.test(code)) pos = parseInt(code.slice(5), 10) - 1;
    else if (code === 'Space') pos = -1;
    if (pos !== null) this.onRelease(pos, this.getAudioTime());
  };

  /** 坐标 → 键位（返回 -1 = 触摸区） */
  private hitTest(clientX: number, clientY: number): number | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { cx, cy, ringInner, ringOuter, touchR } = this.geometry();
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist >= ringInner && dist <= ringOuter * 1.15) {
      let ang = Math.atan2(dy, dx) + Math.PI / 2; // 顶部为 0
      if (ang < 0) ang += Math.PI * 2;
      const pos = Math.round(ang / (Math.PI / 4)) % 8;
      return pos;
    }
    if (dist < touchR * 1.15) return -1;
    return null;
  }

  private md = (e: MouseEvent) => {
    const pos = this.hitTest(e.clientX, e.clientY);
    if (pos === null) return;
    e.preventDefault();
    this.mouseDown.set(e.button, pos);
    this.onPress(pos, this.getAudioTime());
  };

  private mu = (e: MouseEvent) => {
    const pos = this.mouseDown.get(e.button);
    if (pos === undefined) return;
    this.mouseDown.delete(e.button);
    this.onRelease(pos, this.getAudioTime());
  };

  private ts = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      const pos = this.hitTest(t.clientX, t.clientY);
      if (pos === null) continue;
      e.preventDefault();
      this.touchMap.set(t.identifier, pos);
      this.onPress(pos, this.getAudioTime());
    }
  };

  private te = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      const pos = this.touchMap.get(t.identifier);
      if (pos === undefined) continue;
      this.touchMap.delete(t.identifier);
      this.onRelease(pos, this.getAudioTime());
    }
  };
}
