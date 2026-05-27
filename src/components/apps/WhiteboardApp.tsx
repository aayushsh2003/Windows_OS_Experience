import { useRef, useState, useEffect } from 'react';
import { Pen, Square, Circle, Type, Eraser, Trash2, Download, Undo } from 'lucide-react';

type Tool = 'pen' | 'rect' | 'circle' | 'text' | 'eraser';

export function WhiteboardApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [size, setSize] = useState(3);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);
  const history = useRef<ImageData[]>([]);

  useEffect(() => {
    const c = canvasRef.current!;
    const resize = () => {
      const rect = c.getBoundingClientRect();
      const data = c.getContext('2d')?.getImageData(0, 0, c.width, c.height);
      c.width = rect.width;
      c.height = rect.height;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      if (data) try { ctx.putImageData(data, 0, 0); } catch {}
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pushHistory = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 30) history.current.shift();
  };

  const pos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.MouseEvent) => {
    pushHistory();
    drawing.current = true;
    start.current = pos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    if (tool === 'text') {
      const txt = prompt('Enter text:');
      if (txt) {
        ctx.fillStyle = color;
        ctx.font = `${size * 5}px sans-serif`;
        ctx.fillText(txt, start.current.x, start.current.y);
      }
      drawing.current = false;
      return;
    }
    if (tool === 'rect' || tool === 'circle') {
      snapshot.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(start.current.x, start.current.y);
    }
  };

  const move = (e: React.MouseEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 4;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if ((tool === 'rect' || tool === 'circle') && snapshot.current) {
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      if (tool === 'rect') {
        ctx.strokeRect(start.current.x, start.current.y, p.x - start.current.x, p.y - start.current.y);
      } else {
        ctx.beginPath();
        const rx = Math.abs(p.x - start.current.x) / 2;
        const ry = Math.abs(p.y - start.current.y) / 2;
        ctx.ellipse((start.current.x + p.x) / 2, (start.current.y + p.y) / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const up = () => { drawing.current = false; snapshot.current = null; };

  const undo = () => {
    const last = history.current.pop();
    if (last) canvasRef.current!.getContext('2d')!.putImageData(last, 0, 0);
  };

  const clear = () => {
    pushHistory();
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const download = () => {
    const url = canvasRef.current!.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'whiteboard.png'; a.click();
  };

  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/40 flex-wrap">
        {tools.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
            className={`p-1.5 rounded ${tool === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
            <t.icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-border" />
        <input type="range" min={1} max={20} value={size} onChange={e => setSize(+e.target.value)} className="w-20" />
        <span className="text-xs text-muted-foreground w-6">{size}px</span>
        <div className="flex-1" />
        <button onClick={undo} className="p-1.5 rounded hover:bg-secondary" title="Undo"><Undo className="w-3.5 h-3.5" /></button>
        <button onClick={clear} className="p-1.5 rounded hover:bg-secondary" title="Clear"><Trash2 className="w-3.5 h-3.5" /></button>
        <button onClick={download} className="p-1.5 rounded hover:bg-secondary" title="Download"><Download className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <canvas ref={canvasRef} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          className="w-full h-full cursor-crosshair" />
      </div>
    </div>
  );
}
