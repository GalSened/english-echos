# SpeakEng Migration - Implementation Roadmap

## 🎯 Project Goal
Transform SpeakEng from a paid-service-dependent app to a 100% free, enterprise-grade, self-hosted solution.

## 📋 Complete Implementation Plan

### **PHASE 0: Preparation (30 minutes)**

#### Tasks:
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Install local services**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Download LLM model (choose one)
   ollama pull llama3.1:8b        # Faster, 16GB RAM
   # OR
   ollama pull qwen2.5:14b        # Better quality, 32GB RAM
   
   # Install PocketBase
   wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip
   unzip pocketbase_*.zip
   chmod +x pocketbase
   ```

3. **Test services**
   ```bash
   # Test Ollama
   curl http://localhost:11434/api/generate -d '{
     "model": "llama3.1:8b",
     "prompt": "Hello",
     "stream": false
   }'
   
   # Test PocketBase
   ./pocketbase serve
   # Access http://127.0.0.1:8090/_/
   ```

---

### **PHASE 1: Backend Migration - Remove Supabase (3-4 hours)**

#### 1.1 Set up PocketBase (30 minutes)

**File: `pocketbase/pb_schema.json`**
```json
[
  {
    "name": "conversations",
    "type": "base",
    "schema": [
      {"name": "session_id", "type": "text", "required": true},
      {"name": "topic", "type": "text"},
      {"name": "user_name", "type": "text"},
      {"name": "user_level", "type": "select", "options": ["beginner", "intermediate", "advanced"]},
      {"name": "messages", "type": "json"},
      {"name": "started_at", "type": "date"},
      {"name": "ended_at", "type": "date"}
    ]
  },
  {
    "name": "analyses",
    "type": "base",
    "schema": [
      {"name": "conversation_id", "type": "relation", "collectionId": "conversations"},
      {"name": "analysis_data", "type": "json"},
      {"name": "created_at", "type": "date"}
    ]
  },
  {
    "name": "topics",
    "type": "base",
    "schema": [
      {"name": "title", "type": "text", "required": true},
      {"name": "description", "type": "text"},
      {"name": "level", "type": "select", "options": ["beginner", "intermediate", "advanced"]},
      {"name": "is_custom", "type": "bool"}
    ]
  }
]
```

**Actions:**
- [ ] Create `pocketbase` folder in project root
- [ ] Start PocketBase: `./pocketbase serve`
- [ ] Access admin UI: http://127.0.0.1:8090/_/
- [ ] Create collections manually or import schema
- [ ] Create API rules (allow all for self-use)

#### 1.2 Create PocketBase Client (45 minutes)

**File: `src/lib/pocketbase.ts`**
```typescript
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// Disable auto-cancellation
pb.autoCancellation(false);

// Types
export interface Conversation {
  id?: string;
  session_id: string;
  topic: string;
  user_name: string;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  messages: Array<{id: string; text: string; isTeacher: boolean; timestamp: Date}>;
  started_at: Date;
  ended_at?: Date;
}

export interface Analysis {
  id?: string;
  conversation_id: string;
  analysis_data: any;
  created_at: Date;
}

export interface Topic {
  id?: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_custom: boolean;
}

// API Functions
export const conversationService = {
  create: (data: Omit<Conversation, 'id'>) => 
    pb.collection('conversations').create(data),
  
  update: (id: string, data: Partial<Conversation>) =>
    pb.collection('conversations').update(id, data),
  
  getById: (id: string) =>
    pb.collection('conversations').getOne(id),
  
  list: (filter?: string) =>
    pb.collection('conversations').getList(1, 50, { filter, sort: '-created' })
};

export const analysisService = {
  create: (data: Omit<Analysis, 'id'>) =>
    pb.collection('analyses').create(data),
  
  getByConversationId: (conversationId: string) =>
    pb.collection('analyses').getFirstListItem(`conversation_id="${conversationId}"`)
};

export const topicService = {
  list: (level?: string) =>
    pb.collection('topics').getList(1, 100, {
      filter: level ? `level="${level}"` : '',
      sort: 'title'
    }),
  
  create: (data: Omit<Topic, 'id'>) =>
    pb.collection('topics').create(data)
};
```

**Actions:**
- [ ] Create `src/lib/pocketbase.ts`
- [ ] Install PocketBase SDK: `npm install pocketbase`
- [ ] Test connection in browser console

#### 1.3 Update Environment Configuration (15 minutes)

**File: `.env`**
```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_OLLAMA_URL=http://localhost:11434
```

**File: `.env.example`**
```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_OLLAMA_URL=http://localhost:11434
```

**File: `src/config.ts`**
```typescript
export const config = {
  pocketbaseUrl: import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
  llmModel: 'llama3.1:8b', // or 'qwen2.5:14b'
};
```

**Actions:**
- [ ] Create `.env` and `.env.example`
- [ ] Create `src/config.ts`
- [ ] Update `.gitignore` to include `.env`

#### 1.4 Remove Supabase Dependencies (30 minutes)

**Actions:**
- [ ] Delete `src/integrations/supabase/` folder entirely
- [ ] Remove from `package.json`: `@supabase/supabase-js`
- [ ] Delete `supabase/` folder (edge functions no longer needed)
- [ ] Run `npm install` to clean up

---

### **PHASE 2: LLM Migration - Replace OpenAI with Ollama (4-5 hours)**

#### 2.1 Create Ollama Service (1 hour)

**File: `src/services/ollamaService.ts`**
```typescript
import { config } from '@/config';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.ollamaUrl;
    this.model = config.llmModel;
  }

  async chat(messages: OllamaMessage[], options: {
    temperature?: number;
    max_tokens?: number;
  } = {}): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.max_tokens ?? 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw error;
    }
  }

  async generate(prompt: string, options: {
    temperature?: number;
    max_tokens?: number;
  } = {}): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.max_tokens ?? 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const ollamaService = new OllamaService();
```

**Actions:**
- [ ] Create `src/services/ollamaService.ts`
- [ ] Test service with simple prompt

#### 2.2 Create New AI Service (2-3 hours)

**File: `src/services/aiService.ts`**
```typescript
import { ollamaService, OllamaMessage } from './ollamaService';
import { ConversationAnalysis, ErrorCorrection } from './types';

export class AIService {
  async correctText(
    text: string,
    context: string,
    userLevel: string
  ): Promise<ErrorCorrection> {
    const prompt = this.buildCorrectionPrompt(text, context, userLevel);
    
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: 'You are an expert English teacher who provides constructive, friendly corrections.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await ollamaService.chat(messages);
      return this.parseCorrectionResponse(response, text);
    } catch (error) {
      console.error('Error correcting text:', error);
      return this.createFallbackCorrection(text);
    }
  }

  async generateTeacherResponse(
    userMessage: string,
    conversationHistory: any[],
    topic: string,
    userName: string,
    userLevel: string
  ): Promise<string> {
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: this.buildTeacherSystemPrompt(userName, userLevel, topic)
      },
      ...this.formatConversationHistory(conversationHistory),
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      const response = await ollamaService.chat(messages, { temperature: 0.8 });
      return response;
    } catch (error) {
      console.error('Error generating teacher response:', error);
      return "That's interesting! Can you tell me more?";
    }
  }

  async analyzeConversation(
    userMessages: string[],
    topic: string,
    userName: string
  ): Promise<ConversationAnalysis> {
    const prompt = this.buildAnalysisPrompt(userMessages, topic, userName);
    
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: 'You are an advanced English language assessment AI with expertise in Applied Linguistics.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await ollamaService.chat(messages, {
        temperature: 0.3,
        max_tokens: 3000
      });
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return this.createFallbackAnalysis(userName);
    }
  }

  async generateFunCorrection(
    correction: ErrorCorrection,
    userName: string
  ): Promise<string> {
    const prompt = `Create a friendly, encouraging correction message for ${userName}.
    
Original: "${correction.originalText}"
Corrected: "${correction.correctedText}"
Errors: ${JSON.stringify(correction.errors)}

Make it warm, supportive, and helpful. Keep it under 3 sentences.`;

    try {
      const response = await ollamaService.generate(prompt, { temperature: 0.9 });
      return response;
    } catch (error) {
      return `Great effort! Here's a small tip: "${correction.correctedText}"`;
    }
  }

  // Private helper methods
  private buildCorrectionPrompt(text: string, context: string, level: string): string {
    return `Analyze this English text and provide corrections in JSON format.

Text: "${text}"
Context: ${context}
User Level: ${level}

Return JSON with:
{
  "hasErrors": boolean,
  "originalText": string,
  "correctedText": string,
  "errors": [{
    "type": "grammar|vocabulary|pronunciation|fluency",
    "original": string,
    "corrected": string,
    "explanation": string,
    "speakingTip": string
  }]
}`;
  }

  private buildTeacherSystemPrompt(name: string, level: string, topic: string): string {
    return `You are a warm, encouraging English teacher talking with ${name}, a ${level} level student.

Topic: ${topic}

Guidelines:
- Keep responses natural and conversational (2-3 sentences)
- Match ${level} level complexity
- Ask follow-up questions to encourage speaking
- Be supportive and patient
- Use contractions and natural speech patterns
- Don't over-correct; focus on communication`;
  }

  private buildAnalysisPrompt(messages: string[], topic: string, name: string): string {
    const conversation = messages.join('\n');
    
    return `Analyze ${name}'s English conversation about "${topic}".

Conversation:
${conversation}

Provide comprehensive analysis in JSON format with:
- Linguistic complexity metrics
- Proficiency scores (CEFR level)
- Error analysis
- Learning analytics
- Personalized recommendations
- Progress projections
- Motivational insights

Format: {quantitativeMetrics: {...}, errorAnalysis: {...}, ...}`;
  }

  private formatConversationHistory(history: any[]): OllamaMessage[] {
    return history.slice(-10).map(msg => ({
      role: msg.isTeacher ? 'assistant' : 'user',
      content: msg.text
    }));
  }

  private parseCorrectionResponse(response: string, originalText: string): ErrorCorrection {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing correction response:', error);
    }
    
    return this.createFallbackCorrection(originalText);
  }

  private parseAnalysisResponse(response: string): ConversationAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing analysis response:', error);
    }
    
    return this.createFallbackAnalysis('Student');
  }

  private createFallbackCorrection(text: string): ErrorCorrection {
    return {
      hasErrors: false,
      originalText: text,
      correctedText: text,
      errors: []
    };
  }

  private createFallbackAnalysis(userName: string): ConversationAnalysis {
    // Return the same fallback structure from EnglishTeacher.tsx
    return {
      quantitativeMetrics: {
        // ... (copy from EnglishTeacher.tsx lines 292-340)
      },
      // ... rest of fallback
    };
  }
}

export const aiService = new AIService();
```

**Actions:**
- [ ] Create `src/services/aiService.ts`
- [ ] Create `src/services/types.ts` (move interfaces)
- [ ] Test each method independently

#### 2.3 Update Components (1 hour)

**File: `src/components/EnglishTeacher.tsx`**

Changes needed:
```typescript
// Remove
import { SupabaseOpenAIService } from "@/services/supabaseOpenaiService";

// Add
import { aiService } from "@/services/aiService";
import { ollamaService } from "@/services/ollamaService";

// Replace state
const [openAIService, setOpenAIService] = useState<SupabaseOpenAIService | null>(null);
// With
const [isAIReady, setIsAIReady] = useState(false);

// Update initialization
useEffect(() => {
  const initServices = async () => {
    // ... existing code ...
    
    // Check Ollama availability
    const ollamaAvailable = await ollamaService.isAvailable();
    setIsAIReady(ollamaAvailable);
    
    if (!ollamaAvailable) {
      toast({
        title: "AI Service Unavailable",
        description: "Please ensure Ollama is running: ollama serve",
        variant: "destructive"
      });
    }
  };
  
  initServices();
}, []);

// Replace all service calls:
// openAIService.correctText(...) -> aiService.correctText(...)
// openAIService.generateTeacherResponse(...) -> aiService.generateTeacherResponse(...)
// openAIService.analyzeConversation(...) -> aiService.analyzeConversation(...)
// openAIService.generateFunCorrection(...) -> aiService.generateFunCorrection(...)
```

**Actions:**
- [ ] Update `src/components/EnglishTeacher.tsx`
- [ ] Replace all Supabase service calls with new AI service
- [ ] Add Ollama status indicator
- [ ] Test conversation flow

#### 2.4 Remove Old Services (15 minutes)

**Actions:**
- [ ] Delete `src/services/supabaseOpenaiService.ts`
- [ ] Delete `src/services/openaiService.ts` (if exists)
- [ ] Update all imports across the codebase

---

### **PHASE 3: TTS Enhancement - Improve Web Speech (2 hours)**

#### 3.1 Enhance Web Speech Service (1 hour)

**File: `src/services/webSpeechService.ts`**

Add improvements:
```typescript
// Add voice selection
getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

// Add quality voice filtering
getBestVoices(language: string = 'en-US'): SpeechSynthesisVoice[] {
  const voices = this.getAvailableVoices();
  return voices
    .filter(v => v.lang.startsWith(language.split('-')[0]))
    .sort((a, b) => {
      // Prioritize premium voices
      if (a.localService && !b.localService) return 1;
      if (!a.localService && b.localService) return -1;
      // Prioritize Google/Microsoft voices
      if (a.name.includes('Google') && !b.name.includes('Google')) return -1;
      if (!a.name.includes('Google') && b.name.includes('Google')) return 1;
      return 0;
    });
}

// Add better error handling and retries
async speak(text: string, voiceName?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!this.isSupported()) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select voice
    const voices = this.getAvailableVoices();
    if (voiceName) {
      const voice = voices.find(v => v.name === voiceName);
      if (voice) utterance.voice = voice;
    } else {
      const bestVoices = this.getBestVoices();
      if (bestVoices.length > 0) utterance.voice = bestVoices[0];
    }
    
    // Configure
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    
    // Chunk long text (Chrome has 200 char limit bug)
    if (text.length > 200) {
      this.speakInChunks(text, utterance.voice?.name);
      resolve();
      return;
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    
    window.speechSynthesis.speak(utterance);
  });
}

private async speakInChunks(text: string, voiceName?: string): Promise<void> {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  for (const sentence of sentences) {
    await this.speak(sentence.trim(), voiceName);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small pause
  }
}
```

**Actions:**
- [ ] Update `src/services/webSpeechService.ts`
- [ ] Add voice selection UI component
- [ ] Test with different browsers/OS

#### 3.2 Add Voice Selection UI (1 hour)

**File: `src/components/VoiceSelector.tsx`**
```typescript
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

export const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(v => 
        v.lang.startsWith('en')
      );
      setVoices(englishVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <Select value={selectedVoice} onValueChange={onVoiceChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select voice" />
      </SelectTrigger>
      <SelectContent>
        {voices.map(voice => (
          <SelectItem key={voice.name} value={voice.name}>
            {voice.name} {voice.localService ? '(Offline)' : '(Online)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

**Actions:**
- [ ] Create `src/components/VoiceSelector.tsx`
- [ ] Integrate into `VoiceControls.tsx`
- [ ] Test voice switching

#### 3.3 Remove ElevenLabs (15 minutes)

**Actions:**
- [ ] Delete `src/services/elevenlabsService.ts`
- [ ] Remove ElevenLabs state from `EnglishTeacher.tsx`
- [ ] Remove ElevenLabs UI components
- [ ] Clean up all references

---

### **PHASE 4: Data Persistence (2 hours)**

#### 4.1 Add Conversation Persistence (1 hour)

**File: `src/hooks/useConversationPersistence.ts`**
```typescript
import { useEffect, useState } from 'react';
import { conversationService, Conversation } from '@/lib/pocketbase';

export const useConversationPersistence = (
  sessionId: string,
  topic: string,
  userName: string,
  userLevel: string
) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conversation = await conversationService.create({
          session_id: sessionId,
          topic,
          user_name: userName,
          user_level: userLevel as any,
          messages: [],
          started_at: new Date()
        });
        setConversationId(conversation.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    initConversation();
  }, [sessionId, topic, userName, userLevel]);

  const saveMessages = async (messages: any[]) => {
    if (!conversationId) return;
    
    try {
      await conversationService.update(conversationId, { messages });
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const endConversation = async () => {
    if (!conversationId) return;
    
    try {
      await conversationService.update(conversationId, {
        ended_at: new Date()
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  return { conversationId, saveMessages, endConversation };
};
```

**Actions:**
- [ ] Create `src/hooks/useConversationPersistence.ts`
- [ ] Integrate into `EnglishTeacher.tsx`
- [ ] Auto-save messages periodically
- [ ] Test persistence

#### 4.2 Add Conversation History View (1 hour)

**File: `src/components/ConversationHistory.tsx`**
```typescript
// Component to view past conversations
// Features:
// - List all conversations
// - View details
// - Continue conversation
// - Delete conversation
```

**File: `src/pages/History.tsx`**
```typescript
// New page for conversation history
```

**Actions:**
- [ ] Create conversation history components
- [ ] Add route in App.tsx
- [ ] Add navigation link in sidebar
- [ ] Test loading and viewing history

---

### **PHASE 5: Testing & Quality Assurance (3-4 hours)**

#### 5.1 Unit Tests (2 hours)
- [ ] Test Ollama service
- [ ] Test AI service methods
- [ ] Test PocketBase integration
- [ ] Test Web Speech enhancements

#### 5.2 Integration Tests (1 hour)
- [ ] Full conversation flow
- [ ] Error correction pipeline
- [ ] Analysis generation
- [ ] Data persistence

#### 5.3 E2E Tests (1 hour)
- [ ] User onboarding
- [ ] Topic selection
- [ ] Voice conversation
- [ ] Analysis viewing
- [ ] History access

---

### **PHASE 6: Deployment & Documentation (2-3 hours)**

#### 6.1 Local Development Setup (1 hour)
- [ ] Create `docker-compose.yml` for easy setup
- [ ] Write setup scripts
- [ ] Create comprehensive README

#### 6.2 Production Deployment (1-2 hours)
- [ ] Choose deployment option (Oracle Cloud recommended)
- [ ] Set up PocketBase on server
- [ ] Set up Ollama on server
- [ ] Configure reverse proxy (Caddy/Nginx)
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Set up SSL certificates
- [ ] Configure environment variables

#### 6.3 Documentation (30 minutes)
- [ ] User guide
- [ ] Developer guide
- [ ] Troubleshooting guide
- [ ] API documentation

---

## 📊 Timeline Summary

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 0: Preparation | 30 min | Easy |
| Phase 1: Backend Migration | 3-4 hours | Medium |
| Phase 2: LLM Migration | 4-5 hours | Hard |
| Phase 3: TTS Enhancement | 2 hours | Easy |
| Phase 4: Data Persistence | 2 hours | Medium |
| Phase 5: Testing | 3-4 hours | Medium |
| Phase 6: Deployment | 2-3 hours | Medium-Hard |
| **TOTAL** | **17-21 hours** | **2-3 days** |

## 🎯 Success Criteria

- [ ] All Supabase dependencies removed
- [ ] All OpenAI calls replaced with Ollama
- [ ] ElevenLabs removed, Web Speech enhanced
- [ ] Conversations persist in PocketBase
- [ ] Full conversation history available
- [ ] All existing features working
- [ ] Zero monthly costs
- [ ] Production-quality deployment
- [ ] Comprehensive documentation
- [ ] 70%+ test coverage

## 🚀 Next Steps

Ready to start implementation? Let's begin with Phase 0!