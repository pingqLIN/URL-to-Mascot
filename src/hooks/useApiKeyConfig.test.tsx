import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useApiKeyConfig } from './useApiKeyConfig';

describe('useApiKeyConfig', () => {
  it('defaults to builtin source when a bundled Gemini key exists', () => {
    const { result } = renderHook(() => useApiKeyConfig('text', true, false));

    expect(result.current.provider).toBe('google');
    expect(result.current.model).toBe('gemini-2.5-flash');
    expect(result.current.keySource).toBe('builtin');
  });

  it('switches to provider defaults and forces custom keys for non-Google providers', () => {
    const { result } = renderHook(() => useApiKeyConfig('text', true, false));

    act(() => {
      result.current.setProvider('openai');
    });

    expect(result.current.model).toBe('gpt-5.2');
    expect(result.current.keySource).toBe('custom');
  });

  it('falls back from selected to custom when paid keys are unavailable', () => {
    const { result, rerender } = renderHook(
      ({ hasPaidKey }) => useApiKeyConfig('image', false, hasPaidKey),
      { initialProps: { hasPaidKey: true } },
    );

    act(() => {
      result.current.setKeySource('selected');
    });

    rerender({ hasPaidKey: false });

    expect(result.current.keySource).toBe('custom');
  });
});
