import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Target } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  focus: string[];
}

interface TopicSelectorProps {
  userName: string;
  onTopicSelect: (topic: Topic | { title: string; description: string; isCustom: true }) => void;
}

const predefinedTopics: Topic[] = [
  {
    id: "greetings",
    title: "Daily Greetings & Introductions",
    description: "Learn how to introduce yourself, greet others, and make small talk",
    difficulty: "Beginner",
    focus: ["Pronunciation", "Basic vocabulary", "Social phrases"]
  },
  {
    id: "restaurant",
    title: "Restaurant & Food Ordering",
    description: "Practice ordering food, asking about ingredients, and restaurant etiquette",
    difficulty: "Intermediate",
    focus: ["Food vocabulary", "Polite requests", "Asking questions"]
  },
  {
    id: "job-interview",
    title: "Job Interview Preparation",
    description: "Master professional English for interviews and workplace communication",
    difficulty: "Advanced",
    focus: ["Professional language", "Confidence building", "Complex responses"]
  },
  {
    id: "travel",
    title: "Travel & Navigation",
    description: "Essential phrases for traveling, asking directions, and booking accommodations",
    difficulty: "Intermediate",
    focus: ["Travel vocabulary", "Direction phrases", "Problem solving"]
  },
  {
    id: "shopping",
    title: "Shopping & Negotiations",
    description: "Learn to shop, compare prices, and negotiate in English",
    difficulty: "Intermediate",
    focus: ["Numbers", "Comparisons", "Negotiation skills"]
  },
  {
    id: "phone-calls",
    title: "Phone Calls & Appointments",
    description: "Practice making calls, scheduling appointments, and phone etiquette",
    difficulty: "Advanced",
    focus: ["Clear pronunciation", "Formal language", "Time expressions"]
  }
];

export const TopicSelector = ({ userName, onTopicSelect }: TopicSelectorProps) => {
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const getDifficultyColor = (difficulty: Topic["difficulty"]) => {
    switch (difficulty) {
      case "Beginner": return "bg-secondary text-secondary-foreground";
      case "Intermediate": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-teacher text-teacher-foreground";
    }
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect({
        title: customTopic,
        description: `Custom conversation topic: ${customTopic}`,
        isCustom: true
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Hello {userName}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to practice today? Choose a topic or create your own.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predefinedTopics.map((topic) => (
          <Card 
            key={topic.id} 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-card to-muted/30"
            onClick={() => onTopicSelect(topic)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <Badge className={getDifficultyColor(topic.difficulty)}>
                  {topic.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                {topic.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  Focus areas:
                </div>
                <div className="flex flex-wrap gap-1">
                  {topic.focus.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or create custom topic</span>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-secondary/20 to-accent/20">
        <CardContent className="p-6">
          {!showCustom ? (
            <Button 
              onClick={() => setShowCustom(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Topic
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Topic</label>
                <Input
                  placeholder="e.g., Discussing climate change, Planning a vacation, Cooking recipes..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCustomTopicSubmit()}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCustomTopicSubmit}
                  disabled={!customTopic.trim()}
                  className="flex-1"
                >
                  Start Custom Conversation
                </Button>
                <Button 
                  onClick={() => {
                    setShowCustom(false);
                    setCustomTopic("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};