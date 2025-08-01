interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    console.log('Analytics event:', analyticsEvent);

    // Store in localStorage for offline capability
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      storedEvents.push(analyticsEvent);
      
      // Keep only last 100 events
      if (storedEvents.length > 100) {
        storedEvents.splice(0, storedEvents.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getSessionStats() {
    return {
      sessionId: this.sessionId,
      eventCount: this.events.length,
      startTime: this.events[0]?.timestamp,
      endTime: this.events[this.events.length - 1]?.timestamp,
    };
  }

  // Track common app events
  trackConversationStart(topic: string, userLevel: string) {
    this.track('conversation_started', { topic, userLevel });
  }

  trackConversationEnd(duration: number, messageCount: number) {
    this.track('conversation_ended', { duration, messageCount });
  }

  trackSpeechRecognitionUsed(success: boolean, error?: string) {
    this.track('speech_recognition_used', { success, error });
  }

  trackTextToSpeechUsed(service: string, success: boolean) {
    this.track('text_to_speech_used', { service, success });
  }

  trackError(error: string, context: string) {
    this.track('error_occurred', { error, context });
  }

  trackUserInteraction(interaction: string, details?: Record<string, any>) {
    this.track('user_interaction', { interaction, ...details });
  }
}

export const analytics = new Analytics();
