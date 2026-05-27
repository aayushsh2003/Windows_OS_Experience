# 🪟 Windows OS Experience


[![Window OS Preview](https://windows-os-experience.vercel.app/preview.png)](https://windows-os-experience.vercel.app/)

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38BDF8)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

A pixel-faithful, fully in-browser recreation of a modern Windows 11–style desktop, built as a Progressive Web App. Boot screen, lock screen, taskbar, Start menu, Snap Layouts, Task View, Command Palette, Quick Settings, Widgets, Notification Center — plus 35+ working apps, all client-side.

---

# 🚀 Live Demo

🌐 https://windows-os-experience.vercel.app/

---

---

## ✨ Highlights

- **True Win11 shell** — boot animation, PIN lock screen, taskbar with system tray, Start menu, Widgets panel, Quick Settings, Notification Center, Task View (Alt+Tab), context menus, Snap Layouts, Mica/acrylic glass effects.
- **Global Command Palette** (`Ctrl/Win + K`) for fuzzy-launching apps and running system commands.
- **Keyboard shortcuts** — `Alt+F4`, `Ctrl+Shift+Esc`, `Ctrl+L`, `Ctrl+D`, `Ctrl+E`, `Win`, `Alt+Tab`, `Ctrl+K`.
- **Free-form desktop icons** with drag-and-drop and per-icon position persistence.
- **System sounds** via Web Audio (toggleable).
- **Dark / light theme** with semantic design tokens (HSL throughout `index.css` + `tailwind.config.ts`).
- **PWA-ready** with manifest, robots.txt, sitemap, JSON-LD structured data, OG/Twitter cards.
- **Lazy-loaded apps** via `React.lazy` + `Suspense` — only what you open is downloaded.
- **Local-first** — settings, files, notes, calendar events, high scores all persist via `localStorage` / Zustand.

---

## 🧰 The App Suite (35+ apps)

| Category | Apps |
|---|---|
| **Productivity** | Notepad, WordPad, Spreadsheet (formulas + CSV export), Markdown Notes (live preview), Whiteboard (canvas + PNG export), PDF Reader, Sticky Notes, To-Do, Focus Timer, Calendar (multi-view), Clock, Contacts |
| **Creative** | Paint (undo/redo, multi-pane), Photos, Camera, Voice Recorder, Snipping Tool |
| **Media** | Music Player, Video Player |
| **Internet** | Edge Browser, Mail, Chat, News, Maps (Leaflet + routing + weather), Weather |
| **System** | File Explorer (hybrid local/virtual FS), Settings, Task Manager, System Monitor, Terminal, Clipboard, Recycle Bin, About This PC, Store |
| **Developer** | Code Editor (modern editor features) |
| **Games** | Game Center: 2048, Snake, Minesweeper, Tic-Tac-Toe, Memory, Typing |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Win` | Toggle Start menu |
| `Ctrl/Win + K` | Command Palette |
| `Ctrl + E` | Search overlay |
| `Ctrl + L` | Lock screen |
| `Ctrl + D` | Show desktop (minimize all) |
| `Alt + Tab` | Task View |
| `Alt + F4` | Close active window |
| `Ctrl + Shift + Esc` | Task Manager |

---

## 🏗️ Tech Stack

- **React 18** + **TypeScript 5** + **Vite 5**
- **Tailwind CSS v3** + **shadcn/ui** (Radix primitives)
- **Zustand** for global state (windows, apps, filesystem, settings)
- **React Leaflet** (v4.2.1, React 18-compatible) for Maps
- **lucide-react** for iconography
- **Web Audio API** for system sounds
- **localStorage** for persistence (filesystem, settings, icon layout, notes, events, high scores)

---


# 🏛️ Architecture

* Window Management System
* Zustand Global Stores
* Lazy-loaded Applications
* Persistent Local Storage
* Modular App Registry
* Desktop Shell Layer
* Reusable UI Components
* Keyboard Shortcut Engine

---

## 📁 Project Structure

```
src/
├── components/
│   ├── apps/              # 35+ individual app components
│   │   ├── file-explorer/ # File Explorer subcomponents + FS hook
│   │   ├── games/         # Game Center games
│   │   └── maps/          # Maps subcomponents
│   ├── windows/           # OS shell: Desktop, Taskbar, StartMenu,
│   │                      # Window, BootScreen, LockScreen,
│   │                      # CommandPalette, QuickSettings, TaskView,
│   │                      # NotificationCenter, WidgetsPanel, ...
│   └── ui/                # shadcn/ui primitives
├── stores/                # Zustand stores (window / app / filesystem)
├── hooks/                 # useWindowManager, useKeyboardShortcuts, ...
├── lib/                   # sounds.ts + utils
├── data/apps.ts           # App registry (id, title, icon, defaults)
├── types/windows.ts       # Window & AppDef types
└── pages/                 # Index, NotFound
public/
├── manifest.webmanifest   # PWA manifest
├── robots.txt
└── sitemap.xml
```

---

---

## 🎨 Design System

All colors are **HSL semantic tokens** defined in `src/index.css` and surfaced via `tailwind.config.ts` — never hard-code `text-white` / `bg-black` in components. Glass surfaces use the `.win-glass` utility (40–50px backdrop-blur + saturation/contrast for the Mica feel). Light + dark themes are first-class.

---

## 🔍 SEO & PWA

- Branded `<title>`, meta description, keywords, canonical URL, robots directives
- Open Graph + Twitter card tags
- JSON-LD: **WebApplication**, **WebSite** (with SearchAction), **Organization**
- `manifest.webmanifest` with icons + theme color `#0078d4`
- `robots.txt` + `sitemap.xml`

---

## 🧑‍💻 Author

Built by **Aayush Sharma**. See the **About This PC** app inside the OS for details.

---



## 📄 License

MIT — feel free to fork, remix, and build on top.
