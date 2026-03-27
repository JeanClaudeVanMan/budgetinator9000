// Recorder: persist all categorized and uncategorized rows to DynamoDB.
import { withLogging } from '@budgetinator/shared';

export const handler = withLogging('recorder', async (event) => {
  return event;
});
