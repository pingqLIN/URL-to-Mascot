import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import { useWorkspaceSettings } from './useWorkspaceSettings';

const t = (key: keyof typeof messages.en) => messages.en[key];

describe('useWorkspaceSettings', () => {
  it('builds settings groups and toggles panel visibility', () => {
    const setDemoMode = vi.fn();
    const { result } = renderHook(() =>
      useWorkspaceSettings({
        demoMode: false,
        setDemoMode,
        t,
      }),
    );

    expect(result.current.groups).toHaveLength(2);
    expect(result.current.panelVisibility.analysisCards).toBe(true);

    act(() => {
      result.current.groups[0].items[0].setter();
    });

    expect(result.current.panelVisibility.analysisCards).toBe(false);
  });
});
