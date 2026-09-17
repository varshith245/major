import { ChatMessage, UserProfile, Scheme } from '../types';
import { apiRequest } from './apiClient';
import { MOCK_SCHEMES } from '../data/mockSchemes';

export const assistantService = {
  async sendQuery(
    query: string,
    language: string = 'en',
    profile?: UserProfile
  ): Promise<ChatMessage> {
    try {
      const response = await apiRequest<{
        query: string;
        detected_language: string;
        intent: string;
        confidence: number;
        answer: string;
        audio_url?: string;
        matched_schemes: Scheme[];
        eligibility_results?: any[];
        suggested_actions: string[];
      }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          query,
          language,
          session_id: 'citizen_session_01',
          user_profile: profile
        })
      });

      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detected_language: response.detected_language,
        intent: response.intent,
        matched_schemes: response.matched_schemes,
        eligibility_results: response.eligibility_results,
        suggested_actions: response.suggested_actions,
        audio_url: response.audio_url
      };
    } catch {
      // Local intelligent fallback simulation
      const q = query.toLowerCase();
      let matched: Scheme[] = [];
      let answer = '';
      let actions: string[] = [];

      if (q.includes('pm kisan') || q.includes('farmer') || q.includes('kisan')) {
        matched = MOCK_SCHEMES.filter(s => s.short_name === 'PM-KISAN' || s.category.includes('Agriculture'));
        answer = language === 'hi' 
          ? "पीएम-किसान (PM-KISAN) योजना के तहत योग्य छोटे और सीमांत किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता ₹2,000 की 3 समान किस्तों में सीधे उनके बैंक खातों में प्रदान की जाती है।"
          : language === 'kn'
          ? "ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಯಡಿಯಲ್ಲಿ ಅರ್ಹ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹6,000 ಆರ್ಥಿಕ ನೆರವನ್ನು ತಲಾ ₹2,000 ರ ಮೂರು ಕಂತುಗಳಲ್ಲಿ ನೇರ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ (DBT) ಮೂಲಕ ನೀಡಲಾಗುತ್ತದೆ."
          : "Under PM-KISAN, eligible landholding farmer families receive income support of ₹6,000 per year directly transferred to their Aadhaar-seeded bank accounts in three equal installments of ₹2,000.";
        actions = ['Am I eligible for PM-KISAN?', 'PM-KISAN Documents', 'Explore Agriculture Schemes'];
      } else if (q.includes('ayushman') || q.includes('health')) {
        matched = MOCK_SCHEMES.filter(s => s.short_name === 'AB-PMJAY');
        answer = language === 'hi'
          ? "आयुष्मान भारत (AB-PMJAY) योजना पात्र परिवारों को सूचीबद्ध सरकारी और निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा कवरेज प्रदान करती है।"
          : language === 'kn'
          ? "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆಯು ಅರ್ಹ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸಾ ಸೌಲಭ್ಯವನ್ನು ಒದಗಿಸುತ್ತದೆ."
          : "Ayushman Bharat (AB-PMJAY) provides health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.";
        actions = ['Check Ayushman Eligibility', 'Ayushman Card Documents', 'Find Empaneled Hospitals'];
      } else {
        matched = MOCK_SCHEMES.slice(0, 3);
        answer = language === 'hi'
          ? `आपके अनुरोध के आधार पर, यहाँ कुछ प्रमुख सरकारी कल्याणकारी योजनाएं हैं जो आपके लिए उपयोगी हो सकती हैं:`
          : language === 'kn'
          ? `ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ, ಪ್ರಮುಖ ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಇಲ್ಲಿವೆ:`
          : `Based on your request, here are key public welfare schemes tailored to citizen needs:`;
        actions = ['Check My Eligibility', 'View Document Checklist', 'Compare Schemes'];
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matched_schemes: matched.slice(0, 2),
        suggested_actions: actions
      };
    }
  },

  isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  },

  getSpeechLocale(language: string = 'en'): string {
    switch (language) {
      case 'hi':
        return 'hi-IN';
      case 'kn':
        return 'kn-IN';
      default:
        return 'en-IN';
    }
  },

  async transcribeAudioFile(file: File, language: string = 'en'): Promise<{ transcript: string; success: boolean }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/voice/transcribe?lang=${encodeURIComponent(language)}`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error('Failed to transcribe audio on server');
      }
      return await res.json();
    } catch (e) {
      return { transcript: '', success: false };
    }
  }
};

