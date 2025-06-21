import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';
import { DirectoryInputProps } from '@/types/file';

interface FileUploadProps {
  isLoading: boolean;
  onFolderUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload = ({ isLoading, onFolderUpload }: FileUploadProps) => {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <input
            {...({
              type: 'file',
              webkitdirectory: '',
              directory: '',
              multiple: true,
              onChange: onFolderUpload,
              className: 'hidden',
              id: 'folder-upload',
              disabled: isLoading,
            } as DirectoryInputProps)}
          />
          <Label htmlFor="folder-upload" className="cursor-pointer block">
            <div className="p-6 bg-primary/5 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isLoading ? 'Processing files...' : 'Click to select a folder'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isLoading
                ? 'Please wait while we process your files'
                : 'Select a folder containing images, documents, or other files'}
            </p>
            {isLoading && (
              <div className="space-y-2">
                <Progress value={50} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Processing files...
                </p>
              </div>
            )}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
