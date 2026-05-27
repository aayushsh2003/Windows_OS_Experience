export interface VirtualItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  content?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface VirtualFS {
  [path: string]: VirtualItem[];
}

export type ViewMode = 'list' | 'grid';
export type ExplorerMode = 'virtual' | 'native';
export type SidebarSection = 'quick-access' | 'this-pc' | 'my-files';

export const DEFAULT_FS: VirtualFS = {
  '/': [
    { name: 'Documents', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Pictures', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Music', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Videos', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Downloads', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Desktop', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'readme.txt', type: 'file', size: '1.2 KB', content: 'Welcome to WebOS File Explorer!\nYou can create files and folders here.\nAll data is saved in your browser.', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
  ],
  '/Documents': [
    { name: 'notes.txt', type: 'file', size: '256 B', content: 'My personal notes...', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
    { name: 'Work', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
  ],
  '/Pictures': [
    { name: 'Screenshots', type: 'folder', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
  ],
  '/Music': [],
  '/Videos': [],
  '/Downloads': [],
  '/Desktop': [],
  '/Documents/Work': [
    { name: 'project.txt', type: 'file', size: '512 B', content: 'Project documentation goes here.', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() },
  ],
  '/Pictures/Screenshots': [],
};

export function loadFS(): VirtualFS {
  try {
    const saved = localStorage.getItem('webos-fs');
    if (saved) return JSON.parse(saved);
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_FS));
}

export function saveFS(fs: VirtualFS) {
  localStorage.setItem('webos-fs', JSON.stringify(fs));
}

export function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(name: string): boolean {
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(getFileExtension(name));
}

export function isAudioFile(name: string): boolean {
  return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(getFileExtension(name));
}

export function isVideoFile(name: string): boolean {
  return ['mp4', 'avi', 'mkv', 'mov', 'webm', 'ogg', 'ogv'].includes(getFileExtension(name));
}

export function isPdfFile(name: string): boolean {
  return getFileExtension(name) === 'pdf';
}

export function isTextFile(name: string): boolean {
  return ['txt', 'md', 'json', 'js', 'ts', 'css', 'html', 'xml', 'csv', 'log', 'py', 'java', 'c', 'cpp', 'h', 'jsx', 'tsx', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'sh', 'bat', 'sql', 'rb', 'go', 'rs', 'swift', 'kt'].includes(getFileExtension(name));
}

export type PreviewType = 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'office' | 'unsupported';

export function isOfficeFile(name: string): boolean {
  return ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp', 'rtf'].includes(getFileExtension(name));
}

export function getPreviewType(name: string): PreviewType {
  if (isTextFile(name)) return 'text';
  if (isImageFile(name)) return 'image';
  if (isAudioFile(name)) return 'audio';
  if (isVideoFile(name)) return 'video';
  if (isPdfFile(name)) return 'pdf';
  if (isOfficeFile(name)) return 'office';
  return 'unsupported';
}

export function getOfficeFileLabel(name: string): string {
  const ext = getFileExtension(name);
  const labels: Record<string, string> = {
    doc: 'Word Document', docx: 'Word Document',
    ppt: 'PowerPoint', pptx: 'PowerPoint',
    xls: 'Excel Spreadsheet', xlsx: 'Excel Spreadsheet',
    odt: 'OpenDocument Text', ods: 'OpenDocument Spreadsheet', odp: 'OpenDocument Presentation',
    rtf: 'Rich Text Format',
  };
  return labels[ext] || 'Office Document';
}
