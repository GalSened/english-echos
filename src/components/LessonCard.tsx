import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";

interface LessonCardProps {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  onStart: () => void;
}

export const LessonCard = ({ title, description, difficulty, onStart }: LessonCardProps) => {
  const difficultyColors = {
    Beginner: "bg-secondary text-secondary-foreground",
    Intermediate: "bg-accent text-accent-foreground", 
    Advanced: "bg-teacher text-teacher-foreground"
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-card to-muted/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        <Button 
          onClick={onStart}
          className="w-full bg-teacher hover:bg-teacher/90 text-teacher-foreground transition-all"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Lesson
        </Button>
      </CardContent>
    </Card>
  );
};