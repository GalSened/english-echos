import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  functions: {
    invoke: vi.fn(),
  },
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
};

// Mock ElevenLabs Service
export const mockElevenLabsService = {
  speak: vi.fn(() => Promise.resolve()),
  stopSpeaking: vi.fn(),
  setVolume: vi.fn(),
  setRate: vi.fn(),
  isSupported: vi.fn(() => true),
  testService: vi.fn(() => Promise.resolve(true)),
};

// Mock Web Speech Service
export const mockWebSpeechService = {
  speak: vi.fn(() => Promise.resolve()),
  stopSpeaking: vi.fn(),
  startListening: vi.fn(() => Promise.resolve()),
  stopListening: vi.fn(),
  isSupported: vi.fn(() => true),
  setVolume: vi.fn(),
  setRate: vi.fn(),
};

// Mock OpenAI Service
export const mockOpenAIService = {
  correctText: vi.fn(() => Promise.resolve({
    hasErrors: false,
    corrections: [],
    correctedText: 'Test text',
    errorCount: 0,
  })),
  generateFunCorrection: vi.fn(() => Promise.resolve('Fun correction message')),
  generateTeacherResponse: vi.fn(() => Promise.resolve('Teacher response')),
  analyzeConversation: vi.fn(() => Promise.resolve({
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
  })),
  generateTopics: vi.fn(() => Promise.resolve([
    { id: '1', title: 'Travel Adventures', description: 'Discuss travel experiences', difficulty: 'intermediate', category: 'lifestyle' },
    { id: '2', title: 'Technology Today', description: 'Talk about modern technology', difficulty: 'advanced', category: 'technology' },
  ])),
  testConnection: vi.fn(() => Promise.resolve(true)),
};

// Mock System Test Orchestrator
export const mockSystemTestOrchestrator = {
  runComprehensiveTest: vi.fn(() => Promise.resolve({
    testResults: [],
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
    overallStatus: 'success' as const,
    duration: 100,
    timestamp: new Date(),
  })),
  runSingleTest: vi.fn(() => Promise.resolve({
    testName: 'test',
    status: 'success' as const,
    duration: 50,
    details: 'Test passed',
    timestamp: new Date(),
  })),
  muteVoiceTests: vi.fn(),
  unmuteVoiceTests: vi.fn(),
  isVoiceTestsMuted: vi.fn(() => false),
  getLastTestResults: vi.fn(() => null),
};

// Mock toast function
export const mockToast = vi.fn();

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Mock performance.now for timing
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});