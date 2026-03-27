// Categorizer: string-match rules against descriptions, tag unmatched as uncategorized.
import { withLogging } from '@budgetinator/shared';

export const handler = withLogging('categorizer', async (event) => {
  return event;
});
