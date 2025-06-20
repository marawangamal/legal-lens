import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

export const formatAnalysisResults = (analysis: string) => {
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
                          className={index === 0 ? 'font-bold bg-muted/50' : ''}
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
