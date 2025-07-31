import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherAvatar } from "./TeacherAvatar";
import { User, Brain } from "lucide-react";

interface UserSetupProps {
  onComplete: (userInfo: {
    name: string;
    openAiKey: string;
    elevenLabsKey?: string;
  }) => void;
}

export const UserSetup = ({ onComplete }: UserSetupProps) => {
  const [name, setName] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");

  const handleSubmit = () => {
    if (!name || !openAiKey) return;

    const userInfo = {
      name,
      openAiKey,
      elevenLabsKey: elevenLabsKey || undefined
    };

    // Store user info in localStorage for this session
    localStorage.setItem('englishTeacher_userInfo', JSON.stringify(userInfo));
    
    onComplete(userInfo);
  };

  const isComplete = name.trim() !== "" && openAiKey.trim() !== "";

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
            <Brain className="h-5 w-5" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key *</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for AI conversation analysis and error correction
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="elevenlabs-key">ElevenLabs API Key (Optional)</Label>
            <Input
              id="elevenlabs-key"
              type="password"
              placeholder="Optional - for humanized voice"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Add for more natural, humanized teacher voice. Falls back to browser speech if not provided.
            </p>
          </div>
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
        Your information is stored locally for this session. API keys are never shared.
      </div>
    </div>
  );
};