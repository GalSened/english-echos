// Shared types for AI services

export interface ConversationAnalysis {
  quantitativeMetrics: {
    linguisticComplexity: {
      lexicalDiversity: { score: number; confidence: [number, number]; typeTokenRatio: number; mtld: number };
      syntacticComplexity: { meanClauseLength: number; subordinationIndex: number; score: number; confidence: [number, number] };
      morphologicalComplexity: { score: number; confidence: [number, number] };
      phonologicalAwareness: { score: number; confidence: [number, number] };
    };
    proficiencyScores: {
      grammarAccuracy: { score: number; confidence: [number, number]; errorRate: number };
      lexicalSophistication: { score: number; confidence: [number, number]; academicWordPercentage: number };
      fluencyMetrics: { score: number; confidence: [number, number]; estimatedWPM: number };
      pronunciationAssessment: { score: number; confidence: [number, number] };
      pragmaticCompetence: { score: number; confidence: [number, number] };
      overallCEFR: { level: string; confidence: number; score: number };
    };
  };
  errorAnalysis: {
    morphosyntactic: Array<{ error: string; correction: string; category: string; severity: string; frequency: number }>;
    lexical: Array<{ error: string; correction: string; category: string; severity: string; suggestion: string }>;
    phonological: Array<{ error: string; correction: string; phonemeIssue: string; articulationTip: string }>;
    pragmatic: Array<{ error: string; correction: string; context: string; culturalNote: string }>;
    transferErrors: Array<{ error: string; likelyL1Source: string; intervention: string }>;
  };
  learningAnalytics: {
    cognitiveLoadAssessment: { level: string; indicators: string[]; recommendations: string[] };
    interlanguageStage: { stage: string; characteristics: string[]; nextDevelopmentalGoals: string[] };
    fossilizationRisk: { riskLevel: string; areas: string[]; preventionStrategies: string[] };
    proximityZone: { currentLevel: string; targetLevel: string; optimalChallengeLevel: string; scaffoldingNeeds: string[] };
  };
  personalizedRecommendations: {
    immediateFocus: Array<{ skill: string; activity: string; duration: string; difficulty: string }>;
    weeklyGoals: Array<{ goal: string; measurableOutcome: string; trackingMethod: string }>;
    resourceRecommendations: Array<{ type: string; resource: string; rationale: string; priority: string }>;
    practiceSchedule: { frequency: string; sessionLength: string; optimalTiming: string };
  };
  progressProjections: {
    shortTerm: { timeframe: string; expectedImprovements: string[]; keyMilestones: string[] };
    mediumTerm: { timeframe: string; expectedImprovements: string[]; keyMilestones: string[] };
    longTerm: { timeframe: string; expectedImprovements: string[]; keyMilestones: string[] };
  };
  motivationalInsights: {
    strengthsHighlight: string[];
    effortRecognition: string[];
    encouragingFeedback: string;
    celebrationWorthy: string[];
  };
}

export interface ErrorCorrection {
  hasErrors: boolean;
  originalText: string;
  correctedText: string;
  errors: {
    type: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency' | 'cultural';
    original: string;
    corrected: string;
    explanation: string;
    speakingTip: string;
  }[];
  overallAdvice?: {
    strengths: string[];
    improvements: string[];
    speakingTips: string[];
    practiceExercises: string[];
  };
  naturalAlternatives?: {
    original: string;
    alternative: string;
    context: string;
  }[];
}

export interface Message {
  id: string;
  text: string;
  isTeacher: boolean;
  timestamp: Date;
  correction?: ErrorCorrection;
}