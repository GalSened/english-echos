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
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
      return false;
    }
    try {
      // Test API availability with a simple call
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI availability check failed:', error);
      return false;
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, temperature: number = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data: any = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw error;
    }
  }

  async generateTeacherResponse(
    conversationHistory: Array<{ text: string; isTeacher: boolean }>,
    topic: string,
    userName: string,
    userLevel: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a warm, encouraging English teacher 👨‍🏫. Your student is ${userName}, at ${userLevel} level. You're having a conversation about "${topic}". 

Guidelines:
- Be natural, friendly, and supportive 🌟
- Adapt your vocabulary and sentence complexity to ${userLevel} level
- Ask engaging follow-up questions
- Gently correct errors inline with encouraging phrases like "Great try! You could also say..."
- Use occasional emojis to keep it fun and engaging
- Keep responses concise (2-3 sentences max)
- Show genuine interest in what the student says`,
      },
      ...conversationHistory.map(msg => ({
        role: msg.isTeacher ? 'assistant' : 'user',
        content: msg.text,
      })),
    ];

    return this.chat(messages, 0.8);
  }

  async analyzeConversation(
    userMessages: string[],
    topic: string,
    userName: string
  ): Promise<ConversationAnalysis> {
    const prompt = `
You are a warm, encouraging English teacher with a great sense of humor who genuinely cares about your students' progress! 🌟

Student: ${userName}
Topic: ${topic}
Student's messages: ${JSON.stringify(userMessages)}

Please provide a comprehensive yet friendly analysis. Remember to:
- Be empathetic and understanding (learning a language is challenging!)
- Use encouraging language and celebrate small victories
- Add a touch of gentle humor where appropriate
- Ask thoughtful questions about their learning goals and interests
- Show genuine curiosity about their background and motivations
- Provide practical, actionable feedback that doesn't overwhelm

Structure your analysis as follows:

1. Grammar Errors: Gently point out mistakes with kind explanations (like a patient friend helping out)
2. Vocabulary Improvements: Suggest exciting new words that could make their conversations sparkle
3. Pronunciation Tips: Share practical tips with encouraging words
4. Overall Feedback: Celebrate their efforts and progress with warmth and humor
5. Strengths: Highlight what they're doing amazingly well (be specific and genuine!)
6. Areas to Improve: Frame as exciting opportunities for growth
7. Next Steps: Suggest fun, engaging activities that match their interests
8. Score Breakdown: Rate out of 10 with encouraging context

Questions to explore: What topics interest them most? What are their language learning goals? What challenges are they facing?

Be their biggest cheerleader while providing genuinely helpful guidance! 💪✨
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
              content: 'You are a warm, encouraging English teacher who loves helping students improve! Always maintain a positive, supportive tone with gentle humor. Provide detailed conversation analysis as a valid JSON object matching the ConversationAnalysis interface. Make your feedback feel like advice from a caring mentor, not a critical judge.'
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
Hey there! Let's take a friendly look at this text together! 😊

Text: "${text}"
Context: ${context}

I'm here to help you shine even brighter! Let me gently check if there are any areas where we can polish this up:

- Grammar: Any little tweaks that could make it flow better?
- Vocabulary: Could we sprinkle in some more vibrant words?
- Spelling: Just double-checking everything looks perfect!
- Pronunciation: Any tips to help you sound confident?

If everything looks great already, I'll celebrate that with you! 🎉

Remember, making mistakes is how we learn and grow - you're doing fantastic by practicing!

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
              content: 'You are a kind, supportive English teacher who provides gentle, encouraging error corrections with warmth and humor! Always frame corrections positively and celebrate progress. Return your response as a valid JSON object matching the ErrorCorrection interface. Make students feel supported, not judged.'
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
        "You're doing great! Focus on clear pronunciation of ending sounds - it'll make your speech sparkle! ✨",
        "Try practicing stress patterns in multi-syllable words - think of it like finding the rhythm in music! 🎵"
      ],
      overallFeedback: `Wow, fantastic job practicing ${topic}! 🌟 I can see you're really putting effort into this conversation, and that's exactly how progress happens. You engaged with the topic beautifully and showed genuine enthusiasm for learning. Keep this positive energy going - you're on a wonderful learning journey!`,
      strengths: [
        "You jumped into the conversation with confidence - that takes courage! 💪",
        "Your ideas came through clearly, showing great communication instincts",
        "You stayed engaged with the topic throughout - excellent focus!"
      ],
      areasToImprove: [
        "Keep building that confidence - you're already doing so well! 🚀",
        "Exploring new vocabulary will add even more color to your conversations",
        "Practice makes perfect, and you're clearly dedicated to improving!"
      ],
      nextSteps: [
        "Try chatting about topics you're passionate about - when you love the subject, the words flow naturally! ❤️",
        "Record yourself speaking and listen back - you'll be amazed at your progress!",
        "Challenge yourself with new conversation topics - variety is the spice of learning! 🌶️"
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