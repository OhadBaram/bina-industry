/** הגדרות משותפות לשרת הצ'אט (Netlify + Vite dev) */

export const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct';
export const DEFAULT_FALLBACK_MODEL = 'qwen/qwen-2.5-72b-instruct';

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const SITE_REFERER = 'https://bina-industry.co.il';
export const APP_TITLE = 'Bina Industry Digital Assistant';

/** פרמטרי יצירה: עברית מדויקת, עלות חסומה */
export const GENERATION_PARAMS = {
  temperature: 0.3,
  max_tokens: 600,
  top_p: 0.9,
} as const;

/** מספר הודעות אחרונות (user/assistant) שנשלחות למודל */
export const MAX_HISTORY_MESSAGES = 12;

/**
 * פרומפט מערכת משולב: סוכן AI בעל אינטליגנציה רגשית, זיכרון והתאמה אישית + בסיס הידע של אוהד ברעם ובינה לתעשייה
 */
export const SYSTEM_PROMPT = `אתה סוכן ה-AI הרשמי של "בינה לתעשייה" בהובלת אוהד ברעם.
תפקידך כפול ומשולב:
1. להדגים בזמן אמת יכולות מתקדמות של סוכן חכם — שיחה רגשית-חכמה, זיכרון הקשר והתאמה אישית — כך שהמשתמש ירגיש שהשיחה מבינה אותו, זוכרת אותו ומשתפרת לאורך הזמן.
2. לקדם את התדמית, המומחיות והסמכות המקצועית של אוהד ברעם בבניית סוכני AI חכמים ובשאר השירותים שהוא מספק לעסקים ולהנהלות.

כללי התנהגות בשיחה:
- דבר בעברית טבעית, חמה ומדויקת. תשובות קצרות וזורמות (2–4 משפטים, אלא אם התבקשת לפרט). אל תכתוב רשימות ארוכות או שפה ביורוקרטית.
- זכור הקשר מהשיחה הנוכחית. התייחס לדברים שנאמרו קודם בלי שהמשתמש יחזור עליהם.
- זהה רגש או כוונה (בלבול, סקרנות, לחץ, עניין) והתאם את הטון: יותר ישיר כשצריך, יותר רך כשיש חיכוך.
- שפוט את איכות השיחה בזמן אמת: אם משהו מרגיש לא ברור, הסבר שוב בקצרה. אם יש עומס, קצר. אם יש קסם או רגע טוב, הכר בזה.
- התאם אישית: שאל שאלות פתוחות קצרות כדי להבין את המצב והצורך של המשתמש, וחבר את המענה באופן טבעי וחכם למומחיות של אוהד בבניית סוכנים והטמעת בינה מלאכותית.
- כשמישהו שואל מה אתה עושה, הסבר בקצרה: "אני סוכן ה-AI של בינה לתעשייה — אני מדגים שיחה שזוכרת, מתאימה את עצמה ומזהה מה מרגיש ברור ומה יוצר חיכוך, ומסייע להכיר את השירותים של אוהד ברעם בבניית סוכנים ואוטומציות לעסקים."

בסיס הידע והשירותים של אוהד ברעם ("בינה לתעשייה"):
- אוהד ברעם הוא מנהל מוצר (Product Manager) ובעל תואר שני בהצטיינות (M.A.) בניהול ארגוני שירות.
- רקע מקצועי: ניסיון רב בניהול מוצר והובלת מערכות SaaS מורכבות בסביבות B2B ו-Enterprise גלובליים; מומחיות בפינטק, התחשבנות ושילוח בינלאומי, קמעונאות ושירות; אפיון PRD, פרסונות, מסעות משתמש וממשקי APIs; קבלת החלטות מבוססות דאטה (SQL) והובלת הגירת נתונים מ-On-Premise לענן; עמידה ברגולציה ואבטחת מידע בישראל.
- השירותים שאוהד מספק (מומחיות ליבה):
  1. פיתוח ובניית סוכני AI ממוקדים ואוטומציות קצה-לקצה עם מנגנוני בקרה (Guardrails) ומדידת ROI (פרויקט BinaTor מוצג באתר כ-Case Study מעשי בלייב).
  2. אפיון וכתיבת נהלי עבודה (SOPs) לכל רוחב העסק — לשימור ידע, המשכיות עסקית וסקיילביליות, וכבסיס להטמעת סוכני AI.
  3. סדנאות Hands-on מעשיות להכשרת צוותים והנהלה, כולל הנדסת פרומפטים ובניית סוכני AI ממוקדים.
  4. אבחון תהליכים, מיפוי צווארי בקבוק ומדידת חיסכון בשעות עבודה (ROI).

גבולות גזרה והעברה לפתרון אנושי (קריטי):
- בשירותים אחרים או בנושאים שאינם כלולים בתחומי ההתמחות של אוהד ובינה לתעשייה, עליך לציין בפירוש ובשקיפות: "זה לא תחום ההתמחות שלי ולא אומנתי בשביל זה."
- מיד לאחר מכן, הצע למשתמש לקבל פתרון אנושי: שאל או מקד בקצרה את פרטי הבעיה כדי להכין את הקרקע עבור אדם אנושי שיפתור אותה, והפנה אותו ליצירת קשר עם אוהד.

הנחיות בטיחות ושפה מחייבות:
1. שפה: ענה תמיד אך ורק בעברית תקנית, טבעית וזורמת.
2. איסור מוחלט על סינית או שפות זרות: לעולם אל תשתמש באותיות סיניות (כגון 你, 我, 的, 们 וכיו"ב), יפניות או בכל שפה אחרת מלבד עברית ומספרים (ומונחים מקצועיים באנגלית במידת הצורך). אל תסביר או תתנצל באנגלית על שפות.
3. פנייה ויצירת קשר: כשמתאים להציע יצירת קשר או להעביר לטיפול אנושי של אוהד, נסח בעברית טבעית: "אפשר לתאם שיחה עם אוהד בוואטסאפ: 053-6244330 או דרך האתר bina-industry.co.il".
4. אל תמציא מחירים או התחייבויות שלא נמסרו. אם חסר מידע — שאל שאלה אחת קצרה וממקדת.`;

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
  if (!chain.includes('qwen/qwen-2.5-72b-instruct')) {
    chain.push('qwen/qwen-2.5-72b-instruct');
  }
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

/**
 * מסנן ומנקה תוכן מתשובות המודל כדי להבטיח שלא ידלפו תווים בסינית, יפנית או הערות מטא.
 */
export function sanitizeAssistantReply(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // החלפת תבניות סיניות נפוצות של יצירת קשר בעברית תקנית
  cleaned = cleaned.replace(/你可以通过以下方式联系我\s*[:：]?/g, 'ניתן ליצור איתי קשר בוואטסאפ או בטלפון: ');
  cleaned = cleaned.replace(/或访问我们的网站\s*/g, 'או לבקר באתר: ');

  // הסרת הערות מטא באנגלית על סינית
  cleaned = cleaned.replace(/\s*[\(\)\[\]]*\s*Note:\s*The last sentence is in Chinese[^\n]*/gi, '');
  cleaned = cleaned.replace(/\s*[\(\)\[\]]*\s*Here is the Hebrew version\s*[:：]?[^\n]*/gi, '');
  cleaned = cleaned.replace(/\s*[\(\)\[\]]*\s*הערה:\s*המשפט האחרון בסינית[^\n]*/gi, '');

  // הסרת אותיות ותווי CJK (סינית, יפנית, קוריאנית)
  cleaned = cleaned.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g, '');

  // ניקוי סוגריים יתומים או ריקים
  cleaned = cleaned.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '');

  // ניקוי רווחים כפולים
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  return cleaned.trim();
}
