import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, Volume2, Square, CornerDownLeft } from 'lucide-react';
import { AgentChatMessage } from '@shared/types';
import { CitationBadge } from './CitationBadge';
import { voiceService } from '../../services/voiceService';
import { VoiceWaveform } from '../voice/VoiceWaveform';

interface ChatTerminalProps {
  messages: AgentChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenCaseModal: (firId: string) => void;
  kannadaMode: boolean;
  onVoiceCommandNavigate?: (target: string) => void;
}

export const ChatTerminal: React.FC<ChatTerminalProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onOpenCaseModal,
  kannadaMode,
  onVoiceCommandNavigate
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStage, setVoiceStage] = useState<'LISTENING' | 'TRANSCRIBING' | 'SEARCHING' | 'VERIFYING' | 'READY'>('READY');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-speak latest AI summary when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'AGENT' && lastMsg.text) {
        setCurrentlySpeakingId(lastMsg.id);
        const textToRead = kannadaMode && lastMsg.kannadaText ? lastMsg.kannadaText : lastMsg.text;
        voiceService.speakSummary(textToRead, kannadaMode, () => setCurrentlySpeakingId(null));
      }
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Check for hands-free voice commands
    const command = voiceService.parseVoiceCommand(inputText);
    if (command.type === 'NAVIGATE' && onVoiceCommandNavigate && command.target) {
      onVoiceCommandNavigate(command.target);
    } else if (command.type === 'AI_QUERY' && command.query) {
      onSendMessage(command.query);
    }

    setInputText('');
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceStage('READY');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = kannadaMode ? 'kn-IN' : 'en-IN';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStage('LISTENING');
      };

      recognition.onresult = (event: any) => {
        setVoiceStage('TRANSCRIBING');
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInputText(transcript);

        if (event.results[0].isFinal) {
          setIsListening(false);
          setVoiceStage('SEARCHING');
          const command = voiceService.parseVoiceCommand(transcript);
          if (command.type === 'NAVIGATE' && onVoiceCommandNavigate && command.target) {
            onVoiceCommandNavigate(command.target);
          } else if (command.type === 'AI_QUERY' && command.query) {
            onSendMessage(command.query);
          }
          setInputText('');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStage('READY');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      setVoiceStage('READY');
    }
  };

  const toggleSpeechPlayback = (msgId: string, text: string, kannadaText?: string) => {
    if (currentlySpeakingId === msgId) {
      voiceService.stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      setCurrentlySpeakingId(msgId);
      const textToRead = kannadaMode && kannadaText ? kannadaText : text;
      voiceService.speakSummary(textToRead, kannadaMode, () => setCurrentlySpeakingId(null));
    }
  };

  const samplePrompts = [
    "Show chain snatching cases in Mysuru with suspect network",
    "Peenya nalli last 6 months bike theft MO mathu suspect details thori",
    "Find repeat offenders using IMEI 8649201948210",
    "Which station has highest vehicle theft?"
  ];

  const demoScenarios = [
    { title: "Peenya Burglary Gang", query: "Peenya nalli last 6 months burglary MO mathu suspect details thori", badge: "Live MO Match" },
    { title: "Mysuru Chain Snatching", query: "Show chain snatching cases in Mysuru with suspect network", badge: "Graph Link" },
    { title: "Cyber UPI Mule Ring", query: "Find cyber UPI fraud mule bank accounts and linked IMEIs", badge: "Digital Evidence" },
    { title: "Statewide Theft Hotspots", query: "Which station has highest vehicle theft in Bengaluru and Mysuru?", badge: "Spatial Analytics" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-police-dark relative overflow-hidden select-none">
      {/* Voice Stage Overlay Banner */}
      {isListening && (
        <div className="p-4 border-b border-police-border bg-police-card/90">
          <VoiceWaveform stage={voiceStage} isListening={isListening} transcriptPreview={inputText} />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-police-accent/10 border border-police-highlight/30 flex items-center justify-center text-police-highlight shadow-xl shadow-police-accent/10 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-police-text">KSP RAKSHAK-AI Hands-Free Voice Assistant</h2>
              <p className="text-xs text-police-muted mt-1 leading-relaxed">
                Speak or type in Kannada/English. Query CCTNS records, suspect vehicle links, and Modus Operandi (MO) patterns.
              </p>
              {/* Quick Demo Mode Scenario Chips */}
              <div className="space-y-2 w-full pt-2">
                <div className="text-[10px] font-mono font-bold text-police-gold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-police-gold" />
                  HACKATHON LIVE DEMO PRESETS (1-CLICK EXECUTION)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  {demoScenarios.map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(demo.query)}
                      className="glass-panel-interactive p-3 rounded-xl text-left text-xs text-police-text hover:text-police-highlight border border-police-border/80 flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-police-text group-hover:text-police-highlight flex items-center gap-1.5">
                          {demo.title}
                          <span className="px-1.5 py-0.5 text-[9px] bg-police-accent/20 text-police-highlight rounded font-mono font-normal">
                            {demo.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-police-muted truncate max-w-[200px] mt-0.5">{demo.query}</div>
                      </div>
                      <CornerDownLeft className="w-3.5 h-3.5 text-police-muted group-hover:text-police-highlight transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
              msg.sender === 'USER'
                ? 'bg-police-accent text-white font-medium shadow-lg shadow-police-accent/20 rounded-tr-none'
                : 'glass-panel text-police-text border border-police-border/90 rounded-tl-none shadow-xl'
            }`}>
              <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/10 text-[10px] font-mono text-police-muted">
                <span className="font-semibold text-police-highlight uppercase tracking-wider">
                  {msg.sender === 'USER' ? 'OFFICER VOICE / TEXT QUERY' : 'KSP RAKSHAK-AI ENGINE'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.sender === 'AGENT' && (
                    <button
                      onClick={() => toggleSpeechPlayback(msg.id, msg.text, msg.kannadaText)}
                      className="p-1 hover:bg-police-border/50 rounded text-police-muted hover:text-police-highlight transition"
                      title="Read Summary Aloud"
                    >
                      {currentlySpeakingId === msg.id ? <Square className="w-3.5 h-3.5 text-police-danger animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-police-text">{msg.text}</p>
                {msg.kannadaText && (
                  <p className="text-xs text-police-gold mt-2 font-sans italic bg-police-gold/10 p-2 rounded-lg border border-police-gold/20">
                    {msg.kannadaText}
                  </p>
                )}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-police-border/60 space-y-2">
                  <div className="text-[10px] font-mono font-semibold text-police-muted flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="w-3 h-3 text-police-success" />
                    VERIFIED SOURCE CITATIONS ({msg.citations.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map(cit => (
                      <CitationBadge key={cit.firId} citation={cit} onClick={onOpenCaseModal} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-police-border/80 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-police-highlight border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-police-muted">
                Orchestrator Agent executing Multi-Agent query & synthesis...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Form */}
      <div className="p-4 border-t border-police-border bg-police-card/90 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto relative">
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl border text-xs flex items-center justify-center transition-all ${
              isListening
                ? 'bg-police-danger border-police-danger text-white animate-pulse shadow-lg shadow-police-danger/30'
                : 'bg-police-dark border-police-border text-police-muted hover:text-police-text'
            }`}
            title={isListening ? "Listening... Speak in Kannada or English" : "Click for Vernacular Voice Input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={kannadaMode ? "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಧ್ವನಿ/ಪಠ್ಯ ಪ್ರಶ್ನೆ ಕೇಳಿ..." : "Speak or type in English / Kannada (e.g. Peenya bike theft MO)..."}
            className="flex-1 bg-police-dark/80 border border-police-border focus:border-police-highlight rounded-xl px-4 py-3 text-xs text-police-text placeholder-police-muted focus:outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-police-accent hover:bg-police-highlight disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center shadow-lg shadow-police-accent/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
