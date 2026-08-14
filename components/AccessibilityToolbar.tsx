import React, { useState, useEffect } from 'react';
import { AccessibilityStatementModal } from './AccessibilityStatementModal';

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

      <AccessibilityStatementModal isOpen={showStatement} onClose={() => setShowStatement(false)} />
    </>
  );
};
