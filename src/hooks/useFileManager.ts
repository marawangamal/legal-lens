import { useState } from 'react';
import { FileInfo } from '@/types/file';
import { PDocumentType } from '@/types/schemas';

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
      const fileInfos: FileInfo[] = fileList.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        lastModified: file.lastModified,
        file: file,
      }));

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
    if (!file.file || !file.type.startsWith('image/')) {
      setError('Only image files can be analyzed.');
      return;
    }

    setIsAnalyzing(fileIndex);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file.file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      const analysis: PDocumentType = result;

      setFiles(prevFiles =>
        prevFiles.map((f, index) =>
          index === fileIndex ? { ...f, analysis } : f
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
