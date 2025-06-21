import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from '@/components/ui/table';
import { ReactElement } from 'react';

export const formatAnalysisResults = (analysis: any): ReactElement => {
  // If analysis is already an object (parsed JSON), handle it directly
  if (typeof analysis === 'object' && analysis !== null) {
    return (
      <div className="space-y-4">
        {/* Document Type */}
        {analysis.documentType && (
          <div className="space-y-2">
            <h6 className="text-sm font-semibold text-muted-foreground">
              Document Type
            </h6>
            <div className="p-3 bg-muted/20 rounded border">
              <span className="text-sm font-medium">
                {analysis.documentType}
              </span>
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
                    <TableCell className="font-medium">
                      {String(value)}
                    </TableCell>
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
  }

  // If analysis is a string, try to parse as JSON first
  if (typeof analysis === 'string') {
    try {
      const parsed = JSON.parse(analysis);
      return formatAnalysisResults(parsed);
    } catch {
      // If not JSON, try to parse as table format
      const lines = analysis.split('\n').filter(line => line.trim());

      // Look for table patterns
      const tablePattern = /\|(.+)\|/;
      const hasTableFormat = lines.some(line => tablePattern.test(line));

      if (hasTableFormat) {
        // Extract headers from the first line that contains |
        const headerLine = lines.find(line => tablePattern.test(line));
        const headers = headerLine
          ? headerLine.split('|').filter(cell => cell.trim())
          : [];

        // Filter out the header line and separator lines
        const dataLines = lines.filter(
          line =>
            tablePattern.test(line) &&
            !line.match(/^[\s\-\|:]+$/) &&
            line !== headerLine
        );

        return (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className={index === 0 ? 'w-[200px]' : ''}
                    >
                      {header.trim()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLines.map((line, index) => {
                  const cells = line.split('|').filter(cell => cell.trim());
                  return (
                    <TableRow key={index}>
                      {cells.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className={cellIndex === 0 ? 'font-medium' : ''}
                        >
                          {cell.trim()}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      }

      // If no table format, display as key-value table
      const keyValuePairs = lines.filter(
        line => line.includes(':') && !line.includes('|')
      );
      const otherLines = lines.filter(
        line => !line.includes(':') || line.includes('|')
      );

      return (
        <div className="space-y-3">
          {keyValuePairs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Property</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyValuePairs.map((line, index) => {
                  const [key, ...valueParts] = line.split(':');
                  const value = valueParts.join(':').trim();
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-muted-foreground">
                        {key.trim()}
                      </TableCell>
                      <TableCell className="font-medium">{value}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {otherLines.length > 0 && (
            <div className="space-y-2">
              {otherLines.map((line, index) => (
                <div key={index} className="p-2 bg-muted/20 rounded border">
                  <span className="text-sm font-medium">{line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  // Fallback for any other type
  return (
    <div className="p-3 bg-muted/20 rounded border">
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
        {JSON.stringify(analysis, null, 2)}
      </pre>
    </div>
  );
};
