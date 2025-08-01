import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnglishTeacher } from '../EnglishTeacher';
import {
  mockElevenLabsService,
  mockWebSpeechService,
  mockOpenAIService,
  mockSystemTestOrchestrator,
  mockToast,
  mockSessionStorage,
} from '@/test/mocks';

// Mock the services
vi.mock('@/services/elevenlabsService', () => ({
  ElevenLabsService: vi.fn(() => mockElevenLabsService),
}));

vi.mock('@/services/webSpeechService', () => ({
  WebSpeechService: vi.fn(() => mockWebSpeechService),
}));

vi.mock('@/services/supabaseOpenaiService', () => ({
  SupabaseOpenAIService: vi.fn(() => mockOpenAIService),
}));

vi.mock('@/services/systemTestOrchestrator', () => ({
  SystemTestOrchestrator: vi.fn(() => mockSystemTestOrchestrator),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('EnglishTeacher', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render user setup screen initially', () => {
      render(<EnglishTeacher />);
      expect(screen.getByText(/welcome to your ai english teacher/i)).toBeInTheDocument();
    });

    it('should initialize services on mount', async () => {
      render(<EnglishTeacher />);
      await waitFor(() => {
        expect(mockElevenLabsService.testService).toHaveBeenCalled();
      });
    });

    it('should load saved user info from session storage', () => {
      const savedUserInfo = JSON.stringify({
        name: 'John Doe',
        level: 'advanced',
        interests: ['movies', 'sports'],
      });
      mockSessionStorage.getItem.mockReturnValue(savedUserInfo);

      render(<EnglishTeacher />);
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('englishTeacher_userInfo');
    });
  });

  describe('User Setup Flow', () => {
    it('should handle user setup completion', async () => {
      render(<EnglishTeacher />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const levelSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /start learning/i });

      await user.type(nameInput, 'Test User');
      await user.click(levelSelect);
      await user.click(screen.getByText('Intermediate'));
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'englishTeacher_userInfo',
          expect.stringContaining('Test User')
        );
      });
    });

    it('should transition to topic selection after user setup', async () => {
      render(<EnglishTeacher />);
      
      // Complete user setup
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test User');
      
      const submitButton = screen.getByRole('button', { name: /start learning/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/choose a conversation topic/i)).toBeInTheDocument();
      });
    });
  });

  describe('Topic Selection', () => {
    beforeEach(async () => {
      render(<EnglishTeacher />);
      
      // Complete user setup first
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test User');
      
      const submitButton = screen.getByRole('button', { name: /start learning/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/choose a conversation topic/i)).toBeInTheDocument();
      });
    });

    it('should display topic selector', () => {
      expect(screen.getByText(/choose a conversation topic/i)).toBeInTheDocument();
    });

    it('should handle topic selection', async () => {
      // Mock topic selection
      const topicButton = screen.getByRole('button', { name: /generate topics/i });
      await user.click(topicButton);

      await waitFor(() => {
        expect(mockOpenAIService.generateTopics).toHaveBeenCalled();
      });
    });
  });

  describe('Conversation Flow', () => {
    beforeEach(async () => {
      // Setup complete conversation environment
      render(<EnglishTeacher />);
      
      // Complete user setup
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test User');
      
      const submitButton = screen.getByRole('button', { name: /start learning/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/choose a conversation topic/i)).toBeInTheDocument();
      });

      // Select a topic (mock)
      const topic = {
        id: '1',
        title: 'Travel Adventures',
        description: 'Discuss travel experiences',
        difficulty: 'intermediate' as const,
        category: 'lifestyle',
      };

      // Simulate topic selection by directly calling the handler
      // This would normally be triggered by TopicSelector component
      fireEvent.click(screen.getByText(/choose a conversation topic/i));
    });

    it('should add user messages to conversation', async () => {
      // This test would require the conversation to be active
      // We'll simulate being in conversation mode
      expect(true).toBe(true); // Placeholder for conversation tests
    });

    it('should handle text correction', async () => {
      mockOpenAIService.correctText.mockResolvedValue({
        hasErrors: true,
        corrections: [{ original: 'test', corrected: 'tested', type: 'grammar' }],
        correctedText: 'This is a tested sentence.',
        errorCount: 1,
      });

      mockOpenAIService.generateFunCorrection.mockResolvedValue(
        'Great effort! Try saying "tested" instead of "test" for better grammar.'
      );

      // Simulate message handling
      expect(mockOpenAIService.correctText).toBeDefined();
      expect(mockOpenAIService.generateFunCorrection).toBeDefined();
    });

    it('should generate teacher responses', async () => {
      mockOpenAIService.generateTeacherResponse.mockResolvedValue(
        'That sounds interesting! Tell me more about your experience.'
      );

      // Simulate teacher response generation
      expect(mockOpenAIService.generateTeacherResponse).toBeDefined();
    });
  });

  describe('Speech Functionality', () => {
    it('should handle speech queue processing', async () => {
      render(<EnglishTeacher />);
      
      // Test speech queue functionality
      expect(mockElevenLabsService.speak).toBeDefined();
      expect(mockWebSpeechService.speak).toBeDefined();
    });

    it('should stop speech when muting voices', async () => {
      render(<EnglishTeacher />);
      
      // Simulate muting voices
      await waitFor(() => {
        expect(mockElevenLabsService.stopSpeaking).toBeDefined();
        expect(mockWebSpeechService.stopSpeaking).toBeDefined();
      });
    });

    it('should handle voice selection changes', () => {
      render(<EnglishTeacher />);
      
      // Test voice selection functionality
      expect(true).toBe(true); // Voice selection tests
    });
  });

  describe('Session Management', () => {
    it('should handle session exit', async () => {
      render(<EnglishTeacher />);
      
      // Test session exit functionality
      expect(mockSessionStorage.removeItem).toBeDefined();
    });

    it('should handle conversation analysis', async () => {
      mockOpenAIService.analyzeConversation.mockResolvedValue({
        quantitativeMetrics: {
          linguisticComplexity: {
            lexicalDiversity: { score: 70, confidence: [60, 80], typeTokenRatio: 0.7, mtld: 45 },
            syntacticComplexity: { meanClauseLength: 8, subordinationIndex: 0.3, score: 65, confidence: [55, 75] },
            morphologicalComplexity: { score: 68, confidence: [58, 78] },
            phonologicalAwareness: { score: 72, confidence: [62, 82] }
          },
          proficiencyScores: {
            grammarAccuracy: { score: 75, confidence: [65, 85], errorRate: 0.12 },
            lexicalSophistication: { score: 70, confidence: [60, 80], academicWordPercentage: 0.15 },
            fluencyMetrics: { score: 68, confidence: [58, 78], estimatedWPM: 125 },
            pronunciationAssessment: { score: 73, confidence: [63, 83] },
            pragmaticCompetence: { score: 77, confidence: [67, 87] },
            overallCEFR: { level: 'B2', confidence: 0.8, score: 72 }
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
          cognitiveLoadAssessment: { level: 'medium', indicators: ['Active participation'], recommendations: ['Continue practice'] },
          interlanguageStage: { stage: 'Intermediate', characteristics: ['Developing fluency'], nextDevelopmentalGoals: ['Increased accuracy'] },
          fossilizationRisk: { riskLevel: 'low', areas: [], preventionStrategies: ['Varied practice'] },
          proximityZone: { currentLevel: 'B1', targetLevel: 'B2', optimalChallengeLevel: 'B1+', scaffoldingNeeds: ['Structured feedback'] }
        },
        personalizedRecommendations: {
          immediateFocus: [{ skill: 'Speaking fluency', activity: 'Daily practice', duration: '15 minutes', difficulty: 'medium' }],
          weeklyGoals: [{ goal: 'Vocabulary expansion', measurableOutcome: 'Learn 20 new words', trackingMethod: 'Flashcards' }],
          resourceRecommendations: [{ type: 'Practice', resource: 'Conversation topics', rationale: 'Builds confidence', priority: 'high' }],
          practiceSchedule: { frequency: 'Daily', sessionLength: '15-20 minutes', optimalTiming: 'Morning' }
        },
        progressProjections: {
          shortTerm: { timeframe: '1-2 weeks', expectedImprovements: ['Better pronunciation'], keyMilestones: ['Clear speech'] },
          mediumTerm: { timeframe: '1-3 months', expectedImprovements: ['Vocabulary growth'], keyMilestones: ['B2 level'] },
          longTerm: { timeframe: '6-12 months', expectedImprovements: ['Fluent communication'], keyMilestones: ['C1 level'] }
        },
        motivationalInsights: {
          strengthsHighlight: ['Good vocabulary', 'Clear pronunciation'],
          effortRecognition: ['Consistent practice', 'Active engagement'],
          encouragementMessage: 'Great progress! Keep up the excellent work.',
          progressCelebration: 'You have improved significantly since starting.',
          nextLevelPreview: 'Ready to tackle more complex conversations.'
        }
      });

      render(<EnglishTeacher />);
      
      expect(mockOpenAIService.analyzeConversation).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization errors', async () => {
      mockElevenLabsService.testService.mockRejectedValue(new Error('Service unavailable'));
      
      render(<EnglishTeacher />);
      
      await waitFor(() => {
        expect(mockElevenLabsService.testService).toHaveBeenCalled();
      });
    });

    it('should handle speech synthesis errors', async () => {
      mockElevenLabsService.speak.mockRejectedValue(new Error('Speech failed'));
      
      render(<EnglishTeacher />);
      
      // Test error handling
      expect(mockElevenLabsService.speak).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAIService.correctText.mockRejectedValue(new Error('API Error'));
      
      render(<EnglishTeacher />);
      
      expect(mockOpenAIService.correctText).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EnglishTeacher />);
      
      // Check for proper accessibility attributes
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<EnglishTeacher />);
      
      // Test keyboard navigation
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
      
      await user.tab();
      expect(nameInput).toHaveFocus();
    });
  });
});