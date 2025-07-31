import { useState, useCallback, useRef, useEffect } from "react";
import { WebSpeechService } from "@/services/webSpeechService";
import { ElevenLabsService } from "@/services/elevenlabsService";
import { SupabaseOpenAIService, ConversationAnalysis as AnalysisType, ErrorCorrection as ErrorType } from "@/services/supabaseOpenaiService";
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
import { ConversationAnalysis } from "./ConversationAnalysis";
import { StatusIndicator } from "./StatusIndicator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Send, MessageCircle, BarChart3, AlertCircle, LogOut, Home } from "lucide-react";

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
  const [appState, setAppState] = useState<AppState>('setup');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<AnalysisType | null>(null);
  const [openAIService, setOpenAIService] = useState<SupabaseOpenAIService | null>(null);
  const [webSpeechService, setWebSpeechService] = useState<WebSpeechService | null>(null);
  const [elevenLabsService, setElevenLabsService] = useState<ElevenLabsService | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize services on component mount
  useEffect(() => {
    const initServices = async () => {
      const speechService = new WebSpeechService();
      setWebSpeechService(speechService);
      
      const aiService = new SupabaseOpenAIService();
      setOpenAIService(aiService);
      
      const ttsService = new ElevenLabsService();
      setElevenLabsService(ttsService);
      
      // Check microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophonePermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      } catch (error) {
        console.log('Microphone permission not granted yet');
        setMicrophonePermission(false);
      }
      
      // Test ElevenLabs availability silently (background test)
      try {
        const isAvailable = await ttsService.testService();
        setElevenLabsAvailable(isAvailable);
      } catch (error) {
        console.log('ElevenLabs not available, will use browser speech');
        setElevenLabsAvailable(false);
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
  }, []);

  const addMessage = useCallback((text: string, isTeacher: boolean): string => {
    const id = Date.now().toString();
    const newMessage: Message = {
      id,
      text,
      isTeacher,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // If it's a teacher message, speak it
    if (isTeacher) {
      setIsSpeaking(true);
      
      // Try ElevenLabs first, fallback to Web Speech
      const speakWithService = async () => {
        try {
          if (elevenLabsService) {
            try {
              console.log('Attempting ElevenLabs speech...');
              await elevenLabsService.speak(text);
              console.log('ElevenLabs speech completed successfully');
              return;
            } catch (error) {
              console.error('ElevenLabs failed, falling back to Web Speech:', error);
              toast({
                title: "Voice Notice",
                description: "Using browser voice (ElevenLabs unavailable)",
                duration: 2000,
              });
              if (webSpeechService) {
                try {
                  await webSpeechService.speak(text);
                  console.log('Web Speech fallback completed');
                  return;
                } catch (fallbackError) {
                  console.error('All speech services failed:', fallbackError);
                  toast({
                    title: "Voice Error", 
                    description: "All voice services failed. Check console for details.",
                    variant: "destructive",
                    duration: 3000,
                  });
                  throw fallbackError;
                }
              } else {
                toast({
                  title: "Voice Error",
                  description: "No voice services available",
                  variant: "destructive", 
                  duration: 3000,
                });
                throw error;
              }
            }
          } else if (webSpeechService) {
            try {
              console.log('Using Web Speech service...');
              await webSpeechService.speak(text);
              console.log('Web Speech completed successfully');
            } catch (error) {
              console.error('Web Speech failed:', error);
              toast({
                title: "Voice Error",
                description: "Voice synthesis failed",
                variant: "destructive",
                duration: 3000,
              });
              throw error;
            }
          } else {
            const errorMsg = "No voice services available";
            console.error(errorMsg);
            toast({
              title: "Voice Error",
              description: errorMsg,
              variant: "destructive",
              duration: 3000,
            });
            throw new Error(errorMsg);
          }
        } finally {
          setIsSpeaking(false);
        }
      };
      
      speakWithService();
    }
    
    return id;
  }, [elevenLabsService, webSpeechService]);

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
    
    // Add welcome message
    addMessage(`Hello ${userInfo?.name}! I'm excited to practice "${topic.title}" with you today. ${topic.description}`, true);
  };

  const handleEndConversation = async () => {
    // Stop any ongoing speech
    if (elevenLabsService) {
      elevenLabsService.stopSpeaking();
    }
    if (webSpeechService) {
      webSpeechService.stopSpeaking();
      webSpeechService.stopListening();
    }
    setIsSpeaking(false);
    setIsListening(false);
    
    if (openAIService && userInfo && selectedTopic) {
      const userMessages = messages
        .filter(msg => !msg.isTeacher)
        .map(msg => msg.text);
      
      try {
        const analysis = await openAIService.analyzeConversation(
          userMessages,
          selectedTopic.title,
          userInfo.name
        );
        setConversationAnalysis(analysis);
        setAppState('analysis');
      } catch (error) {
        console.error('Error analyzing conversation:', error);
        // Proceed to analysis with a fallback
        setConversationAnalysis({
          grammarErrors: [],
          vocabularyImprovements: [],
          pronunciationTips: ["Continue practicing to improve your pronunciation"],
          overallFeedback: "Great job participating in the conversation!",
          strengths: ["Engaged actively in the topic"],
          areasToImprove: ["Keep practicing regularly"],
          nextSteps: ["Try more conversations on different topics"],
          scoreBreakdown: {
            grammar: 7,
            vocabulary: 7,
            fluency: 7,
            pronunciation: 7,
            overall: 7
          }
        });
        setAppState('analysis');
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (elevenLabsService) {
      elevenLabsService.setVolume(newVolume);
    }
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
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsListening(true);
      console.log('Starting speech recognition...');
      
      const transcript = await webSpeechService.startListening();
      setIsListening(false);
      
      console.log('Speech recognition result:', transcript);
      
      if (transcript.trim()) {
        // Add user message
        const userMsgId = addMessage(transcript, false);
        
        // Check for errors using OpenAI
        if (openAIService) {
          try {
            const correction = await openAIService.correctText(transcript, selectedTopic?.title || "", userInfo?.level || "intermediate");
            
            // Update message with correction
            setMessages(prev => prev.map(msg => 
              msg.id === userMsgId ? { ...msg, correction } : msg
            ));
          } catch (error) {
            console.error('Error checking message:', error);
          }
        }
        
        // Generate intelligent teacher response using OpenAI
        if (openAIService) {
          try {
            const teacherResponse = await openAIService.generateTeacherResponse(
              transcript,
              messages,
              selectedTopic?.title || "",
              userInfo?.name || "Student",
              userInfo?.level || "intermediate"
            );
            addMessage(teacherResponse, true);
          } catch (error) {
            console.error('Error generating teacher response:', error);
            // Fallback to simple response
            addMessage("That's interesting! Can you tell me more about that?", true);
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
      } else if (error.message.includes('not-allowed')) {
        addMessage("Microphone access was denied. Please check your browser settings and try again.", true);
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
      
      // Check for errors using OpenAI
      if (openAIService) {
        try {
          const correction = await openAIService.correctText(userMessage, selectedTopic?.title || "", userInfo?.level || "intermediate");
          
          // Update message with correction
          setMessages(prev => prev.map(msg => 
            msg.id === userMsgId ? { ...msg, correction } : msg
          ));
        } catch (error) {
          console.error('Error checking message:', error);
        }
      }
      
      // Generate intelligent teacher response using OpenAI
      if (openAIService) {
        try {
          const teacherResponse = await openAIService.generateTeacherResponse(
            userMessage,
            messages,
            selectedTopic?.title || "",
            userInfo?.name || "Student",
            userInfo?.level || "intermediate"
          );
          addMessage(teacherResponse, true);
        } catch (error) {
          console.error('Error generating teacher response:', error);
          // Fallback to simple response
          addMessage("That's interesting! Can you tell me more about that?", true);
        }
      } else {
        // Fallback if service not available
        addMessage("That's interesting! Can you tell me more about that?", true);
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
    // Reset all state to start fresh
    setUserInfo(null);
    setSelectedTopic(null);
    setMessages([]);
    setAppState('setup');
    setConversationAnalysis(null);
    
    // Clear session storage
    sessionStorage.removeItem('englishTeacher_userInfo');
    
    // Stop any ongoing speech
    if (webSpeechService) {
      webSpeechService.stopListening();
    }
    setIsListening(false);
    setIsSpeaking(false);
    
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
        <ConversationAnalysis
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <TeacherAvatar isSpeaking={isSpeaking} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">
          {selectedTopic?.title} Practice
        </h1>
        <p className="text-muted-foreground">
          Practicing with {userInfo?.name} • {selectedTopic?.description}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Voice Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <StatusIndicator
            webSpeechSupported={webSpeechService?.isSupported() || false}
            elevenLabsAvailable={elevenLabsAvailable}
            microphonePermission={microphonePermission}
          />
          
          <VoiceControls
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            isListening={isListening}
            isConnected={webSpeechService?.isSupported() || false}
          />
          
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={handleEndConversation}
                variant="outline"
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                End & Analyze
              </Button>
              
              <Button 
                onClick={handleNewTopic}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Change Topic
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit Session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to exit? This will end your current conversation and return you to the setup screen.
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
            </CardContent>
          </Card>
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-4">
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
                          className="ml-12"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />
              
              <div className="p-4 text-center">
                <Button 
                  onClick={isListening ? handleStopListening : handleStartListening}
                  disabled={!webSpeechService?.isSupported()}
                  size="lg"
                  className={`px-8 py-6 text-lg font-medium transition-all ${
                    isListening 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isListening ? "🎤 Listening..." : "🎤 Speak to respond"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the button and speak your response
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};