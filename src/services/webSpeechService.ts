// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class WebSpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: any = null;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private volume: number = 0.7;
  private rate: number = 0.9;
  private pitch: number = 1;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeVoice();
    this.initializeRecognition();
  }

  private initializeVoice() {
    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      // Prefer English female voices for teacher
      const preferredVoices = voices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
      );
      
      this.currentVoice = preferredVoices[0] || voices.find(voice => voice.lang.includes('en')) || voices[0];
    };

    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.synthesis.addEventListener('voiceschanged', setVoice);
    }
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.currentVoice;
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate: number) {
    this.rate = Math.max(0.1, Math.min(2, rate));
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended without result
      };

      this.recognition.start();
    });
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported(): boolean {
    return !!(this.synthesis && this.recognition);
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(voice => voice.lang.includes('en'));
  }

  setVoice(voiceName: string) {
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      this.currentVoice = voice;
    }
  }
}

export { WebSpeechService };