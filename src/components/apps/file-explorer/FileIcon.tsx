import { Folder, FileText, Image, Music, Video, FileCode, FileType, FileSpreadsheet, Presentation } from 'lucide-react';
import { VirtualItem, isImageFile, isAudioFile, isVideoFile, isPdfFile, isOfficeFile, getFileExtension } from './types';

interface FileIconProps {
  item: VirtualItem;
  size?: 'sm' | 'lg';
}

export function FileIcon({ item, size = 'sm' }: FileIconProps) {
  const cls = size === 'lg' ? 'w-8 h-8' : 'w-4 h-4';

  if (item.type === 'folder') return <Folder className={`${cls} text-primary`} />;

  if (isImageFile(item.name)) return <Image className={`${cls} text-green-600`} />;
  if (isAudioFile(item.name)) return <Music className={`${cls} text-pink-500`} />;
  if (isVideoFile(item.name)) return <Video className={`${cls} text-orange-500`} />;
  if (isPdfFile(item.name)) return <FileType className={`${cls} text-red-500`} />;

  const ext = getFileExtension(item.name);
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext))
    return <FileText className={`${cls} text-blue-600`} />;
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext))
    return <FileSpreadsheet className={`${cls} text-green-600`} />;
  if (['ppt', 'pptx', 'odp'].includes(ext))
    return <Presentation className={`${cls} text-orange-600`} />;

  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml'].includes(ext))
    return <FileCode className={`${cls} text-blue-500`} />;

  return <FileText className={`${cls} text-muted-foreground`} />;
}
