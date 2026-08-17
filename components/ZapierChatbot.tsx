import React, { useState, useEffect } from 'react';

const ZAPIER_CHATBOT_IFRAME = 'https://interfaces.zapier.com/embed/chatbot/cmssrqyy2002hq5yg3j99toye';

export const ZapierChatbot: React.FC = () => {
  // בניידים הצאטבוט יהיה סגור כברירת מחדל
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [isShrinking, setIsShrinking] = useState(false);
  const [isExploding, setIsExploding] = useState(false);

  // זיהוי שינוי גודל מסך
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenClick = () => {
    if (isOpen) {
      handleCloseClick();
    } else {
      setIsExploding(true);
      setIsOpen(true);
      setTimeout(() => setIsExploding(false), 400);
    }
  };

  const handleCloseClick = () => {
    setIsShrinking(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsShrinking(false);
    }, 380);
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON - ALWAYS VISIBLE AT BOTTOM RIGHT */}
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999999] flex items-center gap-2 pointer-events-auto"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999999, display: 'flex', alignItems: 'center' }}
      >
        <button
          onClick={handleOpenClick}
          aria-label={isOpen ? "סגור צ'אטבוט AI" : "פתח שיחה עם סוכן AI"}
          className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black rounded-full flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-slate-900 ring-4 ring-cyan-500/40 relative cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <div className="relative flex items-center justify-center text-xl">
            <span>{isOpen ? '✕' : '🤖'}</span>
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#070A10] animate-pulse"></span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-black whitespace-nowrap">
            {isOpen ? 'סגירת צ׳אט' : 'צ׳אט עם סוכן AI 💬'}
          </span>
        </button>
      </div>

      {/* 2. CHATBOT DRAWER CONTAINER - POSITIONED SAFELY ON ALL SCREEN SIZES */}
      {isOpen && (
        <div
          className={`bg-[#0D131F] rounded-3xl shadow-2xl border-2 border-cyan-500/40 overflow-hidden ${
            isShrinking ? 'animate-implode-right' : isExploding ? 'animate-explode-right' : 'animate-fadeIn'
          }`}
          dir="rtl"
          style={{ 
            direction: 'rtl', 
            textAlign: 'right', 
            position: 'fixed', 
            bottom: '96px',
            right: window.innerWidth < 640 ? '12px' : '24px',
            width: isLargeScreen ? '520px' : 'min(440px, calc(100vw - 24px))',
            height: isLargeScreen ? '750px' : 'min(600px, 80vh)',
            zIndex: 999999, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between'
          }}
        >
          {/* Header */}
          <div className="bg-[#070A10] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-base">
                🤖
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm text-white leading-tight">סוכן AI | בינה לתעשייה</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Zapier Interfaces Live Chatbot</span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleCloseClick}
                aria-label="סגור צ'אטבוט"
                className="text-slate-400 hover:text-white font-black text-lg p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Official Zapier Interfaces Embed Iframe */}
          <div className="flex-1 w-full h-full bg-[#070A10] relative" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
            <iframe
              src={ZAPIER_CHATBOT_IFRAME}
              height="100%"
              width="100%"
              allow="clipboard-write *"
              style={{ border: 'none', direction: 'rtl', textAlign: 'right', width: '100%', height: '100%', unicodeBidi: 'plaintext' }}
              title="Zapier Chatbot Embed"
              dir="rtl"
            />
          </div>

        </div>
      )}
    </>
  );
};
