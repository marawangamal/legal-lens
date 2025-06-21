export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file?: File;
  content?: string;
  analysis?: any;
}

export interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}
