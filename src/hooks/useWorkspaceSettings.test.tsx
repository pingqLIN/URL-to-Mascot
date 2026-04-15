import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import { useWorkspaceSettings } from './useWorkspaceSettings';

const t = (key: keyof typeof messages.en) => messages.en[key];

describe('useWorkspaceSettings', () => {
  it('builds settings groups and toggles demo mode', () => {
    const setDemoMode = vi.fn();
    const { result } = renderHook(() =>
      useWorkspaceSettings({
        demoMode: false,
        setDemoMode,
        t,
      }),
    );

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].items[0].label).toBe(t('demoMode'));

    act(() => {
      result.current.groups[0].items[0].setter();
    });

    expect(setDemoMode).toHaveBeenCalled();
  });
});
