'use client';

import { FileText } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
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
    selectedIndex,
    isAnalyzing,
    error,
    uploadFiles,
    analyzeFile,
    selectFile,
    nextFile,
    prevFile,
    closeViewer,
    clearError,
  } = useFiles();

  const selectedFile = selectedIndex >= 0 ? files[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Legal Lens</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload and analyze documents with AI-powered insights
          </p>
        </div>

        {/* File Upload */}
        <FileUpload onUpload={uploadFiles} isLoading={false} />

        {/* Error Display */}
        <ErrorDisplay error={error} onClear={clearError} />

        {/* File Summary */}
        <FileSummary files={files} />

        {/* File List */}
        <FileList
          files={files}
          isAnalyzing={isAnalyzing}
          onView={selectFile}
          onAnalyze={analyzeFile}
        />
      </div>

      {/* File Viewer */}
      <FileViewer
        show={selectedIndex >= 0}
        file={selectedFile}
        isAnalyzing={isAnalyzing === selectedIndex}
        onClose={closeViewer}
        onNext={nextFile}
        onPrev={prevFile}
        onAnalyze={() => selectedIndex >= 0 && analyzeFile(selectedIndex)}
        hasNext={selectedIndex < files.length - 1}
        hasPrev={selectedIndex > 0}
      />
    </div>
  );
}
