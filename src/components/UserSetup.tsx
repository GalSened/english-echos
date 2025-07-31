import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherAvatar } from "./TeacherAvatar";
import { User, Key, Brain } from "lucide-react";

interface UserSetupProps {
  onComplete: (userInfo: {
    name: string;
    elevenLabsKey: string;
    openAiKey: string;
    agentId: string;
  }) => void;
}

export const UserSetup = ({ onComplete }: UserSetupProps) => {
  const [name, setName] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [agentId, setAgentId] = useState("");

  const handleSubmit = () => {
    if (name && elevenLabsKey && openAiKey && agentId) {
      // Store in localStorage for frontend-only approach
      localStorage.setItem('englishTeacher_userInfo', JSON.stringify({
        name,
        elevenLabsKey,
        openAiKey,
        agentId
      }));
      
      onComplete({ name, elevenLabsKey, openAiKey, agentId });
    }
  };

  const isComplete = name && elevenLabsKey && openAiKey && agentId;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center">
        <TeacherAvatar className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to English Teacher</h1>
        <p className="text-muted-foreground">
          Let's set up your personalized learning experience with AI-powered conversation analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            ElevenLabs Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="elevenLabsKey">ElevenLabs API Key</Label>
            <Input
              id="elevenLabsKey"
              type="password"
              placeholder="Your ElevenLabs API key"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agentId">Agent ID</Label>
            <Input
              id="agentId"
              placeholder="Your ElevenLabs agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openAiKey">OpenAI API Key</Label>
            <Input
              id="openAiKey"
              type="password"
              placeholder="Your OpenAI API key for conversation analysis"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Used for analyzing your English, correcting errors, and providing detailed feedback
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit}
        disabled={!isComplete}
        className="w-full bg-teacher hover:bg-teacher/90"
        size="lg"
      >
        Start Learning English
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        Your API keys are stored locally in your browser for security
      </div>
    </div>
  );
};