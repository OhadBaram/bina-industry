import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { parseLeadPayload } from '../shared/leadConfig';
import { runLeadPipeline } from '../shared/leadPipeline';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function handleLead(
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
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const parsed = parseLeadPayload(payload);
  if (!parsed.ok) {
    sendJson(res, 400, { error: parsed.error });
    return;
  }

  try {
    const result = await runLeadPipeline(parsed.lead, env);
    sendJson(res, 200, {
      ok: true,
      timestampIsrael: result.timestampIsrael,
      classification: result.analysis.classification,
      analysis: result.analysis,
      lead: parsed.lead,
      channels: result.channels,
    });
  } catch (err) {
    console.error('[vite-lead] unhandled:', err instanceof Error ? err.message : err);
    sendJson(res, 200, {
      ok: true,
      accepted: true,
      channels: { ai: 'error', sheets: 'error', telegram: 'error', email: 'error' },
    });
  }
}

/** פרוקסי מקומי ל-/api/lead בזמן npm run dev */
export function leadDevPlugin(): Plugin {
  return {
    name: 'lead-intake-dev',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/api/lead') {
          next();
          return;
        }
        void handleLead(req, res, env);
      });
    },
  };
}
