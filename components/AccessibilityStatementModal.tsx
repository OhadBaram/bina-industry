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
          <h2 className="text-2xl md:text-3xl font-black dark:text-white">הצהרת נגישות</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">עדכון אחרון: אוגוסט 2026 | עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות</p>
        </div>

        <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
          <p>אנו רואים חשיבות רבה בהנגשת האתר לאנשים עם מוגבלויות, בהתאם לתקן הישראלי (ת"י 5568) ברמת AA.</p>
          
          <p className="font-bold text-slate-900 dark:text-white">התאמות שבוצעו באתר:</p>
          <ul className="list-disc pr-5 space-y-1">
            <li>תפריט נגישות לשינוי גודל טקסט, ניגודיות וגווני אפור.</li>
            <li>תמיכה בניווט מקלדת ומבנה היררכי לקוראי מסך.</li>
            <li>התאמה מלאה לדפדפנים מודרניים ומכשירים ניידים.</li>
          </ul>
          
          <p className="font-bold text-slate-900 dark:text-white mt-4">פרטי יצירת קשר בנושאי נגישות:</p>
          <p>אם נתקלתם בבעיית נגישות, ניתן לפנות אלינו ישירות בדוא"ל: <a href="mailto:ohadbaramqa@gmail.com" className="text-cyan-600 dark:text-cyan-400 underline">ohadbaramqa@gmail.com</a></p>
          <p className="font-bold text-slate-900 dark:text-white">רכז נגישות: אוהד ברעם</p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
          >
            סגירה ✅
          </button>
        </div>
      </div>
    </div>
  );
};
