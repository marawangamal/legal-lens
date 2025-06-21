import { z } from 'zod';

// Document analysis schema
export const DocumentSchema = z
  .object({
    document_type: z.string(),
  })
  .passthrough();

export type Document = z.infer<typeof DocumentSchema>;

// File information interface
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  analysis?: Document;
}

// API response types
export interface AnalysisResponse {
  document_type: string;
  [key: string]: any;
}

export interface DiscrepancyResponse {
  hasDiscrepancies: boolean;
  summary: string;
}

export interface DiscrepancyCheck {
  hasDiscrepancies: boolean;
  summary: string;
  isChecking: boolean;
}
