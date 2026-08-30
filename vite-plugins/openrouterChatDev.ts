import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import {
  LOCALIZED_FALLBACK_REPLY,
  OPENROUTER_URL,
  buildCompletionBody,
  buildMessages,
  openRouterHeaders,
  resolveModels,
  sanitizeClientMessages,
} from '../shared/chatConfig';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleChat(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: 'OPENROUTER_API_KEY missing',
        message: LOCALIZED_FALLBACK_REPLY,
      })
    );
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const history = sanitizeClientMessages(
    (payload as { messages?: unknown })?.messages
  );
  if (history.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'messages required' }));
    return;
  }

  const messages = buildMessages(history);
  const models = resolveModels(env);

  for (const model of models) {
    try {
      const upstream = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: openRouterHeaders(apiKey),
        body: JSON.stringify(buildCompletionBody(model, messages)),
      });

      if (!upstream.ok || !upstream.body) {
        console.error(`[vite-chat] ${model} failed:`, upstream.status);
        continue;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-OpenRouter-Model', model);

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
      return;
    } catch (err) {
      console.error(`[vite-chat] ${model} error:`, err);
    }
  }

  // גיבוי SSE מקומי
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  const payloadChunk = {
    choices: [{ delta: { content: LOCALIZED_FALLBACK_REPLY } }],
  };
  res.write(`data: ${JSON.stringify(payloadChunk)}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
}

/** פרוקסי סטרימינג מקומי ל-/api/chat (עקיפת מגבלות netlify dev על SSE) */
export function openrouterChatDevPlugin(): Plugin {
  return {
    name: 'openrouter-chat-dev',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/api/chat') {
          next();
          return;
        }
        void handleChat(req, res, env).catch((err) => {
          console.error('[vite-chat] unhandled:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Internal error', message: LOCALIZED_FALLBACK_REPLY }));
          } else {
            res.end();
          }
        });
      });
    },
  };
}
