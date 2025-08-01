// Updated: 2025-01-31 - Fixed Target reference error
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { SupabaseOpenAIService } from "@/services/supabaseOpenaiService";

interface GeneratedTopic {
  title: string;
  description: string;
}

interface TopicSelectorProps {
  userName: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onTopicSelect: (topic: { title: string; description: string; isCustom?: boolean }) => void;
}

export const TopicSelector = ({ userName, userLevel, onTopicSelect }: TopicSelectorProps) => {
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [aiService] = useState(() => new SupabaseOpenAIService());

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const topics = await aiService.generateTopics(userName, userLevel);
      setGeneratedTopics(topics);
    } catch (error) {
      console.error('Error loading topics:', error);
      // Fallback topics if generation fails
      setGeneratedTopics([
        {
          title: "Daily Life & Routines",
          description: "Share your daily habits and talk about what makes a typical day for you. What's your favorite part of the day?"
        },
        {
          title: "Travel & Adventures",
          description: "Discuss your travel experiences and dream destinations. Where would you love to visit and why?"
        },
        {
          title: "Technology & Future",
          description: "Talk about how technology impacts your life and what you think the future will look like."
        },
        {
          title: "Food & Culture",
          description: "Share your favorite foods, cooking experiences, and cultural traditions around meals."
        }
      ]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [userName]);

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect({
        title: customTopic,
        description: `Custom conversation topic: ${customTopic}`,
        isCustom: true
      });
    }
  };

  const handleRefreshTopics = () => {
    loadTopics();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Hello {userName}! 👋
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground mb-4">
          Here are {userLevel} level topics generated just for you!
        </p>
        <Button 
          onClick={handleRefreshTopics}
          disabled={isLoadingTopics}
          variant="outline"
          size="sm"
          className="mb-4 text-xs sm:text-sm px-3 sm:px-4"
        >
          {isLoadingTopics ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{isLoadingTopics ? "Generating..." : "Generate New Topics"}</span>
          <span className="sm:hidden">{isLoadingTopics ? "Loading..." : "Refresh"}</span>
        </Button>
      </div>

      {isLoadingTopics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-1 sm:mb-2"></div>
                <div className="h-4 sm:h-6 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="h-2 sm:h-3 bg-muted rounded"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {generatedTopics.map((topic, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-card to-muted/30 border-2 hover:border-primary/50"
              onClick={() => onTopicSelect(topic)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    AI Generated
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or create custom topic</span>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-secondary/20 to-accent/20">
        <CardContent className="p-4 sm:p-6">
          {!showCustom ? (
            <Button 
              onClick={() => setShowCustom(true)}
              variant="outline"
              className="w-full touch-manipulation"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Topic
            </Button>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Custom Topic</label>
                <Input
                  placeholder="e.g., Discussing climate change, Planning a vacation..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCustomTopicSubmit()}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleCustomTopicSubmit}
                  disabled={!customTopic.trim()}
                  className="flex-1 touch-manipulation"
                  size="sm"
                >
                  Start Custom Conversation
                </Button>
                <Button 
                  onClick={() => {
                    setShowCustom(false);
                    setCustomTopic("");
                  }}
                  variant="outline"
                  className="touch-manipulation"
                  size="sm"
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