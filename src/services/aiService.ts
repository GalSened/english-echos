import { config } from '@/config';
import { ollamaService } from './ollamaService';
import { groqService } from './groqService';
import { OpenAIService } from './openaiService';
import type { ConversationAnalysis, ErrorCorrection } from './types';

/**
 * Unified AI Service - automatically uses OpenAI, Groq, or Ollama based on configuration
 * Provides fallback mechanism if primary service fails
 */
class AIService {
  private primaryService: typeof ollamaService | typeof groqService | OpenAIService;
  private fallbackService: typeof ollamaService | typeof groqService | OpenAIService | null;
  private serviceName: string;

  constructor() {
    // Priority: OpenAI > Groq > Ollama
    if (config.useOpenAI && config.openaiApiKey) {
      this.primaryService = new OpenAIService(config.openaiApiKey);
      this.fallbackService = config.useGroq ? groqService : ollamaService;
      this.serviceName = 'OpenAI';
      console.log('AI Service initialized with OpenAI (primary)',
        this.fallbackService ? `, ${config.useGroq ? 'Groq' : 'Ollama'} (fallback)` : '');
    } else if (config.useGroq) {
      this.primaryService = groqService;
      this.fallbackService = ollamaService;
      this.serviceName = 'Groq';
      console.log('AI Service initialized with Groq (primary), Ollama (fallback)');
    } else {
      this.primaryService = ollamaService;
      this.fallbackService = config.groqApiKey ? groqService : null;
      this.serviceName = 'Ollama';
      console.log('AI Service initialized with Ollama (primary)',
        this.fallbackService ? ', Groq (fallback)' : ' (no fallback)');
    }
  }

  async isAvailable(): Promise<boolean> {
    const primaryAvailable = await this.primaryService.isAvailable();
    if (primaryAvailable) {
      return true;
    }

    if (this.fallbackService) {
      console.warn('Primary AI service unavailable, checking fallback...');
      return await this.fallbackService.isAvailable();
    }

    return false;
  }

  async getStatus(): Promise<{
    primary: { name: string; available: boolean };
    fallback: { name: string; available: boolean } | null;
  }> {
    const primaryName = this.serviceName;
    let fallbackName: string | null = null;

    if (config.useOpenAI && config.openaiApiKey) {
      fallbackName = config.useGroq ? 'Groq' : 'Ollama';
    } else if (config.useGroq) {
      fallbackName = 'Ollama';
    } else {
      fallbackName = config.groqApiKey ? 'Groq' : null;
    }

    const primaryAvailable = await this.primaryService.isAvailable();
    const fallbackAvailable = this.fallbackService
      ? await this.fallbackService.isAvailable()
      : false;

    return {
      primary: { name: primaryName, available: primaryAvailable },
      fallback: fallbackName
        ? { name: fallbackName, available: fallbackAvailable }
        : null,
    };
  }

  private async executeWithFallback<T>(
    operation: (service: typeof ollamaService | typeof groqService | OpenAIService) => Promise<T>
  ): Promise<T> {
    try {
      return await operation(this.primaryService);
    } catch (error) {
      console.error('Primary AI service failed:', error);

      if (this.fallbackService) {
        console.warn('Attempting fallback AI service...');
        try {
          return await operation(this.fallbackService);
        } catch (fallbackError) {
          console.error('Fallback AI service also failed:', fallbackError);
          throw new Error('Both primary and fallback AI services failed');
        }
      }

      throw error;
    }
  }

  async analyzeConversation(
    messages: Array<{ text: string; isTeacher: boolean }>,
    userName: string,
    userLevel: string
  ): Promise<ConversationAnalysis> {
    return this.executeWithFallback(service =>
      service.analyzeConversation(messages, userName, userLevel)
    );
  }

  async correctText(text: string, context: string = ''): Promise<ErrorCorrection> {
    return this.executeWithFallback(service =>
      service.correctText(text, context)
    );
  }

  async generateTeacherResponse(
    conversationHistory: Array<{ text: string; isTeacher: boolean }>,
    topic: string,
    userName: string,
    userLevel: string
  ): Promise<string> {
    return this.executeWithFallback(service =>
      service.generateTeacherResponse(conversationHistory, topic, userName, userLevel)
    );
  }

  /**
   * Get conversation starter from AI
   */
  async getConversationStarter(topic: string, userLevel: string): Promise<string> {
    const systemPrompt = `You are a friendly English teacher starting a conversation about "${topic}" with a ${userLevel} student.`;
    const userPrompt = `Generate a natural, engaging opening line to start a conversation about "${topic}". Keep it simple and appropriate for ${userLevel} level. Just the opening line, no introduction.`;

    return this.executeWithFallback(async (service) => {
      if ('chat' in service) {
        return await service.chat(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          0.8
        );
      }
      throw new Error('Chat method not available');
    });
  }

  /**
   * Generate topic suggestions based on user level
   */
  async generateTopicSuggestions(userLevel: string, count: number = 5): Promise<string[]> {
    const systemPrompt = `You are an English teaching expert. Generate engaging conversation topics.`;
    const userPrompt = `Generate ${count} interesting conversation topics for ${userLevel} English learners. Topics should be practical, engaging, and appropriate for their level. Return ONLY a JSON array of strings, no markdown.`;

    return this.executeWithFallback(async (service) => {
      if ('chat' in service) {
        const response = await service.chat(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          0.7
        );

        // Extract JSON array from response
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
        }

        const topics = JSON.parse(jsonStr);
        return Array.isArray(topics) ? topics : [];
      }
      throw new Error('Chat method not available');
    });
  }
}

export const aiService = new AIService();