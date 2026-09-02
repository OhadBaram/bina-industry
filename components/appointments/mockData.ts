import { BusinessProfile, Appointment, WaitlistEntry } from './types';
import { servicesFromB2B } from './dataAdapter';

export const MOCK_BUSINESS: BusinessProfile = {
  id: 'biz_bina_industry',
  name: 'בינה לתעשייה',
  category: 'ENTERPRISE AI | אפיון תהליכים והטמעת AI',
  tagline: 'מטמיעים AI בעבודה האמיתית, לא במצגות. אפיון תהליכים, כתיבת מסמכי עבודה (SOPs), סדנאות Hands-on מעשיות ואוטומציות לתוצאות עסקיות בשטח.',
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

export const MOCK_SERVICES = servicesFromB2B();

const consultingService = MOCK_SERVICES.find(s => s.id === 'consulting')!;
const sopService = MOCK_SERVICES.find(s => s.id === 'sop')!;

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_101',
    businessId: 'biz_bina_industry',
    customerName: 'אוהד ברעם',
    customerPhone: '0536244330',
    serviceId: 'consulting',
    serviceTitle: consultingService.title,
    dateTime: new Date(Date.now() + 86400000 * 2 + 3600000 * 2).toISOString(),
    durationMinutes: consultingService.durationMinutes,
    price: consultingService.price,
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
    businessId: 'biz_bina_industry',
    customerName: 'אוהד ברעם',
    customerPhone: '0536244330',
    serviceId: 'sop',
    serviceTitle: sopService.title,
    dateTime: new Date(Date.now() - 86400000 * 10).toISOString(),
    durationMinutes: sopService.durationMinutes,
    price: sopService.price,
    status: 'COMPLETED'
  }
];

export const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wait_1',
    customerName: 'רועי ש.',
    customerPhone: '054-3322114',
    serviceId: 'consulting',
    serviceTitle: consultingService.title,
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];
