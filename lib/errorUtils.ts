export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return (error as Error).message;
  return String(error);
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return (error as Error).stack;
  return undefined;
}
