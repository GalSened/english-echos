import { supabase } from "@/integrations/supabase/client";

class ElevenLabsService {
  async speak(text: string, voiceId: string = "9BWtsMINqrJLrRacOk9x"): Promise<void> {
    try {
      console.log('ElevenLabs: Starting speech generation for:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: voiceId }
      });

      if (error) {
        console.error('ElevenLabs service error:', error);
        throw new Error(`ElevenLabs service error: ${error.message}`);
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received from ElevenLabs');
      }

      console.log('ElevenLabs: Audio content received, playing...');
      
      // Convert base64 to audio and play
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and audio element
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any current audio
      this.stopSpeaking();
      
      this.currentAudio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('Audio element not created'));
          return;
        }
        
        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.log('ElevenLabs: Audio playback completed');
          resolve();
        };
        this.currentAudio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.error('ElevenLabs: Audio playback error:', e);
          reject(new Error('Audio playback failed'));
        };
        this.currentAudio.onloadeddata = () => {
          console.log('ElevenLabs: Audio loaded, starting playback');
        };
        
        this.currentAudio.play().catch((playError) => {
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
}

export { ElevenLabsService };