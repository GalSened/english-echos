import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ConversationAnalysis as AnalysisType } from "@/services/openaiService";
import { 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  TrendingUp, 
  Target,
  Star,
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface ConversationAnalysisProps {
  analysis: AnalysisType;
  userName: string;
  topic: string;
  onRestart: () => void;
  onNewTopic: () => void;
}

export const ConversationAnalysis = ({ 
  analysis, 
  userName, 
  topic, 
  onRestart, 
  onNewTopic 
}: ConversationAnalysisProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-teacher";
    if (score >= 6) return "text-accent";
    return "text-destructive";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 9) return "Excellent!";
    if (score >= 8) return "Very Good!";
    if (score >= 7) return "Good";
    if (score >= 6) return "Fair";
    if (score >= 5) return "Needs Work";
    return "Keep Practicing";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Conversation Analysis for {userName}
        </h1>
        <p className="text-muted-foreground">
          Topic: <span className="font-medium">{topic}</span>
        </p>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-teacher/10 to-accent/10">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-teacher mb-2">
              {analysis.scoreBreakdown.overall}/10
            </div>
            <div className="text-xl font-semibold mb-2">
              {getScoreMessage(analysis.scoreBreakdown.overall)}
            </div>
            <p className="text-muted-foreground">
              {analysis.overallFeedback}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.scoreBreakdown).map(([key, score]) => (
              key !== 'overall' && (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{key}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>
                      {score}/10
                    </span>
                  </div>
                  <Progress value={score * 10} className="h-2" />
                </div>
              )
            ))}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teacher" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teacher mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Grammar Errors */}
      {analysis.grammarErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Grammar Corrections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.grammarErrors.map((error, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">Error</Badge>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm">
                      <span className="line-through text-destructive">{error.error}</span>
                      <ArrowRight className="h-4 w-4 inline mx-2" />
                      <span className="text-teacher font-medium">{error.correction}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{error.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Improvements */}
      {analysis.vocabularyImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Vocabulary Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.vocabularyImprovements.map((vocab, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{vocab.word}</Badge>
                    <span className="text-sm text-muted-foreground">could be:</span>
                    <div className="flex gap-1">
                      {vocab.betterAlternatives.map((alt, i) => (
                        <Badge key={i} className="bg-teacher/10 text-teacher">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{vocab.context}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Areas to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.areasToImprove.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teacher" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-teacher mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pronunciation Tips */}
      {analysis.pronunciationTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pronunciation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.pronunciationTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-speaking rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          onClick={onRestart}
          className="flex-1 bg-teacher hover:bg-teacher/90"
          size="lg"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Practice Same Topic Again
        </Button>
        <Button 
          onClick={onNewTopic}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Choose New Topic
        </Button>
      </div>
    </div>
  );
};