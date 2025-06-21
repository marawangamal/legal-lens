import { z } from 'zod';

// Base document schema for parsed document analysis
export const PDocument = z
  .object({
    document_type: z.string(),
  })
  .passthrough();

// Type exports
export type PDocumentType = z.infer<typeof PDocument>;
