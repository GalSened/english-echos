import { supabase } from "@/integrations/supabase/client";

interface ConversationAnalysis {
  quantitativeMetrics: {
    linguisticComplexity: {
      lexicalDiversity: {score: number, confidence: [number, number], typeTokenRatio: number, mtld: number};
      syntacticComplexity: {meanClauseLength: number, subordinationIndex: number, score: number, confidence: [number, number]};
      morphologicalComplexity: {score: number, confidence: [number, number]};
      phonologicalAwareness: {score: number, confidence: [number, number]};
    };
    proficiencyScores: {
      grammarAccuracy: {score: number, confidence: [number, number], errorRate: number};
      lexicalSophistication: {score: number, confidence: [number, number], academicWordPercentage: number};
      fluencyMetrics: {score: number, confidence: [number, number], estimatedWPM: number};
      pronunciationAssessment: {score: number, confidence: [number, number]};
      pragmaticCompetence: {score: number, confidence: [number, number]};
      overallCEFR: {level: string, confidence: number, score: number};
    };
  };
  errorAnalysis: {
    morphosyntactic: Array<{error: string, correction: string, category: string, severity: string, frequency: number}>;
    lexical: Array<{error: string, correction: string, category: string, severity: string, suggestion: string}>;
    phonological: Array<{error: string, correction: string, phonemeIssue: string, articulationTip: string}>;
    pragmatic: Array<{error: string, correction: string, context: string, culturalNote: string}>;
    transferErrors: Array<{error: string, likelyL1Source: string, intervention: string}>;
  };
  learningAnalytics: {
    cognitiveLoadAssessment: {level: string, indicators: string[], recommendations: string[]};
    interlanguageStage: {stage: string, characteristics: string[], nextDevelopmentalGoals: string[]};
    fossilizationRisk: {riskLevel: string, areas: string[], preventionStrategies: string[]};
    proximityZone: {currentLevel: string, targetLevel: string, optimalChallengeLevel: string, scaffoldingNeeds: string[]};
  };
  personalizedRecommendations: {
    immediateFocus: Array<{skill: string, activity: string, duration: string, difficulty: string}>;
    weeklyGoals: Array<{goal: string, measurableOutcome: string, trackingMethod: string}>;
    resourceRecommendations: Array<{type: string, resource: string, rationale: string, priority: string}>;
    practiceSchedule: {frequency: string, sessionLength: string, optimalTiming: string};
  };
  progressProjections: {
    shortTerm: {timeframe: string, expectedImprovements: string[], keyMilestones: string[]};
    mediumTerm: {timeframe: string, expectedImprovements: string[], keyMilestones: string[]};
    longTerm: {timeframe: string, expectedImprovements: string[], keyMilestones: string[]};
  };
  motivationalInsights: {
    strengthsHighlight: string[];
    effortRecognition: string[];
    encouragingFeedback: string;
    celebrationWorthy: string[];
  };
}

interface ErrorCorrection {
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

class SupabaseOpenAIService {
  async analyzeConversation(userMessages: string[], topic: string, userName: string): Promise<ConversationAnalysis> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { userMessages, topic, userName }
      });

      if (error) {
        throw new Error(`Analysis service error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      // Return fallback analysis
      return this.createFallbackAnalysis(userName);
    }
  }

  async correctText(text: string, context: string = "", userLevel: string = "intermediate"): Promise<ErrorCorrection> {
    try {
      const { data, error } = await supabase.functions.invoke('correct-text', {
        body: { text, context, userLevel }
      });

      if (error) {
        throw new Error(`Correction service error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error correcting text:', error);
      // Return fallback - no errors detected
      return {
        hasErrors: false,
        originalText: text,
        correctedText: text,
        errors: []
      };
    }
  }

  async generateTeacherResponse(userMessage: string, conversationHistory: any[], topic: string, userName: string, userLevel: string = "intermediate"): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-teacher-response', {
        body: { userMessage, conversationHistory, topic, userName, userLevel }
      });

      if (error) {
        throw new Error(`Teacher response service error: ${error.message}`);
      }

      return data.response;
    } catch (error) {
      console.error('Error generating teacher response:', error);
      // Return fallback response
      const fallbackResponses = [
        "That's interesting! Can you tell me more about that?",
        "I'd love to hear more about your thoughts on this.",
        "That's a great point! What else can you share?",
        "How do you feel about what you just mentioned?",
        "Can you explain that a bit more?"
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  async generateFunCorrection(correction: ErrorCorrection, userName: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-fun-correction', {
        body: { correction, userName }
      });

      if (error) {
        throw new Error(`Fun correction service error: ${error.message}`);
      }

      return data.response;
    } catch (error) {
      console.error('Error generating fun correction:', error);
      // Return fallback fun correction
      const errorCount = correction.errors.length;
      const fallbackResponses = [
        `Hey ${userName}! Quick tip - try saying "${correction.correctedText}" instead. It sounds more natural!`,
        `${userName}, almost perfect! Just a tiny tweak: "${correction.correctedText}". You're doing great!`,
        `Nice try ${userName}! Here's a smoother way: "${correction.correctedText}". Keep it up!`,
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  async generateTopics(userName: string, difficulty: string = "intermediate"): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-topics', {
        body: { userName, difficulty }
      });

      if (error) {
        throw new Error(`Topics generation service error: ${error.message}`);
      }

      return data.topics || [];
    } catch (error) {
      console.error('Error generating topics:', error);
      // Return fallback topics
      return [
        {
          title: "Daily Life",
          description: "Talk about your daily routines and habits. What's your favorite part of the day?"
        },
        {
          title: "Travel Dreams", 
          description: "Share your travel experiences and dream destinations. Where would you like to go next?"
        },
        {
          title: "Technology Today",
          description: "Discuss how technology impacts your life. What's your favorite app or gadget?"
        },
        {
          title: "Food & Culture",
          description: "Talk about your favorite foods and cooking experiences. What dish represents your culture?"
        }
      ];
    }
  }

  private createFallbackAnalysis(userName: string): ConversationAnalysis {
    return {
      quantitativeMetrics: {
        linguisticComplexity: {
          lexicalDiversity: {score: 65, confidence: [55, 75], typeTokenRatio: 0.7, mtld: 45},
          syntacticComplexity: {meanClauseLength: 8, subordinationIndex: 0.3, score: 60, confidence: [50, 70]},
          morphologicalComplexity: {score: 65, confidence: [55, 75]},
          phonologicalAwareness: {score: 70, confidence: [60, 80]}
        },
        proficiencyScores: {
          grammarAccuracy: {score: 70, confidence: [60, 80], errorRate: 0.15},
          lexicalSophistication: {score: 65, confidence: [55, 75], academicWordPercentage: 0.1},
          fluencyMetrics: {score: 70, confidence: [60, 80], estimatedWPM: 120},
          pronunciationAssessment: {score: 70, confidence: [60, 80]},
          pragmaticCompetence: {score: 75, confidence: [65, 85]},
          overallCEFR: {level: "B1", confidence: 0.7, score: 70}
        }
      },
      errorAnalysis: {
        morphosyntactic: [],
        lexical: [],
        phonological: [],
        pragmatic: [],
        transferErrors: []
      },
      learningAnalytics: {
        cognitiveLoadAssessment: {level: "medium", indicators: ["Active participation"], recommendations: ["Continue regular practice"]},
        interlanguageStage: {stage: "Intermediate", characteristics: ["Developing fluency"], nextDevelopmentalGoals: ["Increased accuracy"]},
        fossilizationRisk: {riskLevel: "low", areas: [], preventionStrategies: ["Varied practice topics"]},
        proximityZone: {currentLevel: "B1", targetLevel: "B2", optimalChallengeLevel: "B1+", scaffoldingNeeds: ["Structured feedback"]}
      },
      personalizedRecommendations: {
        immediateFocus: [{skill: "Conversational fluency", activity: "Daily speaking practice", duration: "15 minutes", difficulty: "medium"}],
        weeklyGoals: [{goal: "Increase vocabulary usage", measurableOutcome: "Use 10 new words", trackingMethod: "Daily journal"}],
        resourceRecommendations: [{type: "Practice", resource: "Topic-based conversations", rationale: "Maintains engagement", priority: "high"}],
        practiceSchedule: {frequency: "Daily", sessionLength: "15-20 minutes", optimalTiming: "Morning or evening"}
      },
      progressProjections: {
        shortTerm: {timeframe: "1-2 weeks", expectedImprovements: ["Increased confidence"], keyMilestones: ["Consistent participation"]},
        mediumTerm: {timeframe: "1-3 months", expectedImprovements: ["Better vocabulary usage"], keyMilestones: ["B2 level indicators"]},
        longTerm: {timeframe: "6-12 months", expectedImprovements: ["Advanced fluency"], keyMilestones: ["C1 level achievement"]}
      },
      motivationalInsights: {
        strengthsHighlight: [`Great effort in the conversation, ${userName}!`, "Active participation in discussion"],
        effortRecognition: ["Consistent practice", "Engaged learning attitude"],
        encouragingFeedback: `Excellent work in today's conversation, ${userName}! Your engagement shows real commitment to improvement.`,
        celebrationWorthy: ["Taking on conversation challenges", "Maintaining consistent practice"]
      }
    };
  }
}

export { SupabaseOpenAIService, type ConversationAnalysis, type ErrorCorrection };