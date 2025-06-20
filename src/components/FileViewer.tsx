// components/FileViewer.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  File,
  Eye,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { FileInfo } from '@/types/file';
import { canAnalyzeFile } from '@/lib/utils';
import { formatAnalysisResults } from '@/lib/analysis';

interface FileViewerProps {
  showViewer: boolean;
  selectedFileIndex: number;
  files: FileInfo[];
  isAnalyzing: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAnalyze: (index: number) => void;
}

export const FileViewer = ({
  showViewer,
  selectedFileIndex,
  files,
  isAnalyzing,
  onClose,
  onNext,
  onPrev,
  onAnalyze,
}: FileViewerProps) => {
  if (!showViewer || selectedFileIndex === -1 || !files[selectedFileIndex])
    return null;

  const currentFile = files[selectedFileIndex];
  const fileUrl = currentFile.file ? URL.createObjectURL(currentFile.file) : '';

  // Revoke object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (currentFile.file) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl, currentFile.file]);

  return (
    <Dialog open={showViewer} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] !w-[80vw] h-[95vh] p-0 flex flex-col">
        {/* ── TITLE • NAV • CLOSE ─────────────────────────────────── */}
        <DialogHeader asChild>
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
            {/* File name */}
            <DialogTitle asChild>
              <div className="flex items-center space-x-2 min-w-0">
                <File className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-sm font-medium">
                  {currentFile.name}
                </span>
              </div>
            </DialogTitle>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrev}
                disabled={selectedFileIndex === 0}
                variant="outline"
                size="icon"
                className="h-7 w-7"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              <span className="text-xs text-muted-foreground w-14 text-center">
                {selectedFileIndex + 1} / {files.length}
              </span>

              <Button
                onClick={onNext}
                disabled={selectedFileIndex === files.length - 1}
                variant="outline"
                size="icon"
                className="h-7 w-7"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Close */}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        {/* ─────────────────────────────────────────────────────────── */}

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
            {/* File preview panel */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full p-2">
                  {currentFile.type.startsWith('image/') ? (
                    <div className="flex justify-center items-center h-full bg-muted/10 rounded border">
                      <img
                        src={fileUrl}
                        alt={currentFile.name}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  ) : currentFile.type.includes('pdf') ? (
                    <div className="w-full h-full bg-muted/10 rounded border overflow-hidden">
                      <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-full border-0"
                        title={currentFile.name}
                        allowFullScreen
                      />
                    </div>
                  ) : currentFile.type.includes('text') ||
                    currentFile.name.endsWith('.txt') ||
                    currentFile.name.endsWith('.md') ? (
                    <div className="h-full bg-muted/10 rounded border overflow-hidden">
                      <pre className="text-xs whitespace-pre-wrap font-mono p-3 h-full overflow-auto bg-background rounded border">
                        {currentFile.content || 'No content available'}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/10 rounded border">
                      <div className="text-center space-y-2">
                        <File className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground">
                          Preview not available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI analysis panel */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-green-600" />
                  <span>AI Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 p-2 overflow-auto">
                {canAnalyzeFile(currentFile) ? (
                  <Button
                    onClick={() => onAnalyze(selectedFileIndex)}
                    disabled={isAnalyzing === selectedFileIndex}
                    className="w-full h-9 text-sm"
                    size="sm"
                  >
                    {isAnalyzing === selectedFileIndex ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 text-xs font-medium">
                          Image Analysis Only
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Only image files are supported for AI analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis results */}
                {currentFile.analysis && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 pb-1 border-b">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h5 className="font-medium text-sm">Results</h5>
                    </div>
                    <div className="bg-muted/20 rounded p-2 overflow-auto border text-xs max-h-[300px]">
                      {currentFile.analysis.analysis ? (
                        formatAnalysisResults(currentFile.analysis.analysis)
                      ) : (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(currentFile.analysis, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* ─────────────────────────────────────────────────────────── */}
      </DialogContent>
    </Dialog>
  );
};
