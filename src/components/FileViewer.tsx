// components/FileViewer.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { File, Eye, Brain, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FileInfo } from '@/types';
import { canAnalyzeFile, formatAnalysisResults } from '@/lib/utils';

interface FileViewerProps {
  show: boolean;
  file: FileInfo | null;
  isAnalyzing: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAnalyze: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const FileViewer = ({
  show,
  file,
  isAnalyzing,
  onClose,
  onNext,
  onPrev,
  onAnalyze,
  hasNext,
  hasPrev,
}: FileViewerProps) => {
  const fileUrl = file?.file ? URL.createObjectURL(file.file) : '';

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!show) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (hasPrev) {
            event.preventDefault();
            onPrev();
          }
          break;
        case 'ArrowRight':
          if (hasNext) {
            event.preventDefault();
            onNext();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!show || !file) return null;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent
        className="!w-[80vw] !max-w-[80vw] !h-[85vh] !max-h-[85vh] p-0 flex flex-col"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <File className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-semibold">{file.name}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              onClick={onPrev}
              disabled={!hasPrev}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              onClick={onNext}
              disabled={!hasNext}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-hidden min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
            {/* File Preview */}
            <Card className="flex flex-col h-full min-h-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-auto">
                <div className="h-full p-2">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : file.type.includes('pdf') ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-full border-0 rounded"
                      title={file.name}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/10 rounded">
                      <div className="text-center">
                        <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Preview not available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="flex flex-col h-full min-h-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Analysis</span>
                  </div>
                  {canAnalyzeFile(file) && (
                    <Button
                      onClick={onAnalyze}
                      disabled={isAnalyzing}
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-auto">
                {file.analysis ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-muted/20 rounded">
                      <p className="text-sm font-medium">
                        Type: {file.analysis.document_type}
                      </p>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap bg-muted/10 p-2 rounded">
                      {formatAnalysisResults(file.analysis)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No analysis available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
