import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import type { PanelVisibilityConfig } from '../types';
import PreviewSection from './PreviewSection';

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

function renderPreviewSection(overrides: Partial<ComponentProps<typeof PreviewSection>> = {}) {
  return render(
    <PreviewSection
      previewStageActive={false}
      imageProvider="google"
      setImageProvider={vi.fn()}
      imageModel="gemini-2.5-flash-image"
      setImageModel={vi.fn()}
      aspectRatio="1:1"
      setAspectRatio={vi.fn()}
      includeText={false}
      setIncludeText={vi.fn()}
      imageText=""
      setImageText={vi.fn()}
      generatingImage={false}
      promptText=""
      demoMode={false}
      panelVisibility={basePanelVisibility}
      renderKeyConfig={() => <div>Key config</div>}
      onGenerate={vi.fn()}
      t={t}
      {...overrides}
    />,
  );
}

describe('PreviewSection', () => {
  it('shows a pending state and disables generation until a prompt exists', () => {
    renderPreviewSection();

    expect(screen.getAllByText(t('previewPending')).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', {
        name: t('workflowStepPrompt'),
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('generatePreviewImage') })).toBeDisabled();
  });

  it('enables generation once a prompt is available', () => {
    renderPreviewSection({
      promptText: 'Prompt is ready',
    });

    expect(screen.getByRole('button', { name: t('generatePreviewImage') })).toBeEnabled();
    expect(screen.getAllByText(t('previewPending')).length).toBeGreaterThan(0);
  });

  it('explains when OpenAI will fall back to square output for unsupported ratios', () => {
    renderPreviewSection({
      imageProvider: 'openai',
      imageModel: 'dall-e-3',
      aspectRatio: '4:3',
      promptText: 'Prompt is ready',
    });

    expect(screen.getByText(t('openAiAspectRatioHint'))).toBeInTheDocument();
  });
});
