import { ZoomIn, ZoomOut, Locate, Layers, Menu, Share2, Navigation, Ruler } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onToggleStyle: () => void;
  onToggleSidebar: () => void;
  onShare: () => void;
  onStartRouting: () => void;
  onToggleMeasure: () => void;
  isTracking: boolean;
  isMeasuring: boolean;
  styleName: string;
}

export function MapControls({
  onZoomIn, onZoomOut, onLocate, onToggleStyle,
  onToggleSidebar, onShare, onStartRouting, onToggleMeasure,
  isTracking, isMeasuring, styleName
}: MapControlsProps) {
  const Btn = ({ onClick, children, title, active }: { onClick: () => void; children: React.ReactNode; title: string; active?: boolean }) => (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 flex items-center justify-center rounded-xl shadow-md border border-border transition-all hover:scale-105 ${active ? 'bg-primary text-primary-foreground' : 'bg-background/95 backdrop-blur-xl text-foreground hover:bg-muted'}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <Btn onClick={onToggleSidebar} title="Menu">
          <Menu className="w-4 h-4" />
        </Btn>
      </div>

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <Btn onClick={onZoomIn} title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </Btn>
        <Btn onClick={onZoomOut} title="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </Btn>
        <div className="h-px bg-border mx-1" />
        <Btn onClick={onLocate} title="My location" active={isTracking}>
          <Locate className="w-4 h-4" />
        </Btn>
        <Btn onClick={onToggleStyle} title={`Style: ${styleName}`}>
          <Layers className="w-4 h-4" />
        </Btn>
        <Btn onClick={onStartRouting} title="Route">
          <Navigation className="w-4 h-4" />
        </Btn>
        <Btn onClick={onToggleMeasure} title="Measure distance" active={isMeasuring}>
          <Ruler className="w-4 h-4" />
        </Btn>
        <Btn onClick={onShare} title="Share location">
          <Share2 className="w-4 h-4" />
        </Btn>
      </div>
    </>
  );
}
