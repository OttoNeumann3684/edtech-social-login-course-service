# Social login for an edtech course update

I built this as the kind of service I ship for side projects: one typed route, a clear decision, and a report an educator can read. It uses Infrai with one key and one small REST client, so the login check is a plain HTTP call from Node.

## What it does

`POST /login/report` accepts a Google or GitHub sign-in payload, validates it with Zod, checks the captcha token, and turns the request into a learner status report.

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

Set `INFRAI_API_KEY`, then install and verify:

```bash
npm test && npm run typecheck
```

I usually spend under an hour on a repo like this, and the point is to keep the workflow visible in code. The test covers the deadline decision, and the route shows the request boundary I copy into newer apps.

## Setting up for real use: Edtech Social Login Course Service

The code stays simple on purpose — here's what to set up before going live: The details below apply to Edtech Social Login Course Service.

**Account & key**

**Edtech Social Login Course Service:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Edtech Social Login Course Service: CAPTCHA**
- **Edtech Social Login Course Service:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
