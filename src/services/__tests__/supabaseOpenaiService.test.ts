import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseOpenAIService } from '../supabaseOpenaiService';
import { mockSupabaseClient } from '@/test/mocks';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('SupabaseOpenAIService', () => {
  let service: SupabaseOpenAIService;

  beforeEach(() => {
    service = new SupabaseOpenAIService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Text Correction', () => {
    it('should correct text with errors', async () => {
      const mockResponse = {
        data: {
          hasErrors: true,
          corrections: [
            {
              original: 'I go to school yesterday',
              corrected: 'I went to school yesterday',
              type: 'verb_tense',
              explanation: 'Use past tense for yesterday'
            }
          ],
          correctedText: 'I went to school yesterday',
          errorCount: 1
        },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.correctText('I go to school yesterday', 'Daily Activities', 'intermediate');

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('correct-text', {
        body: {
          text: 'I go to school yesterday',
          topic: 'Daily Activities',
          userLevel: 'intermediate'
        }
      });

      expect(result).toEqual(mockResponse.data);
      expect(result.hasErrors).toBe(true);
      expect(result.errorCount).toBe(1);
    });

    it('should handle text without errors', async () => {
      const mockResponse = {
        data: {
          hasErrors: false,
          corrections: [],
          correctedText: 'I went to school yesterday',
          errorCount: 0
        },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.correctText('I went to school yesterday', 'Daily Activities', 'intermediate');

      expect(result.hasErrors).toBe(false);
      expect(result.errorCount).toBe(0);
    });

    it('should handle API errors', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('API Error')
      });

      await expect(service.correctText('test text', 'topic', 'beginner')).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      mockSupabaseClient.functions.invoke.mockRejectedValue(new Error('Network Error'));

      await expect(service.correctText('test text', 'topic', 'beginner')).rejects.toThrow('Network Error');
    });
  });

  describe('Fun Correction Generation', () => {
    it('should generate fun correction messages', async () => {
      const mockCorrection = {
        hasErrors: true,
        corrections: [
          {
            original: 'I go to school yesterday',
            corrected: 'I went to school yesterday',
            type: 'verb_tense',
            explanation: 'Use past tense for yesterday'
          }
        ],
        correctedText: 'I went to school yesterday',
        errorCount: 1
      };

      const mockResponse = {
        data: {
          response: 'Great effort! Just a small tip: when talking about yesterday, we use "went" instead of "go". Try saying "I went to school yesterday"!'
        },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.generateFunCorrection(mockCorrection, 'Alice');

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('generate-fun-correction', {
        body: {
          correction: mockCorrection,
          userName: 'Alice'
        }
      });

      expect(result).toBe(mockResponse.data.response);
    });

    it('should handle empty corrections', async () => {
      const mockCorrection = {
        hasErrors: false,
        corrections: [],
        correctedText: 'Perfect sentence',
        errorCount: 0
      };

      const mockResponse = {
        data: { response: 'Perfect! Your sentence is grammatically correct.' },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.generateFunCorrection(mockCorrection, 'Bob');

      expect(result).toBe(mockResponse.data.response);
    });
  });

  describe('Teacher Response Generation', () => {
    it('should generate appropriate teacher responses', async () => {
      const mockMessages = [
        { id: '1', text: 'I love traveling', isTeacher: false, timestamp: new Date() },
        { id: '2', text: 'That sounds exciting! Where have you been?', isTeacher: true, timestamp: new Date() },
        { id: '3', text: 'I visited Japan last year', isTeacher: false, timestamp: new Date() }
      ];

      const mockResponse = {
        data: {
          response: 'Japan is amazing! What was your favorite experience there?'
        },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.generateTeacherResponse(
        'I visited Japan last year',
        mockMessages,
        'Travel Adventures',
        'intermediate',
        'Sarah'
      );

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('generate-teacher-response', {
        body: {
          userMessage: 'I visited Japan last year',
          conversationHistory: mockMessages,
          topic: 'Travel Adventures',
          userLevel: 'intermediate',
          userName: 'Sarah'
        }
      });

      expect(result).toBe(mockResponse.data.response);
    });

    it('should handle different user levels', async () => {
      const levels = ['beginner', 'intermediate', 'advanced'] as const;

      for (const level of levels) {
        const mockResponse = {
          data: { response: `Response for ${level} level` },
          error: null
        };

        mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

        const result = await service.generateTeacherResponse(
          'Test message',
          [],
          'Test Topic',
          level,
          'TestUser'
        );

        expect(result).toBe(`Response for ${level} level`);
      }
    });
  });

  describe('Conversation Analysis', () => {
    it('should analyze conversation comprehensively', async () => {
      const mockMessages = [
        { id: '1', text: 'Hello teacher', isTeacher: false, timestamp: new Date() },
        { id: '2', text: 'Hello! How are you today?', isTeacher: true, timestamp: new Date() },
        { id: '3', text: 'I am good. I want to practice speaking English.', isTeacher: false, timestamp: new Date() }
      ];

      const mockAnalysis = {
        quantitativeMetrics: {
          linguisticComplexity: {
            lexicalDiversity: { score: 75, confidence: [65, 85], typeTokenRatio: 0.8, mtld: 50 },
            syntacticComplexity: { meanClauseLength: 9, subordinationIndex: 0.4, score: 70, confidence: [60, 80] },
            morphologicalComplexity: { score: 72, confidence: [62, 82] },
            phonologicalAwareness: { score: 78, confidence: [68, 88] }
          },
          proficiencyScores: {
            grammarAccuracy: { score: 80, confidence: [70, 90], errorRate: 0.1 },
            lexicalSophistication: { score: 75, confidence: [65, 85], academicWordPercentage: 0.2 },
            fluencyMetrics: { score: 73, confidence: [63, 83], estimatedWPM: 130 },
            pronunciationAssessment: { score: 77, confidence: [67, 87] },
            pragmaticCompetence: { score: 81, confidence: [71, 91] },
            overallCEFR: { level: 'B2', confidence: 0.85, score: 76 }
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
          cognitiveLoadAssessment: { level: 'medium', indicators: ['Active engagement'], recommendations: ['Continue varied practice'] },
          interlanguageStage: { stage: 'Upper-Intermediate', characteristics: ['Consistent accuracy'], nextDevelopmentalGoals: ['Advanced fluency'] },
          fossilizationRisk: { riskLevel: 'low', areas: [], preventionStrategies: ['Regular feedback'] },
          proximityZone: { currentLevel: 'B2', targetLevel: 'C1', optimalChallengeLevel: 'B2+', scaffoldingNeeds: ['Complex grammar practice'] }
        },
        personalizedRecommendations: {
          immediateFocus: [{ skill: 'Advanced vocabulary', activity: 'Academic reading', duration: '20 minutes', difficulty: 'high' }],
          weeklyGoals: [{ goal: 'Master subjunctive mood', measurableOutcome: 'Use correctly in 5 sentences', trackingMethod: 'Practice exercises' }],
          resourceRecommendations: [{ type: 'Study', resource: 'Advanced grammar books', rationale: 'Prepares for C1 level', priority: 'high' }],
          practiceSchedule: { frequency: 'Daily', sessionLength: '20-30 minutes', optimalTiming: 'Afternoon' }
        },
        progressProjections: {
          shortTerm: { timeframe: '2-3 weeks', expectedImprovements: ['Complex sentence structures'], keyMilestones: ['Consistent C1 indicators'] },
          mediumTerm: { timeframe: '2-4 months', expectedImprovements: ['Advanced vocabulary mastery'], keyMilestones: ['C1 level achievement'] },
          longTerm: { timeframe: '6-12 months', expectedImprovements: ['Near-native fluency'], keyMilestones: ['C2 level readiness'] }
        },
        motivationalInsights: {
          strengthsHighlight: ['Excellent grammar foundation', 'Strong vocabulary'],
          effortRecognition: ['Dedicated practice', 'Consistent improvement'],
          encouragementMessage: 'Outstanding progress! You are approaching advanced level.',
          progressCelebration: 'Your dedication is paying off with remarkable improvement.',
          nextLevelPreview: 'You are ready to tackle C1 level challenges.'
        }
      };

      const mockResponse = {
        data: mockAnalysis,
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.analyzeConversation(mockMessages, 'Test Topic', 'TestUser');

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('analyze-conversation', {
        body: {
          messages: mockMessages,
          topic: 'Test Topic',
          userName: 'TestUser'
        }
      });

      expect(result).toEqual(mockAnalysis);
      expect(result.quantitativeMetrics.proficiencyScores.overallCEFR.level).toBe('B2');
      expect(result.learningAnalytics.interlanguageStage.stage).toBe('Upper-Intermediate');
    });

    it('should handle empty conversation', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Insufficient data for analysis')
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      await expect(service.analyzeConversation([], 'Test Topic', 'TestUser')).rejects.toThrow('Insufficient data for analysis');
    });
  });

  describe('Topic Generation', () => {
    it('should generate conversation topics', async () => {
      const mockTopics = [
        {
          id: '1',
          title: 'Sustainable Living',
          description: 'Discuss eco-friendly lifestyle choices',
          difficulty: 'intermediate' as const,
          category: 'environment'
        },
        {
          id: '2',
          title: 'Digital Innovation',
          description: 'Explore latest technology trends',
          difficulty: 'advanced' as const,
          category: 'technology'
        },
        {
          id: '3',
          title: 'Cultural Traditions',
          description: 'Share cultural experiences and traditions',
          difficulty: 'beginner' as const,
          category: 'culture'
        }
      ];

      const mockResponse = {
        data: { topics: mockTopics },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.generateTopics('intermediate', ['environment', 'technology']);

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('generate-topics', {
        body: {
          userLevel: 'intermediate',
          interests: ['environment', 'technology']
        }
      });

      expect(result).toEqual(mockTopics);
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Sustainable Living');
    });

    it('should handle different user levels for topic generation', async () => {
      const levels = ['beginner', 'intermediate', 'advanced'] as const;

      for (const level of levels) {
        const mockTopics = [
          {
            id: '1',
            title: `${level} Topic`,
            description: `Topic for ${level} level`,
            difficulty: level,
            category: 'general'
          }
        ];

        const mockResponse = {
          data: { topics: mockTopics },
          error: null
        };

        mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

        const result = await service.generateTopics(level, ['general']);

        expect(result[0].difficulty).toBe(level);
      }
    });
  });

  describe('Connection Testing', () => {
    it('should test connection successfully', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { status: 'connected' },
        error: null
      });

      const result = await service.testConnection();

      expect(result).toBe(true);
    });

    it('should handle connection failures', async () => {
      mockSupabaseClient.functions.invoke.mockRejectedValue(new Error('Connection failed'));

      const result = await service.testConnection();

      expect(result).toBe(false);
    });

    it('should handle API errors during connection test', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('API Error')
      });

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle null responses gracefully', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: null,
        error: null
      });

      await expect(service.correctText('test', 'topic', 'beginner')).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      mockSupabaseClient.functions.invoke.mockResolvedValue({
        data: { invalidStructure: true },
        error: null
      });

      await expect(service.correctText('test', 'topic', 'beginner')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockSupabaseClient.functions.invoke.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(service.correctText('test', 'topic', 'beginner')).rejects.toThrow('Request timeout');
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponse = {
        data: { hasErrors: false, corrections: [], correctedText: 'test', errorCount: 0 },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const promises = Array(5).fill(null).map(() => 
        service.correctText('test text', 'topic', 'intermediate')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(5);
    });

    it('should handle large text inputs', async () => {
      const largeText = 'a'.repeat(10000);
      const mockResponse = {
        data: { hasErrors: false, corrections: [], correctedText: largeText, errorCount: 0 },
        error: null
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const result = await service.correctText(largeText, 'topic', 'advanced');

      expect(result.correctedText).toBe(largeText);
    });
  });
});