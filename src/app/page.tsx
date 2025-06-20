'use client';

import { useState, useEffect } from 'react';
import {
  formatFileSize,
  formatDate,
  getFileTypeIcon,
  canViewFile,
  canAnalyzeFile,
} from '@/lib/utils';
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
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  Image,
  File,
  Eye,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file?: File;
  content?: string;
  analysis?: any;
}

interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(-1);
  const [showViewer, setShowViewer] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);

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

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const fileList = Array.from(input.files);
      const fileInfos: FileInfo[] = await Promise.all(
        fileList.map(async file => {
          let content: string | undefined;

          // Read text content for text files
          if (
            file.type.includes('text') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.md')
          ) {
            try {
              content = await file.text();
            } catch {
              console.warn('Could not read text content for:', file.name);
            }
          }

          return {
            name: file.name,
            size: file.size,
            type: file.type || 'unknown',
            lastModified: file.lastModified,
            file: file,
            content: content,
          };
        })
      );

      setFiles(fileInfos);
      setSelectedFileIndex(-1);
      setShowViewer(false);
    } catch (err) {
      setError('Error processing files. Please try again.');
      console.error('Error processing files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFile = async (fileIndex: number) => {
    const file = files[fileIndex];
    if (!file.file || !canAnalyzeFile(file)) {
      setError('This file type cannot be analyzed.');
      return;
    }

    setIsAnalyzing(fileIndex);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file.file);

      // Call our API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Update the file with analysis results
      setFiles(prevFiles =>
        prevFiles.map((f, index) =>
          index === fileIndex ? { ...f, analysis: result } : f
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(null);
    }
  };

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

  const formatAnalysisResults = (analysis: string) => {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(analysis);
      return (
        <div className="space-y-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div
              key={key}
              className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg"
            >
              <div className="font-semibold text-sm text-muted-foreground min-w-[120px]">
                {key}:
              </div>
              <div className="text-sm font-medium flex-1">{String(value)}</div>
            </div>
          ))}
        </div>
      );
    } catch {
      // If not JSON, try to parse as table format
      const lines = analysis.split('\n').filter(line => line.trim());

      // Look for table patterns
      const tablePattern = /\|(.+)\|/;
      const hasTableFormat = lines.some(line => tablePattern.test(line));

      if (hasTableFormat) {
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                {lines.map((line, index) => {
                  if (line.includes('|')) {
                    const cells = line.split('|').filter(cell => cell.trim());
                    return (
                      <TableRow key={index}>
                        {cells.map((cell, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className={
                              index === 0 ? 'font-bold bg-muted/50' : ''
                            }
                          >
                            {cell.trim()}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  } else if (line.includes(':') && !line.includes('|')) {
                    // Handle key-value pairs
                    const [key, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-semibold bg-muted/50">
                          {key.trim()}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    );
                  } else {
                    return (
                      <TableRow key={index}>
                        <TableCell colSpan={2}>{line}</TableCell>
                      </TableRow>
                    );
                  }
                })}
              </TableBody>
            </Table>
          </div>
        );
      }

      // If no table format, display as formatted text
      return (
        <div className="space-y-3">
          {lines.map((line, index) => {
            if (line.includes(':')) {
              const [key, ...valueParts] = line.split(':');
              const value = valueParts.join(':').trim();
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="font-semibold text-sm text-muted-foreground min-w-[120px]">
                    {key.trim()}:
                  </div>
                  <div className="text-sm font-medium flex-1">{value}</div>
                </div>
              );
            } else {
              return (
                <div key={index} className="p-3">
                  <span className="text-sm font-medium">{line}</span>
                </div>
              );
            }
          })}
        </div>
      );
    }
  };

  const renderFileViewer = () => {
    if (!showViewer || selectedFileIndex === -1 || !files[selectedFileIndex])
      return null;

    const currentFile = files[selectedFileIndex];
    const fileUrl = currentFile.file
      ? URL.createObjectURL(currentFile.file)
      : '';

    return (
      <Dialog open={showViewer} onOpenChange={closeViewer}>
        <DialogContent
          className="custom-modal-width !max-w-[80vw] !w-[80vw] h-[95vh] p-0 gap-0"
          style={{
            maxWidth: '80vw',
            width: '80vw',
            height: '95vh',
          }}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center space-x-3 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <File className="h-5 w-5 text-primary" />
              </div>
              <span className="truncate font-semibold">{currentFile.name}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b">
            <Button
              onClick={prevFile}
              disabled={selectedFileIndex === 0}
              variant="outline"
              size="sm"
              className="min-w-[100px] h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedFileIndex + 1} of {files.length}
              </span>
              <div className="w-16 h-1.5 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${((selectedFileIndex + 1) / files.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <Button
              onClick={nextFile}
              disabled={selectedFileIndex === files.length - 1}
              variant="outline"
              size="sm"
              className="min-w-[100px] h-9"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="px-6 py-2 bg-blue-50 text-blue-700 text-xs border-b border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>💡 Use arrow keys to navigate, ESC to close</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
              {/* File Display */}
              <Card className="flex flex-col shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span>File Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <div className="h-full p-4">
                    {currentFile.type.startsWith('image/') ? (
                      <div className="flex justify-center items-center h-full bg-muted/20 rounded-lg">
                        <img
                          src={fileUrl}
                          alt={currentFile.name}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    ) : currentFile.type.includes('pdf') ? (
                      <div className="w-full h-full bg-muted/20 rounded-lg overflow-hidden">
                        <iframe
                          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          className="w-full h-full rounded-lg border-0"
                          title={currentFile.name}
                          allowFullScreen
                        />
                      </div>
                    ) : currentFile.type.includes('text') ||
                      currentFile.name.endsWith('.txt') ||
                      currentFile.name.endsWith('.md') ? (
                      <div className="h-full bg-muted/20 rounded-lg overflow-hidden">
                        <pre className="text-sm whitespace-pre-wrap font-mono p-4 h-full overflow-auto bg-background rounded-lg border shadow-sm">
                          {currentFile.content || 'No content available'}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                        <div className="text-center space-y-4">
                          <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                            <File className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-muted-foreground font-medium">
                              Preview not available
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {currentFile.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Panel */}
              <Card className="flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <span>AI Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-6 p-4 overflow-auto">
                  {canAnalyzeFile(currentFile) ? (
                    <div className="space-y-4">
                      <Button
                        onClick={() => analyzeFile(selectedFileIndex)}
                        disabled={isAnalyzing === selectedFileIndex}
                        className="w-full h-12 text-base font-medium"
                        size="lg"
                      >
                        {isAnalyzing === selectedFileIndex ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-5 w-5 mr-3" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                      <div className="text-sm text-muted-foreground text-center">
                        Get detailed insights about your image content
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-yellow-800 font-medium text-sm">
                            Image Analysis Only
                          </p>
                          <p className="text-yellow-700 text-sm leading-relaxed">
                            This file type cannot be analyzed with the current
                            AI model. Only image files (JPG, PNG, GIF, WebP,
                            etc.) are supported.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {currentFile.analysis && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-lg">
                          Analysis Results
                        </h5>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 overflow-auto border shadow-sm max-h-[350px]">
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
        </DialogContent>
      </Dialog>
    );
  };

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
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <input
                {...({
                  type: 'file',
                  webkitdirectory: '',
                  directory: '',
                  multiple: true,
                  onChange: handleFolderUpload,
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
                  {isLoading
                    ? 'Processing files...'
                    : 'Click to select a folder'}
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

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Count Summary */}
        {files.length > 0 && (
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
                    {formatFileSize(
                      files.reduce((sum, file) => sum + file.size, 0)
                    )}
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
        )}

        {/* File List */}
        {files.length > 0 && (
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
                              {file.analysis && (
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
                          <Badge variant="outline">
                            {file.type || 'Unknown'}
                          </Badge>
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
                                onClick={() => openViewer(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            )}
                            {canAnalyzeFile(file) && (
                              <Button
                                onClick={() => analyzeFile(index)}
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
        )}
      </div>

      {/* Document Viewer Modal */}
      {renderFileViewer()}
    </div>
  );
}
