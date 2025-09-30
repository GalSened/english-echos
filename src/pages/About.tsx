import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, MessageSquare, Target, TrendingUp, Lock, Zap, Heart } from "lucide-react";

export default function About() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6" />
                <h1 className="text-2xl font-bold">About SpeakEng</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to SpeakEng</CardTitle>
                <CardDescription className="text-lg">
                  Your AI-powered English conversation partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  SpeakEng helps you improve your English speaking skills through natural conversations
                  with an AI teacher. Practice anytime, anywhere, with instant feedback and comprehensive
                  analysis of your progress.
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Natural Conversations</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Engage in realistic dialogues on topics you choose. The AI adapts to your level
                      and interests for meaningful practice.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Real-time Corrections</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get instant feedback on grammar, vocabulary, pronunciation, and more.
                      Learn from your mistakes as you speak.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Progress Analytics</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track your improvement with detailed analytics. See your practice streak,
                      error patterns, and conversation history.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Privacy First</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All your data stays on your device. Practice privately without worrying
                      about your conversations being stored in the cloud.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Use */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use SpeakEng</CardTitle>
                <CardDescription>Get started in three simple steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Set Your Level</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose your English proficiency level (Beginner, Intermediate, or Advanced)
                        so the AI can adapt to your needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Pick a Topic</h4>
                      <p className="text-sm text-muted-foreground">
                        Select a conversation topic that interests you, or let the AI suggest one.
                        Topics range from everyday situations to professional discussions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">Start Speaking</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the microphone button to speak, or type your messages. The AI will
                        respond naturally and provide helpful corrections along the way.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Best Results */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong>Practice regularly:</strong> Daily 10-15 minute sessions are more
                      effective than occasional long practices.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong>Use a quiet environment:</strong> For best speech recognition,
                      practice in a quiet space with minimal background noise.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong>Review corrections:</strong> Take time to understand error feedback
                      and try to avoid repeating the same mistakes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong>Challenge yourself:</strong> Don't be afraid to try advanced topics
                      or complex sentences. Making mistakes is part of learning!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <strong>Check your analytics:</strong> Review your progress regularly to
                      identify patterns and areas for improvement.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Browser Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    SpeakEng works best on modern browsers with Web Speech API support:
                    Chrome, Edge, Safari, and Opera. Firefox has limited speech recognition support.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Microphone Permissions</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll need to grant microphone access for voice input. Your audio is processed
                    locally by your browser's speech recognition engine.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Offline Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Once installed as a PWA (Progressive Web App), you can use some features offline.
                    AI responses require an internet connection.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Built With
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  SpeakEng is built with React, TypeScript, Tailwind CSS, and powered by
                  Web Speech API for voice recognition and text-to-speech. Special thanks to
                  the open-source community for making this project possible.
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Version:</strong> 1.0.0
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>License:</strong> Open Source
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}