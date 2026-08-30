import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES, ALL_PROMPTS } from './data/prompts';
import { B2B_SERVICES, PAIN_POINTS, USE_CASES, B2B_PROMPT_CATEGORIES, B2B_PROMPTS, CAPABILITIES, METHODOLOGY_STEPS } from './data/b2bData';
import { B2BPrompt } from './types';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { AccessibilityStatementModal } from './components/AccessibilityStatementModal';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { CookieBanner } from './components/CookieBanner';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { AiChatbot } from './components/AiChatbot';

// מערכת התראות (Toast)
const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
    <div className="bg-slate-900 border border-cyan-500/50 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-base md:text-lg flex items-center gap-3">
      <span>{message}</span>
      <span className="text-2xl">🚀</span>
    </div>
  </div>
);

// מיפוי הטקסטים הראשוניים לפי השירות שנבחר
const serviceMessages: Record<string, string> = {
  sop: "היי אוהד,\nאנו מעוניינים באפיון תהליכי עבודה ומסמכים (SOPs, הצעות מחיר ומסמכי דרישות) באמצעות כלי AI. נשמח לתאם שיחת אפיון ראשונית.",
  workshops: "היי אוהד,\nאנו מעוניינים בסדנאות Hands-on מעשיות והכשרת צוותים/הנהלה לעבודה יומיומית עם כלי AI. נשמח לקבל פרטים וסילבוס מותאם.",
  consulting: "היי אוהד,\nאנו מעוניינים באבחון וייעוץ ממוקד לזיהוי צווארי בקבוק והחזר השקעה (ROI) אמיתי בעסק. נשמח לתאם שיחת אבחון."
};

const App: React.FC = () => {
  // --- ניהול תצוגה וניתוב ---
  const [mainView, setMainView] = useState<'home' | 'prompts'>('home');
  const [activeB2BCategory, setActiveB2BCategory] = useState<string>('all');
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setIsTermsOfServiceOpen] = useState(false);
  const [isAccessibilityStatementOpen, setIsAccessibilityStatementOpen] = useState(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState(() => {
    return !localStorage.getItem('b2b_cookie_consent');
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- ניהול מוזיקת רקע וקריוקי סלוגן ---
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [sloganPanelState, setSloganPanelState] = useState<'hidden' | 'expanded' | 'collapsed'>('collapsed');
  const [isSloganShrinking, setIsSloganShrinking] = useState(false);
  const [isSloganExploding, setIsSloganExploding] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [shouldPulseCTA, setShouldPulseCTA] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sloganLines = [
    ["מפסיקים", "לשחק", "עם", "AI."],
    ["מטמיעים", "תשתית", "סוכנים", "ואוטומציה", "שמייצרת", "תוצאות."],
    ["בינה", "לתעשייה;", "שמים", "את", "הבינה", "בעשייה."],
    ["תתאמו", "שיחת", "אבחון", "והבנת", "צרכים", "עוד", "היום."]
  ];

  useEffect(() => {
    // שמע וסלוגן — רק בלחיצה על המיקרופון (ללא הפעלה אוטומטית בטעינה / לחיצה ראשונה)
    const audio = new Audio('/מוזיקת רקע.mp4');
    audio.loop = false;
    audio.volume = 0.3;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      const totalWords = sloganLines.reduce((acc, line) => acc + line.length, 0);
      const activeIdx = Math.min(totalWords - 1, Math.floor(progress * totalWords));
      setActiveWordIndex(activeIdx);
    };

    const handleEnded = () => {
      setSloganPanelState('collapsed');
      setIsPlayingMusic(false);
      setShouldPulseCTA(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playMusicFromMicrophone = () => {
    if (!audioRef.current) return;
    
    // אם המוזיקה כבר מנגנת ברקע, רק נפתח מחדש את חלונית המילים עם אפקט
    if (isPlayingMusic) {
      setIsSloganExploding(true);
      setSloganPanelState('expanded');
      setTimeout(() => setIsSloganExploding(false), 400);
      return;
    }

    // אחרת, נפעיל מחדש מההתחלה
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlayingMusic(true);
      setIsSloganExploding(true);
      setSloganPanelState('expanded');
      setShouldPulseCTA(false);
      setTimeout(() => setIsSloganExploding(false), 400);
    }).catch(err => console.log('Audio playback failed from microphone:', err));
  };

  const collapseSlogan = () => {
    setIsSloganShrinking(true);
    setTimeout(() => {
      setSloganPanelState('collapsed');
      setIsSloganShrinking(false);
    }, 380);
  };

  const closeSloganAndStopMusic = () => {
    setIsSloganShrinking(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingMusic(false);
      setSloganPanelState('collapsed');
      setIsSloganShrinking(false);
      setShouldPulseCTA(false);
    }, 380);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
      setSloganPanelState('collapsed');
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
        setSloganPanelState('expanded');
      }).catch(err => console.log('Audio playback failed:', err));
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // זיהוי מכשירי מגע וטאבלטים (כמו אייפד) לשיפור וחלקות התצוגה
  useEffect(() => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) {
      document.documentElement.classList.add('is-touch-device');
    }
  }, []);

  // --- ניהול מנעול פרומפטים פרימיום (Gating) ---
  const [unlockedPremium, setUnlockedPremium] = useState<boolean>(() => {
    return localStorage.getItem('b2b_leads_unlocked') === 'true';
  });
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pendingPromptToCopy, setPendingPromptToCopy] = useState<B2BPrompt | null>(null);

  // --- ניהול חיפוש וממשק ---
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('הפעולה בוצעה בהצלחה!');

  // העתקת מושג מקצועי והצגת טוסט הסבר
  const triggerConceptExplanation = (concept: string, explanation?: string) => {
    navigator.clipboard.writeText(concept).then(() => {
      localStorage.setItem('last_copied_concept', concept); // שמירה לטובת הדבקה בצ'אטבוט
      setToastMessage(`הועתק: "${concept}" 📋 ניתן להדביק כעת בחלון הצ׳אטבוט להסבר.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = concept;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      localStorage.setItem('last_copied_concept', concept);
      setToastMessage(`הועתק: "${concept}" 📋 ניתן להדביק כעת בחלון הצ׳אטבוט להסבר.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    });
  };

  // --- ניהול טופס לידים ---
  const [leadData, setLeadData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const contactFormRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const methodologyRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // בדיקת ניתוב URL ושתילת פרמטר service בטופס במידה וקיים וכן פתיחה אוטומטית של הצ'אטבוט
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/prompts')) {
      setMainView('prompts');
    }
    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
    const selectedService = urlParams.get("service");
    if (selectedService && serviceMessages[selectedService]) {
      setLeadData(prev => ({ ...prev, message: serviceMessages[selectedService] }));
      setTimeout(() => {
        contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }

  }, []);

  // פונקציית שתילת טקסט וגלילה לטופס בלחיצה על כפתור שירות
  const prefillServiceAndScroll = (serviceKey: string) => {
    if (serviceMessages[serviceKey]) {
      setLeadData(prev => ({ ...prev, message: serviceMessages[serviceKey] }));
    }
    setMainView('home');
    setTimeout(() => {
      contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // פונקציית אימות למספר טלפון ישראלי (נייד או קווי, 9-10 ספרות)
  const isValidIsraeliPhone = (phoneStr: string): boolean => {
    if (!phoneStr) return false;
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('972')) {
      const local = '0' + digits.slice(3);
      return local.length === 10 || local.length === 9;
    }
    if (digits.startsWith('05')) {
      return digits.length === 10;
    }
    if (/^0[23489]/.test(digits)) {
      return digits.length === 9;
    }
    return false;
  };

  // אימות אימייל — בלי HTML pattern (דפדפנים עם דגל v שוברים אותו)
  const isValidEmail = (emailStr: string): boolean => {
    if (!emailStr) return false;
    const cleaned = emailStr.trim().replace(/[\u200e\u200f\u202a-\u202e]/g, '');
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(cleaned);
  };

  // שליחת ליד: ארכיון ב-Netlify Forms + אוטומציה פנימית ב-/api/lead
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // אימות תקינות מספר טלפון ישראלי
    if (!isValidIsraeliPhone(leadData.phone)) {
      setToastMessage('נא להזין מספר טלפון תקין (9-10 ספרות, לדוגמה: 050-1234567) ⚠️');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    // אימות תקינות כתובת אימייל
    if (!isValidEmail(leadData.email)) {
      setEmailTouched(true);
      setToastMessage('נא להזין כתובת דוא״ל תקינה (לדוגמה: name@company.com) ⚠️');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsSubmittingLead(true);

    try {
      const userName = leadData.name.trim();
      const companyName = leadData.company.trim();
      const combinedIdentity = companyName ? `${userName} (${companyName})` : userName;

      const formElement = e.currentTarget;
      const formData = new FormData(formElement);
      formData.set('full_name', combinedIdentity);
      formData.set('full_identity', combinedIdentity);
      const netlifyBody = new URLSearchParams(formData as any).toString();

      const leadPayload = {
        full_name: combinedIdentity,
        full_identity: combinedIdentity,
        user_name: userName,
        company_name: companyName,
        company: leadData.company,
        phone: leadData.phone,
        email: leadData.email,
        message: leadData.message,
        created_at: new Date().toISOString()
      };

      await Promise.allSettled([
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: netlifyBody,
        }),
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload),
        })
      ]);
    } catch (err) {
      console.log('Form submission handled:', err);
    } finally {
      setIsSubmittingLead(false);
      setLeadSubmitted(true);
      setUnlockedPremium(true);
      localStorage.setItem('b2b_leads_unlocked', 'true');
      setShowUnlockModal(false);
      setToastMessage('פנייתך התקבלה בהצלחה! אחזור אליך לשיחת אבחון בהקדם 🚀');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleB2BPromptClick = (prompt: B2BPrompt) => {
    if (prompt.isPremium && !unlockedPremium) {
      setPendingPromptToCopy(prompt);
      setShowUnlockModal(true);
    } else {
      handleCopy(prompt.text, prompt.id);
    }
  };

  const handleCopy = (text: string, id: string) => {
    const performCopy = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopiedId(id);
        setToastMessage('הפרומפט הועתק בהצלחה! 📋');
        setShowToast(true);
        setTimeout(() => { setCopiedId(null); setShowToast(false); }, 2500);
      } catch (err) { console.error(err); }
    };
    performCopy();
  };

  const openContactView = () => {
    setMainView('home');
    setTimeout(() => {
      contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const scrollToCapabilities = () => {
    setMainView('home');
    setTimeout(() => {
      capabilitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const scrollToMethodology = () => {
    setMainView('home');
    setTimeout(() => {
      methodologyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const scrollToAbout = () => {
    setMainView('home');
    setTimeout(() => {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // מעבר לתצוגת מאגר הפרומפטים וגלילה לראש העמוד
  const goToPromptsView = () => {
    setMainView('prompts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // איחוד כל 1,000 הפרומפטים מכל הקטגוריות
  const fullPromptPool = useMemo(() => {
    const combined: B2BPrompt[] = [...B2B_PROMPTS];
    
    Object.entries(ALL_PROMPTS).forEach(([catKey, promptList]) => {
      promptList.forEach((p) => {
        combined.push({
          id: p.id,
          category: catKey,
          subCategory: p.subCategory || 'כללי',
          title: p.title,
          explanation: p.explanation,
          text: p.text,
          isPremium: false,
          createdAt: p.createdAt || Date.now()
        });
      });
    });

    return combined;
  }, []);

  // איחוד כל הקטגוריות
  const combinedCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string }>();
    B2B_PROMPT_CATEGORIES.forEach(c => map.set(c.id, { id: c.id, name: c.name, icon: c.icon }));
    CATEGORIES.forEach(c => {
      if (!map.has(c.id)) {
        map.set(c.id, { id: c.id, name: c.name, icon: c.icon });
      }
    });
    return Array.from(map.values());
  }, []);

  // סינון 1,000 פרומפטים עסקיים
  const filteredB2BPrompts = useMemo(() => {
    let pool = fullPromptPool;
    if (activeB2BCategory !== 'all') {
      pool = pool.filter(p => p.category === activeB2BCategory);
    }
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      pool = pool.filter(p => 
        p.title.toLowerCase().includes(low) || 
        p.text.toLowerCase().includes(low) || 
        p.explanation.toLowerCase().includes(low) ||
        p.subCategory.toLowerCase().includes(low)
      );
    }
    return pool;
  }, [fullPromptPool, activeB2BCategory, searchTerm]);

  const combinedIdentityValue = leadData.company.trim() ? `${leadData.name.trim()} (${leadData.company.trim()})` : leadData.name.trim();

  // רכיב סקשן יצירת קשר ללא שינוי בשדות
  const renderLeadForm = () => (
    <div id="contact" ref={contactFormRef} className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none text-right animate-fadeIn">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-bold mb-4 border border-cyan-500/30 uppercase tracking-wider">
          פנייה מקצועית לארגונים
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">בואו נבדוק התאמה לארגון שלכם</h3>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
          השאר פרטים, ספר לי בקצרה מה האתגר, ואחזור אליך לשיחת אפיון ראשונית ללא עלות.
        </p>
      </div>

      {leadSubmitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/50 p-10 rounded-3xl text-center animate-fadeIn">
          <div className="text-6xl mb-4">🎉</div>
          <h4 className="text-3xl font-black text-emerald-900 dark:text-emerald-200 mb-3">תודה רבה! הפנייה התקבלה בהצלחה</h4>
          <p className="text-emerald-800 dark:text-emerald-300 font-bold text-base md:text-lg max-w-xl mx-auto mb-6">
            קיבלתי את פרטי הארגון שלך. אחזור אליך בהקדם לשיחת אבחון ואפיון ראשונית.
          </p>
          <button
            onClick={() => {
              setLeadSubmitted(false);
              setLeadData({
                name: '',
                company: '',
                phone: '',
                email: '',
                message: ''
              });
            }}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25"
          >
            שליחת פנייה נוספת ↩️
          </button>
        </div>
      ) : (
        <form
          id="contactForm"
          name="contact"
          method="POST"
          data-netlify="true"
          onSubmit={handleLeadSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" id="combined_name" name="full_identity" value={combinedIdentityValue} />
          <input type="hidden" name="full_name" value={combinedIdentityValue} />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="user_name" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">שם מלא *</label>
              <input
                id="user_name"
                type="text"
                name="user_name"
                required
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                placeholder="ישראל ישראלי"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">שם החברה / ארגון</label>
              <input
                id="company_name"
                type="text"
                name="company"
                value={leadData.company}
                onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                placeholder="שם החברה (לא חובה)"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="phone" className="block text-xs font-black text-slate-700 dark:text-slate-300">מספר טלפון *</label>
                {leadData.phone && !isValidIsraeliPhone(leadData.phone) && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">נא להזין מספר תקין (9-10 ספרות)</span>
                )}
              </div>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                pattern="^(?:0(?:5[0-9]|[23489])[0-9]{7}|\+972(?:5[0-9]|[23489])[0-9]{7})$"
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                placeholder="050-1234567"
                className={`w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border ${
                  leadData.phone && !isValidIsraeliPhone(leadData.phone)
                    ? 'border-amber-500/70 focus:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-cyan-500'
                } outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm`}
                dir="ltr"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="user_email" className="block text-xs font-black text-slate-700 dark:text-slate-300">דוא״ל לחזרה *</label>
                {emailTouched && leadData.email && !isValidEmail(leadData.email) && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">פורמט דוא״ל לא תקין</span>
                )}
              </div>
              <input
                id="user_email"
                type="email"
                name="email"
                required
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@company.com"
                className={`w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border ${
                  emailTouched && leadData.email && !isValidEmail(leadData.email)
                    ? 'border-amber-500/70 focus:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-cyan-500'
                } outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm`}
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">פרטי הפנייה (ניתן לעריכה) *</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={leadData.message}
              onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
              placeholder="ספרו בקצרה על הצורך או האתגר שלכם..."
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all resize-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 text-right">
            <input
              id="spam_consent_contact"
              type="checkbox"
              name="marketing_consent"
              className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="spam_consent_contact" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
              אני מאשר קבלת תוכן שיווקי ודברי פרסומת במייל/SMS
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmittingLead}
              className="btn-submit w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl shadow-xl hover:shadow-cyan-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingLead ? 'שולח פנייה...' : 'תיאום שיחת אבחון ראשונית 🚀'}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">מעדיפים פנייה מהירה וישירה?</span>
              <a
                href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>שליחת הודעה בוואטסאפ (053-6244330)</span>
                <span>💬</span>
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen font-assistant text-right relative selection:bg-cyan-500 selection:text-black transition-colors duration-300 ${isDarkMode ? 'bg-[#070A10] text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 transition-colors ${isDarkMode ? 'bg-[#070A10]/95 border-slate-800/80 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMainView('home')}>
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 text-xl font-black shadow-lg">🤖</div>
            <div className="text-right">
              <h1 className={`text-xl md:text-2xl font-black leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                בינה לתעשייה <span className="text-xs font-bold text-cyan-500 tracking-wider">ENTERPRISE AI</span>
              </h1>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button onClick={scrollToCapabilities} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer">השירותים</button>
            <button onClick={scrollToMethodology} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer">תהליך האפיון</button>
            <button onClick={goToPromptsView} className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all cursor-pointer ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40' : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>מאגר הפרומפטים</button>
            <button onClick={scrollToAbout} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer">אודות</button>
            <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl font-black text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all flex items-center gap-1">
              <span>קהילה</span>
              <span className="text-xs">👥</span>
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "מעבר למצב בהיר ☀️" : "מעבר למצב כהה 🌙"}
              className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 rounded-xl transition-all font-black text-sm flex items-center justify-center cursor-pointer shadow-md"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <a
              href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
              title="פנייה מהירה בוואטסאפ (053-6244330)"
            >
              <span className="hidden sm:inline">וואטסאפ</span>
              <span>💬</span>
            </a>

            <button 
              onClick={() => {
                openContactView();
                setShouldPulseCTA(false); // הפסקת ההבהוב בלחיצה
              }} 
              className={`px-5 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer ${
                shouldPulseCTA 
                  ? 'animate-pulse ring-4 ring-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.95)] border border-cyan-300 scale-105' 
                  : 'hover:shadow-cyan-500/20'
              }`}
            >
              <span>שיחת אבחון</span>
              <span>📞</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex lg:hidden items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={scrollToCapabilities} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">השירותים</button>
          <button onClick={scrollToMethodology} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">תהליך האפיון</button>
          <button onClick={goToPromptsView} className={`px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>מאגר הפרומפטים</button>
          <button onClick={scrollToAbout} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">אודות</button>
          <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-blue-600 text-white">קהילה 👥</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* === VIEW 1: ENTERPRISE AI LANDING PAGE (HOME) === */}
        {mainView === 'home' && (
          <div className="space-y-24 animate-fadeIn">
            
            {/* 1. HERO SECTION */}
            <section className="text-center py-12 md:py-24 relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs md:text-sm font-bold mb-8 border border-cyan-500/30 shadow-sm">
                <span>אפיון תהליכים • סדנאות Hands-on • אוטומציה מעשית</span>
              </div>
              
              <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] max-w-5xl mx-auto mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                מטמיעים AI בעבודה האמיתית,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-400">
                  לא במצגות.
                </span>
              </h1>

              <p className={`text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                אני מלווה עסקים וארגונים באפיון תהליכים, כתיבת מסמכי עבודה (SOPs) ואוטומציות מעשיות באמצעות כלי AI מתקדמים.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
                <button
                  onClick={openContactView}
                  className="w-full sm:w-auto px-8 py-4.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>תיאום שיחת אבחון</span>
                  <span>🚀</span>
                </button>

                <a
                  href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-400/40"
                >
                  <span>וואטסאפ ישיר: 053-6244330</span>
                  <span>💬</span>
                </a>

                <button
                  onClick={scrollToCapabilities}
                  className={`w-full sm:w-auto px-6 py-4.5 border font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${isDarkMode ? 'bg-[#0D131F] border-slate-800 text-slate-200 hover:border-cyan-500/50' : 'bg-white border-slate-300 text-slate-800 hover:border-cyan-500 shadow-md'}`}
                >
                  <span>השירותים ↓</span>
                </button>
              </div>
            </section>

            {/* 2. WHY CUSTOM AI SECTION (המציאות בשטח) */}
            <section className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none">
              <div className="text-center mb-12">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">המציאות בשטח</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">למה רוב יוזמות ה-AI בעסקים נתקעות?</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* הבעיה */}
                <div className="bg-slate-50 dark:bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-red-500/20 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-black border border-red-500/30">
                    <span>⚠️ הבעיה השכיחה</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">רכישת כלים ללא חיבור לתהליכים</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    חברות קונות מנויים למודלי AI או כלים גנריים, אבל העובדים לא יודעים איך להשתמש בהם נכון, התהליכים נשארים ידניים, וההשקעה יורדת לטמיון.
                  </p>
                </div>

                {/* הפתרון */}
                <div className="bg-slate-50 dark:bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-cyan-500/30 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30">
                    <span>✓ הפתרון של בינה לתעשייה</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">אפיון תהליכים + הכשרה מעשית</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    שילוב בין ניהול מוצר ואפיון תהליכים מדויק לבין הכשרה מעשית hands-on. אנחנו מתאימים את הכלים ישירות למשימות האמיתיות של העסק.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. CORE SERVICES (3 שירותים ממוקדים ונקיים) */}
            <section ref={capabilitiesRef} className="py-6 space-y-12">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">שירותי הליבה</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">3 מסלולי עבודה ממוקדים לתוצאות</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                  ללא מורכבות מיותרת — פתרונות מדויקים המייצרים חיסכון בשעות עבודה וערך עסקי מיידי.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {B2B_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl dark:shadow-none"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/30">
                          {srv.num}
                        </span>
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {srv.icon}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                        {srv.subtitle}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {srv.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium leading-relaxed mb-6">
                        {srv.shortDesc}
                      </p>

                      <div className="space-y-2.5 mb-8">
                        {srv.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <span className="text-cyan-500 font-bold mt-0.5">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {srv.techBadges && srv.techBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {srv.techBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-3 py-1 bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold rounded-xl"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => prefillServiceAndScroll(srv.serviceKey || 'sop')}
                      className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white font-black text-sm transition-all text-center border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      {srv.ctaText} ➔
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 3.5 SOCIAL PROOF & TESTIMONIALS (המלצות ומשובים מהשטח) */}
            <section className="bg-gradient-to-b from-slate-100/80 to-white dark:from-[#0D131F] dark:to-[#070A10] rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none space-y-8 animate-fadeIn">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="inline-flex items-center px-4 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30 uppercase tracking-wider">
                  תוצאות ומשובים מהשטח
                </span>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">
                  מה מנהלים ועסקים מספרים על העבודה איתי
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#070A10] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-cyan-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-sm">★★★★★</span>
                      <span className="text-2xl">⚡</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      "הסדנה של אוהד חסכה לצוות שלנו לפחות 15 שעות שבועיות של כתיבת הצעות מחיר ונהלים. הכל היה ממוקד ומעשי על הדאטה האמיתי שלנו, ללא התנגדויות מצד העובדים."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <h4 className="font-black text-xs md:text-sm text-slate-900 dark:text-white">רועי ש.</h4>
                    <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">סמנכ״ל תפעול בחברת שירותים</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#070A10] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-cyan-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-sm">★★★★★</span>
                      <span className="text-2xl">🎯</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      "במקום עוד כלי מדף גנרי שלא מתחבר לשגרה, אוהד אפיין לנו תהליך SOP מובנה שעובד כל יום בדיוק מרבי ומקצר זמני תגובה ללקוחות ביותר מ-70%."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <h4 className="font-black text-xs md:text-sm text-slate-900 dark:text-white">דנה ל.</h4>
                    <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">מנהלת מוצר ופרויקטים</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#070A10] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm hover:border-cyan-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-sm">★★★★★</span>
                      <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      "האבחון הממוקד של צווארי הבקבוק נתן לנו בהירות מיידית איפה שווה להשקיע באוטומציות AI ואיפה לא לבזבז זמן וכסף. תוצאות וחיסכון בשטח כבר בחודש הראשון."
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <h4 className="font-black text-xs md:text-sm text-slate-900 dark:text-white">איתי מ.</h4>
                    <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">מנכ״ל ובעלים</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. METHODOLOGY (מתודולוגיית העבודה - 4 השלבים) */}
            <section ref={methodologyRef} className="bg-white dark:bg-[#0D131F] text-slate-900 dark:text-white rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none">
              <div className="text-center mb-14">
                <span className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/30 uppercase tracking-wider mb-2">
                  תהליך העבודה
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-4">מאבחון ועד להטמעה מלאה</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
                  תהליך מובנה ומסודר שמבטיח שכל כלי AI המוטמע בעסק מביא תוצאות ברורות ומיידיות.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {METHODOLOGY_STEPS.map(st => (
                  <div key={st.stepNum} className="bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">{st.stepNum}</span>
                        <span className="text-3xl group-hover:scale-110 transition-transform">{st.icon}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                        {st.title}
                      </h3>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-4">{st.shortDesc}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{st.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. PROMPT LIBRARY SECTION */}
            <section ref={communityRef} className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none text-right">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-bold mb-4 inline-block border border-cyan-500/30">
                      מאגר הידע והפרומפטים
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">מאגר הפרומפטים המקצועי של "מדברים בינה"</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-base md:text-xl font-medium leading-relaxed">
                      דוגמאות והמחשות להנדסת פרומפטים נכונה. סננו לפי נושא, העתיקו והתנסו בעצמכם כדי להבין איך לרתום את המודל למשימות מוגדרות.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={goToPromptsView} className="px-6 py-3.5 bg-cyan-500 text-white font-black rounded-2xl text-xs hover:bg-cyan-400 transition-all shadow-md flex items-center gap-2">
                      <span>מאגר הפרומפטים והתבניות לעסקים</span>
                      <span>📚</span>
                    </button>
                    <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#1877F2] text-white font-black rounded-2xl text-xs hover:bg-[#166fe5] transition-all shadow-md flex items-center gap-2">
                      <span>כניסה לקהילת "מדברים בינה"</span>
                      <span>👥</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-inner text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-3xl mx-auto">🚀</div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    אוטוריטה וחדשנות
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    הובלת קהילת הידע והפרומפטים המובילה בישראל עם תובנות עדכניות ומתודולוגיות עבודה מוכחות.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. ABOUT (מי מוביל את התהליך) */}
            <section ref={aboutRef} className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 text-right animate-fadeIn shadow-2xl dark:shadow-none">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column: Avatar & LinkedIn */}
                <div className="lg:col-span-4 flex flex-col items-center text-center bg-slate-50 dark:bg-[#070A10] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl mb-6 border-4 border-slate-200 dark:border-slate-800 ring-4 ring-cyan-500/20 bg-slate-100 dark:bg-[#070A10] flex items-center justify-center p-2">
                    <img
                      src="/ohad.jpeg"
                      alt="אוהד ברעם - מנהל מוצר ומוביל טרנספורמציה"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">אוהד ברעם</h3>
                  <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-6">מנהל מוצר ואפיון תהליכים עסקיים</p>
                  
                  <a
                    href="https://www.linkedin.com/in/ohad-baram"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-[#0A66C2] hover:bg-[#084e96] text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>פרופיל LinkedIn מקצועי</span>
                    <span className="text-base">🔗</span>
                  </a>
                </div>

                {/* Right Column: Bio */}
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">מי מוביל את התהליך</span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                      מומחיות בניהול מוצר ואפיון תהליכים יחד עם הנדסת AI מעשית
                    </h2>
                    
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                      <p>
                        <strong className="text-slate-900 dark:text-white font-black text-xl block mb-2">נעים להכיר, שמי אוהד ברעם.</strong>
                      </p>
                      <p>
                        אני מנהל מוצר בכיר ובעל תואר שני בניהול ארגוני שירות בהצטיינות. המומחיות שלי היא לתרגם צרכים עסקיים מורכבים לתהליכי עבודה ברורים, מסמכי אפיון חכמים (SOPs/PRDs) ופתרונות AI שמייצרים ערך אמיתי בשטח.
                      </p>
                      <p>
                        לאורך השנים ליוויתי והובלתי תהליכים מורכבים משלב האבחון והגדרת הדרישות ועד להטמעה מלאה בקרב צוותים ועובדים. אני מאמין שהמפתח להצלחה ב-AI אינו "עוד כלי מדף", אלא התאמה מדויקת לתהליכי העבודה היומיומיים של העסק והכשרה מעשית של האנשים שמפעילים אותם.
                      </p>
                    </div>
                  </div>

                  {/* 3 Bullets */}
                  <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-cyan-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-cyan-700 dark:text-cyan-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>אפיון תהליכים מעמיק</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">בניית מסמכי SOPs ונהלי עבודה חכמים ומדויקים.</div>
                    </div>
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-blue-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-blue-700 dark:text-blue-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>🎓</span>
                        <span>הכשרה מעשית Hands-on</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">סדנאות ממוקדות על משימות אמת של העסק.</div>
                    </div>
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-emerald-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-emerald-700 dark:text-emerald-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>📈</span>
                        <span>מחויבות ל-ROI וחיסכון בזמן</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">חיסכון של עשרות שעות עבודה ידניות בחודש.</div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 6.5. COMPARISON SECTION (למה לעבוד איתי? ההבדל בתוצאות) */}
            <section className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none space-y-10 animate-fadeIn">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30 uppercase tracking-wider">
                  למה לעבוד איתי?
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                  מומחיות בניהול מוצר במקום הבטחות שיווקיות
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                  ההבדל בין פתרונות שבירים לבין הטמעה מעשית שעובדת בשטח
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Comparison Item 1 */}
                <div className="bg-slate-50 dark:bg-[#070A10] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 block mb-1.5">🛑 בשוק הרגיל</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        בונים תהליכים שטחיים שנשברים בכל שינוי קטן, ללא תיעוד, ללא נהלים וללא טיפול בשגיאות.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ איתי</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        אפיון תהליך מעמיק, מסמכי SOPs מסודרים ומתודולוגיה מובנית שמייצרת תוצרים אמינים לאורך זמן.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Item 2 */}
                <div className="bg-slate-50 dark:bg-[#070A10] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 block mb-1.5">🛑 בשוק הרגיל</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        קונים מנויים ל-ChatGPT/Claude ומשאירים את העובדים לנסות "להסתדר לבד" ללא הדרכה.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ איתי</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        סדנאות Hands-on מעשיות ותרגול ישיר על משימות אמת מהעסק עד לאימוץ מלא ועצמאי של הצוות.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Item 3 */}
                <div className="bg-slate-50 dark:bg-[#070A10] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 block mb-1.5">🛑 בשוק הרגיל</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        הבטחות שיווקיות על "מהפכות ענק" שמתמסמסות ללא חיסכון מוכח בזמן או בעלויות.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ איתי</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        אבחון ממוקד לזיהוי צווארי הבקבוק, חיסכון מיידי בשעות עבודה והחזר השקעה (ROI) ברור ומדיד.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. CONTACT FORM AT BOTTOM OF HOME */}
            {renderLeadForm()}
          </div>
        )}

        {/* === VIEW 2: B2B PROMPT LIBRARY (/prompts) === */}
        {mainView === 'prompts' && (
          <section className="animate-fadeIn space-y-10">
            <div className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xl dark:shadow-none">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black mb-4 inline-block border border-cyan-500/30">
                ספריית 1,000+ התבניות והפרומפטים לעסקים ולמנהלים
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">מאגר הפרומפטים המקצועי של "מדברים בינה"</h2>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-3xl mx-auto">
                דוגמאות והמחשות להנדסת פרומפטים נכונה. סננו לפי נושא, העתיקו והתנסו בעצמכם כדי להבין איך לרתום את המודל למשימות מוגדרות.
              </p>
            </div>

            {/* Search & Categories */}
            <div className="max-w-3xl mx-auto flex gap-4">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
                placeholder="חפשו תבנית עבודה עסקית..."
                className="flex-grow px-8 py-5 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium shadow-sm"
              />
              <button onClick={() => setSearchTerm(searchInput)} className="px-8 py-5 bg-cyan-500 text-white font-black rounded-2xl hover:bg-cyan-400 transition-all shadow-md">חפש</button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-6xl mx-auto py-2">
              <button
                onClick={() => { setActiveB2BCategory('all'); setSearchTerm(''); }}
                className={`px-5 py-3 rounded-2xl font-black text-xs md:text-sm border transition-all ${activeB2BCategory === 'all' ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105' : 'bg-white dark:bg-[#0D131F] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 shadow-sm'}`}
              >
                🌐 כל התבניות ({fullPromptPool.length})
              </button>
              {combinedCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveB2BCategory(cat.id); setSearchTerm(''); }}
                  className={`px-5 py-3 rounded-2xl font-black text-xs md:text-sm border transition-all ${activeB2BCategory === cat.id ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105' : 'bg-white dark:bg-[#0D131F] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 shadow-sm'}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Prompts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {filteredB2BPrompts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-[#0D131F] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative hover:border-cyan-500/50 transition-all group shadow-xl dark:shadow-none">
                  <div className="text-right">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">{p.subCategory}</span>
                      {p.isPremium && (
                        <span className={`text-[10px] font-black px-3 py-1 rounded-xl flex items-center gap-1 ${unlockedPremium ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'}`}>
                          {unlockedPremium ? '🔓 פתוח לשימוש' : '🔒 פרימיום לארגונים'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white leading-tight">{p.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-bold mb-6">{p.explanation}</p>

                    <div className="bg-slate-50 dark:bg-[#070A10] p-6 rounded-3xl mb-6 text-xs md:text-sm leading-relaxed text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-right relative shadow-inner overflow-x-auto whitespace-pre-wrap font-medium" dir="rtl">
                      {p.isPremium && !unlockedPremium ? (
                        <div className="filter blur-xs select-none opacity-40">
                          {p.text}
                        </div>
                      ) : (
                        p.text
                      )}

                      {p.isPremium && !unlockedPremium && (
                        <div className="absolute inset-0 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-white">
                          <span className="text-3xl mb-2">🔒</span>
                          <h4 className="font-black text-base mb-1">תבנית עסקית מתקדמת</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mb-4">השאירו פרטים קצרים לפתיחת כל התבניות העסקיות</p>
                          <button onClick={() => handleB2BPromptClick(p)} className="px-6 py-2.5 bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all">
                            פתיחה מהירה ללא עלות 🔑
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        רוצים להפוך את הפרומפט הזה לפתרון AI אוטומטי בארגון?
                      </span>
                      <button onClick={openContactView} className="px-4 py-2 bg-cyan-500 text-white font-black text-xs rounded-xl transition-all shadow-md whitespace-nowrap hover:bg-cyan-400">
                        [תיאום שיחת אבחון] 📞
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleB2BPromptClick(p)}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${p.isPremium && !unlockedPremium ? 'bg-amber-500 text-white hover:bg-amber-400' : copiedId === p.id ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-md'}`}
                  >
                    {p.isPremium && !unlockedPremium ? 'פתיחת תבנית מתקדמת 🔑' : copiedId === p.id ? 'הועתק בהצלחה! ✅' : 'העתקת תבנית עסקית 📋'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MODAL FOR UNLOCKING PREMIUM B2B PROMPTS */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-[#070A10]/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#0D131F] rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full text-right shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button onClick={() => setShowUnlockModal(false)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl font-black">✕</button>
            
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 inline-block">🔑</span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">פתיחת תבניות הפרימיום לארגונים</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-bold">
                השאירו פרטים קצרים לפתיחת גישה חופשית לכל תבניות הפרומפטים והאוטומציות!
              </p>
            </div>

            <form name="contact" method="POST" data-netlify="true" onSubmit={handleLeadSubmit} className="space-y-4">
              <input type="hidden" name="form-name" value="contact" />
              
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">שם מלא *</label>
                <input
                  type="text"
                  name="user_name"
                  required
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  placeholder="ישראל ישראלי"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">שם החברה / הארגון</label>
                <input
                  type="text"
                  name="company"
                  value={leadData.company}
                  onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                  placeholder="שם החברה (לא חובה)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300">מספר טלפון *</label>
                    {leadData.phone && !isValidIsraeliPhone(leadData.phone) && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">9-10 ספרות</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="^(?:0(?:5[0-9]|[23489])[0-9]{7}|\+972(?:5[0-9]|[23489])[0-9]{7})$"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    placeholder="050-1234567"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border ${
                      leadData.phone && !isValidIsraeliPhone(leadData.phone)
                        ? 'border-amber-500/70 focus:border-amber-500'
                        : 'border-slate-200 dark:border-slate-800'
                    } outline-none text-slate-900 dark:text-white text-sm`}
                    dir="ltr"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300">אימייל *</label>
                    {emailTouched && leadData.email && !isValidEmail(leadData.email) && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">אימייל שגוי</span>
                    )}
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="name@company.com"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border ${
                      emailTouched && leadData.email && !isValidEmail(leadData.email)
                        ? 'border-amber-500/70 focus:border-amber-500'
                        : 'border-slate-200 dark:border-slate-800'
                    } outline-none text-slate-900 dark:text-white text-sm`}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <input
                  id="spam_consent_gate"
                  type="checkbox"
                  name="marketing_consent"
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="spam_consent_gate" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                  אני מאשר קבלת תוכן שיווקי ודברי פרסומת במייל/SMS
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-xl text-base shadow-lg transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSubmittingLead ? 'פותח גישה...' : 'פתיחת כל התבניות העסקיות 🔓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-slate-200 dark:border-slate-800 mt-20 space-y-4">
        <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">
          © 2026 בינה לתעשייה. כל הזכויות שמורות.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
          <button onClick={() => setIsTermsOfServiceOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">תנאי שימוש</button>
          <span>|</span>
          <button onClick={() => setIsPrivacyPolicyOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">מדיניות פרטיות</button>
          <span>|</span>
          <button onClick={() => setIsAccessibilityStatementOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">הצהרת נגישות</button>
          <span>|</span>
          <a href="https://www.linkedin.com/in/ohad-baram" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">LinkedIn 🔗</a>
          <span>|</span>
          <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">קהילת מדברים בינה 👥</a>
          <span>|</span>
          <button onClick={() => setIsCookieSettingsOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer bg-transparent border-none">ניהול עוגיות 🍪</button>
        </div>
      </footer>

      {isCookieBannerOpen && (
        <CookieBanner onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} onClose={() => setIsCookieBannerOpen(false)} />
      )}
      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceOpen} onClose={() => setIsTermsOfServiceOpen(false)} />
      <AccessibilityStatementModal isOpen={isAccessibilityStatementOpen} onClose={() => setIsAccessibilityStatementOpen(false)} />
      <CookieSettingsModal isOpen={isCookieSettingsOpen} onClose={() => setIsCookieSettingsOpen(false)} />
      
      {/* חלונית סלוגן קריוקי צפה - במצב מורחב */}
      {sloganPanelState === 'expanded' && (
        <div 
          className={`fixed bottom-24 left-6 z-[99999] bg-slate-950/95 dark:bg-slate-900/95 border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 text-right dir-rtl relative ${
            isSloganShrinking ? 'animate-implode-left' : isSloganExploding ? 'animate-explode-left' : 'animate-fadeIn'
          }`}
          style={{ width: window.innerWidth < 640 ? 'calc(100vw - 32px)' : '420px', position: 'fixed', bottom: '96px', left: window.innerWidth < 640 ? '16px' : '24px', zIndex: 99999, direction: 'rtl', fontFamily: '"Frank Ruhl Libre", Georgia, serif' }}
        >
          {/* כפתורי בקרה עליונים לחלונית */}
          <div className="absolute top-4 left-4 flex items-center gap-3 z-10 font-sans" style={{ direction: 'ltr' }}>
            <button 
              onClick={collapseSlogan}
              className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors rounded-full w-6 h-6 flex items-center justify-center text-lg font-black"
              title="כווץ למיקרופון (המוזיקה תמשיך ברקע)"
              style={{ cursor: 'pointer' }}
            >
              −
            </button>
            <button 
              onClick={closeSloganAndStopMusic}
              className="text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors rounded-full w-6 h-6 flex items-center justify-center text-sm font-black"
              title="סגור חלונית וכבה מוזיקה"
              style={{ cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-lg md:text-xl font-black leading-relaxed text-right pt-2">
            {sloganLines.map((line, lineIdx) => {
              let startIdx = 0;
              for (let i = 0; i < lineIdx; i++) {
                startIdx += sloganLines[i].length;
              }

              return (
                <div key={lineIdx} className="flex flex-wrap gap-x-2.5 justify-start">
                  {line.map((word, wordIdx) => {
                    const absoluteIdx = startIdx + wordIdx;
                    const isActive = activeWordIndex === absoluteIdx;
                    return (
                      <span
                        key={wordIdx}
                        className="transition-all duration-300 px-1.5 py-0.5 rounded-lg inline-block"
                        style={{
                          transform: isActive ? 'scale(1.3)' : 'scale(1)',
                          color: isActive ? '#22d3ee' : '#64748b',
                          backgroundColor: isActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                          boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.5)' : 'none',
                          border: '1px solid ' + (isActive ? 'rgba(6, 182, 212, 0.4)' : 'transparent'),
                          fontWeight: isActive ? 900 : 700
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* כפתור מיקרופון צף — הפעלה ידנית בלבד (ללא אנימציה בטעינת הדף) */}
      {sloganPanelState === 'collapsed' && (
        <button
          onClick={playMusicFromMicrophone}
          className="fixed bottom-24 left-6 z-[99999] bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ position: 'fixed', bottom: '96px', left: '24px', zIndex: 99999, width: '48px', height: '48px', cursor: 'pointer' }}
          title="שמע את הסלוגן 🎙️"
        >
          <span className="text-xl">🎙️</span>
        </button>
      )}

      {/* כפתור וואטסאפ צף מהיר */}
      <a
        href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="פנייה מהירה בוואטסאפ לאוהד ברעם"
        className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-[999998] flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-slate-900 ring-4 ring-emerald-500/30 cursor-pointer"
        style={{ position: 'fixed', bottom: '96px', right: '24px', zIndex: 999998 }}
        title="פנייה מהירה בוואטסאפ לאוהד (053-6244330) 💬"
      >
        <span className="hidden sm:inline font-black text-xs">וואטסאפ ישיר</span>
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

      <AccessibilityToolbar />
      <AiChatbot />
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default App;