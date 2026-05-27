import { create } from 'zustand';
import { VirtualFS, VirtualItem, loadFS, saveFS } from '@/components/apps/file-explorer/types';

interface FileSystemStore {
  fs: VirtualFS;
  getItems: (path: string) => VirtualItem[];
  navigate: (currentPath: string, folderName: string) => string;
  createFolder: (currentPath: string, name: string) => boolean;
  createFile: (currentPath: string, name: string) => boolean;
  deleteItem: (currentPath: string, itemName: string) => void;
  renameItem: (currentPath: string, oldName: string, newName: string) => boolean;
  saveFile: (currentPath: string, fileName: string, content: string) => void;
  moveItem: (fromPath: string, toPath: string, itemName: string) => boolean;
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  fs: loadFS(),

  getItems: (path: string) => get().fs[path] || [],

  navigate: (currentPath: string, folderName: string): string => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    const { fs } = get();
    if (!fs[newPath]) {
      const next = { ...fs, [newPath]: [] };
      set({ fs: next });
      saveFS(next);
    }
    return newPath;
  },

  createFolder: (currentPath: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const { fs } = get();
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed)) return false;
    const now = new Date().toISOString();
    const newItem: VirtualItem = { name: trimmed, type: 'folder', createdAt: now, modifiedAt: now };
    const folderPath = currentPath === '/' ? `/${trimmed}` : `${currentPath}/${trimmed}`;
    const next = {
      ...fs,
      [currentPath]: [...(fs[currentPath] || []), newItem],
      [folderPath]: [],
    };
    set({ fs: next });
    saveFS(next);
    return true;
  },

  createFile: (currentPath: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const { fs } = get();
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed)) return false;
    const now = new Date().toISOString();
    const newItem: VirtualItem = { name: trimmed, type: 'file', size: '0 B', content: '', createdAt: now, modifiedAt: now };
    const next = {
      ...fs,
      [currentPath]: [...(fs[currentPath] || []), newItem],
    };
    set({ fs: next });
    saveFS(next);
    return true;
  },

  deleteItem: (currentPath: string, itemName: string) => {
    const { fs } = get();
    const next = { ...fs };
    const item = (next[currentPath] || []).find(i => i.name === itemName);
    next[currentPath] = (next[currentPath] || []).filter(i => i.name !== itemName);
    if (item?.type === 'folder') {
      const prefix = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
      Object.keys(next).forEach(k => {
        if (k === prefix || k.startsWith(prefix + '/')) delete next[k];
      });
    }
    set({ fs: next });
    saveFS(next);
  },

  renameItem: (currentPath: string, oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const { fs } = get();
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed && i.name !== oldName)) return false;
    const item = items.find(i => i.name === oldName);
    if (!item) return false;

    const next = { ...fs };
    next[currentPath] = (next[currentPath] || []).map(i =>
      i.name === oldName ? { ...i, name: trimmed, modifiedAt: new Date().toISOString() } : i
    );
    if (item.type === 'folder') {
      const oldPrefix = currentPath === '/' ? `/${oldName}` : `${currentPath}/${oldName}`;
      const newPrefix = currentPath === '/' ? `/${trimmed}` : `${currentPath}/${trimmed}`;
      const keysToRename = Object.keys(next).filter(k => k === oldPrefix || k.startsWith(oldPrefix + '/'));
      keysToRename.forEach(k => {
        const newKey = newPrefix + k.slice(oldPrefix.length);
        next[newKey] = next[k];
        delete next[k];
      });
    }
    set({ fs: next });
    saveFS(next);
    return true;
  },

  saveFile: (currentPath: string, fileName: string, content: string) => {
    const { fs } = get();
    const next = {
      ...fs,
      [currentPath]: (fs[currentPath] || []).map(i =>
        i.name === fileName ? { ...i, content, size: `${new Blob([content]).size} B`, modifiedAt: new Date().toISOString() } : i
      ),
    };
    set({ fs: next });
    saveFS(next);
  },

  moveItem: (fromPath: string, toPath: string, itemName: string): boolean => {
    const { fs } = get();
    const fromItems = fs[fromPath] || [];
    const toItems = fs[toPath] || [];
    const item = fromItems.find(i => i.name === itemName);
    if (!item || toItems.some(i => i.name === itemName)) return false;
    if (fromPath === toPath) return false;

    const next = { ...fs };
    next[fromPath] = (next[fromPath] || []).filter(i => i.name !== itemName);
    next[toPath] = [...(next[toPath] || []), { ...item, modifiedAt: new Date().toISOString() }];
    if (item.type === 'folder') {
      const oldPrefix = fromPath === '/' ? `/${itemName}` : `${fromPath}/${itemName}`;
      const newPrefix = toPath === '/' ? `/${itemName}` : `${toPath}/${itemName}`;
      const keysToMove = Object.keys(next).filter(k => k === oldPrefix || k.startsWith(oldPrefix + '/'));
      keysToMove.forEach(k => {
        const newKey = newPrefix + k.slice(oldPrefix.length);
        next[newKey] = next[k];
        delete next[k];
      });
    }
    set({ fs: next });
    saveFS(next);
    return true;
  },
}));
