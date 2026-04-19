import type { TFunction } from '../types';

type ErrorMessageParams = {
  err: unknown;
  fallbackMessage: string;
  permissionMessage: string;
  t: TFunction;
};

export function getReadableApiError({
  err,
  fallbackMessage,
  permissionMessage,
  t,
}: ErrorMessageParams) {
  const rawMessage = err instanceof Error ? err.message : String(err ?? '');

  let parsedMessage = '';
  let parsedStatus = '';
  let parsedReason = '';
  let parsedType = '';

  try {
    const parsed = JSON.parse(rawMessage);
    parsedMessage = parsed?.error?.message || '';
    parsedStatus = parsed?.error?.status || '';
    parsedType = parsed?.error?.type || parsed?.type || '';
    parsedReason =
      parsed?.error?.details?.find?.((detail: { reason?: string }) => detail?.reason)?.reason || '';
  } catch {
    // Ignore JSON parse errors and fall back to raw message matching.
  }

  const normalized = `${rawMessage} ${parsedMessage} ${parsedStatus} ${parsedReason} ${parsedType}`.toLowerCase();
  const hasInvalidApiKeySignal =
    normalized.includes('api_key_invalid') ||
    normalized.includes('api key not valid') ||
    normalized.includes('invalid api key') ||
    normalized.includes('incorrect api key') ||
    normalized.includes('invalid x-goog-api-key') ||
    normalized.includes('invalid x-api-key');

  if (normalized.includes('403') || normalized.includes('permission_denied')) {
    return permissionMessage;
  }

  if (hasInvalidApiKeySignal || (normalized.includes('invalid_argument') && normalized.includes('api key'))) {
    return t('errorInvalidApiKey');
  }

  return parsedMessage || rawMessage || fallbackMessage;
}
