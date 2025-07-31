import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherAvatar } from "./TeacherAvatar";
import { User, Key, Brain } from "lucide-react";
import { getOpenAIKey, setOpenAIKey } from "@/lib/supabase";

interface UserSetupProps {
  onComplete: (userInfo: {
    name: string;
    openAiKey: string;
  }) => void;
}

export const UserSetup = ({ onComplete }: UserSetupProps) => {
  const [name, setName] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingKey = async () => {
      try {
        const key = await getOpenAIKey();
        setExistingKey(key);
      } catch (error) {
        console.error('Error checking existing key:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingKey();
  }, []);

  const handleSubmit = async () => {
    if (!name) return;

    try {
      let finalKey = existingKey;

      // If no existing key and user provided one, save it
      if (!existingKey && openAiKey) {
        await setOpenAIKey(openAiKey);
        finalKey = openAiKey;
      }

      if (finalKey) {
        // Store user name in localStorage for this session
        localStorage.setItem('englishTeacher_userName', name);
        
        onComplete({ name, openAiKey: finalKey });
      }
    } catch (error) {
      console.error('Error saving setup:', error);
    }
  };

  const needsKey = !existingKey;
  const isComplete = name && (existingKey || openAiKey);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <TeacherAvatar className="mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

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

      {needsKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Engine Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openAiKey">OpenAI API Key</Label>
              <Input
                id="openAiKey"
                type="password"
                placeholder="Your OpenAI API key (will be saved for all users)"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This key will be saved globally for all users. Only the app owner needs to provide this once.
            </p>
          </CardContent>
        </Card>
      )}

      {existingKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ✅ OpenAI API key is configured. AI analysis and conversation features are ready to use.
            </p>
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={!isComplete}
        className="w-full bg-teacher hover:bg-teacher/90"
        size="lg"
      >
        {needsKey ? 'Save & Start Learning' : 'Start Learning English'}
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        {needsKey 
          ? 'API key will be saved globally. Your name is stored locally for this session.' 
          : 'Your name is stored locally for this session. Voice provided by browser speech synthesis.'
        }
      </div>
    </div>
  );
};