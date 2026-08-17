import React, { useState } from 'react';
import { Appointment, BusinessProfile, ServiceItem, WaitlistEntry } from './types';
import { INITIAL_WAITLIST } from './mockData';
import { getWazeUrl } from './CalendarUtils';

interface AdminDashboardProps {
  business: BusinessProfile;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  services: ServiceItem[];
  triggerToast: (msg: string) => void;
  onSwitchToCustomerView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  business,
  setBusiness,
  appointments,
  setAppointments,
  services,
  triggerToast,
  onSwitchToCustomerView
}) => {
  const [adminTab, setAdminTab] = useState<'schedule' | 'business_rules' | 'waitlist'>('schedule');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);

  // Update status
  const handleStatusChange = (aptId: string, status: Appointment['status']) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status } : a);
    setAppointments(updated);
    triggerToast(
      status === 'COMPLETED' ? 'הפגישה סומנה כהושלמה בהצלחה ✓' :
      status === 'CONFIRMED' ? 'הפגישה אושרה ביומן ✓' :
      'הפגישה בוטלה והשעה התפנתה ביומן'
    );
  };

  // Charge No-Show Fee
  const handleChargeNoShow = (apt: Appointment) => {
    if (!apt.guarantee?.isHeld) {
      alert('לא הוגדרה מסגרת ביטחון להזמנה זו.');
      return;
    }

    if (window.confirm(`האם לחייב דמי אי-התייצבות בסך ₪${apt.guarantee.amount} מכרטיס האשראי שמסתיים ב-${apt.guarantee.cardLast4}?`)) {
      const updated = appointments.map(a => {
        if (a.id === apt.id) {
          return {
            ...a,
            status: 'NO_SHOW' as const,
            guarantee: { ...a.guarantee!, isCharged: true }
          };
        }
        return a;
      });
      setAppointments(updated);
      triggerToast(`חויבו דמי ביטול בסך ₪${apt.guarantee.amount} בהתאם למדיניות העסק 💳`);
    }
  };

  // Dispatch WhatsApp Reminder with Waze Link
  const handleSendReminder = (apt: Appointment) => {
    const dateStr = new Date(apt.dateTime).toLocaleDateString('he-IL');
    const timeStr = new Date(apt.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const wazeLink = getWazeUrl(business);

    const message = `שלום ${apt.customerName}, תזכורת לפגישתך (${apt.serviceTitle}) ב-${business.name} ביום ${dateStr} בשעה ${timeStr}.\nכתובת: ${business.address}, ${business.city}\nניווט ישיר ב-Waze: ${wazeLink}\nלבירורים: ${business.phoneWhatsapp}`;
    
    window.open(`https://wa.me/${apt.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    triggerToast(`הודעת תזכורת וניווט נשלחה ל-${apt.customerName} בוואטסאפ! 💬`);
  };

  // Metrics
  const activeCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const totalRevenue = appointments
    .filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const displayedAppointments = appointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-3 p-3 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
            מרכז שליטה וניהול עסקי
          </span>
          <h2 className="text-sm font-black text-slate-900 mt-0.5">{business.name}</h2>
        </div>
        <button
          onClick={onSwitchToCustomerView}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          מבט לקוח 👤
        </button>
      </div>

      {/* KPI Overview (Compact Grid) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">פגישות פעילות</span>
          <span className="text-base font-black text-emerald-600">{activeCount}</span>
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">הושלמו</span>
          <span className="text-base font-black text-blue-600">{completedCount}</span>
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">מחזור צפוי</span>
          <span className="text-base font-black text-slate-900">₪{totalRevenue}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => setAdminTab('schedule')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
            adminTab === 'schedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          יומן תיאומים
        </button>
        <button
          onClick={() => setAdminTab('business_rules')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
            adminTab === 'business_rules' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          הגדרות ומדיניות 🛡️
        </button>
        <button
          onClick={() => setAdminTab('waitlist')}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
            adminTab === 'waitlist' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          רשימת המתנה ({waitlist.length})
        </button>
      </div>

      {/* TAB 1: SCHEDULE & APPOINTMENTS */}
      {adminTab === 'schedule' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">רשימת פגישות</h3>
            <div className="flex items-center gap-1">
              {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                    filterStatus === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st === 'ALL' ? 'הכל' : st === 'CONFIRMED' ? 'מאושר' : st === 'COMPLETED' ? 'הושלם' : 'בוטל'}
                </button>
              ))}
            </div>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center text-xs text-slate-500 border border-slate-200">
              אין פגישות להצגה בסטטוס זה.
            </div>
          ) : (
            displayedAppointments.map(apt => {
              const dateObj = new Date(apt.dateTime);
              const dateStr = dateObj.toLocaleDateString('he-IL');
              const timeStr = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={apt.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{apt.customerName}</h4>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">{apt.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {apt.guarantee?.isHeld && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          J5: ••••{apt.guarantee.cardLast4}
                        </span>
                      )}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'NO_SHOW' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {apt.status === 'CONFIRMED' ? 'מאושר ✓' : apt.status === 'COMPLETED' ? 'הושלם 🎉' : apt.status === 'NO_SHOW' ? 'אי-התייצבות' : 'מבוטל'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl text-[11px] flex items-center justify-between font-medium text-slate-700">
                    <span>{apt.serviceTitle}</span>
                    <span className="font-mono">{dateStr} | {timeStr}</span>
                    <span className="font-black text-slate-900">₪{apt.price}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                    <button
                      onClick={() => handleSendReminder(apt)}
                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black transition-all flex items-center gap-1"
                    >
                      <span>תזכורת + ניווט Waze</span>
                      <span>💬</span>
                    </button>

                    {apt.guarantee?.isHeld && !apt.guarantee.isCharged && (
                      <button
                        onClick={() => handleChargeNoShow(apt)}
                        className="py-1 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black"
                      >
                        חייב דמי אי-התייצבות (₪{apt.guarantee.amount}) 💳
                      </button>
                    )}

                    {apt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                        className="py-1 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-black"
                      >
                        הושלם ✓
                      </button>
                    )}

                    {apt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                        className="py-1 px-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-black"
                      >
                        בטל ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BUSINESS SETTINGS & ZERO-TOUCH EXPLANATIONS */}
      {adminTab === 'business_rules' && (
        <div className="space-y-3 text-xs">
          
          {/* Rule 1: Active Booking Limit */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">1. הגבלת כמות תורים פעילים במקביל</h4>
              <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full font-bold">מניעת תפיסת שווא</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>למה זה משרת אותך?</strong> מונע מלקוחות לתפוס משבצות מרובות ביומן מראש ללא התחייבות, ומבטיח זמינות אופטימלית לשאר הלקוחות.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 5].map(lim => (
                <button
                  key={lim}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, globalMaxActiveAppointments: lim }
                    }));
                    triggerToast(`הגבלת תורים פעילים עודכנה ל-${lim} תורים במקביל.`);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                    business.settings?.globalMaxActiveAppointments === lim
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {lim} תורים
                </button>
              ))}
            </div>
          </div>

          {/* Rule 2: Dynamic Cancellation Window */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">2. חלון מניעת ביטולים ברגע האחרון</h4>
              <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full font-bold">הגנת הכנסה</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>למה זה משרת אותך?</strong> ביטול עצמאי נחסם X שעות לפני המועד ומפנה להתקשרות ישירה, מה שמאפשר לאייש את המשבצת מראש.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[2, 4, 6, 12, 24].map(hours => (
                <button
                  key={hours}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, cancelWindowHours: hours },
                      cancelPolicyText: `ביטול פגישה עצמאי מתאפשר עד ${hours} שעות לפני המועד.`
                    }));
                    triggerToast(`חלון הביטול הוגדר ל-${hours} שעות לפני הפגישה.`);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                    business.settings?.cancelWindowHours === hours
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {hours} שעות
                </button>
              ))}
            </div>
          </div>

          {/* Rule 3: Buffer Time between appointments */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">3. מרווח התארגנות ומנוחה בין פגישות</h4>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">מניעת עיכובים</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>למה זה משרת אותך?</strong> מוסיף אוטומטית זמן התארגנות בסיום כל שירות כדי שלא תיווצר גלישת זמנים בין לקוחות.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[0, 5, 10, 15].map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, enableBufferMinutes: mins }
                    }));
                    triggerToast(`מרווח ההתארגנות עודכן ל-${mins} דקות.`);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                    business.settings?.enableBufferMinutes === mins
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {mins === 0 ? 'ללא מרווח' : `${mins} דק'`}
                </button>
              ))}
            </div>
          </div>

          {/* Rule 4: J5 Hold Guarantee */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">4. מסגרת ביטחון בכרטיס אשראי (J5 Hold)</h4>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">ללא חיוב מיידי</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>איך זה עובד?</strong> הלקוח מזין פרטי אשראי בעת ההזמנה. לא מבוצע חיוב בפועל, אך מתבצעת תפיסת מסגרת המאפשרת גביית דמי אי-התייצבות בלחיצה אחת במידת הצורך.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SMART WAITLIST */}
      {adminTab === 'waitlist' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">רשימת המתנה לאיוש מיידי</h3>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {waitlist.length} ממתינים
            </span>
          </div>

          {waitlist.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">{item.customerName}</h4>
                <span className="text-[10px] text-slate-500 font-medium block">{item.serviceTitle}</span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">מועד מועדף: {item.preferredDate}</span>
              </div>
              <a
                href={`https://wa.me/${item.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום ${item.customerName}, התפנתה לנו משבצת פנויה לשירות ${item.serviceTitle} ב-${business.name}. האם רלוונטי עבורך?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-xs flex items-center gap-1"
              >
                <span>הודעת וואטסאפ</span>
                <span>💬</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
