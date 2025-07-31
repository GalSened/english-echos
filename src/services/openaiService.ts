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
    type: 'grammar' | 'vocabulary' | 'pronunciation' | 'spelling';
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeConversation(
    userMessages: string[],
    topic: string,
    userName: string
  ): Promise<ConversationAnalysis> {
    const prompt = `
You are an expert English teacher analyzing a conversation practice session.

Student: ${userName}
Topic: ${topic}
Student's messages: ${JSON.stringify(userMessages)}

Please provide a comprehensive analysis with the following structure:

1. Grammar Errors: Identify specific grammatical mistakes with corrections and explanations
2. Vocabulary Improvements: Suggest better word choices and alternatives
3. Pronunciation Tips: Based on common patterns, suggest pronunciation focus areas
4. Overall Feedback: General assessment of the conversation
5. Strengths: What the student did well
6. Areas to Improve: Specific areas needing work
7. Next Steps: Actionable recommendations for improvement
8. Score Breakdown: Rate out of 10 for grammar, vocabulary, fluency, pronunciation, and overall

Be encouraging but constructive. Focus on practical improvements.
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert English teacher providing detailed conversation analysis. Return your response as a valid JSON object matching the ConversationAnalysis interface.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return this.createFallbackAnalysis(userMessages, topic);
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return this.createFallbackAnalysis(userMessages, topic);
    }
  }

  async correctText(text: string, context: string = ""): Promise<ErrorCorrection> {
    const prompt = `
Analyze this English text for errors and provide corrections:

Text: "${text}"
Context: ${context}

Please identify any grammar, vocabulary, spelling, or pronunciation issues and provide corrections with explanations.
If there are no errors, indicate that the text is correct.

Return as JSON matching the ErrorCorrection interface.
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an English teacher providing error corrections. Return your response as a valid JSON object.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return {
          hasErrors: false,
          originalText: text,
          correctedText: text,
          errors: []
        };
      }
    } catch (error) {
      console.error('Error correcting text:', error);
      return {
        hasErrors: false,
        originalText: text,
        correctedText: text,
        errors: []
      };
    }
  }

  private createFallbackAnalysis(userMessages: string[], topic: string): ConversationAnalysis {
    return {
      grammarErrors: [],
      vocabularyImprovements: [],
      pronunciationTips: [
        "Focus on clear pronunciation of ending sounds",
        "Practice stress patterns in multi-syllable words"
      ],
      overallFeedback: `Great job practicing ${topic}! You participated actively in the conversation.`,
      strengths: [
        "Engaged in the conversation topic",
        "Attempted to communicate ideas clearly"
      ],
      areasToImprove: [
        "Continue practicing to build confidence",
        "Focus on expanding vocabulary"
      ],
      nextSteps: [
        "Practice similar conversations daily",
        "Record yourself speaking to track progress"
      ],
      scoreBreakdown: {
        grammar: 7,
        vocabulary: 7,
        fluency: 6,
        pronunciation: 6,
        overall: 7
      }
    };
  }
}

export { OpenAIService, type ConversationAnalysis, type ErrorCorrection };