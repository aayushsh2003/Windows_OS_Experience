import wallpaper from '@/assets/wallpaper.jpg';
import { useState } from 'react';
import { FolderOpen, ZoomIn, ZoomOut, RotateCw, Download, Trash2 } from 'lucide-react';

export function PhotosApp() {
  const [images, setImages] = useState<{ name: string; url: string }[]>([
    { name: 'Wallpaper', url: wallpaper },
  ]);
  const [selected, setSelected] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const openImages = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'] } }],
        });
        for (const handle of handles) {
          const file = await handle.getFile();
          const url = URL.createObjectURL(file);
          setImages(prev => [...prev, { name: file.name, url }]);
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = () => {
          const files = Array.from(input.files || []);
          files.forEach(file => {
            const url = URL.createObjectURL(file);
            setImages(prev => [...prev, { name: file.name, url }]);
          });
        };
        input.click();
      }
    } catch {}
  };

  const deleteImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setSelected(null);
  };

  if (selected !== null && images[selected]) {
    const img = images[selected];
    return (
      <div className="h-full flex flex-col bg-black">
        <div className="flex items-center gap-1 px-3 py-2 bg-black/80">
          <button onClick={() => { setSelected(null); setZoom(1); setRotation(0); }} className="text-xs text-white/70 hover:text-white mr-auto">← Back</button>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 rounded hover:bg-white/10 text-white/70"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1.5 rounded hover:bg-white/10 text-white/70"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setRotation(r => r + 90)} className="p-1.5 rounded hover:bg-white/10 text-white/70"><RotateCw className="w-4 h-4" /></button>
          <a href={img.url} download={img.name} className="p-1.5 rounded hover:bg-white/10 text-white/70"><Download className="w-4 h-4" /></a>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img
            src={img.url}
            alt={img.name}
            className="max-w-none transition-transform"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          />
        </div>
        <div className="px-3 py-1 bg-black/80 text-[10px] text-white/40 text-center">{img.name} • {Math.round(zoom * 100)}%</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Photos</h2>
        <button onClick={openImages} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-muted transition-colors">
          <FolderOpen className="w-3.5 h-3.5" /> Add Photos
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto win-scrollbar">
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all group relative"
            >
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {i > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); deleteImage(i); }}
                  className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
