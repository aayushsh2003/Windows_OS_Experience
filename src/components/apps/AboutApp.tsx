import { Monitor, Code, Heart, ExternalLink, Github, Linkedin, Instagram, Twitter } from 'lucide-react';

const DEV_PHOTO = 'https://github.com/aayushsh2003/AIClassOf26/blob/main/rbi_aayush.png?raw=true';

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/aayush-sharma-a44062299/' },
  { icon: Github, label: 'GitHub', url: 'https://github.com/aayushsh2003' },
  { icon: Instagram, label: 'Instagram', url: 'https://www.instagram.com/aayushsh2003' },
  { icon: Twitter, label: 'Twitter/X', url: 'https://x.com/aayushSh2003' },
];

export function AboutApp() {
  return (
    <div className="h-full overflow-y-auto win-scrollbar p-6 bg-background">
      {/* System info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
          <Monitor className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">WebOS</h1>
          <p className="text-sm text-muted-foreground">Windows-like Web Operating System</p>
          <p className="text-xs text-muted-foreground mt-1">Version 11.0 Build 22631</p>
        </div>
      </div>

      {/* System specs */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">System Information</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground">Platform</div>
          <div className="text-foreground">Web Browser</div>
          <div className="text-muted-foreground">Engine</div>
          <div className="text-foreground">React + TypeScript</div>
          <div className="text-muted-foreground">UI Framework</div>
          <div className="text-foreground">Tailwind CSS</div>
          <div className="text-muted-foreground">Screen Resolution</div>
          <div className="text-foreground">{window.screen.width}×{window.screen.height}</div>
          <div className="text-muted-foreground">User Agent</div>
          <div className="text-foreground truncate">{navigator.userAgent.slice(0, 50)}...</div>
        </div>
      </div>

      {/* Developer Info */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Code className="w-4 h-4" /> Developer
        </h3>
        <div className="flex items-start gap-4">
          <img
            src={DEV_PHOTO}
            alt="Aayush Sharma"
            className="w-20 h-20 rounded-xl object-cover border-2 border-border shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">Aayush Sharma</h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Aspiring Software Developer | Web Development Enthusiast | Passionate About Open-Source & AI | CSE (AI) Student
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-secondary text-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </a>
              ))}
            </div>
            <a
              href="https://aayush-ki-pehchan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Portfolio Website
            </a>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Built With</h3>
        <div className="flex flex-wrap gap-1.5">
          {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Lucide Icons', 'PWA'].map(tech => (
            <span key={tech} className="px-2.5 py-1 text-[11px] bg-secondary text-foreground rounded-full">{tech}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-muted rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Features</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            'Draggable & resizable windows', 'Start Menu with search', 'Taskbar with indicators',
            'File Explorer', 'Notepad & WordPad', 'Calculator', 'Terminal with commands',
            'Web Browser', 'Paint app', 'Games (Snake, Minesweeper, Tic-Tac-Toe)',
            'Mail client', 'Music & Video Player', 'Camera access', 'Weather (live)',
            'System Monitor', 'Task Manager', 'Settings panel', 'Dark/Light theme',
            'Custom wallpapers', 'Lock screen with PIN', 'Notification center',
            'Widgets panel', 'Window snapping', 'PWA installable', 'Clipboard Manager',
          ].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary text-[10px]">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        Made with <Heart className="w-3 h-3 text-destructive" /> by Aayush Sharma
      </div>
    </div>
  );
}
