import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUserInfo = (overrides = {}) => ({
  name: 'Test User',
  level: 'intermediate' as const,
  interests: ['movies', 'technology'],
  ...overrides,
});

export const createMockTopic = (overrides = {}) => ({
  id: 'test-topic',
  title: 'Test Topic',
  description: 'A test conversation topic',
  difficulty: 'intermediate' as const,
  category: 'general',
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: '1',
  text: 'Test message',
  isTeacher: false,
  timestamp: new Date(),
  ...overrides,
});

export const createMockAnalysis = (overrides = {}) => ({
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
  },
  ...overrides,
});