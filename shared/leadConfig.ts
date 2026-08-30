/** הגדרות ופורמטים לניתוח לידים (משותף ל-Netlify ולפיתוח מקומי) */

import { DEFAULT_FALLBACK_MODEL, DEFAULT_MODEL } from './chatConfig';

export const DEFAULT_LEAD_MODEL = DEFAULT_FALLBACK_MODEL; // deepseek/deepseek-chat — זול וטוב ל-JSON בעברית
export const DEFAULT_LEAD_FALLBACK_MODEL = DEFAULT_MODEL;
export const DEFAULT_LEAD_NOTIFY_EMAIL = 'binator.industry@gmail.com';

/** גיליון לידים קבוע — אפשר לדרוס עם GOOGLE_SHEETS_ID */
export const DEFAULT_GOOGLE_SHEETS_ID = '1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw';
/** לשונית ראשונה (gid=0) */
export const DEFAULT_GOOGLE_SHEETS_GID = 0;
export const DEFAULT_GOOGLE_SHEETS_RANGE = 'A:E';

export function resolveGoogleSheetsId(env: Record<string, string | undefined> = {}): string {
  return env.GOOGLE_SHEETS_ID?.trim() || DEFAULT_GOOGLE_SHEETS_ID;
}

export const LEAD_AI_TIMEOUT_MS = 20_000;
export const LEAD_CHANNEL_TIMEOUT_MS = 10_000;

export interface LeadInput {
  full_name: string;
  user_name?: string;
  company_name?: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}

export interface LeadAnalysis {
  classification: string;
  summary: string;
  customer_needs: string;
  solution: string;
  urgency_level: string;
  key_points: string;
  items_to_check: string;
  priority: string;
}

export type ChannelStatus = 'ok' | 'skipped' | 'error';

export interface LeadChannelResults {
  sheets: ChannelStatus;
  telegram: ChannelStatus;
  email: ChannelStatus;
  ai: ChannelStatus;
}

export const FALLBACK_ANALYSIS: LeadAnalysis = {
  classification: 'Lead',
  summary: 'פנייה חדשה מהאתר (ניתוח אוטומטי לא היה זמין).',
  customer_needs: 'לא זוהה אוטומטית — יש לקרוא את הפנייה המקורית.',
  solution: 'לחזור ללקוח לשיחת אבחון ראשונית.',
  urgency_level: 'Medium',
  key_points: 'יש לבדוק ידנית.',
  items_to_check: 'פרטי קשר, תוכן הפנייה, והתאמה לשירותי בינה לתעשייה.',
  priority: 'לחזור ללקוח בהקדם.',
};

export const LEAD_SYSTEM_PROMPT = `אתה אנליסט פניות של "בינה לתעשייה" (אוהד ברעם).
תחומי החברה: אפיון תהליכים, כתיבת מסמכי עבודה (SOP), סדנאות AI מעשיות, והטמעת בינה מלאכותית בעסקים.

החזר JSON תקין בלבד (בלי markdown ובלי טקסט מסביב) עם השדות הבאים בעברית:
- classification: "Lead" אם זו פנייה עסקית/עניין בשירות, או "Complaint" אם זו תלונה/בעיה
- summary: סיכום קצר וברור של הפנייה (2–4 משפטים)
- customer_needs: מה הלקוח צריך
- solution: איך בינה לתעשייה יכולה לעזור
- urgency_level: "High" או "Medium" או "Low"
- key_points: נקודות חשובות (מחרוזת, אפשר עם שורות חדשות)
- items_to_check: מה לבדוק לפני החזרה ללקוח
- priority: צעדים מומלצים לפי סדר עדיפות

אל תמציא פרטים שלא נמסרו. אם חסר מידע — ציין זאת בשדות הרלוונטיים.`;

export function resolveLeadModels(env: Record<string, string | undefined> = {}): string[] {
  const primary = (env.OPENROUTER_LEAD_MODEL || DEFAULT_LEAD_MODEL).trim();
  const fallback = (env.OPENROUTER_LEAD_FALLBACK_MODEL || env.OPENROUTER_MODEL || DEFAULT_LEAD_FALLBACK_MODEL).trim();
  const chain = [primary];
  if (fallback && fallback !== primary) chain.push(fallback);
  if (!chain.includes(DEFAULT_LEAD_MODEL)) chain.push(DEFAULT_LEAD_MODEL);
  return chain;
}

export function formatIsraelTimestamp(isoUtc?: string): string {
  const parsed = isoUtc ? new Date(isoUtc) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')}.${get('month')}.${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

export function asPlainText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(asPlainText).filter(Boolean).join('\n');
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  if (value == null) return '';
  return String(value).trim();
}

export function parseLeadAnalysis(raw: string): LeadAnalysis | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.unshift(fenced[1].trim());
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.unshift(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') continue;
      const classificationRaw = asPlainText(parsed.classification);
      const classification = /complaint|תלונ/i.test(classificationRaw) ? 'Complaint' : 'Lead';
      const urgencyRaw = asPlainText(parsed.urgency_level);
      let urgency_level = 'Medium';
      if (/high|גבוה/i.test(urgencyRaw)) urgency_level = 'High';
      else if (/low|נמוך/i.test(urgencyRaw)) urgency_level = 'Low';
      else if (/medium|בינונ/i.test(urgencyRaw)) urgency_level = 'Medium';

      const summary = asPlainText(parsed.summary);
      if (!summary) continue;

      return {
        classification,
        summary,
        customer_needs: asPlainText(parsed.customer_needs) || FALLBACK_ANALYSIS.customer_needs,
        solution: asPlainText(parsed.solution) || FALLBACK_ANALYSIS.solution,
        urgency_level,
        key_points: asPlainText(parsed.key_points) || FALLBACK_ANALYSIS.key_points,
        items_to_check: asPlainText(parsed.items_to_check) || FALLBACK_ANALYSIS.items_to_check,
        priority: asPlainText(parsed.priority) || FALLBACK_ANALYSIS.priority,
      };
    } catch {
      continue;
    }
  }
  return null;
}

export function buildTelegramMessage(lead: LeadInput, analysis: LeadAnalysis, timestamp: string): string {
  return [
    '🔔 פנייה חדשה!',
    '',
    `⏰ תאריך: ${timestamp}`,
    `👤 שם: ${lead.full_name}`,
    `📱 טלפון: ${lead.phone}`,
    `📋 סיווג: ${analysis.classification}`,
    `⭐ דחיפות: ${analysis.urgency_level}`,
    `📝 סיכום: ${analysis.summary}`,
  ].join('\n');
}

export function buildEmailSubject(lead: LeadInput, analysis: LeadAnalysis): string {
  return `פנייה חדשה - ${lead.full_name} (${analysis.classification})`;
}

export function buildEmailBody(lead: LeadInput, analysis: LeadAnalysis, timestamp: string): string {
  const line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  return [
    line,
    '',
    `⏰ תאריך ושעה: ${timestamp}`,
    '',
    `👤 שם: ${lead.full_name}`,
    `📱 טלפון: ${lead.phone}`,
    `📧 אימייל: ${lead.email}`,
    '',
    line,
    '',
    '📝 הפנייה המקורית:',
    lead.message || '(לא נמסר תוכן פנייה)',
    '',
    line,
    '',
    '🔍 ניתוח AI:',
    `📋 סיווג: ${analysis.classification}`,
    `⭐ דחיפות: ${analysis.urgency_level}`,
    `📚 סיכום: ${analysis.summary}`,
    `❓ צרכי הלקוח: ${analysis.customer_needs}`,
    `💡 הפתרון המוצע: ${analysis.solution}`,
    `🎯 נקודות חשובות: ${analysis.key_points}`,
    `✅ מה לבדוק: ${analysis.items_to_check}`,
    `🚀 צעדים בעדיפות: ${analysis.priority}`,
    '',
  ].join('\n');
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseLeadPayload(raw: unknown): { ok: true; lead: LeadInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'גוף הבקשה אינו תקין' };
  }
  const body = raw as Record<string, unknown>;
  const userName = asPlainText(body.user_name || body.name);
  const companyName = asPlainText(body.company_name || body.company);
  const combined =
    asPlainText(body.full_name) ||
    asPlainText(body.full_identity) ||
    (companyName ? `${userName} (${companyName})` : userName);
  const phone = asPlainText(body.phone);
  const email = asPlainText(body.email).toLowerCase();
  const message = asPlainText(body.message);
  const created_at = asPlainText(body.created_at) || new Date().toISOString();

  if (!combined) return { ok: false, error: 'חסר שם מלא' };
  if (!phone) return { ok: false, error: 'חסר טלפון' };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'כתובת דוא״ל לא תקינה' };

  return {
    ok: true,
    lead: {
      full_name: combined.slice(0, 200),
      user_name: userName.slice(0, 120) || undefined,
      company_name: companyName.slice(0, 120) || undefined,
      phone: phone.slice(0, 40),
      email: email.slice(0, 200),
      message: message.slice(0, 8000),
      created_at,
    },
  };
}
