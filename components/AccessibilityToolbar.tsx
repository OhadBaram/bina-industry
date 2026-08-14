import React, { useState } from 'react';
import { AccessibilityStatementModal } from './AccessibilityStatementModal';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  const accAction = (action: 'font-up' | 'font-down' | 'contrast' | 'grayscale' | 'highlight-links' | 'reset') => {
    const body = document.body;
    switch (action) {
      case 'font-up': {
        const newMultiplier = fontSizeMultiplier + 0.1;
        setFontSizeMultiplier(newMultiplier);
        body.style.fontSize = `${newMultiplier * 100}%`;
        break;
      }
      case 'font-down': {
        const newMultiplier = Math.max(0.8, fontSizeMultiplier - 0.1);
        setFontSizeMultiplier(newMultiplier);
        body.style.fontSize = `${newMultiplier * 100}%`;
        break;
      }
      case 'contrast':
        body.classList.toggle('acc-high-contrast');
        break;
      case 'grayscale':
        body.classList.toggle('acc-grayscale');
        break;
      case 'highlight-links':
        body.classList.toggle('acc-highlight-links');
        break;
      case 'reset':
        setFontSizeMultiplier(1);
        body.style.fontSize = '';
        body.classList.remove('acc-high-contrast', 'acc-grayscale', 'acc-highlight-links');
        break;
    }
  };

  return (
    <>
      {/* תפריט נגישות צף */}
      <div id="accessibility-widget" className="fixed bottom-6 right-6 z-50">
        <button
          id="acc-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="פתח תפריט נגישות"
          className="w-12 h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
          </svg>
        </button>

        {/* תפריט נגישות */}
        {isOpen && (
          <div id="acc-menu" className="absolute bottom-16 right-0 w-72 bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-200 text-sm dir-rtl" style={{ direction: 'rtl' }}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">התאמת נגישות</h3>
              <button
                id="acc-close-btn"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => accAction('font-up')}
                className="w-full text-right px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                הגדל טקסט (+)
              </button>
              <button
                onClick={() => accAction('font-down')}
                className="w-full text-right px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                הקטן טקסט (-)
              </button>
              <button
                onClick={() => accAction('contrast')}
                className="w-full text-right px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ניגודיות גבוהה (שחור/לבן)
              </button>
              <button
                onClick={() => accAction('grayscale')}
                className="w-full text-right px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                גווני אפור
              </button>
              <button
                onClick={() => accAction('highlight-links')}
                className="w-full text-right px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                הדגשת קישורים
              </button>
              <button
                onClick={() => accAction('reset')}
                className="w-full text-right px-3 py-2 bg-red-950/40 text-red-300 hover:bg-red-900/50 rounded-lg transition-colors mt-2"
              >
                איפוס הגדרות
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  setShowStatement(true);
                  setIsOpen(false);
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                הצהרת נגישות מלאה
              </button>
            </div>
          </div>
        )}
      </div>

      <AccessibilityStatementModal isOpen={showStatement} onClose={() => setShowStatement(false)} />
    </>
  );
};
