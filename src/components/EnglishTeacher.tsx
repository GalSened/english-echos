import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LessonCard } from "./LessonCard";
import { ConversationMessage } from "./ConversationMessage";
import { VoiceControls } from "./VoiceControls";
import { TeacherAvatar } from "./TeacherAvatar";
import { Send, Key, BookOpen, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isTeacher: boolean;
  timestamp: Date;
}

const lessonTopics = [
  {
    title: "Basic Greetings",
    description: "Learn how to introduce yourself and greet others in English",
    difficulty: "Beginner" as const
  },
  {
    title: "Ordering Food",
    description: "Practice restaurant conversations and food vocabulary",
    difficulty: "Intermediate" as const
  },
  {
    title: "Job Interview Skills",
    description: "Master professional English for workplace communication",
    difficulty: "Advanced" as const
  },
  {
    title: "Travel Conversations",
    description: "Essential phrases for traveling and asking for directions",
    difficulty: "Intermediate" as const
  }
];

export const EnglishTeacher = () => {
  const [apiKey, setApiKey] = useState("");
  const [agentId, setAgentId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [showApiSetup, setShowApiSetup] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      addMessage("Hello! I'm your English teacher. How can I help you learn today?", true);
    },
    onDisconnect: () => {
      setIsListening(false);
    },
    onMessage: (message) => {
      if (message.source === "user") {
        addMessage(message.message, false);
      } else if (message.source === "ai") {
        addMessage(message.message, true);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      addMessage("Sorry, I encountered an error. Please try again.", true);
    }
  });

  const addMessage = useCallback((text: string, isTeacher: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isTeacher,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
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

  const handleStartConversation = async () => {
    if (!apiKey || !agentId) {
      return;
    }

    try {
      // For demo purposes - in production, generate signed URL from backend
      await conversation.startSession({ 
        agentId: agentId,
        authorization: `Bearer ${apiKey}`
      });
      setShowApiSetup(false);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      addMessage("Failed to connect. Please check your API key and agent ID.", true);
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

  const handleSendMessage = () => {
    if (currentInput.trim()) {
      addMessage(currentInput, false);
      setCurrentInput("");
      // In a real implementation, you'd send this to the conversation
    }
  };

  const handleLessonStart = (lesson: typeof lessonTopics[0]) => {
    addMessage(`I'd like to practice ${lesson.title.toLowerCase()}`, false);
    addMessage(`Great choice! Let's work on ${lesson.title.toLowerCase()}. ${lesson.description}`, true);
  };

  if (showApiSetup) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center">
          <TeacherAvatar className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">English Teacher Setup</h1>
          <p className="text-muted-foreground">Enter your ElevenLabs credentials to get started</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                ElevenLabs API Key
              </label>
              <Input
                type="password"
                placeholder="Your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agent ID</label>
              <Input
                placeholder="Your agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleStartConversation}
              disabled={!apiKey || !agentId}
              className="w-full bg-teacher hover:bg-teacher/90"
            >
              Start Teaching Session
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            You'll need an ElevenLabs account and agent ID. Visit{" "}
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ElevenLabs
            </a>{" "}
            to get started.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <TeacherAvatar isSpeaking={conversation.isSpeaking} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">English Speaking Teacher</h1>
        <p className="text-muted-foreground">Practice your English with AI-powered conversation</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lesson Topics */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lesson Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lessonTopics.map((lesson, index) => (
                <LessonCard
                  key={index}
                  title={lesson.title}
                  description={lesson.description}
                  difficulty={lesson.difficulty}
                  onStart={() => handleLessonStart(lesson)}
                />
              ))}
            </CardContent>
          </Card>

          <VoiceControls
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            isListening={isListening}
            isConnected={conversation.status === "connected"}
          />
        </div>

        {/* Conversation Area */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-1">
                  {messages.map((message) => (
                    <ConversationMessage
                      key={message.id}
                      message={message.text}
                      isTeacher={message.isTeacher}
                      isSpeaking={message.isTeacher && conversation.isSpeaking}
                      timestamp={message.timestamp}
                    />
                  ))}
                </div>
              </ScrollArea>

              <Separator />
              
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
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