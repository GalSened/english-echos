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
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Voice Controls
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  Volume
                </label>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Microphone Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Microphone</label>
              <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={isListening ? onStopListening : onStartListening}
                disabled={!isConnected}
                className={isListening ? "bg-speaking hover:bg-speaking/90" : ""}
              >
                {isListening ? (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Listening
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={onVoiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Mute Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">System Voices</label>
              <Button
                variant="outline"
                size="sm"
                onClick={voicesMuted ? onUnmuteVoices : onMuteAllVoices}
              >
                {voicesMuted ? "🔇 Muted" : "🔊 Active"}
              </Button>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between text-sm">
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