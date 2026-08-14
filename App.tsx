import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES, ALL_PROMPTS } from './data/prompts';
import { B2B_SERVICES, PAIN_POINTS, USE_CASES, B2B_PROMPT_CATEGORIES, B2B_PROMPTS, CAPABILITIES, METHODOLOGY_STEPS } from './data/b2bData';
import { B2BPrompt } from './types';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
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
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  // בדיקת ניתוב URL ושתילת פרמטר service בטופס במידה וקיים
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
      setToastMessage('פנייתך התקבלה בהצלחה! נחזור אליך לשיחת אבחון בהקדם 🚀');
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

  // סינון פרומפטים עסקיים
  const filteredB2BPrompts = useMemo(() => {
    let pool = B2B_PROMPTS;
    if (activeB2BCategory !== 'all') {
      pool = pool.filter(p => p.category === activeB2BCategory);
    }
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      pool = pool.filter(p => p.title.toLowerCase().includes(low) || p.text.toLowerCase().includes(low) || p.explanation.toLowerCase().includes(low));
    }
    return pool;
  }, [activeB2BCategory, searchTerm]);

  const combinedIdentityValue = leadData.company.trim() ? `${leadData.name.trim()} (${leadData.company.trim()})` : leadData.name.trim();

  // רכיב סקשן יצירת קשר ללא שינוי בשדות
  const renderLeadForm = () => (
    <div id="contact" ref={contactFormRef} className="bg-[#0D131F] rounded-[3rem] p-8 md:p-14 shadow-2xl border border-slate-800 text-right max-w-4xl mx-auto animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold mb-4 border border-cyan-500/30 uppercase tracking-wider">
          פנייה מקצועית לארגונים
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">בואו נבדוק התאמה לארגון שלכם</h3>
        <p className="text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
          השאירו פרטים, ספרו לנו בקצרה מה האתגר, ונחזור אליכם לשיחת אפיון ראשונית ללא עלות.
        </p>
      </div>

      {leadSubmitted ? (
        <div className="bg-emerald-950/60 border-2 border-emerald-500/50 p-10 rounded-3xl text-center animate-fadeIn">
          <div className="text-6xl mb-4">🎉</div>
          <h4 className="text-3xl font-black text-emerald-200 mb-3">תודה רבה! הפנייה התקבלה בהצלחה</h4>
          <p className="text-emerald-300 font-bold text-base md:text-lg max-w-xl mx-auto mb-6">
            קיבלנו את פרטי הארגון שלך. אנו נחזור אליך בהקדם לשיחת אבחון ואפיון ראשונית.
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
              <label htmlFor="user_name" className="block text-xs font-black text-slate-300 mb-2">שם מלא *</label>
              <input
                id="user_name"
                type="text"
                name="user_name"
                required
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                placeholder="ישראל ישראלי"
                className="w-full px-5 py-4 rounded-2xl bg-[#070A10] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-xs font-black text-slate-300 mb-2">שם החברה / ארגון</label>
              <input
                id="company_name"
                type="text"
                name="company"
                value={leadData.company}
                onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                placeholder="שם החברה (לא חובה)"
                className="w-full px-5 py-4 rounded-2xl bg-[#070A10] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-xs font-black text-slate-300 mb-2">מספר טלפון *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                placeholder="050-0000000"
                className="w-full px-5 py-4 rounded-2xl bg-[#070A10] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium transition-all"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="user_email" className="block text-xs font-black text-slate-300 mb-2">דוא״ל לחזרה *</label>
              <input
                id="user_email"
                type="email"
                name="email"
                required
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-5 py-4 rounded-2xl bg-[#070A10] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-black text-slate-300 mb-2">פרטי הפנייה (ניתן לעריכה) *</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={leadData.message}
              onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
              placeholder="ספרו בקצרה על הצורך או האתגר שלכם..."
              className="w-full px-5 py-4 rounded-2xl bg-[#070A10] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium transition-all resize-none"
            />
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
              <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">
                בינה לתעשייה <span className="text-xs font-bold text-cyan-400 tracking-wider">ENTERPRISE AI</span>
              </h1>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={scrollToCapabilities} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-300 hover:text-cyan-400 transition-all">השירותים</button>
            <button onClick={scrollToMethodology} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-300 hover:text-cyan-400 transition-all">תהליך האפיון</button>
            <button onClick={() => setMainView('prompts')} className={`px-5 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-cyan-400'}`}>מאגר הפרומפטים</button>
            <button onClick={scrollToAbout} className="px-5 py-2.5 rounded-xl font-black text-xs md:text-sm text-slate-300 hover:text-cyan-400 transition-all">אודות</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "מעבר למצב בהיר ☀️" : "מעבר למצב כהה 🌙"}
              className="p-3 bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white rounded-xl transition-all font-black text-sm flex items-center justify-center cursor-pointer shadow-md"
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
        <div className="flex lg:hidden items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <button onClick={scrollToCapabilities} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-900 text-slate-300 border border-slate-800">השירותים</button>
          <button onClick={scrollToMethodology} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-900 text-slate-300 border border-slate-800">תהליך האפיון</button>
          <button onClick={() => setMainView('prompts')} className={`px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>מאגר הפרומפטים</button>
          <button onClick={scrollToAbout} className="px-4 py-2 rounded-xl text-xs font-black flex-shrink-0 bg-slate-900 text-slate-300 border border-slate-800">אודות</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* === VIEW 1: ENTERPRISE AI LANDING PAGE (HOME) === */}
        {mainView === 'home' && (
          <div className="space-y-24 animate-fadeIn">
            
            {/* 1. HERO SECTION */}
            <section className="text-center py-12 md:py-24 relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs md:text-sm font-bold mb-8 border border-cyan-500/30 shadow-sm">
                <span>אפיון, הדרכה והטמעה מותאמת לארגונים</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-8">
                מפסיקים לנסות.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
                  מטמיעים AI בארגון.
                </span>
              </h1>

              <p className="text-slate-300 text-lg md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed mb-12">
                פתרונות מדף לא עובדים בתעשייה מורכבת. אנחנו מאבחנים את צווארי הבקבוק בעסק שלכם, מכשירים את הצוותים לעבודה עצמאית עם כלי AI, ומפתחים סוכנים ואוטומציות שמייצרים תוצאות בשטח.
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
                  className="w-full sm:w-auto px-8 py-5 bg-[#0D131F] border border-slate-800 text-slate-200 hover:border-cyan-500/50 font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span>איך התהליך עובד? ↓</span>
                </button>
              </div>
            </section>

            {/* 2. WHY CUSTOM AI SECTION (המציאות בשטח) */}
            <section className="bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-800 shadow-2xl">
              <div className="text-center mb-12">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">המציאות בשטח</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">למה רוב יוזמות ה-AI בארגונים נתקעות?</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* הבעיה */}
                <div className="bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-red-500/20 space-y-4">
                  <div className="inline-flex items-center px-4 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-black border border-red-500/30">
                    ⚠️ הבעיה השכיחה
                  </div>
                  <h3 className="text-2xl font-black text-white">רכישת כלים ללא חיבור לתהליכים</h3>
                  <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    חברות קונות מנויים ל-ChatGPT או מחברות תוספים בסיסיים, אבל העובדים לא משתמשים, התהליכים לא מתחברים, וההשקעה יורדת לטמיון.
                  </p>
                </div>

                {/* הפתרון של בינה לתעשייה */}
                <div className="bg-[#070A10] p-8 md:p-10 rounded-[2.5rem] border border-cyan-500/30 space-y-4">
                  <div className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30">
                    ✓ הפתרון של בינה לתעשייה
                  </div>
                  <h3 className="text-2xl font-black text-white">הכשרה אנושית + תשתיות יציבות</h3>
                  <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    שילוב בין הכשרה אנושית עמוקה לבין ארכיטקטורת מערכות יציבה. אנחנו לא עוזבים עד שהכלים עובדים בחיי היום-יום של הצוות.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. CORE SERVICES (גריד Bento נקי ואלגנטי) */}
            <section ref={capabilitiesRef} className="py-6 space-y-12">
              <div className="text-center">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">שירותי הליבה</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">ארכיטקטורת הפתרונות לארגונים</h2>
              </div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* קובייה 01 (גדולה ומרכזית) */}
                <div className="md:col-span-8 bg-[#0D131F] rounded-[3rem] p-8 md:p-12 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">01</span>
                      <span className="text-xs font-bold px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
                        CUSTOM AI AGENTS
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 block mb-1">סוכני AI מותאמים אישית</span>
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
                      אפיון ופיתוח סוכנים חכמים על בסיס הידע הארגוני
                    </h3>

                    <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed mb-8">
                      פיתוח סוכנים אוטונומיים שמחוברים ישירות למסמכי החברה, מאגרי המידע וה-CRM. הסוכנים מייצרים ניתוחי דאטה, סיכומי דוחות, מחקרים ומענה מדויק ללא שגיאות וללא דליפת מידע.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      <span className="px-3.5 py-1.5 bg-[#070A10] border border-slate-800 text-cyan-400 font-mono text-xs font-black rounded-xl">RAG Architecture</span>
                      <span className="px-3.5 py-1.5 bg-[#070A10] border border-slate-800 text-cyan-400 font-mono text-xs font-black rounded-xl">Private Data</span>
                      <span className="px-3.5 py-1.5 bg-[#070A10] border border-slate-800 text-cyan-400 font-mono text-xs font-black rounded-xl">Zero Retention</span>
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('ai')} className="w-full py-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black font-black text-sm border border-cyan-500/30 transition-all text-center">
                    לתיאום פגישת אבחון בנושא סוכני AI ➔
                  </button>
                </div>

                {/* קובייה 02 */}
                <div className="md:col-span-4 bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">02</span>
                      <span className="text-[11px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30">
                        WORKSHOPS
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 block mb-1">הדרכות עומק וסדנאות Hands-on</span>
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                      הכשרת מנהלים וצוותים לעבודה יומיומית עם AI
                    </h3>

                    <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      סדנאות מעשיות ממוקדות תפקיד (הנהלה, שיווק, תפעול, כספים). לומדים הנדסת פרומפטים מתקדמת, עבודה עם Claude, ChatGPT ו-Gemini, ותרגול ישיר על משימות אמיתיות מהעסק.
                    </p>

                    <div className="p-4 bg-[#070A10] rounded-2xl border border-slate-800 text-xs font-bold text-cyan-300 mb-6">
                      🎯 סילבוס ייעודי לפי מחלקות החברה
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('workshops')} className="w-full py-4 rounded-2xl bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black font-black text-xs transition-all text-center">
                    לפרטים על סדנאות והכשרות ➔
                  </button>
                </div>

                {/* קובייה 03 */}
                <div className="md:col-span-6 bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">03</span>
                      <span className="text-[11px] font-bold px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30">
                        AUTOMATION
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 block mb-1">אוטומציות ואינטגרציות תפעוליות</span>
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                      חיבור שרשרת התפעול ללא מגע יד אדם
                    </h3>

                    <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      יצירת זרימות עבודה חכמות בין מערכות הליבה: קליטת לידים וניתובם, הפקת הצעות מחיר, סנכרון מסמכים ועדכון מערכות ERP ו-CRM באמינות מלאה.
                    </p>

                    <div className="p-4 bg-[#070A10] rounded-2xl border border-slate-800 text-xs font-bold text-cyan-300 mb-6">
                      ⚡ אפס תקלות — אוטומציה עמידה בעומסים
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('transformation')} className="w-full py-4 rounded-2xl bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black font-black text-xs transition-all text-center">
                    לייעוץ בנושאי אוטומציה תפעולית ➔
                  </button>
                </div>

                {/* קובייה 04 */}
                <div className="md:col-span-6 bg-[#0D131F] rounded-[3rem] p-8 md:p-10 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">04</span>
                      <span className="text-[11px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                        SECURITY FIRST
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 block mb-1">אבטחת מידע ופרטיות</span>
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                      עבודה בסביבות סגורות ומאובטחות
                    </h3>

                    <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
                      התאמת פתרונות העומדים בדרישות אבטחת מידע מחמירות, שמבטיחות שהדאטה הרגיש של הארגון אינו משמש לאימון מודלים ציבוריים.
                    </p>

                    <div className="p-4 bg-[#070A10] rounded-2xl border border-slate-800 text-xs font-bold text-cyan-300 mb-6">
                      🛡️ אפשרות לפריסת מודלים מקומיים (Local LLMs)
                    </div>
                  </div>

                  <button onClick={() => prefillServiceAndScroll('product')} className="w-full py-4 rounded-2xl bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-black font-black text-xs transition-all text-center">
                    לפרטים על אבטחת מידע וסביבות סגורות ➔
                  </button>
                </div>
              </div>
            </section>

            {/* 4. METHODOLOGY (מתודולוגיית העבודה - 4 השלבים) */}
            <section ref={methodologyRef} className="bg-[#0D131F] text-white rounded-[3rem] p-8 md:p-14 border border-slate-800 shadow-2xl">
              <div className="text-center mb-14">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">תהליך העבודה</span>
                <h2 className="text-3xl md:text-5xl font-black mb-4">מאבחון ועד להטמעה מלאה</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {METHODOLOGY_STEPS.map(st => (
                  <div key={st.stepNum} className="bg-[#070A10] border border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">{st.stepNum}</span>
                        <span className="text-3xl group-hover:scale-110 transition-transform">{st.icon}</span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">{st.title}</h3>
                      <p className="text-xs font-bold text-cyan-400 mb-4">{st.shortDesc}</p>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{st.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. PROMPT LIBRARY SECTION */}
            <section ref={communityRef} className="bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-800 shadow-xl text-right">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold mb-4 inline-block border border-cyan-500/30">
                      מאגר הידע והפרומפטים
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">מאגר הפרומפטים המקצועי של "מדברים בינה"</h2>
                    <p className="text-slate-300 text-base md:text-xl font-medium leading-relaxed">
                      חלק קטן מתוך ארגז הכלים שאנחנו מביאים לארגונים. סננו לפי נושא, העתיקו והתנסו בעצמכם.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => setMainView('prompts')} className="px-6 py-3.5 bg-cyan-500 text-black font-black rounded-2xl text-xs hover:bg-cyan-400 transition-all shadow-md flex items-center gap-2">
                      <span>מאגר הפרומפטים והתבניות לעסקים</span>
                      <span>📚</span>
                    </button>
                    <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-[#1877F2] text-white font-black rounded-2xl text-xs hover:bg-[#166fe5] transition-all shadow-md flex items-center gap-2">
                      <span>כניסה לקהילת "מדברים בינה"</span>
                      <span>👥</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 text-white p-8 rounded-[2.5rem] shadow-2xl text-center space-y-4">
                  <div className="text-5xl mb-2">🚀</div>
                  <h3 className="text-2xl font-black">אוטוריטה וחדשנות</h3>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    תובנות מעודכנות, מתודולוגיות עבודה מוכחות וגישה ישירה למאגר הידע המוביל בתחום.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. ABOUT (מי מוביל את התהליך) */}
            <section ref={aboutRef} className="bg-[#0D131F] rounded-[3rem] p-8 md:p-14 border border-slate-800 text-right animate-fadeIn">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Column: Avatar & LinkedIn */}
                <div className="lg:col-span-4 flex flex-col items-center text-center bg-[#070A10] p-8 rounded-[2.5rem] border border-slate-800 shadow-inner">
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl mb-4 border-4 border-slate-800 ring-4 ring-cyan-500/20 bg-[#070A10]">
                    <img
                      src="/ohad.jpeg"
                      alt="אוהד ברעם - מנהל מוצר ומוביל טרנספורמציה"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">אוהד ברעם</h3>
                  <p className="text-xs font-bold text-cyan-400 mb-6">מנהל מוצר ומוביל טרנספורמציה דיגיטלית בכיר</p>
                  
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
                    <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-2">מי מוביל את התהליך</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                      החיבור בין ניתוח תהליכים עסקיים, ניהול מוצר והנדסת AI מעשית
                    </h2>
                    
                    <div className="space-y-4 text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                      <p>
                        <strong className="text-white font-black text-xl block mb-2">נעים להכיר, שמי אוהד ברעם.</strong>
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
                      <p className="text-cyan-400 font-bold border-r-4 border-cyan-500 pr-4 my-2">
                        המטרה שלי היא להביא את הראייה המערכתית, היכולת לגשר בין הצרכים המקצועיים לטכנולוגיה, ולהוביל תהליכי חדשנות ומודרניזציה שמייצרים ערך אמיתי ומתמשך.
                      </p>
                    </div>
                  </div>

                  {/* 3 Bullets */}
                  <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                    <div className="bg-[#070A10] p-5 rounded-2xl border border-slate-800">
                      <div className="text-cyan-400 font-black text-sm mb-1">🎯 ראייה תהליכית מקיפה</div>
                      <div className="text-xs font-bold text-slate-400">אפיון זרימת מידע בארגון ומניעת כפילויות עבודה.</div>
                    </div>
                    <div className="bg-[#070A10] p-5 rounded-2xl border border-slate-800">
                      <div className="text-blue-400 font-black text-sm mb-1">🤖 מומחיות ב-AI מתקדם</div>
                      <div className="text-xs font-bold text-slate-400">בניית סוכנים חכמים, חיבורי API וצ'אטבוטים מבוססי ידע.</div>
                    </div>
                    <div className="bg-[#070A10] p-5 rounded-2xl border border-slate-800">
                      <div className="text-emerald-400 font-black text-sm mb-1">📈 מחויבות לתוצאות (ROI)</div>
                      <div className="text-xs font-bold text-slate-400">פתרונות מותאמים אישית ללא תלות בכלים מיותרים.</div>
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
            <div className="bg-[#0D131F] rounded-[3rem] p-8 md:p-12 border border-slate-800 text-center">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold mb-4 inline-block">מאגר ידע חופשי</span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">מאגר הפרומפטים המקצועי של "מדברים בינה"</h2>
              <p className="text-slate-400 font-bold text-base md:text-lg max-w-3xl mx-auto">
                חלק קטן מתוך ארגז הכלים שאנחנו מביאים לארגונים. סננו לפי נושא, העתיקו והתנסו בעצמכם.
              </p>
            </div>

            {/* Search & Categories */}
            <div className="max-w-3xl mx-auto flex gap-4">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
                placeholder="חפשו תבנית עבודה עסקית..."
                className="flex-grow px-8 py-5 rounded-2xl bg-[#0D131F] border border-slate-800 focus:border-cyan-500 outline-none text-right text-white font-medium"
              />
              <button onClick={() => setSearchTerm(searchInput)} className="px-8 py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all">חפש</button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar justify-center">
              <button
                onClick={() => { setActiveB2BCategory('all'); setSearchTerm(''); }}
                className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black border transition-all ${activeB2BCategory === 'all' ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg scale-105' : 'bg-[#0D131F] border-slate-800 text-slate-300 hover:border-cyan-500/50'}`}
              >
                🌐 כל התבניות העסקיות
              </button>
              {B2B_PROMPT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveB2BCategory(cat.id); setSearchTerm(''); }}
                  className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black border transition-all ${activeB2BCategory === cat.id ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg scale-105' : 'bg-[#0D131F] border-slate-800 text-slate-300 hover:border-cyan-500/50'}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Prompts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {filteredB2BPrompts.map((p) => (
                <div key={p.id} className="bg-[#0D131F] rounded-[2.5rem] p-8 border border-slate-800 flex flex-col justify-between relative hover:border-cyan-500/50 transition-all group">
                  <div className="text-right">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">{p.subCategory}</span>
                      {p.isPremium && (
                        <span className={`text-[10px] font-black px-3 py-1 rounded-xl flex items-center gap-1 ${unlockedPremium ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}`}>
                          {unlockedPremium ? '🔓 פתוח לשימוש' : '🔒 פרימיום לארגונים'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-white leading-tight">{p.title}</h3>
                    <p className="text-slate-400 text-xs md:text-sm font-bold mb-6">{p.explanation}</p>

                    <div className="bg-[#070A10] p-6 rounded-3xl mb-6 font-mono text-xs leading-relaxed text-slate-300 border border-slate-900 text-right relative" dir="rtl">
                      {p.isPremium && !unlockedPremium ? (
                        <div className="filter blur-xs select-none opacity-40">
                          {p.text}
                        </div>
                      ) : (
                        p.text
                      )}

                      {p.isPremium && !unlockedPremium && (
                        <div className="absolute inset-0 bg-[#070A10]/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center text-white">
                          <span className="text-3xl mb-2">🔒</span>
                          <h4 className="font-black text-base mb-1">תבנית עסקית מתקדמת</h4>
                          <p className="text-xs text-slate-300 font-bold mb-4">השאירו פרטים קצרים לפתיחת כל התבניות העסקיות</p>
                          <button onClick={() => handleB2BPromptClick(p)} className="px-6 py-2.5 bg-cyan-500 text-black font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all">
                            פתיחה מהירה ללא עלות 🔑
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#070A10] border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                      <span className="text-xs font-bold text-slate-300">
                        רוצים להפוך את הפרומפט הזה לפתרון AI אוטומטי בארגון?
                      </span>
                      <button onClick={openContactView} className="px-4 py-2 bg-cyan-500 text-black font-black text-xs rounded-xl transition-all shadow-md whitespace-nowrap hover:bg-cyan-400">
                        [תיאום שיחת אבחון] 📞
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleB2BPromptClick(p)}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${p.isPremium && !unlockedPremium ? 'bg-amber-500 text-black hover:bg-amber-400' : copiedId === p.id ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
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
        <div className="fixed inset-0 z-50 bg-[#070A10]/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0D131F] rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full text-right shadow-2xl border border-slate-800 relative">
            <button onClick={() => setShowUnlockModal(false)} className="absolute top-6 left-6 text-slate-400 hover:text-white text-2xl font-black">✕</button>
            
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 inline-block">🔑</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">פתיחת תבניות הפרימיום לארגונים</h3>
              <p className="text-slate-400 text-xs md:text-sm font-bold">
                השאירו פרטים קצרים לפתיחת גישה חופשית לכל תבניות הפרומפטים והאוטומציות!
              </p>
            </div>

            <form name="contact" method="POST" data-netlify="true" onSubmit={handleLeadSubmit} className="space-y-4">
              <input type="hidden" name="form-name" value="contact" />
              
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">שם מלא *</label>
                <input
                  type="text"
                  name="user_name"
                  required
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  placeholder="ישראל ישראלי"
                  className="w-full px-4 py-3 rounded-xl bg-[#070A10] border border-slate-800 outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">שם החברה / הארגון</label>
                <input
                  type="text"
                  name="company"
                  value={leadData.company}
                  onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                  placeholder="שם החברה (לא חובה)"
                  className="w-full px-4 py-3 rounded-xl bg-[#070A10] border border-slate-800 outline-none text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">מספר טלפון *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    placeholder="050-0000000"
                    className="w-full px-4 py-3 rounded-xl bg-[#070A10] border border-slate-800 outline-none text-white text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">אימייל *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#070A10] border border-slate-800 outline-none text-white text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-base shadow-lg transition-all disabled:opacity-50 mt-2"
              >
                {isSubmittingLead ? 'פותח גישה...' : 'פתיחת כל התבניות העסקיות 🔓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-slate-800 mt-20 space-y-4">
        <p className="text-sm font-black text-slate-400 uppercase tracking-wider text-center">
          © 2026 בינה לתעשייה | ENTERPRISE AI
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-bold text-slate-400">
          <a href="https://www.linkedin.com/in/ohad-baram-58a22632a" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">אוהד ברעם ב-LinkedIn 🔗</a>
          <button onClick={() => setIsPrivacyPolicyOpen(true)} className="hover:text-cyan-400 underline transition-colors">מדיניות פרטיות 📜</button>
          <button onClick={() => localStorage.removeItem('b2b_cookie_consent')} className="hover:text-cyan-400 transition-colors">ניהול עוגיות 🍪</button>
        </div>
      </footer>

      <CookieBanner onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} />
      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
      <AccessibilityToolbar />
      <ZapierChatbot />
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default App;