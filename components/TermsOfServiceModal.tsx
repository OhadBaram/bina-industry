import React from 'react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 max-w-3xl w-full max-h-[85vh] overflow-y-auto text-right shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6" dir="rtl">
        
        <button
          onClick={onClose}
          className="sticky top-0 left-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-md float-left z-10"
        >
          ✕
        </button>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-black mb-2 inline-block border border-cyan-500/30">
            ⚖️ תנאים משפטיים וזכויות שימוש
          </span>
          <h2 className="text-2xl md:text-4xl font-black dark:text-white">תנאי שימוש – בינה לתעשייה</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">עדכון אחרון: אוגוסט 2026 | נא לקרוא בעיון לפני השימוש באתר</p>
        </div>

        <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-cyan-600 dark:text-cyan-400">1. מבוא והסכמה לתנאים</h3>
            <p>
              ברוכים הבאים לאתר "בינה לתעשייה" (להלן: "האתר"), המופעל על ידי אוהד ברעם (להלן: "המפעיל"). השימוש באתר, בתכנים, בספריית הפרומפטים ובשירותים המוצעים בו כפוף להסכמתך המלאה לתנאי שימוש אלה. גלישה או שימוש כלשהו באתר מהווים הסכמה מפורשת לתנאים המפורטים להלן.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-cyan-600 dark:text-cyan-400">2. קניין רוחני וזכויות יוצרים</h3>
            <p>
              כל זכויות הקניין הרוחני באתר – לרבות העיצוב הגרפי, סימני המסחר, קוד המקור, הטקסטים, הסברים, ומאגר הפרומפטים והתבניות לעסקים (הן החינמיים והן אלו הנעולים) – שייכים באופן בלעדי ל"בינה לתעשייה" ולמפעיל.
            </p>
            <p className="font-bold">
              חל איסור מוחלט להעתיק, לשכפל, להפיץ, למכור, להרשות שימוש מסחרי כלשהו, או לטעון לבעלות על מאגר הפרומפטים והתבניות ללא קבלת אישור מפורש ובכתב מהמפעיל מראש.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-cyan-600 dark:text-cyan-400">3. הגבלת אחריות והסרת אחריות משפטית</h3>
            <p>
              התכנים, הפרומפטים, והדוגמאות המופיעים באתר נועדו לצורכי הדגמה, השראה והדרכה בלבד.
            </p>
            <p className="font-bold text-red-600 dark:text-red-400">
              המפעיל אינו נושא באחריות כלשהי (ישירה או עקיפה) לכל נזק, הפסד כספי, אובדן מידע, או פגיעה עסקית שעלולים להיגרם למשתמש או לצד שלישי כתוצאה משימוש בפרומפטים, בכלים או במידע המפורסם באתר, לרבות מקרים שבהם מודל ה-AI הפיק פלטים שגויים, הזויים (Hallucinations) או לא מדויקים. השימוש במידע ובכלים הוא על אחריותו הבלעדית של הגולש.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-cyan-600 dark:text-cyan-400">4. שינויים באתר וזכות הפסקת שירות</h3>
            <p>
              המפעיל שומר לעצמו את הזכות הבלעדית לשנות, לעדכן, להשבית או להסיר תכנים, פרומפטים, שירותים, או מחירים המופיעים באתר, וכן לשנות את תנאי שימוש אלה מעת לעת, ללא כל הודעה מוקדמת.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-black dark:text-white text-cyan-600 dark:text-cyan-400">5. סמכות שיפוט וברירת דין</h3>
            <p>
              על תנאי שימוש אלה יחולו אך ורק דיני מדינת ישראל. סמכות השיפוט הבלעדית והייחודית לכל עניין הנוגע לתנאים אלו או לשימוש באתר תהיה מסורה לבתי המשפט המוסמכים במחוז תל אביב-יפו או מחוז המרכז בלבד.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
          >
            אישור וסגירה ✅
          </button>
        </div>
      </div>
    </div>
  );
};
