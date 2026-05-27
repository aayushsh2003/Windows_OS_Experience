import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Video, FlipHorizontal, Download, X, Circle } from 'lucide-react';

export function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setError(null);
    } catch (e) {
      setError('Camera access denied or not available');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/png'));
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo;
    a.download = `photo-${Date.now()}.png`;
    a.click();
  };

  const flipCamera = () => {
    setFacingMode(f => f === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex flex-col h-full bg-foreground/95 relative">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Camera className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={startCamera} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">
            Try Again
          </button>
        </div>
      ) : photo ? (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <img src={photo} alt="Captured" className="max-w-full max-h-full object-contain" />
          <div className="absolute bottom-4 flex gap-3">
            <button onClick={() => setPhoto(null)} className="p-3 rounded-full bg-background/80 backdrop-blur">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={downloadPhoto} className="p-3 rounded-full bg-primary">
              <Download className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover w-full" />
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6">
            <button onClick={flipCamera} className="p-3 rounded-full bg-background/30 backdrop-blur">
              <FlipHorizontal className="w-5 h-5 text-primary-foreground" />
            </button>
            <button onClick={takePhoto} className="w-16 h-16 rounded-full border-4 border-background/80 bg-background/30 backdrop-blur flex items-center justify-center">
              <Circle className="w-12 h-12 text-primary-foreground fill-primary-foreground/20" />
            </button>
            <div className="w-11" />
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
