import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TeacherAvatar } from "./TeacherAvatar";
import { User, Brain, Target, BookOpen, Zap, Home } from "lucide-react";

interface UserSetupProps {
  onComplete: (userInfo: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  }) => void;
}

export const UserSetup = ({ onComplete }: UserSetupProps) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const levels = [
    {
      id: 'beginner' as const,
      title: 'Beginner',
      description: 'Learning basic vocabulary and simple sentences',
      icon: BookOpen,
      features: ['Simple vocabulary', 'Basic grammar', 'Slow-paced conversations']
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate', 
      description: 'Comfortable with everyday conversations',
      icon: Target,
      features: ['Complex sentences', 'Varied vocabulary', 'Natural pace']
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      description: 'Fluent speaker looking to perfect skills',
      icon: Zap,
      features: ['Nuanced expressions', 'Cultural context', 'Professional topics']
    }
  ];

  const handleSubmit = () => {
    if (!name) return;

    const userInfo = { name, level };
    
    // Session storage is handled in the parent component
    onComplete(userInfo);
  };

  const isComplete = name.trim() !== "";

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Main Page Button - properly aligned */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
          className="text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4 mr-2" />
          Return to Main Page
        </Button>
      </div>
      
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
            <Target className="h-5 w-5" />
            Choose Your Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {levels.map((levelOption) => {
            const Icon = levelOption.icon;
            return (
              <div
                key={levelOption.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  level === levelOption.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setLevel(levelOption.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    level === levelOption.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{levelOption.title}</h3>
                      {level === levelOption.id && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {levelOption.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {levelOption.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
            ✅ AI will adapt conversations, topics, and feedback to your {level} level with personalized learning experience.
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