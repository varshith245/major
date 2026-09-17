import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { assistantService } from '../services/assistantService';
import { ChatMessage, Scheme } from '../types';
import { t, translateCategory } from '../i18n';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Bot,
  User as UserIcon,
  Send,
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Info,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Plus
} from 'lucide-react';

const getInitialMessage = (lang: string): ChatMessage => ({
  id: 'init-msg',
  sender: 'bot',
  text: lang === 'hi'
    ? "नमस्ते! मैं सेवा (SEVA) नागरिक सहायक हूँ। आप मुझसे सरकारी योजनाओं, पात्रता नियमों, आवश्यक दस्तावेजों या आवेदन प्रक्रियाओं के बारे में पूछ सकते हैं।"
    : lang === 'kn'
    ? "ನಮಸ್ಕಾರ! ನಾನು ಸೇವಾ (SEVA) ನಾಗರಿಕ ಸಹಾಯಕ. ನೀವು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಅರ್ಹತಾ ನಿಯಮಗಳು ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಬಹುದು."
    : "Hello! I am SEVA, your civic welfare assistant. How can I help you discover schemes, check your eligibility, or generate a document checklist today?",
  timestamp: '10:00 AM',
  suggested_actions: [
    lang === 'hi' ? 'क्या मैं पीएम-किसान के पात्र हूँ?' : lang === 'kn' ? 'ನಾನು ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?' : 'Am I eligible for PM-KISAN?',
    lang === 'hi' ? 'कर्नाटक गारंटी योजनाएं' : lang === 'kn' ? 'ಕರ್ನಾಟಕ ಖಾತರಿ ಯೋಜನೆಗಳು' : 'Karnataka Guarantee Schemes',
    lang === 'hi' ? 'आयुष्मान भारत अस्पताल लाभ' : lang === 'kn' ? 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಆಸ್ಪತ್ರೆ ಪ್ರಯೋಜನಗಳು' : 'Ayushman Bharat hospital benefits',
    lang === 'hi' ? 'कॉलेज छात्रों के लिए छात्रवृत्ति' : lang === 'kn' ? 'ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ' : 'Scholarships for college students'
  ]
});

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useAccessibility();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage(language)]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [activeSession, setActiveSession] = useState('session-today');
  const [selectedSchemeContext, setSelectedSchemeContext] = useState<Scheme | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // When language changes, update initial message if user hasn't chatted yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-msg') {
        return [getInitialMessage(language)];
      }
      return prev;
    });
  }, [language]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const botResponse = await assistantService.sendQuery(query, language, user?.user_profile);
      setMessages(prev => [...prev, botResponse]);
      if (botResponse.matched_schemes && botResponse.matched_schemes.length > 0) {
        setSelectedSchemeContext(botResponse.matched_schemes[0]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: "I'm having trouble retrieving details right now. Please verify your connection or try rephrasing your question.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVoice = (audioUrl?: string, text?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio playback notice:', e));
    } else if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!assistantService.isSpeechRecognitionSupported()) {
      showToast(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।'
          : language === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Chrome ಅಥವಾ Edge ಬಳಸಿ.'
          : 'Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or type your query.',
        'warning',
        'Voice Input'
      );
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = assistantService.getSpeechLocale(language);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputQuery(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast(
            language === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।'
              : language === 'kn'
              ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿಸಿ.'
              : 'Microphone permission was denied. Please allow microphone access in your browser settings.',
            'error',
            'Microphone'
          );
        } else if (event.error === 'no-speech') {
          showToast(
            language === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया पुनः माइक दबाकर बोलें।'
              : language === 'kn'
              ? 'ಯಾವುದೇ ಧ್ವನಿ ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.'
              : 'No speech was detected. Tap the mic to try speaking again.',
            'info',
            'Voice Input'
          );
        } else if (event.error === 'network') {
          showToast(
            language === 'hi'
              ? 'नेटवर्क त्रुटि: आवाज़ पहचान सेवा कनेक्ट नहीं हो सकी।'
              : language === 'kn'
              ? 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ: ಧ್ವನಿ ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
              : 'Network error: Speech service could not be reached.',
            'warning',
            'Voice Input'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      {/* Top Assistant Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-govblue-800 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 font-heading">
                {t('Seva Citizen Assistant', language)}
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500">
              {t('AI-powered public service guidance in your language', language)}
            </p>
          </div>
        </div>

        {/* Language selector in assistant */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">{t('Assistant Language:', language)}</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* LEFT COLUMN: Conversation Sessions / Topics (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 flex-col justify-between overflow-y-auto shadow-subtle">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('Conversations', language)}
              </span>
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'new-init',
                      sender: 'bot',
                      text: language === 'hi' 
                        ? 'नमस्ते! मैं सरकारी योजनाओं के संबंध में आपकी क्या सहायता कर सकता हूँ?' 
                        : language === 'kn' 
                        ? 'ನಮಸ್ಕಾರ! ಇಂದು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' 
                        : 'Hello! How can I assist you with government schemes today?',
                      timestamp: 'Just now'
                    }
                  ]);
                }}
                title={t('New Chat Session', language)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setActiveSession('session-today')}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                  activeSession === 'session-today'
                    ? 'bg-govblue-50 text-govblue-900 border border-govblue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-govblue-700 shrink-0" />
                <span className="truncate">{t('General Welfare & Schemes', language)}</span>
              </button>
              <button
                onClick={() => {
                  setActiveSession('session-farmer');
                  handleSend(t('Farmer schemes in Karnataka', language));
                }}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                  activeSession === 'session-farmer'
                    ? 'bg-govblue-50 text-govblue-900 border border-govblue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{t('Agriculture & PM-KISAN', language)}</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t('Chat responses are generated using verified government scheme datasets.', language)}</span>
          </div>
        </div>

        {/* CENTER COLUMN: Chat Interface */}
        <div className="col-span-1 lg:col-span-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between overflow-hidden shadow-subtle">
          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-govblue-800 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-govblue-800 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Matched Scheme Card Snippet inside Bot Response */}
                    {msg.matched_schemes && msg.matched_schemes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col gap-2">
                        {msg.matched_schemes.map(scheme => (
                          <div
                            key={scheme.scheme_id}
                            onClick={() => setSelectedSchemeContext(scheme)}
                            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-govblue-400 shadow-subtle cursor-pointer transition"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{scheme.short_name}</span>
                              <Badge variant="green" size="sm">
                                {t(scheme.level, language)}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                              {scheme.key_benefits}
                            </p>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-govblue-700">
                              <span>{t('Check details', language)}</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Chips */}
                    {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                        {msg.suggested_actions.map(action => (
                          <button
                            key={action}
                            onClick={() => handleSend(action)}
                            className="px-2.5 py-1 rounded-lg bg-govblue-50 hover:bg-govblue-100 text-govblue-800 text-[11px] font-semibold border border-govblue-200 transition cursor-pointer"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Voice Playback */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handlePlayVoice(msg.audio_url, msg.text)}
                        aria-label="Listen to response"
                        title="Listen to response"
                        className="hover:text-slate-600 transition cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-govblue-800 text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-govblue-600 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-govblue-600 animate-pulse delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-govblue-600 animate-pulse delay-150"></span>
                  <span>{t('Analyzing welfare guidelines...', language)}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50">
            {isListening && (
              <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>
                    {language === 'hi'
                      ? 'सुन रहा हूँ... बोलिए (हिंदी)'
                      : language === 'kn'
                      ? 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ (ಕನ್ನಡ)'
                      : 'Listening... speak now (English)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="text-[11px] underline text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  {language === 'hi' ? 'रोकें' : language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop'}
                </button>
              </div>
            )}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white rounded-2xl border border-slate-300 focus-within:border-govblue-600 p-1.5 shadow-sm"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder={
                  isListening
                    ? (language === 'hi' ? 'बोलिए, आवाज़ पहचानी जा रही है...' : language === 'kn' ? 'ಮಾತನಾಡಿ, ಧ್ವನಿ ದಾಖಲಾಗುತ್ತಿದೆ...' : 'Listening... speaking your query...')
                    : t('Ask about government schemes (e.g. Am I eligible for PM-KISAN?)...', language)
                }
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none px-3 py-1.5"
              />
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                title={isListening ? "Listening... click to stop" : `Voice input (${language === 'hi' ? 'हिंदी' : language === 'kn' ? 'ಕನ್ನಡ' : 'English'})`}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-200'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputQuery.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Scheme Context / Quick Details (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex-col justify-between overflow-y-auto shadow-subtle">
          {selectedSchemeContext ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="central">{t('Contextual Scheme', language)}</Badge>
                <button
                  onClick={() => setSelectedSchemeContext(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {t('Clear', language)}
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {selectedSchemeContext.short_name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                {selectedSchemeContext.ministry}
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                <div className="text-[11px] font-bold text-slate-700 mb-1">{t('Key Benefit', language)}</div>
                <div className="text-xs text-slate-800">
                  {selectedSchemeContext.key_benefits}
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">{t('Category', language)}: </span>
                  <span className="text-slate-600">{translateCategory(selectedSchemeContext.category, language)}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">{t('Turnaround:', language)} </span>
                  <span className="text-slate-600">~{selectedSchemeContext.processing_time_days} {t('days', language, 'days')}</span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">{t('Helpline:', language)} </span>
                  <span className="text-slate-600">{selectedSchemeContext.grievance_contact || '1800-11-0001'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/eligibility?scheme=${selectedSchemeContext.scheme_id}`)}
                >
                  {t('Check Eligibility', language)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/documents?scheme=${selectedSchemeContext.scheme_id}`)}
                >
                  {t('Document Checklist', language)}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-8 text-slate-400">
              <Sparkles className="w-8 h-8 mb-2 text-slate-300" />
              <div className="text-xs font-bold text-slate-600 mb-1">{t('Context Helper', language)}</div>
              <p className="text-[11px] text-slate-400">
                {t('Mention any scheme in chat (e.g. PM-KISAN, Ayushman Bharat, PMAY) to see details here.', language)}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            {t('Official portal link: verified under open governance registries.', language)}
          </div>
        </div>
      </div>
    </div>
  );
};
