import { useState, useRef, useCallback } from 'react';
import { Camera, Download, Copy, Scissors, Monitor } from 'lucide-react';

export function SnippingToolApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const captureScreen = useCallback(async () => {
    try {
      setCapturing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait a moment for the video to be ready
      await new Promise(r => setTimeout(r, 200));

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);

      stream.getTracks().forEach(t => t.stop());
      setScreenshot(canvas.toDataURL('image/png'));
    } catch {
      // User cancelled
    } finally {
      setCapturing(false);
    }
  }, []);

  const downloadScreenshot = () => {
    if (!screenshot) return;
    const a = document.createElement('a');
    a.href = screenshot;
    a.download = `screenshot-${Date.now()}.png`;
    a.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob(b => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted">
        <button
          onClick={captureScreen}
          disabled={capturing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Scissors className="w-3.5 h-3.5" />
          {capturing ? 'Capturing...' : 'New Snip'}
        </button>
        {screenshot && (
          <>
            <button onClick={downloadScreenshot} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-foreground hover:bg-secondary transition-colors">
              <Download className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={copyToClipboard} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-foreground hover:bg-secondary transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </>
        )}
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto win-scrollbar flex items-center justify-center bg-muted/30 p-4">
        {screenshot ? (
          <img src={screenshot} alt="Screenshot" className="max-w-full max-h-full rounded shadow-lg" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Monitor className="w-12 h-12 opacity-30" />
            <p className="text-sm">Click "New Snip" to capture your screen</p>
            <p className="text-xs opacity-60">You'll be prompted to select a screen or window</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
