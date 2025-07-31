import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorCorrection as ErrorType } from "@/services/openaiService";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface ErrorCorrectionProps {
  correction: ErrorType;
  className?: string;
}

export const ErrorCorrection = ({ correction, className }: ErrorCorrectionProps) => {
  if (!correction.hasErrors) {
    return (
      <Alert className={`border-teacher/20 bg-teacher/5 ${className}`}>
        <CheckCircle className="h-4 w-4 text-teacher" />
        <AlertDescription className="text-teacher">
          Great! Your English is correct.
        </AlertDescription>
      </Alert>
    );
  }

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-destructive/10 text-destructive';
      case 'vocabulary': return 'bg-accent/10 text-accent';
      case 'pronunciation': return 'bg-speaking/10 text-speaking';
      case 'spelling': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={`border-accent/20 bg-accent/5 ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-accent mb-2">
              I notice some areas we can improve:
            </p>
            
            {/* Corrected version */}
            <div className="p-3 bg-background rounded-lg border mb-3">
              <p className="text-sm font-medium mb-1">Corrected version:</p>
              <p className="text-teacher font-medium">{correction.correctedText}</p>
            </div>

            {/* Error details */}
            <div className="space-y-2">
              {correction.errors.map((error, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getErrorTypeColor(error.type)}>
                      {error.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="line-through text-muted-foreground">
                      {error.original}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-teacher font-medium">
                      {error.corrected}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {error.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};