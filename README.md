<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# בינה לתעשייה — אתר וקליטת פניות

האתר רץ ב-Netlify. הצ'אט והאוטומציה של טופס יצירת הקשר רצים אצלנו (בלי Zapier).

## הרצה מקומית

**דרישות:** Node.js

1. התקנה: `npm install`
2. העתקה: `.env.example` → `.env.local` והגדרת המשתנים (ראו למטה)
3. הרצה: `npm run dev`
   - `/api/chat` — צ'אט OpenRouter
   - `/api/lead` — קליטת פנייה + ניתוח + התראות

## פריסה (Netlify)

הגדירו את אותם משתנים בפרויקט Netlify (Site configuration → Environment variables), ואז Deploy.

- צ'אט: `netlify/functions/chat.ts` → `/api/chat`
- לידים: `netlify/functions/lead.ts` → `/api/lead`

### מה קורה כשמישהו שולח את הטופס

1. האתר שולח JSON ל-`/api/lead`
2. השרת מנתח את הפנייה בעברית (OpenRouter)
3. השעה מומרת לשעון ישראל (`Asia/Jerusalem`)
4. אם הוגדרו מפתחות: נשמרת שורה בגיליון, נשלחת התראת טלגרם, ונשלח מייל מלא
5. ערוץ שלא הוגדר — מדולג. הפנייה עדיין מתקבלת באתר (הטופס לא נשבר)

ארכיון נוסף נשמר גם ב-Netlify Forms (טופס `contact`).

**חשוב:** כבו את ה-Zap הישן ב-Zapier כדי שלא יתקבלו כפילויות.

---

## משתני סביבה להגדיר ב-Netlify (לבן)

לא שמים מפתחות בקוד ולא בגיט. רק במסך Environment variables של Netlify, ואז Redeploy.

### חובה לצ'אט ולניתוח AI

| משתנה | מה זה |
|---|---|
| `OPENROUTER_API_KEY` | המפתח מ-openrouter.ai (כבר בשימוש בצ'אט) |
| `OPENROUTER_LEAD_MODEL` | אופציונלי. ברירת מחדל: `deepseek/deepseek-chat` |

### טלגרם (התראה מיידית)

1. בטלגרם חפשו `@BotFather`, צרו בוט, העתיקו את הטוקן
2. שלחו לבוט הודעה מהטלפון שלכם
3. פתחו בדפדפן (החליפו TOKEN): `https://api.telegram.org/botTOKEN/getUpdates` ומצאו את `chat.id`

| משתנה | מה זה |
|---|---|
| `TELEGRAM_BOT_TOKEN` | הטוקן מ-BotFather |
| `TELEGRAM_CHAT_ID` | מספר הצ'אט שלכם |

### מייל (דוח מלא) — Resend

1. הרשמה ב-https://resend.com
2. יצירת API Key
3. לדומיין אמיתי: אימות דומיין ב-Resend ואז כתובת שולח כמו `לידים <leads@bina-industry.co.il>`
4. לבדיקה אפשר `LEAD_EMAIL_FROM=בינה לתעשייה <onboarding@resend.dev>`

| משתנה | מה זה |
|---|---|
| `RESEND_API_KEY` | מפתח Resend |
| `LEAD_NOTIFY_EMAIL` | לאן לשלוח את הדוח (המייל שלכם) |
| `LEAD_EMAIL_FROM` | אופציונלי — כתובת השולח |

### גיליון Google — הדרך הפשוטה (מומלץ)

1. פתחו גיליון עם כותרות בשורה 1: תאריך, שם, טלפון, סיכום, סיווג
2. בגיליון: Extensions → Apps Script, הדביקו:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);
  const row = data.values || [
    data.timestamp,
    data.full_name,
    data.phone,
    data.summary,
    data.classification,
  ];
  sheet.appendRow(row);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
4. העתיקו את כתובת ה-Web app

| משתנה | מה זה |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | כתובת ה-Web app |

### גיליון Google — דרך מתקדמת (חשבון שירות)

רק אם אין webhook. צריך חשבון שירות ב-Google Cloud, שיתוף הגיליון למייל של החשבון (Editor), ואז:

| משתנה | מה זה |
|---|---|
| `GOOGLE_SHEETS_ID` | מזהה הגיליון מהכתובת |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | האימייל של חשבון השירות |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | המפתח הפרטי (עם `\n` לשורות חדשות) |
| `GOOGLE_SHEETS_RANGE` | אופציונלי, ברירת מחדל `Sheet1!A:E` |

---

## משתני צ'אט (קיימים)

- `OPENROUTER_API_KEY` (חובה)
- `OPENROUTER_MODEL` (אופציונלי)
- `OPENROUTER_FALLBACK_MODEL` (אופציונלי)
