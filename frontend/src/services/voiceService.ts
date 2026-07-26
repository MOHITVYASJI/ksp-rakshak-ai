import { AgentChatMessage } from '@shared/types';

export interface VoiceCommandAction {
  type: 'NAVIGATE' | 'ACTION' | 'AI_QUERY';
  target?: string;
  query?: string;
}

export class VoiceInteractionService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;

  /**
   * Parses spoken text for hands-free voice commands before submitting to AI Engine.
   */
  public parseVoiceCommand(transcript: string): VoiceCommandAction {
    const text = transcript.toLowerCase().trim();

    if (text.includes('open case') || text.includes('show case') || text.includes('view case')) {
      return { type: 'NAVIGATE', target: 'cases' };
    }
    if (text.includes('show graph') || text.includes('network graph') || text.includes('suspect network') || text.includes('related suspects')) {
      return { type: 'NAVIGATE', target: 'graph' };
    }
    if (text.includes('show map') || text.includes('gis map') || text.includes('hotspots')) {
      return { type: 'NAVIGATE', target: 'map' };
    }
    if (text.includes('show analytics') || text.includes('crime analytics')) {
      return { type: 'NAVIGATE', target: 'analytics' };
    }
    if (text.includes('stop speaking') || text.includes('be quiet') || text.includes('stop audio')) {
      this.stopSpeaking();
      return { type: 'ACTION', target: 'STOP_AUDIO' };
    }
    if (text.includes('clear conversation') || text.includes('clear chat')) {
      return { type: 'ACTION', target: 'CLEAR_CHAT' };
    }

    // Default: pass query to Conversational AI Engine
    return { type: 'AI_QUERY', query: transcript };
  }

  /**
   * Speaks concise AI summary aloud in English or Kannada.
   */
  public speakSummary(text: string, isKannada: boolean = false, onEndCallback?: () => void) {
    if (!this.synth) return;

    // Stop any existing speech
    this.stopSpeaking();

    // Clean text of markdown or formatting symbols
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isKannada ? 'kn-IN' : 'en-IN';
    utterance.rate = 1.0; // Standard speaking speed
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      this.isSpeakingState = false;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Immediately stops speech synthesis playback.
   */
  public stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const voiceService = new VoiceInteractionService();
