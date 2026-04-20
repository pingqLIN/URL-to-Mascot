import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useApiKeyConfig } from './useApiKeyConfig';

const emptyBuiltInKeys = {
  anthropic: '',
  google: '',
  openai: '',
} as const;

describe('useApiKeyConfig', () => {
  it('defaults to custom source for Google outside AI Studio even when a bundled Gemini key exists', () => {
    const { result } = renderHook(() =>
      useApiKeyConfig(
        'text',
        {
          ...emptyBuiltInKeys,
          google: 'gemini-test-key',
        },
        false,
        false,
      ),
    );

    expect(result.current.provider).toBe('google');
    expect(result.current.model).toBe('gemini-2.5-flash');
    expect(result.current.keySource).toBe('custom');
  });

  it('defaults to builtin source for Google in AI Studio when a bundled Gemini key exists', () => {
    const { result } = renderHook(() =>
      useApiKeyConfig(
        'text',
        {
          ...emptyBuiltInKeys,
          google: 'gemini-test-key',
        },
        false,
        true,
      ),
    );

    expect(result.current.keySource).toBe('builtin');
  });

  it('switches to provider defaults and forces custom keys for non-Google providers', () => {
    const { result } = renderHook(() =>
      useApiKeyConfig(
        'text',
        {
          ...emptyBuiltInKeys,
          google: 'gemini-test-key',
        },
        false,
        false,
      ),
    );

    act(() => {
      result.current.setProvider('openai');
    });

    expect(result.current.model).toBe('gpt-5.2');
    expect(result.current.keySource).toBe('custom');
  });

  it('falls back from selected to custom when paid keys are unavailable', () => {
    const { result, rerender } = renderHook(
      ({ hasPaidKey, isAiStudioEnvironment }) =>
        useApiKeyConfig('image', emptyBuiltInKeys, hasPaidKey, isAiStudioEnvironment),
      { initialProps: { hasPaidKey: true, isAiStudioEnvironment: true } },
    );

    act(() => {
      result.current.setKeySource('selected');
    });

    rerender({ hasPaidKey: false, isAiStudioEnvironment: true });

    expect(result.current.keySource).toBe('custom');
  });

  it('falls back from selected to builtin when Google AI Studio still has a bundled key', () => {
    const { result, rerender } = renderHook(
      ({ hasPaidKey }) =>
        useApiKeyConfig(
          'image',
          {
            ...emptyBuiltInKeys,
            google: 'gemini-test-key',
          },
          hasPaidKey,
          true,
        ),
      { initialProps: { hasPaidKey: true } },
    );

    act(() => {
      result.current.setKeySource('selected');
    });

    rerender({ hasPaidKey: false });

    expect(result.current.keySource).toBe('builtin');
  });

  it('uses builtin mode for OpenAI when an env-backed key is available', () => {
    const { result } = renderHook(() =>
      useApiKeyConfig(
        'text',
        {
          ...emptyBuiltInKeys,
          openai: 'openai-test-key',
        },
        false,
        false,
      ),
    );

    act(() => {
      result.current.setProvider('openai');
    });

    expect(result.current.model).toBe('gpt-5.2');
    expect(result.current.keySource).toBe('builtin');
  });
});
