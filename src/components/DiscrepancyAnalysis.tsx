'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  AlertCircle,
} from 'lucide-react';
import { FileInfo } from '@/types/file';
import { DiscrepancyAnalysisType } from '@/types/schemas';

interface DiscrepancyAnalysisProps {
  files: FileInfo[];
}

interface Discrepancy {
  type: 'contradiction' | 'inconsistency' | 'missing_info' | 'format_mismatch';
  description: string;
  documents: string[];
  severity: 'high' | 'medium' | 'low';
}

interface DiscrepancyResult extends DiscrepancyAnalysisType {}

export const DiscrepancyAnalysis = ({ files }: DiscrepancyAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DiscrepancyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzedFiles = files.filter(file => file.analysis);
  const hasMultipleAnalyzedFiles = analyzedFiles.length > 1;

  const runDiscrepancyAnalysis = async () => {
    if (!hasMultipleAnalyzedFiles) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-discrepancies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: analyzedFiles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contradiction':
        return <AlertTriangle className="h-4 w-4" />;
      case 'inconsistency':
        return <AlertCircle className="h-4 w-4" />;
      case 'missing_info':
        return <Clock className="h-4 w-4" />;
      case 'format_mismatch':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!hasMultipleAnalyzedFiles) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span>Discrepancy Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Need at least 2 analyzed documents to check for discrepancies
            </p>
            <p className="text-xs text-muted-foreground">
              {analyzedFiles.length} of {files.length} documents analyzed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span>Discrepancy Analysis</span>
          </div>
          {!results && !isAnalyzing && (
            <Button
              onClick={runDiscrepancyAnalysis}
              className="h-7 text-xs"
              size="sm"
            >
              <Brain className="h-3 w-3 mr-1" />
              Analyze
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded border">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm text-blue-800">
              Analyzing {analyzedFiles.length} documents for discrepancies...
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-medium">
                  Analysis Error
                </p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-3 bg-muted/20 rounded border">
              <h6 className="font-medium text-sm mb-2">Summary</h6>
              <p className="text-sm">{results.summary}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="outline"
                  className={getSeverityColor(results.confidence)}
                >
                  Confidence: {results.confidence}
                </Badge>
                <Badge variant="outline">
                  {results.discrepancies.length} discrepancies found
                </Badge>
              </div>
            </div>

            {/* Discrepancies */}
            {results.discrepancies.length > 0 ? (
              <div className="space-y-3">
                <h6 className="font-medium text-sm">Discrepancies Found</h6>
                {results.discrepancies.map((discrepancy, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${getSeverityColor(discrepancy.severity)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getTypeIcon(discrepancy.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm capitalize">
                            {discrepancy.type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {discrepancy.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">
                          {discrepancy.description}
                        </p>
                        <div className="text-xs">
                          <span className="font-medium">
                            Documents involved:
                          </span>{' '}
                          {discrepancy.documents.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded border">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  No discrepancies found between documents
                </span>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="space-y-2">
                <h6 className="font-medium text-sm">Recommendations</h6>
                <ul className="space-y-1">
                  {results.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="text-sm flex items-start space-x-2"
                    >
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
