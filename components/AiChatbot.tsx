import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../shared/chatConfig';
import { MAX_HISTORY_MESSAGES } from '../shared/chatConfig';
import { streamChatCompletion } from '../lib/streamChat';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME: UiMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'שלום! אני העוזר הדיגיטלי של בינה לתעשייה. אפשר לשאול על אפיון תהליכים, SOPs, סדנאות AI או תיאום שיחת אבחון.',
};

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [isShrinking, setIsShrinking] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setError(null);
    setInput('');
    const userMsg: UiMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);
    setIsStreaming(true);

    const historyForApi: ChatMessage[] = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome')
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let receivedAny = false;

    try {
      await streamChatCompletion(
        historyForApi,
        {
          onToken: (token) => {
            receivedAny = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + token } : m
              )
            );
          },
          onError: (message) => {
            setError(message);
            if (!receivedAny) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: message } : m
                )
              );
            }
          },
        },
        controller.signal
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const message = 'לא הצלחנו להשלים את התשובה. נסו שוב או פנו בוואטסאפ 053-6244330.';
      setError(message);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId && !m.content ? { ...m, content: message } : m))
      );
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.content
            ? { ...m, content: 'לא התקבלה תשובה. נסו שוב בעוד רגע.' }
            : m
        )
      );
    }
  };

  return (
    <>
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999999] flex items-center gap-2 pointer-events-auto"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999999, display: 'flex', alignItems: 'center' }}
      >
        <button
          onClick={handleOpenClick}
          aria-label={isOpen ? "סגור צ'אטבוט AI" : "פתח שיחה עם סוכן AI"}
          className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black rounded-full flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-slate-200 dark:border-slate-900 ring-4 ring-cyan-500/40 relative cursor-pointer"
        >
          <div className="relative flex items-center justify-center text-xl">
            <span>{isOpen ? '✕' : '🤖'}</span>
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#070A10] animate-pulse" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-black whitespace-nowrap">
            {isOpen ? 'סגירת צ׳אט' : 'צ׳אט עם סוכן AI 💬'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          className={`bg-white dark:bg-[#0D131F] rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-cyan-500/40 overflow-hidden ${
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
          }}
        >
          <div className="bg-slate-50 dark:bg-[#070A10] px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-black text-base">
                🤖
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">סוכן AI | בינה לתעשייה</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isStreaming ? 'כותב…' : 'מוכן לענות בעברית'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseClick}
              aria-label="סגור צ'אטבוט"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-lg p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50 dark:bg-[#070A10] ai-chat-stream"
            dir="rtl"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ai-chat-bubble ${
                    m.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-bl-md'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-br-md shadow-sm dark:shadow-none'
                  }`}
                  dir="rtl"
                >
                  {m.content || (isStreaming ? '…' : '')}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800/50 shrink-0" dir="rtl">
              {error}
            </div>
          )}

          <form
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] flex gap-2 shrink-0"
            dir="rtl"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="כתבו שאלה בעברית…"
              disabled={isStreaming}
              className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm px-3 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-60"
              dir="rtl"
              style={{ unicodeBidi: 'plaintext', wordBreak: 'break-word' }}
              aria-label="הודעה לצ'אטבוט"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              שליחה
            </button>
          </form>
        </div>
      )}
    </>
  );
};
