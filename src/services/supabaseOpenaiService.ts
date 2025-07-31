import { supabase } from "@/integrations/supabase/client";

interface ConversationAnalysis {
  grammarErrors: {
    error: string;
    correction: string;
    explanation: string;
  }[];
  vocabularyImprovements: {
    word: string;
    betterAlternatives: string[];
    context: string;
  }[];
  pronunciationTips: string[];
  overallFeedback: string;
  strengths: string[];
  areasToImprove: string[];
  nextSteps: string[];
  scoreBreakdown: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    overall: number;
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
      grammarErrors: [],
      vocabularyImprovements: [],
      pronunciationTips: ["Keep practicing to improve pronunciation"],
      overallFeedback: `Great job participating in the conversation, ${userName}! Keep up the excellent work.`,
      strengths: ["Engaged actively in the conversation", "Showed enthusiasm for learning"],
      areasToImprove: ["Keep practicing regularly", "Try conversations on various topics"],
      nextSteps: ["Continue daily practice", "Explore new vocabulary themes"],
      scoreBreakdown: {
        grammar: 7,
        vocabulary: 7,
        fluency: 7,
        pronunciation: 7,
        overall: 7
      }
    };
  }
}

export { SupabaseOpenAIService, type ConversationAnalysis, type ErrorCorrection };