import React from 'react';

interface AccessibilityStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityStatementModal: React.FC<AccessibilityStatementModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
            ♿ רמה AA לפי תקן ישראלי 5568
          </span>
          <h2 className="text-2xl md:text-3xl font-black dark:text-white">הצהרת נגישות – בינה לתעשייה</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">עדכון אחרון: אוגוסט 2026 | עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות</p>
        </div>

        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
          <p>
            באתר "בינה לתעשייה" אנו רואים בחשיבות עליונה את הנגשת האתר והשירותים לכלל האוכלוסייה, כולל אנשים עם מוגבלויות, מתוך אמונה כי לכל אדם מגיעה הזדמנות שווה ונגישות מלאה למידע ולטכנולוגיה.
          </p>

          <h4 className="font-black text-sm dark:text-white text-cyan-600 dark:text-cyan-400">התאמות הנגישות שבוצעו באתר:</h4>
          <ul className="list-disc list-inside space-y-1.5 font-bold">
            <li>האתר נבנה בהתאם להנחיות הנגישות בדרגה AA של תקן WCAG 2.0 והתקן הישראלי ת"י 5568.</li>
            <li>תמיכה מלאה בניווט מקלדת (Tab, Shift+Tab, מקשי החיצים ו-Enter).</li>
            <li>סרגל נגישות צף הכולל הגדלה והקטנה של טקסטים, שינוי ניגודיות (ניגודיות גבוהה, גווני אפור), הדגשת קישורים, גופן קריא וביטול הנפשות.</li>
            <li>התאמה מלאה לטכנולוגיות מסייעות (כמו קוראי מסך) ומכשירים ניידים.</li>
          </ul>

          <h4 className="font-black text-sm dark:text-white text-cyan-600 dark:text-cyan-400">באילו אמצעים טכנולוגיים ודפדפנים נבדק האתר:</h4>
          <p>
            האתר נבדק ונמצא תואם בדפדפנים המובילים: Google Chrome, Mozilla Firefox, Safari, ו-Microsoft Edge, הן במחשבים שולחניים והן במכשירים ניידים (iOS ו-Android).
          </p>

          <h4 className="font-black text-sm dark:text-white text-cyan-600 dark:text-cyan-400">פרטי יצירת קשר עם רכז הנגישויות:</h4>
          <p>
            אם במהלך הגלישה באתר נתקלתם בקושי או ברכיב שאינו נגיש מספיק, נשמח לקבל מכם משוב כדי שנוכל לתקן ולפרסם עדכון בהקדם:
          </p>
          <div className="font-bold border-r-4 border-cyan-500 pr-3 my-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
            <p>רכז נגישות: אוהד ברעם</p>
            <p>כתובת אימייל לפניות: accessibility@bina-industry.co.il</p>
            <p>יצירת קשר נוספת: דרך טופס פניית יצירת קשר באתר או באמצעות LinkedIn.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
          >
            אישור וסגירה ✅
          </button>
        </div>
      </div>
    </div>
  );
};
