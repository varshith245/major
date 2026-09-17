import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  FileText, 
  Volume2, 
  VolumeX, 
  Loader2, 
  User, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Scheme, ChatMessage } from '../types';
import { sendChatMessageApi } from '../api';
import { t } from '../i18n';

interface ChatAssistantProps {
  language: string;
  onSelectScheme: (scheme: Scheme) => void;
  onNavigateToChecklist: (schemeId: string) => void;
  onNavigateToEligibility: () => void;
  initialQuery?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  language,
  onSelectScheme,
  onNavigateToChecklist,
  onNavigateToEligibility,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Welcome Message based on selected language
    const welcomeText = language === 'kn'
      ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ eGovSeva AI ಸಾರ್ವಜನಿಕ ಸೇವಾ ಸಹಾಯಕ. ಕೃಷಿ, ಆರೋಗ್ಯ, ವಸತಿ, ಶಿಕ್ಷಣ ಮತ್ತು ಮಹಿಳಾ ಕಲ್ಯಾಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದ 30+ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.'
      : language === 'hi'
      ? 'नमस्ते! मैं आपका eGovSeva AI लोक सेवा सहायक हूँ। आप कृषि, स्वास्थ्य, आवास, शिक्षा या महिला कल्याण से संबंधित 30+ सरकारी योजनाओं के बारे में पूछ सकते हैं।'
      : 'Hello! I am your eGovSeva AI Public Service Assistant. I can help you find verified Central & Karnataka State government welfare schemes, check eligibility criteria, and generate required document checklists. How can I assist you today?';

    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: [
          'Am I eligible for PM-KISAN?',
          'Karnataka Yuva Nidhi Scheme benefits',
          'Ayushman Bharat hospital coverage',
          'Gruha Lakshmi ₹2000 assistance'
        ]
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const responseData = await sendChatMessageApi(query, language, history);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseData.response || responseData.answer || 'Here is the scheme guidance for your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matched_schemes: responseData.matched_schemes || [],
        suggested_actions: responseData.suggested_actions || []
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'I am experiencing a temporary connection issue. Please check your internet connection or verify your query on official portal.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col h-[750px]">
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-800 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  eGovSeva AI Multilingual Assistant
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Natural Language Conversational Guidance in English, हिन्दी & ಕನ್ನಡ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToEligibility}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-crimson-700/80 hover:bg-crimson-600 text-white text-xs font-bold transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Eligibility Wizard</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-crimson-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-crimson-700 text-white rounded-tr-xs shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs space-y-3'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => handleTextToSpeech(msg.text)}
                      title="Read Aloud (Voice Output)"
                      className="text-slate-400 hover:text-crimson-600 p-1 transition flex-shrink-0 cursor-pointer"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-crimson-600 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Matched Scheme Cards if returned by AI Engine */}
                {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Recommended Schemes:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.matched_schemes.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-crimson-300 transition text-left space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="badge badge-crimson text-[9px] font-bold">{s.level}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{s.category}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{s.name}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{s.description}</p>
                          <div className="pt-1 flex items-center justify-between gap-2">
                            <button
                              onClick={() => onSelectScheme(s)}
                              className="text-crimson-700 hover:text-crimson-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onNavigateToChecklist(s.id)}
                              className="text-slate-600 hover:text-slate-900 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Documents</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                    {msg.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 text-xs font-bold border border-crimson-200 transition cursor-pointer"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-right font-medium opacity-60">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-crimson-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-xs text-xs flex items-center gap-2 text-slate-600 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-crimson-600" />
                <span>AI Assistant is evaluating 30+ scheme policy rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question in English, हिन्दी or ಕನ್ನಡ..."
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-crimson-600 outline-none font-medium"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            title="Speak your query (Speech to Text)"
            className={`p-3 rounded-xl transition cursor-pointer ${
              isListening ? 'bg-crimson-600 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="btn-primary py-3 px-5 text-xs font-bold disabled:bg-slate-300 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
