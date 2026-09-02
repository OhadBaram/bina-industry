import { BusinessProfile, ServiceItem, Appointment, WaitlistEntry } from './types';

export const MOCK_BUSINESS: BusinessProfile = {
  id: 'biz_executive',
  name: 'מרכז שירותים וקליניקה עסקית',
  category: 'שירותי מומחה וייעוץ מקצועי',
  tagline: 'ניהול פגישות ושירותים מקצועיים בדיוק ובאיכות ללא פשרות',
  address: 'שדרות רוטשילד 45',
  city: 'תל אביב',
  rating: 5.0,
  reviewCount: 84,
  heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  phoneWhatsapp: '0536244330',
  wazeUrl: 'https://waze.com/ul?q=שדרות%20רוטשילד%2045%20תל%20אביב',
  cancelPolicyText: 'ביטול פגישה עצמאי במערכת מתאפשר עד 4 שעות לפני המועד. לאחר מכן, יש ליצור קשר ישיר לתיאום מועד חלופי.',
  settings: {
    globalMaxActiveAppointments: 2,
    cancelWindowHours: 4,
    enableBufferMinutes: 10,
    lateArrivalGraceMinutes: 15,
    defaultGuaranteeType: 'J5_HOLD',
    guaranteeHoldAmount: 50
  }
};

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'srv_consulting_full',
    title: 'פגישת אפיון וייעוץ מקיפה',
    category: 'ייעוץ אסטרטגי',
    durationMinutes: 60,
    price: 350,
    description: 'סקירת תהליכים עסקית, מיפוי צרכים, הגדרת יעדים ובניית תוכנית עבודה ממוקדת תוצאות.',
    icon: '📊'
  },
  {
    id: 'srv_express_review',
    title: 'מפגש ביקורת ומעקב תקופתי',
    category: 'ליווי שוטף',
    durationMinutes: 30,
    price: 180,
    description: 'בחינת עמידה ביעדים, דיוק משימות שוטפות והסרת חסמים תפעוליים.',
    icon: '🎯'
  },
  {
    id: 'srv_premium_strategy',
    title: 'סדנת הטמעה ופיתוח תהליכים',
    category: 'הטמעה ואימון',
    durationMinutes: 90,
    price: 500,
    description: 'עבודה מעשית עם צוותי הארגון להטמעת כלי אוטומציה ושיטות עבודה אפקטיביות.',
    icon: '⚡'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_101',
    businessId: 'biz_executive',
    customerName: 'אוהד ברעם',
    customerPhone: '0536244330',
    serviceId: 'srv_consulting_full',
    serviceTitle: 'פגישת אפיון וייעוץ מקיפה',
    dateTime: new Date(Date.now() + 86400000 * 2 + 3600000 * 2).toISOString(),
    durationMinutes: 60,
    price: 350,
    status: 'CONFIRMED',
    notes: 'מיקוד בתהליכי אוטומציה עסקית וחיסכון בעלויות תפעול.',
    guarantee: {
      type: 'J5_HOLD',
      amount: 50,
      isHeld: true,
      isCharged: false,
      cardLast4: '4242'
    },
    isRiskFlagged: false
  },
  {
    id: 'apt_100',
    businessId: 'biz_executive',
    customerName: 'אוהד ברעם',
    customerPhone: '0536244330',
    serviceId: 'srv_express_review',
    serviceTitle: 'מפגש ביקורת ומעקב תקופתי',
    dateTime: new Date(Date.now() - 86400000 * 10).toISOString(),
    durationMinutes: 30,
    price: 180,
    status: 'COMPLETED'
  }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait_1',
    customerName: 'רועי ש.',
    customerPhone: '054-3322114',
    serviceTitle: 'פגישת אפיון וייעוץ מקיפה',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];
