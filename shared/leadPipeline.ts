import { createSign } from 'node:crypto';
import {
  OPENROUTER_URL,
  openRouterHeaders,
  type ChatMessage,
} from './chatConfig';
import {
  FALLBACK_ANALYSIS,
  DEFAULT_LEAD_NOTIFY_EMAIL,
  LEAD_AI_TIMEOUT_MS,
  LEAD_CHANNEL_TIMEOUT_MS,
  LEAD_SYSTEM_PROMPT,
  buildEmailBody,
  buildEmailSubject,
  buildTelegramMessage,
  formatIsraelTimestamp,
  parseLeadAnalysis,
  resolveLeadModels,
  type ChannelStatus,
  type LeadAnalysis,
  type LeadChannelResults,
  type LeadInput,
} from './leadConfig';

export interface LeadPipelineResult {
  ok: true;
  timestampIsrael: string;
  analysis: LeadAnalysis;
  channels: LeadChannelResults;
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; text: string }> {
  const res = await fetch(url, { ...init, signal: withTimeout(timeoutMs) });
  const text = await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, text };
}

function logChannel(name: string, status: ChannelStatus, detail?: string) {
  const extra = detail ? ` ${detail.slice(0, 180)}` : '';
  console.log(`[lead] ${name}: ${status}${extra}`);
}

export async function analyzeLead(
  apiKey: string,
  lead: LeadInput,
  env: Record<string, string | undefined>
): Promise<{ analysis: LeadAnalysis; ai: ChannelStatus }> {
  const userContent = [
    `שם הלקוח: ${lead.full_name}`,
    `טלפון: ${lead.phone}`,
    `אימייל: ${lead.email}`,
    `הודעה: ${lead.message || '(לא נמסר תוכן — ייתכן פתיחת תבניות באתר)'}`,
  ].join('\n');

  const messages: ChatMessage[] = [
    { role: 'system', content: LEAD_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];

  const models = resolveLeadModels(env);

  for (const model of models) {
    for (const useJsonFormat of [true, false]) {
      try {
        const body: Record<string, unknown> = {
          model,
          messages,
          stream: false,
          temperature: 0.2,
          max_tokens: 1200,
        };
        if (useJsonFormat) body.response_format = { type: 'json_object' };

        const result = await fetchJson(
          OPENROUTER_URL,
          {
            method: 'POST',
            headers: openRouterHeaders(apiKey),
            body: JSON.stringify(body),
          },
          LEAD_AI_TIMEOUT_MS
        );

        if (!result.ok) {
          console.error(`[lead] OpenRouter ${model} status ${result.status}`);
          continue;
        }

        const payload = JSON.parse(result.text) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = payload.choices?.[0]?.message?.content;
        const parsed = typeof content === 'string' ? parseLeadAnalysis(content) : null;
        if (parsed) {
          logChannel('ai', 'ok', model);
          return { analysis: parsed, ai: 'ok' };
        }
      } catch (err) {
        console.error(`[lead] OpenRouter ${model} error:`, err instanceof Error ? err.message : err);
      }
    }
  }

  logChannel('ai', 'error', 'fallback analysis used');
  const fallback: LeadAnalysis = {
    ...FALLBACK_ANALYSIS,
    summary: lead.message
      ? `פנייה חדשה מ-${lead.full_name}: ${lead.message.slice(0, 180)}`
      : FALLBACK_ANALYSIS.summary,
  };
  return { analysis: fallback, ai: 'error' };
}

async function appendViaWebhook(
  url: string,
  row: string[],
  lead: LeadInput,
  analysis: LeadAnalysis,
  timestamp: string
): Promise<ChannelStatus> {
  const result = await fetchJson(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        full_name: lead.full_name,
        phone: lead.phone,
        summary: analysis.summary,
        classification: analysis.classification,
        values: row,
      }),
    },
    LEAD_CHANNEL_TIMEOUT_MS
  );
  if (!result.ok) {
    logChannel('sheets', 'error', `webhook ${result.status}`);
    return 'error';
  }
  logChannel('sheets', 'ok', 'webhook');
  return 'ok';
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
}

function readServiceAccount(env: Record<string, string | undefined>): {
  email: string;
  privateKey: string;
} | null {
  const jsonRaw = env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { email: parsed.client_email, privateKey: normalizePrivateKey(parsed.private_key) };
      }
    } catch {
      console.error('[lead] GOOGLE_SERVICE_ACCOUNT_JSON אינו JSON תקין');
    }
  }
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ? normalizePrivateKey(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
    : '';
  if (email && privateKey) return { email, privateKey };
  return null;
}

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const jwt = `${unsigned}.${base64url(signer.sign(privateKey))}`;

  const result = await fetchJson(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    },
    LEAD_CHANNEL_TIMEOUT_MS
  );
  if (!result.ok) {
    throw new Error(`google token ${result.status}`);
  }
  const payload = JSON.parse(result.text) as { access_token?: string };
  if (!payload.access_token) throw new Error('google token missing');
  return payload.access_token;
}

async function appendViaSheetsApi(
  env: Record<string, string | undefined>,
  row: string[]
): Promise<ChannelStatus> {
  const sheetId = env.GOOGLE_SHEETS_ID?.trim();
  const account = readServiceAccount(env);
  if (!sheetId || !account) return 'skipped';

  const range = (env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:E').trim();
  const token = await getGoogleAccessToken(account.email, account.privateKey);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const result = await fetchJson(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ majorDimension: 'ROWS', values: [row] }),
    },
    LEAD_CHANNEL_TIMEOUT_MS
  );
  if (!result.ok) {
    logChannel('sheets', 'error', `api ${result.status}`);
    return 'error';
  }
  logChannel('sheets', 'ok', 'api');
  return 'ok';
}

async function sendSheets(
  env: Record<string, string | undefined>,
  lead: LeadInput,
  analysis: LeadAnalysis,
  timestamp: string
): Promise<ChannelStatus> {
  const row = [timestamp, lead.full_name, lead.phone, analysis.summary, analysis.classification];
  const webhook = env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  try {
    if (webhook) return await appendViaWebhook(webhook, row, lead, analysis, timestamp);
    return await appendViaSheetsApi(env, row);
  } catch (err) {
    logChannel('sheets', 'error', err instanceof Error ? err.message : 'unknown');
    return 'error';
  }
}

async function sendTelegram(
  env: Record<string, string | undefined>,
  lead: LeadInput,
  analysis: LeadAnalysis,
  timestamp: string
): Promise<ChannelStatus> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    logChannel('telegram', 'skipped');
    return 'skipped';
  }
  try {
    const result = await fetchJson(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildTelegramMessage(lead, analysis, timestamp),
        }),
      },
      LEAD_CHANNEL_TIMEOUT_MS
    );
    if (!result.ok) {
      logChannel('telegram', 'error', String(result.status));
      return 'error';
    }
    logChannel('telegram', 'ok');
    return 'ok';
  } catch (err) {
    logChannel('telegram', 'error', err instanceof Error ? err.message : 'unknown');
    return 'error';
  }
}

async function sendEmail(
  env: Record<string, string | undefined>,
  lead: LeadInput,
  analysis: LeadAnalysis,
  timestamp: string
): Promise<ChannelStatus> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.LEAD_NOTIFY_EMAIL?.trim() || DEFAULT_LEAD_NOTIFY_EMAIL;
  if (!apiKey) {
    logChannel('email', 'skipped', 'RESEND_API_KEY missing');
    return 'skipped';
  }
  const from = (env.LEAD_EMAIL_FROM || 'בינה לתעשייה <onboarding@resend.dev>').trim();
  try {
    const result = await fetchJson(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: buildEmailSubject(lead, analysis),
          text: buildEmailBody(lead, analysis, timestamp),
        }),
      },
      LEAD_CHANNEL_TIMEOUT_MS
    );
    if (!result.ok) {
      logChannel('email', 'error', String(result.status));
      return 'error';
    }
    logChannel('email', 'ok');
    return 'ok';
  } catch (err) {
    logChannel('email', 'error', err instanceof Error ? err.message : 'unknown');
    return 'error';
  }
}

export async function runLeadPipeline(
  lead: LeadInput,
  env: Record<string, string | undefined>
): Promise<LeadPipelineResult> {
  const timestampIsrael = formatIsraelTimestamp(lead.created_at);
  const apiKey = env.OPENROUTER_API_KEY?.trim();

  let analysis = FALLBACK_ANALYSIS;
  let ai: ChannelStatus = 'skipped';
  if (apiKey) {
    const result = await analyzeLead(apiKey, lead, env);
    analysis = result.analysis;
    ai = result.ai;
  } else {
    logChannel('ai', 'skipped', 'OPENROUTER_API_KEY missing');
    analysis = {
      ...FALLBACK_ANALYSIS,
      summary: lead.message
        ? `פנייה חדשה מ-${lead.full_name}: ${lead.message.slice(0, 180)}`
        : FALLBACK_ANALYSIS.summary,
    };
  }

  const [sheets, telegram, email] = await Promise.all([
    sendSheets(env, lead, analysis, timestampIsrael),
    sendTelegram(env, lead, analysis, timestampIsrael),
    sendEmail(env, lead, analysis, timestampIsrael),
  ]);

  return {
    ok: true,
    timestampIsrael,
    analysis,
    channels: { sheets, telegram, email, ai },
  };
}
