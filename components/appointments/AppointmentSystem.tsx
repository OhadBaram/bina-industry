import React, { useState, useEffect } from 'react';
import { Appointment, BusinessProfile, ServiceItem, UserSession } from './types';
import { MOCK_BUSINESS, MOCK_SERVICES, INITIAL_APPOINTMENTS } from './mockData';
import { getGoogleCalendarUrl, downloadIcsFile, getWazeUrl } from './CalendarUtils';
import { AdminDashboard } from './AdminDashboard';

export const AppointmentSystem: React.FC = () => {
  const [business, setBusiness] = useState<BusinessProfile>(MOCK_BUSINESS);
  const [services] = useState<ServiceItem[]>(MOCK_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('executive_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('executive_session');
    return saved ? JSON.parse(saved) : {
      phone: '0536244330',
      name: 'אוהד ברעם',
      isLoggedIn: true
    };
  });

  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'services' | 'about'>('active');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceItem>(services[0]);
  const [bookingDate, setBookingDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('11:00');
  const [customerName, setCustomerName] = useState<string>(session.name || 'אוהד ברעם');
  const [customerPhone, setCustomerPhone] = useState<string>(session.phone || '0536244330');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);

  // Booking Success Modal with Direct Google Calendar & Waze
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    localStorage.setItem('executive_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('executive_session', JSON.stringify(session));
  }, [session]);

  // Check Cancellation Permission
  const isCancelAllowed = (aptDateTime: string) => {
    const hoursWindow = business.settings?.cancelWindowHours || 4;
    const diffMs = new Date(aptDateTime).getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    return {
      allowed: diffHours >= hoursWindow,
      remaining: Math.max(0, Math.round(diffHours))
    };
  };

  // Booking Submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check active limit
    const activeCount = appointments.filter(a =>
      a.customerPhone === customerPhone && (a.status === 'CONFIRMED' || a.status === 'PENDING')
    ).length;

    const maxAllowed = business.settings?.globalMaxActiveAppointments || 2;
    if (activeCount >= maxAllowed) {
      alert(`הגעת למכסת הפגישות הפעילות המרבית (${maxAllowed} פגישות).\nיש להמתין לסיום פגישה קיימת או לבטלה כדי לתאם פגישה חדשה.`);
      return;
    }

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      businessId: business.id,
      customerName,
      customerPhone,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      dateTime: new Date(`${bookingDate}T${bookingTime}:00`).toISOString(),
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      status: 'CONFIRMED',
      notes: bookingNotes,
      guarantee: {
        type: 'J5_HOLD',
        amount: business.settings?.guaranteeHoldAmount || 50,
        isHeld: true,
        isCharged: false,
        cardLast4: '4242'
      }
    };

    setAppointments([newApt, ...appointments]);
    setShowBookingModal(false);
    setCreatedAppointment(newApt);
    setActiveTab('active');
    triggerToast('הפגישה תואמה בהצלחה! באפשרותך לשמור ביומן ולהתנווט ב-Waze.');
  };

  // Cancel Appointment
  const handleCancel = (apt: Appointment) => {
    const { allowed, remaining } = isCancelAllowed(apt.dateTime);
    if (!allowed) {
      alert(`ביטול עצמאי במערכת מתאפשר עד ${business.settings?.cancelWindowHours} שעות לפני המועד (נותרו כ-${remaining} שעות).\n\nלבירור וסיוע אנא צרו קשר ישירות עם בית העסק: ${business.phoneWhatsapp}`);
      return;
    }

    if (window.confirm(`האם לבטל את הפגישה (${apt.serviceTitle})?`)) {
      setAppointments(appointments.map(a => a.id === apt.id ? { ...a, status: 'CANCELLED' as const } : a));
      triggerToast('הפגישה בוטלה והמועד התפנה ביומן');
    }
  };

  const activeAppointments = appointments.filter(a => a.status === 'CONFIRMED');
  const pastAppointments = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFC] text-slate-900 min-h-screen rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-300 relative font-assistant text-right pb-24" dir="rtl">
      
      {/* Top Banner Control: Switch Customer / Admin View */}
      <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between text-xs font-black">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>מערכת ניהול תורים 2026</span>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'customer' ? 'admin' : 'customer')}
          className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/30 transition-all cursor-pointer text-[11px]"
        >
          {viewMode === 'customer' ? 'מבט מנהל עסק ⚙️' : 'מבט לקוח 👤'}
        </button>
      </div>

      {viewMode === 'admin' ? (
        <AdminDashboard
          business={business}
          setBusiness={setBusiness}
          appointments={appointments}
          setAppointments={setAppointments}
          services={services}
          triggerToast={triggerToast}
          onSwitchToCustomerView={() => setViewMode('customer')}
        />
      ) : (
        <>
          {/* Business Hero Banner (Compact & Polished) */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-900">
            <img 
              src={business.heroImage} 
              alt={business.name} 
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            <div className="absolute bottom-2.5 right-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-black tracking-tight">{business.name}</h2>
                <p className="text-[11px] text-slate-300 font-medium">{business.address}, {business.city}</p>
              </div>
              <div className="text-center">
                <span className="text-amber-400 text-xs block">★★★★★</span>
                <span className="text-[10px] text-slate-300 font-bold">{business.reviewCount} משובים</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Waze + WhatsApp) */}
          <div className="grid grid-cols-2 gap-2 p-3">
            <a
              href={getWazeUrl(business)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
            >
              <span>ניווט ב-Waze</span>
              <span>🚗</span>
            </a>
            <a
              href={`https://wa.me/${business.phoneWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום, אני פונה לגבי שירותי ${business.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
            >
              <span>וואטסאפ לבירורים</span>
              <span>💬</span>
            </a>
          </div>

          {/* Navigation Tabs */}
          <div className="px-3 flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition-all ${
                activeTab === 'active' ? 'bg-[#F09235] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              פגישות פעילות ({activeAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition-all ${
                activeTab === 'history' ? 'bg-[#F09235] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              היסטוריה
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition-all ${
                activeTab === 'services' ? 'bg-[#F09235] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              שירותים ומחירון
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition-all ${
                activeTab === 'about' ? 'bg-[#F09235] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              אודות ומדיניות
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-3 space-y-3">
            
            {/* TAB 1: ACTIVE APPOINTMENTS */}
            {activeTab === 'active' && (
              <div className="space-y-3">
                {activeAppointments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 space-y-2.5">
                    <div className="text-3xl">📅</div>
                    <h4 className="text-sm font-black text-slate-800">אין פגישות עתידיות ביומן</h4>
                    <p className="text-xs text-slate-500">באפשרותך לתאם פגישה חדשה בנוחות בלחיצה מטה.</p>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="px-4 py-2 bg-[#F09235] text-white rounded-xl text-xs font-black shadow-sm"
                    >
                      תיאום פגישה חדשה ➔
                    </button>
                  </div>
                ) : (
                  activeAppointments.map(apt => {
                    const dateObj = new Date(apt.dateTime);
                    const dateStr = dateObj.toLocaleDateString('he-IL');
                    const timeStr = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={apt.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            פגישה מאושרת ✓
                          </span>
                          <span className="text-xs font-black text-slate-900">₪{apt.price}</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900">{apt.serviceTitle}</h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {dateStr} בשעה <strong>{timeStr}</strong> ({apt.durationMinutes} דקות)
                          </p>
                        </div>

                        {/* Calendar & Navigation Actions */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                          <a
                            href={getGoogleCalendarUrl(apt, business)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-1 bg-[#2F80ED] hover:bg-[#256ecf] text-white rounded-xl font-bold flex items-center justify-center gap-1 text-center"
                          >
                            <span>יומן Google</span>
                            <span>📅</span>
                          </a>

                          <button
                            onClick={() => downloadIcsFile(apt, business)}
                            className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-center cursor-pointer"
                          >
                            <span>Apple/Outlook</span>
                            <span>🍏</span>
                          </button>

                          <a
                            href={getWazeUrl(business)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-center"
                          >
                            <span>ניווט Waze</span>
                            <span>🚗</span>
                          </a>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleCancel(apt)}
                            className="text-[10px] text-red-600 hover:underline font-bold"
                          >
                            ביטול פגישה ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {pastAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl p-5 text-center text-xs text-slate-500 border border-slate-200">
                    אין פגישות קודמות בהיסטוריה
                  </div>
                ) : (
                  pastAppointments.map(apt => (
                    <div key={apt.id} className="bg-white/80 rounded-2xl p-3 border border-slate-200 space-y-1 text-xs opacity-75">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{apt.serviceTitle}</span>
                        <span className="text-[10px] font-bold text-slate-500">{apt.status === 'COMPLETED' ? 'הושלם' : 'בוטל'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(apt.dateTime).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: SERVICES */}
            {activeTab === 'services' && (
              <div className="space-y-2">
                {services.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[70%]">
                      <h4 className="text-xs font-black text-slate-900">{s.icon} {s.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-tight">{s.description}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{s.durationMinutes} דקות</span>
                    </div>
                    <div className="text-left space-y-1.5">
                      <span className="text-xs font-black text-slate-900 block">₪{s.price}</span>
                      <button
                        onClick={() => {
                          setSelectedService(s);
                          setShowBookingModal(true);
                        }}
                        className="px-2.5 py-1 bg-[#F09235] hover:bg-[#e08328] text-white font-black text-[10px] rounded-lg shadow-xs cursor-pointer"
                      >
                        תיאום
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: ABOUT */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                <h3 className="text-sm font-black text-slate-900">אודות {business.name}</h3>
                <p className="text-slate-600 leading-relaxed">{business.tagline}</p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-slate-700 font-medium">
                  <p>📍 {business.address}, {business.city}</p>
                  <p>📞 {business.phoneWhatsapp}</p>
                  <p className="text-[11px] text-amber-800">📜 {business.cancelPolicyText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button (FAB) for Booking */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs px-3">
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full py-3.5 bg-gradient-to-r from-[#F5A623] to-[#F09235] hover:from-[#e59512] hover:to-[#e08328] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-white cursor-pointer active:scale-95 transition-all"
            >
              <span>תיאום פגישה חדשה</span>
              <span>📅 +</span>
            </button>
          </div>
        </>
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-3.5 text-right max-h-[92vh] overflow-y-auto font-assistant animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">תיאום פגישה חדשה</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 font-black">✕</button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-1">שירות מבוקש *</label>
                <select
                  value={selectedService.id}
                  onChange={(e) => {
                    const s = services.find(x => x.id === e.target.value);
                    if (s) setSelectedService(s);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.title} - ₪{s.price} ({s.durationMinutes} דק')</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-slate-800 mb-1">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-800 mb-1">טלפון סלולרי *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-slate-800 mb-1">תאריך *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-800 mb-1">שעה *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono"
                  >
                    {['09:00', '10:30', '11:00', '12:30', '14:00', '15:30', '17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">הערות ותיאום מראש</label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="דגשים מיוחדים לפגישה..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs resize-none"
                />
              </div>

              {/* J5 Security Hold Notice */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>💳 מסגרת ביטחון (J5 Hold):</span>
                  <span className="font-mono text-emerald-700">₪{business.settings?.guaranteeHoldAmount || 50}</span>
                </div>
                <p className="text-[10px] text-slate-500">לא מבוצע חיוב כעת. החיוב יחול רק במקרה של אי-התייצבות ללא הודעה.</p>
              </div>

              {/* Compliance Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  id="terms_agree"
                  required
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                <label htmlFor="terms_agree" className="cursor-pointer">
                  אני מאשר/ת את תנאי הפגישה ומדיניות הביטולים של העסק.
                </label>
              </div>

              <button
                type="submit"
                disabled={!termsAgreed}
                className="w-full py-3 bg-[#F09235] hover:bg-[#e08328] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                אישור ותיאום הפגישה 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS MODAL WITH INSTANT GOOGLE CALENDAR & WAZE */}
      {createdAppointment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl space-y-3.5 text-center font-assistant animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mx-auto font-black">
              ✓
            </div>
            
            <div>
              <h3 className="text-base font-black text-slate-900">הפגישה נקבעה בהצלחה!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {createdAppointment.serviceTitle} ביום{' '}
                {new Date(createdAppointment.dateTime).toLocaleDateString('he-IL')} בשעה{' '}
                {new Date(createdAppointment.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* 1-Click Google Calendar & Waze Buttons */}
            <div className="space-y-2 pt-1 text-xs font-black">
              <a
                href={getGoogleCalendarUrl(createdAppointment, business)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#2F80ED] hover:bg-[#256ecf] text-white rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all block"
              >
                <span>שמור עכשיו ביומן Google</span>
                <span>📅</span>
              </a>

              <a
                href={getWazeUrl(business)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all block"
              >
                <span>ניווט מיידי עם Waze לכתובת</span>
                <span>🚗</span>
              </a>
            </div>

            <button
              onClick={() => setCreatedAppointment(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all"
            >
              סגור וצפה בלוח הפגישות
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black border border-cyan-400/50 text-center animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
