import React, { useState, useMemo } from 'react';
import { Appointment, BusinessProfile, ServiceItem, WaitlistEntry, Customer, AdminTab, PaymentGuaranteeType } from './types';
import { getWazeUrl } from './CalendarUtils';
import { SubTabNav } from './SubTabNav';
import { loadStoredLeads } from '../../shared/leadStorage';

interface AdminDashboardProps {
  business: BusinessProfile;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  services: ServiceItem[];
  waitlist: WaitlistEntry[];
  setWaitlist: React.Dispatch<React.SetStateAction<WaitlistEntry[]>>;
  customers: Customer[];
  triggerToast: (msg: string) => void;
  onSwitchToCustomerView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  business,
  setBusiness,
  appointments,
  setAppointments,
  services,
  waitlist,
  setWaitlist,
  customers,
  triggerToast,
  onSwitchToCustomerView
}) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('schedule');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'>('ALL');
  const storedLeads = useMemo(() => loadStoredLeads(), [adminTab]);

  const findService = (serviceId?: string) =>
    serviceId ? services.find(s => s.id === serviceId) : undefined;

  const resolveServiceTitle = (entry: Pick<WaitlistEntry, 'serviceId' | 'serviceTitle'>) => {
    const service = findService(entry.serviceId);
    return service?.title ?? entry.serviceTitle;
  };

  const toggleRiskFlag = (aptId: string) => {
    setAppointments(appointments.map(a =>
      a.id === aptId ? { ...a, isRiskFlagged: !a.isRiskFlagged } : a
    ));
    triggerToast('סימון סיכון עודכן');
  };

  const removeWaitlistEntry = (id: string) => {
    setWaitlist(waitlist.filter(w => w.id !== id));
    triggerToast('הוסר מרשימת המתנה');
  };

  // Update status
  const handleStatusChange = (aptId: string, status: Appointment['status']) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status } : a);
    setAppointments(updated);
    triggerToast(
      status === 'COMPLETED' ? 'הפגישה סומנה כהושלמה בהצלחה ✓' :
      status === 'CONFIRMED' ? 'הפגישה אושרה ביומן ✓' :
      status === 'PENDING' ? 'הפגישה הועברה לממתין לאישור ⏳' :
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
    const service = findService(apt.serviceId);
    const serviceTitle = service?.title ?? apt.serviceTitle;
    const dateStr = new Date(apt.dateTime).toLocaleDateString('he-IL');
    const timeStr = new Date(apt.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const wazeLink = getWazeUrl(business);

    const message = `שלום ${apt.customerName}, תזכורת לפגישתך (${serviceTitle}) ב-${business.name} ביום ${dateStr} בשעה ${timeStr}.\nכתובת: ${business.address}, ${business.city}\nניווט ישיר ב-Waze: ${wazeLink}\nלבירורים: ${business.phoneWhatsapp}`;
    
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
      <SubTabNav
        tabs={[
          { id: 'schedule', label: 'יומן תיאומים' },
          { id: 'products', label: 'מאגר מוצרים' },
          { id: 'customers', label: `לקוחות (${customers.length})` },
          { id: 'leads', label: `לידים (${storedLeads.length})` },
          { id: 'business_rules', label: 'הגדרות ומדיניות 🛡️' },
          { id: 'waitlist', label: `רשימת המתנה (${waitlist.length})` },
        ]}
        activeTab={adminTab}
        onChange={(id) => setAdminTab(id as AdminTab)}
      />

      {/* TAB 1: SCHEDULE & APPOINTMENTS */}
      {adminTab === 'schedule' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">רשימת פגישות</h3>
            <div className="flex items-center gap-1">
              {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all border ${
                    filterStatus === st
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:text-cyan-600'
                  }`}
                >
                  {st === 'ALL' ? 'הכל' :
                   st === 'CONFIRMED' ? 'מאושר' :
                   st === 'PENDING' ? 'ממתין' :
                   st === 'COMPLETED' ? 'הושלם' :
                   st === 'NO_SHOW' ? 'אי-הגעה' : 'בוטל'}
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
              const service = findService(apt.serviceId);
              const serviceTitle = service?.title ?? apt.serviceTitle;
              const servicePrice = service?.price ?? apt.price;
              const serviceDuration = service?.durationMinutes ?? apt.durationMinutes;

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
                        apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'NO_SHOW' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {apt.status === 'CONFIRMED' ? 'מאושר ✓' :
                         apt.status === 'PENDING' ? 'ממתין ⏳' :
                         apt.status === 'COMPLETED' ? 'הושלם 🎉' :
                         apt.status === 'NO_SHOW' ? 'אי-התייצבות' : 'מבוטל'}
                      </span>
                      {apt.isRiskFlagged && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          סיכון ⚠️
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl text-[11px] flex items-center justify-between font-medium text-slate-700">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-slate-900">
                        {service?.icon && <span className="ml-1">{service.icon}</span>}
                        {serviceTitle}
                      </span>
                      {service?.category && (
                        <span className="text-[10px] text-slate-500">{service.category} · {serviceDuration} דק'</span>
                      )}
                    </div>
                    <span className="font-mono">{dateStr} | {timeStr}</span>
                    <span className="font-black text-slate-900">₪{servicePrice}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[10px] text-slate-600 bg-amber-50 border border-amber-100 p-2 rounded-lg">
                      📝 {apt.notes}
                    </p>
                  )}

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

                    {apt.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                        className="py-1 px-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black"
                      >
                        אשר ✓
                      </button>
                    )}

                    {apt.status !== 'PENDING' && apt.status !== 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'PENDING')}
                        className="py-1 px-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-black"
                      >
                        החזר לממתין
                      </button>
                    )}

                    <button
                      onClick={() => toggleRiskFlag(apt.id)}
                      className={`py-1 px-2 rounded-lg font-black border ${
                        apt.isRiskFlagged
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {apt.isRiskFlagged ? 'בטל סיכון' : 'סמן סיכון'} ⚠️
                    </button>

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

      {/* TAB: PRODUCTS CATALOG */}
      {adminTab === 'products' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">מאגר מוצרים ושירותים</h3>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              {services.length} פריטים
            </span>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center text-xs text-slate-500 border border-slate-200">
              אין שירותים במאגר.
            </div>
          ) : (
            services.map(service => (
              <div key={service.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900">
                      <span className="ml-1">{service.icon}</span>
                      {service.title}
                    </h4>
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                      {service.category}
                    </span>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-sm font-black text-slate-900 block">₪{service.price}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{service.durationMinutes} דק'</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            ))
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
            <div className="flex items-center gap-1.5 pt-1">
              {([30, 50, 75, 100] as const).map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, guaranteeHoldAmount: amount }
                    }));
                    triggerToast(`סכום מסגרת הביטחון עודכן ל-₪${amount}`);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                    business.settings?.guaranteeHoldAmount === amount
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ₪{amount}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(['NONE', 'J5_HOLD', 'PARTIAL_DEPOSIT', 'FULL_PAYMENT'] as PaymentGuaranteeType[]).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, defaultGuaranteeType: type }
                    }));
                    triggerToast(`סוג מסגרת עודכן ל-${type}`);
                  }}
                  className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all ${
                    business.settings?.defaultGuaranteeType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {type === 'NONE' ? 'ללא' : type === 'J5_HOLD' ? 'J5' : type === 'PARTIAL_DEPOSIT' ? 'מקדמה' : 'מלא'}
                </button>
              ))}
            </div>
          </div>

          {/* Rule 5: Late arrival grace */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">5. זמן חסד לאיחור לקוח</h4>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">גמישות תפעולית</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[0, 5, 10, 15, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    setBusiness(prev => ({
                      ...prev,
                      settings: { ...prev.settings, lateArrivalGraceMinutes: mins }
                    }));
                    triggerToast(`זמן חסד לאיחור עודכן ל-${mins} דקות`);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all ${
                    business.settings?.lateArrivalGraceMinutes === mins
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {mins === 0 ? 'ללא' : `${mins} דק'`}
                </button>
              ))}
            </div>
          </div>

          {/* Business profile */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-black text-slate-900">6. פרטי העסק (פרופיל)</h4>
            <div className="grid grid-cols-1 gap-2">
              <input
                value={business.name}
                onChange={(e) => setBusiness(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                placeholder="שם העסק"
              />
              <input
                value={business.phoneWhatsapp}
                onChange={(e) => setBusiness(prev => ({ ...prev, phoneWhatsapp: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                placeholder="טלפון / וואטסאפ"
                dir="ltr"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={business.address}
                  onChange={(e) => setBusiness(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  placeholder="כתובת"
                />
                <input
                  value={business.city}
                  onChange={(e) => setBusiness(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  placeholder="עיר"
                />
              </div>
              <textarea
                value={business.tagline}
                onChange={(e) => setBusiness(prev => ({ ...prev, tagline: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs resize-none"
                placeholder="תיאור קצר"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: LEADS FROM WEBSITE */}
      {adminTab === 'leads' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">לידים מהאתר</h3>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              {storedLeads.length} פניות
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            מוצגים לידים שנשמרו מקומית לאחר שליחת טופס באתר. נתונים מלאים נשלחים גם לגיליון Google, טלגרם ומייל.
          </p>
          {storedLeads.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center text-xs text-slate-500 border border-slate-200">
              אין לידים שמורים עדיין. שלחו פנייה דרך טופס האתר.
            </div>
          ) : (
            storedLeads.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900">{entry.lead.full_name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    entry.analysis.classification === 'Complaint'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {entry.analysis.classification}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono" dir="ltr">{entry.lead.phone} · {entry.lead.email}</p>
                <p className="text-[11px] text-slate-700"><strong>סיכום:</strong> {entry.analysis.summary}</p>
                <p className="text-[11px] text-slate-600"><strong>צרכים:</strong> {entry.analysis.customer_needs}</p>
                <p className="text-[11px] text-slate-600"><strong>פתרון:</strong> {entry.analysis.solution}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>דחיפות: {entry.analysis.urgency_level}</span>
                  <span>·</span>
                  <span>{new Date(entry.receivedAt).toLocaleString('he-IL')}</span>
                </div>
                {entry.lead.message && (
                  <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    הודעה מקורית: {entry.lead.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {adminTab === 'customers' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800">רשימת לקוחות</h3>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              {customers.length} לקוחות
            </span>
          </div>

          {customers.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center text-xs text-slate-500 border border-slate-200">
              אין לקוחות רשומים במערכת.
            </div>
          ) : (
            customers.map(customer => (
              <div key={customer.phone} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{customer.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono block" dir="ltr">{customer.phone}</span>
                  <span className="text-[10px] text-slate-600 font-medium block mt-0.5">
                    {customer.appointmentCount > 0
                      ? `${customer.appointmentCount} פגישות`
                      : 'ברשימת המתנה בלבד'}
                  </span>
                </div>
                <div className="text-left space-y-1">
                  {customer.lastAppointment ? (
                    <span className="text-[10px] font-bold text-slate-600 block">
                      פגישה אחרונה: {new Date(customer.lastAppointment).toLocaleDateString('he-IL')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-purple-600 block">ממתין לתיאום</span>
                  )}
                  <a
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום ${customer.name}, פונה מ-${business.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-xs inline-flex items-center gap-1"
                  >
                    <span>וואטסאפ</span>
                    <span>💬</span>
                  </a>
                </div>
              </div>
            ))
          )}
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

          {waitlist.map(item => {
            const serviceTitle = resolveServiceTitle(item);
            return (
            <div key={item.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">{item.customerName}</h4>
                <span className="text-[10px] text-slate-500 font-medium block">{serviceTitle}</span>
                <span className="text-[10px] font-mono text-purple-700 font-bold">מועד מועדף: {item.preferredDate}</span>
              </div>
              <a
                href={`https://wa.me/${item.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום ${item.customerName}, התפנתה לנו משבצת פנויה לשירות ${serviceTitle} ב-${business.name}. האם רלוונטי עבורך?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-xs flex items-center gap-1"
              >
                <span>הודעת וואטסאפ</span>
                <span>💬</span>
              </a>
              <button
                onClick={() => removeWaitlistEntry(item.id)}
                className="px-2 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-black rounded-xl"
              >
                הסר ✕
              </button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
