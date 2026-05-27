import { useState, useContext } from 'react';
import { Wifi, Bluetooth, Monitor, Moon, Sun, Plane, Volume2, VolumeX, Battery, Accessibility, MapPin, RotateCcw } from 'lucide-react';
import { ThemeContext } from './Desktop';

interface QuickSettingsProps {
  onClose: () => void;
}

export function QuickSettings({ onClose }: QuickSettingsProps) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);
  const [location, setLocation] = useState(true);
  const [nightLight, setNightLight] = useState(false);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [muted, setMuted] = useState(false);

  const tiles = [
    { icon: Wifi, label: 'Wi-Fi', active: wifi, toggle: () => setWifi(p => !p), sub: wifi ? 'Connected' : 'Off' },
    { icon: Bluetooth, label: 'Bluetooth', active: bluetooth, toggle: () => setBluetooth(p => !p), sub: bluetooth ? 'On' : 'Off' },
    { icon: Plane, label: 'Airplane', active: airplane, toggle: () => setAirplane(p => !p) },
    { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? 'Light mode' : 'Dark mode', active: false, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { icon: Monitor, label: 'Night light', active: nightLight, toggle: () => setNightLight(p => !p) },
    { icon: MapPin, label: 'Location', active: location, toggle: () => setLocation(p => !p) },
    { icon: Accessibility, label: 'Accessibility', active: false, toggle: () => {} },
    { icon: RotateCcw, label: 'Rotation lock', active: false, toggle: () => {} },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[9990]" onClick={onClose} />
      <div className="fixed bottom-14 right-2 w-[360px] z-[9991] win-glass win-shadow rounded-xl p-4 start-menu-animate">
        {/* Quick tiles */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {tiles.map(tile => (
            <button
              key={tile.label}
              onClick={tile.toggle}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all text-xs ${
                tile.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/60 text-foreground hover:bg-secondary'
              }`}
            >
              <tile.icon className="w-4 h-4" />
              <span className="truncate w-full text-center text-[10px] leading-tight">{tile.label}</span>
            </button>
          ))}
        </div>

        {/* Brightness slider */}
        <div className="flex items-center gap-3 px-2 mb-2">
          <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="range" min={0} max={100} value={brightness}
            onChange={e => setBrightness(+e.target.value)}
            className="flex-1 h-1 accent-primary cursor-pointer"
          />
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-3 px-2 mb-3">
          <button onClick={() => setMuted(m => !m)} className="shrink-0">
            {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
          </button>
          <input
            type="range" min={0} max={100} value={muted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); setMuted(false); }}
            className="flex-1 h-1 accent-primary cursor-pointer"
          />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Battery className="w-4 h-4" />
            <span>85%</span>
          </div>
        </div>
      </div>
    </>
  );
}
