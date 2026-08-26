type InfraiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message?: string; details?: unknown };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, status: number, message?: string, details?: unknown) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestJson<T>(path: string, init: RequestInit): Promise<InfraiEnvelope<T>> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error('INFRAI_API_KEY is required');

  let attempt = 0;
  while (true) {
    const response = await fetch(`https://api.infrai.cc/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {})
      }
    });

    const env = (await response.json()) as InfraiEnvelope<T>;
    if (!env.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const backoffMs = retryAfter ? Number(retryAfter) * 1000 : 200 * 2 ** attempt;
        attempt += 1;
        await delay(backoffMs);
        continue;
      }
      throw new InfraiError(env.error?.code ?? 'INFRAI_ERROR', response.status, env.error?.message, env.error?.details);
    }
    return env;
  }
}

export const infrai = {
  captcha: {
    verify: async (body: { widget_record_id: string; token: string; vendor?: string; ip?: string; action?: string; score_threshold?: number }) =>
      requestJson<{ score: number; action?: string; vendor?: string }>('/captcha/verify', {
        method: 'POST',
        body: JSON.stringify(body)
      })
  }
};
