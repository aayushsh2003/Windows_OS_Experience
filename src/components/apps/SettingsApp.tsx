import { useState, useEffect, useContext } from 'react';
import { Monitor, Wifi, Palette, Bell, Shield, Battery, Info, User, Accessibility, Globe, BatteryFull, BatteryLow, BatteryMedium, Sun, Moon, Image } from 'lucide-react';
import { WallpaperContext, ThemeContext, defaultWallpapers } from '@/components/windows/Desktop';

const sections = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'network', label: 'Network & Internet', icon: Wifi },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'battery', label: 'Power & Battery', icon: Battery },
  { id: 'accounts', label: 'Accounts', icon: User },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'language', label: 'Time & Language', icon: Globe },
  { id: 'about', label: 'About', icon: Info },
];

export function SettingsApp() {
  const [active, setActive] = useState('system');
  const section = sections.find(s => s.id === active)!;
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        setBatteryInfo({ level: b.level, charging: b.charging });
        b.addEventListener('levelchange', () => setBatteryInfo({ level: b.level, charging: b.charging }));
      });
    }
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(e => setStorageInfo({ usage: e.usage || 0, quota: e.quota || 0 }));
    }
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const formatBytes = (b: number) => {
    if (b < 1e9) return (b / 1e6).toFixed(0) + ' MB';
    return (b / 1e9).toFixed(1) + ' GB';
  };

  return (
    <div className="flex h-full">
      <div className="w-52 bg-muted border-r border-border py-4 overflow-y-auto win-scrollbar shrink-0">
        <h2 className="px-4 text-sm font-semibold text-foreground mb-3">Settings</h2>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${active === s.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <s.icon className="w-4 h-4" />{s.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto win-scrollbar">
        <h1 className="text-xl font-semibold text-foreground mb-4">{section.label}</h1>
        <div className="space-y-3">
          {active === 'system' && (
            <>
              <SettingCard title="Display" desc={`Resolution: ${window.screen.width}×${window.screen.height} • Pixel Ratio: ${devicePixelRatio}x`} />
              <SettingCard title="Processor" desc={`${navigator.hardwareConcurrency || '?'} logical processors`} />
              <SettingCard title="Memory" desc={`${(navigator as any).deviceMemory ? (navigator as any).deviceMemory + ' GB device memory' : 'Not available'}`} />
              {storageInfo && <SettingCard title="Storage" desc={`${formatBytes(storageInfo.usage)} used of ${formatBytes(storageInfo.quota)} available`} />}
              <SettingCard title="Language" desc={navigator.language} />
              <SettingCard title="Platform" desc={navigator.userAgent.includes('Win') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown'} />
            </>
          )}
          {active === 'personalization' && <PersonalizationSettings />}
          {active === 'network' && (
            <>
              <div className="flex items-center gap-3 bg-muted rounded-lg p-4">
                <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-destructive'}`} />
                <div>
                  <p className="text-sm text-foreground font-medium">{online ? 'Connected' : 'Disconnected'}</p>
                  <p className="text-xs text-muted-foreground">{online ? 'You are connected to the internet' : 'No internet connection'}</p>
                </div>
              </div>
              {(navigator as any).connection && (
                <SettingCard
                  title="Connection Details"
                  desc={`Type: ${(navigator as any).connection.effectiveType || '?'} • Downlink: ${(navigator as any).connection.downlink || '?'} Mbps`}
                />
              )}
            </>
          )}
          {active === 'battery' && (
            batteryInfo ? (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {batteryInfo.level > 0.7 ? <BatteryFull className="w-6 h-6 text-green-500" /> :
                   batteryInfo.level > 0.3 ? <BatteryMedium className="w-6 h-6 text-yellow-500" /> :
                   <BatteryLow className="w-6 h-6 text-destructive" />}
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{Math.round(batteryInfo.level * 100)}%</p>
                    <p className="text-xs text-muted-foreground">{batteryInfo.charging ? '⚡ Charging' : 'On battery'}</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${batteryInfo.level > 0.3 ? 'bg-green-500' : 'bg-destructive'}`}
                    style={{ width: `${batteryInfo.level * 100}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Battery API not available in this browser.</p>
            )
          )}
          {active === 'notifications' && <NotificationSettings />}
          {active === 'about' && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-foreground font-medium">WebOS</p>
              <p className="text-xs text-muted-foreground mt-1">Edition: Web Professional</p>
              <p className="text-xs text-muted-foreground">Version: 11.0 Build 22631</p>
              <p className="text-xs text-muted-foreground">Cores: {navigator.hardwareConcurrency}</p>
              <p className="text-xs text-muted-foreground">Screen: {window.screen.width}×{window.screen.height}</p>
            </div>
          )}
          {!['system', 'network', 'battery', 'notifications', 'about', 'personalization'].includes(active) && (
            <p className="text-sm text-muted-foreground">{section.label} settings coming in a future update.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonalizationSettings() {
  const { wallpaperUrl, setWallpaperUrl } = useContext(WallpaperContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const handleCustomWallpaper = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setWallpaperUrl(url);
      }
    };
    input.click();
  };

  return (
    <>
      {/* Theme */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-foreground font-medium mb-3">Theme</p>
        <div className="flex gap-3">
          <button onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${theme === 'light' ? 'border-primary bg-background' : 'border-border bg-background hover:border-primary/50'}`}>
            <Sun className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-foreground">Light</span>
          </button>
          <button onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-card' : 'border-border bg-card hover:border-primary/50'}`}>
            <Moon className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-foreground">Dark</span>
          </button>
        </div>
      </div>

      {/* Wallpaper */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-foreground font-medium mb-3">Background</p>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {defaultWallpapers.map((wp, i) => (
            <button key={i} onClick={() => setWallpaperUrl(wp)}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${wallpaperUrl === wp ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
              <img src={wp} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        <button onClick={handleCustomWallpaper}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-secondary text-foreground rounded-lg hover:bg-secondary/80">
          <Image className="w-3.5 h-3.5" /> Browse custom wallpaper
        </button>
      </div>
    </>
  );
}

function NotificationSettings() {
  const [permission, setPermission] = useState(Notification?.permission || 'default');

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const sendTest = () => {
    new Notification('WebOS Notification', { body: 'Notifications are working! 🎉', icon: '/pwa-192.png' });
  };

  return (
    <div className="bg-muted rounded-lg p-4">
      <p className="text-sm text-foreground font-medium mb-2">Desktop Notifications</p>
      <p className="text-xs text-muted-foreground mb-3">
        Status: <span className={permission === 'granted' ? 'text-green-500' : 'text-yellow-500'}>{permission}</span>
      </p>
      {permission === 'default' && (
        <button onClick={requestPermission} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Enable Notifications
        </button>
      )}
      {permission === 'granted' && (
        <button onClick={sendTest} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Send Test Notification
        </button>
      )}
      {permission === 'denied' && (
        <p className="text-xs text-destructive">Notifications blocked. Please enable in browser settings.</p>
      )}
    </div>
  );
}

function SettingCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-between bg-muted rounded-lg p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
      <div>
        <p className="text-sm text-foreground font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="text-muted-foreground">›</span>
    </div>
  );
}
