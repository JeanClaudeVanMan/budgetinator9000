// Notifier: send SES email — monthly report for type='report', failure alert for type='error'.
import { withLogging } from '@budgetinator/shared';

export const handler = withLogging('notifier', async (event) => {
  return event;
});
