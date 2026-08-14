import { Category, Prompt } from '../types';

// שם הקבוצה שיופיע בכותרת
export const SITE_TITLE = "ספריית 1,000 הפרומפטים";

export const CATEGORIES: Category[] = [
  { id: 'advertising', name: 'פרסום ושיווק', icon: '📢', subCategories: ['קופירייטינג', 'עיצוב גרפי', 'מודעות סושיאל', 'אסטרטגיה', 'אנליטיקס', 'PPC', 'נייטיב', 'משפיענים', 'וידאו', 'אתיקה'] },
  { id: 'content_creation', name: 'יצירת תוכן', icon: '✍️', subCategories: ['כתיבה ועריכה', 'תוכן ויזואלי', 'הפקת וידאו', 'פודקאסטים', 'אסטרטגיית תוכן', 'SEO', 'סושיאל', 'אנליטיקס', 'מיחזור תוכן', 'שיווק תוכן'] },
  { id: 'copywriting', name: 'קופירייטינג', icon: '📝', subCategories: ['כותרות', 'מודעות', 'שיווק ישיר', 'קופי לאתרים', 'קופי SEO', 'אימייל', 'מכתבי מכירה', 'נוסחאות', 'עריכה', 'תעשיות'] },
  { id: 'creative_writing', name: 'כתיבה יוצרת', icon: '🎨', subCategories: ['פיקשן', 'שירה', 'נון-פיקשן', 'תסריטאות', 'סיפורים קצרים', 'ממואר', 'בניית עולם', 'דיאלוג', 'ז׳אנרים', 'תרגילי'] },
  { id: 'ecommerce', name: 'אי-קומרס', icon: '🛒', subCategories: ['פלטפורמות', 'עיצוב ו-UX', 'ניהול מלאי', 'תשלומים', 'משלוחים', 'שיווק', 'שירות לקוחות', 'מיסוי', 'בינלאומי', 'אנליטיקס'] },
  { id: 'editing', name: 'עריכה והגהה', icon: '🔍', subCategories: ['דקדוק', 'כתיב', 'מבנה משפט', 'עקביות', 'פירמוט', 'טכניקות הגהה', 'תמציתיות', 'טון וקול', 'ביקורת עמיתים', 'כלים'] },
  { id: 'goal_setting', name: 'הצבת יעדים', icon: '🎯', subCategories: ['יעדי SMART', 'טווח ארוך', 'טווח קצר', 'ויזואליזציה', 'מכשולים', 'אחריותיות', 'דיוק יעדים', 'צוותים', 'וולנס', 'יצירתיים'] },
  { id: 'graphic_design', name: 'עיצוב גרפי', icon: '🖌️', subCategories: ['עקרונות', 'טיפוגרפיה', 'תורת הצבע', 'לוגו', 'דפוס', 'דיגיטל', 'תוכנות', 'מיתוג', 'ביקורת', 'השראה'] },
  { id: 'personal_finance', name: 'פיננסים אישיים', icon: '💰', subCategories: ['תקציב', 'חיסכון', 'חובות', 'אשראי', 'פרישה', 'מיסים', 'ביטוח', 'נדל"ן', 'לימודים', 'ירושה'] },
  { id: 'personal_growth', name: 'צמיחה אישית', icon: '🌱', subCategories: ['יעדים', 'ניהול זמן', 'אינטליגנציה רגשית', 'לחצים', 'תקשורת', 'ביטחון עצמי', 'מיינדפולנס', 'הרגלים', 'איזון', 'חוסן'] },
  { id: 'persuasion', name: 'שכנוע והשפעה', icon: '🤝', subCategories: ['כימיה', 'תקשורת', 'סטוריטלינג', 'הקשבה', 'שפת גוף', 'רגש', 'לוגיקה', 'מסגור', 'התנגדויות', 'אתיקה'] },
  { id: 'social_media', name: 'ניהול סושיאל', icon: '📱', subCategories: ['יצירת תוכן', 'אסטרטגיה', 'אנליטיקס', 'פרסום', 'פלטפורמות', 'קהילה', 'אוטומציה', 'משפיענים', 'מוניטין', 'ניהול משברים'] }
];

export const ALL_PROMPTS: Record<string, Prompt[]> = {
  advertising: [
    { id: 'av-copy-1', title: 'הדגשת יתרונות המוצר', explanation: 'התמקדות בתועלות המרכזיות למשיכת הקהל.', text: 'תאר את היתרונות והתכונות המרכזיים של [שם המוצר/שירות] בצורה שתשבה את הקהל ב-[פלטפורמה]. שלב קריאה לפעולה (CTA) חזקה שמעודדת לקוחות פוטנציאליים לבצע את הצעד הבא.', subCategory: 'קופירייטינג', createdAt: Date.now() },
    { id: 'av-copy-2', title: 'קהל יעד וכאבים', explanation: 'פנייה ישירה לצרכים ולבעיות של הלקוח.', text: 'כתוב טקסט משכנע למודעה ב-[פלטפורמה] שפונה ישירות לנקודות הכאב והרצונות של [קהל היעד], ומצב את [שם המוצר] כפתרון האולטימטיבי.', subCategory: 'קופירייטינג', createdAt: Date.now() },
    { id: 'av-copy-3', title: 'הצעת מכירה ייחודית (USP)', explanation: 'בידול המוצר מהמתחרים.', text: 'צור טקסט למודעה ב-[פלטפורמה] המדגיש את הצעת המכירה הייחודית (USP) של [שם המוצר], מבדיל אותו מהמתחרים.', subCategory: 'קופירייטינג', createdAt: Date.now() },
    { id: 'av-sg-1', title: 'מטרות עיצוב ופריסה', explanation: 'עקרונות לפריסה אפקטיבית.', text: 'ספק הנחיות לגבי טכניקות פריסה (Layout) ועקרונות עיצוב ליצירת מודעה אפקטיבית עבור [שם המוצר] ב-[פלטפורמה].', subCategory: 'עיצוב גרפי', createdAt: Date.now() }
  ],
  content_creation: [
    { id: 'o-wr-1', title: 'טכניקות כתיבה אפקטיביות', explanation: 'שיפור סגנון, מבנה וטון.', text: 'שתף טיפים ואסטרטגיות ליצירת תוכן כתוב מרתק, כולל התייחסות לסגנונות כתיבה, מבנה משפטים וטון דיבור.', subCategory: 'כתיבה ועריכה', createdAt: Date.now() },
    { id: 'o-v-1', title: 'תכנון וידאו וכתיבת תסריט', explanation: 'יצירת תוכן מרתק.', text: 'הצע הנחיות לתכנון וכתיבת תסריט עבור תוכן וידאו מרתק.', subCategory: 'הפקת וידאו', createdAt: Date.now() }
  ],
  copywriting: [
    { id: 'opy-ha-1', title: 'כותרות תופסות תשומת לב', explanation: 'איך לגרום לקורא לעצור.', text: 'שתף את הטיפים והטריקים הטובים ביותר ליצירת כותרות שתופסות את תשומת הלב של הקוראים.', subCategory: 'כותרות', createdAt: Date.now() },
    { id: 'opy-form-1', title: 'מבוא לנוסחאות', explanation: 'סקירה של AIDA, PAS, FAB.', text: 'תן סקירה כללית של נוסחאות מוכרות כמו AIDA, PAS ו-FAB.', subCategory: 'נוסחאות כתיבה', createdAt: Date.now() }
  ],
  goal_setting: [
    { id: 'goal-smar-1', title: 'הגדרת יעד ספציפי', explanation: 'חידוד ה"מה".', text: 'עזור לי לחדד את המטרה הכללית שלי: [הכנס מטרה], ולהפוך אותה ליעד ספציפי וברור בשיטת SMART.', subCategory: 'יעדי SMART', createdAt: Date.now() }
  ],
  social_media: [
    { id: 'sm-create-1', title: 'הוקים (Hooks) ויראליים', explanation: 'לתפוס את תשומת הלב בשנייה הראשונה.', text: 'צור 5 רעיונות ל"הוקים" (פתיחים) לסרטוני TikTok או Reels בנושא [נושא], שיגרמו לצופה להפסיק לגלול מיד.', subCategory: 'יצירת תוכן', createdAt: Date.now() }
  ],
  personal_growth: [
    { id: 'pg-m-1', title: 'תעדוף משימות', explanation: 'מטריצת אייזנהאואר.', text: 'השתמש במטריצת אייזנהאואר כדי לעזור לי לתעדף את רשימת המשימות הבאה שלי: [הכנס משימות].', subCategory: 'ניהול זמן', createdAt: Date.now() }
  ],
  persuasion: [
    { id: 'pr-rap-1', title: 'יצירת כימיה מיידית', explanation: 'חיבור מהיר עם אנשים.', text: 'שתף טכניקות ליצירת כימיה (Rapport) מהירה עם לקוחות או קולגות חדשים במהלך פגישה ראשונה.', subCategory: 'יצירת כימיה (Rapport)', createdAt: Date.now() }
  ]
};

// Simulated remaining 1000 prompts logic
const fillRemaining = () => {
  const target = 1000;
  let current = 0;
  Object.values(ALL_PROMPTS).forEach(arr => current += arr.length);
  const remaining = target - current;
  const categories = CATEGORIES.map(c => c.id);
  const perCat = Math.floor(remaining / categories.length);

  categories.forEach(catId => {
    const cat = CATEGORIES.find(c => c.id === catId)!;
    if (!ALL_PROMPTS[catId]) ALL_PROMPTS[catId] = [];
    for (let i = 0; i < perCat; i++) {
      const sub = cat.subCategories[i % cat.subCategories.length];
      ALL_PROMPTS[catId].push({
        id: `${catId}-gen-${ALL_PROMPTS[catId].length + 1}`,
        title: `פרומפט מורחב ל${cat.name}: ${sub} #${ALL_PROMPTS[catId].length + 1}`,
        explanation: `פרומפט מקצועי שנוצר עבור ${sub}.`,
        text: `אתה יועץ מומחה בתחום ה${cat.name}. בצע אופטימיזציה ל[משימה] תוך שימוש בשיטות ה${sub} המתקדמות ביותר.`,
        subCategory: sub,
        createdAt: Date.now()
      });
    }
  });
};

fillRemaining();