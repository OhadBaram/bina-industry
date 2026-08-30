import type { Context } from '@netlify/functions';
import { parseLeadPayload } from '../../shared/leadConfig';
import { runLeadPipeline } from '../../shared/leadPipeline';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const parsed = parseLeadPayload(payload);
  if (!parsed.ok) {
    return jsonResponse(400, { error: parsed.error });
  }

  try {
    const result = await runLeadPipeline(parsed.lead, process.env);
    return jsonResponse(200, {
      ok: true,
      timestampIsrael: result.timestampIsrael,
      classification: result.analysis.classification,
      channels: result.channels,
    });
  } catch (err) {
    console.error('[lead] unhandled:', err instanceof Error ? err.message : err);
    // הפנייה התקבלה — לא שוברים את חוויית הטופס גם אם האוטומציה נכשלה
    return jsonResponse(200, {
      ok: true,
      accepted: true,
      channels: { ai: 'error', sheets: 'error', telegram: 'error', email: 'error' },
    });
  }
};

export const config = {
  path: '/api/lead',
};
