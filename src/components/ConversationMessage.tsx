import { cn } from "@/lib/utils";
import { TeacherAvatar } from "./TeacherAvatar";
import { User } from "lucide-react";

interface ConversationMessageProps {
  message: string;
  isTeacher: boolean;
  isSpeaking?: boolean;
  timestamp?: Date;
}

export const ConversationMessage = ({ 
  message, 
  isTeacher, 
  isSpeaking = false, 
  timestamp 
}: ConversationMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 p-4 transition-all duration-300",
      isTeacher ? "justify-start" : "justify-end"
    )}>
      {isTeacher && (
        <TeacherAvatar isSpeaking={isSpeaking} className="mt-1" />
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
        isTeacher 
          ? "bg-card border border-border rounded-tl-sm" 
          : "bg-primary text-primary-foreground rounded-tr-sm"
      )}>
        <p className="leading-relaxed">{message}</p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-2",
            isTeacher ? "text-muted-foreground" : "text-primary-foreground/70"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      
      {!isTeacher && (
        <div className="flex items-center justify-center w-8 h-8 mt-1 bg-primary rounded-full">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};