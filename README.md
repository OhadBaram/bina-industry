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
| `LEAD_NOTIFY_EMAIL` | אופציונלי. ברירת מחדל בקוד: `binator.industry@gmail.com` |
| `LEAD_EMAIL_FROM` | אופציונלי — כתובת השולח |

### גיליון Google — הדרך הפשוטה (מומלץ)

מזהה הגיליון כבר מקודד בפרויקט (אין צורך להגדיר אותו ב-Netlify):

`1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw`

הגיליון:

https://docs.google.com/spreadsheets/d/1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw/edit?gid=0#gid=0

עמודות בשורה 1 (או שהסקריפט פשוט יוסיף שורות): תאריך, שם, טלפון, סיכום, סיווג

1. פתחו **את הגיליון הזה** (הקישור למעלה)
2. בתפריט: Extensions → Apps Script
3. מחקו את התוכן הקיים והדביקו את הסקריפט הבא:

```javascript
function doPost(e) {
  var DEFAULT_SPREADSHEET_ID = '1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw';
  var DEFAULT_SHEET_GID = 0;
  var data = JSON.parse(e.postData.contents);
  var spreadsheetId = data.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  var sheetGid = typeof data.sheetGid === 'number' ? data.sheetGid : DEFAULT_SHEET_GID;
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheets = ss.getSheets();
  var sheet = sheets.filter(function (s) { return s.getSheetId() === sheetGid; })[0] || sheets[0];
  var row = data.values || [
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

4. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
5. העתיקו את כתובת ה-Web app
6. ב-Netlify, תחת Environment variables, שימו את הכתובת ב-`GOOGLE_SHEETS_WEBHOOK_URL`
7. Redeploy את האתר

| משתנה | מה זה |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | כתובת ה-Web app אחרי הפריסה על **הגיליון הזה** |
| `GOOGLE_SHEETS_ID` | אופציונלי. ברירת מחדל בקוד: `1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw` |

### גיליון Google — דרך מתקדמת (חשבון שירות)

רק אם אין webhook. צריך חשבון שירות ב-Google Cloud, שיתוף הגיליון למייל של החשבון (Editor), ואז:

| משתנה | מה זה |
|---|---|
| `GOOGLE_SHEETS_ID` | אופציונלי. ברירת מחדל בקוד: `1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | האימייל של חשבון השירות |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | המפתח הפרטי (עם `\n` לשורות חדשות) |
| `GOOGLE_SHEETS_RANGE` | אופציונלי, ברירת מחדל `A:E` |

---

## משתני צ'אט (קיימים)

- `OPENROUTER_API_KEY` (חובה)
- `OPENROUTER_MODEL` (אופציונלי)
- `OPENROUTER_FALLBACK_MODEL` (אופציונלי)
