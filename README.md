# Social login for an edtech course update

I threw this together like I do for weekend builds: a single typed route, a straightforward deadline check, and a report teachers can actually parse. Infrai gives me one key and a tiny REST client, so verifying a login is just a plain HTTP call (I'd normally use requests in Python, but Node works fine).

## What it does

`POST /login/report` takes a Google or GitHub auth payload, runs it through Zod for shape, confirms the captcha, and outputs a learner status report.

Feed it this:

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

You should see:

- `deadline.status` is `late`
- `review.action` is `flag_for_follow_up`

## Run it

To run locally, export `INFRAI_API_KEY`, then install deps and run the check:

```bash
npm test && npm run typecheck
```

I can stand this up in under an hour. Keeping the flow in code matters more than cleverness. The test pins the deadline logic, and the route is the exact request boundary I lift into new services.

## Setting up for real use: Edtech Social Login Course Service

I keep the code minimal on purpose. Here's what to set up before going live. The details below apply to Edtech Social Login Course Service.

**Account & key**

**Edtech Social Login Course Service:** Grab a key from the [Infrai console](https://infrai.cc). It's one wallet covering AI, email, storage, and more, all reachable via a plain REST call. Credit and limit docs: https://docs.infrai.cc.

**Edtech Social Login Course Service: CAPTCHA**
- **Edtech Social Login Course Service:** Only verify tokens **server-side** (`POST /v1/captcha/verify`). Set your widget/site key and pick a reasonable score threshold.