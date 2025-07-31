import { AlertCircle, CheckCircle, Mic, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusIndicatorProps {
  webSpeechSupported: boolean;
  elevenLabsAvailable: boolean;
  microphonePermission: boolean;
}

export const StatusIndicator = ({ 
  webSpeechSupported, 
  elevenLabsAvailable, 
  microphonePermission 
}: StatusIndicatorProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 text-sm">System Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            {webSpeechSupported ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Speech Recognition</span>
          </div>
          
          <div className="flex items-center gap-2">
            {elevenLabsAvailable ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-yellow-500" />
            )}
            <span>High-Quality Voice</span>
          </div>
          
          <div className="flex items-center gap-2">
            {microphonePermission ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-yellow-500" />
            )}
            <span>Microphone Access</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};