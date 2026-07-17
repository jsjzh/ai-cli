import { createSpinner } from 'nanospinner';

export function withSpinner<T>(text: string, fn: () => T): T {
  const spinner = createSpinner(text).start();
  try {
    const result = fn();
    spinner.success();
    return result;
  } catch (error) {
    spinner.error({ text: `${text} — 失败` });
    throw error;
  }
}
