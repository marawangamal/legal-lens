'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { File, Eye, Brain, CheckCircle } from 'lucide-react';
import { FileInfo } from '@/types';
import { formatFileSize, canAnalyzeFile } from '@/lib/utils';

interface FileListProps {
  files: FileInfo[];
  isAnalyzing: number | null;
  onView: (index: number) => void;
  onAnalyze: (index: number) => void;
}

export const FileList = ({
  files,
  isAnalyzing,
  onView,
  onAnalyze,
}: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.analysis && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analyzed
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(index)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {canAnalyzeFile(file) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAnalyze(index)}
                    disabled={isAnalyzing === index}
                  >
                    {isAnalyzing === index ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Brain className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
