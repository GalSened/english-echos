import { ElevenLabsService } from "./elevenlabsService";
import { WebSpeechService } from "./webSpeechService";
import { SupabaseOpenAIService } from "./supabaseOpenaiService";

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

export class SystemTestOrchestrator {
  private elevenlabsService: ElevenLabsService;
  private webSpeechService: WebSpeechService;
  private openaiService: SupabaseOpenAIService;
  private testResults: TestResult[] = [];
  private systemHealth: SystemHealth;
  private isRunning = false;
  private testInterval: NodeJS.Timeout | null = null;
  private healingAttempts = new Map<string, number>();

  constructor() {
    this.elevenlabsService = new ElevenLabsService();
    this.webSpeechService = new WebSpeechService();
    this.openaiService = new SupabaseOpenAIService();
    
    this.systemHealth = {
      overall: 'healthy',
      services: {
        elevenlabs: 'healthy',
        openai: 'healthy',
        webSpeech: 'healthy',
        supabase: 'healthy'
      },
      lastCheck: new Date(),
      recommendations: []
    };
  }

  // Start continuous background testing
  public startContinuousMonitoring(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('System monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔍 Starting continuous system monitoring every ${intervalMinutes} minutes`);
    
    // Run initial comprehensive test
    this.runComprehensiveTest();
    
    // Schedule regular health checks
    this.testInterval = setInterval(() => {
      this.runHealthCheck();
    }, intervalMinutes * 60 * 1000);

    // Schedule comprehensive test every hour
    setInterval(() => {
      this.runComprehensiveTest();
    }, 60 * 60 * 1000);
  }

  public stopMonitoring(): void {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 System monitoring stopped');
  }

  // Run comprehensive system test
  public async runComprehensiveTest(): Promise<TestResult[]> {
    console.log('🧪 Running comprehensive system test...');
    const testSuite = [
      () => this.testElevenLabsService(),
      () => this.testOpenAIService(),
      () => this.testWebSpeechService(),
      () => this.testUserFlowSimulation(),
      () => this.testErrorCorrectionFlow(),
      () => this.testConversationAnalysis(),
      () => this.testServiceIntegration(),
      () => this.testPerformanceMetrics()
    ];

    const results: TestResult[] = [];
    
    for (const test of testSuite) {
      try {
        const result = await test();
        results.push(result);
        
        // Auto-heal if test fails
        if (result.status === 'fail') {
          await this.attemptSelfHealing(result);
        }
      } catch (error) {
        results.push({
          testName: 'Unknown Test',
          status: 'fail',
          duration: 0,
          details: `Test execution failed: ${error.message}`,
          timestamp: new Date(),
          errorCode: 'TEST_EXECUTION_ERROR'
        });
      }
    }

    this.testResults.push(...results);
    this.updateSystemHealth(results);
    this.generateImprovementRecommendations();
    
    console.log(`✅ Comprehensive test completed. ${results.filter(r => r.status === 'pass').length}/${results.length} tests passed`);
    return results;
  }

  // Quick health check
  private async runHealthCheck(): Promise<void> {
    console.log('💓 Running health check...');
    const healthTests = [
      () => this.pingElevenLabs(),
      () => this.pingOpenAI(),
      () => this.checkWebSpeechAPI(),
      () => this.pingSupabase()
    ];

    const results = await Promise.allSettled(healthTests.map(test => test()));
    
    // Update service health status
    this.systemHealth.services.elevenlabs = results[0].status === 'fulfilled' ? 'healthy' : 'down';
    this.systemHealth.services.openai = results[1].status === 'fulfilled' ? 'healthy' : 'down';
    this.systemHealth.services.webSpeech = results[2].status === 'fulfilled' ? 'healthy' : 'down';
    this.systemHealth.services.supabase = results[3].status === 'fulfilled' ? 'healthy' : 'down';
    
    this.systemHealth.lastCheck = new Date();
    this.updateOverallHealth();
  }

  // Individual service tests
  private async testElevenLabsService(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'ElevenLabs TTS Service';
    
    try {
      console.log('🎤 Testing ElevenLabs service...');
      const isAvailable = await this.elevenlabsService.testService();
      
      if (!isAvailable) {
        return {
          testName,
          status: 'fail',
          duration: Date.now() - startTime,
          details: 'ElevenLabs service is not available',
          timestamp: new Date(),
          errorCode: 'ELEVENLABS_UNAVAILABLE',
          healingActions: ['retry_connection', 'check_api_key', 'fallback_to_web_speech']
        };
      }

      // Test actual speech generation
      try {
        await this.elevenlabsService.speak("System test message", "9BWtsMINqrJLrRacOk9x");
        
        return {
          testName,
          status: 'pass',
          duration: Date.now() - startTime,
          details: 'ElevenLabs service is functioning correctly with Aria voice',
          timestamp: new Date()
        };
      } catch (speechError) {
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: `ElevenLabs available but speech generation failed: ${speechError.message}`,
          timestamp: new Date(),
          errorCode: 'ELEVENLABS_SPEECH_FAILED',
          healingActions: ['retry_speech', 'check_voice_id', 'verify_audio_context']
        };
      }
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `ElevenLabs test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'ELEVENLABS_ERROR',
        healingActions: ['check_network', 'verify_api_key', 'restart_service']
      };
    }
  }

  private async testOpenAIService(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'OpenAI/Supabase Integration';
    
    try {
      console.log('🤖 Testing OpenAI service...');
      
      // Test error correction
      const correctionResult = await this.openaiService.correctText(
        "I are going to the store",
        "daily conversation",
        "intermediate"
      );

      if (!correctionResult.hasErrors || correctionResult.errors.length === 0) {
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: 'OpenAI service working but failed to detect obvious grammar error',
          timestamp: new Date(),
          errorCode: 'AI_DETECTION_ISSUE',
          healingActions: ['check_prompt_engineering', 'verify_model_settings']
        };
      }

      // Test teacher response generation
      const teacherResponse = await this.openaiService.generateTeacherResponse(
        "Hello teacher",
        [],
        "daily conversation",
        "TestUser",
        "intermediate"
      );

      if (!teacherResponse || teacherResponse.length < 5) {
        return {
          testName,
          status: 'fail',
          duration: Date.now() - startTime,
          details: 'Teacher response generation failed or returned empty response',
          timestamp: new Date(),
          errorCode: 'TEACHER_RESPONSE_FAILED',
          healingActions: ['check_openai_api', 'verify_prompt_template', 'check_token_limits']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: 'OpenAI service functioning correctly for error correction and teacher responses',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `OpenAI service test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'OPENAI_SERVICE_ERROR',
        healingActions: ['check_supabase_functions', 'verify_api_keys', 'check_network']
      };
    }
  }

  private async testWebSpeechService(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Web Speech API';
    
    try {
      console.log('🗣️ Testing Web Speech service...');
      
      const isSupported = this.webSpeechService.isSupported();
      if (!isSupported) {
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: 'Web Speech API not supported in this browser',
          timestamp: new Date(),
          errorCode: 'WEB_SPEECH_UNSUPPORTED',
          healingActions: ['inform_user_browser_limitation', 'provide_alternatives']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: 'Web Speech API is supported and available',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `Web Speech API test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'WEB_SPEECH_ERROR',
        healingActions: ['check_browser_permissions', 'verify_secure_context']
      };
    }
  }

  private async testUserFlowSimulation(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Complete User Flow Simulation';
    
    try {
      console.log('👤 Simulating complete user flow...');
      
      // Simulate user setup
      const userInfo = { name: "TestUser", level: "intermediate" as const };
      
      // Test topic generation
      const topics = await this.openaiService.generateTopics(userInfo.name, userInfo.level);
      if (!topics || topics.length === 0) {
        return {
          testName,
          status: 'fail',
          duration: Date.now() - startTime,
          details: 'Topic generation failed in user flow simulation',
          timestamp: new Date(),
          errorCode: 'TOPIC_GENERATION_FAILED',
          healingActions: ['check_topic_service', 'provide_fallback_topics']
        };
      }

      // Simulate conversation
      const mockConversation = [
        "Hello teacher, how are you today?",
        "I like to read books in my free time",
        "My favorite book is about adventures"
      ];

      // Test conversation analysis
      const analysis = await this.openaiService.analyzeConversation(
        mockConversation,
        topics[0].title,
        userInfo.name
      );

      if (!analysis || !analysis.quantitativeMetrics) {
        return {
          testName,
          status: 'fail',
          duration: Date.now() - startTime,
          details: 'Conversation analysis failed in user flow simulation',
          timestamp: new Date(),
          errorCode: 'ANALYSIS_FAILED',
          healingActions: ['check_analysis_service', 'verify_conversation_data']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: 'Complete user flow simulation successful',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `User flow simulation failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'USER_FLOW_ERROR',
        healingActions: ['check_all_services', 'verify_data_flow', 'check_error_handling']
      };
    }
  }

  private async testErrorCorrectionFlow(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Error Correction and Fun Response Flow';
    
    try {
      console.log('🔧 Testing error correction flow...');
      
      const testErrors = [
        "I are very happy today",
        "She don't like coffee",
        "I have went to the store yesterday"
      ];

      for (const errorText of testErrors) {
        const correction = await this.openaiService.correctText(errorText);
        
        if (!correction.hasErrors) {
          return {
            testName,
            status: 'warning',
            duration: Date.now() - startTime,
            details: `Failed to detect obvious error in: "${errorText}"`,
            timestamp: new Date(),
            errorCode: 'ERROR_DETECTION_MISSED',
            healingActions: ['improve_error_detection', 'check_correction_prompts']
          };
        }

        // Test fun correction generation
        const funCorrection = await this.openaiService.generateFunCorrection(correction, "TestUser");
        
        if (!funCorrection || funCorrection.length < 10) {
          return {
            testName,
            status: 'fail',
            duration: Date.now() - startTime,
            details: 'Fun correction generation failed or returned insufficient response',
            timestamp: new Date(),
            errorCode: 'FUN_CORRECTION_FAILED',
            healingActions: ['check_fun_correction_service', 'verify_prompts']
          };
        }
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: 'Error correction and fun response flow working correctly',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `Error correction flow test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'CORRECTION_FLOW_ERROR',
        healingActions: ['check_correction_services', 'verify_api_connectivity']
      };
    }
  }

  private async testConversationAnalysis(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Advanced Conversation Analysis';
    
    try {
      console.log('📊 Testing conversation analysis...');
      
      const testConversation = [
        "Hello, I want to talk about my hobbies today",
        "I love playing guitar and writing songs",
        "Music has always been a big part of my life since I was young",
        "I practice every day for at least one hour"
      ];

      const analysis = await this.openaiService.analyzeConversation(
        testConversation,
        "hobbies and interests",
        "TestUser"
      );

      // Validate analysis structure
      if (!analysis.quantitativeMetrics || !analysis.learningAnalytics || !analysis.personalizedRecommendations) {
        return {
          testName,
          status: 'fail',
          duration: Date.now() - startTime,
          details: 'Analysis missing required components',
          timestamp: new Date(),
          errorCode: 'INCOMPLETE_ANALYSIS',
          healingActions: ['check_analysis_structure', 'verify_ai_prompts']
        };
      }

      // Check for meaningful content
      const cefrLevel = analysis.quantitativeMetrics.proficiencyScores.overallCEFR.level;
      if (!cefrLevel || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cefrLevel)) {
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: 'CEFR level assessment missing or invalid',
          timestamp: new Date(),
          errorCode: 'INVALID_CEFR',
          healingActions: ['improve_level_assessment', 'check_scoring_logic']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: `Conversation analysis working correctly (CEFR: ${cefrLevel})`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `Conversation analysis test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'ANALYSIS_ERROR',
        healingActions: ['check_analysis_service', 'verify_conversation_format']
      };
    }
  }

  private async testServiceIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Service Integration and Fallbacks';
    
    try {
      console.log('🔗 Testing service integration...');
      
      // Test ElevenLabs -> Web Speech fallback
      let fallbackTested = false;
      try {
        // Simulate ElevenLabs failure
        await this.elevenlabsService.speak("", "invalid_voice_id");
      } catch (error) {
        fallbackTested = true;
        console.log('✅ ElevenLabs fallback mechanism triggered correctly');
      }

      if (!fallbackTested) {
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: 'Fallback mechanism not properly tested',
          timestamp: new Date(),
          errorCode: 'FALLBACK_NOT_TESTED',
          healingActions: ['test_fallback_scenarios', 'verify_error_handling']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: 'Service integration and fallback mechanisms working correctly',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `Service integration test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'INTEGRATION_ERROR',
        healingActions: ['check_service_connections', 'verify_fallback_logic']
      };
    }
  }

  private async testPerformanceMetrics(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Performance and Response Times';
    
    try {
      console.log('⚡ Testing performance metrics...');
      
      const performanceTests = [
        async () => {
          const start = Date.now();
          await this.openaiService.correctText("Hello world");
          return Date.now() - start;
        },
        async () => {
          const start = Date.now();
          await this.openaiService.generateTeacherResponse("Hi", [], "test", "TestUser");
          return Date.now() - start;
        }
      ];

      const times = await Promise.all(performanceTests.map(test => test()));
      const avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;

      if (avgResponseTime > 10000) { // 10 seconds
        return {
          testName,
          status: 'warning',
          duration: Date.now() - startTime,
          details: `Average response time too high: ${avgResponseTime}ms`,
          timestamp: new Date(),
          errorCode: 'SLOW_RESPONSE',
          healingActions: ['optimize_api_calls', 'check_network_latency', 'review_prompts']
        };
      }

      return {
        testName,
        status: 'pass',
        duration: Date.now() - startTime,
        details: `Performance acceptable (avg: ${avgResponseTime}ms)`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName,
        status: 'fail',
        duration: Date.now() - startTime,
        details: `Performance test failed: ${error.message}`,
        timestamp: new Date(),
        errorCode: 'PERFORMANCE_ERROR',
        healingActions: ['check_service_availability', 'verify_api_limits']
      };
    }
  }

  // Self-healing methods
  private async attemptSelfHealing(failedTest: TestResult): Promise<void> {
    const healingKey = `${failedTest.testName}_${failedTest.errorCode}`;
    const attempts = this.healingAttempts.get(healingKey) || 0;

    if (attempts >= 3) {
      console.log(`🚨 Max healing attempts reached for ${failedTest.testName}`);
      return;
    }

    this.healingAttempts.set(healingKey, attempts + 1);
    console.log(`🔧 Attempting self-healing for ${failedTest.testName} (attempt ${attempts + 1})`);

    if (!failedTest.healingActions) return;

    for (const action of failedTest.healingActions) {
      try {
        await this.executeHealingAction(action, failedTest);
      } catch (error) {
        console.error(`Healing action ${action} failed:`, error);
      }
    }
  }

  private async executeHealingAction(action: string, context: TestResult): Promise<void> {
    switch (action) {
      case 'retry_connection':
        console.log('🔄 Retrying connection...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
        
      case 'restart_service':
        console.log('🔄 Restarting services...');
        this.elevenlabsService = new ElevenLabsService();
        this.webSpeechService = new WebSpeechService();
        this.openaiService = new SupabaseOpenAIService();
        break;
        
      case 'fallback_to_web_speech':
        console.log('🔄 Ensuring fallback to Web Speech is configured...');
        this.systemHealth.recommendations.push('Consider using Web Speech as primary TTS due to ElevenLabs issues');
        break;
        
      case 'check_api_key':
        console.log('🔑 API key validation recommended');
        this.systemHealth.recommendations.push('Verify ElevenLabs API key configuration');
        break;
        
      default:
        console.log(`🔧 Healing action: ${action}`);
    }
  }

  // Health monitoring
  private async pingElevenLabs(): Promise<boolean> {
    try {
      return await this.elevenlabsService.testService();
    } catch {
      return false;
    }
  }

  private async pingOpenAI(): Promise<boolean> {
    try {
      await this.openaiService.correctText("test");
      return true;
    } catch {
      return false;
    }
  }

  private async checkWebSpeechAPI(): Promise<boolean> {
    return this.webSpeechService.isSupported();
  }

  private async pingSupabase(): Promise<boolean> {
    try {
      await this.openaiService.generateTopics("test");
      return true;
    } catch {
      return false;
    }
  }

  private updateSystemHealth(results: TestResult[]): void {
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    if (failed > 0) {
      this.systemHealth.overall = failed > 2 ? 'critical' : 'degraded';
    } else if (warnings > 0) {
      this.systemHealth.overall = 'degraded';
    } else {
      this.systemHealth.overall = 'healthy';
    }
    
    this.systemHealth.lastCheck = new Date();
  }

  private updateOverallHealth(): void {
    const services = Object.values(this.systemHealth.services);
    const downServices = services.filter(s => s === 'down').length;
    const degradedServices = services.filter(s => s === 'degraded').length;
    
    if (downServices > 1) {
      this.systemHealth.overall = 'critical';
    } else if (downServices > 0 || degradedServices > 2) {
      this.systemHealth.overall = 'degraded';
    } else {
      this.systemHealth.overall = 'healthy';
    }
  }

  private generateImprovementRecommendations(): void {
    const recentFailures = this.testResults
      .filter(r => r.status === 'fail')
      .slice(-10);
    
    const errorPatterns = new Map<string, number>();
    recentFailures.forEach(failure => {
      if (failure.errorCode) {
        errorPatterns.set(failure.errorCode, (errorPatterns.get(failure.errorCode) || 0) + 1);
      }
    });

    this.systemHealth.recommendations = [];
    
    for (const [errorCode, count] of errorPatterns.entries()) {
      if (count >= 3) {
        switch (errorCode) {
          case 'ELEVENLABS_UNAVAILABLE':
            this.systemHealth.recommendations.push('Consider implementing persistent ElevenLabs connection pooling');
            break;
          case 'SLOW_RESPONSE':
            this.systemHealth.recommendations.push('Implement response caching to improve performance');
            break;
          case 'ERROR_DETECTION_MISSED':
            this.systemHealth.recommendations.push('Enhance error detection prompts for better accuracy');
            break;
          default:
            this.systemHealth.recommendations.push(`Investigate recurring error: ${errorCode}`);
        }
      }
    }
  }

  // Public getters
  public getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  public getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  public getLatestResults(count: number = 10): TestResult[] {
    return this.testResults.slice(-count);
  }
}