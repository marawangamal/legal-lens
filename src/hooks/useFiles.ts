import { useState, useCallback } from 'react';
import { FileInfo, Document, DiscrepancyCheck } from '@/types';

export const useFiles = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);
  const [discrepancyCheck, setDiscrepancyCheck] = useState<DiscrepancyCheck>({
    hasDiscrepancies: false,
    summary: '',
    isChecking: false,
  });
  const [error, setError] = useState('');

  const uploadFiles = useCallback((fileList: FileList) => {
    const newFiles: FileInfo[] = Array.from(fileList).map(file => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setFiles(newFiles);
    setError('');
    // Reset discrepancy check when new files are uploaded
    setDiscrepancyCheck({
      hasDiscrepancies: false,
      summary: '',
      isChecking: false,
    });
  }, []);

  const analyzeFile = useCallback(
    async (index: number) => {
      const file = files[index];
      if (!file?.type.startsWith('image/')) {
        setError('Only image files can be analyzed');
        return;
      }

      setIsAnalyzing(index);
      setError('');

      try {
        const formData = new FormData();
        formData.append('file', file.file);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const analysis: Document = await response.json();

        setFiles(prev =>
          prev.map((f, i) => (i === index ? { ...f, analysis } : f))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsAnalyzing(null);
      }
    },
    [files]
  );

  const checkDiscrepancies = useCallback(async () => {
    const analyzedFiles = files.filter(file => file.analysis);

    if (analyzedFiles.length < 2) {
      setError('Need at least 2 analyzed files to check for discrepancies');
      return;
    }

    setDiscrepancyCheck(prev => ({ ...prev, isChecking: true }));
    setError('');

    try {
      const documents = analyzedFiles.map(file => ({
        name: file.name,
        analysis: file.analysis,
      }));

      const response = await fetch('/api/analyze-discrepancies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) {
        throw new Error('Discrepancy check failed');
      }

      const result = await response.json();

      setDiscrepancyCheck({
        hasDiscrepancies: result.hasDiscrepancies,
        summary: result.summary,
        isChecking: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discrepancy check failed');
      setDiscrepancyCheck(prev => ({ ...prev, isChecking: false }));
    }
  }, [files]);

  const selectFile = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const nextFile = useCallback(() => {
    setSelectedIndex(prev => Math.min(prev + 1, files.length - 1));
  }, [files.length]);

  const prevFile = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const closeViewer = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    files,
    selectedIndex,
    isAnalyzing,
    discrepancyCheck,
    error,
    uploadFiles,
    analyzeFile,
    checkDiscrepancies,
    selectFile,
    nextFile,
    prevFile,
    closeViewer,
    clearError,
  };
};
