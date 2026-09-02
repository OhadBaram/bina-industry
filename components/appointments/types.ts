export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentGuaranteeType = 'NONE' | 'J5_HOLD' | 'PARTIAL_DEPOSIT' | 'FULL_PAYMENT';

export interface BusinessRiskSettings {
  globalMaxActiveAppointments: number;
  cancelWindowHours: number;
  enableBufferMinutes: number; // מרווח התארגנות בין תורים
  lateArrivalGraceMinutes: number; // זמן חסד לאיחור לקוח
  defaultGuaranteeType: PaymentGuaranteeType;
  guaranteeHoldAmount: number;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  tagline: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  heroImage: string;
  phoneWhatsapp: string;
  wazeUrl: string;
  cancelPolicyText: string;
  settings: BusinessRiskSettings;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
  icon: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceTitle: string;
  dateTime: string; // ISO string
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  guarantee?: {
    type: PaymentGuaranteeType;
    amount: number;
    isHeld: boolean;
    isCharged: boolean;
    cardLast4?: string;
  };
  isRiskFlagged?: boolean;
}

export interface UserSession {
  phone: string;
  name: string;
  isLoggedIn: boolean;
}

export interface WaitlistEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  preferredDate: string;
  createdAt: string;
}
