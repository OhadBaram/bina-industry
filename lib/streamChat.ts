import type { ChatMessage } from '../shared/chatConfig';

export type StreamChatHandlers = {
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

/**
 * קורא ל-/api/chat ומפרסר SSE בסגנון OpenAI/OpenRouter.
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  handlers: StreamChatHandlers,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    let message = 'שגיאה בתקשורת עם השרת. נסו שוב בעוד רגע.';
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } catch {
      /* ignore */
    }
    handlers.onError?.(message);
    return;
  }

  if (!res.body) {
    handlers.onError?.('תשובה ריקה מהשרת.');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
          error?: { message?: string };
        };
        if (parsed.error?.message) {
          handlers.onError?.(parsed.error.message);
          return;
        }
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) handlers.onToken(token);
      } catch {
        // שורות חלקיות / לא-JSON — מדלגים
      }
    }
  }

  handlers.onDone?.();
}
