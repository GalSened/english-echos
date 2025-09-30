import { config } from '@/config';
import type { ConversationAnalysis, ErrorCorrection } from './types';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GroqService {
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = config.groqApiKey;
    this.model = config.groqModel;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Groq API key not configured');
      return false;
    }
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Groq availability check failed:', error);
      return false;
    }
  }

  async chat(messages: GroqMessage[], temperature: number = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq chat error:', error);
      throw error;
    }
  }

  async analyzeConversation(
    messages: Array<{ text: string; isTeacher: boolean }>,
    userName: string,
    userLevel: string
  ): Promise<ConversationAnalysis> {
    const conversationText = messages
      .map((m) => `${m.isTeacher ? 'Teacher' : userName}: ${m.text}`)
      .join('\n');

    const systemPrompt = `You are an expert English language assessment specialist with deep knowledge of linguistics, SLA theory, and CEFR standards. Analyze the following conversation and provide a comprehensive assessment.`;

    const userPrompt = `Student Level: ${userLevel}
Student Name: ${userName}

Conversation:
${conversationText}

Provide a detailed JSON analysis following this exact structure (return ONLY valid JSON, no markdown):
{
  "quantitativeMetrics": {
    "linguisticComplexity": {
      "lexicalDiversity": {"score": 0-10, "confidence": [min, max], "typeTokenRatio": 0-1, "mtld": number},
      "syntacticComplexity": {"meanClauseLength": number, "subordinationIndex": 0-1, "score": 0-10, "confidence": [min, max]},
      "morphologicalComplexity": {"score": 0-10, "confidence": [min, max]},
      "phonologicalAwareness": {"score": 0-10, "confidence": [min, max]}
    },
    "proficiencyScores": {
      "grammarAccuracy": {"score": 0-10, "confidence": [min, max], "errorRate": 0-1},
      "lexicalSophistication": {"score": 0-10, "confidence": [min, max], "academicWordPercentage": 0-100},
      "fluencyMetrics": {"score": 0-10, "confidence": [min, max], "estimatedWPM": number},
      "pronunciationAssessment": {"score": 0-10, "confidence": [min, max]},
      "pragmaticCompetence": {"score": 0-10, "confidence": [min, max]},
      "overallCEFR": {"level": "A1-C2", "confidence": 0-1, "score": 0-10}
    }
  },
  "errorAnalysis": {
    "morphosyntactic": [{"error": "", "correction": "", "category": "", "severity": "", "frequency": 0}],
    "lexical": [{"error": "", "correction": "", "category": "", "severity": "", "suggestion": ""}],
    "phonological": [{"error": "", "correction": "", "phonemeIssue": "", "articulationTip": ""}],
    "pragmatic": [{"error": "", "correction": "", "context": "", "culturalNote": ""}],
    "transferErrors": [{"error": "", "likelyL1Source": "", "intervention": ""}]
  },
  "learningAnalytics": {
    "cognitiveLoadAssessment": {"level": "", "indicators": [], "recommendations": []},
    "interlanguageStage": {"stage": "", "characteristics": [], "nextDevelopmentalGoals": []},
    "fossilizationRisk": {"riskLevel": "", "areas": [], "preventionStrategies": []},
    "proximityZone": {"currentLevel": "", "targetLevel": "", "optimalChallengeLevel": "", "scaffoldingNeeds": []}
  },
  "personalizedRecommendations": {
    "immediateFocus": [{"skill": "", "activity": "", "duration": "", "difficulty": ""}],
    "weeklyGoals": [{"goal": "", "measurableOutcome": "", "trackingMethod": ""}],
    "resourceRecommendations": [{"type": "", "resource": "", "rationale": "", "priority": ""}],
    "practiceSchedule": {"frequency": "", "sessionLength": "", "optimalTiming": ""}
  },
  "progressProjections": {
    "shortTerm": {"timeframe": "", "expectedImprovements": [], "keyMilestones": []},
    "mediumTerm": {"timeframe": "", "expectedImprovements": [], "keyMilestones": []},
    "longTerm": {"timeframe": "", "expectedImprovements": [], "keyMilestones": []}
  },
  "motivationalInsights": {
    "strengthsHighlight": [],
    "effortRecognition": [],
    "encouragingFeedback": "",
    "celebrationWorthy": []
  }
}`;

    const response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7
    );

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    return JSON.parse(jsonStr);
  }

  async correctText(text: string, context: string = ''): Promise<ErrorCorrection> {
    const systemPrompt = `You are an expert English teacher specializing in error correction and natural language feedback. Analyze the student's text and provide detailed corrections.`;

    const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Student's text: "${text}"

Provide a detailed JSON correction following this exact structure (return ONLY valid JSON, no markdown):
{
  "hasErrors": boolean,
  "originalText": "${text}",
  "correctedText": "corrected version",
  "errors": [
    {
      "type": "grammar|vocabulary|pronunciation|fluency|cultural",
      "original": "incorrect phrase",
      "corrected": "correct phrase",
      "explanation": "why it's wrong and how to fix it",
      "speakingTip": "practical tip for speaking"
    }
  ],
  "overallAdvice": {
    "strengths": ["what they did well"],
    "improvements": ["areas to work on"],
    "speakingTips": ["practical tips"],
    "practiceExercises": ["suggested exercises"]
  },
  "naturalAlternatives": [
    {
      "original": "their phrase",
      "alternative": "more natural version",
      "context": "when to use this"
    }
  ]
}`;

    const response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.7
    );

    // Extract JSON from response
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    return JSON.parse(jsonStr);
  }

  async generateTeacherResponse(
    conversationHistory: Array<{ text: string; isTeacher: boolean }>,
    topic: string,
    userName: string,
    userLevel: string
  ): Promise<string> {
    const conversationText = conversationHistory
      .slice(-6) // Last 3 exchanges
      .map((m) => `${m.isTeacher ? 'Teacher' : userName}: ${m.text}`)
      .join('\n');

    const systemPrompt = `You are an encouraging and patient English teacher having a conversation about "${topic}".
Your student is at ${userLevel} level. Keep responses natural, conversational, and appropriate for their level.
Ask follow-up questions, provide gentle corrections when needed, and maintain an engaging dialogue.`;

    const userPrompt = `Recent conversation:
${conversationText}

${userName}: ${conversationHistory[conversationHistory.length - 1].text}

Respond naturally as the teacher (2-3 sentences max, appropriate for ${userLevel} level):`;

    return await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.8
    );
  }
}

export const groqService = new GroqService();