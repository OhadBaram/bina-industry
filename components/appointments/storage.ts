import { BusinessProfile, Appointment, WaitlistEntry, UserSession } from './types';
import { MOCK_BUSINESS, INITIAL_APPOINTMENTS, INITIAL_WAITLIST } from './mockData';

const KEYS = {
  appointments: 'executive_appointments',
  session: 'executive_session',
  waitlist: 'executive_waitlist',
  business: 'executive_business',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadAppointments(): Appointment[] {
  return readJson(KEYS.appointments, INITIAL_APPOINTMENTS);
}

export function saveAppointments(appointments: Appointment[]): void {
  writeJson(KEYS.appointments, appointments);
}

export function loadWaitlist(): WaitlistEntry[] {
  return readJson(KEYS.waitlist, INITIAL_WAITLIST);
}

export function saveWaitlist(waitlist: WaitlistEntry[]): void {
  writeJson(KEYS.waitlist, waitlist);
}

export function loadBusiness(): BusinessProfile {
  return readJson(KEYS.business, MOCK_BUSINESS);
}

export function saveBusiness(business: BusinessProfile): void {
  writeJson(KEYS.business, business);
}

export function loadSession(): UserSession {
  return readJson(KEYS.session, {
    phone: '0536244330',
    name: 'אוהד ברעם',
    isLoggedIn: true,
  });
}

export function saveSession(session: UserSession): void {
  writeJson(KEYS.session, session);
}
