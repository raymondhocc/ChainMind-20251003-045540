import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export function ApiKeyDisclaimer() {
  return (
    <Alert variant="destructive" className="bg-muted/50 border-border text-muted-foreground">
      <AlertCircle className="h-4 w-4 !text-muted-foreground" />
      <AlertTitle className="text-xs font-semibold text-foreground">
        AI Functionality Notice
      </AlertTitle>
      <AlertDescription className="text-xs">
        This is a demo environment. AI features require API keys which are not configured for security reasons. To enable, deploy this project yourself.
      </AlertDescription>
    </Alert>
  );
}