import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
};
