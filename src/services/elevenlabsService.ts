import { supabase } from "@/integrations/supabase/client";

class ElevenLabsService {
  async speak(text: string, voiceId: string = "9BWtsMINqrJLrRacOk9x"): Promise<void> {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for speech generation');
    }
    
    if (text.length > 5000) {
      throw new Error('Text too long for speech generation');
    }

    try {
      console.log('ElevenLabs: Starting speech generation for:', text.substring(0, 50) + '...');
      
      // Add timeout for the request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('ElevenLabs request timeout')), 30000)
      );
      
      const requestPromise = supabase.functions.invoke('text-to-speech', {
        body: { text: text.trim(), voice: voiceId }
      });
      
      const { data, error } = await Promise.race([requestPromise, timeoutPromise]) as any;

      if (error) {
        console.error('ElevenLabs service error:', error);
        throw new Error(`ElevenLabs service error: ${error.message}`);
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received from ElevenLabs');
      }

      console.log('ElevenLabs: Audio content received, playing...');
      
      // Convert base64 to audio and play with validation
      let binaryString: string;
      try {
        binaryString = atob(data.audioContent);
      } catch (decodeError) {
        throw new Error('Invalid audio content encoding');
      }
      
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Validate audio data size
      if (bytes.length === 0) {
        throw new Error('Empty audio data received');
      }

      // Create blob and audio element
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any current audio
      this.stopSpeaking();
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = Math.max(0, Math.min(1, this.volume || 0.7));
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio element not created'));
          return;
        }
        
        // Set up timeout for audio playback
        const playbackTimeout = setTimeout(() => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(new Error('Audio playback timeout'));
        }, 60000);
        
        this.currentAudio.onended = () => {
          clearTimeout(playbackTimeout);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.log('ElevenLabs: Audio playback completed');
          resolve();
        };
        
        this.currentAudio.onerror = (e) => {
          clearTimeout(playbackTimeout);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.error('ElevenLabs: Audio playback error:', e);
          reject(new Error('Audio playback failed'));
        };
        
        this.currentAudio.onloadeddata = () => {
          console.log('ElevenLabs: Audio loaded, starting playback');
        };
        
        this.currentAudio.play().catch((playError) => {
          clearTimeout(playbackTimeout);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.error('ElevenLabs: Audio play error:', playError);
          reject(new Error('Failed to play audio'));
        });
      });
    } catch (error) {
      console.error('ElevenLabs speech error:', error);
      throw error;
    }
  }

  private volume: number = 0.7;

  private currentAudio: HTMLAudioElement | null = null;

  isSupported(): boolean {
    return true;
  }

  stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      const audioUrl = this.currentAudio.src;
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      this.currentAudio = null;
      console.log('ElevenLabs: Speech stopped');
    }
  }

  setVolume(volume: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setRate(rate: number) {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = Math.max(0.5, Math.min(2, rate));
    }
  }

  // Background testing method - for debugging only, no audio output
  async testService(): Promise<boolean> {
    try {
      console.log('ElevenLabs: Testing service availability...');
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: "test", voice: "9BWtsMINqrJLrRacOk9x" }
      });
      
      if (error) {
        console.log('ElevenLabs: Service test failed -', error.message);
        return false;
      }
      
      if (data?.audioContent) {
        console.log('ElevenLabs: Service test passed - audio content received');
        return true;
      }
      
      console.log('ElevenLabs: Service test failed - no audio content');
      return false;
    } catch (error) {
      console.log('ElevenLabs: Service test error -', error);
      return false;
    }
  }
}

export { ElevenLabsService };