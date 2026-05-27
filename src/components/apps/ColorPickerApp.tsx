import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = ((b - r) / d + 2);
    else h = ((r - g) / d + 4);
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPickerApp() {
  const [color, setColor] = useState('#3b82f6');
  const [palette, setPalette] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('color-palette') || '[]'); } catch { return []; }
  });

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const save = () => {
    const next = [color, ...palette.filter(c => c !== color)].slice(0, 24);
    setPalette(next);
    localStorage.setItem('color-palette', JSON.stringify(next));
  };

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success(`Copied ${v}`); };

  return (
    <div className="h-full flex bg-background">
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        <h2 className="text-lg font-semibold">Color Picker</h2>
        <div className="rounded-xl h-48 shadow-lg border" style={{ background: color }} />
        <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'HEX', value: color.toUpperCase() },
            { label: 'RGB', value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
            { label: 'HSL', value: `${hsl.h}, ${hsl.s}%, ${hsl.l}%` },
          ].map(f => (
            <div key={f.label} className="p-3 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-sm font-mono">{f.value}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(f.value)}><Copy className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={save} className="w-full">Save to Palette</Button>
      </div>
      <div className="w-64 border-l p-4 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Palette</h3>
          {palette.length > 0 && (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setPalette([]); localStorage.removeItem('color-palette'); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {palette.map((c, i) => (
            <button key={i} onClick={() => setColor(c)} className="aspect-square rounded-md border hover:scale-110 transition" style={{ background: c }} title={c} />
          ))}
        </div>
        {palette.length === 0 && <p className="text-xs text-muted-foreground">No saved colors</p>}
      </div>
    </div>
  );
}
