/** הגדרות משותפות לשרת הצ'אט (Netlify + Vite dev) */

export const DEFAULT_MODEL = 'qwen/qwen-2.5-72b-instruct';
export const DEFAULT_FALLBACK_MODEL = 'deepseek/deepseek-chat';

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const SITE_REFERER = 'https://bina-industry.co.il';
export const APP_TITLE = 'Bina Industry Digital Assistant';

/** פרמטרי יצירה: עברית מדויקת, עלות חסומה */
export const GENERATION_PARAMS = {
  temperature: 0.4,
  max_tokens: 600,
  top_p: 0.9,
} as const;

/** מספר הודעות אחרונות (user/assistant) שנשלחות למודל */
export const MAX_HISTORY_MESSAGES = 8;

/**
 * פרומפט מערכת קצר — מזעור טוקנים + תשובות עברית תמציתיות.
 */
export const SYSTEM_PROMPT = `אתה העוזר הדיגיטלי של "בינה לתעשייה" (אוהד ברעם).
ענה תמיד בעברית תקינה, בקצרה ובמדויק (2–5 משפטים אלא אם מבקשים פירוט).
תחומי מומחיות: אפיון תהליכים, SOPs/מסמכי עבודה, סדנאות AI Hands-on, אבחון צווארי בקבוק ו-ROI, והטמעת AI בעסקים.
אל תמציא מחירים, הבטחות או עובדות שלא נמסרו. אם חסר מידע — שאל שאלה אחת קצרה.
כשמתאים, הפנה לתיאום שיחת אבחון או לוואטסאפ: 053-6244330 / האתר bina-industry.co.il.`;

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function resolveModels(env: Record<string, string | undefined> = {}) {
  const primary = (env.OPENROUTER_MODEL || DEFAULT_MODEL).trim();
  const fallback = (env.OPENROUTER_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL).trim();
  const chain = [primary];
  if (fallback && fallback !== primary) chain.push(fallback);
  // גיבוי שלישי קשיח למקרה ששני הראשונים נכשלים
  if (!chain.includes('deepseek/deepseek-chat')) {
    chain.push('deepseek/deepseek-chat');
  }
  return chain;
}

/** מנרמל היסטוריה: בלי system מהלקוח, חיתוך אורך, הגבלת מספר הודעות */
export function sanitizeClientMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  const cleaned: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: string }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const trimmed = content.trim().slice(0, 4000);
    if (!trimmed) continue;
    cleaned.push({ role, content: trimmed });
  }

  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

export function buildMessages(history: ChatMessage[]): ChatMessage[] {
  return [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
}

export function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': SITE_REFERER,
    'X-Title': APP_TITLE,
  };
}

export function buildCompletionBody(model: string, messages: ChatMessage[]) {
  return {
    model,
    messages,
    stream: true,
    ...GENERATION_PARAMS,
  };
}

export const LOCALIZED_FALLBACK_REPLY =
  'מצטערים, השירות עמוס כרגע. נסו שוב בעוד רגע, או פנו ישירות בוואטסאפ: 053-6244330.';
