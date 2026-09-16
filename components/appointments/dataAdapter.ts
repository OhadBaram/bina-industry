import { B2B_SERVICES } from '../../data/b2bData';
import { ServiceItem, Appointment, WaitlistEntry, Customer } from './types';

const SERVICE_PRICING: Record<string, { durationMinutes: number; price: number }> = {
  consulting: { durationMinutes: 60, price: 350 },
  sop: { durationMinutes: 90, price: 400 },
  workshops: { durationMinutes: 120, price: 500 },
};

export function servicesFromB2B(): ServiceItem[] {
  return B2B_SERVICES.map(svc => {
    const pricing = SERVICE_PRICING[svc.id] ?? { durationMinutes: 60, price: 350 };
    return {
      id: svc.id,
      title: svc.title,
      category: svc.subtitle ?? '',
      durationMinutes: pricing.durationMinutes,
      price: pricing.price,
      description: svc.shortDesc,
      icon: svc.icon,
    };
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function extractCustomersFromData(
  appointments: Appointment[],
  waitlist: WaitlistEntry[]
): Customer[] {
  const customerMap = new Map<string, Customer>();

  for (const apt of appointments) {
    const key = normalizePhone(apt.customerPhone);
    const existing = customerMap.get(key);

    if (!existing) {
      customerMap.set(key, {
        phone: apt.customerPhone,
        name: apt.customerName,
        appointmentCount: 1,
        lastAppointment: apt.dateTime,
      });
    } else {
      existing.appointmentCount += 1;
      if (
        !existing.lastAppointment ||
        new Date(apt.dateTime) > new Date(existing.lastAppointment)
      ) {
        existing.lastAppointment = apt.dateTime;
      }
    }
  }

  for (const entry of waitlist) {
    const key = normalizePhone(entry.customerPhone);
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        phone: entry.customerPhone,
        name: entry.customerName,
        appointmentCount: 0,
      });
    }
  }

  return Array.from(customerMap.values()).sort((a, b) => {
    if (a.lastAppointment && b.lastAppointment) {
      return new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime();
    }
    if (a.lastAppointment) return -1;
    if (b.lastAppointment) return 1;
    return a.name.localeCompare(b.name, 'he');
  });
}
