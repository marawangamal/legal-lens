'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Search, Loader2 } from 'lucide-react';
import { DiscrepancyCheck } from '@/types';

interface DiscrepancyCheckerProps {
  discrepancyCheck: DiscrepancyCheck;
  onCheckDiscrepancies: () => void;
  analyzedFilesCount: number;
  totalFilesCount: number;
}

export const DiscrepancyChecker = ({
  discrepancyCheck,
  onCheckDiscrepancies,
  analyzedFilesCount,
  totalFilesCount,
}: DiscrepancyCheckerProps) => {
  if (totalFilesCount === 0) return null;

  const canCheck = analyzedFilesCount >= 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Discrepancy Checker</span>
          {discrepancyCheck.hasDiscrepancies && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Discrepancies Found
            </Badge>
          )}
          {!discrepancyCheck.hasDiscrepancies && discrepancyCheck.summary && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              No Discrepancies
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {analyzedFilesCount} of {totalFilesCount} files analyzed
          </div>
          <Button
            onClick={onCheckDiscrepancies}
            disabled={!canCheck || discrepancyCheck.isChecking}
            variant="outline"
            size="sm"
          >
            {discrepancyCheck.isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check Discrepancies
              </>
            )}
          </Button>
        </div>

        {!canCheck && totalFilesCount > 0 && (
          <div className="p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Need at least 2 analyzed files to check for discrepancies
            </p>
          </div>
        )}

        {discrepancyCheck.summary && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Analysis Results:</h4>
            <div className="p-3 bg-muted/10 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {discrepancyCheck.summary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
