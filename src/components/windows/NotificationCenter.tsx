import { useState } from 'react';
import { Wifi, WifiOff, Bluetooth, BluetoothOff, Moon, Sun, Monitor, Plane, Volume2, VolumeX, X } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [toggles, setToggles] = useState({
    wifi: true,
    bluetooth: false,
    nightLight: false,
    airplaneMode: false,
    sound: true,
    focusAssist: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(65);

  const quickSettings = [
    { key: 'wifi' as const, label: 'Wi-Fi', iconOn: Wifi, iconOff: WifiOff },
    { key: 'bluetooth' as const, label: 'Bluetooth', iconOn: Bluetooth, iconOff: BluetoothOff },
    { key: 'nightLight' as const, label: 'Night Light', iconOn: Moon, iconOff: Moon },
    { key: 'airplaneMode' as const, label: 'Airplane', iconOn: Plane, iconOff: Plane },
    { key: 'sound' as const, label: 'Sound', iconOn: Volume2, iconOff: VolumeX },
    { key: 'focusAssist' as const, label: 'Focus', iconOn: Monitor, iconOff: Monitor },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[9997]" onClick={onClose} />
      <div className="fixed bottom-14 right-2 w-80 z-[9998] win-glass win-shadow rounded-xl p-4 start-menu-animate">
        {/* Quick toggles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickSettings.map(qs => {
            const active = toggles[qs.key];
            const Icon = active ? qs.iconOn : qs.iconOff;
            return (
              <button
                key={qs.key}
                onClick={() => toggle(qs.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted hover:bg-secondary text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{qs.label}</span>
              </button>
            );
          })}
        </div>

        {/* Brightness slider */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sun className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Brightness</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={e => setBrightness(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none bg-secondary accent-primary cursor-pointer"
          />
        </div>

        {/* Volume slider */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Volume</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none bg-secondary accent-primary cursor-pointer"
          />
        </div>

        {/* Notifications */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Notifications</span>
            <button className="text-[10px] text-primary hover:underline">Clear all</button>
          </div>
          <div className="space-y-2">
            <NotifItem icon="🔒" title="Security" msg="Windows Defender is up to date" time="2m ago" />
            <NotifItem icon="💾" title="Storage" msg="Backup completed successfully" time="15m ago" />
            <NotifItem icon="🔄" title="Updates" msg="System is up to date" time="1h ago" />
          </div>
        </div>
      </div>
    </>
  );
}

function NotifItem({ icon, title, msg, time }: { icon: string; title: string; msg: string; time: string }) {
  return (
    <div className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/60 hover:bg-muted transition-colors">
      <span className="text-sm mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{msg}</p>
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}
