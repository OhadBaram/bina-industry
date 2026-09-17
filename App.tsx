import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES, ALL_PROMPTS } from './data/prompts';
import { B2B_SERVICES, PAIN_POINTS, USE_CASES, B2B_PROMPT_CATEGORIES, B2B_PROMPTS, CAPABILITIES, METHODOLOGY_STEPS, AUTHORITY_METRICS } from './data/b2bData';
import { B2BPrompt, B2BService } from './types';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { AccessibilityStatementModal } from './components/AccessibilityStatementModal';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { CookieBanner } from './components/CookieBanner';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { AiChatbot } from './components/AiChatbot';
import { appendStoredLead } from './shared/leadStorage';
import { FALLBACK_ANALYSIS, type LeadAnalysis } from './shared/leadConfig';

// Architectural SVG Icons (Zero Emojis, Bespoke Starchitect Aesthetic)
const Icons = {
  HexPrism: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="21" y1="7" x2="3" y2="17" />
      <line x1="21" y1="17" x2="3" y2="7" />
    </svg>
  ),
  Tower: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V7l6-5 6 5v15" />
      <path d="M6 12h12" />
      <path d="M6 17h12" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Compass: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  Award: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  VoiceWave: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5v14M7 5v14M2 10v4M22 10v4" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
    </svg>
  )
};

// מערכת התראות (Toast) נקייה ומדויקת ללא אימוג'י
const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
    <div className="bg-slate-950/90 border border-cyan-500/50 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm md:text-base flex items-center gap-3">
      <span>{message}</span>
      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">✓</span>
    </div>
  </div>
);

// מיפוי הטקסטים הראשוניים לפי השירות שנבחר
const serviceMessages: Record<string, string> = {
  agents: "היי אוהד,\nאנו מעוניינים בפיתוח והטמעת סוכן AI / אוטומציה מותאמת אישית לעסק (בדומה לפרויקט BinaTor). נשמח לתאם שיחת אפיון טכנולוגית.",
  sop: "היי אוהד,\nאנו מעוניינים באפיון תהליכי עבודה ומסמכים (SOPs, הצעות מחיר ומסמכי דרישות) באמצעות כלי AI. נשמח לתאם שיחת אבחון ראשונית.",
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

      const [, leadResult] = await Promise.allSettled([
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: netlifyBody,
        }),
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload),
        }),
      ]);

      if (leadResult.status === 'fulfilled') {
        try {
          const leadJson = (await leadResult.value.json()) as {
            channels?: { sheets?: string; telegram?: string };
            sheetsDetail?: string | null;
            analysis?: LeadAnalysis;
            lead?: typeof leadPayload;
          };
          console.log('[lead] channels', leadJson.channels);
          if (leadJson.sheetsDetail) {
            console.warn('[lead] sheetsDetail', leadJson.sheetsDetail);
          }
          if (leadJson.analysis) {
            appendStoredLead(
              {
                full_name: combinedIdentity,
                user_name: userName,
                company_name: companyName,
                phone: leadData.phone,
                email: leadData.email,
                message: leadData.message,
                created_at: leadPayload.created_at,
              },
              leadJson.analysis
            );
          } else {
            appendStoredLead(
              {
                full_name: combinedIdentity,
                user_name: userName,
                company_name: companyName,
                phone: leadData.phone,
                email: leadData.email,
                message: leadData.message,
                created_at: leadPayload.created_at,
              },
              {
                ...FALLBACK_ANALYSIS,
                summary: leadData.message
                  ? `פנייה מ-${combinedIdentity}: ${leadData.message.slice(0, 180)}`
                  : FALLBACK_ANALYSIS.summary,
              }
            );
          }
        } catch {
          /* ignore parse */
        }
      }

      // מייל וגיליון אופציונליים — ההצלחה למשתמש נשענת על קבלת הפנייה + טלגרם/ניתוח
      setToastMessage('פנייתך התקבלה בהצלחה! אחזור אליך לשיחת אבחון בהקדם 🚀');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.log('Form submission handled:', err);
      setToastMessage('פנייתך התקבלה בהצלחה! אחזור אליך לשיחת אבחון בהקדם 🚀');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsSubmittingLead(false);
      setLeadSubmitted(true);
      setUnlockedPremium(true);
      localStorage.setItem('b2b_leads_unlocked', 'true');
      setShowUnlockModal(false);
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

  const closeMobileNav = () => setIsMobileNavOpen(false);

  const openContactView = () => {
    closeMobileNav();
    setMainView('home');
    setTimeout(() => {
      contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const scrollToCapabilities = () => {
    closeMobileNav();
    setMainView('home');
    setTimeout(() => {
      capabilitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const scrollToMethodology = () => {
    closeMobileNav();
    setMainView('home');
    setTimeout(() => {
      methodologyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const scrollToAbout = () => {
    closeMobileNav();
    setMainView('home');
    setTimeout(() => {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // מעבר לתצוגת מאגר הפרומפטים וגלילה לראש העמוד
  const goToPromptsView = () => {
    closeMobileNav();
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
    <div id="contact" ref={contactFormRef} className="mirrored-glass rounded-[3rem] p-8 md:p-14 border border-white/10 text-right animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-mono uppercase tracking-widest mb-4 border border-cyan-500/30">
          EXECUTIVE CONSULTATION // פנייה ישירה לאוהד ברעם
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">בואו נבדוק התאמה לארגון שלכם</h3>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
          שיחת אבחון והבנת צרכים אישית עם אוהד — ללא עלות. ספרו לי בקצרה על האתגר או המשימה, ואחזור אליכם בהקדם.
        </p>
      </div>

      {leadSubmitted ? (
        <div className="bg-emerald-950/40 border-2 border-emerald-500/50 p-10 rounded-3xl text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto mb-4 flex items-center justify-center font-mono font-bold text-2xl">✓</div>
          <h4 className="text-3xl font-black text-emerald-200 mb-3">תודה רבה! הפנייה התקבלה בהצלחה</h4>
          <p className="text-emerald-300 font-bold text-base md:text-lg max-w-xl mx-auto mb-6">
            קיבלתי את פרטי הארגון שלך. אחזור אליך בהקדם לשיחת אבחון ראשונית.
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
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            שליחת פנייה נוספת
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
              <label htmlFor="user_name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">שם מלא *</label>
              <input
                id="user_name"
                type="text"
                name="user_name"
                required
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                placeholder="ישראל ישראלי"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">שם החברה / ארגון</label>
              <input
                id="company_name"
                type="text"
                name="company"
                value={leadData.company}
                onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                placeholder="שם החברה (לא חובה)"
                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300">מספר טלפון *</label>
                {leadData.phone && !isValidIsraeliPhone(leadData.phone) && (
                  <span className="text-[11px] font-bold text-amber-500 animate-pulse">נא להזין מספר תקין (9-10 ספרות)</span>
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
                className={`w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border ${
                  leadData.phone && !isValidIsraeliPhone(leadData.phone)
                    ? 'border-amber-500/70 focus:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-white/10 focus:border-cyan-500'
                } outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm`}
                dir="ltr"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="user_email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">דוא״ל לחזרה *</label>
                {emailTouched && leadData.email && !isValidEmail(leadData.email) && (
                  <span className="text-[11px] font-bold text-amber-500">פורמט דוא״ל לא תקין</span>
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
                className={`w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border ${
                  emailTouched && leadData.email && !isValidEmail(leadData.email)
                    ? 'border-amber-500/70 focus:border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-white/10 focus:border-cyan-500'
                } outline-none text-right text-slate-900 dark:text-white font-medium transition-all shadow-sm`}
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">פרטי הפנייה (ניתן לעריכה) *</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={leadData.message}
              onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
              placeholder="ספרו בקצרה על הצורך או האתגר שלכם..."
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 outline-none text-right text-slate-900 dark:text-white font-medium transition-all resize-none shadow-sm"
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
              className="btn-submit w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-lg shadow-xl hover:shadow-cyan-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer border border-cyan-400/30"
            >
              <span>{isSubmittingLead ? 'שולח פנייה...' : 'תיאום שיחת אבחון וייעוץ'}</span>
              <Icons.Phone />
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">מעדיפים פנייה מהירה וישירה?</span>
              <a
                href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-emerald-400/30"
              >
                <span>שליחת הודעה בוואטסאפ (053-6244330)</span>
                <Icons.WhatsApp />
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen font-sans text-right relative selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300 ${isDarkMode ? 'bg-[#050811] text-slate-100 dark bg-blueprint-grid' : 'bg-slate-50 text-slate-900 bg-blueprint-grid'}`} dir="rtl">
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-6 py-4 transition-all ${isDarkMode ? 'bg-[#050811]/85 border-white/10 text-white shadow-2xl' : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setMainView('home')}>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-105 group-hover:border-cyan-400/60 transition-all">
              <Icons.HexPrism />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className={`text-lg md:text-xl font-black leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  בינה לתעשייה
                </span>
                <span className="hidden sm:inline text-xs font-bold text-slate-500">|</span>
                <span className="hidden sm:inline text-xs md:text-sm font-bold text-cyan-400">
                  אוהד ברעם
                </span>
              </div>
              <span className="hidden md:block text-[11px] font-mono tracking-wider text-slate-400 mt-0.5 uppercase">
                ייעוץ, חדשנות וארכיטקטורת AI
              </span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button onClick={scrollToCapabilities} className="px-4 py-2 rounded-xl font-bold text-xs md:text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer">השירותים</button>
            <button onClick={scrollToMethodology} className="px-4 py-2 rounded-xl font-bold text-xs md:text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer">תהליך העבודה</button>
            <button onClick={scrollToAbout} className="px-4 py-2 rounded-xl font-bold text-xs md:text-sm text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer">אודות אוהד</button>
            <button onClick={goToPromptsView} className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'}`}>מאגר הפרומפטים</button>
            <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl font-bold text-xs md:text-sm text-blue-400 hover:bg-blue-950/40 transition-all flex items-center gap-1.5">
              <span>קהילה</span>
              <Icons.ExternalLink />
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
              className="hidden lg:flex p-3 bg-white/5 border border-white/10 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 rounded-xl transition-all items-center justify-center cursor-pointer shadow-md"
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            <a
              href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex px-4 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-md active:scale-95 items-center gap-2 cursor-pointer border border-emerald-400/40"
              title="פנייה ישירה בוואטסאפ (053-6244330)"
            >
              <span>וואטסאפ</span>
              <Icons.WhatsApp />
            </a>

            <button 
              onClick={openContactView}
              className="px-4 sm:px-5 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer border border-cyan-400/30"
              title="תיאום שיחת אבחון — ללא עלות"
            >
              <span className="hidden sm:inline">שיחת אבחון וייעוץ</span>
              <span className="sm:hidden">אבחון</span>
              <Icons.Phone />
            </button>

            <button
              type="button"
              className="lg:hidden p-3 bg-white/5 border border-white/10 text-slate-200 rounded-xl font-bold text-base leading-none cursor-pointer"
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              {isMobileNavOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isMobileNavOpen && (
          <nav className="lg:hidden mt-3 pt-3 border-t border-white/10" aria-label="ניווט ראשי">
            <div className="flex flex-col gap-2">
              <button onClick={scrollToCapabilities} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-200 border border-white/10">השירותים</button>
              <button onClick={scrollToMethodology} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-200 border border-white/10">תהליך העבודה</button>
              <button onClick={scrollToAbout} className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-200 border border-white/10">אודות אוהד</button>
              <button onClick={goToPromptsView} className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold ${mainView === 'prompts' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-200 border border-white/10'}`}>מאגר הפרומפטים</button>
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-200 border border-white/10 flex items-center justify-between"
              >
                <span>{isDarkMode ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}</span>
                {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="w-full text-right px-4 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white flex items-center justify-between">
                <span>קהילת מדברים בינה</span>
                <Icons.ExternalLink />
              </a>
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* === VIEW 1: ENTERPRISE AI LANDING PAGE (HOME) === */}
        {mainView === 'home' && (
          <div className="space-y-24 animate-fadeIn">
            
            {/* 1. HERO SECTION */}
            <section className="text-center py-12 md:py-24 relative overflow-hidden">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-cyan-500/30 rounded-full text-xs md:text-sm font-bold mb-8 backdrop-blur-xl shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="font-mono text-cyan-400 uppercase tracking-widest text-[11px]">ARCHITECTURAL AI // OHAD BARAM</span>
                <span className="text-slate-600 dark:text-slate-500">|</span>
                <span className="text-slate-300">ייעוץ, חדשנות וארכיטקטורת מערכות AI בעסקים</span>
              </div>
              
              <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.08] max-w-5xl mx-auto mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ארכיטקטורת AI מתקדמת לעסקים.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
                  משלב האפיון ועד לסוכנים בשטח.
                </span>
              </h1>

              <p className={`text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                אוהד ברעם מוביל טרנספורמציה טכנולוגית המשלבת ניהול מוצר קפדני (Product Discovery) עם הנדסת אוטומציות וסוכני שטח עצמאיים (כדוגמת מערכת BinaTor). ללא סיסמאות שיווקיות — רק ארכיטקטורה יציבה שמייצרת ROI מוכח וחיסכון בשעות עבודה.
              </p>

              <p className={`text-base md:text-lg font-bold max-w-2xl mx-auto mb-10 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                שיחת אבחון והבנת צרכים אישית עם אוהד — ללא עלות
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
                <button
                  onClick={openContactView}
                  className="w-full sm:w-auto px-8 py-4.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base md:text-lg rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-cyan-400/30"
                >
                  <span>תיאום שיחת אבחון וייעוץ</span>
                  <Icons.Phone />
                </button>

                <a
                  href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-base md:text-lg rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/40"
                >
                  <span>וואטסאפ ישיר: 053-6244330</span>
                  <Icons.WhatsApp />
                </a>

                <button
                  onClick={scrollToCapabilities}
                  className={`w-full sm:w-auto px-6 py-4.5 border font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-200 hover:border-cyan-500/50 hover:bg-white/10' : 'bg-white border-slate-300 text-slate-800 hover:border-cyan-500 shadow-md'}`}
                >
                  <span>מתחם המגדלים והשירותים ↓</span>
                </button>
              </div>
            </section>

            {/* 2. AUTHORITY & IMPACT METRICS */}
            <section className="py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {AUTHORITY_METRICS.map((metric) => (
                  <div
                    key={metric.id}
                    className="mirrored-glass mirrored-glass-hover hex-clip p-6 md:p-8 rounded-3xl text-right flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/15 transition-all"></div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          {metric.id === 'flagship' && <Icons.Tower />}
                          {metric.id === 'hours-saved' && <Icons.Clock />}
                          {metric.id === 'product-led' && <Icons.Compass />}
                          {metric.id === 'education' && <Icons.Award />}
                        </div>
                        <span className="text-[11px] font-mono font-black uppercase text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/25">
                          {metric.value}
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-1.5 leading-snug">
                        {metric.label}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {metric.sublabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. STRUCTURAL PHILOSOPHY (המציאות בשטח) */}
            <section className="mirrored-glass rounded-[3rem] p-8 md:p-14 text-right relative overflow-hidden">
              <div className="text-center mb-12">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono uppercase tracking-widest block mb-2">ANALYSIS & PHILOSOPHY // המציאות בשטח</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">למה רוב יוזמות ה-AI בעסקים נתקעות?</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
                  הפער בין רכישת כלי מדף שבירים לבין ארכיטקטורת מוצר ייעודית שמייצרת החזר השקעה בשגרת העבודה.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* הכשל השכיח */}
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-rose-950/20 dark:bg-rose-950/15 border border-rose-500/30 space-y-4 backdrop-blur-xl relative overflow-hidden">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-400 rounded-full text-xs font-black border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>הכשל השכיח בשוק</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">רכישת כלי מדף ללא חיבור לתהליכי ליבה</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    חברות רוכשות מנויים ל-ChatGPT או מנסות כלים גנריים ללא אפיון, ללא נהלים מוגדרים וללא התאמה לעסק. העובדים נותרים חסרי אונים, התהליכים ממשיכים להישבר, וההשקעה יורדת לטמיון ללא תוצאה מדידה.
                  </p>
                </div>

                {/* התקן הארכיטקטוני */}
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-cyan-950/20 dark:bg-cyan-950/15 border border-cyan-500/30 space-y-4 backdrop-blur-xl relative overflow-hidden">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-black border border-cyan-500/30">
                    <Icons.Check />
                    <span>התקן הארכיטקטוני של בינה לתעשייה</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">ניהול מוצר מדויק + סוכני שטח אוטונומיים</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                    שילוב הדוק בין אפיון תהליכים קפדני (Discovery & PRD), בניית נהלי עבודה מבוססי ידע ארגוני (SOPs), והטמעת סוכנים אוטונומיים המחוברים ישירות למערכות העסק (וואטסאפ, יומנים וסליקה) עם מדידת ROI ברורה.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. THE CENTRAL SHOWPIECE: THE DUAL HEXAGONAL MIRRORED TOWERS & SKYBRIDGE */}
            <section className="space-y-8 relative">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-mono uppercase tracking-widest border border-cyan-500/30">
                  THE ARCHITECTURAL COMPLEX // מתחם שני המגדלים
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white">
                  שני מגדלי מראות משושים וגשר נתונים מחבר
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                  ארכיטקטורה הנדסית מלאה: ממגדל האפיון וניהול המוצר של אוהד ברעם, דרך גשר הנתונים המבני, ועד למגדל הסוכנים האוטונומיים של BinaTor.
                </p>
              </div>

              {/* The Towers Complex Layout */}
              <div className="grid lg:grid-cols-12 gap-8 items-stretch pt-4">
                
                {/* TOWER 1: ARCHITECTURE & PRODUCT DISCOVERY */}
                <div className="lg:col-span-5 mirrored-glass hex-clip p-8 md:p-10 rounded-3xl flex flex-col justify-between relative border border-cyan-500/30 hover:border-cyan-400/60 transition-all group shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-black text-sm">
                          T1
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase block">TOWER 01</span>
                          <span className="text-xs font-bold text-slate-400">מרכז האפיון והחדשנות</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
                        DISCOVERY & SOPS
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">
                      ניהול מוצר, הנדסת תהליכים ונהלי עבודה
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                      התשתית האסטרטגית שבלעדיה שום מערכת AI לא תעבוד: מיפוי צווארי הבקבוק, תרגום הידע הארגוני למסמכי נהלים (SOPs) והכשרת עובדים לעבודה מדויקת.
                    </p>

                    <div className="space-y-3.5 mb-8">
                      <div className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-200">
                        <Icons.Check />
                        <span>אפיון עומק של מסלולי עבודה וצווארי בקבוק (Deep Discovery)</span>
                      </div>
                      <div className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-200">
                        <Icons.Check />
                        <span>מסמכי דרישות קפדניים (PRDs) ותבניות עבודה מבוססות ידע</span>
                      </div>
                      <div className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-200">
                        <Icons.Check />
                        <span>תרגום הידע והניסיון של העסק לנהלים מבניים (SOPs)</span>
                      </div>
                      <div className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-200">
                        <Icons.Check />
                        <span>הכשרת צוותים Hands-on לביטול חסמי אימוץ והתנגדויות</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">ארכיטקטורה יציבה ומאופיינת</span>
                    <button
                      onClick={() => prefillServiceAndScroll('consulting')}
                      className="text-xs font-bold text-slate-200 hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>אפיון תהליכים</span>
                      <Icons.ArrowLeft />
                    </button>
                  </div>
                </div>

                {/* THE SKYBRIDGE (DATA CONDUIT & LOGIC SKYBRIDGE) */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center relative py-4 lg:py-0">
                  <div className="w-full h-full min-h-[160px] lg:min-h-[auto] mirrored-glass rounded-3xl p-5 border border-cyan-500/40 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                    
                    {/* Glowing pulse line through the skybridge */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-skybridge-pulse"></div>
                    
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                      <Icons.Compass />
                    </div>

                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                      THE SKYBRIDGE
                    </span>
                    <h4 className="text-xs font-black text-white mb-2">גשר הנתונים המבני</h4>
                    <p className="text-[11px] text-slate-300 font-medium leading-tight mb-3">
                      חיבור הלוגיקה העסקית וה-SOPs אל ביצוע אוטונומי
                    </p>

                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                      100% סנכרון מבני
                    </span>
                  </div>
                </div>

                {/* TOWER 2: B2B AUTONOMOUS AGENT ENGINE (BINATOR) */}
                <div className="lg:col-span-5 mirrored-glass hex-clip p-8 md:p-10 rounded-3xl flex flex-col justify-between relative border border-cyan-500/30 hover:border-cyan-400/60 transition-all group shadow-2xl">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-sm">
                          T2
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-emerald-400 tracking-wider uppercase block">TOWER 02</span>
                          <span className="text-xs font-bold text-slate-400">מגדל הסוכנים האוטונומיים</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-bold">
                        BINATOR 24/7 LIVE
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">
                      BinaTor — מערכת AI אוטונומית מקצה-לקצה
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                      פרויקט הדגל המוביל של "בינה לתעשייה": סוכן בינה מלאכותית עצמאי המזהה את הפונה בוואטסאפ או בקישור, שולף עבורו תורים משויכים, מאפשר ביטול ותפעול עצמאי לפי מדיניות העסק, מקשיב להודעות קוליות ומשריין אשראי 24/7 ללא מגע יד אדם.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                          <Icons.UserCheck />
                          <span>זיהוי פונה ומידע אישי</span>
                        </div>
                        <p className="text-[11px] text-slate-400">שליפת תורים משויכים בלבד בוואטסאפ ובקישור</p>
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                          <Icons.Refresh />
                          <span>תפעול וביטול עצמאי</span>
                        </div>
                        <p className="text-[11px] text-slate-400">ביטול או שינוי תור ישירות בשיחה לפי מדיניות העסק</p>
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                          <Icons.VoiceWave />
                          <span>מנוע הבנת קול</span>
                        </div>
                        <p className="text-[11px] text-slate-400">פענוח שמע והקלטות בסלנג עברי טבעי</p>
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                          <Icons.ShieldCheck />
                          <span>שריון אשראי (J5 Hold)</span>
                        </div>
                        <p className="text-[11px] text-slate-400">הגנה מפני ביטולים וסנכרון יומנים מלא</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href="https://binator.co.il/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>כניסה לאתר BinaTor בלייב</span>
                      <Icons.ExternalLink />
                    </a>
                    <a
                      href="https://wa.me/972552993825?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%A7%D7%91%D7%95%D7%A2%20%D7%AA%D7%95%D7%A8%20%D7%9C%D7%91%D7%93%D7%99%D7%A7%D7%94%20%5B%D7%93%D7%9E%D7%95%5D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-3 px-4 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
                    >
                      <span>בדיקת בוט הוואטסאפ</span>
                      <Icons.WhatsApp />
                    </a>
                  </div>
                </div>

              </div>
            </section>

            {/* 5. CORE SERVICES (4 MONOLITHIC MIRRORED GLASS MODULES) */}
            <section ref={capabilitiesRef} className="py-6 space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono uppercase tracking-widest block">CORE SERVICES // שירותי הליבה</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">4 מסלולי עבודה ממוקדים לתוצאות</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                  ללא מורכבות מיותרת — פתרונות מדויקים המייצרים חיסכון בשעות עבודה וערך עסקי מיידי.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {B2B_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className={`mirrored-glass hex-clip rounded-[3rem] p-8 md:p-10 flex flex-col justify-between group relative transition-all ${
                      srv.highlight
                        ? 'border-cyan-500/60 shadow-[0_20px_50px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                        : 'border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    {srv.highlight && (
                      <div className="absolute top-6 left-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                        FLAGSHIP SERVICE
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-black text-sm border border-cyan-500/30">
                          {srv.num}
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                          {srv.id === 'agents' && <Icons.Tower />}
                          {srv.id === 'consulting' && <Icons.Compass />}
                          {srv.id === 'sop' && <Icons.Clock />}
                          {srv.id === 'workshops' && <Icons.Award />}
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
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
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <Icons.Check />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {srv.techBadges && srv.techBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {srv.techBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-3 py-1 bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs font-bold rounded-xl"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => prefillServiceAndScroll(srv.serviceKey || 'agents')}
                      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        srv.highlight
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                          : 'bg-white/5 hover:bg-white/10 text-slate-100 border border-white/10 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{srv.ctaText}</span>
                      <Icons.ArrowLeft />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. METHODOLOGY (מתודולוגיית העבודה - 4 השלבים) */}
            <section ref={methodologyRef} className="mirrored-glass rounded-[3rem] p-8 md:p-14 border border-white/10 text-right">
              <div className="text-center mb-14 space-y-3">
                <span className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-mono uppercase tracking-widest border border-cyan-500/30">
                  EXECUTION PIPELINE // תהליך העבודה
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">מאבחון ועד להטמעה מלאה</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
                  מתודולוגיה מובנית שמבטיחה שכל מודול AI וסוכן מוטמעים בדיוק לפי צרכי העסק ומביאים תוצאות ברורות.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {METHODOLOGY_STEPS.map((st) => (
                  <div key={st.stepNum} className="mirrored-glass hex-clip p-7 rounded-3xl relative flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm border border-cyan-500/30">
                          {st.stepNum}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
                          {st.stepNum === '01' && <Icons.Compass />}
                          {st.stepNum === '02' && <Icons.Clock />}
                          {st.stepNum === '03' && <Icons.Award />}
                          {st.stepNum === '04' && <Icons.Tower />}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">
                        {st.title}
                      </h3>
                      <p className="text-xs font-mono text-cyan-400 mb-3">{st.shortDesc}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{st.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. ABOUT & STRATEGIC COMPARISON */}
            <div className="space-y-12">
              <section ref={aboutRef} className="mirrored-glass rounded-[3rem] p-8 md:p-14 border border-white/10 text-right animate-fadeIn shadow-2xl">
                <div className="grid lg:grid-cols-12 gap-10 items-center">
                  
                  {/* Left Column: Avatar & LinkedIn */}
                  <div className="lg:col-span-4 flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl mb-6 border-2 border-cyan-500/30 p-2 bg-slate-950/60 flex items-center justify-center">
                      <img
                        src="/ohad.jpeg"
                        alt="אוהד ברעם - מומחה חדשנות והטמעת בינה מלאכותית"
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">אוהד ברעם</h3>
                    <p className="text-xs font-mono text-cyan-400 mb-6">מומחה חדשנות, ניהול מוצר והטמעת AI</p>
                    
                    <a
                      href="https://www.linkedin.com/in/ohad-baram"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>פרופיל LinkedIn מקצועי</span>
                      <Icons.LinkedIn />
                    </a>
                  </div>

                  {/* Right Column: Bio */}
                  <div className="lg:col-span-8 space-y-6">
                    <div>
                      <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono uppercase tracking-widest block mb-2">LEADERSHIP // מי מוביל את התהליך</span>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                        שילוב ייחודי של ניהול מוצר, הנדסת תהליכים וארכיטקטורת AI
                      </h2>
                      
                      <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                        <p>
                          <strong className="text-slate-900 dark:text-white font-black text-xl block mb-2">נעים להכיר, שמי אוהד ברעם.</strong>
                        </p>
                        <p>
                          אני מנהל מוצר ובעל תואר שני בניהול ארגוני שירות בהצטיינות. המומחיות שלי היא לתרגם צרכים עסקיים מורכבים לתהליכי עבודה ברורים, נהלים מבוססי ידע ארגוני, ומערכות AI אוטונומיות שמייצרות ערך אמיתי בשטח.
                        </p>
                        <p>
                          לאורך השנים ליוויתי והובלתי תהליכים מורכבים משלב האבחון והגדרת הדרישות ועד להטמעה מלאה בקרב צוותים ועובדים. אני מאמין שהמפתח להצלחה ב-AI אינו "עוד כלי מדף", אלא התאמה מדויקת לתהליכי העבודה היומיומיים של העסק והכשרה מעשית של האנשים שמפעילים אותם.
                        </p>
                      </div>
                    </div>

                    {/* 3 Bullets */}
                    <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                      <div className="p-5 rounded-2xl bg-white/5 border border-cyan-500/30">
                        <div className="text-cyan-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-2">
                          <Icons.Compass />
                          <span>אפיון תהליכים מעמיק</span>
                        </div>
                        <div className="text-xs font-medium text-slate-400 leading-relaxed">בניית נהלי עבודה ומסמכים מהידע של העסק.</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-cyan-500/30">
                        <div className="text-cyan-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-2">
                          <Icons.Award />
                          <span>הכשרה מעשית Hands-on</span>
                        </div>
                        <div className="text-xs font-medium text-slate-400 leading-relaxed">סדנאות ממוקדות על משימות אמת של העסק.</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-cyan-500/30">
                        <div className="text-cyan-400 font-black text-sm md:text-base mb-1.5 flex items-center gap-2">
                          <Icons.Clock />
                          <span>מחויבות ל-ROI ולחיסכון בזמן</span>
                        </div>
                        <div className="text-xs font-medium text-slate-400 leading-relaxed">מיקוד בחיסכון מוכח שניתן למדוד.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Comparison Section (למה לעבוד איתי? ההבדל בתוצאות) */}
              <section className="mirrored-glass rounded-[3rem] p-8 md:p-14 border border-white/10 space-y-10 animate-fadeIn">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="inline-flex items-center px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-mono uppercase tracking-widest border border-cyan-500/30">
                    DIFFERENTIATION // למה לעבוד איתי?
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                    מומחיות בניהול מוצר במקום הבטחות שיווקיות
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 font-bold text-base md:text-lg">
                    ההבדל בין פתרונות שבירים לבין הטמעה מעשית שעובדת בשטח
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="mirrored-glass rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all">
                    <div className="space-y-4">
                      <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-rose-400 block mb-1.5">בשוק הרגיל</span>
                        <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed">
                          בונים תהליכים שטחיים שנשברים בכל שינוי קטן, ללא תיעוד, ללא נהלים וללא טיפול בשגיאות.
                        </p>
                      </div>
                      <div className="p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-cyan-400 block mb-1.5">איתי</span>
                        <p className="text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                          אפיון תהליך מעמיק, נהלים מסודרים מהידע של העסק ומתודולוגיה מובנית שמייצרת תוצרים אמינים לאורך זמן.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mirrored-glass rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all">
                    <div className="space-y-4">
                      <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-rose-400 block mb-1.5">בשוק הרגיל</span>
                        <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed">
                          קונים מנויים ל-ChatGPT/Claude ומשאירים את העובדים לנסות "להסתדר לבד" ללא הדרכה.
                        </p>
                      </div>
                      <div className="p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-cyan-400 block mb-1.5">איתי</span>
                        <p className="text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                          סדנאות Hands-on מעשיות ותרגול ישיר על משימות אמת מהעסק עד לאימוץ מלא ועצמאי של הצוות.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mirrored-glass rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all">
                    <div className="space-y-4">
                      <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-rose-400 block mb-1.5">בשוק הרגיל</span>
                        <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed">
                          הבטחות שיווקיות על "מהפכות ענק" שמתמסמסות ללא חיסכון מוכח בזמן או בעלויות.
                        </p>
                      </div>
                      <div className="p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                        <span className="text-xs font-mono font-black text-cyan-400 block mb-1.5">איתי</span>
                        <p className="text-xs md:text-sm font-medium text-slate-200 leading-relaxed">
                          אבחון ממוקד לזיהוי צווארי הבקבוק, והתמקדות בהחזר השקעה שאפשר למדוד.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* 8. CONTACT FORM AT BOTTOM OF HOME */}
            {renderLeadForm()}
          </div>
        )}

        {/* === VIEW 2: B2B PROMPT LIBRARY (/prompts) === */}
        {mainView === 'prompts' && (
          <section className="animate-fadeIn space-y-10">
            <div className="bg-white dark:bg-[#0D131F] rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xl dark:shadow-none">
              <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black mb-4 inline-block border border-cyan-500/30">
                דוגמאות מעשיות לעבודה עם AI בעסק
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">מאגר תבניות ופרומפטים לעסקים</h2>
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
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center" aria-label="גרסת האתר">
          גרסה 2026.09.03ד
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
          <button onClick={() => setIsTermsOfServiceOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">תנאי שימוש</button>
          <span>|</span>
          <button onClick={() => setIsPrivacyPolicyOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">מדיניות פרטיות</button>
          <span>|</span>
          <button onClick={() => setIsAccessibilityStatementOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">הצהרת נגישות</button>
          <span>|</span>
          <a href="https://www.linkedin.com/in/ohad-baram" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5">
            <span>LinkedIn</span>
            <Icons.LinkedIn />
          </a>
          <span>|</span>
          <a href="https://www.facebook.com/share/g/183u1ktJDZ/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer">קהילת מדברים בינה</a>
          <span>|</span>
          <button onClick={() => setIsCookieSettingsOpen(true)} className="hover:text-cyan-600 dark:hover:text-cyan-400 underline transition-colors cursor-pointer bg-transparent border-none">ניהול עוגיות</button>
        </div>
      </footer>

      {isCookieBannerOpen && (
        <CookieBanner onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} onClose={() => setIsCookieBannerOpen(false)} />
      )}
      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceOpen} onClose={() => setIsTermsOfServiceOpen(false)} />
      <AccessibilityStatementModal isOpen={isAccessibilityStatementOpen} onClose={() => setIsAccessibilityStatementOpen(false)} />
      <CookieSettingsModal isOpen={isCookieSettingsOpen} onClose={() => setIsCookieSettingsOpen(false)} />

      {/* כפתור וואטסאפ צף מלוטש */}
      <a
        href="https://wa.me/972536244330?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%94%D7%93%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%22%D7%91%D7%99%D7%A0%D7%94%20%D7%9C%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%AA%D7%90%D7%9D%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%90%D7%91%D7%97%D7%95%D7%9F"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="פנייה מהירה בוואטסאפ לאוהד ברעם"
        className="fixed bottom-8 right-6 z-[999998] flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/40 cursor-pointer"
        title="פנייה ישירה בוואטסאפ לאוהד (053-6244330)"
      >
        <span className="hidden sm:inline font-bold text-xs">וואטסאפ ישיר</span>
        <Icons.WhatsApp />
      </a>

      <AccessibilityToolbar />
      <AiChatbot />
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default App;