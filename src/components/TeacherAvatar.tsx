import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeacherAvatarProps {
  isSpeaking?: boolean;
  className?: string;
}

export const TeacherAvatar = ({ isSpeaking = false, className }: TeacherAvatarProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Animated glow when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-speaking rounded-full opacity-30 animate-pulse-glow" />
      )}
      
      <Avatar className="h-16 w-16 border-2 border-teacher shadow-lg">
        <AvatarImage 
          src="/api/placeholder/64/64" 
          alt="English Teacher"
          className="object-cover"
        />
        <AvatarFallback className="bg-teacher text-teacher-foreground text-xl font-semibold">
          ET
        </AvatarFallback>
      </Avatar>
      
      {/* Speaking indicator waves */}
      {isSpeaking && (
        <div className="absolute -bottom-1 -right-1 flex gap-1">
          <div className="w-1 h-3 bg-speaking rounded-full animate-speaking-wave" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-3 bg-speaking rounded-full animate-speaking-wave" style={{ animationDelay: '200ms' }} />
          <div className="w-1 h-3 bg-speaking rounded-full animate-speaking-wave" style={{ animationDelay: '400ms' }} />
        </div>
      )}
    </div>
  );
};