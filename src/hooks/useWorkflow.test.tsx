import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages';
import { useWorkflow } from './useWorkflow';

const t = (key: keyof typeof messages.en) => messages.en[key];

describe('useWorkflow', () => {
  it('starts at the entry stage with translated step metadata', () => {
    const { result } = renderHook(() => useWorkflow(t));

    expect(result.current.stage).toBe('entry');
    expect(result.current.stageIndex).toBe(0);
    expect(result.current.currentStep.title).toBe(messages.en.workflowStepBrief);
    expect(result.current.steps).toHaveLength(5);
  });

  it('updates current stage and step index when jumping ahead', () => {
    const { result } = renderHook(() => useWorkflow(t));

    act(() => {
      result.current.jumpToStage('preview');
    });

    expect(result.current.stage).toBe('preview');
    expect(result.current.stageIndex).toBe(4);
    expect(result.current.currentStep.title).toBe(messages.en.workflowStepPreview);
  });
});
