import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from '@/components/ui/table';
import { ReactElement } from 'react';
import { PDocumentType } from '@/types/schemas';

export const formatAnalysisResults = (analysis: {
  documentType?: string;
  keyFields: PDocumentType;
}): ReactElement => {
  return (
    <div className="space-y-4">
      {/* Document Type */}
      {analysis.documentType && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Document Type
          </h6>
          <div className="p-3 bg-muted/20 rounded border">
            <span className="text-sm font-medium">{analysis.documentType}</span>
          </div>
        </div>
      )}

      {/* Key Fields Table */}
      {analysis.keyFields && Object.keys(analysis.keyFields).length > 0 && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Key Information
          </h6>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(analysis.keyFields).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium text-muted-foreground">
                    {key}
                  </TableCell>
                  <TableCell className="font-medium">{String(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      {analysis.summary && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Summary
          </h6>
          <div className="p-3 bg-muted/20 rounded border">
            <span className="text-sm font-medium">{analysis.summary}</span>
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {analysis.extractedText && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Extracted Text
          </h6>
          <div className="p-3 bg-muted/20 rounded border max-h-32 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {analysis.extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Confidence */}
      {analysis.confidence && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Confidence
          </h6>
          <div className="flex items-center space-x-2">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                analysis.confidence === 'high'
                  ? 'bg-green-100 text-green-800'
                  : analysis.confidence === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {analysis.confidence}
            </div>
          </div>
        </div>
      )}

      {/* Fallback for other object properties */}
      {Object.entries(analysis).filter(
        ([key]) =>
          ![
            'documentType',
            'keyFields',
            'summary',
            'extractedText',
            'confidence',
          ].includes(key)
      ).length > 0 && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-muted-foreground">
            Additional Information
          </h6>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Property</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(analysis)
                .filter(
                  ([key]) =>
                    ![
                      'documentType',
                      'keyFields',
                      'summary',
                      'extractedText',
                      'confidence',
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium text-muted-foreground">
                      {key}
                    </TableCell>
                    <TableCell className="font-medium">
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
