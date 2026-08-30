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

**חשוב:** אין לשדרג Zapier. כבו את ה-Zap הישן והשאירו אותו כבוי — `/api/lead` מחליף אותו (כולל שלב הפייתון לשעון ישראל).

---

## משתני סביבה להגדיר ב-Netlify (לבן)

לא שמים מפתחות בקוד ולא בגיט. רק במסך Environment variables של Netlify, ואז Redeploy.

### חובה לצ'אט ולניתוח AI

| משתנה | מה זה |
|---|---|
| `OPENROUTER_API_KEY` | המפתח מ-openrouter.ai (כבר בשימוש בצ'אט) |
| `OPENROUTER_LEAD_MODEL` | אופציונלי. ברירת מחדל: `deepseek/deepseek-chat` |

### טלגרם (התראה מיידית)

הבוט הקיים: `bina_lead_123_bot` (Bina Leads Bot).

מזהה הצ'אט כבר מקודד בפרויקט (הצ'אט הפרטי של אוהד ברעם) — אין צורך להגדיר אותו ב-Netlify:

`1082547513`

מה שחסר ב-Netlify הוא **רק** טוקן הבוט (`TELEGRAM_BOT_TOKEN`). הטוקן סודי — לא מקודדים אותו בקוד ולא בגיט.

איך להשיג את הטוקן לבוט הקיים (אם עדיין יש גישה ב-BotFather):

1. בטלגרם חפשו `@BotFather` ופתחו שיחה
2. שלחו `/mybots`
3. בחרו את `bina_lead_123_bot`
4. לחצו API Token
5. העתיקו את הטוקן
6. ב-Netlify, תחת Environment variables, שימו אותו ב-`TELEGRAM_BOT_TOKEN`
7. Redeploy את האתר

אם אין גישה לבוט ב-BotFather, צריך שהחשבון שיצר את `bina_lead_123_bot` יפתח את אותו מסך ויעתיק את הטוקן.

| משתנה | מה זה |
|---|---|
| `TELEGRAM_BOT_TOKEN` | הטוקן מ-BotFather לבוט `bina_lead_123_bot`. **חובה** לשליחת התראות. |
| `TELEGRAM_CHAT_ID` | אופציונלי. ברירת מחדל בקוד: `1082547513` |

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

מיפוי עמודות כמו בזאפ (גיליון **לידים נכנסים**, לשונית **גיליון1**):

| עמודה | כותרת | מה נכתב |
|---|---|---|
| A | תאריך | שעת ישראל `DD.MM.YYYY HH:mm:ss` (למשל `14.08.2026 08:48:31`) |
| B | שם | שם מלא |
| C | טלפון | טלפון |
| D | הערה | סיכום AI (`summary`) — **לא** הודעת הלקוח הגולמית |
| E | תשובת AI | סיווג (`classification`, למשל Lead / Complaint) |

השעה מחושבת ב-`Asia/Jerusalem` (כולל שעון קיץ), לא בהזזה גולמית של +3. זה מחליף את שלב הפייתון בזאפ.

1. פתחו **את הגיליון הזה** (הקישור למעלה)
2. בתפריט: Extensions → Apps Script
3. מחקו את התוכן הקיים והדביקו את הסקריפט הבא:

```javascript
var DEFAULT_SPREADSHEET_ID = '1S9Oh1EkOWEW1M6zvu5G0hD7y_53jXabepHOv4at4qLw';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ready: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById(data.spreadsheetId || DEFAULT_SPREADSHEET_ID);
    }
    var sheet = ss.getSheetByName('גיליון1') || ss.getSheets()[0];
    // A תאריך, B שם, C טלפון, D הערה (= סיכום AI), E תשובת AI (= סיווג)
    sheet.appendRow([
      data.timestamp || '',
      data.full_name || '',
      data.phone || '',
      data.summary || '',
      data.classification || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **חובה:** Deploy → **New deployment** → Web app (אחרי כל שינוי בקוד — שמירה בלבד לא מספיקה)
   - Execute as: Me
   - Who has access: Anyone
5. העתיקו את כתובת ה-Web app — חייבת להיראות כמו `https://script.google.com/macros/s/.../exec`
   - לא קישור `docs.google.com`
   - לא כתובת שמסתיימת ב-`/dev`
6. בדיקה מהירה: פתחו את כתובת ה-`/exec` בדפדפן — אמור להופיע `{"ok":true,"ready":true}`
7. ב-Netlify, שימו את הכתובת ב-`GOOGLE_SHEETS_WEBHOOK_URL` ואז Redeploy

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
