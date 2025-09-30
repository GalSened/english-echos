import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Volume2, Mic, Download, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { WebSpeechService } from "@/services/webSpeechService";

export default function Settings() {
  const { toast } = useToast();
  const [speechService] = useState(() => new WebSpeechService());

  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(85);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('voiceSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVolume(settings.volume || 80);
      setRate(settings.rate || 85);
      setSelectedVoice(settings.voice || "");
      setAutoPlay(settings.autoPlay !== false);
    }

    // Load available voices
    const voices = speechService.getAvailableVoices();
    setAvailableVoices(voices);

    // If no voice selected, select the first one
    if (!selectedVoice && voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      volume,
      rate,
      voice: selectedVoice,
      autoPlay,
    };

    localStorage.setItem('voiceSettings', JSON.stringify(settings));

    // Apply settings
    speechService.setVolume(volume / 100);
    speechService.setRate(rate / 100);
    if (selectedVoice) {
      speechService.setVoice(selectedVoice);
    }

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const testVoice = () => {
    speechService.setVolume(volume / 100);
    speechService.setRate(rate / 100);
    if (selectedVoice) {
      speechService.setVoice(selectedVoice);
    }

    speechService.speak("Hello! This is how I will sound during conversations. How do you like my voice?");
  };

  const exportData = () => {
    try {
      const data = {
        analytics: localStorage.getItem('analytics_events'),
        notifications: localStorage.getItem('notificationSettings'),
        voice: localStorage.getItem('voiceSettings'),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speakeng-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearData = () => {
    if (!confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      return;
    }

    try {
      localStorage.removeItem('analytics_events');
      localStorage.removeItem('notificationSettings');

      toast({
        title: "Data Cleared",
        description: "All your practice data has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Voice Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Settings
                </CardTitle>
                <CardDescription>
                  Customize how the AI teacher speaks to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <span className="text-sm text-muted-foreground">{volume}%</span>
                  </div>
                  <Slider
                    id="volume"
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate">Speaking Speed</Label>
                    <span className="text-sm text-muted-foreground">{rate}%</span>
                  </div>
                  <Slider
                    id="rate"
                    value={[rate]}
                    onValueChange={(value) => setRate(value[0])}
                    min={50}
                    max={150}
                    step={5}
                  />
                </div>

                {/* Auto-play Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoplay">Auto-play Responses</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically speak AI responses
                    </p>
                  </div>
                  <Switch
                    id="autoplay"
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={testVoice} variant="outline">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Voice
                  </Button>
                  <Button onClick={saveSettings}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Speech Recognition Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Speech Recognition
                </CardTitle>
                <CardDescription>
                  Configure voice input settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    Speech recognition uses your browser's built-in capabilities.
                    Make sure microphone permissions are enabled in your browser settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Supported Languages</p>
                  <p className="text-sm text-muted-foreground">
                    Currently: English (US)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or clear your practice data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button onClick={clearData} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Privacy Notice
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All your data is stored locally on your device. No data is sent to external servers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About SpeakEng</CardTitle>
                <CardDescription>Version 1.0.0</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  AI-powered English conversation practice with real-time feedback and comprehensive analysis.
                </p>
                <p className="text-sm text-muted-foreground">
                  Built with React, TypeScript, and Web Speech API.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}