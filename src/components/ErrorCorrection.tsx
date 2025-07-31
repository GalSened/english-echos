import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ErrorCorrection as ErrorType } from "@/services/supabaseOpenaiService";
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb, 
  MessageSquare,
  BookOpen,
  Zap
} from "lucide-react";

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
          Excellent! Your English is natural and correct.
        </AlertDescription>
      </Alert>
    );
  }

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'vocabulary': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pronunciation': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'fluency': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'cultural': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'grammar': return AlertTriangle;
      case 'vocabulary': return BookOpen;
      case 'pronunciation': return MessageSquare;
      case 'fluency': return Zap;
      case 'cultural': return Lightbulb;
      default: return AlertTriangle;
    }
  };

  return (
    <Card className={`border-accent/20 bg-accent/5 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-accent" />
          English Enhancement Suggestions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Corrected version */}
        <div className="p-3 bg-background rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Enhanced version:</p>
          <p className="text-teacher font-medium">{correction.correctedText}</p>
        </div>

        {/* Specific errors and improvements */}
        <div className="space-y-3">
          {correction.errors.map((error, index) => {
            const IconComponent = getErrorIcon(error.type);
            return (
              <div key={index} className={`p-3 rounded-lg border ${getErrorTypeColor(error.type).includes('bg-') ? getErrorTypeColor(error.type) : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="h-4 w-4" />
                  <Badge variant="outline" className={getErrorTypeColor(error.type)}>
                    {error.type.charAt(0).toUpperCase() + error.type.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="line-through text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    {error.original}
                  </span>
                  <ArrowRight className="h-3 w-3 text-accent" />
                  <span className="text-teacher font-medium bg-teacher/10 px-2 py-1 rounded">
                    {error.corrected}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>Why:</strong> {error.explanation}
                  </p>
                  {error.speakingTip && (
                    <p className="text-xs text-accent bg-accent/10 p-2 rounded">
                      <strong>💬 Speaking tip:</strong> {error.speakingTip}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Natural alternatives */}
        {correction.naturalAlternatives && correction.naturalAlternatives.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                More Natural Ways to Say This
              </h4>
              <div className="space-y-2">
                {correction.naturalAlternatives.map((alt, index) => (
                  <div key={index} className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      "{alt.alternative}"
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {alt.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Overall advice */}
        {correction.overallAdvice && (
          <>
            <Separator />
            <div className="space-y-3">
              {correction.overallAdvice.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    What you did well
                  </h4>
                  <ul className="text-xs space-y-1">
                    {correction.overallAdvice.strengths.map((strength, index) => (
                      <li key={index} className="text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                        ✓ {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {correction.overallAdvice.speakingTips.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2 text-purple-600">
                    <MessageSquare className="h-4 w-4" />
                    Speaking tips
                  </h4>
                  <ul className="text-xs space-y-1">
                    {correction.overallAdvice.speakingTips.map((tip, index) => (
                      <li key={index} className="text-purple-600 bg-purple-50 dark:bg-purple-950/20 p-2 rounded">
                        💡 {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {correction.overallAdvice.practiceExercises.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2 text-orange-600">
                    <BookOpen className="h-4 w-4" />
                    Practice suggestions
                  </h4>
                  <ul className="text-xs space-y-1">
                    {correction.overallAdvice.practiceExercises.map((exercise, index) => (
                      <li key={index} className="text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                        📚 {exercise}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};