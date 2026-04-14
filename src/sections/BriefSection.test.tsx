import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import type { PanelVisibilityConfig } from '../types';
import BriefSection from './BriefSection';

const interpolate = (template: string, vars?: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars?.[key] ?? ''));

const t = (key: keyof typeof messages.en, vars?: Record<string, string | number>) =>
  interpolate(messages.en[key], vars);

const basePanelVisibility: PanelVisibilityConfig = {
  analysisCards: true,
  promptPanel: true,
  imageControls: true,
  mascotType: true,
};

afterEach(() => {
  cleanup();
});

function renderBriefSection(overrides: Partial<ComponentProps<typeof BriefSection>> = {}) {
  return render(
    <BriefSection
      briefStageActive
      workflowStageIndex={1}
      url="example.com"
      provider="google"
      setProvider={vi.fn()}
      model="gemini-2.5-flash"
      setModel={vi.fn()}
      mascotType="auto"
      setMascotType={vi.fn()}
      loading={false}
      demoMode={false}
      panelVisibility={basePanelVisibility}
      renderUrlInputBar={() => <div>URL input</div>}
      renderKeyConfig={() => <div>Key config</div>}
      onGenerate={vi.fn()}
      t={t}
      {...overrides}
    />,
  );
}

describe('BriefSection', () => {
  it('keeps unsupported live text providers disabled and explains the limitation', () => {
    renderBriefSection();

    expect(screen.getByRole('option', { name: 'OpenAI' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Anthropic' })).toBeDisabled();
    expect(screen.getByText(t('textProviderSupportHint'))).toBeInTheDocument();
  });
});
