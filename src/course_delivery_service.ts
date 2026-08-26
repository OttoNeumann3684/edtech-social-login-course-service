import express from 'express';
import { z } from 'zod';
import { infrai, InfraiError } from './infrai_client.js';

const SocialLoginInput = z.object({
  provider: z.enum(['google', 'github']),
  email: z.string().email(),
  name: z.string().min(1),
  courseId: z.string().min(1),
  dueAt: z.string().datetime(),
  submissionAt: z.string().datetime(),
  widgetRecordId: z.string().min(1),
  captchaToken: z.string().min(1),
  ip: z.string().optional()
});

type SocialLoginInput = z.infer<typeof SocialLoginInput>;

type LearnerStatus = 'on_time' | 'late';

export function decideLearnerStatus(input: Pick<SocialLoginInput, 'submissionAt' | 'dueAt'>): LearnerStatus {
  return new Date(input.submissionAt) <= new Date(input.dueAt) ? 'on_time' : 'late';
}

export function buildEducatorReport(input: SocialLoginInput, captchaScore: number) {
  const status = decideLearnerStatus(input);
  return {
    learner: {
      email: input.email,
      name: input.name,
      provider: input.provider,
      courseId: input.courseId
    },
    deadline: {
      dueAt: input.dueAt,
      submissionAt: input.submissionAt,
      status
    },
    review: {
      captchaScore,
      action: status === 'late' ? 'flag_for_follow_up' : 'mark_complete'
    }
  };
}

async function handleLogin(input: SocialLoginInput) {
  const captcha = await infrai.captcha.verify({
    widget_record_id: input.widgetRecordId,
    token: input.captchaToken,
    vendor: input.provider,
    ip: input.ip,
    action: 'social_login',
    score_threshold: 0.5
  });

  return buildEducatorReport(input, captcha.data?.score ?? 0);
}

const app = express();
app.use(express.json());

app.post('/login/report', async (req, res) => {
  const parsed = SocialLoginInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const report = await handleLogin(parsed.data);
    return res.json({ ok: true, data: report });
  } catch (error) {
    if (error instanceof InfraiError) {
      return res.status(error.status).json({ ok: false, error: { code: error.code, message: error.message, details: error.details } });
    }
    return res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`course delivery service listening on ${port}`);
  });
}

export { app, handleLogin };
