import { useState, useEffect, useCallback } from 'react';
import { VirtualFS, VirtualItem, loadFS, saveFS } from './types';

export function useFileSystem() {
  const [fs, setFs] = useState<VirtualFS>(loadFS);

  useEffect(() => { saveFS(fs); }, [fs]);

  const getItems = useCallback((path: string) => fs[path] || [], [fs]);

  const navigate = useCallback((currentPath: string, folderName: string): string => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    if (!fs[newPath]) {
      setFs(prev => ({ ...prev, [newPath]: [] }));
    }
    return newPath;
  }, [fs]);

  const createFolder = useCallback((currentPath: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed)) return false;
    const now = new Date().toISOString();
    const newItem: VirtualItem = { name: trimmed, type: 'folder', createdAt: now, modifiedAt: now };
    const folderPath = currentPath === '/' ? `/${trimmed}` : `${currentPath}/${trimmed}`;
    setFs(prev => ({
      ...prev,
      [currentPath]: [...(prev[currentPath] || []), newItem],
      [folderPath]: [],
    }));
    return true;
  }, [fs]);

  const createFile = useCallback((currentPath: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed)) return false;
    const now = new Date().toISOString();
    const newItem: VirtualItem = { name: trimmed, type: 'file', size: '0 B', content: '', createdAt: now, modifiedAt: now };
    setFs(prev => ({
      ...prev,
      [currentPath]: [...(prev[currentPath] || []), newItem],
    }));
    return true;
  }, [fs]);

  const deleteItem = useCallback((currentPath: string, itemName: string) => {
    setFs(prev => {
      const next = { ...prev };
      const item = (next[currentPath] || []).find(i => i.name === itemName);
      next[currentPath] = (next[currentPath] || []).filter(i => i.name !== itemName);
      if (item?.type === 'folder') {
        const prefix = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
        Object.keys(next).forEach(k => {
          if (k === prefix || k.startsWith(prefix + '/')) delete next[k];
        });
      }
      return next;
    });
  }, []);

  const renameItem = useCallback((currentPath: string, oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const items = fs[currentPath] || [];
    if (items.some(i => i.name === trimmed && i.name !== oldName)) return false;
    const item = items.find(i => i.name === oldName);
    if (!item) return false;

    setFs(prev => {
      const next = { ...prev };
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
      return next;
    });
    return true;
  }, [fs]);

  const saveFile = useCallback((currentPath: string, fileName: string, content: string) => {
    setFs(prev => ({
      ...prev,
      [currentPath]: (prev[currentPath] || []).map(i =>
        i.name === fileName ? { ...i, content, size: `${new Blob([content]).size} B`, modifiedAt: new Date().toISOString() } : i
      ),
    }));
  }, []);

  const moveItem = useCallback((fromPath: string, toPath: string, itemName: string): boolean => {
    const fromItems = fs[fromPath] || [];
    const toItems = fs[toPath] || [];
    const item = fromItems.find(i => i.name === itemName);
    if (!item || toItems.some(i => i.name === itemName)) return false;
    if (fromPath === toPath) return false;

    setFs(prev => {
      const next = { ...prev };
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
      return next;
    });
    return true;
  }, [fs]);

  return { fs, getItems, navigate, createFolder, createFile, deleteItem, renameItem, saveFile, moveItem };
}
