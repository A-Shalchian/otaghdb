export class ServiceDownError extends Error {}

export function errorMessage(error: unknown) {
  if (error instanceof ServiceDownError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
