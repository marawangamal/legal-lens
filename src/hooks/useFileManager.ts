import { useState } from 'react';
import { FileInfo } from '@/types/file';
import { canAnalyzeFile } from '@/lib/utils';

export const useFileManager = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const fileList = Array.from(input.files);
      const fileInfos: FileInfo[] = await Promise.all(
        fileList.map(async file => {
          let content: string | undefined;

          // Read text content for text files
          if (
            file.type.includes('text') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.md')
          ) {
            try {
              content = await file.text();
            } catch {
              console.warn('Could not read text content for:', file.name);
            }
          }

          return {
            name: file.name,
            size: file.size,
            type: file.type || 'unknown',
            lastModified: file.lastModified,
            file: file,
            content: content,
          };
        })
      );

      setFiles(fileInfos);
    } catch (err) {
      setError('Error processing files. Please try again.');
      console.error('Error processing files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFile = async (fileIndex: number) => {
    const file = files[fileIndex];
    if (!file.file || !canAnalyzeFile(file)) {
      setError('This file type cannot be analyzed.');
      return;
    }

    setIsAnalyzing(fileIndex);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file.file);

      // Call our API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Update the file with analysis results
      setFiles(prevFiles =>
        prevFiles.map((f, index) =>
          index === fileIndex ? { ...f, analysis: result } : f
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const clearError = () => setError('');

  return {
    files,
    isLoading,
    error,
    isAnalyzing,
    handleFolderUpload,
    analyzeFile,
    clearError,
  };
};
