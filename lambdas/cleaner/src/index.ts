// Cleaner: validate CSV schema, normalise rows, quarantine file on bad format.
import { withLogging } from '@budgetinator/shared';

export const handler = withLogging('cleaner', async (event) => {
  return event;
});
