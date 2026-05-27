export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  isActive: boolean;
}

export interface AppDef {
  id: string;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  desktopIcon?: boolean;
  startMenu?: boolean;
}
