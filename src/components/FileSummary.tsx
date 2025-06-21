import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { File, FileText, Image } from 'lucide-react';
import { FileInfo } from '@/types/file';
import { formatFileSize } from '@/lib/utils';

interface FileSummaryProps {
  files: FileInfo[];
}

export const FileSummary = ({ files }: FileSummaryProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Summary</CardTitle>
        <CardDescription>
          Overview of uploaded files and their statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <File className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold">{files.length}</div>
            <div className="text-muted-foreground">Total Files</div>
          </div>
          <div className="text-center space-y-2">
            <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold">
              {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
            </div>
            <div className="text-muted-foreground">Total Size</div>
          </div>
          <div className="text-center space-y-2">
            <div className="p-4 bg-purple-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Image className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">
              {new Set(files.map(f => f.type)).size}
            </div>
            <div className="text-muted-foreground">File Types</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
