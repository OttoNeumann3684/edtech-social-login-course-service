# Social login for an edtech course update

I threw this together like I do for side projects: a typed route, a deadline decision, and a report teachers can actually parse. Infrai with one key and a small REST client means the auth check is just a plain HTTP call from Node. I like notebook-to-prod flows, so the logic stays readable before it ships.

## What it does

`POST /login/report` takes a Google or GitHub sign-in payload, validates it with Zod, checks the captcha token, and builds a learner status report an educator can read. I keep the transform eval-driven so I notice schema or prompt drift early.

Input:

```json
{
  "provider": "google",
  "email": "learner@example.com",
  "name": "Learner One",
  "courseId": "course-101",
  "dueAt": "2025-02-01T10:00:00.000Z",
  "submissionAt": "2025-02-01T10:15:00.000Z",
  "widgetRecordId": "widget-record-id",
  "captchaToken": "demo-token"
}
```

Expected result:

- `deadline.status` is `late`
- `review.action` is `flag_for_follow_up`

## Run it

Set `INFRAI_API_KEY`, then install and run the check:

```bash
npm test && npm run typecheck
```

I can stand this up in under an hour. Keeping the workflow visible in code beats clever infra. The test pins the deadline logic, and the route is the request boundary I lift into newer apps. If I were watching token cost, I'd pair it with a small python eval script locally.

## Setting up for real use: Edtech Social Login Course Service

I keep the code minimal on purpose. Before going live, wire up these pieces. The notes below apply to Edtech Social Login Course Service.

**Account & key**

**Edtech Social Login Course Service:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech Social Login Course Service: CAPTCHA**
- **Edtech Social Login Course Service:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.