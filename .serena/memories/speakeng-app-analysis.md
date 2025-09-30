# SpeakEng App - Comprehensive Analysis

## Overview
**Repository**: english-echos (galsened/english-echos)
**Tech Stack**: React + TypeScript + Vite + Supabase + shadcn/ui
**Purpose**: AI-powered English conversation practice with personalized learning

## Architecture

### Core Technologies
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: shadcn/ui (Radix UI components + Tailwind CSS)
- **State Management**: TanStack Query (React Query) 5.56.2
- **Routing**: React Router DOM 6.26.2
- **Styling**: Tailwind CSS 3.4.11
- **Backend**: Supabase (PostgreSQL + Edge Functions)

### Key Services
1. **SupabaseOpenAIService**: Handles AI interactions via Supabase Edge Functions
   - Conversation analysis
   - Text correction
   - Teacher response generation
   - Fun correction generation

2. **ElevenLabsService**: Text-to-speech using ElevenLabs API
   - Voice synthesis with custom voices
   - Audio playback management
   - Fallback to Web Speech API

3. **WebSpeechService**: Browser-based speech recognition
   - Speech-to-text for user input
   - Fallback TTS option

### Application Flow
1. **Setup Phase**: User enters name and selects English level (beginner/intermediate/advanced)
2. **Topic Selection**: Choose from predefined or custom topics
3. **Conversation**: Interactive voice/text conversation with AI teacher
4. **Analysis**: Comprehensive linguistic analysis with CEFR assessment

## Component Structure

### Main Components
- **EnglishTeacher** (856 lines): Core conversation component with state management
- **UserSetup**: User onboarding
- **TopicSelector**: Topic selection interface
- **VoiceControls**: Voice input/output controls
- **ConversationMessage**: Message display
- **AdvancedConversationAnalysis**: Detailed performance analysis
- **SystemMonitorDashboard**: System monitoring (debugging)

### Supabase Edge Functions
- `analyze-conversation`: GPT-4 powered conversation analysis
- `correct-text`: Real-time error correction
- `generate-teacher-response`: AI teacher responses
- `generate-fun-correction`: Friendly error feedback
- `text-to-speech`: ElevenLabs TTS integration
- `generate-topics`: Dynamic topic generation

## Configuration

### Supabase
- Project ID: zcdgrlbsvocnuqzzsseg
- URL: https://zcdgrlbsvocnuqzzsseg.supabase.co
- Using anon/public key (hardcoded in client.ts)

### Vite
- Dev server: port 8080
- Path alias: @ -> ./src

### Build Scripts
- `npm run dev`: Development server
- `npm run build`: Production build
- `npm run build:dev`: Development build
- `npm run lint`: ESLint
- `npm run preview`: Preview production build

## Testing
- Testing framework: Vitest 3.2.4 + Testing Library
- Test files in: src/components/__tests__ and src/services/__tests__
- Limited test coverage currently

## Dependencies Status
All major dependencies are up-to-date and modern versions.