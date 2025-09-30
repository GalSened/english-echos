import { useState, useCallback, useRef, useEffect } from "react";
import { WebSpeechService } from "@/services/webSpeechService";
import { aiService } from "@/services/aiService";
import type { ConversationAnalysis as AnalysisType, ErrorCorrection as ErrorType } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserSetup } from "./UserSetup";
import { TopicSelector } from "./TopicSelector";
import { ConversationMessage } from "./ConversationMessage";
import { VoiceControls } from "./VoiceControls";
import { TeacherAvatar } from "./TeacherAvatar";
import { ErrorCorrection } from "./ErrorCorrection";
import { AdvancedConversationAnalysis } from "./AdvancedConversationAnalysis";
import { StatusIndicator } from "./StatusIndicator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { analytics } from "@/utils/analytics";
import { markPracticeToday } from "@/lib/notifications";

import { Send, MessageCircle, BarChart3, AlertCircle, LogOut, Home, Shield, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  text: string;
  isTeacher: boolean;
  timestamp: Date;
  correction?: ErrorType;
}

interface UserInfo {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Topic {
  title: string;
  description: string;
  isCustom?: boolean;
}

type AppState = 'setup' | 'topic-selection' | 'conversation' | 'analysis';

export const EnglishTeacher = () => {
  const { toast } = useToast();
  const { handleErrorWithToast } = useErrorHandler();
  const [appState, setAppState] = useState<AppState>('setup');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesMuted, setVoicesMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("nBwlhHY26CjUa3imYVjB"); // Your custom voice
  const [speechQueue, setSpeechQueue] = useState<Array<{id: string, text: string}>>([]);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<AnalysisType | null>(null);
  const [webSpeechService, setWebSpeechService] = useState<WebSpeechService | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize services on component mount
  useEffect(() => {
    const initServices = async () => {
      try {
        const speechService = new WebSpeechService();
        setWebSpeechService(speechService);

        // Check microphone permission gracefully
        try {
          const permissionStatus = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
          if (permissionStatus?.state === 'granted') {
            setMicrophonePermission(true);
          } else {
            console.log('Microphone permission not granted yet');
            setMicrophonePermission(false);
          }
        } catch (error) {
          // Fallback for browsers that don't support permissions API
          setMicrophonePermission(false);
        }

        // Test AI service availability silently (background test)
        try {
          const isAvailable = await aiService.isAvailable();
          setAiServiceAvailable(isAvailable);
          if (!isAvailable) {
            console.warn('AI service not available - please check Ollama/Groq configuration');
          }
        } catch (error) {
          console.error('AI service check failed:', error);
          setAiServiceAvailable(false);
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        analytics.trackError('Service initialization failed', 'EnglishTeacher.initServices');
        handleErrorWithToast(error, 'Some features may not work properly. Please refresh the page.');
      }
    };

    initServices();
    
    // Check for session-only user info (no persistence across browser sessions)
    const saved = sessionStorage.getItem('englishTeacher_userInfo');
    if (saved) {
      try {
        const savedUserInfo = JSON.parse(saved);
        setUserInfo(savedUserInfo);
        setAppState('topic-selection');
      } catch (error) {
        console.error('Error loading saved user info:', error);
        sessionStorage.removeItem('englishTeacher_userInfo');
      }
    }
  }, [toast]);

  // Speech queue processor
  useEffect(() => {
    const processSpeechQueue = async () => {
      if (isProcessingSpeech || speechQueue.length === 0 || voicesMuted) {
        return;
      }

      setIsProcessingSpeech(true);
      setIsSpeaking(true);

      const item = speechQueue[0];
      setSpeechQueue(prev => prev.slice(1));

      try {
        if (webSpeechService) {
          try {
            console.log('Using Web Speech service...');
            await webSpeechService.speak(item.text);
            console.log('Web Speech completed successfully');
          } catch (error) {
            console.error('Web Speech failed:', error);
          }
        }
      } catch (unexpectedError) {
        console.error('Unexpected error in speech queue processor:', unexpectedError);
      } finally {
        setIsProcessingSpeech(false);
        setIsSpeaking(false);
        // Don't auto-continue - let the useEffect trigger naturally for next items
      }
    };

    processSpeechQueue();
  }, [speechQueue, isProcessingSpeech, voicesMuted, webSpeechService]);

  const addMessage = useCallback((text: string, isTeacher: boolean): string => {
    const id = Date.now().toString();
    const newMessage: Message = {
      id,
      text,
      isTeacher,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // If it's a teacher message and voices are not muted, add to speech queue
    if (isTeacher && !voicesMuted) {
      setSpeechQueue(prev => [...prev, { id, text }]);
    }
    
    return id;
  }, [voicesMuted]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserSetupComplete = useCallback((userInfo: UserInfo) => {
    setUserInfo(userInfo);
    // Store user info in sessionStorage (session-only, not persistent)
    sessionStorage.setItem('englishTeacher_userInfo', JSON.stringify(userInfo));
    setAppState('topic-selection');
  }, []);

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setMessages([]); // Clear previous messages
    setAppState('conversation');

    // Analytics tracking
    analytics.trackConversationStart(topic.title, userInfo?.level || 'intermediate');

    // Mark that user practiced today (for notification tracking)
    markPracticeToday();

    // Add brief welcome message - student should be the main speaker
    addMessage(`Hi ${userInfo?.name}! Ready to talk about ${topic.title}?`, true);
  };

  const handleMuteAllVoices = () => {
    // Stop any ongoing speech immediately
    if (webSpeechService) {
      webSpeechService.stopSpeaking();
    }
    setIsSpeaking(false);
    setIsProcessingSpeech(false);
    // Clear the speech queue
    setSpeechQueue([]);
    setVoicesMuted(true);

    toast({
      title: "All voices muted",
      description: "System voices have been silenced",
      duration: 2000,
    });
  };

  const handleUnmuteVoices = () => {
    setVoicesMuted(false);
    toast({
      title: "Voices enabled",
      description: "System voices are now active again",
      duration: 2000,
    });
  };

  const handleEndConversation = async () => {
    // Stop any ongoing speech
    if (webSpeechService) {
      webSpeechService.stopSpeaking();
      webSpeechService.stopListening();
    }
    setIsSpeaking(false);
    setIsListening(false);

    if (userInfo && selectedTopic) {
      setIsAnalyzing(true);
      try {
        const analysis = await aiService.analyzeConversation(
          messages.map(m => ({ text: m.text, isTeacher: m.isTeacher })),
          userInfo.name,
          userInfo.level
        );
        setConversationAnalysis(analysis);
        setAppState('analysis');
      } catch (error) {
        console.error('Error analyzing conversation:', error);
        // Proceed to analysis with a fallback
        setConversationAnalysis({
          quantitativeMetrics: {
            linguisticComplexity: {
              lexicalDiversity: {score: 65, confidence: [55, 75], typeTokenRatio: 0.7, mtld: 45},
              syntacticComplexity: {meanClauseLength: 8, subordinationIndex: 0.3, score: 60, confidence: [50, 70]},
              morphologicalComplexity: {score: 65, confidence: [55, 75]},
              phonologicalAwareness: {score: 70, confidence: [60, 80]}
            },
            proficiencyScores: {
              grammarAccuracy: {score: 70, confidence: [60, 80], errorRate: 0.15},
              lexicalSophistication: {score: 65, confidence: [55, 75], academicWordPercentage: 0.1},
              fluencyMetrics: {score: 70, confidence: [60, 80], estimatedWPM: 120},
              pronunciationAssessment: {score: 70, confidence: [60, 80]},
              pragmaticCompetence: {score: 75, confidence: [65, 85]},
              overallCEFR: {level: "B1", confidence: 0.7, score: 70}
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
            cognitiveLoadAssessment: {level: "medium", indicators: ["Active participation"], recommendations: ["Continue regular practice"]},
            interlanguageStage: {stage: "Intermediate", characteristics: ["Developing fluency"], nextDevelopmentalGoals: ["Increased accuracy"]},
            fossilizationRisk: {riskLevel: "low", areas: [], preventionStrategies: ["Varied practice topics"]},
            proximityZone: {currentLevel: "B1", targetLevel: "B2", optimalChallengeLevel: "B1+", scaffoldingNeeds: ["Structured feedback"]}
          },
          personalizedRecommendations: {
            immediateFocus: [{skill: "Conversational fluency", activity: "Daily speaking practice", duration: "15 minutes", difficulty: "medium"}],
            weeklyGoals: [{goal: "Increase vocabulary usage", measurableOutcome: "Use 10 new words", trackingMethod: "Daily journal"}],
            resourceRecommendations: [{type: "Practice", resource: "Topic-based conversations", rationale: "Maintains engagement", priority: "high"}],
            practiceSchedule: {frequency: "Daily", sessionLength: "15-20 minutes", optimalTiming: "Morning or evening"}
          },
          progressProjections: {
            shortTerm: {timeframe: "1-2 weeks", expectedImprovements: ["Increased confidence"], keyMilestones: ["Consistent participation"]},
            mediumTerm: {timeframe: "1-3 months", expectedImprovements: ["Better vocabulary usage"], keyMilestones: ["B2 level indicators"]},
            longTerm: {timeframe: "6-12 months", expectedImprovements: ["Advanced fluency"], keyMilestones: ["C1 level achievement"]}
          },
          motivationalInsights: {
            strengthsHighlight: ["Active participation in conversation"],
            effortRecognition: ["Consistent practice", "Engaged learning attitude"],
            encouragingFeedback: "Great job participating in the conversation!",
            celebrationWorthy: ["Taking on conversation challenges"]
          }
        });
        setAppState('analysis');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (webSpeechService) {
      webSpeechService.setVolume(newVolume);
    }
  };

  const handleStartListening = async () => {
    if (!webSpeechService) {
      addMessage("Speech recognition is not available on this browser.", true);
      return;
    }

    try {
      // Request microphone permission with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Microphone permission timeout')), 10000)
      );
      
      const permissionPromise = navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true 
        } 
      });
      
      const stream = await Promise.race([permissionPromise, timeoutPromise]) as MediaStream;
      stream.getTracks().forEach(track => track.stop()); // Clean up immediately
      
      setIsListening(true);
      console.log('Starting speech recognition...');
      
      const timeoutListening = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Speech recognition timeout')), 30000)
      );
      
      const transcript = await Promise.race([
        webSpeechService.startListening(),
        timeoutListening
      ]) as string;
      
      setIsListening(false);
      console.log('Speech recognition result:', transcript);
      
      if (transcript.trim()) {
        // Add user message
        const userMsgId = addMessage(transcript, false);
        
        // Process correction and teacher response sequentially to prevent parallel messages
        if (aiServiceAvailable) {
          setIsGeneratingResponse(true);
          try {
            // First, check for errors and provide correction if needed
            const correction = await aiService.correctText(transcript, selectedTopic?.title || "");

            if (correction.hasErrors && correction.errors.length > 0) {
              // Create a simple correction message
              const correctionMsg = `Quick tip: "${correction.correctedText}" - ${correction.errors[0].explanation}`;
              addMessage(correctionMsg, true);

              // Wait a moment for the correction to be processed
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Then generate teacher response
            const teacherResponse = await aiService.generateTeacherResponse(
              messages.map(m => ({ text: m.text, isTeacher: m.isTeacher })),
              selectedTopic?.title || "",
              userInfo?.name || "Student",
              userInfo?.level || "intermediate"
            );
            addMessage(teacherResponse, true);
          } catch (error) {
            console.error('Error processing message:', error);
            // Fallback to simple response
            addMessage("Tell me more!", true);
          } finally {
            setIsGeneratingResponse(false);
          }
        } else {
          // Fallback if service not available
          addMessage("That's interesting! Can you tell me more about that?", true);
        }
      } else {
        addMessage("I didn't catch that. Could you please speak a bit louder or try again?", true);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      
      if (error.name === 'NotAllowedError') {
        addMessage("Please allow microphone access to use voice features. You can enable it in your browser settings.", true);
        setMicrophonePermission(false);
      } else if (error.message.includes('not-allowed')) {
        addMessage("Microphone access was denied. Please check your browser settings and try again.", true);
        setMicrophonePermission(false);
      } else if (error.message.includes('timeout')) {
        addMessage("Request timed out. Please try again.", true);
      } else {
        addMessage("Sorry, I couldn't hear you clearly. Please try again or check your microphone settings.", true);
      }
    }
  };

  const handleStopListening = () => {
    if (webSpeechService) {
      webSpeechService.stopListening();
    }
    setIsListening(false);
  };

  const handleSendMessage = async () => {
    if (currentInput.trim()) {
      const userMessage = currentInput;
      setCurrentInput("");
      
      // Add user message
      const userMsgId = addMessage(userMessage, false);
      
      // Process correction and teacher response sequentially to prevent parallel messages
      if (aiServiceAvailable) {
        setIsGeneratingResponse(true);
        try {
          // First, check for errors and provide correction if needed
          const correction = await aiService.correctText(userMessage, selectedTopic?.title || "");
          
          if (correction.hasErrors && correction.errors.length > 0) {
            // Create a simple correction message
            const correctionMsg = `Quick tip: "${correction.correctedText}" - ${correction.errors[0].explanation}`;
            addMessage(correctionMsg, true);

            // Wait a moment for the correction to be processed
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Then generate teacher response
          const teacherResponse = await aiService.generateTeacherResponse(
            messages.map(m => ({ text: m.text, isTeacher: m.isTeacher })),
            selectedTopic?.title || "",
            userInfo?.name || "Student",
            userInfo?.level || "intermediate"
          );
          addMessage(teacherResponse, true);
        } catch (error) {
          console.error('Error processing message:', error);
          // Fallback to simple response
          addMessage("That's interesting! Can you tell me more about that?", true);
        } finally {
          setIsGeneratingResponse(false);
        }
      } else {
        // Fallback if service not available
        addMessage("What else?", true);
      }
    }
  };

  const handleRestartSameTopic = () => {
    setMessages([]);
    setAppState('conversation');
    handleTopicSelect(selectedTopic!);
  };

  const handleNewTopic = useCallback(() => {
    setSelectedTopic(null);
    setMessages([]);
    setAppState('topic-selection');
    setConversationAnalysis(null);
    
    // Stop any ongoing speech
    if (webSpeechService) {
      webSpeechService.stopListening();
    }
    setIsListening(false);
    setIsSpeaking(false);
  }, [webSpeechService]);

  const handleExitToSetup = useCallback(() => {
    // Stop all speech immediately
    if (webSpeechService) {
      webSpeechService.stopSpeaking();
      webSpeechService.stopListening();
    }

    // Clear speech queue and reset speech states
    setSpeechQueue([]);
    setIsProcessingSpeech(false);
    setIsSpeaking(false);
    setIsListening(false);

    // Reset all state to start fresh
    setUserInfo(null);
    setSelectedTopic(null);
    setMessages([]);
    setAppState('setup');
    setConversationAnalysis(null);

    // Clear session storage
    sessionStorage.removeItem('englishTeacher_userInfo');

    toast({
      title: "Session ended",
      description: "You've been returned to the setup screen.",
    });
  }, [webSpeechService, toast]);

  // Render different states
  if (appState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <UserSetup onComplete={handleUserSetupComplete} />
      </div>
    );
  }

  if (appState === 'topic-selection') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choose a Topic</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="inline-flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to exit? This will end your current session and return you to the setup screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleExitToSetup}>
                  Exit Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <TopicSelector 
          userName={userInfo?.name || "Student"}
          userLevel={userInfo?.level || 'intermediate'}
          onTopicSelect={handleTopicSelect}
        />
      </div>
    );
  }

  if (appState === 'analysis' && conversationAnalysis) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Conversation Analysis</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="inline-flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Return to Setup
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Return to Setup</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to return to the setup screen? This will end your current session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleExitToSetup}>
                  Return to Setup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <AdvancedConversationAnalysis
          analysis={conversationAnalysis}
          userName={userInfo?.name || "Student"}
          topic={selectedTopic?.title || "English Practice"}
          onRestart={handleRestartSameTopic}
          onNewTopic={handleNewTopic}
        />
      </div>
    );
  }

  // Conversation state
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center px-2">
        <TeacherAvatar isSpeaking={isSpeaking} className="mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {selectedTopic?.title} Practice
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Practicing with {userInfo?.name} • {selectedTopic?.description}
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Voice Controls - Mobile: Top Section, Desktop: Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <StatusIndicator
              webSpeechSupported={webSpeechService?.isSupported() || false}
              aiServiceAvailable={aiServiceAvailable}
              microphonePermission={microphonePermission}
            />
            
            <VoiceControls
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onStartListening={handleStartListening}
              onStopListening={() => webSpeechService.stopListening()}
              isListening={isListening}
              isConnected={webSpeechService?.isSupported() || false}
              voicesMuted={voicesMuted}
              onMuteAllVoices={handleMuteAllVoices}
              onUnmuteVoices={handleUnmuteVoices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
            />
          </div>
          
          <Card className="mt-4">
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={handleEndConversation}
                variant="outline"
                className="w-full text-sm"
                size="sm"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "End & Analyze"}
              </Button>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <Button 
                  onClick={handleNewTopic}
                  variant="outline"
                  className="w-full text-sm"
                  size="sm"
                >
                  Change Topic
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Exit Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90vw] max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Exit Session</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to exit? This will end your current conversation and return you to the setup screen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleExitToSetup} className="w-full sm:w-auto">
                        Exit Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card className="h-[50vh] sm:h-[60vh] lg:h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4 sm:px-6" ref={scrollAreaRef}>
                <div className="space-y-3 sm:space-y-4 pb-4">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <ConversationMessage
                        message={message.text}
                        isTeacher={message.isTeacher}
                        isSpeaking={message.isTeacher && isSpeaking}
                        timestamp={message.timestamp}
                      />
                      {message.correction && !message.isTeacher && (
                        <ErrorCorrection 
                          correction={message.correction}
                          className="ml-8 sm:ml-12"
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Show loading state when generating response */}
                  {isGeneratingResponse && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-teacher flex items-center justify-center text-teacher-foreground text-sm font-medium">
                          T
                        </div>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator />
              
              <div className="p-3 sm:p-4 text-center">
                <Button 
                  onClick={isListening ? handleStopListening : handleStartListening}
                  disabled={!webSpeechService?.isSupported() || isGeneratingResponse}
                  size="lg"
                  className={`w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium transition-all ${
                    isListening 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isGeneratingResponse ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isListening ? (
                    "🎤 Listening..."
                  ) : (
                    "🎤 Speak to respond"
                  )}
                </Button>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {isGeneratingResponse 
                    ? "AI is thinking..." 
                    : isListening 
                      ? "Speak now" 
                      : "Click the button and speak your response"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};