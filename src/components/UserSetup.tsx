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
  }) => void;
}

export const UserSetup = ({ onComplete }: UserSetupProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name) return;

    const userInfo = { name };

    // Store user info in localStorage for this session
    localStorage.setItem('englishTeacher_userInfo', JSON.stringify(userInfo));
    
    onComplete(userInfo);
  };

  const isComplete = name.trim() !== "";

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
            AI Features Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ✅ AI conversation analysis and humanized voice are configured and ready to use through secure cloud services.
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
        Your name is stored locally for this session. AI features powered by secure cloud services.
      </div>
    </div>
  );
};