import React, { useState, useEffect } from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingIn(true);
      const timer = setTimeout(() => setIsAnimatingIn(false), 400);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 ${
      isAnimatingOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 max-w-3xl w-full max-h-[85vh] overflow-y-auto text-right shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6 ${
        isAnimatingOut ? 'animate-implode-left' : isAnimatingIn ? 'animate-explode-left' : 'animate-fadeIn'
      }`}>
        
        <button
          onClick={onClose}
          className="sticky top-0 left-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-md float-left z-10"
        >
          ✕
        </button>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-xs font-black mb-2 inline-block">
            📜 מסמך משפטי מחייב
          </span>
          <h2 className="text-2xl md:text-4xl font-black dark:text-white">מדיניות פרטיות – בינה לתעשייה</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">עדכון אחרון: אוגוסט 2026 | בהתאם לחוק הגנת הפרטיות, התשמ"א-1981</p>
        </div>

        <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">1. כללי ומתחייב</h3>
            <p>
              אתר "בינה לתעשייה" (להלן: "האתר"), המופעל ע"י אוהד ברעם (להלן: "המפעיל"), מחוייב לשמירה על פרטיות המשתמשים והמבקרים באתר. מדיניות פרטיות זו מפרטת את סוג המידע הנאסף, אופן השימוש בו, אמצעי האבטחה וזכויותיך כמשתמש.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">2. המידע הנאסף באתר</h3>
            <p>
              המפעיל אוסף מידע בשני ערוצים מרכזיים:
            </p>
            <ul className="list-disc list-inside space-y-1 font-bold">
              <li><strong>מידע שנמסר מרצונך:</strong> בעת מילוי טופסי יצירת קשר, תיאום שיחות או פתיחת תבניות, נאספים פרטים כגון שם מלא, שם חברה/ארגון, מספר טלפון, כתובת אימייל ותוכן הפנייה.</li>
              <li><strong>מידע טכני ואנליטי:</strong> בעת הגלישה נאסף מידע סטטיסטי מצטבר (כגון כתובת IP, סוג דפדפן, מערכת הפעלה, דפי צפייה ומשך השהייה באתר) לצורך שיפור חוויית המשתמש.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">3. מטרות השימוש במידע</h3>
            <p>
              המידע שנאסף ישמש אך ורק למטרות הבאות:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>יצירת קשר ומתן מענה לפניותיך בנושאי ניהול מוצר, אוטומציה ו-AI.</li>
              <li>תיאום שיחות היכרות ואבחון ראשוני.</li>
              <li>אספקת גישה לתבניות עבודה ופרומפטים עסקיים.</li>
              <li>שיפור, אבטחה ואופטימיזציה של האתר והשירותים המוצעים בו.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">4. מסירת מידע לצד שלישי</h3>
            <p>
              המפעיל מתחייב שלא למכור, להשכיר או להעביר את פרטיך האישיים לצדדים שלישיים, למעט במקרים הבאים:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>ספקי שירות טכנולוגיים המורשים מטעם המפעיל (כגון Netlify, OpenRouter, Google Sheets, Telegram ושירות דיוור) לצורך עיבוד הפנייה, ניתוחה ומתן מענה בלבד.</li>
              <li>אם נידרש לכך על פי צו שיפוטי או דרישה חוקית מפורשת.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">5. עוגיות (Cookies) ואנליטיקה</h3>
            <p>
              האתר משתמש בעוגיות (Cookies) ובטכנולוגיות אחסון מקומי (LocalStorage) לצורך תפעול תקין, שמירת העדפות משתמש (כגון מצב תצוגה והעדפות נגישות) וניתוח סטטיסטי. באפשרותך לשנות את הגדרות העוגיות בדפדפן שלך בכל עת.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">6. אבטחת מידע</h3>
            <p>
              האתר מיישם פרוטוקולי אבטחת מידע מתקדמים (הצפנת SSL/TLS) כדי להגן על פרטיות הנתונים. יחד עם זאת, אין אפשרות להבטיח חסינות מוחלטת בפני חדירות בלתי מורשות למחשבים.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-blue-600 dark:text-blue-400">7. זכויות המשתמש ויצירת קשר</h3>
            <p>
              בהתאם לחוק הגנת הפרטיות, הנך זכאי לעיין במידע שנאסף אודותיך, לבקש את תיקונו או את מחיקתו ממאגרי המפעיל. בכל שאלה או בקשה בנושא פרטיות, ניתן לפנות למפעיל באימייל או דרך טופס יצירת הקשר באתר.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
          >
            אישור וסגירה ✅
          </button>
        </div>
      </div>
    </div>
  );
};
