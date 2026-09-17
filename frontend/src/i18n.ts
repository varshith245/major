export type Language = 'en' | 'hi' | 'kn';

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Brand & Top Header
  brand_name: { en: 'SEVA', hi: 'सेवा', kn: 'ಸೇವಾ' },
  brand_tagline: { en: 'Government Schemes, Made Simple.', hi: 'सरकारी योजनाएं, अब बिल्कुल आसान।', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಈಗ ಸುಲಭ.' },
  brand_subtitle: { en: 'Your AI-powered guide to government schemes and public services.', hi: 'सरकारी योजनाओं और सार्वजनिक सेवाओं के लिए आपका एआई मार्गदर्शक।', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳಿಗೆ ನಿಮ್ಮ ಎಐ ಮಾರ್ಗದರ್ಶಿ.' },
  brand_badge: { en: 'AI-powered public service assistance', hi: 'एआई-संचालित लोक सेवा सहायता', kn: 'ಎಐ-ಚಾಲಿತ ಸಾರ್ವಜನಿಕ ಸೇವಾ ನೆರವು' },
  brand_portal_sub: { en: 'National Welfare Portal', hi: 'राष्ट्रीय कल्याणकारी पोर्टल', kn: 'ರಾಷ್ಟ್ರೀಯ ಕಲ್ಯಾಣ ಪೋರ್ಟಲ್' },
  brand_civic_ai: { en: 'Civic AI', hi: 'नागरिक एआई', kn: 'ನಾಗರಿಕ ಎಐ' },

  // Accessibility Bar
  a11y_skip_to_content: { en: 'Skip to main content', hi: 'मुख्य सामग्री पर जाएं', kn: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ' },
  a11y_text_size: { en: 'Text Size', hi: 'फ़ॉन्ट आकार', kn: 'ಅಕ್ಷರದ ಗಾತ್ರ' },
  a11y_high_contrast: { en: 'High Contrast', hi: 'उच्च कंट्रास्ट', kn: 'ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್' },
  a11y_standard_contrast: { en: 'Standard Contrast', hi: 'मानक कंट्रास्ट', kn: 'ಸಾಮಾನ್ಯ ಕಾಂಟ್ರಾಸ್ಟ್' },
  a11y_reduced_motion: { en: 'Reduced Motion', hi: 'कम गति', kn: 'ಕಡಿಮೆ ಚಲನೆ' },
  a11y_language: { en: 'Language', hi: 'भाषा', kn: 'ಭಾಷೆ' },
  a11y_citizen_assistant: { en: 'Citizen Public Service Assistant', hi: 'नागरिक लोक सेवा सहायक', kn: 'ನಾಗರಿಕ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಸಹಾಯಕ' },

  // Navigation Links
  nav_home: { en: 'Home', hi: 'होम', kn: 'ಮುಖಪುಟ' },
  nav_explore: { en: 'Explore Schemes', hi: 'योजनाएं खोजें', kn: 'ಯೋಜನೆಗಳ ಅನ್ವೇಷಣೆ' },
  nav_how_it_works: { en: 'How It Works', hi: 'यह कैसे काम करता है', kn: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ' },
  nav_features: { en: 'Features', hi: 'विशेषताएं', kn: 'ವೈಶಿಷ್ಟ್ಯಗಳು' },
  nav_about: { en: 'About', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  nav_login: { en: 'Sign In', hi: 'साइन इन', kn: 'ಸೈನ್ ಇನ್' },
  nav_register: { en: 'Register', hi: 'खाता बनाएं', kn: 'ನೋಂದಣಿ' },
  nav_dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  nav_assistant: { en: 'AI Assistant', hi: 'एआई सहायक', kn: 'ಎಐ ಸಹಾಯಕ' },
  nav_eligibility: { en: 'Check Eligibility', hi: 'पात्रता जांचें', kn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' },
  nav_documents: { en: 'Document Checklist', hi: 'दस्तावेज़ चेकलिस्ट', kn: 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ' },
  nav_compare: { en: 'Compare Schemes', hi: 'योजना तुलना', kn: 'ಯೋಜನೆಗಳ ಹೋಲಿಕೆ' },
  nav_recommendations: { en: 'Recommendations', hi: 'सिफ़ारिशें', kn: 'ಶಿಫಾರಸುಗಳು' },
  nav_saved: { en: 'Saved Schemes', hi: 'सहेजी गई योजनाएं', kn: 'ಉಳಿಸಿದ ಯೋಜನೆಗಳು' },
  nav_applications: { en: 'Applications', hi: 'आवेदन इतिहास', kn: 'ಅರ್ಜಿಗಳು' },
  nav_profile: { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल', kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್' },
  nav_settings: { en: 'Settings', hi: 'सेटिंग्स', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  nav_logout: { en: 'Logout', hi: 'लॉग आउट', kn: 'ಲಾಗ್ ಔಟ್' },

  // Common UI Buttons & Verbs
  btn_apply_now: { en: 'Apply Now', hi: 'अभी आवेदन करें', kn: 'ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' },
  btn_check_eligibility: { en: 'Check Eligibility', hi: 'पात्रता जांचें', kn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' },
  btn_view_details: { en: 'View Details', hi: 'विवरण देखें', kn: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  btn_guidelines: { en: 'Guidelines', hi: 'दिशानिर्देश', kn: 'ಮಾರ್ಗಸೂಚಿಗಳು' },
  btn_checklist: { en: 'Checklist', hi: 'चेकलिस्ट', kn: 'ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' },
  btn_compare: { en: 'Compare', hi: 'तुलना करें', kn: 'ಹೋಲಿಕೆ ಮಾಡಿ' },
  btn_compared: { en: 'Compared', hi: 'तुलना में शामिल', kn: 'ಹೋಲಿಸಲಾಗಿದೆ' },
  btn_back: { en: 'Back', hi: 'पीछे जाएं', kn: 'ಹಿಂದೆ' },
  btn_next: { en: 'Next', hi: 'आगे बढ़ें', kn: 'ಮುಂದೆ' },
  btn_next_step: { en: 'Next Step', hi: 'अगला चरण', kn: 'ಮುಂದಿನ ಹಂತ' },
  btn_prev_step: { en: 'Previous Step', hi: 'पिछला चरण', kn: 'ಹಿಂದಿನ ಹಂತ' },
  btn_submit: { en: 'Submit', hi: 'जमा करें', kn: 'ಸಲ್ಲಿಸಿ' },
  btn_save: { en: 'Save', hi: 'सुरक्षित करें', kn: 'ಉಳಿಸಿ' },
  btn_cancel: { en: 'Cancel', hi: 'रद्द करें', kn: 'ರದ್ದುಮಾಡಿ' },
  btn_close: { en: 'Close', hi: 'बंद करें', kn: 'ಮುಚ್ಚಿ' },
  btn_search: { en: 'Search', hi: 'खोजें', kn: 'ಹುಡುಕಿ' },
  btn_download: { en: 'Download', hi: 'डाउनलोड', kn: 'ಡೌನ್‌ಲೋಡ್' },
  btn_print: { en: 'Print', hi: 'प्रिंट करें', kn: 'ಮುದ್ರಿಸಿ' },
  btn_send_otp: { en: 'Send 6-Digit OTP', hi: '6-अंकीय ओटीपी भेजें', kn: '6-ಅಂಕಿಯ ಒಟಿಪಿ ಕಳುಹಿಸಿ' },
  btn_resend_otp: { en: 'Resend OTP', hi: 'ओटीपी पुनः भेजें', kn: 'ಒಟಿಪಿ ಪುನಃ ಕಳುಹಿಸಿ' },
  btn_verify_otp: { en: 'Verify OTP & Proceed', hi: 'ओटीपी सत्यापित करें और आगे बढ़ें', kn: 'ಒಟಿಪಿ ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ' },
  btn_record_applied: { en: 'Record as Applied', hi: 'आवेदन दर्ज करें', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದಾಗಿ ದಾಖಲಿಸಿ' },
  btn_launch_portal: { en: 'Launch Official Portal', hi: 'आधिकारिक पोर्टल खोलें', kn: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಿ' },
  btn_sign_in: { en: 'Sign In', hi: 'साइन इन', kn: 'ಸೈನ್ ಇನ್' },

  // Hero Section
  hero_title_line1: { en: 'Government Schemes,', hi: 'सरकारी योजनाएं,', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು,' },
  hero_title_line2: { en: 'Made Simple.', hi: 'अब बिल्कुल आसान।', kn: 'ಈಗ ಸುಲಭ.' },
  hero_description: { en: 'Discover schemes, check your eligibility, understand required documents, and get personalized guidance with AI.', hi: 'योजनाएं खोजें, अपनी पात्रता जांचें, आवश्यक दस्तावेज समझें और एआई से व्यक्तिगत मार्गदर्शन प्राप्त करें।', kn: 'ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ತಿಳಿಯಿರಿ ಮತ್ತು ಎಐ ಮೂಲಕ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.' },
  hero_cta_find: { en: 'Find Schemes For Me', hi: 'मेरे लिए योजनाएं खोजें', kn: 'ನನಗಾಗಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' },
  hero_cta_ask: { en: 'Ask SEVA', hi: 'सेवा से पूछें', kn: 'ಸೇವಾ ಅನ್ನು ಕೇಳಿ' },
  hero_demo_badge: { en: 'Interactive Demonstration', hi: 'इंटरएक्टिव डेमो', kn: 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ' },
  hero_trust_schemes: { en: '30+ Central & State Schemes', hi: '30+ केंद्र और राज्य योजनाएं', kn: '30+ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಯೋಜನೆಗಳು' },
  hero_trust_trilingual: { en: 'Trilingual (EN, HI, KN)', hi: 'त्रिभाषी (अंग्रेजी, हिन्दी, कन्नड़)', kn: 'ತ್ರಿಭಾಷಾ (ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಕನ್ನಡ)' },
  hero_trust_zero_jargon: { en: 'Zero Bureaucracy Jargon', hi: 'सरल भाषा, बिना जटिलता', kn: 'ಸರಳ ಭಾಷೆ, ಸುಲಭ ಪ್ರಕ್ರಿಯೆ' },

  // Trust Strip
  trust_title: { en: 'One simple place to understand government schemes.', hi: 'सरकारी योजनाओं को समझने का एक सरल मंच।', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಸರಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಒಂದೇ ವೇದಿಕೆ.' },
  trust_pillar_1: { en: 'AI Assistance', hi: 'एआई सहायता', kn: 'ಎಐ ನೆರವು' },
  trust_pillar_2: { en: 'Eligibility Guidance', hi: 'पात्रता मार्गदर्शन', kn: 'ಅರ್ಹತಾ ಮಾರ್ಗದರ್ಶನ' },
  trust_pillar_3: { en: 'Document Checklist', hi: 'दस्तावेज़ चेकलिस्ट', kn: 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ' },
  trust_pillar_4: { en: 'Scheme Comparison', hi: 'योजना तुलना', kn: 'ಯೋಜನೆಗಳ ಹೋಲಿಕೆ' },
  trust_pillar_5: { en: 'Multilingual Support', hi: 'बहुभाषी सहायता', kn: 'ಬಹುಭಾಷಾ ಬೆಂಬಲ' },

  // Central Search
  search_heading: { en: 'What are you looking for?', hi: 'आप किस प्रकार की योजना की तलाश में हैं?', kn: 'ನೀವು ಏನನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?' },
  search_placeholder: { en: 'Search government schemes by name, benefit, occupation or need...', hi: 'नाम, लाभ, व्यवसाय या आवश्यकता के आधार पर सरकारी योजनाएं खोजें...', kn: 'ಹೆಸರು, ಪ್ರಯೋಜನ, ಉದ್ಯೋಗ ಅಥವಾ ಅಗತ್ಯತೆಯ ಆಧಾರದ ಮೇಲೆ ಹುಡುಕಿ...' },
  search_popular_label: { en: 'Popular searches:', hi: 'लोकप्रिय खोजें:', kn: 'ಜನಪ್ರಿಯ ಹುಡುಕಾಟಗಳು:' },
  search_btn_search: { en: 'Search', hi: 'खोजें', kn: 'ಹುಡುಕಿ' },

  // Popular Search Terms
  search_farmer: { en: 'Farmer schemes', hi: 'किसान योजनाएं', kn: 'ರೈತರ ಯೋಜನೆಗಳು' },
  search_student: { en: 'Student scholarships', hi: 'छात्रवृत्ति योजनाएं', kn: 'ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು' },
  search_health: { en: 'Health insurance', hi: 'स्वास्थ्य बीमा', kn: 'ಆರೋಗ್ಯ ವಿಮೆ' },
  search_housing: { en: 'Pucca housing aid', hi: 'पक्के मकान की सहायता', kn: 'ಪಕ್ಕಾ ಮನೆ ನೆರವು' },
  search_pension: { en: 'Senior citizen pension', hi: 'वृद्धावस्था पेंशन', kn: 'ಹಿರಿಯ ನಾಗರಿಕರ ಪಿಂಚಣಿ' },
  search_women: { en: 'Women empowerment grant', hi: 'महिला सशक्तिकरण सहायता', kn: 'ಮಹಿಳಾ ಸಬಲೀಕರಣ ಧನಸಹಾಯ' },
  search_mudra: { en: 'Mudra loan', hi: 'मुद्रा ऋण', kn: 'ಮುದ್ರಾ ಸಾಲ' },

  // Scheme Categories
  categories_title: { en: 'Explore by Category', hi: 'श्रेणी के अनुसार अन्वेषण करें', kn: 'ವರ್ಗದ ಪ್ರಕಾರ ಅನ್ವೇಷಿಸಿ' },
  categories_subtitle: { en: 'Browse Central and State government welfare programs organized by beneficiary focus.', hi: 'लाभार्थी के अनुसार वर्गीकृत केंद्र और राज्य कल्याणकारी योजनाएं देखें।', kn: 'ಫಲಾನುಭವಿಗಳ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ವಿಂಗಡಿಸಲಾದ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು.' },
  cat_all: { en: 'All Categories', hi: 'सभी श्रेणियां', kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು' },
  cat_agri: { en: 'Agriculture & Rural', hi: 'कृषि एवं ग्रामीण विकास', kn: 'ಕೃಷಿ ಮತ್ತು ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ' },
  cat_agri_farmers: { en: 'Agriculture & Farmers', hi: 'कृषि एवं किसान कल्याण', kn: 'ಕೃಷಿ ಮತ್ತು ರೈತ ಕಲ್ಯಾಣ' },
  cat_health: { en: 'Healthcare & Insurance', hi: 'स्वास्थ्य एवं चिकित्सा बीमा', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ವಿಮೆ' },
  cat_health_wellness: { en: 'Healthcare & Wellness', hi: 'स्वास्थ्य एवं कल्याण', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮ' },
  cat_housing: { en: 'Housing & Urban Development', hi: 'आवास एवं शहरी विकास', kn: 'ವಸತಿ ಮತ್ತು ನಗರಾಭಿವೃದ್ಧಿ' },
  cat_housing_shelter: { en: 'Housing & Shelter', hi: 'आवास एवं आश्रय', kn: 'ವಸತಿ ಮತ್ತು ಆಶ್ರಯ' },
  cat_edu: { en: 'Education & Youth', hi: 'शिक्षा एवं युवा विकास', kn: 'ಶಿಕ್ಷಣ ಮತ್ತು ಯುವಜನತೆ' },
  cat_women: { en: 'Women & Child Welfare', hi: 'महिला एवं बाल विकास', kn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಕಲ್ಯಾಣ' },
  cat_pension: { en: 'Senior Citizens & Pension', hi: 'वरिष्ठ नागरिक एवं पेंशन', kn: 'ಹಿರಿಯ ನಾಗರಿಕರು ಮತ್ತು ಪಿಂಚಣಿ' },
  cat_business: { en: 'Business & Entrepreneurship', hi: 'व्यापार एवं उद्यमिता', kn: 'ವ್ಯವಹಾರ ಮತ್ತು ಉದ್ಯಮಶೀಲತೆ' },
  cat_social: { en: 'Social Welfare & Empowerment', hi: 'सामाजिक कल्याण एवं सशक्तिकरण', kn: 'ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಸಬಲೀಕರಣ' },

  // How It Works
  how_title: { en: 'How SEVA Works', hi: 'सेवा कैसे कार्य करता है', kn: 'ಸೇವಾ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ' },
  how_subtitle: { en: 'A seamless citizen journey from discovery to official application.', hi: 'खोज से लेकर आधिकारिक आवेदन तक एक सुगम नागरिक यात्रा।', kn: 'ಅನ್ವೇಷಣೆಯಿಂದ ಅಧಿಕೃತ ಅರ್ಜಿ ಸಲ್ಲಿಸುವವರೆಗಿನ ಸುಲಭ ಹಂತಗಳು.' },
  step1_title: { en: 'Tell us about yourself', hi: 'अपनी जानकारी साझा करें', kn: 'ನಿಮ್ಮ ಬಗ್ಗೆ ತಿಳಿಸಿ' },
  step1_desc: { en: 'Share basic details like occupation, age, state, and income group.', hi: 'व्यवसाय, आयु, राज्य और आय जैसे बुनियादी विवरण दर्ज करें।', kn: 'ಉದ್ಯೋಗ, ವಯಸ್ಸು, ರಾಜ್ಯ ಮತ್ತು ಆದಾಯದ ವಿವರಗಳನ್ನು ನೀಡಿ.' },
  step2_title: { en: 'SEVA understands your needs', hi: 'सेवा आपकी आवश्यकता समझता है', kn: 'ಸೇವಾ ನಿಮ್ಮ ಅಗತ್ಯವನ್ನು ತಿಳಿಯುತ್ತದೆ' },
  step2_desc: { en: 'Our conversational AI maps criteria against national welfare datasets.', hi: 'हमारा एआई मॉडल सरकारी कल्याणकारी नियमों से आपका मिलान करता है।', kn: 'ನಮ್ಮ ಎಐ ಮಾದರಿಯು ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಮಾನದಂಡಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತದೆ.' },
  step3_title: { en: 'Discover matching schemes', hi: 'अनुकूल योजनाएं खोजें', kn: 'ಸೂಕ್ತ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' },
  step3_desc: { en: 'View tailored welfare schemes with transparent match percentages.', hi: 'पारदर्शी मैच स्कोर के साथ अनुकूलित योजनाएं देखें।', kn: 'ನಿಖರವಾದ ಹೊಂದಾಣಿಕೆ ಶೇಕಡಾವಾರು ಹೊಂದಿರುವ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.' },
  step4_title: { en: 'Check eligibility', hi: 'पात्रता की पुष्टि करें', kn: 'ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ' },
  step4_desc: { en: 'Step through an interactive check without complicated bureaucratic forms.', hi: 'जटिल सरकारी प्रपत्रों के बिना सरल विज़ार्ड से पात्रता जांचें।', kn: 'ಸಂಕೀರ್ಣ ಅರ್ಜಿಗಳ ಬದಲಿಗೆ ಸುಲಭ ಹಂತಗಳಲ್ಲಿ ಅರ್ಹತೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.' },
  step5_title: { en: 'Prepare documents', hi: 'दस्तावेज़ तैयार करें', kn: 'ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ' },
  step5_desc: { en: 'Get an exact checklist of mandatory and optional certificates needed.', hi: 'आवश्यक प्रमाण पत्रों की स्पष्ट और संपूर्ण चेकलिस्ट प्राप्त करें।', kn: 'ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ಪ್ರಮಾಣಪತ್ರಗಳ ಸ್ಪಷ್ಟ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ಪಡೆಯಿರಿ.' },
  step6_title: { en: 'Apply through official channel', hi: 'आधिकारिक पोर्टल पर आवेदन करें', kn: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' },
  step6_desc: { en: 'Direct links and nodal contact details for certified government portals.', hi: 'प्रमाणित सरकारी पोर्टलों के सीधे लिंक और हेल्पलाइन सहायता।', kn: 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಲಿಂಕ್‌ಗಳು ಮತ್ತು ಸಹಾಯವಾಣಿ ಸಂಪರ್ಕ.' },

  // AI Assistant Preview
  ai_preview_tag: { en: 'Ask. Understand. Act.', hi: 'पूछें। समझें। कार्य करें।', kn: 'ಕೇಳಿ. ತಿಳಿಯಿರಿ. ಮುನ್ನಡೆಯಿರಿ.' },
  ai_preview_title: { en: 'Intelligent Civic AI in your language', hi: 'आपकी अपनी भाषा में बुद्धिमान नागरिक एआई', kn: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿಯೇ ಬುದ್ಧಿವಂತ ನಾಗರಿಕ ಎಐ' },
  ai_preview_subtitle: { en: 'Ask complex welfare questions in plain words. Get verified answers, eligibility rationale, and step-by-step checklists instantly.', hi: 'सरल भाषा में प्रश्न पूछें। सत्यापित उत्तर, पात्रता के कारण और प्रक्रिया तुरंत पाएं।', kn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಶ್ನಿಸಿ. ಪರಿಶೀಲಿಸಿದ ಉತ್ತರಗಳು ಮತ್ತು ಹಂತಗಳನ್ನು ತಕ್ಷಣ ಪಡೆಯಿರಿ.' },
  ai_start_btn: { en: 'Start with SEVA', hi: 'सेवा से शुरू करें', kn: 'ಸೇವಾ ಜೊತೆ ಪ್ರಾರಂಭಿಸಿ' },

  // Feature Showcase
  features_main_heading: { en: 'Engineered for Digital Public Inclusion', hi: 'डिजिटल सार्वजनिक समावेशन के लिए निर्मित', kn: 'ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಸೇರ್ಪಡೆಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ' },
  features_main_sub: { en: 'Advanced civic features built specifically to address language barriers and complex government bureaucracy.', hi: 'भाषा की बाधाओं और जटिल सरकारी नियमों को दूर करने के लिए विशेष नागरिक सुविधाएं।', kn: 'ಭಾಷಾ ಅಡೆತಡೆಗಳು ಮತ್ತು ಸಂಕೀರ್ಣ ಸರ್ಕಾರಿ ನಿಯಮಗಳನ್ನು ಪರಿಹರಿಸಲು ವಿಶೇಷ ಸೌಲಭ್ಯಗಳು.' },
  feat_hybrid_title: { en: 'Hybrid AI Eligibility Engine', hi: 'हाइब्रिड एआई पात्रता इंजन', kn: 'ಹೈಬ್ರಿಡ್ ಎಐ ಅರ್ಹತಾ ಎಂಜಿನ್' },
  feat_hybrid_desc: { en: 'Evaluates statutory criteria simultaneously—including age windows, gender provisions, state jurisdictions, income limits, and landholdings.', hi: 'आयु, लिंग, राज्य, आय सीमा और भूमि स्वामित्व सहित सभी वैधानिक नियमों का एक साथ विश्लेषण करता है।', kn: 'ವಯಸ್ಸು, ಲಿಂಗ, ರಾಜ್ಯ, ಆದಾಯ ಮಿತಿ ಮತ್ತು ಭೂ ಹಿಡುವಳಿ ಸೇರಿದಂತೆ ಎಲ್ಲಾ ನಿಯಮಗಳನ್ನು ಏಕಕಾಲದಲ್ಲಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ.' },
  feat_checklist_title: { en: 'Document Checklist Generator', hi: 'दस्तावेज़ चेकलिस्ट जनरेटर', kn: 'ದಾಖಲೆ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ಜನರೇಟರ್' },
  feat_checklist_desc: { en: 'Dynamic certificate lists tailored to your caste category, income group, and landholding status with step-by-step guidance.', hi: 'जाति, आय समूह और भूमि स्थिति के अनुसार आवश्यक प्रमाण पत्रों की स्पष्ट सूची और मार्गदर्शन।', kn: 'ಜಾತಿ, ಆದಾಯ ಮತ್ತು ಭೂಮಿಯ ವಿವರಗಳಿಗೆ ತಕ್ಕಂತೆ ಅಗತ್ಯವಿರುವ ಪ್ರಮಾಣಪತ್ರಗಳ ಸ್ಪಷ್ಟ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ.' },
  feat_compare_title: { en: 'Scheme Comparison Matrix', hi: 'योजना तुलना मैट्रिक्स', kn: 'ಯೋಜನೆಗಳ ಸಮಗ್ರ ಹೋಲಿಕೆ' },
  feat_compare_desc: { en: 'Direct side-by-side assessment of benefit amounts, processing times, coverage caps, and department contacts.', hi: 'लाभ राशि, प्रक्रिया समय, कवरेज सीमा और विभाग संपर्कों का आमने-सामने विस्तृत विश्लेषण।', kn: 'ಪ್ರಯೋಜನದ ಮೊತ್ತ, ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಯ ಸಮಯ ಮತ್ತು ಇಲಾಖಾ ಸಂಪರ್ಕಗಳ ನೇರ ಹೋಲಿಕೆ.' },

  // Citizen Stories
  stories_title: { en: 'Designed for Every Citizen', hi: 'हर भारतीय नागरिक के लिए समर्पित', kn: 'ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ' },
  stories_subtitle: { en: 'Real-world scenarios showing how SEVA bridges the information divide.', hi: 'वास्तविक परिदृश्य जो दर्शाते हैं कि कैसे सेवा सूचना के अंतर को पाटता है।', kn: 'ಮಾಹಿತಿ ಕೊರತೆಯನ್ನು ನಿವಾರಿಸಲು ಸಹಾಯಕವಾದ ನೈಜ ಸನ್ನಿವೇಶಗಳು.' },
  story_farmer_role: { en: 'Smallholder Farmer', hi: 'छोटे किसान', kn: 'ಸಣ್ಣ ರೈತರು' },
  story_farmer_loc: { en: 'Mandya, Karnataka', hi: 'मंड्या, कर्नाटक', kn: 'ಮಂಡ್ಯ, ಕರ್ನಾಟಕ' },
  story_farmer_desc: { en: 'Owns 2.5 acres of agricultural land, seeking crop loss security and annual income support.', hi: '2.5 एकड़ कृषि भूमि के मालिक, फसल सुरक्षा और वार्षिक आय सहायता के इच्छुक।', kn: '2.5 ಎಕರೆ ಕೃಷಿ ಭೂಮಿ ಹೊಂದಿದ್ದು, ಬೆಳೆ ನಷ್ಟ ಪರಿಹಾರ ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ ನೆರವು ಹುಡುಕುತ್ತಿದ್ದಾರೆ.' },
  story_student_role: { en: 'College Graduate', hi: 'कॉलेज स्नातक', kn: 'ಪದವೀಧರ ವಿದ್ಯಾರ್ಥಿ' },
  story_student_loc: { en: 'Belagavi, Karnataka', hi: 'बेलगावी, कर्नाटक', kn: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ' },
  story_student_desc: { en: 'Completed graduation, currently seeking job opportunities, monthly allowances, and skill training.', hi: 'स्नातक पूरा किया, रोजगार के अवसर, मासिक भत्ता और कौशल प्रशिक्षण की तलाश में।', kn: 'ಪದವಿ ಮುಗಿಸಿದ್ದು, ಉದ್ಯೋಗಾವಕಾಶಗಳು, ಮಾಸಿಕ ಭತ್ಯೆ ಮತ್ತು ಕೌಶಲ್ಯ ತರಬೇತಿಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದಾರೆ.' },

  // Impact Stats
  stat_schemes_count: { en: '30+', hi: '30+', kn: '30+' },
  stat_schemes_label: { en: 'Active Welfare Schemes', hi: 'सक्रिय कल्याणकारी योजनाएं', kn: 'ಸಕ್ರಿಯ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು' },
  stat_cover_amount: { en: '₹5 Lakh+', hi: '₹5 लाख+', kn: '₹5 ಲಕ್ಷ+' },
  stat_cover_label: { en: 'Max Direct Benefit Cover', hi: 'अधिकतम प्रत्यक्ष लाभ कवरेज', kn: 'ಗರಿಷ್ಠ ನೇರ ಸೌಲಭ್ಯ ವ್ಯಾಪ್ತಿ' },
  stat_lang_count: { en: '3', hi: '3', kn: '3' },
  stat_lang_label: { en: 'Official Languages (EN, HI, KN)', hi: 'आधिकारिक भाषाएं (अंग्रेजी, हिन्दी, कन्नड़)', kn: 'ಅಧಿಕೃತ ಭಾಷೆಗಳು (ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಕನ್ನಡ)' },
  stat_cost_val: { en: '100%', hi: '100%', kn: '100%' },
  stat_cost_label: { en: 'Free & Zero Commission', hi: 'निःशुल्क एवं शून्य कमीशन', kn: 'ಉಚಿತ ಮತ್ತು ಶೂನ್ಯ ಕಮಿಷನ್' },

  // Auth: Register Page
  reg_step1_badge: { en: 'STEP 1 OF 2 • CITIZEN VERIFICATION', hi: 'चरण 1 / 2 • नागरिक सत्यापन', kn: 'ಹಂತ 1 / 2 • ನಾಗರಿಕ ಪರಿಶೀಲನೆ' },
  reg_step1_title: { en: 'Step 1: Register with OTP', hi: 'चरण 1: ओटीपी से पंजीकरण करें', kn: 'ಹಂತ 1: ಒಟಿಪಿ ಮೂಲಕ ನೋಂದಾಯಿಸಿ' },
  reg_step1_desc: { en: 'Fill in your details and verify your email via 6-digit OTP.', hi: 'अपना विवरण भरें और 6-अंकीय ओटीपी से अपना ईमेल सत्यापित करें।', kn: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ಮತ್ತು 6-ಅಂಕಿಯ ಒಟಿಪಿ ಮೂಲಕ ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.' },
  reg_step2_badge: { en: 'STEP 2 OF 2 • PASSWORD SETUP', hi: 'चरण 2 / 2 • पासवर्ड सेटअप', kn: 'ಹಂತ 2 / 2 • ಪಾಸ್‌ವರ್ಡ್ ಸೆಟಪ್' },
  reg_step2_title: { en: 'Step 2: Set Account Password', hi: 'चरण 2: खाता पासवर्ड सेट करें', kn: 'ಹಂತ 2: ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ' },
  reg_step2_desc: { en: 'Create a secure password for your SEVA citizen account.', hi: 'अपने सेवा नागरिक खाते के लिए एक सुरक्षित पासवर्ड बनाएं।', kn: 'ನಿಮ್ಮ ಸೇವಾ ಖಾತೆಗಾಗಿ ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ.' },
  reg_already_registered: { en: 'Already registered?', hi: 'पहले से पंजीकृत हैं?', kn: 'ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಿಕೊಂಡಿದ್ದೀರಾ?' },
  reg_sign_in_link: { en: 'Sign In', hi: 'साइन इन करें', kn: 'ಸೈನ್ ಇನ್' },
  reg_lbl_fullname: { en: 'Full Name', hi: 'पूरा नाम', kn: 'ಪೂರ್ಣ ಹೆಸರು' },
  reg_lbl_email: { en: 'Email Address', hi: 'ईमेल पता', kn: 'ಇಮೇಲ್ ವಿಳಾಸ' },
  reg_lbl_phone: { en: 'Mobile Number (Optional)', hi: 'मोबाइल नंबर (वैकल्पिक)', kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)' },
  reg_lbl_state: { en: 'State of Residence', hi: 'निवास का राज्य', kn: 'ವಾಸಿಸುವ ರಾಜ್ಯ' },
  reg_lbl_lang: { en: 'Preferred Portal Language', hi: 'पसंदीदा पोर्टल भाषा', kn: 'ಆದ್ಯತೆಯ ಪೋರ್ಟಲ್ ಭಾಷೆ' },
  reg_lbl_otp: { en: 'Enter 6-Digit OTP Sent to Email', hi: 'ईमेल पर भेजा गया 6-अंकीय ओटीपी दर्ज करें', kn: 'ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ' },
  reg_lbl_password: { en: 'Account Password', hi: 'खाता पासवर्ड', kn: 'ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್' },
  reg_lbl_confirm_password: { en: 'Confirm Password', hi: 'पासवर्ड की पुष्टि करें', kn: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' },
  reg_pass_hint: { en: 'Must be at least 6 characters', hi: 'कम से कम 6 वर्ण होने चाहिए', kn: 'ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು' },
  reg_trust_title: { en: 'Direct DBT Benefit Access', hi: 'प्रत्यक्ष डीबीटी लाभ सहायता', kn: 'ನೇರ ಡಿಬಿಟಿ ಸೌಲಭ್ಯ ನೆರವು' },
  reg_trust_desc: { en: 'End-to-end encryption with zero broker involvement. Official Government of India & State welfare linkages.', hi: 'शून्य बिचौलिया भागीदारी। भारत सरकार एवं राज्य कल्याणकारी विभागों के साथ सीधा जुड़ाव।', kn: 'ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರ ಸಂಪರ್ಕ. ಭಾರತ ಸರ್ಕಾರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಯೋಜನೆಗಳು.' },

  // Auth: Login Page
  login_title: { en: 'Welcome to SEVA', hi: 'सेवा में आपका स्वागत है', kn: 'ಸೇವಾ ಗೆ ಸುಸ್ವಾಗತ' },
  login_subtitle: { en: 'Access citizen welfare schemes and live applications', hi: 'कल्याणकारी योजनाओं और आवेदन ट्रैकर तक पहुंचें', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಟ್ರ್ಯಾಕರ್ ವೀಕ್ಷಿಸಿ' },
  login_tab_password: { en: 'Password Sign In', hi: 'पासवर्ड से लॉगिन', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಸೈನ್ ಇನ್' },
  login_tab_otp: { en: 'OTP Sign In', hi: 'ओटीपी से लॉगिन', kn: 'ಒಟಿಪಿ ಸೈನ್ ಇನ್' },
  login_remember_me: { en: 'Remember me', hi: 'मुझे याद रखें', kn: 'ನನ್ನನ್ನು ನೆನಪಿನಲ್ಲಿಡಿ' },
  login_forgot_pass: { en: 'Forgot password?', hi: 'पासवर्ड भूल गए?', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?' },
  login_no_account: { en: "Don't have an account?", hi: 'खाता नहीं है?', kn: 'ಖಾತೆ ಇಲ್ಲವೇ?' },
  login_register_now: { en: 'Register Now', hi: 'अभी पंजीकरण करें', kn: 'ಈಗಲೇ ನೋಂದಾಯಿಸಿ' },
  login_quick_demo: { en: 'Quick Demo Access', hi: 'त्वरित डेमो एक्सेस', kn: 'ತ್ವರಿತ ಡೆಮೊ ಪ್ರವೇಶ' },

  // Dashboard
  dash_greeting_morning: { en: 'Good morning', hi: 'शुभ प्रभात', kn: 'ಶುಭೋದಯ' },
  dash_greeting_afternoon: { en: 'Good afternoon', hi: 'शुभ दोपहर', kn: 'ಶುಭ ಮಧ್ಯಾಹ್ನ' },
  dash_greeting_evening: { en: 'Good evening', hi: 'शुभ संध्या', kn: 'ಶುಭ ಸಂಜೆ' },
  dash_profile_active: { en: 'Citizen Profile Active', hi: 'नागरिक प्रोफ़ाइल सक्रिय', kn: 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ಸಕ್ರಿಯ' },
  dash_subheading: { en: "Let's find the government services and welfare schemes that may help you and your family.", hi: 'आइए वे सरकारी योजनाएं खोजें जो आपके और आपके परिवार के लिए उपयोगी हैं।', kn: 'ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕೋಣ.' },
  dash_search_placeholder: { en: 'What can I help you find today? (e.g. crop subsidy, health card, loan...)', hi: 'आज आप क्या खोजना चाहते हैं? (जैसे फसल सब्सिडी, स्वास्थ्य कार्ड, ऋण...)', kn: 'ಇಂದು ನೀವು ಏನನ್ನು ಹುಡುಕಲು ಬಯಸುತ್ತೀರಿ? (ಉದಾ: ಬೆಳೆ ಸಬ್ಸಿಡಿ, ಆರೋಗ್ಯ ಕಾರ್ಡ್, ಸಾಲ...)' },
  dash_stat_eligible: { en: 'Likely Eligible', hi: 'पात्र योजनाएं', kn: 'ಅರ್ಹ ಯೋಜನೆಗಳು' },
  dash_stat_tracked: { en: 'Tracked Applications', hi: 'ट्रैक किए गए आवेदन', kn: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ಅರ್ಜಿಗಳು' },
  dash_stat_saved: { en: 'Saved Schemes', hi: 'सहेजी गई योजनाएं', kn: 'ಉಳಿಸಿದ ಯೋಜನೆಗಳು' },
  dash_recommended_title: { en: 'Recommended For You', hi: 'आपके लिए अनुशंसಿತ योजनाएं', kn: 'ನಿಮಗಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ಯೋಜನೆಗಳು' },
  dash_recommended_sub: { en: 'Based on your verified civic demographic profile and eligibility criteria.', hi: 'आपकी जनसांख्यिकीय प्रोफ़ाइल और पात्रता मानदंडों के आधार पर।', kn: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಅರ್ಹತಾ ಮಾನದಂಡಗಳ ಆಧಾರದ ಮೇಲೆ.' },

  // Scheme Explorer & Schemes Card
  explorer_title: { en: 'Government Schemes Catalog', hi: 'सरकारी योजनाएं सूची', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಪಟ್ಟಿ' },
  explorer_subtitle: { en: 'Discover and filter central and state government welfare schemes tailored to your needs.', hi: 'अपनी आवश्यकताओं के अनुसार केंद्र और राज्य सरकार की योजनाओं को खोजें और फ़िल्टर करें।', kn: 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಮಾಡಿ.' },
  explorer_search_placeholder: { en: 'Search schemes by title, keyword, ministry, or benefits...', hi: 'योजना के नाम, मंत्रालय या लाभ के आधार पर खोजें...', kn: 'ಹೆಸರು, ಸಚಿವಾಲಯ ಅಥವಾ ಪ್ರಯೋಜನಗಳ ಮೂಲಕ ಹುಡುಕಿ...' },
  explorer_jurisdiction: { en: 'Jurisdiction', hi: 'अधिकार क्षेत्र', kn: 'ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ' },
  explorer_all_jur: { en: 'All Jurisdictions', hi: 'सभी अधिकार क्षेत्र', kn: 'ಎಲ್ಲಾ ವ್ಯಾಪ್ತಿಗಳು' },
  explorer_central_schemes: { en: 'Central Schemes', hi: 'केंद्रीय योजनाएं', kn: 'ಕೇಂದ್ರ ಯೋಜನೆಗಳು' },
  explorer_state_schemes: { en: 'State Schemes', hi: 'राज्य योजनाएं', kn: 'ರಾಜ್ಯ ಯೋಜನೆಗಳು' },
  explorer_state_focus: { en: 'State Focus', hi: 'राज्य चयन', kn: 'ರಾಜ್ಯ ಆಯ್ಕೆ' },
  explorer_sort_label: { en: 'Sort By', hi: 'क्रमबद्ध करें', kn: 'ವಿಂಗಡಿಸಿ' },
  sort_recommended: { en: 'Recommended Match', hi: 'सर्वाधिक प्रासंगिक', kn: 'ಸೂಕ್ತ ಹೊಂದಾಣಿಕೆ' },
  sort_name: { en: 'Scheme Name (A-Z)', hi: 'योजना का नाम (A-Z)', kn: 'ಯೋಜನೆಯ ಹೆಸರು (A-Z)' },
  sort_benefit: { en: 'Highest Benefit Amount', hi: 'अधिकतम लाभ राशि', kn: 'ಗರಿಷ್ಠ ಸೌಲಭ್ಯ ಮೊತ್ತ' },
  card_central_badge: { en: 'Central Scheme', hi: 'केंद्रीय योजना', kn: 'ಕೇಂದ್ರ ಯೋಜನೆ' },
  card_state_badge: { en: 'State Scheme', hi: 'राज्य योजना', kn: 'ರಾಜ್ಯ ಯೋಜನೆ' },
  card_key_benefit: { en: 'Key Benefit', hi: 'प्रमुख लाभ', kn: 'ಪ್ರಮುಖ ಸೌಲಭ್ಯ' },
  card_age: { en: 'Age:', hi: 'आयु:', kn: 'ವಯಸ್ಸು:' },
  card_income_ceiling: { en: 'Income Ceiling:', hi: 'आय सीमा:', kn: 'ಆದಾಯ ಮಿತಿ:' },
  card_years: { en: 'years', hi: 'वर्ष', kn: 'ವರ್ಷಗಳು' },
  card_per_year: { en: '/ yr', hi: '/ वर्ष', kn: '/ ವರ್ಷ' },

  // Eligibility Wizard & Results
  wiz_step_of: { en: 'Step {current} of {total}', hi: 'चरण {current} / {total}', kn: 'ಹಂತ {current} / {total}' },
  wiz_step1_title: { en: 'Basic Citizen Information', hi: 'नागरिक का बुनियादी विवरण', kn: 'ಮೂಲ ನಾಗರಿಕ ಮಾಹಿತಿ' },
  wiz_step1_desc: { en: 'Enter your age and gender to start checking demographic eligibility.', hi: 'जनसांख्यिकीय पात्रता जांचने के लिए अपनी आयु और लिंग दर्ज करें।', kn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗವನ್ನು ನಮೂದಿಸಿ.' },
  wiz_step2_title: { en: 'Occupation & Livelihood', hi: 'व्यवसाय एवं आजीविका', kn: 'ಉದ್ಯೋಗ ಮತ್ತು ಜೀವನೋಪಾಯ' },
  wiz_step2_desc: { en: 'Select your primary work profile and agricultural landholding status.', hi: 'अपनी कार्य प्रोफ़ाइल और कृषि भूमि का विवरण चुनें।', kn: 'ನಿಮ್ಮ ಉದ್ಯೋಗ ಮತ್ತು ಕೃಷಿ ಭೂಮಿಯ ವಿವರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.' },
  wiz_step3_title: { en: 'Household Income & Welfare Status', hi: 'पारिवारिक आय एवं राशन कार्ड स्थिति', kn: 'ಕುಟುಂಬದ ಆದಾಯ ಮತ್ತು ಪಡಿತರ ಚೀಟಿ ಸ್ಥಿತಿ' },
  wiz_step3_desc: { en: 'Income criteria are used to determine subsidies, pensions, and insurance eligibility.', hi: 'आय का उपयोग सब्सिडी, पेंशन और बीमा पात्रता निर्धारित करने के लिए किया जाता है।', kn: 'ಸಬ್ಸಿಡಿ, ಪಿಂಚಣಿ ಮತ್ತು ವಿಮಾ ಅರ್ಹತೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಆದಾಯವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.' },
  wiz_step4_title: { en: 'State & Social Category', hi: 'राज्य एवं सामाजिक श्रेणी', kn: 'ರಾಜ್ಯ ಮತ್ತು ಸಾಮಾಜಿಕ ವರ್ಗ' },
  wiz_step4_desc: { en: 'State-specific and affirmative action criteria apply to several schemes.', hi: 'कई योजनाओं पर राज्य-विशिष्ट और श्रेणी-आधारित नियम लागू होते हैं।', kn: 'ರಾಜ್ಯ ಮತ್ತು ವರ್ಗ ಆಧಾರಿತ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.' },
  wiz_step5_title: { en: 'Statutory Exclusions Check', hi: 'वैधानिक अपवर्जन जांच', kn: 'ಶಾಸನಬದ್ಧ ವಿನಾಯಿತಿಗಳ ಪರಿಶೀಲನೆ' },
  wiz_step5_desc: { en: 'Confirm disqualifying conditions such as government employment or income tax filing.', hi: 'सरकारी नौकरी या आयकर रिटर्न जैसे नियमों की पुष्टि करें।', kn: 'ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಅಥವಾ ಆದಾಯ ತೆರಿಗೆ ಸಲ್ಲಿಕೆಯ ನಿಯಮಗಳನ್ನು ದೃಢೀಕರಿಸಿ.' },
  wiz_evaluate_btn: { en: 'Evaluate My Eligibility Now', hi: 'मेरी पात्रता का मूल्यांकन करें', kn: 'ನನ್ನ ಅರ್ಹತೆಯನ್ನು ಈಗಲೇ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ' },
  wiz_gender_male: { en: 'Male', hi: 'पुरुष', kn: 'ಪುರುಷ' },
  wiz_gender_female: { en: 'Female', hi: 'महिला', kn: 'ಮಹಿಳೆ' },
  wiz_gender_other: { en: 'Other / Transgender', hi: 'अन्य / उभयलिंगी', kn: 'ಇತರ / ತೃತೀಯ ಲಿಂಗ' },
  wiz_owns_land_q: { en: 'Do you own cultivable agricultural land?', hi: 'क्या आपके पास कृषि योग्य भूमि है?', kn: 'ನಿಮ್ಮ ಬಳಿ ಕೃಷಿ ಭೂಮಿ ಇದೆಯೇ?' },
  wiz_bpl_q: { en: 'Do you hold a BPL / Antyodaya Ration Card?', hi: 'क्या आपके पास बीपीएल / अंत्योदय राशन कार्ड है?', kn: 'ನಿಮ್ಮ ಬಳಿ ಬಿಪಿಎಲ್ / ಅಂತ್ಯೋದಯ ಪಡಿತರ ಚೀಟಿ ಇದೆಯೇ?' },
  wiz_govt_emp_q: { en: 'Are you or your spouse a government employee?', hi: 'क्या आप या आपके जीवनसाथी सरकारी कर्मचारी हैं?', kn: 'ನೀವು ಅಥವಾ ನಿಮ್ಮ ಸಂಗಾತಿ ಸರ್ಕಾರಿ ನೌಕರರೇ?' },
  wiz_taxpayer_q: { en: 'Did you file Income Tax in the last assessment year?', hi: 'क्या आपने पिछले वर्ष आयकर रिटर्न दाखिल किया था?', kn: 'ನೀವು ಕಳೆದ ವರ್ಷ ಆದಾಯ ತೆರಿಗೆ ಸಲ್ಲಿಸಿದ್ದೀರಾ?' },
  wiz_yes: { en: 'Yes', hi: 'हाँ', kn: 'ಹೌದು' },
  wiz_no: { en: 'No', hi: 'नहीं', kn: 'ಇಲ್ಲ' },

  // Eligibility Results
  res_title: { en: 'Eligibility Assessment Results', hi: 'पात्रता मूल्यांकन परिणाम', kn: 'ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶಗಳು' },
  res_sub: { en: 'Schemes matched and evaluated against your civic profile.', hi: 'आपकी प्रोफ़ाइल के आधार पर जांची गई सरकारी योजनाएं।', kn: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಅನುಗುಣವಾಗಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾದ ಯೋಜನೆಗಳು.' },
  res_tab_eligible: { en: 'Likely Eligible', hi: 'पात्र योजनाएं', kn: 'ಅರ್ಹ ಯೋಜನೆಗಳು' },
  res_tab_all: { en: 'All Evaluated', hi: 'सभी मूल्यांकित', kn: 'ಎಲ್ಲಾ ಮೌಲ್ಯಮಾಪನಗಳು' },
  res_tab_ineligible: { en: 'Not Matching', hi: 'ಅपात्र योजनाएं', kn: 'ಹೊಂದಾಣಿಕೆಯಾಗದ ಯೋಜನೆಗಳು' },
  res_confidence: { en: 'Confidence:', hi: 'सटीकता:', kn: 'ಖಚಿತತೆ:' },
  res_benefit: { en: 'Benefit:', hi: 'लाभ:', kn: 'ಸೌಲಭ್ಯ:' },
  res_criteria_satisfied: { en: 'Criteria Satisfied:', hi: 'संतुष्ट शर्तें:', kn: 'ಪೂರೈಸಲಾದ ಮಾನದಂಡಗಳು:' },
  res_verification_needed: { en: 'Requirement Verification Needed:', hi: 'सत्यापन आवश्यक शर्तें:', kn: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಅಂಶಗಳು:' },

  // Document Checklist
  doc_checklist_title: { en: 'Official Document Checklist', hi: 'आधिकारिक दस्तावेज़ चेकलिस्ट', kn: 'ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' },
  doc_checklist_sub: { en: 'Prepare mandatory certificates and identity proofs before submitting your application.', hi: 'आवेदन जमा करने से पहले आवश्यक प्रमाण पत्र और पहचान पत्र तैयार करें।', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮುನ್ನ ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಿ.' },
  doc_mandatory_heading: { en: 'Mandatory Documents', hi: 'अनिवार्य दस्तावेज़', kn: 'ಕಡ್ಡಾಯ ದಾಖಲೆಗಳು' },
  doc_optional_heading: { en: 'Category-Specific / Optional', hi: 'श्रेणी-विशिष्ट / वैकल्पिक दस्तावेज़', kn: 'ವರ್ಗ-ನಿರ್ದಿಷ್ಟ / ಐಚ್ಛಿಕ ದಾಖಲೆಗಳು' },
  doc_accepted_format: { en: 'Accepted format: Original physical copy + self-attested photocopy', hi: 'स्वीकृत प्रारूप: मूल प्रति + स्व-प्रमाणित फोटोकॉपी', kn: 'ಸ್ವೀಕೃತ ಸ್ವರೂಪ: ಮೂಲ ಪ್ರತಿ + ಸ್ವಯಂ-ದೃಢೀಕರಿಸಿದ ಜೆರಾಕ್ಸ್' },
  doc_ready_to_apply: { en: 'Ready to Apply?', hi: 'आवेदन करने के लिए तैयार हैं?', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?' },
  doc_portal_redirect: { en: 'Documents ready? Click below to launch the official government application portal.', hi: 'दस्तावेज तैयार हैं? आधिकारिक सरकारी पोर्टल पर जाने के लिए नीचे क्लिक करें।', kn: 'ದಾಖಲೆಗಳು ಸಿದ್ಧವಾಗಿವೆಯೇ? ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ.' },

  // Common Document Names
  doc_aadhaar: { en: 'Aadhaar Card', hi: 'आधार कार्ड', kn: 'ಆಧಾರ್ ಕಾರ್ಡ್' },
  doc_ration_card: { en: 'Ration Card', hi: 'राशन कार्ड', kn: 'ಪಡಿತರ ಚೀಟಿ (ರೇಷನ್ ಕಾರ್ಡ್)' },
  doc_income_cert: { en: 'Income Certificate', hi: 'आय प्रमाण पत्र', kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ' },
  doc_caste_cert: { en: 'Caste Certificate', hi: 'जाति प्रमाण पत्र', kn: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ' },
  doc_bank_passbook: { en: 'Active Bank Account Passbook', hi: 'सक्रिय बैंक पासबुक (आधार लिंक)', kn: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ (ಆಧಾರ್ ಜೋಡಣೆ)' },
  doc_land_records: { en: 'Land Ownership Documents (RTC / Pahani)', hi: 'भूमि स्वामित्व दस्तावेज़ (खतौनी / आरटीसी)', kn: 'ಭೂ ದಾಖಲೆಗಳು (ಆರ್‌ಟಿಸಿ / ಪಹಣಿ)' },
  doc_domicile_cert: { en: 'Domicile / Residence Certificate', hi: 'मूल निवास प्रमाण पत्र', kn: 'ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರ' },
  doc_mobile_linked: { en: 'Mobile Number linked with Aadhaar', hi: 'आधार से जुड़ा मोबाइल नंबर', kn: 'ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' },
  doc_disability_cert: { en: 'Disability Certificate (UDID)', hi: 'दिव्यांगता प्रमाण पत्र (यूडीआईडी)', kn: 'ಅಂಗವಿಕಲತಾ ಪ್ರಮಾಣಪತ್ರ (ಯುಡಿಐಡಿ)' },

  // Apply Modal
  apply_modal_gateway: { en: 'Verified Government Application Gateway', hi: 'सत्यापित सरकारी आवेदन गेटवे', kn: 'ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಅರ್ಜಿ ಗೇಟ್‌ವೇ' },
  apply_modal_opt1_title: { en: 'Option 1: Official Online Portal (Direct Application)', hi: 'विकल्प 1: आधिकारिक ऑनलाइन पोर्टल (सीधा आवेदन)', kn: 'ಆಯ್ಕೆ 1: ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ (ನೇರ ಅರ್ಜಿ)' },
  apply_modal_opt2_title: { en: 'Option 2: Offline / In-Person Application', hi: 'विकल्प 2: ऑफलाइन / व्यक्तिगत आवेदन', kn: 'ಆಯ್ಕೆ 2: ಆಫ್‌ಲೈನ್ / ಕಚೇರಿಗೆ ತೆರಳಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು' },
  apply_modal_zero_fee: { en: 'Zero Service Fee', hi: 'शून्य सेवा शुल्क', kn: 'ಶೂನ್ಯ ಸೇವಾ ಶುಲ್ಕ' },
  apply_modal_opt1_desc: { en: 'Click below to open the official verified department portal in a secure new tab. Ensure you have your Aadhaar and mobile ready for OTP.', hi: 'सुरक्षित नए टैब में आधिकारिक विभाग पोर्टल खोलने के लिए नीचे क्लिक करें।', kn: 'ಅಧಿಕೃತ ಇಲಾಖೆಯ ಪೋರ್ಟಲ್ ತೆರೆಯಲು ಕೆಳಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ. ಒಟಿಪಿಗಾಗಿ ಆಧಾರ್ ಮತ್ತು ಮೊಬೈಲ್ ಸಿದ್ಧವಾಗಿರಲಿ.' },
  apply_modal_docs_ready: { en: 'Documents to Keep Ready', hi: 'तैयार रखने योग्य दस्तावेज़', kn: 'ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಬೇಕಾದ ದಾಖಲೆಗಳು' },
  apply_modal_tracker_title: { en: 'Citizen Application Tracker', hi: 'नागरिक आवेदन ट्रैकर', kn: 'ನಾಗರಿಕ ಅರ್ಜಿ ಟ್ರ್ಯಾಕರ್' },
  apply_modal_tracker_desc: { en: 'Applied on the portal or visiting a CSC kiosk? Add this scheme to your tracker to store reference numbers and monitor progress.', hi: 'पोर्टल पर आवेदन किया? संदर्भ संख्या सुरक्षित करने और स्थिति ट्रैक करने के लिए इसे अपने ट्रैकर में जोड़ें।', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದೀರಾ? ಅಕ್ನಾಲೆಡ್ಜ್‌ಮೆಂಟ್ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಲು ಮತ್ತು ಸ್ಥಿತಿ ತಿಳಿಯಲು ಟ್ರ್ಯಾಕರ್‌ಗೆ ಸೇರಿಸಿ.' },

  // Applications Page
  app_history_title: { en: 'My Applications & Tracking', hi: 'मेरे आवेदन एवं ट्रैकिंग', kn: 'ನನ್ನ ಅರ್ಜಿಗಳು ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್' },
  app_history_sub: { en: 'Monitor your government scheme submissions, department reference numbers, and live review status.', hi: 'अपने सरकारी आवेदनों, संदर्भ संख्याओं और स्थिति पर नज़र रखें।', kn: 'ನಿಮ್ಮ ಅರ್ಜಿಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಇಲಾಖಾ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' },
  app_tab_all: { en: 'All Applications', hi: 'सभी आवेदन', kn: 'ಎಲ್ಲಾ ಅರ್ಜಿಗಳು' },
  app_tab_submitted: { en: 'Submitted', hi: 'जमा किए गए', kn: 'ಸಲ್ಲಿಸಲಾಗಿದೆ' },
  app_tab_review: { en: 'Under Review', hi: 'समीक्षाधीन', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
  app_tab_approved: { en: 'Approved', hi: 'स्वीकृत', kn: 'ಅನುಮೋದಿಸಲಾಗಿದೆ' },
  app_col_scheme: { en: 'Scheme Name', hi: 'योजना का नाम', kn: 'ಯೋಜನೆಯ ಹೆಸರು' },
  app_col_ref: { en: 'Reference No.', hi: 'संदर्भ संख्या', kn: 'ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ' },
  app_col_date: { en: 'Date Applied', hi: 'आवेदन तिथि', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ' },
  app_col_status: { en: 'Status', hi: 'स्थिति', kn: 'ಸ್ಥಿತಿ' },
  app_col_action: { en: 'Action', hi: 'कार्रवाई', kn: 'ಕ್ರಮ' },

  // Assistant Page
  assist_title: { en: 'AI Public Service Assistant', hi: 'एआई लोक सेवा सहायक', kn: 'ಎಐ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಸಹಾಯಕ' },
  assist_sub: { en: 'Ask welfare questions in English, Hindi, or Kannada. Get verified scheme matches and instructions.', hi: 'अंग्रेजी, हिन्दी या कन्नड़ में सरकारी योजनाओं के बारे में प्रश्न पूछें। सटीक उत्तर प्राप्त करें।', kn: 'ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.' },
  assist_input_placeholder: { en: 'Ask anything: "Am I eligible for PM Kisan?", "Karnataka student scholarship"...', hi: 'पूछें: "क्या मैं पीएम किसान के लिए पात्र हूं?", "छात्रवृत्ति योजनाएं"...', kn: 'ಕೇಳಿ: "ನಾನು ಪಿಎಂ ಕಿಸಾನ್‌ಗೆ ಅರ್ಹನೇ?", "ವಿದ್ಯಾರ್ಥಿ ವೇತನಗಳು"...' },
  assist_voice_btn: { en: 'Voice Assistant', hi: 'आवाज सहायक', kn: 'ಧ್ವನಿ ಸಹಾಯಕ' },
  assist_clear_chat: { en: 'Clear Chat', hi: 'चैट साफ़ करें', kn: 'ಚಾಟ್ ಅಳಿಸಿ' },

  // Legal Disclaimer
  legal_disclaimer: {
    en: 'SEVA provides information and guidance. Eligibility and application decisions are determined by the respective official authorities. Verify scheme details on the official government portal before applying.',
    hi: 'सेवाएआई केवल एआई-सहायता प्राप्त जानकारी और मार्गदर्शन प्रदान करता है। पात्रता और आवेदन के निर्णय संबंधित आधिकारिक अधिकारियों द्वारा निर्धारित किए जाते हैं। आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर योजना के विवरण का सत्यापन अवश्य करें।',
    kn: 'ಸೇವಾಎಐ ಕೇವಲ ಎಐ-ಸಹಾಯದ ಮಾಹಿತಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನವನ್ನು ಒದಗಿಸುತ್ತದೆ. ಅರ್ಹತೆ ಮತ್ತು ಅರ್ಜಿ ನಿರ್ಧಾರಗಳನ್ನು ಆಯಾ ಅಧಿಕೃತ ಪ್ರಾಧಿಕಾರಗಳು ನಿರ್ಧರಿಸುತ್ತವೆ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮುನ್ನ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಯೋಜನೆಯ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿಕೊಳ್ಳಿ.'
  },
  'Your Age:': { en: 'Your Age:', hi: 'आपकी आयु:', kn: 'ನಿಮ್ಮ ವಯಸ್ಸು:' },
  'Gender': { en: 'Gender', hi: 'लिंग', kn: 'ಲಿಂಗ' },
  'Female': { en: 'Female', hi: 'महिला', kn: 'ಮಹಿಳೆ' },
  'Male': { en: 'Male', hi: 'पुरुष', kn: 'ಪುರುಷ' },
  'Transgender': { en: 'Transgender', hi: 'ट्रांसजेंडर / अन्य', kn: 'ತೃತೀಯಲಿಂಗ / ಇತರ' },
  'Basic Citizen Information': { en: 'Basic Citizen Information', hi: 'नागरिक का बुनियादी विवरण', kn: 'ಮೂಲ ನಾಗರಿಕ ಮಾಹಿತಿ' },
  'Welfare programs enforce statutory age brackets and gender provisions.': {
    en: 'Welfare programs enforce statutory age brackets and gender provisions.',
    hi: 'कल्याणकारी कार्यक्रम वैधानिक आयु सीमा और लिंग प्रावधानों को लागू करते हैं।',
    kn: 'ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳು ನಿರ್ದಿಷ್ಟ ವಯೋಮಿತಿ ಮತ್ತು ಲಿಂಗ ನಿಯಮಗಳನ್ನು ಅನ್ವಯಿಸುತ್ತವೆ.'
  },
  'Occupation & Livelihood': { en: 'Occupation & Livelihood', hi: 'व्यवसाय एवं आजीविका', kn: 'ಉದ್ಯೋಗ ಮತ್ತು ಜೀವನೋಪಾಯ' },
  'Select your primary work sector to filter sector-targeted subsidies.': {
    en: 'Select your primary work sector to filter sector-targeted subsidies.',
    hi: 'क्षेत्र-विशिष्ट सब्सिडी फ़िल्टर करने के लिए अपने कार्य क्षेत्र का चयन करें।',
    kn: 'ವಿಶೇಷ ಸಬ್ಸಿಡಿಗಳನ್ನು ತಿಳಿಯಲು ನಿಮ್ಮ ಮುಖ್ಯ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
  },
  'Farmer / Cultivator': { en: 'Farmer / Cultivator', hi: 'किसान / काश्तकार', kn: 'ರೈತ / ಕೃಷಿಕ' },
  'Student / Graduate': { en: 'Student / Graduate', hi: 'छात्र / स्नातक', kn: 'ವಿದ್ಯಾರ್ಥಿ / ಪದವೀಧರ' },
  'Senior Citizen / Retired': { en: 'Senior Citizen / Retired', hi: 'वरिष्ठ नागरिक / सेवानिवृत्त', kn: 'ಹಿರಿಯ ನಾಗರಿಕ / ನಿವೃತ್ತ' },
  'Homemaker': { en: 'Homemaker', hi: 'गृहिणी', kn: 'ಗೃಹಿಣಿ' },
  'Artisan / Street Vendor / Trader': { en: 'Artisan / Street Vendor / Trader', hi: 'कारीगर / रेहड़ी पटरी / व्यापारी', kn: 'ಕುಶಲಕರ್ಮಿ / ಬೀದಿಬದಿ ವ್ಯಾಪಾರಿ / ವರ್ತಕ' },
  'Unorganized / Casual Worker': { en: 'Unorganized / Casual Worker', hi: 'असंगठित / दैनिक श्रमिक', kn: 'ಅಸಂಘಟಿತ / ದಿನಗೂಲಿ ಕಾರ್ಮಿಕ' },
  'Annual Household Income Bracket': { en: 'Annual Household Income Bracket', hi: 'वार्षिक पारिवारिक आय वर्ग', kn: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ವರ್ಗ' },
  'Most welfare programs define explicit income ceilings to prioritize low-income families.': {
    en: 'Most welfare programs define explicit income ceilings to prioritize low-income families.',
    hi: 'अधिकांश योजनाएं कम आय वाले परिवारों को प्राथमिकता देने के लिए आय सीमा तय करती हैं।',
    kn: 'ಹೆಚ್ಚಿನ ಯೋಜನೆಗಳು ಕಡಿಮೆ ಆದಾಯದ ಕುಟುಂಬಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಲು ಆದಾಯ ಮಿತಿಯನ್ನು ನಿಗದಿಪಡಿಸುತ್ತವೆ.'
  },
  'Less than ₹1,00,000 / year': { en: 'Less than ₹1,00,000 / year', hi: '₹1,00,000 / वर्ष से कम', kn: 'ವರ್ಷಕ್ಕೆ ₹1,00,000 ಕ್ಕಿಂತ ಕಡಿಮೆ' },
  'BPL / Antyodaya / Priority House': { en: 'BPL / Antyodaya / Priority House', hi: 'बीपीएल / अंत्योदय / प्राथमिकता राशन कार्ड', kn: 'ಬಿಪಿಎಲ್ / ಅಂತ್ಯೋದಯ / ಆದ್ಯತಾ ಪಡಿತರ' },
  '₹1,00,000 – ₹2,50,000 / year': { en: '₹1,00,000 – ₹2,50,000 / year', hi: '₹1,00,000 – ₹2,50,000 / वर्ष', kn: 'ವರ್ಷಕ್ಕೆ ₹1,00,000 – ₹2,50,000' },
  'Lower Income / Small Farmer / EWS': { en: 'Lower Income / Small Farmer / EWS', hi: 'निम्न आय / छोटे किसान / ईडब्ल्यूएस', kn: 'ಕಡಿಮೆ ಆದಾಯ / ಸಣ್ಣ ರೈತ / ಇಡಬ್ಲ್ಯೂಎಸ್' },
  '₹2,50,000 – ₹5,00,000 / year': { en: '₹2,50,000 – ₹5,00,000 / year', hi: '₹2,50,000 – ₹5,00,000 / वर्ष', kn: 'ವರ್ಷಕ್ಕೆ ₹2,50,000 – ₹5,00,000' },
  'Middle Income Group': { en: 'Middle Income Group', hi: 'मध्यम आय वर्ग', kn: 'ಮಧ್ಯಮ ಆದಾಯ ವರ್ಗ' },
  'Above ₹5,00,000 / year': { en: 'Above ₹5,00,000 / year', hi: '₹5,00,000 / वर्ष से अधिक', kn: 'ವರ್ಷಕ್ಕೆ ₹5,00,000 ಕ್ಕಿಂತ ಹೆಚ್ಚು' },
  'Taxable Regular Income': { en: 'Taxable Regular Income', hi: 'कर योग्य नियमित आय', kn: 'ತೆರಿಗೆಗೆ ಒಳಪಡುವ ಆದಾಯ' },
  'Location & Social Category': { en: 'Location & Social Category', hi: 'स्थान एवं सामाजिक श्रेणी', kn: 'ಸ್ಥಳ ಮತ್ತು ಸಾಮಾಜಿಕ ವರ್ಗ' },
  'State welfare programs and affirmative category schemes check these criteria.': {
    en: 'State welfare programs and affirmative category schemes check these criteria.',
    hi: 'राज्य कल्याणकारी कार्यक्रम और श्रेणी-विशिष्ट योजनाएं इन शर्तों की जांच करती हैं।',
    kn: 'ರಾಜ್ಯ ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವರ್ಗ ಯೋಜನೆಗಳು ಈ ಮಾನದಂಡಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತವೆ.'
  },
  'Social / Caste Category': { en: 'Social / Caste Category', hi: 'सामाजिक / जाति श्रेणी', kn: 'ಸಾಮಾಜಿಕ / ಜಾತಿ ವರ್ಗ' },
  'Landholding & Disqualification Criteria': { en: 'Landholding & Disqualification Criteria', hi: 'भूमि स्वामित्व एवं अपवर्जन शर्तें', kn: 'ಭೂ ಹಿಡುವಳಿ ಮತ್ತು ಅನರ್ಹತಾ ಮಾನದಂಡಗಳು' },
  'Accurate declaration avoids rejection during administrative verification.': {
    en: 'Accurate declaration avoids rejection during administrative verification.',
    hi: 'सटीक घोषणा से प्रशासनिक सत्यापन के दौरान आवेदन रद्द होने से बचाव होता है।',
    kn: 'ನಿಖರವಾದ ಮಾಹಿತಿ ನೀಡುವುದರಿಂದ ಪರಿಶೀಲನೆಯ ವೇಳೆ ಅರ್ಜಿ ತಿರಸ್ಕೃತವಾಗುವುದನ್ನು ತಪ್ಪಿಸಬಹುದು.'
  },
  'Do you own cultivable agricultural land?': { en: 'Do you own cultivable agricultural land?', hi: 'क्या आपके पास कृषि योग्य भूमि है?', kn: 'ನಿಮ್ಮ ಬಳಿ ಕೃಷಿ ಭೂಮಿ ಇದೆಯೇ?' },
  'Land Area:': { en: 'Land Area:', hi: 'भूमि क्षेत्रफल:', kn: 'ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣ:' },
  'Acres': { en: 'Acres', hi: 'एकड़', kn: 'ಎಕರೆ' },
  'Are you an Income Tax Payer?': { en: 'Are you an Income Tax Payer?', hi: 'क्या आप आयकर दाता हैं?', kn: 'ನೀವು ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರರೇ?' },
  'Filed ITR in previous assessment year': { en: 'Filed ITR in previous assessment year', hi: 'पिछले आकलन वर्ष में आईटीआर दाखिल किया', kn: 'ಕಳೆದ ವರ್ಷ ಆದಾಯ ತೆರಿಗೆ ಸಲ್ಲಿಸಿದ್ದೀರಾ' },
  'Are you a Government Employee?': { en: 'Are you a Government Employee?', hi: 'क्या आप सरकारी कर्मचारी हैं?', kn: 'ನೀವು ಸರ್ಕಾರಿ ನೌಕರರೇ?' },
  'Regular Central/State Govt employment': { en: 'Regular Central/State Govt employment', hi: 'नियमित केंद्र / राज्य सरकारी सेवा', kn: 'ಖಾಯಂ ಕೇಂದ್ರ / ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರಿ' },
  'Do you already own a Pucca House?': { en: 'Do you already own a Pucca House?', hi: 'क्या आपके पास पहले से पक्का मकान है?', kn: 'ನಿಮ್ಮ ಬಳಿ ಈಗಾಗಲೇ ಪಕ್ಕಾ ಮನೆ ಇದೆಯೇ?' },
  'Affects PMAY housing eligibility': { en: 'Affects PMAY housing eligibility', hi: 'पीएम आवास योजना की पात्रता को प्रभावित करता है', kn: 'ಪಿಎಂ ಆವಾಸ್ ವಸತಿ ಅರ್ಹತೆಗೆ ಸಂಬಂಧಿಸಿದೆ' },
  'Evaluate All 30 Schemes': { en: 'Evaluate All 30 Schemes', hi: 'सभी 30 योजनाओं का मूल्यांकन करें', kn: 'ಎಲ್ಲಾ 30 ಯೋಜನೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ' },
  'Multi-Factor Assessment Complete': { en: 'Multi-Factor Assessment Complete', hi: 'बहु-कारकीय पात्रता मूल्यांकन पूर्ण', kn: 'ಬಹು-ಅಂಶಗಳ ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ' },
  'Eligibility Assessment': { en: 'Eligibility Assessment', hi: 'पात्रता मूल्यांकन', kn: 'ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ' },
  'Evaluated across 7 statutory guidelines: age brackets, residency, income limits, land records, and exclusions.': {
    en: 'Evaluated across 7 statutory guidelines: age brackets, residency, income limits, land records, and exclusions.',
    hi: '7 वैधानिक नियमों पर जाँचा गया: आयु सीमा, निवास, आय सीमा, भूमि रिकॉर्ड और अपवर्जन।',
    kn: '7 ಶಾಸನಬದ್ಧ ನಿಯಮಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ವಯೋಮಿತಿ, ವಾಸಸ್ಥಳ, ಆದಾಯ, ಭೂ ದಾಖಲೆಗಳು ಮತ್ತು ವಿನಾಯಿತಿಗಳು.'
  },
  'Modify Profile': { en: 'Modify Profile', hi: 'प्रोफ़ाइल बदलें', kn: 'ಪ್ರೊಫೈಲ್ ಬದಲಾಯಿಸಿ' },
  'Welfare Schemes Qualified': { en: 'Welfare Schemes Qualified', hi: 'कल्याणकारी योजनाएं योग्य', kn: 'ಅರ್ಹ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು' },
  'Non-Matching': { en: 'Non-Matching', hi: 'अनमेल योजनाएं', kn: 'ಹೊಂದಿಕೆಯಾಗದ ಯೋಜನೆಗಳು' },
  'Criteria Not Satisfied': { en: 'Criteria Not Satisfied', hi: 'शर्तें पूरी नहीं हुईं', kn: 'ಮಾನದಂಡಗಳು ಪೂರೈಕೆಯಾಗಿಲ್ಲ' },
  'Total Analyzed': { en: 'Total Analyzed', hi: 'कुल विश्लेषण', kn: 'ಒಟ್ಟು ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'Central & State Schemes': { en: 'Central & State Schemes', hi: 'केंद्रीय एवं राज्य योजनाएं', kn: 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಯೋಜನೆಗಳು' },
  'All Evaluated': { en: 'All Evaluated', hi: 'सभी मूल्यांकित', kn: 'ಎಲ್ಲಾ ಮೌಲ್ಯಮಾಪನಗಳು' },
  'Not Matching': { en: 'Not Matching', hi: 'अपात्र योजनाएं', kn: 'ಹೊಂದಿಕೆಯಾಗದ ಯೋಜನೆಗಳು' },
  'Confidence:': { en: 'Confidence:', hi: 'सटीकता:', kn: 'ಖಚಿತತೆ:' },
  'Benefit:': { en: 'Benefit:', hi: 'लाभ:', kn: 'ಸೌಲಭ್ಯ:' },
  'Criteria Satisfied:': { en: 'Criteria Satisfied:', hi: 'संतुष्ट शर्तें:', kn: 'ಪೂರೈಸಲಾದ ಮಾನದಂಡಗಳು:' },
  'Requirement Verification Needed:': { en: 'Requirement Verification Needed:', hi: 'सत्यापन आवश्यक शर्तें:', kn: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಅಂಶಗಳು:' },
  'Preparation Center': { en: 'Preparation Center', hi: 'तैयारी केंद्र', kn: 'ಸಿದ್ಧತಾ ಕೇಂದ್ರ' },
  "Documents You'll Need": { en: "Documents You'll Need", hi: 'आवश्यक दस्तावेज़', kn: 'ನಿಮಗೆ ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು' },
  'Checklist Readiness': { en: 'Checklist Readiness', hi: 'चेकलिस्ट की तैयारी', kn: 'ದಾಖಲೆಗಳ ಸಿದ್ಧತೆಯ ಸ್ಥಿತಿ' },
  'of': { en: 'of', hi: 'का / की', kn: 'ರ ಪೈಕಿ' },
  'Documents Ready': { en: 'Documents Ready', hi: 'दस्तावेज़ तैयार', kn: 'ದಾಖಲೆಗಳು ಸಿದ್ಧವಾಗಿವೆ' },
  'Mandatory Certificates (Required)': { en: 'Mandatory Certificates (Required)', hi: 'अनिवार्य प्रमाण पत्र (आवश्यक)', kn: 'ಕಡ್ಡಾಯ ಪ್ರಮಾಣಪತ್ರಗಳು (ಅಗತ್ಯ)' },
  'Items': { en: 'Items', hi: 'मदें', kn: 'ದಾಖಲೆಗಳು' },
  'Category-Specific / Optional': { en: 'Category-Specific / Optional', hi: 'श्रेणी-विशिष्ट / वैकल्पिक', kn: 'ವರ್ಗ-ನಿರ್ದಿಷ್ಟ / ಐಚ್ಛಿಕ' },
  'Accepted format: Original physical copy + self-attested photocopy': {
    en: 'Accepted format: Original physical copy + self-attested photocopy',
    hi: 'स्वीकृत प्रारूप: मूल प्रति + स्व-प्रमाणित फोटोकॉपी',
    kn: 'ಸ್ವೀಕೃತ ಸ್ವರೂಪ: ಮೂಲ ಪ್ರತಿ + ಸ್ವಯಂ-ದೃಢೀಕರಿಸಿದ ಜೆರಾಕ್ಸ್'
  },
  'Issued by designated revenue / state nodal office': {
    en: 'Issued by designated revenue / state nodal office',
    hi: 'नामित राजस्व / राज्य नोडल कार्यालय द्वारा जारी',
    kn: 'ಕಂದಾಯ ಅಥವಾ ರಾಜ್ಯ ಸರ್ಕಾರಿ ಕಚೇರಿಯಿಂದ ನೀಡಲ್ಪಟ್ಟದ್ದು'
  },
  'Step-by-Step Filing Process': { en: 'Step-by-Step Filing Process', hi: 'चरण-दर-चरण आवेदन प्रक्रिया', kn: 'ಹಂತ-ಹಂತದ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಪ್ರಕ್ರಿಯೆ' },
  'Ready to Submit Application?': { en: 'Ready to Submit Application?', hi: 'आवेदन जमा करने के लिए तैयार हैं?', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?' },
  'Apply for Scheme Now': { en: 'Apply for Scheme Now', hi: 'योजना के लिए अभी आवेदन करें', kn: 'ಯೋಜನೆಗೆ ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' },
  'Official Application Portal': { en: 'Official Application Portal', hi: 'आधिकारिक आवेदन पोर्टल', kn: 'ಅಧಿಕೃತ ಅರ್ಜಿ ಪೋರ್ಟಲ್' },
  'View Full Application Guidance': { en: 'View Full Application Guidance', hi: 'संपूर्ण आवेदन मार्गदर्शन देखें', kn: 'ಸಂಪೂರ್ಣ ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶನ ವೀಕ್ಷಿಸಿ' },
  'Aadhaar DBT Direct Deposit Requirement': { en: 'Aadhaar DBT Direct Deposit Requirement', hi: 'आधार डीबीटी प्रत्यक्ष जमा आवश्यकता', kn: 'ಆಧಾರ್ ಡಿಬಿಟಿ ನೇರ ನಗದು ಸೌಲಭ್ಯ ಅಗತ್ಯತೆ' },
  'Verified Government Application Gateway': { en: 'Verified Government Application Gateway', hi: 'सत्यापित सरकारी आवेदन गेटवे', kn: 'ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಅರ್ಜಿ ಗೇಟ್‌ವೇ' },
  'Apply for': { en: 'Apply for', hi: 'आवेदन करें:', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ:' },
  'Direct Benefit:': { en: 'Direct Benefit:', hi: 'प्रत्यक्ष लाभ:', kn: 'ನೇರ ಪ್ರಯೋಜನ:' },
  'Option 1: Official Online Portal (Direct Application)': {
    en: 'Option 1: Official Online Portal (Direct Application)',
    hi: 'विकल्प 1: आधिकारिक ऑनलाइन पोर्टल (सीधा आवेदन)',
    kn: 'ಆಯ್ಕೆ 1: ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ (ನೇರ ಅರ್ಜಿ)'
  },
  'Option 2: Offline / In-Person Application': {
    en: 'Option 2: Offline / In-Person Application',
    hi: 'विकल्प 2: ऑफलाइन / व्यक्तिगत आवेदन',
    kn: 'ಆಯ್ಕೆ 2: ಆಫ್‌ಲೈನ್ / ಖುದ್ದಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ'
  },
  'Documents to Keep Ready': { en: 'Documents to Keep Ready', hi: 'तैयार रखने योग्य दस्तावेज़', kn: 'ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಬೇಕಾದ ದಾಖಲೆಗಳು' },
  'Interactive Checklist': { en: 'Interactive Checklist', hi: 'इंटरएक्टिव चेकलिस्ट', kn: 'ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' },
  'Citizen Application Tracker': { en: 'Citizen Application Tracker', hi: 'नागरिक आवेदन ट्रैकर', kn: 'ನಾಗರಿಕ ಅರ್ಜಿ ಟ್ರ್ಯಾಕರ್' },
  'Tracked in Dashboard': { en: 'Tracked in Dashboard', hi: 'डैशबोर्ड में ट्रैक किया गया', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ' },
  'Record as Applied': { en: 'Record as Applied', hi: 'आवेदन दर्ज करें', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದಾಗಿ ದಾಖಲಿಸಿ' },
  'Enter Reference Number': { en: 'Enter Reference Number', hi: 'संदर्भ संख्या दर्ज करें', kn: 'ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' },
  'Launch Official Portal': { en: 'Launch Official Portal', hi: 'आधिकारिक पोर्टल खोलें', kn: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಿ' },
  'View in Application Tracker': { en: 'View in Application Tracker', hi: 'आवेदन ट्रैकर में देखें', kn: 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕರ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ' },
  'Filing & Acknowledgment Log': { en: 'Filing & Acknowledgment Log', hi: 'आवेदन एवं पावती लॉग', kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಮತ್ತು ಅಕ್ನಾಲೆಡ್ಜ್‌ಮೆಂಟ್ ವಿವರ' },
  'Application History & Trackers': { en: 'Application History & Trackers', hi: 'आवेदन इतिहास एवं ट्रैकर', kn: 'ಅರ್ಜಿಗಳ ಇತಿಹಾಸ ಮತ್ತು ಟ್ರ್ಯಾಕರ್' },
  'Track acknowledgment numbers and status updates for submitted welfare schemes.': {
    en: 'Track acknowledgment numbers and status updates for submitted welfare schemes.',
    hi: 'जमा की गई कल्याणकारी योजनाओं के लिए पावती संख्या और स्थिति ट्रैक करें।',
    kn: 'ಸಲ್ಲಿಸಲಾದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆ ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
  },
  'New Application': { en: 'New Application', hi: 'नया आवेदन', kn: 'ಹೊಸ ಅರ್ಜಿ' },
  'Approved': { en: 'Approved', hi: 'स्वीकृत', kn: 'ಅನುಮೋದಿಸಲಾಗಿದೆ' },
  'Under Review': { en: 'Under Review', hi: 'समीक्षाधीन', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
  'Submitted': { en: 'Submitted', hi: 'जमा किया गया', kn: 'ಸಲ್ಲಿಸಲಾಗಿದೆ' },
  'Department Portal': { en: 'Department Portal', hi: 'विभाग पोर्टल', kn: 'ಇಲಾಖಾ ಪೋರ್ಟಲ್' },
  'View Documents': { en: 'View Documents', hi: 'दस्तावेज़ देखें', kn: 'ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  'Back to schemes': { en: 'Back to schemes', hi: 'योजनाओं पर वापस जाएं', kn: 'ಯೋಜನೆಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ' },
  'Financial / Service Benefit': { en: 'Financial / Service Benefit', hi: 'वित्तीय / सेवा लाभ', kn: 'ಆರ್ಥಿಕ / ಸೇವಾ ಸೌಲಭ್ಯ' },
  'Program Overview': { en: 'Program Overview', hi: 'योजना विवरण', kn: 'ಕಾರ್ಯಕ್ರಮದ ವಿವರ' },
  'Who Can Apply (Eligibility Criteria)': { en: 'Who Can Apply (Eligibility Criteria)', hi: 'कौन आवेदन कर सकता है (पात्रता शर्तें)', kn: 'ಯಾರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು (ಅರ್ಹತಾ ಮಾನದಂಡಗಳು)' },
  'Age Requirement': { en: 'Age Requirement', hi: 'आयु आवश्यकता', kn: 'ವಯಸ್ಸಿನ ಮಿತಿ' },
  'Gender Target': { en: 'Gender Target', hi: 'लक्षित लिंग', kn: 'ಅರ್ಹ ಲಿಂಗ' },
  'Income Limit': { en: 'Income Limit', hi: 'आय सीमा', kn: 'ಆದಾಯ ಮಿತಿ' },
  'Landholding Rule': { en: 'Landholding Rule', hi: 'भूमि नियम', kn: 'ಭೂ ಹಿಡುವಳಿ ನಿಯಮ' },
  'Required Documents': { en: 'Required Documents', hi: 'आवश्यक दस्तावेज़', kn: 'ಅಗತ್ಯ ದಾಖಲೆಗಳು' },
  'Generate Checklist →': { en: 'Generate Checklist →', hi: 'चेकलिस्ट बनाएं →', kn: 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ ಪಡೆಯಿರಿ →' },
  'Official Application Channel': { en: 'Official Application Channel', hi: 'आधिकारिक आवेदन चैनल', kn: 'ಅಧಿಕೃತ ಅರ್ಜಿ ಮಾಧ್ಯಮ' },
  'Estimated Processing': { en: 'Estimated Processing', hi: 'अनुमानित प्रक्रिया समय', kn: 'ಅಂದಾಜು ಪ್ರಕ್ರಿಯೆ ಸಮಯ' },
  'Working Days': { en: 'Working Days', hi: 'कार्य दिवस', kn: 'ಕೆಲಸದ ದಿನಗಳು' },
  'Nodal Contact / Helpline': { en: 'Nodal Contact / Helpline', hi: 'नोडल संपर्क / हेल्पलाइन', kn: 'ಇಲಾಖಾ ಸಂಪರ್ಕ / ಸಹಾಯವಾಣಿ' },
  'Official Application Gateway': { en: 'Official Application Gateway', hi: 'आधिकारिक आवेदन गेटवे', kn: 'ಅಧಿಕೃತ ಅರ್ಜಿ ಗೇಟ್‌ವೇ' },
  'Compare Schemes Side-by-Side': { en: 'Compare Schemes Side-by-Side', hi: 'योजनाओं की आमने-सामने तुलना करें', kn: 'ಯೋಜನೆಗಳನ್ನು ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ ಮಾಡಿ' },
  'Scheme Comparative Analysis': { en: 'Scheme Comparative Analysis', hi: 'योजना तुलनात्मक विश्लेषण', kn: 'ಯೋಜನೆಗಳ ತುಲನಾತ್ಮಕ ವಿಶ್ಲೇಷಣೆ' },
  'Compare up to 3 welfare schemes to determine which program offers better financial and healthcare value.': {
    en: 'Compare up to 3 welfare schemes to determine which program offers better financial and healthcare value.',
    hi: 'अधिकतम 3 योजनाओं की तुलना करें और अपने लिए सर्वोत्तम विकल्प चुनें।',
    kn: 'ನಿಮಗೆ ಯಾವುದು ಹೆಚ್ಚು ಪ್ರಯೋಜನಕಾರಿ ಎಂದು ತಿಳಿಯಲು 3 ಯೋಜನೆಗಳವರೆಗೆ ಹೋಲಿಕೆ ಮಾಡಿ.'
  },
  '+ Add scheme to compare...': { en: '+ Add scheme to compare...', hi: '+ तुलना के लिए योजना जोड़ें...', kn: '+ ಹೋಲಿಸಲು ಯೋಜನೆಯನ್ನು ಸೇರಿಸಿ...' },
  'Comparison Feature': { en: 'Comparison Feature', hi: 'तुलना बिंदु', kn: 'ಹೋಲಿಕೆಯ ಅಂಶ' },
  'Level / State': { en: 'Level / State', hi: 'स्तर / राज्य', kn: 'ವ್ಯಾಪ್ತಿ / ರಾಜ್ಯ' },
  'Financial Benefit': { en: 'Financial Benefit', hi: 'वित्तीय लाभ', kn: 'ಆರ್ಥಿಕ ಸೌಲಭ್ಯ' },
  'Key Benefit Detail': { en: 'Key Benefit Detail', hi: 'प्रमुख लाभ विवरण', kn: 'ಪ್ರಮುಖ ಸೌಲಭ್ಯದ ವಿವರ' },
  'Estimated Turnaround': { en: 'Estimated Turnaround', hi: 'अनुमानित समय', kn: 'ಅಂದಾಜು ಪ್ರಕ್ರಿಯೆ ಅವಧಿ' },
  'Actions': { en: 'Actions', hi: 'कार्रवाई', kn: 'ಕ್ರಮಗಳು' },
  'Seva Citizen Assistant': { en: 'Seva Citizen Assistant', hi: 'सेवा नागरिक सहायक', kn: 'ಸೇವಾ ನಾಗರಿಕ ಸಹಾಯಕ' },
  'AI-powered public service guidance in your language': {
    en: 'AI-powered public service guidance in your language',
    hi: 'आपकी अपनी भाषा में एआई-संचालित लोक सेवा मार्गदर्शन',
    kn: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿಯೇ ಎಐ-ಚಾಲಿತ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಮಾರ್ಗದರ್ಶನ'
  },
  'Assistant Language:': { en: 'Assistant Language:', hi: 'सहायक भाषा:', kn: 'ಸಹಾಯಕ ಭಾಷೆ:' },
  'Conversations': { en: 'Conversations', hi: 'बातचीत', kn: 'ಸಂಭಾಷಣೆಗಳು' },
  'General Welfare & Schemes': { en: 'General Welfare & Schemes', hi: 'सामान्य कल्याण एवं योजनाएं', kn: 'ಸಾಮಾನ್ಯ ಕಲ್ಯಾಣ ಮತ್ತು ಯೋಜನೆಗಳು' },
  'Agriculture & PM-KISAN': { en: 'Agriculture & PM-KISAN', hi: 'कृषि एवं पीएम-किसान', kn: 'ಕೃಷಿ ಮತ್ತು ಪಿಎಂ-ಕಿಸಾನ್' },
  'Check details': { en: 'Check details', hi: 'विवरण जांचें', kn: 'ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' },
  'Contextual Scheme': { en: 'Contextual Scheme', hi: 'प्रासंगिक योजना', kn: 'ಸಂಬಂಧಿತ ಯೋಜನೆ' },
  'Context Helper': { en: 'Context Helper', hi: 'संदर्भ सहायक', kn: 'ಸಹಾಯಕಿ' },
  'Mention any scheme in chat (e.g. PM-KISAN, Ayushman Bharat, PMAY) to see details here.': {
    en: 'Mention any scheme in chat (e.g. PM-KISAN, Ayushman Bharat, PMAY) to see details here.',
    hi: 'चैट में किसी भी योजना का नाम लिखें ताकि उसका विवरण यहाँ दिखाई दे।',
    kn: 'ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಲು ಚಾಟ್‌ನಲ್ಲಿ ಯಾವುದೇ ಯೋಜನೆಯನ್ನು ಹೆಸರಿಸಿ.'
  },
  'Quick Public Service Actions': { en: 'Quick Public Service Actions', hi: 'त्वरित लोक सेवा सुविधाएं', kn: 'ತ್ವರಿತ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಸೌಲಭ್ಯಗಳು' },
  'Find Schemes': { en: 'Find Schemes', hi: 'योजनाएं खोजें', kn: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' },
  'Browse 30+ Central & State welfare programs': {
    en: 'Browse 30+ Central & State welfare programs',
    hi: '30+ केंद्र और राज्य कल्याणकारी योजनाओं को देखें',
    kn: '30+ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
  },
  '5-step guided wizard with confidence score': {
    en: '5-step guided wizard with confidence score',
    hi: 'सटीक स्कोर के साथ 5-चरणीय मार्गदर्शित विज़ार्ड',
    kn: 'ಖಚಿತತೆಯ ಅಂಕದೊಂದಿಗೆ 5-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ'
  },
  'Side-by-side comparison for up to 3 schemes': {
    en: 'Side-by-side comparison for up to 3 schemes',
    hi: 'अधिकतम 3 योजनाओं की आमने-सामने तुलना',
    kn: '3 ಯೋಜನೆಗಳವರೆಗೆ ನೇರ ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ'
  },
  'Check required certificates & apply steps': {
    en: 'Check required certificates & apply steps',
    hi: 'आवश्यक प्रमाण पत्र और आवेदन प्रक्रिया जांचें',
    kn: 'ಅಗತ್ಯ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಅರ್ಜಿ ಹಂತಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'
  },
  'Recommended for You': { en: 'Recommended for You', hi: 'आपके लिए अनुशंसित', kn: 'ನಿಮಗಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ಯೋಜನೆಗಳು' },
  'View All Recommendations': { en: 'View All Recommendations', hi: 'सभी अनुशंसाएं देखें', kn: 'ಎಲ್ಲಾ ಶಿಫಾರಸುಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  'Personalized based on:': { en: 'Personalized based on:', hi: 'के आधार पर व्यक्तिगत:', kn: 'ಆಧಾರದ ಮೇಲೆ ರೂಪಿಸಲಾಗಿದೆ:' },
  'Match': { en: 'Match', hi: 'मेल', kn: 'ಹೊಂದಾಣಿಕೆ' },
  'Matches your profile': { en: 'Matches your profile', hi: 'आपकी प्रोफ़ाइल से मेल खाता है', kn: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾಗಿದೆ' },

  // Comparison Page Translations
  'Check Eligibility': { en: 'Check Eligibility', hi: 'पात्रता जांचें', kn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' },
  'View Checklist': { en: 'View Checklist', hi: 'चेकलिस्ट देखें', kn: 'ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ' },
  'Documents': { en: 'Documents', hi: 'दस्तावेज', kn: 'ದಾಖಲೆಗಳು' },
  'Age:': { en: 'Age:', hi: 'आयु:', kn: 'ವಯಸ್ಸು:' },
  'Income Limit:': { en: 'Income Limit:', hi: 'आय सीमा:', kn: 'ಆದಾಯ ಮಿತಿ:' },
  'No strict ceiling': { en: 'No strict ceiling', hi: 'कोई सख्त सीमा नहीं', kn: 'ಯಾವುದೇ ಕಟ್ಟುನಿಟ್ಟಿನ ಮಿತಿಯಿಲ್ಲ' },

  // Assistant Page Translations
  'New Chat Session': { en: 'New Chat Session', hi: 'नया चैट सत्र', kn: 'ಹೊಸ ಸಂಭಾಷಣೆ' },
  'Farmer schemes in Karnataka': { en: 'Farmer schemes in Karnataka', hi: 'कर्नाटक में किसानों की योजनाएं', kn: 'ಕರ್ನಾಟಕದ ರೈತ ಯೋಜನೆಗಳು' },
  'Chat responses are generated using verified government scheme datasets.': {
    en: 'Chat responses are generated using verified government scheme datasets.',
    hi: 'चैट उत्तर सत्यापित सरकारी योजना डेटाबेस का उपयोग करके तैयार किए जाते हैं।',
    kn: 'ದೃಢೀಕರಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಡೇಟಾವನ್ನು ಬಳಸಿಕೊಂಡು ಚಾಟ್ ಉತ್ತರಗಳನ್ನು ನೀಡಲಾಗುತ್ತದೆ.'
  },
  'Analyzing welfare guidelines...': {
    en: 'Analyzing welfare guidelines...',
    hi: 'कल्याणकारी दिशा-निर्देशों का विश्लेषण किया जा रहा है...',
    kn: 'ಕಲ್ಯಾಣ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
  },
  'Ask about government schemes (e.g. Am I eligible for PM-KISAN?)...': {
    en: 'Ask about government schemes (e.g. Am I eligible for PM-KISAN?)...',
    hi: 'सरकारी योजनाओं के बारे में पूछें (उदा. क्या मैं पीएम-किसान के पात्र हूँ?)...',
    kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ (ಉದಾ. ನಾನು ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಗೆ ಅರ್ಹನೇ?)...'
  },
  'Clear': { en: 'Clear', hi: 'हटाएं', kn: 'ತೆರವುಗೊಳಿಸಿ' },
  'Turnaround:': { en: 'Turnaround:', hi: 'समय सीमा:', kn: 'ಅಂದಾಜು ಸಮಯ:' },
  'Helpline:': { en: 'Helpline:', hi: 'हेल्पलाइन:', kn: 'ಸಹಾಯವಾಣಿ:' },
  'Official portal link: verified under open governance registries.': {
    en: 'Official portal link: verified under open governance registries.',
    hi: 'आधिकारिक पोर्टल लिंक: खुले सरकारी रजिस्ट्रियों के तहत सत्यापित।',
    kn: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಿಂಕ್: ಸಾರ್ವಜನಿಕ ಆಡಳಿತ ದಾಖಲೆಗಳಿಂದ ದೃಢೀಕರಿಸಲಾಗಿದೆ.'
  },

  // Saved Schemes, Settings & Profile Translations
  'Saved Collections': { en: 'Saved Collections', hi: 'सहेजे गए संग्रह', kn: 'ಉಳಿಸಿದ ಸಂಗ್ರಹಗಳು' },
  'Saved Schemes': { en: 'Saved Schemes', hi: 'सहेजी गई योजनाएं', kn: 'ಉಳಿಸಿದ ಯೋಜನೆಗಳು' },
  'Quickly access welfare programs and subsidies you bookmarked for later application.': {
    en: 'Quickly access welfare programs and subsidies you bookmarked for later application.',
    hi: 'बाद में आवेदन करने के लिए बुकमार्क किए गए कल्याण कार्यक्रमों और सब्सिडी तक त्वरित पहुंच प्राप्त करें।',
    kn: 'ನಂತರ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನೀವು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿರುವ ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪ್ರವೇಶಿಸಿ.'
  },
  "You haven't saved any schemes yet.": {
    en: "You haven't saved any schemes yet.",
    hi: 'आपने अभी तक कोई योजना सहेजी नहीं है।',
    kn: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಯೋಜನೆಗಳನ್ನು ಉಳಿಸಿಲ್ಲ.'
  },
  'Bookmark schemes from the explorer or recommendations to track eligibility and documents in one place.': {
    en: 'Bookmark schemes from the explorer or recommendations to track eligibility and documents in one place.',
    hi: 'पात्रता और दस्तावेजों को एक ही स्थान पर ट्रैक करने के लिए एक्सप्लोरर या अनुशंसाओं से योजनाओं को बुकमार्क करें।',
    kn: 'ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಎಕ್ಸ್‌ಪ್ಲೋರರ್ ಅಥವಾ ಶಿಫಾರಸುಗಳಿಂದ ಯೋಜನೆಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ.'
  },
  'Explore Schemes': { en: 'Explore Schemes', hi: 'योजनाएं खोजें', kn: 'ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' },
  'System Preferences': { en: 'System Preferences', hi: 'सिस्टम प्राथमिकताएं', kn: 'ವ್ಯವಸ್ಥೆಯ ಆದ್ಯತೆಗಳು' },
  'Platform Settings': { en: 'Platform Settings', hi: 'प्लेटफ़ॉर्म सेटिंग्स', kn: 'ವೇದಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  'Customize language, accessibility scaling, contrast modes, and privacy settings.': {
    en: 'Customize language, accessibility scaling, contrast modes, and privacy settings.',
    hi: 'भाषा, सुगम्यता स्केलिंग, कंट्रास्ट मोड और गोपनीयता सेटिंग्स को अनुकूलित करें।',
    kn: 'ಭಾಷೆ, ಪ್ರವೇಶಸಾಧ್ಯತೆಯ ಪ್ರಮಾಣ, ಕಾಂಟ್ರಾಸ್ಟ್ ವಿಧಾನಗಳು ಮತ್ತು ಗೌಪ್ಯತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.'
  },
  'Language Selection': { en: 'Language Selection', hi: 'भाषा चयन', kn: 'ಭಾಷೆ ಆಯ್ಕೆ' },
  'Choose your preferred interface language. The assistant and navigation will automatically adapt.': {
    en: 'Choose your preferred interface language. The assistant and navigation will automatically adapt.',
    hi: 'अपनी पसंदीदा इंटरफ़ेस भाषा चुनें। सहायक और नेविगेशन स्वचालित रूप से अनुकूलित हो जाएंगे।',
    kn: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಇಂಟರ್ಫೇಸ್ ಭಾಷೆಯನ್ನು ಆರಿಸಿ. ಸಹಾಯಕ ಮತ್ತು ನ್ಯಾವಿಗೇಷನ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುತ್ತವೆ.'
  },
  'Accessibility & Visual Ergonomics': { en: 'Accessibility & Visual Ergonomics', hi: 'सुगम्यता एवं दृश्य एर्गोनॉमिक्स', kn: 'ಪ್ರವೇಶಸಾಧ್ಯತೆ ಮತ್ತು ದೃಶ್ಯ ಸೌಕರ್ಯ' },
  'Text Zoom Scaling (Up to 200% reading comfort)': {
    en: 'Text Zoom Scaling (Up to 200% reading comfort)',
    hi: 'टेक्स्ट ज़ूम स्केलिंग (200% तक पढ़ने में आसानी)',
    kn: 'ಪಠ್ಯ ಗಾತ್ರ ಹೊಂದಾಣಿಕೆ (200% ವರೆಗೆ ಓದುವ ಸೌಕರ್ಯ)'
  },
  'High Contrast Mode': { en: 'High Contrast Mode', hi: 'उच्च कंट्रास्ट मोड', kn: 'ಉನ್ನತ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್' },
  'Enhanced contrast for low-vision and outdoor sunlight viewing': {
    en: 'Enhanced contrast for low-vision and outdoor sunlight viewing',
    hi: 'कम रोशनी और धूप में देखने के लिए बेहतर कंट्रास्ट',
    kn: 'ಕಡಿಮೆ ದೃಷ್ಟಿ ಮತ್ತು ಬಿಸಿಲಿನಲ್ಲಿ ಸುಲಭವಾಗಿ ನೋಡಲು ವರ್ಧಿತ ಕಾಂಟ್ರಾಸ್ಟ್'
  },
  'Active': { en: 'Active', hi: 'सक्रिय', kn: 'ಸಕ್ರಿಯ' },
  'Disabled': { en: 'Disabled', hi: 'निष्क्रिय', kn: 'ನಿಷ್ಕ್ರಿಯ' },
  'Reduced Motion Preference': { en: 'Reduced Motion Preference', hi: 'कम मोशन प्राथमिकता', kn: 'ಕಡಿಮೆ ಚಲನೆಯ ಆದ್ಯತೆ' },
  'Eliminates transition animations for vestibular motion sensitivity': {
    en: 'Eliminates transition animations for vestibular motion sensitivity',
    hi: 'मोशन संवेदनशीलता के लिए ट्रांज़िशन एनिमेशन हटाता है',
    kn: 'ಚಲನೆಯ ಸಂವೇದನೆಗಾಗಿ ಪರಿವರ್ತನೆಯ ಅನಿಮೇಷನ್‌ಗಳನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ'
  },
  'Account Security & Local Cache': { en: 'Account Security & Local Cache', hi: 'खाता सुरक्षा एवं स्थानीय कैश', kn: 'ಖಾತೆ ಭದ್ರತೆ ಮತ್ತು ಸ್ಥಳೀಯ ಸಂಗ್ರಹ' },
  'Signed in account:': { en: 'Signed in account:', hi: 'साइन इन खाता:', kn: 'ಸೈನ್ ಇನ್ ಮಾಡಲಾದ ಖಾತೆ:' },
  'Security token:': { en: 'Security token:', hi: 'सुरक्षा टोकन:', kn: 'ಭದ್ರತಾ ಟೋಕನ್:' },
  'Clear Local Cache & History': { en: 'Clear Local Cache & History', hi: 'स्थानीय कैश और इतिहास साफ़ करें', kn: 'ಸ್ಥಳೀಯ ಸಂಗ್ರಹ ಮತ್ತು ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಿ' },
  'Active Citizen Profile': { en: 'Active Citizen Profile', hi: 'सक्रिय नागरिक प्रोफ़ाइल', kn: 'ಸಕ್ರಿಯ ನಾಗರಿಕ ಪ್ರೊಫೈಲ್' },
  'Edit Profile': { en: 'Edit Profile', hi: 'प्रोफ़ाइल संपादित करें', kn: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ' },
  'Profile Completeness': { en: 'Profile Completeness', hi: 'प्रोफ़ाइल पूर्णता', kn: 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ' },
  'Complete': { en: 'Complete', hi: 'पूर्ण', kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ' },
  'A more complete profile enables the AI engine to calculate higher confidence match scores.': {
    en: 'A more complete profile enables the AI engine to calculate higher confidence match scores.',
    hi: 'अधिक पूर्ण प्रोफ़ाइल एआई इंजन को उच्च विश्वास मिलान स्कोर की गणना करने में सक्षम बनाती है।',
    kn: 'ಹೆಚ್ಚು ಪೂರ್ಣಗೊಂಡ ಪ್ರೊಫೈಲ್ ಎಐ ಇಂಜಿನ್‌ಗೆ ಹೆಚ್ಚಿನ ನಿಖರತೆಯ ಹೊಂದಾಣಿಕೆ ಅಂಕಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲು ಅನುಮತಿಸುತ್ತದೆ.'
  },
  'Livelihood & Sector': { en: 'Livelihood & Sector', hi: 'आजीविका एवं क्षेत्र', kn: 'ಜೀವನೋಪಾಯ ಮತ್ತು ವಲಯ' },
  'Primary Occupation:': { en: 'Primary Occupation:', hi: 'मुख्य व्यवसाय:', kn: 'ಮುಖ್ಯ ಉದ್ಯೋಗ:' },
  'Declared Annual Income:': { en: 'Declared Annual Income:', hi: 'घोषित वार्षिक आय:', kn: 'ಘೋಷಿತ ವಾರ್ಷಿಕ ಆದಾಯ:' },
  'Owns Agricultural Land:': { en: 'Owns Agricultural Land:', hi: 'कृषि भूमि का स्वामित्व:', kn: 'ಕೃಷಿ ಭೂಮಿ ಹೊಂದಿದ್ದೀರಾ:' },
  'Location & Demographics': { en: 'Location & Demographics', hi: 'स्थान एवं जनसांख्यिकी', kn: 'ಸ್ಥಳ ಮತ್ತು ಜನಸಂಖ್ಯಾ ವಿವರ' },
  'State of Residence:': { en: 'State of Residence:', hi: 'निवास का राज्य:', kn: 'ವಾಸಿಸುವ ರಾಜ್ಯ:' },
  'Gender Identity:': { en: 'Gender Identity:', hi: 'लिंग पहचान:', kn: 'ಲಿಂಗ ಗುರುತು:' },
  'Update Citizen Profile': { en: 'Update Citizen Profile', hi: 'नागरिक प्रोफ़ाइल अपडेट करें', kn: 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ' },
  'Update your basic criteria for re-evaluating scheme recommendations.': {
    en: 'Update your basic criteria for re-evaluating scheme recommendations.',
    hi: 'योजना सिफारिशों के पुनर्मूल्यांकन के लिए अपने बुनियादी मानदंडों को अपडेट करें।',
    kn: 'ಯೋಜನೆಗಳ ಶಿಫಾರಸುಗಳನ್ನು ಮರು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ನಿಮ್ಮ ಮೂಲ ಮಾನದಂಡಗಳನ್ನು ನವೀಕರಿಸಿ.'
  },
  'Save Profile': { en: 'Save Profile', hi: 'प्रोफ़ाइल सहेजें', kn: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ' },

  // Intro Video & Background Motion
  'Project Introduction': { en: 'Project Introduction', hi: 'परियोजना परिचय', kn: 'ಯೋಜನೆಯ ಪರಿಚಯ' },
  'Project Intro Motion': { en: 'Project Intro Motion', hi: 'परियोजना परिचय मोशन', kn: 'ಯೋಜನೆಯ ಪರಿಚಯ ಮೋಷನ್' },
  'Watch Project Intro': { en: 'Watch Project Intro', hi: 'परियोजना परिचय देखें', kn: 'ಯೋಜನೆಯ ಪರಿಚಯ ವೀಕ್ಷಿಸಿ' },
  'Intro Motion': { en: 'Intro Motion', hi: 'परिचय मोशन', kn: 'ಪರಿಚಯ ಮೋಷನ್' },
  'Register & Get Started': {
    en: 'Register & Get Started',
    hi: 'पंजीकरण करें और शुरुआत करें',
    kn: 'ನೋಂದಾಯಿಸಿ ಮತ್ತು ಪ್ರಾರಂಭಿಸಿ'
  },
  'Click anywhere to Register & Get Started': {
    en: 'Click anywhere to Register & Get Started',
    hi: 'पंजीकरण और शुरुआत के लिए कहीं भी क्लिक करें',
    kn: 'ನೋಂದಾಯಿಸಲು ಮತ್ತು ಪ್ರಾರಂಭಿಸಲು ಎಲ್ಲಿಯಾದರೂ ಕ್ಲಿಕ್ ಮಾಡಿ'
  },
  'Click anywhere on this screen to open registration form': {
    en: 'Click anywhere on this screen to open registration form',
    hi: 'पंजीकरण फॉर्म खोलने के लिए इस स्क्रीन पर कहीं भी क्लिक करें',
    kn: 'ನೋಂದಣಿ ಫಾರ್ಮ್ ತೆರೆಯಲು ಈ ಪರದೆಯ ಮೇಲೆ ಎಲ್ಲಿಯಾದರೂ ಕ್ಲಿಕ್ ಮಾಡಿ'
  },
  'Click to Register': { en: 'Click to Register', hi: 'पंजीकरण के लिए क्लिक करें', kn: 'ನೋಂದಣಿಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ' },
  'Click here to open Register Form →': {
    en: 'Click here to open Register Form →',
    hi: 'पंजीकरण फॉर्म खोलने के लिए यहाँ क्लिक करें →',
    kn: 'ನೋಂದಣಿ ಫಾರ್ಮ್ ತೆರೆಯಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ →'
  },
  'Watch this brief overview of how SEVA helps citizens discover, verify, and apply for government schemes.': {
    en: 'Watch this brief overview of how SEVA helps citizens discover, verify, and apply for government schemes.',
    hi: 'यह संक्षिप्त वीडियो देखें कि सेवा एआई नागरिकों को सरकारी योजनाओं को खोजने, सत्यापित करने और आवेदन करने में कैसे मदद करता है।',
    kn: 'ನಾಗರಿಕರು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಲು, ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸೇವಾ ಎಐ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ ಎಂಬುದರ ಕಿರು ವಿವರಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ.'
  },
  'Proceed to Register': { en: 'Proceed to Register', hi: 'पंजीकरण के लिए आगे बढ़ें', kn: 'ನೋಂದಣಿಗೆ ಮುಂದುವರಿಯಿರಿ' },
  'Skip / Explore Platform': { en: 'Skip / Explore Platform', hi: 'छोड़ें / प्लेटफ़ॉर्म देखें', kn: 'ಮುಂದುವರಿಯಿರಿ / ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ವೀಕ್ಷಿಸಿ' },
  "Don't show this intro automatically again": {
    en: "Don't show this intro automatically again",
    hi: 'यह परिचय दोबारा स्वचालित रूप से न दिखाएं',
    kn: 'ಈ ಪರಿಚಯವನ್ನು ಮತ್ತೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೋರಿಸಬೇಡಿ'
  }
};

/**
 * Intelligent Translation Lookup Function
 * Supports exact translation keys as well as literal English phrase lookups.
 */
export const t = (keyOrPhrase: string, lang: Language = 'en', fallback?: string): string => {
  if (!keyOrPhrase) return '';
  const language = (lang === 'hi' || lang === 'kn' ? lang : 'en') as Language;

  // 1. Direct key match
  if (TRANSLATIONS[keyOrPhrase] && TRANSLATIONS[keyOrPhrase][language]) {
    return TRANSLATIONS[keyOrPhrase][language];
  }

  // 2. Trimmed match
  const trimmed = keyOrPhrase.trim();
  if (TRANSLATIONS[trimmed] && TRANSLATIONS[trimmed][language]) {
    return TRANSLATIONS[trimmed][language];
  }

  // 3. Fallback to English translation entry if present
  if (TRANSLATIONS[trimmed] && TRANSLATIONS[trimmed]['en']) {
    return TRANSLATIONS[trimmed]['en'];
  }

  return fallback !== undefined ? fallback : keyOrPhrase;
};

/**
 * Category translation helper
 */
export const translateCategory = (cat: string, lang: Language = 'en'): string => {
  if (!cat) return '';
  const map: Record<string, Record<Language, string>> = {
    'Agriculture & Rural': { en: 'Agriculture & Rural', hi: 'कृषि एवं ग्रामीण विकास', kn: 'ಕೃಷಿ ಮತ್ತು ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ' },
    'Agriculture & Farmers': { en: 'Agriculture & Farmers', hi: 'कृषि एवं किसान कल्याण', kn: 'ಕೃಷಿ ಮತ್ತು ರೈತ ಕಲ್ಯಾಣ' },
    'Healthcare & Insurance': { en: 'Healthcare & Insurance', hi: 'स्वास्थ्य एवं चिकित्सा बीमा', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ವಿಮೆ' },
    'Healthcare & Wellness': { en: 'Healthcare & Wellness', hi: 'स्वास्थ्य एवं कल्याण', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮ' },
    'Housing & Urban Development': { en: 'Housing & Urban Development', hi: 'आवास एवं शहरी विकास', kn: 'ವಸತಿ ಮತ್ತು ನಗರಾಭಿವೃದ್ಧಿ' },
    'Housing & Shelter': { en: 'Housing & Shelter', hi: 'आवास एवं आश्रय', kn: 'ವಸತಿ ಮತ್ತು ಆಶ್ರಯ' },
    'Education & Youth': { en: 'Education & Youth', hi: 'शिक्षा एवं युवा विकास', kn: 'ಶಿಕ್ಷಣ ಮತ್ತು ಯುವಜನತೆ' },
    'Women & Child Welfare': { en: 'Women & Child Welfare', hi: 'महिला एवं बाल विकास', kn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಕಲ್ಯಾಣ' },
    'Women & Child': { en: 'Women & Child', hi: 'महिला एवं बाल कल्याण', kn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳು' },
    'Senior Citizens & Pension': { en: 'Senior Citizens & Pension', hi: 'वरिष्ठ नागरिक एवं पेंशन', kn: 'ಹಿರಿಯ ನಾಗರಿಕರು ಮತ್ತು ಪಿಂಚಣಿ' },
    'Senior Citizens': { en: 'Senior Citizens', hi: 'वरिष्ठ नागरिक', kn: 'ಹಿರಿಯ ನಾಗರಿಕರು' },
    'Business & Entrepreneurship': { en: 'Business & Entrepreneurship', hi: 'व्यापार एवं उद्यमिता', kn: 'ವ್ಯವಹಾರ ಮತ್ತು ಉದ್ಯಮಶೀಲತೆ' },
    'Business & Loans': { en: 'Business & Loans', hi: 'व्यापार एवं ऋण', kn: 'ವ್ಯವಹಾರ ಮತ್ತು ಸಾಲಗಳು' },
    'Social Welfare & Empowerment': { en: 'Social Welfare & Empowerment', hi: 'सामाजिक कल्याण एवं सशक्तिकरण', kn: 'ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಸಬಲೀಕರಣ' },
    'Social Welfare': { en: 'Social Welfare', hi: 'सामाजिक कल्याण', kn: 'ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ' }
  };

  if (map[cat] && map[cat][lang]) return map[cat][lang];
  return t(cat, lang);
};

/**
 * Standard Document translation helper
 */
export const translateDocument = (doc: string, lang: Language = 'en'): string => {
  if (!doc) return '';
  const d = doc.toLowerCase();

  if (d.includes('aadhaar')) return t('doc_aadhaar', lang);
  if (d.includes('ration')) return t('doc_ration_card', lang);
  if (d.includes('income')) return t('doc_income_cert', lang);
  if (d.includes('caste')) return t('doc_caste_cert', lang);
  if (d.includes('passbook') || d.includes('bank')) return t('doc_bank_passbook', lang);
  if (d.includes('land') || d.includes('khasra') || d.includes('rtc') || d.includes('pahani')) return t('doc_land_records', lang);
  if (d.includes('domicile') || d.includes('residence')) return t('doc_domicile_cert', lang);
  if (d.includes('mobile')) return t('doc_mobile_linked', lang);
  if (d.includes('disability')) return t('doc_disability_cert', lang);

  return t(doc, lang);
};
