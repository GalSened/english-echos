import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, Target, Award, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  totalPracticeTime: number;
  practiceStreak: number;
  lastPracticeDate: string | null;
  errorsByType: Record<string, number>;
  conversationsByTopic: Record<string, number>;
  weeklyActivity: number[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalConversations: 0,
    totalMessages: 0,
    totalPracticeTime: 0,
    practiceStreak: 0,
    lastPracticeDate: null,
    errorsByType: {},
    conversationsByTopic: {},
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      // Load from localStorage
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');

      // Calculate statistics
      const conversationStarts = events.filter((e: any) => e.event === 'conversation_started');
      const conversationEnds = events.filter((e: any) => e.event === 'conversation_ended');

      const totalTime = conversationEnds.reduce((sum: number, e: any) =>
        sum + (e.properties?.duration || 0), 0
      );

      const totalMsgs = conversationEnds.reduce((sum: number, e: any) =>
        sum + (e.properties?.messageCount || 0), 0
      );

      // Calculate streak
      const lastPractice = notificationSettings.lastPracticeDate;
      const streak = calculateStreak(lastPractice);

      // Error analysis (simulated for now)
      const errorsByType = {
        grammar: Math.floor(Math.random() * 20) + 5,
        vocabulary: Math.floor(Math.random() * 15) + 3,
        pronunciation: Math.floor(Math.random() * 10) + 2,
        fluency: Math.floor(Math.random() * 8) + 1,
        cultural: Math.floor(Math.random() * 5) + 1,
      };

      // Topics analysis
      const topicCounts: Record<string, number> = {};
      conversationStarts.forEach((e: any) => {
        const topic = e.properties?.topic || 'Unknown';
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });

      // Weekly activity (last 7 days)
      const weeklyActivity = calculateWeeklyActivity(events);

      setData({
        totalConversations: conversationStarts.length,
        totalMessages: totalMsgs,
        totalPracticeTime: Math.round(totalTime / 1000 / 60), // Convert to minutes
        practiceStreak: streak,
        lastPracticeDate: lastPractice,
        errorsByType,
        conversationsByTopic: topicCounts,
        weeklyActivity,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const calculateStreak = (lastPracticeDate: string | null): number => {
    if (!lastPracticeDate) return 0;

    const last = new Date(lastPracticeDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays <= 1 ? 1 : 0; // Simple streak calculation
  };

  const calculateWeeklyActivity = (events: any[]): number[] => {
    const activity = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();

    events.forEach((event: any) => {
      const eventDate = new Date(event.timestamp);
      const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 7) {
        activity[6 - diffDays]++;
      }
    });

    return activity;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const maxErrors = Math.max(...Object.values(data.errorsByType), 1);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Analytics</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalConversations}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.totalMessages} total messages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(data.totalPracticeTime)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total practice duration
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.practiceStreak} days</div>
                  <p className="text-xs text-muted-foreground">
                    Keep practicing daily!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Practice</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.lastPracticeDate
                      ? new Date(data.lastPracticeDate).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most recent session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Your practice activity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {data.weeklyActivity.map((count, index) => {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const maxCount = Math.max(...data.weeklyActivity, 1);
                    const height = (count / maxCount) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-muted rounded-t"
                             style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}>
                          <div className="w-full h-full bg-primary rounded-t" />
                        </div>
                        <span className="text-xs text-muted-foreground">{dayNames[(new Date().getDay() - 6 + index + 7) % 7]}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Error Analysis
                </CardTitle>
                <CardDescription>Areas to focus on for improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data.errorsByType).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <span className="text-sm text-muted-foreground">{count} errors</span>
                    </div>
                    <Progress value={(count / maxErrors) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Topics Practice */}
            {Object.keys(data.conversationsByTopic).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Topics Practiced
                  </CardTitle>
                  <CardDescription>Your conversation topics distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.conversationsByTopic)
                      .sort(([, a], [, b]) => b - a)
                      .map(([topic, count]) => (
                        <div key={topic} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{topic}</span>
                          <span className="text-sm text-muted-foreground">{count} conversations</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}