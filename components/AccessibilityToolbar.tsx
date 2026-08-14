import React, { useState, useEffect } from 'react';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);

  // מצבי נגישות
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // 0 = רגיל, 1 = גדול, 2 = ענקי
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [stopAnimations, setStopAnimations] = useState(false);

  // החלת שינויי נגישות על ה-DOM
  useEffect(() => {
    const root = document.documentElement;

    // גודל גופן
    if (fontSizeLevel === 1) {
      root.style.fontSize = '112.5%';
    } else if (fontSizeLevel === 2) {
      root.style.fontSize = '125%';
    } else {
      root.style.fontSize = '100%';
    }

    // ניגודיות גבוהה
    if (highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // גווני אפור
    if (grayscale) {
      root.classList.add('accessibility-grayscale');
    } else {
      root.classList.remove('accessibility-grayscale');
    }

    // הדגשת קישורים
    if (highlightLinks) {
      root.classList.add('accessibility-highlight-links');
    } else {
      root.classList.remove('accessibility-highlight-links');
    }

    // גופן קריא
    if (readableFont) {
      root.classList.add('accessibility-readable-font');
    } else {
      root.classList.remove('accessibility-readable-font');
    }

    // ביטול הנפשות
    if (stopAnimations) {
      root.classList.add('accessibility-stop-animations');
    } else {
      root.classList.remove('accessibility-stop-animations');
    }
  }, [fontSizeLevel, highContrast, grayscale, highlightLinks, readableFont, stopAnimations]);

  const handleReset = () => {
    setFontSizeLevel(0);
    setHighContrast(false);
    setGrayscale(false);
    setHighlightLinks(false);
    setReadableFont(false);
    setStopAnimations(false);
  };

  return (
    <>
      {/* כפתור נגישות צף */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="תפריט נגישות"
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-white dark:border-slate-800 ring-4 ring-blue-500/20"
        >
          ♿
        </button>

        {/* תפריט נגישות נפתח */}
        {isOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-fadeIn space-y-4" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">♿</span>
                <h3 className="font-black text-lg dark:text-white">סרגל נגישות</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <button
                onClick={() => setFontSizeLevel((prev) => (prev + 1) % 3)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${fontSizeLevel > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🔍</span>
                <span>גופן: {fontSizeLevel === 0 ? 'רגיל' : fontSizeLevel === 1 ? 'גדול' : 'ענקי'}</span>
              </button>

              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${highContrast ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🌓</span>
                <span>ניגודיות גבוהה</span>
              </button>

              <button
                onClick={() => setGrayscale(!grayscale)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${grayscale ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🎨</span>
                <span>גווני אפור</span>
              </button>

              <button
                onClick={() => setHighlightLinks(!highlightLinks)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${highlightLinks ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🔗</span>
                <span>הדגשת קישורים</span>
              </button>

              <button
                onClick={() => setReadableFont(!readableFont)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${readableFont ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🔤</span>
                <span>גופן קריא</span>
              </button>

              <button
                onClick={() => setStopAnimations(!stopAnimations)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2 ${stopAnimations ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
              >
                <span>🛑</span>
                <span>ביטול הנפשות</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowStatement(true)}
                className="px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                הצהרת נגישות 📜
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                איפוס 🔄
              </button>
            </div>
          </div>
        )}
      </div>

      {/* מודל הצהרת נגישות */}
      {showStatement && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-right shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6" dir="rtl">
            <button
              onClick={() => setShowStatement(false)}
              className="sticky top-0 left-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-md float-left z-10"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-xs font-black mb-2 inline-block">
                ♿ רמה AA לפי תקן 5568
              </span>
              <h2 className="text-2xl md:text-3xl font-black dark:text-white">הצהרת נגישות – בינה לעסקים</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות</p>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
              <p>
                באתר "בינה לעסקים" אנו רואים בחשיבות עליונה את הנגשת האתר והשירותים לכלל האוכלוסייה, כולל אנשים עם מוגבלויות, מתוך אמונה כי לכל אדם מגיעה הזדמנות שווה ונגישות מלאה למידע ולטכנולוגיה.
              </p>

              <h4 className="font-black text-sm dark:text-white text-blue-600">התאמות הנגישות שבוצעו באתר:</h4>
              <ul className="list-disc list-inside space-y-1 font-bold">
                <li>האתר נבנה בהתאם להנחיות הנגישות בדרגה AA (WCAG 2.1) ותקן ישראלי ת"י 5568.</li>
                <li>תמיכה מלאה בטכנולוגיות מסייעות וסריקת מקלדת (Tab / Shift+Tab).</li>
                <li>סרגל נגישות צף הכולל הגדלת גופן, ניגודיות גבוהה, גווני אפור, הדגשת קישורים וביטול הנפשות.</li>
                <li>התאמה מלאה למכשירים ניידים ולמסכים בגדלים שונים.</li>
              </ul>

              <h4 className="font-black text-sm dark:text-white text-blue-600">פניות בנושאי נגישות:</h4>
              <p>
                אם נתקלת ברכיב שאינו נגיש מספיק או בקושי כלשהו בגלישה, נשמח לקבל ממך משוב כדי שנוכל לתקן ולפרסם עדכון בהקדם:
              </p>
              <p className="font-bold border-r-4 border-blue-500 pr-3 my-2">
                רכז נגישות: אוהד ברעם<br />
                פנייה ישירה: דרך טופס יצירת הקשר באתר
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowStatement(false)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs shadow-lg transition-all"
              >
                סגירה ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
