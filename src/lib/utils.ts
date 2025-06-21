import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileInfo } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const canAnalyzeFile = (file: FileInfo): boolean => {
  return file.type.startsWith('image/');
};

export const formatAnalysisResults = (analysis: any): string => {
  if (!analysis) return 'No analysis available';

  const entries = Object.entries(analysis)
    .filter(([key]) => key !== 'document_type')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return entries || 'No additional fields found';
};
