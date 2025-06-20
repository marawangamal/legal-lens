import { useState, useEffect } from 'react';
import { FileInfo } from '@/types/file';

export const useFileViewer = (files: FileInfo[]) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(-1);
  const [showViewer, setShowViewer] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showViewer) return;

      switch (event.key) {
        case 'Escape':
          closeViewer();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevFile();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextFile();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showViewer, selectedFileIndex, files.length]);

  const openViewer = (index: number) => {
    setSelectedFileIndex(index);
    setShowViewer(true);
  };

  const closeViewer = () => {
    setShowViewer(false);
    setSelectedFileIndex(-1);
  };

  const nextFile = () => {
    if (selectedFileIndex < files.length - 1) {
      setSelectedFileIndex(selectedFileIndex + 1);
    }
  };

  const prevFile = () => {
    if (selectedFileIndex > 0) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  return {
    selectedFileIndex,
    showViewer,
    openViewer,
    closeViewer,
    nextFile,
    prevFile,
  };
};
