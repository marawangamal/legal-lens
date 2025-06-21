'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Folder } from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: FileList) => void;
  isLoading?: boolean;
}

interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

export const FileUpload = ({ onUpload, isLoading }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Files</h3>
            <p className="text-sm text-muted-foreground">
              Select files or a folder to analyze with AI
            </p>
          </div>

          <Button
            onClick={handleClick}
            disabled={isLoading}
            className="w-full max-w-xs"
          >
            <Folder className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Choose Files or Folder'}
          </Button>

          <input
            ref={inputRef}
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.txt,.md"
            {...({} as DirectoryInputProps)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
