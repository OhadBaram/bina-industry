import React, { useState, useEffect } from 'react';

const ZAPIER_CHATBOT_IFRAME = 'https://interfaces.zapier.com/embed/chatbot/cmssrqyy2002hq5yg3j99toye';

export const ZapierChatbot: React.FC = () => {
  // בניידים הצאטבוט יהיה סגור כברירת מחדל
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [isShrinking, setIsShrinking] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);

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

  const handlePasteClick = () => {
    const lastCopied = localStorage.getItem('last_copied_concept');
    if (lastCopied) {
      navigator.clipboard.writeText(lastCopied).then(() => {
        setPasteStatus('הועתק! 📋');
        setTimeout(() => setPasteStatus(null), 2500);
      }).catch(() => {
        setPasteStatus('שגיאה ❌');
        setTimeout(() => setPasteStatus(null), 2500);
      });
    } else {
      setPasteStatus('אין מושג ⚠️');
      setTimeout(() => setPasteStatus(null), 2500);
    }
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON - ALWAYS VISIBLE AT BOTTOM RIGHT */}
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999999] flex items-center gap-3 pointer-events-auto"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999999, display: 'flex', alignItems: 'center' }}
      >
        {!isOpen && (
          <span className="hidden sm:inline-block px-3 py-1.5 bg-[#0D131F] text-cyan-400 border border-cyan-500/50 rounded-xl text-xs font-black shadow-2xl animate-pulse">
            💬 Zapier Chatbot AI
          </span>
        )}
        <button
          onClick={handleOpenClick}
          aria-label="סוכן AI צ׳אטבוט מחובר ל-Zapier"
          className="w-16 h-16 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-black rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-slate-900 ring-4 ring-cyan-500/40 relative cursor-pointer"
          style={{ width: '64px', height: '64px', cursor: 'pointer' }}
        >
          <span>🤖</span>
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-[#070A10] animate-pulse"></span>
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePasteClick}
                className="text-[11px] font-black px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center min-w-[95px]"
                title="הדבק את המושג האחרון מהלוח לצ׳אט"
              >
                {pasteStatus || 'הדבק מושג 📋'}
              </button>
              <button
                onClick={handleCloseClick}
                className="text-slate-400 hover:text-white font-black text-base p-1 cursor-pointer"
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
              style={{ border: 'none', direction: 'rtl', textAlign: 'right', width: '100%', height: '100%' }}
              title="Zapier Chatbot Embed"
              dir="rtl"
            />
          </div>

        </div>
      )}
    </>
  );
};
