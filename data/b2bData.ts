import { B2BService, PainPointItem, UseCase, B2BPrompt } from '../types';

export interface CapabilityItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  desc: string;
  features: string[];
  badge: string;
}

export interface MethodologyStep {
  stepNum: string;
  title: string;
  shortDesc: string;
  details: string;
  icon: string;
}

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'product-leadership',
    title: 'ניהול מוצר ואסטרטגיה',
    subtitle: 'Product Leadership',
    icon: '🎯',
    desc: 'הובלת תהליכי Discovery, אפיונים עמוקים, בניית מפות דרכים (Roadmaps) ותיעדוף דרישות מבוסס ערך עסקי.',
    features: [
      'הגדרת חזון מוצר ותרגומו לתוכנית עבודה אופרטיבית',
      'אפיון תהליכים, דרישות PRD וממשקי משתמש (UX/UI)',
      'תיעדוף משימות לפי ROI, אימפולס עסקי ואימפקט',
      'סנכרון מלא בין יעדי ההנהלה לצוותי הפיתוח'
    ],
    badge: 'אסטרטגיה ומוצר'
  },
  {
    id: 'digital-transformation',
    title: 'טרנספורמציה דיגיטלית ומודרניזציה',
    subtitle: 'Digital Transformation & Modernization',
    icon: '☁️',
    desc: 'ליווי תהליכי שדרוג מערכות מורכבות, ארכיטקטורת ענן, ממשקים ואינטגרציות פלטפורמה רחבות.',
    features: [
      'מודרניזציה של מערכות ליבה וסביבות עבודה ארגוניות',
      'תכנון ארכיטקטורת מידע, ענן ואינטגרציות פלטפורמה',
      'ניהול סיכונים ומעבר חלק ממערכות מורכבות',
      'שיפור חוויית משתמש ואימוץ טכנולוגי בקרב העובדים'
    ],
    badge: 'טרנספורמציה'
  },
  {
    id: 'ai-automation',
    title: 'שילוב פתרונות בינה מלאכותית',
    subtitle: 'AI & Business Automation',
    icon: '🤖',
    desc: 'איתור Use Cases ארגוניים, הטמעת סוכנים אוטונומיים, סיווג מידע ואוטומציה של תהליכי עבודה.',
    features: [
      'זיהוי הזדמנויות יישומיות לבינה מלאכותית בארגון',
      'בניית סוכני AI חכמים, צ\'אטבוטים מבוססי ידע ואינטגרציות API',
      'אוטומציה מלאה של משימות רוטיניות וניהול מסמכים',
      'הפיכת דאטה ארגוני לתובנות אופרטיביות בזמן אמת'
    ],
    badge: 'חדשנות ו-AI'
  }
];

export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    stepNum: '01',
    title: 'אבחון ומיפוי',
    shortDesc: 'מיפוי תהליכים וזיהוי ROI',
    details: 'ניתוח תהליכי העבודה הקיימים וזיהוי המקומות שבהם AI יביא את החזר ההשקעה (ROI) הגבוה ביותר.',
    icon: '🔍'
  },
  {
    stepNum: '02',
    title: 'אפיון ארכיטקטורה ומיפוי מערכתי (System Blueprint)',
    shortDesc: 'מיפוי נקודות קצה ותכנון תשתיות',
    details: 'רוב פרויקטי ה-AI נכשלים כי מחברים כלים באקראי. אני מאפיין תשתית מלאה ברמת Technical Product Management: מיפוי כל נקודת קצה (Endpoint), תכנון נתיבי המידע בין המחלקות, בחירת המודל האופטימלי לכל משימה והגדרת תרחישי קצה. בונה נכון מהיסוד, כדי שלא תצטרכו לתקן בעוד חודשיים.',
    icon: '📐'
  },
  {
    stepNum: '03',
    title: 'הכשרת ההון האנושי',
    shortDesc: 'סדנאות עומק ואימוץ כלים',
    details: 'סדנאות עומק לצוותים כדי להבטיח אימוץ מלא של הכלים ללא התנגדויות.',
    icon: '⚙️'
  },
  {
    stepNum: '04',
    title: 'הטמעה, מדידה ובקרה',
    shortDesc: 'חיבור בשטח ודיוק שוטף',
    details: 'חיבור המערכות בשטח, מעקב אחר ביצועים ודיוק שוטף עד להשגת תוצאות מלאות.',
    icon: '📈'
  }
];

export const B2B_SERVICES: B2BService[] = [
  {
    id: 'agents',
    num: '01',
    serviceKey: 'ai',
    badge: 'ENTERPRISE AI — CUSTOM AGENTS',
    subtitle: 'סוכני AI מותאמים אישית (Custom AI Agents)',
    title: 'אפיון ופיתוח סוכנים חכמים על בסיס הידע הארגוני',
    icon: '🤖',
    shortDesc: 'פיתוח סוכנים אוטונומיים שמחוברים ישירות למסמכי החברה, מאגרי המידע וה-CRM. הסוכנים מייצרים ניתוחי דאטה, סיכומי דוחות, מחקרים ומענה מדויק ללא שגיאות וללא דליפת מידע.',
    features: [
      'חיבור אוטונומי למסמכים, מאגרי מידע ו-CRM',
      'ניתוח דאטה, סיכומי דוחות ומחקרים בזמן אמת',
      'מענה מדויק ומאובטח ללא שגיאות',
      'התאמה מלאה לתהליכי העבודה בארגון'
    ],
    techBadges: ['RAG Architecture', 'Private Data', 'Zero Retention'],
    ctaText: 'לתיאום פגישת אבחון בנושא סוכני AI'
  },
  {
    id: 'workshops',
    num: '02',
    serviceKey: 'workshops',
    badge: 'WORKSHOPS — HANDS-ON',
    subtitle: 'הדרכות עומק וסדנאות Hands-on',
    title: 'הכשרת מנהלים וצוותים לעבודה יומיומית עם AI',
    icon: '🎓',
    shortDesc: 'סדנאות מעשיות ממוקדות תפקיד (הנהלה, שיווק, תפעול, כספים). לומדים הנדסת פרומפטים מתקדמת, עבודה עם Claude, ChatGPT ו-Gemini, ותרגול ישיר על משימות אמיתיות מהעסק.',
    features: [
      'סילבוס ייעודי לפי מחלקות החברה',
      'תרגול מעשי על משימות אמת של הארגון',
      'הנדסת פרומפטים מתקדמת עם Claude, ChatGPT ו-Gemini',
      'הטמעה אנושית עמוקה ללא התנגדויות'
    ],
    techBadges: ['סילבוס ייעודי לפי מחלקות החברה', 'Claude & ChatGPT & Gemini'],
    ctaText: 'לפרטים על סדנאות והכשרות'
  },
  {
    id: 'automation',
    num: '03',
    serviceKey: 'transformation',
    badge: '03 // ENTERPRISE DATA & APIS',
    subtitle: 'ארכיטקטורת נתונים, סוכנים ואינטגרציות עומק',
    title: 'הופכים מודלי AI למערכות ליבה תפעוליות, לא לעוד "תוסף" שביר',
    icon: '⚡',
    shortDesc: 'תכנון הנדסי של זרימות עבודה מורכבות, חיבור מאגרי ידע ארגוניים ואוטומציה יציבה שעומדת בעומסים אמיתיים.',
    features: [
      'אינטגרציית APIs ישירה: חיבור דו-כיווני מאובטח בין מודלי שפה, מערכות ERP, מסדי נתונים ו-CRMs, ללא תלות בכלים מוגבלים.',
      'חסינות תקלות (Fault Tolerance): תכנון מלא של מנגנוני טיפול בשגיאות (Error Handling), אימות קלטים (Schema Validation) וניטור רציף.',
      'אבטחה בסטנדרט ארגוני: עבודה בסביבות מבודדות, מודלים מקומיים (Local/Private VPC) ומדיניות מוחלטת של אי-שמירת היסטוריה (Zero Data Retention).'
    ],
    techBadges: ['API Direct Integration', 'Fault Tolerance', 'Schema Validation'],
    ctaText: 'לייעוץ בנושאי אוטומציה תפעולית'
  },
  {
    id: 'security',
    num: '04',
    serviceKey: 'product',
    badge: 'SECURITY FIRST — PRIVACY',
    subtitle: 'אבטחת מידע ופרטיות (Security First)',
    title: 'עבודה בסביבות סגורות ומאובטחות',
    icon: '🛡️',
    shortDesc: 'התאמת פתרונות העומדים בדרישות אבטחת מידע מחמירות, שמבטיחות שהדאטה הרגיש של הארגון אינו משמש לאימון מודלים ציבוריים.',
    features: [
      'אפשרות לפריסת מודלים מקומיים (Local LLMs)',
      'הגנה מוחלטת על דאטה רגיש וסודות מסחריים',
      'עמידה בתקני אבטחת מידע מחמירים',
      'מניעת אימון מודלים ציבוריים על המידע'
    ],
    techBadges: ['Local LLMs', 'SOC-2 Ready', 'Data Privacy'],
    ctaText: 'לפרטים על אבטחת מידע וסביבות סגורות'
  }
];

export const PAIN_POINTS: PainPointItem[] = [
  {
    id: 'p1',
    problem: 'חברות קונות מנויים ל-ChatGPT או מחברות תוספים בסיסיים, אבל העובדים לא משתמשים, התהליכים לא מתחברים, וההשקעה יורדת לטמיון.',
    solution: 'שילוב בין הכשרה אנושית עמוקה לבין ארכיטקטורת מערכות יציבה. אנחנו לא עוזבים עד שהכלים עובדים בחיי היום-יום של הצוות.'
  }
];

export const USE_CASES: UseCase[] = [
  {
    id: 'uc1',
    title: 'תרחיש תעשייתי וסוכני AI',
    subtitle: 'מפניית לקוח/מסמך ➔ סוכן AI מנתח ➔ עדכון CRM/ERP ותגובה',
    badge: 'ארגונים ותעשייה',
    steps: [
      { num: '01', title: 'קליטת פנייה / מסמך', desc: 'מסמך או פניית מורכבת מתקבלת במערכות הארגון' },
      { num: '02', title: 'ניתוח סוכן AI (RAG)', desc: 'סוכן AI מנתח את הדאטה מול מאגרי המידע וה-CRM' },
      { num: '03', title: 'עדכון ERP ואינטגרציות', desc: 'הנתונים מוזרמים אוטומטית למערכות הליבה' },
      { num: '04', title: 'הפקת פלט / מענה', desc: 'הפקת דוח, הצעת מחיר או מענה מאובטח בפרטיות מלאה' }
    ],
    timeSaved: 'עשרות שעות בחודש'
  }
];

export const B2B_PROMPT_CATEGORIES = [
  { id: 'b2b_marketing', name: 'שיווק', icon: '📢' },
  { id: 'b2b_sales', name: 'מכירות', icon: '💼' },
  { id: 'b2b_service', name: 'שירות', icon: '🎧' },
  { id: 'b2b_operations', name: 'ניהול משימות ותפעול', icon: '📊' }
];

export const B2B_PROMPTS: B2BPrompt[] = [
  {
    id: 'b2b-p1',
    title: 'אפיון הצעת ערך עסקית (B2B Value Proposition)',
    explanation: 'ניסוח הצעת ערך ממוקדת תוצאה וחיסכון בעלויות עבור לקוחות B2B.',
    text: 'אתה יועץ אסטרטגי לחברות B2B. בנה עבור [שם המוצר/שירות] הצעת ערך חד משמעית המיועדת ל-[תפקיד מקבל ההחלטות]. התמקד ב-3 צירים: חיסכון בזמן, הגדלת הכנסות וצמצום סיכונים. כולל 3 דוגמאות למסרים שיווקיים.',
    category: 'b2b_marketing',
    subCategory: 'שיווק',
    isPremium: false,
    createdAt: Date.now()
  },
  {
    id: 'b2b-p2',
    title: 'תסריט שיחת אפיון ומכירה מבוסס ערך',
    explanation: 'תסריט שיחה מוביל לזיהוי צרכים, טיפול בהתנגדויות וסגירת פגישה.',
    text: 'צור תסריט שיחת אפיון עבור נציג מכירות בחברת [שם החברה] הפונה ל-[סוג העסק]. התסריט כולל 5 שאלות אבחון עמוקות לזיהוי צווארי בקבוק בתהליכי העבודה, וטכניקת מענה להתנגדות "זה יקר לנו / אין לנו זמן כרגע".',
    category: 'b2b_sales',
    subCategory: 'מכירות',
    isPremium: false,
    createdAt: Date.now()
  },
  {
    id: 'b2b-p3',
    title: 'תבנית AI לסיווג וטיוב לידים נכנסים (Lead Scoring)',
    explanation: 'פרומפט להטמעה בבוט/אוטומציה המנתח פנייה ומדרג את הליד מאחד עד עשר.',
    text: 'אתה אנליסט לידים אוטומטי. קבל את פרטי הפנייה הבאה: [הכנס פרטי פנייה]. נתח את גודל החברה, דחיפות הבקשה והתקציב המשוער. החזר פלט במבנה JSON עם הדירוג (1-10), סיכום קצר, והמלצה על הצעד הבא (שיחה דחופה / סדרת אימיילים / לא רלוונטי).',
    category: 'b2b_sales',
    subCategory: 'מכירות',
    isPremium: true,
    createdAt: Date.now()
  },
  {
    id: 'b2b-p4',
    title: 'מאגר תשובות אוטומטי לשאלות נפוצות (FAQ Bot Prompt)',
    explanation: 'הוראות מערכת (System Instructions) לצ\'אטבוט תמיכה ושירות לקוחות.',
    text: 'פעל כסוכן שירות לקוחות מקצועי של חברת [שם החברה]. השתמש במאגר המידע הבא [הכנס מידע]. ענה באדיבות, בבהירות ובקצרה. במידה והשאלה אינה מופיעה במאגר, בקש מהלקוח להשאיר מספר טלפון והבטח שנציג יחזור אליו.',
    category: 'b2b_service',
    subCategory: 'שירות',
    isPremium: true,
    createdAt: Date.now()
  },
  {
    id: 'b2b-p5',
    title: 'סיכום ישיבה וחילוץ משימות אוטומטי מזום / תזכיר קולי',
    explanation: 'פרומפט שהופך תמלול שיחה לרשימת משימות ואחראיים תוך שניות.',
    text: 'קבל את התמלול הבא מתוך שיחת עבודה: [הכנס תמלול]. חלץ: 1. החלטות מרכזיות שהתקבלו. 2. טבלת משימות הכוללת: שם המשימה, אחראי לביצוע, ותאריך יעד. 3. ניסוח אימייל סיכום קצר לשליחה לכל משתתפי השיחה.',
    category: 'b2b_operations',
    subCategory: 'ניהול משימות ותפעול',
    isPremium: true,
    createdAt: Date.now()
  },
  {
    id: 'b2b-p6',
    title: 'מכונת אימיילים להחייאת לידים קרים (Re-engagement Sequence)',
    explanation: 'סדרת 3 מיילים קצרים ומניעים לפעולה ללקוחות שעצרו בתהליך.',
    text: 'כתוב סדרת 3 אימיילים ממוקדים מיועדת לבעלי עסקים שהתעניינו באוטומציה/שירות לפני חודשיים ולא סגרו. מייל 1: ערך מוסף חינמי. מייל 2: סיפור הצלחה קצר. מייל 3: הצעת אפיון מוגבלת בזמן.',
    category: 'b2b_marketing',
    subCategory: 'שיווק',
    isPremium: true,
    createdAt: Date.now()
  }
];
