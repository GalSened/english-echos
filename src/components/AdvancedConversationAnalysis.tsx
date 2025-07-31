import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ConversationAnalysis as AnalysisType } from "@/services/supabaseOpenaiService";
import { 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  TrendingUp, 
  Target,
  Star,
  ArrowRight,
  RotateCcw,
  Brain,
  Trophy,
  Lightbulb,
  Activity,
  BarChart,
  Clock,
  Calendar
} from "lucide-react";

interface AdvancedConversationAnalysisProps {
  analysis: AnalysisType;
  userName: string;
  topic: string;
  onRestart: () => void;
  onNewTopic: () => void;
}

export const AdvancedConversationAnalysis = ({ 
  analysis, 
  userName, 
  topic, 
  onRestart, 
  onNewTopic 
}: AdvancedConversationAnalysisProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceText = (confidence: [number, number] | number) => {
    if (typeof confidence === 'number') return "Estimated";
    const margin = confidence[1] - confidence[0];
    if (margin <= 10) return "High confidence";
    if (margin <= 20) return "Medium confidence";
    return "Low confidence";
  };

  const cefrLevel = analysis.quantitativeMetrics.proficiencyScores.overallCEFR.level;
  const overallScore = analysis.quantitativeMetrics.proficiencyScores.overallCEFR.score;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Advanced Linguistic Analysis for {userName}
        </h1>
        <p className="text-muted-foreground">
          Topic: <span className="font-medium">{topic}</span> • Data-driven proficiency assessment
        </p>
      </div>

      {/* Overall CEFR Level */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {cefrLevel}
            </div>
            <div className="text-xl font-semibold mb-2">
              CEFR Level • Score: {overallScore}/100
            </div>
            <p className="text-muted-foreground">
              {analysis.motivationalInsights.encouragingFeedback}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quantitative Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Linguistic Complexity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Lexical Diversity</span>
                <span className={`font-bold ${getScoreColor(analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.score)}`}>
                  {analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.score}/100
                </span>
              </div>
              <Progress value={analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Type-Token Ratio: {analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.typeTokenRatio} • 
                MTLD: {analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.mtld} • 
                {getConfidenceText(analysis.quantitativeMetrics.linguisticComplexity.lexicalDiversity.confidence)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Syntactic Complexity</span>
                <span className={`font-bold ${getScoreColor(analysis.quantitativeMetrics.linguisticComplexity.syntacticComplexity.score)}`}>
                  {analysis.quantitativeMetrics.linguisticComplexity.syntacticComplexity.score}/100
                </span>
              </div>
              <Progress value={analysis.quantitativeMetrics.linguisticComplexity.syntacticComplexity.score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Mean Clause Length: {analysis.quantitativeMetrics.linguisticComplexity.syntacticComplexity.meanClauseLength} • 
                Subordination Index: {analysis.quantitativeMetrics.linguisticComplexity.syntacticComplexity.subordinationIndex}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proficiency Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Proficiency Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.quantitativeMetrics.proficiencyScores).map(([key, value]) => (
              key !== 'overallCEFR' && (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className={`font-bold ${getScoreColor(value.score)}`}>
                      {value.score}/100
                    </span>
                  </div>
                  <Progress value={value.score} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {getConfidenceText(value.confidence)} • 
                    {key === 'grammarAccuracy' && `Error Rate: ${(value as any).errorRate}`}
                    {key === 'lexicalSophistication' && `Academic Words: ${((value as any).academicWordPercentage * 100).toFixed(1)}%`}
                    {key === 'fluencyMetrics' && `Est. WPM: ${(value as any).estimatedWPM}`}
                  </div>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      {(analysis.errorAnalysis.morphosyntactic.length > 0 || 
        analysis.errorAnalysis.lexical.length > 0 || 
        analysis.errorAnalysis.phonological.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Linguistic Error Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.errorAnalysis.morphosyntactic.map((error, index) => (
              <div key={index} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">Morphosyntactic</Badge>
                  <div className="flex-1">
                    <div className="text-sm mb-1">
                      <span className="line-through text-red-600">{error.error}</span>
                      <ArrowRight className="h-4 w-4 inline mx-2" />
                      <span className="text-green-600 font-medium">{error.correction}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Category: {error.category} • Severity: {error.severity} • Frequency: {error.frequency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {analysis.errorAnalysis.lexical.map((error, index) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-100 text-blue-800">Lexical</Badge>
                  <div className="flex-1">
                    <div className="text-sm mb-1">
                      <span className="line-through text-red-600">{error.error}</span>
                      <ArrowRight className="h-4 w-4 inline mx-2" />
                      <span className="text-green-600 font-medium">{error.correction}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suggestion: {error.suggestion} • Category: {error.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Learning Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Learning Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Cognitive Load Assessment</h4>
              <Badge className={`${
                analysis.learningAnalytics.cognitiveLoadAssessment.level === 'low' ? 'bg-green-100 text-green-800' :
                analysis.learningAnalytics.cognitiveLoadAssessment.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {analysis.learningAnalytics.cognitiveLoadAssessment.level.toUpperCase()}
              </Badge>
              <ul className="text-xs text-muted-foreground mt-2 ml-4">
                {analysis.learningAnalytics.cognitiveLoadAssessment.indicators.map((indicator, i) => (
                  <li key={i}>• {indicator}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Interlanguage Stage</h4>
              <Badge className="bg-purple-100 text-purple-800">
                {analysis.learningAnalytics.interlanguageStage.stage}
              </Badge>
              <ul className="text-xs text-muted-foreground mt-2 ml-4">
                {analysis.learningAnalytics.interlanguageStage.characteristics.map((char, i) => (
                  <li key={i}>• {char}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Immediate Focus
              </h4>
              {analysis.personalizedRecommendations.immediateFocus.map((focus, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="font-medium">{focus.skill}</div>
                  <div className="text-muted-foreground">{focus.activity} • {focus.duration}</div>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Practice Schedule
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <div>Frequency: {analysis.personalizedRecommendations.practiceSchedule.frequency}</div>
                <div>Session Length: {analysis.personalizedRecommendations.practiceSchedule.sessionLength}</div>
                <div>Optimal Timing: {analysis.personalizedRecommendations.practiceSchedule.optimalTiming}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Learning Trajectory Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                {analysis.progressProjections.shortTerm.timeframe}
              </h4>
              <ul className="text-sm space-y-1">
                {analysis.progressProjections.shortTerm.expectedImprovements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                {analysis.progressProjections.mediumTerm.timeframe}
              </h4>
              <ul className="text-sm space-y-1">
                {analysis.progressProjections.mediumTerm.expectedImprovements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                {analysis.progressProjections.longTerm.timeframe}
              </h4>
              <ul className="text-sm space-y-1">
                {analysis.progressProjections.longTerm.expectedImprovements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Trophy className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Insights */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Celebration & Recognition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Strengths Highlight</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.motivationalInsights.strengthsHighlight.map((strength, i) => (
                <Badge key={i} className="bg-green-100 text-green-800">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Celebration-Worthy Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.motivationalInsights.celebrationWorthy.map((achievement, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-800">
                  🎉 {achievement}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          onClick={onRestart}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
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