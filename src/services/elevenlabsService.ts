import { supabase } from "@/integrations/supabase/client";

class ElevenLabsService {
  async speak(text: string, voiceId: string = "9BWtsMINqrJLrRacOk9x"): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: voiceId }
      });

      if (error) {
        throw new Error(`ElevenLabs service error: ${error.message}`);
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to audio and play
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);

      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('ElevenLabs speech error:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    return true;
  }

  stopSpeaking() {
    // Not implemented for this basic version
  }

  setVolume(volume: number) {
    // Not implemented for this basic version
  }

  setRate(rate: number) {
    // Not implemented for this basic version
  }
}

export { ElevenLabsService };