export type ActionSuccess<T> = {
  ok: true;
  data: T;
  eventId: string;
  correlationId: string;
};

export type ActionFailure = {
  ok: false;
  code: string;
  message: string;
  error?: string;
  correlationId: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function ok<T>(
  data: T,
  meta?: { eventId?: string; correlationId?: string },
): ActionResult<T> {
  return {
    ok: true,
    data,
    eventId: meta?.eventId ?? crypto.randomUUID(),
    correlationId: meta?.correlationId ?? crypto.randomUUID(),
  };
}

export function fail(
  message: string,
  code = "error",
  meta?: { correlationId?: string; fieldErrors?: Record<string, string[]> },
): ActionResult<never> {
  return {
    ok: false,
    code,
    message,
    error: message,
    correlationId: meta?.correlationId ?? crypto.randomUUID(),
    fieldErrors: meta?.fieldErrors,
  };
}
