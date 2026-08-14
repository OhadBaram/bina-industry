import React, { useState, useEffect } from 'react';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose }) => {
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('b2b_cookie_consent');
    if (consent === 'necessary') {
      setAnalyticsConsent(false);
    } else {
      setAnalyticsConsent(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    localStorage.setItem('b2b_cookie_consent', analyticsConsent ? 'all' : 'necessary');
    onClose();
  };

  const handleAcceptAll = () => {
    localStorage.setItem('b2b_cookie_consent', 'all');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-right shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6" dir="rtl">
        
        <button
          onClick={onClose}
          className="sticky top-0 left-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-md float-left z-10"
        >
          ✕
        </button>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black mb-2 inline-block border border-cyan-500/30">
            🍪 הגדרות פרטיות וקובצי Cookie
          </span>
          <h2 className="text-2xl md:text-3xl font-black dark:text-white">ניהול הגדרות עוגיות (Cookies)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">תוכל לבחור אילו קובצי Cookie לאפשר במהלך הגלישה באתר.</p>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
          <p>
            אנו משתמשים בקובצי Cookie כדי לשפר את חוויית הגלישה שלך, לנתח את תעבורת האתר ולהתאים אישית את השירותים שלנו.
          </p>

          <div className="space-y-4">
            {/* עוגיות הכרחיות */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                  <span>עוגיות הכרחיות (Required)</span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-black">חובה</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-450">
                  עוגיות אלו נחוצות כדי לאפשר את פעולתו התקינה של האתר, כגון שמירת העדפות תצוגה (מצב כהה/בהיר), העדפות נגישות ואבטחה. לא ניתן לכבות עוגיות אלו.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-not-allowed mt-1"
              />
            </div>

            {/* עוגיות אנליטיקה */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  עוגיות אנליטיקה ושיפור ביצועים (Analytics)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-450">
                  אנו משתמשים בכלים כמו Google Analytics כדי לאסוף מידע אנונימי על אופן השימוש באתר (דפים פופולריים, זמני שהייה). מידע זה עוזר לנו לשפר את האתר והשירותים שלנו.
                </p>
              </div>
              <input
                type="checkbox"
                id="cookie_analytics_toggle"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleSaveSettings}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all"
          >
            שמור הגדרות 💾
          </button>
          <button
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
          >
            אישור כל העוגיות ✅
          </button>
        </div>
      </div>
    </div>
  );
};
