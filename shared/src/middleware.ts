export function withLogging<TEvent = unknown, TResult = unknown>(
  name: string,
  fn: (event: TEvent) => Promise<TResult>
): (event: TEvent) => Promise<TResult> {
  return async (event: TEvent): Promise<TResult> => {
    console.log(JSON.stringify({ handler: name, phase: '📩 input', event }));
    const result = await fn(event);
    console.log(JSON.stringify({ handler: name, phase: '🚀 output', result }));
    return result;
  };
}
