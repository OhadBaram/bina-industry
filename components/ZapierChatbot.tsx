import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/standard/28540433/239b16bf87b84e75958c730fd83cf2ff/';
const ZAPIER_CHATBOT_IFRAME = 'https://interfaces.zapier.com/embed/chatbot/cmssrqyy2002hq5yg3j99toye';

export const ZapierChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'zapier_embed' | 'ai'>('zapier_embed');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'שלום! אני סוכן ה-AI של בינה לתעשייה. במה אוכל לסייע לארגון שלך היום?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // שליחת הודעה וסינכרון בזמן אמת ל-Zapier Webhook
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Live AI Chatbot',
          user_message: messageText,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.log('Zapier webhook sync:', err);
    }

    setTimeout(() => {
      let botReply = 'תודה על הפנייה! קיבלנו את הודעתך והיא הועברה ישירות לאוהד ברעם. אנו נחזור אליך בהקדם.';
      
      const lower = messageText.toLowerCase();
      if (lower.includes('סוכן') || lower.includes('agent') || lower.includes('rag')) {
        botReply = 'אנו מתמחים בפיתוח סוכני AI אוטונומיים (Custom AI Agents) מחוברים למאגרי המידע וה-CRM של החברה, בפרטיות מלאה. נשמח לתאם פגישת אבחון!';
      } else if (lower.includes('סדנא') || lower.includes('הדרכה') || lower.includes('צוות')) {
        botReply = 'אנו מעבירים סדנאות מעשיות ממוקדות תפקיד (הנהלה, שיווק, תפעול, כספים) עם הנדסת פרומפטים מתקדמת. נשמח לשלוח סילבוס מותאם!';
      } else if (lower.includes('אוטומציה') || lower.includes('אינטגרציה') || lower.includes('n8n') || lower.includes('make')) {
        botReply = 'אנו בונים אוטומציות תפעוליות עמידות בעומסים בין מערכות הליבה (ERP, CRM, לידים, הצעות מחיר). נשמח לבחון את התהליכים אצלכם!';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsSending(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* כפתור הפעלה צף בפינה */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="סוכן AI צ׳אטבוט מחובר ל-Zapier"
        className="w-14 h-14 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 border-2 border-slate-800 ring-4 ring-cyan-500/20 relative"
      >
        <span>💬</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#070A10] animate-pulse"></span>
      </button>

      {/* חלון צ׳אטבוט צף נפתח בפינה */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[92vw] max-w-[420px] h-[580px] bg-[#0D131F] rounded-3xl shadow-2xl border border-slate-800 animate-fadeIn flex flex-col justify-between overflow-hidden" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
          
          {/* Header */}
          <div className="bg-[#070A10] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-base">
                🤖
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm text-white leading-tight">סוכן AI | בינה לתעשייה</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>מחובר ל-Zapier live (RTL)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'zapier_embed' ? 'ai' : 'zapier_embed')}
                className="text-[11px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-all"
                title="החלפת מצב צ׳אט"
              >
                {activeTab === 'zapier_embed' ? 'AI Webhook 🤖' : 'Zapier Embed 🔗'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white font-black text-base p-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* TAB 1: Official Zapier Interfaces Embed Iframe */}
          {activeTab === 'zapier_embed' && (
            <div className="flex-1 w-full h-full bg-[#070A10] relative" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
              <iframe
                src={ZAPIER_CHATBOT_IFRAME}
                height="100%"
                width="100%"
                allow="clipboard-write *"
                style={{ border: 'none', direction: 'rtl', textAlign: 'right' }}
                title="Zapier Chatbot Embed"
                dir="rtl"
              />
            </div>
          )}

          {/* TAB 2: Native Interactive AI Chatbot connected to Zapier Webhook */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden bg-[#070A10]">
              
              {/* הודעות */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-right no-scrollbar">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-500 text-black font-bold rounded-br-none'
                          : 'bg-[#0D131F] text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`block text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-black/60' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* הצעות מהירות */}
              <div className="flex gap-2 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
                <button
                  onClick={() => handleSendMessage('אני מעוניין בפיתוח סוכני AI לארגון')}
                  className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 bg-[#0D131F] hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
                >
                  🤖 סוכני AI
                </button>
                <button
                  onClick={() => handleSendMessage('אשמח לפרטים על סדנאות והכשרת צוותים')}
                  className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 bg-[#0D131F] hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
                >
                  🎓 סדנאות
                </button>
                <button
                  onClick={() => handleSendMessage('תיאום שיחת אבחון עם אוהד ברעם')}
                  className="flex-shrink-0 text-[11px] font-bold px-3 py-1.5 bg-[#0D131F] hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800"
                >
                  📞 שיחת אבחון
                </button>
              </div>

              {/* שורת קלט */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2 pt-2 border-t border-slate-800"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="כתיבת הודעה לסוכן ה-AI..."
                  className="flex-1 px-4 py-3 bg-[#0D131F] border border-slate-800 rounded-xl text-white text-xs font-medium outline-none focus:border-cyan-500 transition-all text-right"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  שלח 🚀
                </button>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
