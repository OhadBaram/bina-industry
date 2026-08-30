import type { Context } from '@netlify/functions';
import {
  LOCALIZED_FALLBACK_REPLY,
  OPENROUTER_URL,
  buildCompletionBody,
  buildMessages,
  openRouterHeaders,
  resolveModels,
  sanitizeClientMessages,
} from '../../shared/chatConfig';

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

function sseStaticReply(text: string): Response {
  const encoder = new TextEncoder();
  const payload = {
    id: 'fallback',
    object: 'chat.completion.chunk',
    choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
  };
  const done = {
    id: 'fallback',
    object: 'chat.completion.chunk',
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
  };
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

async function tryOpenRouterStream(
  apiKey: string,
  model: string,
  messages: ReturnType<typeof buildMessages>
): Promise<Response | null> {
  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify(buildCompletionBody(model, messages)),
    });

    if (!upstream.ok || !upstream.body) {
      console.error(`[chat] OpenRouter ${model} failed:`, upstream.status, await upstream.text().catch(() => ''));
      return null;
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-OpenRouter-Model': model,
      },
    });
  } catch (err) {
    console.error(`[chat] OpenRouter ${model} error:`, err);
    return null;
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse(500, {
      error: 'OPENROUTER_API_KEY missing',
      message: LOCALIZED_FALLBACK_REPLY,
    });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const history = sanitizeClientMessages(
    (payload as { messages?: unknown })?.messages
  );
  if (history.length === 0) {
    return jsonResponse(400, { error: 'messages required' });
  }

  const messages = buildMessages(history);
  const models = resolveModels(process.env);

  for (const model of models) {
    const streamed = await tryOpenRouterStream(apiKey, model, messages);
    if (streamed) return streamed;
  }

  // כל המודלים נכשלו — תשובת גיבוי מקומית ב-SSE כדי שה-UI יישאר עקבי
  return sseStaticReply(LOCALIZED_FALLBACK_REPLY);
};

export const config = {
  path: '/api/chat',
};
