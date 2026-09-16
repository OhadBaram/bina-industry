import { Appointment, BusinessProfile } from './types';

/**
 * יצירת קישור ישיר להוספת הפגישה ליומן Google בנייד בלחיצה אחת
 */
export const getGoogleCalendarUrl = (apt: Appointment, business: BusinessProfile): string => {
  const startDate = new Date(apt.dateTime);
  const duration = apt.durationMinutes || 60;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const title = encodeURIComponent(`${apt.serviceTitle} - ${business.name}`);
  const details = encodeURIComponent(
    `פגישה שתואמה ב-${business.name}.\nשירות: ${apt.serviceTitle}\nכתובת: ${business.address}, ${business.city}\nוואטסאפ לבירורים: ${business.phoneWhatsapp}\nניווט ב-Waze: ${business.wazeUrl}`
  );
  const location = encodeURIComponent(`${business.address}, ${business.city}`);
  const dates = `${formatGCal(startDate)}/${formatGCal(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

/**
 * יצירת והורדת קובץ יומן אוניברסלי לאייפון (Apple Calendar) ואאוטלוק (.ics)
 */
export const downloadIcsFile = (apt: Appointment, business: BusinessProfile): void => {
  const startDate = new Date(apt.dateTime);
  const duration = apt.durationMinutes || 60;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const formatIcs = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bina Industry//Appointment System//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apt-${apt.id}@bina-industry.co.il`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(startDate)}`,
    `DTEND:${formatIcs(endDate)}`,
    `SUMMARY:${apt.serviceTitle} - ${business.name}`,
    `DESCRIPTION:${apt.serviceTitle} ב-${business.name}\\nכתובת: ${business.address}, ${business.city}\\nטלפון: ${business.phoneWhatsapp}\\nניווט Waze: ${business.wazeUrl}`,
    `LOCATION:${business.address}, ${business.city}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `appointment-${apt.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * יצירת קישור ישיר לניווט ב-Waze
 */
export const getWazeUrl = (business: BusinessProfile): string => {
  return business.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(`${business.address} ${business.city}`)}`;
};
