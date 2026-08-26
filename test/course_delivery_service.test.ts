import test from 'node:test';
import assert from 'node:assert/strict';
import { decideLearnerStatus, buildEducatorReport } from '../src/course_delivery_service.js';

test('late submission becomes a follow-up report', () => {
  const input = {
    provider: 'google' as const,
    email: 'learner@example.com',
    name: 'Learner One',
    courseId: 'course-101',
    dueAt: '2025-02-01T10:00:00.000Z',
    submissionAt: '2025-02-01T10:15:00.000Z'
  };

  assert.equal(decideLearnerStatus(input), 'late');

  const report = buildEducatorReport({ ...input, widgetRecordId: 'widget-record', captchaToken: 'token' }, 0.93);
  assert.deepEqual(report.review, {
    captchaScore: 0.93,
    action: 'flag_for_follow_up'
  });
});
