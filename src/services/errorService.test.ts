import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages';
import { getReadableApiError } from './errorService';

const t = (key: keyof typeof messages.en) => messages.en[key];

describe('getReadableApiError', () => {
  it('maps permission errors to the provided permission message', () => {
    const err = new Error(
      JSON.stringify({
        error: {
          message: 'Permission denied',
          status: 'PERMISSION_DENIED',
        },
      }),
    );

    expect(
      getReadableApiError({
        err,
        fallbackMessage: t('errorGenerateContent'),
        permissionMessage: t('errorPermissionDenied'),
        t,
      }),
    ).toBe(messages.en.errorPermissionDenied);
  });

  it('maps invalid API key errors to the localized invalid key copy', () => {
    expect(
      getReadableApiError({
        err: new Error('API_KEY_INVALID'),
        fallbackMessage: t('errorGenerateContent'),
        permissionMessage: t('errorPermissionDenied'),
        t,
      }),
    ).toBe(messages.en.errorInvalidApiKey);
  });

  it('does not mislabel generic invalid argument errors as API key failures', () => {
    const err = new Error(
      JSON.stringify({
        error: {
          message: 'Gateway configuration is invalid.',
          status: 'INVALID_ARGUMENT',
        },
      }),
    );

    expect(
      getReadableApiError({
        err,
        fallbackMessage: t('errorGenerateContent'),
        permissionMessage: t('errorPermissionDenied'),
        t,
      }),
    ).toBe('Gateway configuration is invalid.');
  });

  it('falls back to parsed API messages when present', () => {
    const err = new Error(
      JSON.stringify({
        error: {
          message: 'Upstream exploded',
        },
      }),
    );

    expect(
      getReadableApiError({
        err,
        fallbackMessage: t('errorGenerateContent'),
        permissionMessage: t('errorPermissionDenied'),
        t,
      }),
    ).toBe('Upstream exploded');
  });
});
