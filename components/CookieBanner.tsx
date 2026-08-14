import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('b2b_cookie_consent');
    if (!consent || isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleAcceptAll = () => {
    localStorage.setItem('b2b_cookie_consent', 'all');
    setIsVisible(false);
    onClose();
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem('b2b_cookie_consent', 'necessary');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 z-40 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-5xl mx-auto bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 rounded-[2rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-right" dir="rtl">
        <div className="space-y-2 flex-grow">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍪</span>
            <h4 className="font-black text-base md:text-lg">שמירה על הפרטיות והעוגיות שלך</h4>
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed max-w-3xl">
            אנו משתמשים בעוגיות הכרחיות ובכלים אנליטיים כדי להבטיח את תפעולו התקין של האתר, לשפר את חוויית המשתמש ולספק לך תוכן מותאם אישית.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={onOpenPrivacyPolicy}
            className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white underline underline-offset-4 transition-colors"
          >
            מדיניות פרטיות 📜
          </button>
          
          <button
            onClick={handleNecessaryOnly}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition-all border border-slate-700"
          >
            הכרחיות בלבד 🔒
          </button>
          
          <button
            onClick={handleAcceptAll}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg transition-all"
          >
            אישור כל העוגיות 🍪
          </button>
        </div>
      </div>
    </div>
  );
};
