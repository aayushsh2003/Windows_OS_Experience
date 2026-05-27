// Lightweight Web Audio sound effects for OS interactions
let ctx: AudioContext | null = null;
const KEY = 'webos-sounds-enabled';

export const soundsEnabled = () => {
  try { return localStorage.getItem(KEY) !== 'false'; } catch { return true; }
};
export const setSoundsEnabled = (v: boolean) => {
  try { localStorage.setItem(KEY, String(v)); } catch {}
};

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return ctx;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = 'sine', vol = 0.05) {
  if (!soundsEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

export const sfx = {
  open: () => { blip(660, 0.06); setTimeout(() => blip(880, 0.08), 50); },
  close: () => { blip(440, 0.08); setTimeout(() => blip(330, 0.08), 40); },
  click: () => blip(800, 0.03, 'square', 0.025),
  notify: () => { blip(523, 0.1); setTimeout(() => blip(784, 0.12), 80); },
  error: () => blip(180, 0.2, 'sawtooth', 0.06),
};
