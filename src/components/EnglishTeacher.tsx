import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserSetup } from "./UserSetup";
import { TopicSelector } from "./TopicSelector";
import { ConversationMessage } from "./ConversationMessage";
import { VoiceControls } from "./VoiceControls";
import { TeacherAvatar } from "./TeacherAvatar";
import { ErrorCorrection } from "./ErrorCorrection";
import { ConversationAnalysis } from "./ConversationAnalysis";
import { OpenAIService, ConversationAnalysis as AnalysisType, ErrorCorrection as ErrorType } from "@/services/openaiService";
import { Send, MessageCircle, BarChart3 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isTeacher: boolean;
  timestamp: Date;
  correction?: ErrorType;
}

interface UserInfo {
  name: string;
  elevenLabsKey: string;
  openAiKey: string;
  agentId: string;
}

interface Topic {
  title: string;
  description: string;
  isCustom?: boolean;
}

type AppState = 'setup' | 'topic-selection' | 'conversation' | 'analysis';

export const EnglishTeacher = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [isListening, setIsListening] = useState(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<AnalysisType | null>(null);
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load saved user info on component mount
  useEffect(() => {
    const saved = localStorage.getItem('englishTeacher_userInfo');
    if (saved) {
      try {
        const savedUserInfo = JSON.parse(saved);
        setUserInfo(savedUserInfo);
        setOpenAIService(new OpenAIService(savedUserInfo.openAiKey));
        setAppState('topic-selection');
      } catch (error) {
        console.error('Error loading saved user info:', error);
      }
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      if (selectedTopic) {
        addMessage(`Hello ${userInfo?.name}! I'm excited to practice "${selectedTopic.title}" with you today. ${selectedTopic.description}`, true);
      }
    },
    onDisconnect: () => {
      setIsListening(false);
    },
    onMessage: async (message) => {
      if (message.source === "user") {
        const userMessage = message.message;
        
        // Add user message
        const userMsgId = addMessage(userMessage, false);
        
        // Check for errors using OpenAI
        if (openAIService) {
          try {
            const correction = await openAIService.correctText(userMessage, selectedTopic?.title || "");
            
            // Update message with correction
            setMessages(prev => prev.map(msg => 
              msg.id === userMsgId ? { ...msg, correction } : msg
            ));
          } catch (error) {
            console.error('Error checking message:', error);
          }
        }
      } else if (message.source === "ai") {
        addMessage(message.message, true);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      addMessage("Sorry, I encountered an error. Please try again.", true);
    }
  });

  const addMessage = useCallback((text: string, isTeacher: boolean): string => {
    const id = Date.now().toString();
    const newMessage: Message = {
      id,
      text,
      isTeacher,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

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

  const handleUserSetupComplete = (newUserInfo: UserInfo) => {
    setUserInfo(newUserInfo);
    setOpenAIService(new OpenAIService(newUserInfo.openAiKey));
    setAppState('topic-selection');
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setMessages([]); // Clear previous messages
    setAppState('conversation');
    
    if (userInfo) {
      try {
        await conversation.startSession({ 
          agentId: userInfo.agentId,
          authorization: `Bearer ${userInfo.elevenLabsKey}`
        });
      } catch (error) {
        console.error("Failed to start conversation:", error);
        addMessage("Failed to connect to voice service. You can still type to practice!", true);
      }
    }
  };

  const handleEndConversation = async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
    }
    
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

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (conversation.status === "connected") {
      await conversation.setVolume({ volume: newVolume });
    }
  };

  const handleStartListening = () => {
    setIsListening(true);
  };

  const handleStopListening = () => {
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
          const correction = await openAIService.correctText(userMessage, selectedTopic?.title || "");
          
          // Update message with correction
          setMessages(prev => prev.map(msg => 
            msg.id === userMsgId ? { ...msg, correction } : msg
          ));
        } catch (error) {
          console.error('Error checking message:', error);
        }
      }
      
      // Simulate teacher response (in real app this would come from conversation)
      setTimeout(() => {
        addMessage("That's interesting! Can you tell me more about that?", true);
      }, 1000);
    }
  };

  const handleRestartSameTopic = () => {
    setMessages([]);
    setAppState('conversation');
    handleTopicSelect(selectedTopic!);
  };

  const handleNewTopic = () => {
    setMessages([]);
    setSelectedTopic(null);
    setConversationAnalysis(null);
    setAppState('topic-selection');
  };

  // Render different states
  if (appState === 'setup') {
    return <UserSetup onComplete={handleUserSetupComplete} />;
  }

  if (appState === 'topic-selection') {
    return (
      <TopicSelector 
        userName={userInfo?.name || "Student"}
        onTopicSelect={handleTopicSelect}
      />
    );
  }

  if (appState === 'analysis' && conversationAnalysis) {
    return (
      <ConversationAnalysis
        analysis={conversationAnalysis}
        userName={userInfo?.name || "Student"}
        topic={selectedTopic?.title || "English Practice"}
        onRestart={handleRestartSameTopic}
        onNewTopic={handleNewTopic}
      />
    );
  }

  // Conversation state
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <TeacherAvatar isSpeaking={conversation.isSpeaking} className="mx-auto mb-4" />
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
          <VoiceControls
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            isListening={isListening}
            isConnected={conversation.status === "connected"}
          />
          
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={handleEndConversation}
                variant="outline"
                className="w-full mb-2"
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
                        isSpeaking={message.isTeacher && conversation.isSpeaking}
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
              
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message in English..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};