export const config = {
  // Backend URLs
  pocketbaseUrl: import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',

  // LLM Configuration
  llmModel: import.meta.env.VITE_LLM_MODEL || 'llama3.1:8b',

  // OpenAI API (Primary - Best quality)
  useOpenAI: import.meta.env.VITE_USE_OPENAI === 'true',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  openaiModel: 'gpt-4', // Best model for conversation analysis and teaching

  // Groq API (Alternative)
  useGroq: import.meta.env.VITE_USE_GROQ === 'true',
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqModel: 'llama-3.1-70b-versatile', // or 'mixtral-8x7b-32768'

  // App Configuration
  appName: 'SpeakEng',
  appVersion: '2.0.0',

  // Feature Flags
  enableOfflineMode: true,
  enableBackgroundSync: true,
  enableNotifications: false, // Enable later if needed
} as const;

export type Config = typeof config;