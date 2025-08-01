import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Settings, Mic, MicOff } from "lucide-react";
import { useState } from "react";

interface VoiceControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  isConnected: boolean;
  voicesMuted: boolean;
  onMuteAllVoices: () => void;
  onUnmuteVoices: () => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

const VOICE_OPTIONS = [
  { id: "nBwlhHY26CjUa3imYVjB", name: "Custom Voice" },
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria (Female)" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger (Male)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Female)" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura (Female)" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Male)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Male)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (Male)" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River (Neutral)" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (Male)" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (Female)" }
];

export const VoiceControls = ({
  volume,
  onVolumeChange,
  onStartListening,
  onStopListening,
  isListening,
  isConnected,
  voicesMuted,
  onMuteAllVoices,
  onUnmuteVoices,
  selectedVoice,
  onVoiceChange
}: VoiceControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Voice Controls</span>
            <span className="sm:hidden">Voice</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 sm:space-y-4">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  {volume === 0 ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                  Volume
                </label>
                <span className="text-xs sm:text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={1}
                min={0}
                step={0.1}
                className="w-full h-8 sm:h-auto touch-manipulation"
              />
            </div>

            {/* Microphone Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium">Microphone</label>
              <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={isListening ? onStopListening : onStartListening}
                disabled={!isConnected}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${isListening ? "bg-speaking hover:bg-speaking/90" : ""}`}
              >
                {isListening ? (
                  <>
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Listening</span>
                    <span className="sm:hidden">On</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Start Listening</span>
                    <span className="sm:hidden">Start</span>
                  </>
                )}
              </Button>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={onVoiceChange}>
                <SelectTrigger className="h-8 sm:h-auto text-xs sm:text-sm">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="text-xs sm:text-sm">
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Mute Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium">System Voices</label>
              <Button
                variant="outline"
                size="sm"
                onClick={voicesMuted ? onUnmuteVoices : onMuteAllVoices}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                {voicesMuted ? "🔇 Muted" : "🔊 Active"}
              </Button>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span>Status:</span>
              <span className={`font-medium ${isConnected ? "text-teacher" : "text-muted-foreground"}`}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};