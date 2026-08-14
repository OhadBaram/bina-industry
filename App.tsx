import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES, ALL_PROMPTS } from './data/prompts';
import { B2B_SERVICES, PAIN_POINTS, USE_CASES, B2B_PROMPT_CATEGORIES, B2B_PROMPTS, CAPABILITIES, METHODOLOGY_STEPS } from './data/b2bData';
import { B2BPrompt } from './types';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { AccessibilityStatementModal } from './components/AccessibilityStatementModal';
import { CookieBanner } from './components/CookieBanner';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { ZapierChatbot } from './components/ZapierChatbot';

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
  ai: "היי אוהד,\nאנו מעוניינים לבחון פיתוח סוכני AI מותאמים אישית (Custom AI Agents) וחיבורם למאגרי המידע וה-CRM של החברה. נשמח לתאם פגישת אבחון ראשונית.",
  workshops: "היי אוהד,\nאנו מעוניינים לבחון סדנאות עומק והכשרת צוותים/מנהלים לעבודה יומיומית עם כלי AI בארגון. נשמח לקבל פרטים וסילבוס מותאם.",
  transformation: "היי אוהד,\nאנחנו מעוניינים באוטומציה ואינטגרציות תפעוליות לחיבור שרשרת התפעול ומערכות ה-ERP/CRM בארגון. נשמח לתאם שיחת אבחון.",
  product: "היי אוהד,\nאנו מעוניינים בפתרונות אבטחת מידע, עבודה בסביבות סגורות / Local LLMs ושמירה על סודיות הדאטה הארגוני. נשמח לשוחח."
};

const App: React.FC = () => {
  // --- ניהול תצוגה וניתוב ---
  const [mainView, setMainView] = useState<'home' | 'prompts'>('home');
  const [activeB2BCategory, setActiveB2BCategory] = useState<string>('all');
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setIsTermsOfServiceOpen] = useState(false);
  const [isAccessibilityStatementOpen, setIsAccessibilityStatementOpen] = useState(false);
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      setToastMessage('המושג הועתק! 📋 ניתן להדביק בצ׳אטבוט בפינה להסבר.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = concept;
      el.style.position = 'fixed';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setToastMessage('המושג הועתק! 📋 ניתן להדביק בצ׳אטבוט בפינה להסבר.');
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

    // פתיחה אוטומטית של הצ'אטבוט של Zapier
    const openZapierBot = () => {
      const zapierBot = document.querySelector('zapier-interfaces-chatbot-embed');
      if (zapierBot) {
        zapierBot.setAttribute('open', 'true');
        zapierBot.setAttribute('is-open', 'true');
        try {
          const button = zapierBot.shadowRoot?.querySelector('button') || zapierBot.shadowRoot?.querySelector('[role="button"]');
          button?.click();
        } catch(e) {}
      }
    };

    const timer1 = setTimeout(openZapierBot, 1000);
    const timer2 = setTimeout(openZapierBot, 2500);
    const timer3 = setTimeout(openZapierBot, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
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

  // שליחת ליד כפולה: ל-Netlify Forms ול-Webhook בזמן אמת עם איחוד שדות ה-Name וה-Company
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingLead(true);

    try {
      const userName = leadData.name.trim();
      const companyName = leadData.company.trim();
      const combinedIdentity = companyName ? `${userName} (${companyName})` : userName;

      // 1. קריאת ה-FormData מתוך ה-DOM של הטופס ועדכון השדות
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);
      formData.set('full_name', combinedIdentity);
      formData.set('full_identity', combinedIdentity);
      const netlifyBody = new URLSearchParams(formData as any).toString();

      // 2. שליחה במקביל ל-n8n / Zapier Webhook במבנה JSON תואם
      const zapierPayload = {
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
        fetch('https://hooks.zapier.com/hooks/standard/28540433/239b16bf87b84e75958c730fd83cf2ff/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zapierPayload),
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
              <label htmlFor="phone" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">מספר טלפון *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                placeholder="050-0000000"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="user_email" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">דוא״ל לחזרה *</label>
              <input
                id="user_email"
                type="email"
                name="email"
                required
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
                dir="ltr"
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

          <button
            type="submit"
            disabled={isSubmittingLead}
            className="btn-submit w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl shadow-xl hover:shadow-cyan-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmittingLead ? 'שולח פנייה...' : 'תיאום שיחת אבחון ראשונית 🚀'}
          </button>
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
            <button onClick={scrollToCapabilities} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all">השירותים</button>
            <button onClick={scrollToMethodology} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all">תהליך האפיון</button>
            <button onClick={goToPromptsView} className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40' : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>מאגר הפרומפטים</button>
            <button onClick={scrollToAbout} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all">אודות</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "מעבר למצב בהיר ☀️" : "מעבר למצב כהה 🌙"}
              className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 rounded-xl transition-all font-black text-sm flex items-center justify-center cursor-pointer shadow-md"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={openContactView} className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 flex items-center gap-2">
              <span>תיאום שיחת אבחון</span>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* === VIEW 1: ENTERPRISE AI LANDING PAGE (HOME) === */}
        {mainView === 'home' && (
          <div className="space-y-24 animate-fadeIn">
            
            {/* 1. HERO SECTION */}
            <section className="text-center py-12 md:py-24 relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs md:text-sm font-bold mb-8 border border-cyan-500/30 shadow-sm">
                <span>אפיון, הדרכה והטמעה מותאמת לארגונים</span>
              </div>
              
              <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                מפסיקים לנסות.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-400">
                  מטמיעים AI בארגון.
                </span>
              </h1>

              <p className={`text-lg md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed mb-12 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <button
                  onClick={() => triggerConceptExplanation('פתרונות מדף', 'מוצרי מדף גנריים שלא מותאמים לצרכים, למערכות או לאבטחת המידע של הארגון, ואינם פותרים בעיות מורכבות בצורה מדויקת.')}
                  className="underline decoration-cyan-500/60 decoration-2 underline-offset-4 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                  title="העתק מושג לצ׳אטבוט 📋"
                >
                  פתרונות מדף
                </button> לא עובדים בתעשייה מורכבת. אני מאבחן את{' '}
                <button
                  onClick={() => triggerConceptExplanation('צווארי הבקבוק', 'נקודות התורפה ותהליכי העבודה הידניים המייגעים בארגון שמעכבים את העבודה ופוגעים בפרודוקטיביות.')}
                  className="underline decoration-cyan-500/60 decoration-2 underline-offset-4 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                  title="העתק מושג לצ׳אטבוט 📋"
                >
                  צווארי הבקבוק
                </button> בעסק שלכם, מכשיר את הצוותים ל-{' '}
                <button
                  onClick={() => triggerConceptExplanation('עבודה עצמאית עם כלי AI', 'הקניית מיומנויות הנדסת פרומפטים מתקדמת לצוותים כדי שיוכלו להשתמש בצורה יומיומית ויעילה במודלים השונים.')}
                  className="underline decoration-cyan-500/60 decoration-2 underline-offset-4 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                  title="העתק מושג לצ׳אטבוט 📋"
                >
                  עבודה עצמאית עם כלי AI
                </button>, ומפתח סוכנים ואוטומציות שמייצרים תוצאות בשטח.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-xl mx-auto">
                <button
                  onClick={openContactView}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>תיאום פגישת אבחון ראשונית</span>
                  <span>🚀</span>
                </button>
                <button
                  onClick={scrollToMethodology}
                  className={`w-full sm:w-auto px-8 py-5 border font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-[#0D131F] border-slate-800 text-slate-200 hover:border-cyan-500/50' : 'bg-white border-slate-300 text-slate-800 hover:border-cyan-500 shadow-md'}`}
                >
                  <span>איך התהליך עובד? ↓</span>
                </button>
              </div>
            </section>

            {/* 2. WHY CUSTOM AI SECTION (המציאות בשטח) */}
            <section className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none">
              <div className="text-center mb-12">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">המציאות בשטח</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">למה רוב יוזמות ה-AI בארגונים נתקעות?</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* הבעיה */}
                <div className="bg-slate-50 dark:bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-red-500/20 space-y-4">
                  <button
                    onClick={() => triggerConceptExplanation('הבעיה השכיחה ביוזמות AI', 'רכישת מנויים וכלים ללא התאמה מעשית לתהליכי העבודה וללא ליווי והכשרה אנושית, מה שגורם לעובדים לא להשתמש בהם בפועל.')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-black border border-red-500/30 hover:border-red-500 hover:scale-105 transition-all cursor-pointer shadow-sm text-right"
                    title="העתק מושג לצ׳אטבוט 📋"
                  >
                    <span>⚠️ הבעיה השכיחה</span>
                    <span className="text-[10px]">📋</span>
                  </button>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">רכישת כלים ללא חיבור לתהליכים</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    חברות קונות מנויים למודלי AI (כמו ChatGPT) או מחברות תוספים בסיסיים, אבל העובדים לא משתמשים, התהליכים לא מתחברים, וההשקעה יורדת לטמיון.
                  </p>
                </div>

                {/* הפתרון של בינה לתעשייה */}
                <div className="bg-slate-50 dark:bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-cyan-500/30 space-y-4">
                  <button
                    onClick={() => triggerConceptExplanation('✓ הפתרון של בינה לתעשייה', 'שילוב הוליסטי המשלב הכשרה מעשית של העובדים יחד עם תכנון וארכיטקטורה יציבה ומאובטחת המבוססת על צרכי החברה ומערכותיה.')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30 hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer shadow-sm text-right"
                    title="העתק מושג לצ׳אטבוט 📋"
                  >
                    <span>✓ הפתרון של בינה לתעשייה</span>
                    <span className="text-[10px]">📋</span>
                  </button>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">הכשרה אנושית + תשתיות יציבות</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    שילוב בין הכשרה אנושית עמוקה לבין ארכיטקטורת מערכות יציבה. אני לא עוזב עד שהכלים עובדים בחיי היום-יום של הצוות.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. CORE SERVICES (גריד Bento נקי ואלגנטי) */}
            <section ref={capabilitiesRef} className="py-6 space-y-12">
              <div className="text-center">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">שירותי הליבה</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">ארכיטקטורת הפתרונות לארגונים</h2>
              </div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* קובייה 01 (גדולה ומרכזית) */}
                <div className="md:col-span-8 bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl dark:shadow-none">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">01</span>
                      <button
                        onClick={() => triggerConceptExplanation('CUSTOM AI AGENTS', 'סוכני AI מותאמים אישית פועלים כאנשי צוות וירטואליים האוטונומיים מול מאגרי המידע וה-CRM של החברה, לביצוע משימות מורכבות בדיוק מוחלט.')}
                        className="text-xs font-bold px-3 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-500/30 hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                        title="לחץ לקבלת הסבר מפורט בסוכן ה-AI"
                      >
                        <span>CUSTOM AI AGENTS</span>
                        <span className="text-[10px]">💡</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">סוכני AI מותאמים אישית</span>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                      אפיון ופיתוח סוכנים חכמים על בסיס הידע הארגוני
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed mb-8">
                      פיתוח סוכנים אוטונומיים שמחוברים ישירות למסמכי החברה, מאגרי המידע וה-CRM. הסוכנים מייצרים ניתוחי דאטה, סיכומי דוחות, מחקרים ומענה מדויק ללא שגיאות וללא דליפת מידע.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      <button
                        onClick={() => triggerConceptExplanation('RAG Architecture', 'RAG (Retrieval-Augmented Generation) היא ארכיטקטורה המחברת את מודל ה-AI למאגרי המידע והמסמכים של הארגון. היא מאפשרת לסוכן להפיק תשובות מדויקות, מבוססות עובדות בלבד, ללא שגיאות וללא דליפת מידע.')}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-black rounded-xl hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        title="לחץ לקבלת הסבר מפורט בסוכן ה-AI"
                      >
                        <span>RAG Architecture</span>
                        <span className="text-[10px]">💡</span>
                      </button>
                      <button
                        onClick={() => triggerConceptExplanation('Private Data', 'Private Data מבטיח שכל המידע הארגוני והמסמכים מעובדים בסביבה מוצפנת ומבודדת לחלוטין. שום מידע שלכם אינו נחשף לצד ג\' ואינו משמש לאימון מודלים ציבוריים.')}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-black rounded-xl hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        title="לחץ לקבלת הסבר מפורט בסוכן ה-AI"
                      >
                        <span>Private Data</span>
                        <span className="text-[10px]">🔒</span>
                      </button>
                      <button
                        onClick={() => triggerConceptExplanation('Zero Retention', 'מדיניות Zero Retention מבטיחה שספקי ה-AI והסוכנים אינם שומרים את השאילתות או התשובות בשרתים שלהם לאחר סיום העיבוד, לרמת דיסקרטיות ואבטחת מידע מרבית.')}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-black rounded-xl hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        title="לחץ לקבלת הסבר מפורט בסוכן ה-AI"
                      >
                        <span>Zero Retention</span>
                        <span className="text-[10px]">🛡️</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('ai')} className="w-full py-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 hover:text-white font-black text-sm border border-cyan-500/30 transition-all text-center">
                    לתיאום פגישת אבחון בנושא סוכני AI ➔
                  </button>
                </div>

                {/* קובייה 02 */}
                <div className="md:col-span-4 bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl dark:shadow-none">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">02</span>
                      <button
                        onClick={() => triggerConceptExplanation('WORKSHOPS')}
                        className="text-[11px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30 hover:border-blue-500 hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                        title="העתק מושג לצ׳אטבוט 📋"
                      >
                        <span>WORKSHOPS</span>
                        <span>📋</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">הדרכות עומק וסדנאות Hands-on</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                      הכשרת מנהלים וצוותים לעבודה יומיומית עם AI
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      סדנאות מעשיות ממוקדות תפקיד (הנהלה, שיווק, תפעול, כספים). לומדים הנדסת פרומפטים מתקדמת, עבודה עם Claude, ChatGPT ו-Gemini, ותרגול ישיר על משימות אמיתיות מהעסק.
                    </p>

                    <div className="p-4 bg-slate-100 dark:bg-[#070A10] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-300 mb-6">
                      🎯 סילבוס ייעודי לפי מחלקות החברה
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('workshops')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-cyan-500 hover:text-white font-black text-xs transition-all text-center">
                    לפרטים על סדנאות והכשרות ➔
                  </button>
                </div>

                {/* קובייה 03 */}
                <div className="md:col-span-6 bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl dark:shadow-none">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">03</span>
                      <button
                        onClick={() => triggerConceptExplanation('ENTERPRISE DATA & APIS')}
                        className="text-[11px] font-bold px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30 hover:border-indigo-500 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 font-mono"
                        title="העתק מושג לצ׳אטבוט 📋"
                      >
                        <span>03 // ENTERPRISE DATA & APIS</span>
                        <span>📋</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 block mb-1">ארכיטקטורת נתונים, סוכנים ואינטגרציות עומק</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                      הופכים מודלי AI למערכות ליבה תפעוליות, לא לעוד "תוסף" שביר
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      תכנון הנדסי של זרימות עבודה מורכבות, חיבור מאגרי ידע ארגוניים ואוטומציה יציבה שעומדת בעומסים אמיתיים.
                    </p>

                    <div className="space-y-3 mb-6 bg-slate-50 dark:bg-[#070A10] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">⚬</span>
                        <p>
                          <button
                            onClick={() => triggerConceptExplanation('אינטגרציית APIs ישירה', 'חיבור ישיר ומאובטח בין מודלי השפה למערכות הליבה של הארגון ללא שימוש בפלטפורמות תיווך חיצוניות שבירות.')}
                            className="underline decoration-cyan-500/60 hover:text-cyan-500 font-black text-slate-900 dark:text-white transition-all cursor-pointer text-right"
                            title="העתק מושג לצ׳אטבוט 📋"
                          >
                            אינטגרציית APIs ישירה:
                          </button>{' '}
                          חיבור דו-כיווני מאובטח בין מודלי שפה, מערכות ERP, מסדי נתונים ו-CRMs, ללא תלות בכלים מוגבלים.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">⚬</span>
                        <p>
                          <button
                            onClick={() => triggerConceptExplanation('חסינות תקלות (Fault Tolerance)', 'מנגנונים המבטיחים יציבות של מערכות ה-AI וטיפול אוטומטי בכשלים או שגיאות של מודלי שפה.')}
                            className="underline decoration-cyan-500/60 hover:text-cyan-500 font-black text-slate-900 dark:text-white transition-all cursor-pointer text-right"
                            title="העתק מושג לצ׳אטבוט 📋"
                          >
                            חסינות תקלות (Fault Tolerance):
                          </button>{' '}
                          תכנון מלא של מנגנוני טיפול בשגיאות (Error Handling), אימות קלטים (Schema Validation) וניטור רציף.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">⚬</span>
                        <p>
                          <button
                            onClick={() => triggerConceptExplanation('אבטחה בסטנדרט ארגוני', 'מערכת הגנה מקיפה המונעת דליפת מידע וכוללת שימוש בסביבות ענן פרטיות ומבודדות.')}
                            className="underline decoration-cyan-500/60 hover:text-cyan-500 font-black text-slate-900 dark:text-white transition-all cursor-pointer text-right"
                            title="העתק מושג לצ׳אטבוט 📋"
                          >
                            אבטחה בסטנדרט ארגוני:
                          </button>{' '}
                          עבודה בסביבות מבודדות,{' '}
                          <button
                            onClick={() => triggerConceptExplanation('מודלים מקומיים (Local/Private VPC)', 'פריסת מודלים של בינה מלאכותית על גבי ענן פרטי או תשתיות מקומיות של הארגון ללא צורך בחיבור חיצוני.')}
                            className="underline decoration-cyan-500/60 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                            title="העתק מושג לצ׳אטבוט 📋"
                          >
                            מודלים מקומיים (Local/Private VPC)
                          </button>{' '}
                          ומדיניות מוחלטת של{' '}
                          <button
                            onClick={() => triggerConceptExplanation('אי-שמירת היסטוריה (Zero Data Retention)', 'מדיניות אבטחה המונעת מספקי ה-AI לשמור את הנתונים והשיחות שלכם בשרתים שלהם.')}
                            className="underline decoration-cyan-500/60 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                            title="העתק מושג לצ׳אטבוט 📋"
                          >
                            אי-שמירת היסטוריה (Zero Data Retention).
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('transformation')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-cyan-500 hover:text-white font-black text-xs transition-all text-center border border-slate-200 dark:border-slate-700 shadow-sm">
                    לייעוץ בנושאי אוטומציה תפעולית ➔
                  </button>
                </div>

                {/* קובייה 04 */}
                <div className="md:col-span-6 bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl dark:shadow-none">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">04</span>
                      <button
                        onClick={() => triggerConceptExplanation('SECURITY FIRST')}
                        className="text-[11px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                        title="העתק מושג לצ׳אטבוט 📋"
                      >
                        <span>SECURITY FIRST</span>
                        <span>📋</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">אבטחת מידע ופרטיות</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                      עבודה בסביבות סגורות ומאובטחות
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      התאמת פתרונות העומדים בדרישות אבטחת מידע מחמירות, שמבטיחות שהדאטה הרגיש של הארגון אינו משמש לאימון מודלים ציבוריים.
                    </p>

                    <button
                      onClick={() => triggerConceptExplanation('Local LLMs', 'מודלים מקומיים (Local LLMs) פועלים ישירות על גבי תשתיות המחשוב או הענן הפרטי של הארגון. הפתרון מאפשר עצמאות מוחלטת, עבודה ללא אינטרנט ועמידה בתקני אבטחה מחמירים ביותר.')}
                      className="w-full text-right p-4 bg-slate-100 dark:bg-[#070A10] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-300 mb-6 hover:border-cyan-500 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-between shadow-sm"
                      title="לחץ לקבלת הסבר מפורט בסוכן ה-AI"
                    >
                      <span>🛡️ אפשרות לפריסת מודלים מקומיים (Local LLMs) 💡</span>
                    </button>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('product')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-cyan-500 hover:text-white font-black text-xs transition-all text-center">
                    לפרטים על אבטחת מידע וסביבות סגורות ➔
                  </button>
                </div>
              </div>
            </section>

            {/* 4. METHODOLOGY (מתודולוגיית העבודה - 4 השלבים) */}
            <section ref={methodologyRef} className="bg-white dark:bg-[#0D131F] text-slate-900 dark:text-white rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none">
              <div className="text-center mb-14">
                <button
                  onClick={() => triggerConceptExplanation('תהליך העבודה', 'מתודולוגיית העבודה המלאה משלב האבחון, אפיון הארכיטקטורה ומפת הדרכים, דרך הכשרת הצוותים ועד להטמעה ובקרה שוטפת בשטח לקבלת ROI מקסימלי.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer shadow-sm mb-2"
                  title="העתק מושג לצ׳אטבוט 📋"
                >
                  <span>תהליך העבודה</span>
                  <span className="text-[10px]">📋</span>
                </button>
                <h2 className="text-3xl md:text-5xl font-black mb-4">מאבחון ועד להטמעה מלאה</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {METHODOLOGY_STEPS.map(st => (
                  <div key={st.stepNum} className="bg-slate-50 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">{st.stepNum}</span>
                        <span className="text-3xl group-hover:scale-110 transition-transform">{st.icon}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-between gap-2">
                        <span>{st.title}</span>
                        <button
                          onClick={() => triggerConceptExplanation(st.title.includes('Blueprint') ? 'System Blueprint' : st.title, st.details)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-500 transition-all border border-slate-200 dark:border-slate-800 cursor-pointer"
                          title="העתק מושג לצ׳אטבוט 📋"
                        >
                          <span className="text-[10px]">📋</span>
                        </button>
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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <span>אוטוריטה וחדשנות</span>
                    <button
                      onClick={() => triggerConceptExplanation('אוטוריטה וחדשנות', 'הובלת קהילת הידע והפרומפטים הגדולה בישראל (מדברים בינה) מאפשרת לנו להביא את התובנות, השיטות והמגמות העדכניות ביותר ישירות אליכם.')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#070A10] hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-500 transition-all border border-slate-200 dark:border-slate-800 cursor-pointer animate-pulse"
                      title="העתק מושג לצ׳אטבוט 📋"
                    >
                      <span className="text-[10px]">📋</span>
                    </button>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    תובנות מעודכנות, מתודולוגיות עבודה מוכחות וגישה ישירה למאגר הידע המוביל בתחום.
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
                  <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-6">מנהל מוצר ומוביל טרנספורמציה דיגיטלית בכיר</p>
                  
                  <a
                    href="https://www.linkedin.com/in/ohad-baram-58a22632a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 bg-[#0A66C2] hover:bg-[#084e96] text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
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
                      החיבור בין ניתוח תהליכים עסקיים, ניהול מוצר והנדסת AI מעשית
                    </h2>
                    
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                      <p>
                        <strong className="text-slate-900 dark:text-white font-black text-xl block mb-2">נעים להכיר, שמי אוהד ברעם.</strong>
                      </p>
                      <p>
                        אני מנהל מוצר ומוביל טרנספורמציה דיגיטלית בכיר, עם ניסיון עשיר בליווי והובלה של מערכות מורכבות, ארכיטקטורות ענן ופלטפורמות מתקדמות. ברקע האקדמי אני בעל תואר שני בניהול ארגוני שירות בהצטיינות, יחד עם הסמכה בניהול מוצר.
                      </p>
                      <p>
                        המומחיות המרכזית שלי היא היכולת לקחת אסטרטגיה וצרכים ארגוניים רחבים, ולתרגם אותם למוצרים דיגיטליים אפקטיביים, אינטואיטיביים וסקילביליים. לאורך הדרך הובלתי תהליכים מורכבים משלב החזון, האפיון והארכיטקטורה, ועד להטמעה ותפעול מלא בשטח, תוך סנכרון הדוק מול צוותי הנדסה, פיתוח והנהלה בכירה.
                      </p>
                      <p>
                        בנוסף, אני מביא חיבור עמוק וראייה הוליסטית של עולמות הבינה המלאכותית, האוטומציה ותהליכי העבודה המתקדמים. אני מוביל קהילה מקצועית גדולה בתחום, ומתמקד בשילוב מעשי של יכולות AI וטכנולוגיות חדשות כחלק מובנה מתוך תהליכי העבודה של הארגון.
                      </p>
                      <p className="text-cyan-600 dark:text-cyan-400 font-bold border-r-4 border-cyan-500 pr-4 my-2">
                        המטרה שלי היא להביא את הראייה המערכתית, היכולת לגשר בין הצרכים המקצועיים לטכנולוגיה, ולהוביל תהליכי חדשנות ומודרניזציה שמייצרים ערך אמיתי ומתמשך.
                      </p>
                    </div>
                  </div>

                  {/* 3 Bullets */}
                  <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-cyan-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-cyan-700 dark:text-cyan-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>ראייה תהליכית מקיפה</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">אפיון זרימת מידע בארגון ומניעת כפילויות עבודה.</div>
                    </div>
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-blue-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-blue-700 dark:text-blue-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>🤖</span>
                        <span>מומחיות ב-AI מתקדם</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">בניית סוכנים חכמים, חיבורי API וצ'אטבוטים מבוססי ידע.</div>
                    </div>
                    <div className="bg-white dark:bg-[#070A10] p-5 rounded-2xl border border-emerald-500/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                      <div className="text-emerald-700 dark:text-emerald-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-1.5">
                        <span>📈</span>
                        <span>מחויבות לתוצאות (ROI)</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">פתרונות מותאמים אישית ללא תלות בכלים מיותרים.</div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 6.5. INDUSTRIAL STANDARD COMPARISON SECTION (למה אנחנו? ההבדל בין חיבור אוטומציות לתשתית AI תעשייתית) */}
            <section className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none space-y-10 animate-fadeIn">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30 uppercase tracking-wider">
                  למה אנחנו?
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                  ההבדל בין "חיבור אוטומציות" לתשתית AI תעשייתית
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                  השוואה ישירה בין הפתרונות השבירים בשוק לבין הסטנדרט ההנדסי של בינה לתעשייה
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Comparison Item 1 */}
                <div className="bg-slate-50 dark:bg-[#070A10] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all shadow-sm">
                  <div className="space-y-4">
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 block mb-1.5">🛑 בשוק הרגיל</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        בונים{' '}
                        <button
                          onClick={() => triggerConceptExplanation('תהליכי No-Code', 'בניית אוטומציות וחיבורים באמצעות פלטפורמות חיצוניות ללא קוד (כמו Make או Zapier). פתרונות אלו עלולים להיות שבירים, מוגבלים בכמות המידע וחשופים לתקלות רבות ללא ניהול שגיאות קפדני.')}
                          className="underline decoration-cyan-500/60 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                          title="העתק מושג לצ׳אטבוט 📋"
                        >
                          תהליכי No-Code
                        </button>{' '}
                        בסיסיים שנשברים בכל שינוי קטן, ללא תיעוד וללא טיפול בשגיאות.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ בבינה לתעשייה</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        ארכיטקטורת נתונים מנוהלת, בדיקות עומסים ותהליכים עמידים עם אפס אובדן מידע.
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
                        זורקים{' '}
                        <button
                          onClick={() => triggerConceptExplanation('רישיונות למודלי AI', 'רכישה וחלוקה של מנויים לכלים ציבוריים (כמו ChatGPT Plus או Claude Pro) לעובדי הארגון, ללא הדרכה מובנית וללא התאמה לתהליכים המקצועיים.')}
                          className="underline decoration-cyan-500/60 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                          title="העתק מושג לצ׳אטבוט 📋"
                        >
                          רישיונות למודלי AI
                        </button>{' '}
                        לעובדים (כמו ChatGPT או Claude) ומקווים שהם "יסתדרו לבד".
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ בבינה לתעשייה</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        הכשרה מעשית ממוקדת-תפקיד על מקרי בוחן ונתונים אמיתיים מתוך העסק שלכם.
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
                        <button
                          onClick={() => triggerConceptExplanation('פתרונות מדף גנריים', 'מוצרים מובנים מראש שאינם ניתנים להתאמה אישית, חסרים חיבור ל-APIs של הארגון ועלולים שלא לעמוד בתקני אבטחת מידע ורגולציה מחמירים.')}
                          className="underline decoration-cyan-500/60 hover:text-cyan-500 font-bold transition-all cursor-pointer"
                          title="העתק מושג לצ׳אטבוט 📋"
                        >
                          פתרונות מדף גנריים
                        </button>{' '}
                        שלא מתחשבים באבטחת מידע או רגולציה.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1.5">✅ בבינה לתעשייה</span>
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                        התאמה מדויקת לנהלי ה-IT, שמירה קפדנית על פרטיות המידע ואפשרות למודלים סגורים.
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
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">מספר טלפון *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    placeholder="050-0000000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">אימייל *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#070A10] border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white text-sm"
                    dir="ltr"
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
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-xl text-base shadow-lg transition-all disabled:opacity-50 mt-2"
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
          <button onClick={() => setIsTermsOfServiceOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors">תנאי שימוש</button>
          <span>|</span>
          <button onClick={() => setIsPrivacyPolicyOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors">מדיניות פרטיות</button>
          <span>|</span>
          <button onClick={() => setIsAccessibilityStatementOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors">הצהרת נגישות</button>
          <span>|</span>
          <a href="https://www.linkedin.com/in/ohad-baram-58a22632a" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">LinkedIn 🔗</a>
          <span>|</span>
          <button onClick={() => setIsCookieBannerOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">ניהול עוגיות 🍪</button>
        </div>
      </footer>

      <CookieBanner onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} isOpen={isCookieBannerOpen} onClose={() => setIsCookieBannerOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceOpen} onClose={() => setIsTermsOfServiceOpen(false)} />
      <AccessibilityStatementModal isOpen={isAccessibilityStatementOpen} onClose={() => setIsAccessibilityStatementOpen(false)} />
      <AccessibilityToolbar />
      <ZapierChatbot />
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default App;