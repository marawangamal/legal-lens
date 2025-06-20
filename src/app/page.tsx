'use client';

import { useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file?: File;
  content?: string;
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getFileTypeIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('text')) return '📄';
    return '📁';
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

  const canViewFile = (file: FileInfo): boolean => {
    return (
      file.type.startsWith('image/') ||
      file.type.includes('pdf') ||
      file.type.includes('text') ||
      file.type.includes('document') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    );
  };

  const renderFileViewer = () => {
    if (!showViewer || selectedFileIndex === -1 || !files[selectedFileIndex])
      return null;

    const currentFile = files[selectedFileIndex];
    const fileUrl = currentFile.file
      ? URL.createObjectURL(currentFile.file)
      : '';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {currentFile.name}
            </h3>
            <button
              onClick={closeViewer}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 bg-gray-50">
            <button
              onClick={prevFile}
              disabled={selectedFileIndex === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              ← Previous
            </button>
            <span className="text-gray-600">
              {selectedFileIndex + 1} of {files.length}
            </span>
            <button
              onClick={nextFile}
              disabled={selectedFileIndex === files.length - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Next →
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs">
            💡 Use arrow keys to navigate, ESC to close
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {currentFile.type.startsWith('image/') ? (
              <div className="flex justify-center">
                <img
                  src={fileUrl}
                  alt={currentFile.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : currentFile.type.includes('pdf') ? (
              <div className="w-full h-full">
                <iframe
                  src={fileUrl}
                  className="w-full h-full min-h-[500px]"
                  title={currentFile.name}
                />
              </div>
            ) : currentFile.type.includes('text') ||
              currentFile.name.endsWith('.txt') ||
              currentFile.name.endsWith('.md') ? (
              <div className="bg-gray-100 p-4 rounded h-full overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {currentFile.content || 'No content available'}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentFile.type}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Lens</h1>
          <p className="text-lg text-gray-600">
            Upload a folder to count and display files
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
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
            <label htmlFor="folder-upload" className="cursor-pointer block">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isLoading ? 'Processing files...' : 'Click to select a folder'}
              </h3>
              <p className="text-gray-500">
                {isLoading
                  ? 'Please wait while we process your files'
                  : 'Select a folder containing images, documents, or other files'}
              </p>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* File Count Summary */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              File Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {files.length}
                </div>
                <div className="text-blue-800">Total Files</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatFileSize(
                    files.reduce((sum, file) => sum + file.size, 0)
                  )}
                </div>
                <div className="text-green-800">Total Size</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(files.map(f => f.type)).size}
                </div>
                <div className="text-purple-800">File Types</div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              File Details
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getFileTypeIcon(file.type)}
                          </span>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.name}
                          </div>
                          {file.type.startsWith('image/') && file.file && (
                            <div className="ml-2">
                              <img
                                src={URL.createObjectURL(file.file)}
                                alt={file.name}
                                className="w-8 h-8 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.type || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {canViewFile(file) ? (
                          <button
                            onClick={() => openViewer(index)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No preview
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {renderFileViewer()}
    </div>
  );
}
