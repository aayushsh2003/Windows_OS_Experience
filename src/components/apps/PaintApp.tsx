import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Paintbrush, Eraser, Square, Circle, Download, Trash2, Minus, 
  Undo2, Redo2, Pipette, PenTool, Triangle, Star, 
  ZoomIn, ZoomOut, Grid3X3, Palette, Move
} from 'lucide-react';

const COLORS = [
  '#000000','#404040','#808080','#c0c0c0','#ffffff',
  '#800000','#ff0000','#ff6b6b','#ff8800','#ffbb00',
  '#ffff00','#80ff00','#00c853','#00bcd4','#0000ff',
  '#4a148c','#9c27b0','#e91e63','#795548','#607d8b',
];

type Tool = 'brush' | 'eraser' | 'rect' | 'circle' | 'line' | 'eyedropper' | 'pen' | 'triangle' | 'star' | 'move';

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [drawing, setDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const history = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const [historyLen, setHistoryLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const saveHistory = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    history.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    if (history.current.length > 30) history.current.shift();
    redoStack.current = [];
    setHistoryLen(history.current.length);
    setRedoLen(0);
  };

  const undo = () => {
    if (history.current.length === 0) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    redoStack.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    const prev = history.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    setHistoryLen(history.current.length);
    setRedoLen(redoStack.current.length);
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    history.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    const next = redoStack.current.pop()!;
    ctx.putImageData(next, 0, 0);
    setHistoryLen(history.current.length);
    setRedoLen(redoStack.current.length);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const data = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      setCanvasSize({ w: canvas.width, h: canvas.height });
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (data) ctx.putImageData(data, 0, 0);
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = zoom / 100;
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const startDraw = (e: React.MouseEvent) => {
    if (tool === 'eyedropper') {
      const pos = getPos(e);
      const ctx = canvasRef.current!.getContext('2d')!;
      const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      setColor(hex);
      return;
    }
    saveHistory();
    setDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current!.getContext('2d')!;
    snapshot.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    if (tool === 'brush' || tool === 'eraser' || tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e);
    setCursorPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
    if (!drawing || !lastPos.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.globalAlpha = opacity / 100;

    if (tool === 'brush' || tool === 'eraser' || tool === 'pen') {
      ctx.lineWidth = tool === 'pen' ? Math.max(1, size / 2) : size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.putImageData(snapshot.current!, 0, 0);
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      const start = lastPos.current;
      const w = pos.x - start.x;
      const h = pos.y - start.y;

      if (tool === 'rect') {
        ctx.strokeRect(start.x, start.y, w, h);
      } else if (tool === 'circle') {
        const rx = Math.abs(w) / 2;
        const ry = Math.abs(h) / 2;
        ctx.beginPath();
        ctx.ellipse(start.x + w / 2, start.y + h / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(start.x + w / 2, start.y);
        ctx.lineTo(start.x + w, start.y + h);
        ctx.lineTo(start.x, start.y + h);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === 'star') {
        const cx = start.x + w / 2, cy = start.y + h / 2;
        const outerR = Math.min(Math.abs(w), Math.abs(h)) / 2;
        const innerR = outerR * 0.4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [drawing, tool, color, size, opacity, zoom]);

  const endDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    saveHistory();
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const saveImage = () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvasRef.current!.toDataURL();
    link.click();
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'brush', icon: <Paintbrush className="w-4 h-4" />, label: 'Brush' },
    { id: 'pen', icon: <PenTool className="w-4 h-4" />, label: 'Pen (fine)' },
    { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
    { id: 'eyedropper', icon: <Pipette className="w-4 h-4" />, label: 'Eyedropper' },
    { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
    { id: 'rect', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle className="w-4 h-4" />, label: 'Triangle' },
    { id: 'star', icon: <Star className="w-4 h-4" />, label: 'Star' },
  ];

  const cursorStyle = tool === 'eyedropper' ? 'crosshair' : tool === 'move' ? 'grab' : 'crosshair';

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/60">
        {/* Undo / Redo */}
        <button onClick={undo} disabled={historyLen === 0} title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-accent text-foreground disabled:opacity-30 transition-colors">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={redoLen === 0} title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-accent text-foreground disabled:opacity-30 transition-colors">
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Save & Clear */}
        <button onClick={saveImage} title="Save as PNG"
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={clearCanvas} title="Clear canvas"
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Zoom */}
        <button onClick={() => setZoom(z => Math.max(25, z - 25))} title="Zoom out"
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-muted-foreground w-8 text-center font-mono">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(400, z + 25))} title="Zoom in"
          className="p-1.5 rounded hover:bg-accent text-foreground transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Grid toggle */}
        <button onClick={() => setShowGrid(g => !g)} title="Toggle grid"
          className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'}`}>
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>

      {/* Main area with side toolbar */}
      <div className="flex flex-1 min-h-0">
        {/* Left Tool Panel */}
        <div className="w-10 border-r border-border bg-muted/40 flex flex-col items-center py-2 gap-0.5 shrink-0">
          {tools.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                tool === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}>
              {t.icon}
            </button>
          ))}

          <div className="w-6 h-px bg-border my-2" />

          {/* Size indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full bg-foreground" style={{ width: Math.min(size * 2, 20), height: Math.min(size * 2, 20) }} />
            <span className="text-[9px] text-muted-foreground">{size}px</span>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={containerRef} className="flex-1 overflow-auto bg-secondary/30 relative" style={{ cursor: cursorStyle }}>
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: 'linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
            )}
            <canvas ref={canvasRef}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-44 border-l border-border bg-muted/40 flex flex-col p-2 gap-3 shrink-0 overflow-y-auto">
          {/* Colors */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Palette className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Colors</span>
            </div>

            {/* Primary / Secondary color */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-8 h-8">
                <div className="absolute top-0 left-0 w-6 h-6 rounded border-2 border-background shadow-sm z-10"
                  style={{ background: color }} title="Primary color" />
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded border-2 border-background shadow-sm"
                  style={{ background: secondaryColor }} title="Secondary color" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none p-0" title="Primary" />
                  <span className="text-[9px] text-muted-foreground font-mono">{color}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none p-0" title="Secondary" />
                  <span className="text-[9px] text-muted-foreground font-mono">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Color palette */}
            <div className="grid grid-cols-5 gap-0.5">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-sm border transition-all ${
                    color === c ? 'border-foreground ring-1 ring-primary scale-110' : 'border-border/60 hover:scale-105'
                  }`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Size</span>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={1} max={40} value={size} onChange={e => setSize(+e.target.value)}
                className="flex-1 h-1.5 accent-primary cursor-pointer" />
              <span className="text-[10px] text-foreground font-mono w-6 text-right">{size}</span>
            </div>
            {/* Size presets */}
            <div className="flex gap-1 mt-1.5">
              {[1, 3, 5, 10, 20].map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`flex-1 text-[9px] py-0.5 rounded transition-colors ${
                    size === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Opacity</span>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)}
                className="flex-1 h-1.5 accent-primary cursor-pointer" />
              <span className="text-[10px] text-foreground font-mono w-8 text-right">{opacity}%</span>
            </div>
          </div>

          {/* Quick shapes info */}
          <div className="mt-auto pt-2 border-t border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Shortcuts</span>
            <div className="mt-1 space-y-0.5 text-[9px] text-muted-foreground">
              <div>Ctrl+Z — Undo</div>
              <div>Ctrl+Y — Redo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-muted/60 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{canvasSize.w} × {canvasSize.h}px</span>
          <span>Pos: {cursorPos.x}, {cursorPos.y}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="capitalize">{tool}</span>
          <span>{zoom}%</span>
        </div>
      </div>
    </div>
  );
}
