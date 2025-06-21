'use client';

import { FileText } from 'lucide-react';
import { useFileManager } from '@/hooks/useFileManager';
import { useFileViewer } from '@/hooks/useFileViewer';
import {
  FileUpload,
  FileSummary,
  FileList,
  FileViewer,
  ErrorDisplay,
} from '@/components';

export default function Home() {
  const {
    files,
    isLoading,
    error,
    isAnalyzing,
    handleFolderUpload,
    analyzeFile,
  } = useFileManager();

  const {
    selectedFileIndex,
    showViewer,
    openViewer,
    closeViewer,
    nextFile,
    prevFile,
  } = useFileViewer(files);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Legal Lens</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a folder to count, display, and analyze files with AI-powered
            insights
          </p>
        </div>

        {/* File Upload Section */}
        <FileUpload isLoading={isLoading} onFolderUpload={handleFolderUpload} />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* File Count Summary */}
        <FileSummary files={files} />

        {/* File List */}
        <FileList
          files={files}
          isAnalyzing={isAnalyzing}
          onViewFile={openViewer}
          onAnalyzeFile={analyzeFile}
        />
      </div>

      {/* Document Viewer Modal */}
      <FileViewer
        showViewer={showViewer}
        selectedFileIndex={selectedFileIndex}
        files={files}
        isAnalyzing={isAnalyzing}
        onClose={closeViewer}
        onNext={nextFile}
        onPrev={prevFile}
        onAnalyze={analyzeFile}
      />
    </div>
  );
}
