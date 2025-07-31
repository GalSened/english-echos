import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  details: string;
  timestamp: Date;
  errorCode?: string;
  healingActions?: string[];
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: {
    elevenlabs: 'healthy' | 'degraded' | 'down';
    openai: 'healthy' | 'degraded' | 'down';
    webSpeech: 'healthy' | 'degraded' | 'down';
    supabase: 'healthy' | 'degraded' | 'down';
  };
  lastCheck: Date;
  recommendations: string[];
}

interface SystemMonitorDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const SystemMonitorDashboard: React.FC<SystemMonitorDashboardProps> = ({ 
  isVisible, 
  onToggle 
}) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    services: {
      elevenlabs: 'healthy',
      openai: 'healthy',
      webSpeech: 'healthy',
      supabase: 'healthy'
    },
    lastCheck: new Date(),
    recommendations: []
  });
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [orchestrator, setOrchestrator] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the orchestrator to avoid issues
    const loadOrchestrator = async () => {
      try {
        const { SystemTestOrchestrator } = await import('../services/systemTestOrchestrator');
        const newOrchestrator = new SystemTestOrchestrator();
        setOrchestrator(newOrchestrator);
        
        // Start continuous monitoring
        newOrchestrator.startContinuousMonitoring(5);
        
        // Update dashboard every 30 seconds
        const interval = setInterval(() => {
          const health = newOrchestrator.getSystemHealth();
          const results = newOrchestrator.getLatestResults(20);
          setSystemHealth(health);
          setTestResults(results);
        }, 30000);

        return () => {
          clearInterval(interval);
          newOrchestrator.stopMonitoring();
        };
      } catch (error) {
        console.error('Failed to load system orchestrator:', error);
      }
    };

    loadOrchestrator();
  }, []);

  const runManualTest = async () => {
    if (!orchestrator || isRunningTest) return;
    
    setIsRunningTest(true);
    try {
      const results = await orchestrator.runComprehensiveTest();
      const health = orchestrator.getSystemHealth();
      setTestResults(results);
      setSystemHealth(health);
    } catch (error) {
      console.error('Manual test failed:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fail':
      case 'down':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4" />
        Show Monitor
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">System Monitor Dashboard</h1>
            <Badge className={getStatusColor(systemHealth.overall)}>
              {getStatusIcon(systemHealth.overall)}
              {systemHealth.overall.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runManualTest}
              disabled={isRunningTest}
              variant="outline"
            >
              {isRunningTest ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Run Test
            </Button>
            <Button onClick={onToggle} variant="ghost">
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Health</span>
                <Badge className={getStatusColor(systemHealth.overall)}>
                  {getStatusIcon(systemHealth.overall)}
                  {systemHealth.overall}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Service Status
                </div>
                
                {Object.entries(systemHealth.services).map(([service, status]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{service}</span>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {getStatusIcon(status)}
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground">
                Last updated: {formatTime(systemHealth.lastCheck)}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {testResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No test results yet. Tests run automatically every 5 minutes.
                    </div>
                  ) : (
                    testResults.slice().reverse().map((result, index) => (
                      <div
                        key={`${result.testName}-${result.timestamp.getTime()}-${index}`}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium text-sm">{result.testName}</span>
                            <Badge variant="outline" className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(result.timestamp)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span>Duration: {formatDuration(result.duration)}</span>
                          {result.errorCode && (
                            <span className="text-red-600">Error: {result.errorCode}</span>
                          )}
                        </div>
                        
                        {result.healingActions && result.healingActions.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium">Healing actions: </span>
                            <span className="text-blue-600">
                              {result.healingActions.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {systemHealth.recommendations.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  System Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemHealth.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Auto-healing Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Auto-Healing System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Continuous monitoring active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Self-healing enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Performance optimization active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};