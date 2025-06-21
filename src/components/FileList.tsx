import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Brain, CheckCircle } from 'lucide-react';
import { FileInfo } from '@/types/file';
import {
  formatFileSize,
  formatDate,
  getFileTypeIcon,
  canViewFile,
  canAnalyzeFile,
} from '@/lib/utils';

interface FileListProps {
  files: FileInfo[];
  isAnalyzing: number | null;
  onViewFile: (index: number) => void;
  onAnalyzeFile: (index: number) => void;
}

export const FileList = ({
  files,
  isAnalyzing,
  onViewFile,
  onAnalyzeFile,
}: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Details</CardTitle>
        <CardDescription>
          Browse and interact with your uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <span className="text-lg">
                          {getFileTypeIcon(file.type)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium truncate max-w-xs">
                          {file.name}
                        </div>
                        {file.analysis && file.analysis.keyFields && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Analyzed
                          </Badge>
                        )}
                      </div>
                      {file.type.startsWith('image/') && file.file && (
                        <img
                          src={URL.createObjectURL(file.file)}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.type || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(file.lastModified)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {canViewFile(file) && (
                        <Button
                          onClick={() => onViewFile(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      {canAnalyzeFile(file) && (
                        <Button
                          onClick={() => onAnalyzeFile(index)}
                          disabled={isAnalyzing === index}
                          size="sm"
                        >
                          {isAnalyzing === index ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                              Analyzing
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Analyze
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
