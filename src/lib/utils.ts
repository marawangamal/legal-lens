import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileTypeIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('text') || type.includes('document')) return '📝';
  if (type.includes('video')) return '🎥';
  if (type.includes('audio')) return '🎵';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z'))
    return '📦';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('word') || type.includes('document')) return '📄';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
  return '📁';
}

export function canViewFile(file: { type: string; name: string }): boolean {
  return (
    file.type.startsWith('image/') ||
    file.type.includes('pdf') ||
    file.type.includes('text') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md')
  );
}

export function canAnalyzeFile(file: { type: string; name: string }): boolean {
  return file.type.startsWith('image/');
}
