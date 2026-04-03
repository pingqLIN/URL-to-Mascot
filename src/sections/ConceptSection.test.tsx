import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import type { ConceptResult, PanelVisibilityConfig, SectionKey } from '../types';
import ConceptSection from './ConceptSection';

const interpolate = (template: string, vars?: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars?.[key] ?? ''));

const t = (key: keyof typeof messages.en, vars?: Record<string, string | number>) =>
  interpolate(messages.en[key], vars);

const panelVisibility: PanelVisibilityConfig = {
  analysisCards: true,
  promptPanel: true,
  imageControls: true,
  mascotType: true,
};

const baseResult: ConceptResult = {
  section1: { content: 'Initial concept summary', keywords: ['cinematic', 'mascot'] },
  section2: { content: 'Initial character base' },
  section3: { content: 'Initial gear details' },
  section4: { content: 'Initial environment details' },
  section5: { content: 'Initial lighting details' },
  section6: { content: 'Initial prompt body' },
};

afterEach(() => {
  cleanup();
});

function ConceptHarness({
  initialResult = baseResult,
  initialGeneratedImage = '',
  copySpy = vi.fn(),
}: {
  initialResult?: ConceptResult | null;
  initialGeneratedImage?: string;
  copySpy?: ReturnType<typeof vi.fn>;
}) {
  const [result, setResult] = useState<ConceptResult | null>(initialResult);

  const handleContentChange = (section: SectionKey, content: string) => {
    setResult((previous) =>
      previous ? { ...previous, [section]: { ...previous[section], content } } : previous,
    );
  };

  return (
    <ConceptSection
      contentStageActive
      loading={false}
      result={result}
      url="spotify.com"
      promptText={result?.section6.content ?? ''}
      copied={false}
      regeneratingPrompt={false}
      generatingImage={false}
      generatedImage={initialGeneratedImage}
      imageModel="gemini-2.5-flash-image"
      panelVisibility={panelVisibility}
      onContentChange={handleContentChange}
      onManualPromptChange={vi.fn()}
      onCopy={copySpy}
      onRegeneratePrompt={vi.fn()}
      renderWorkflowStepper={() => <div>Stepper</div>}
      t={t}
    />
  );
}

describe('ConceptSection', () => {
  it('lets users edit and save an analysis card inline', () => {
    render(<ConceptHarness />);

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('editSection', { section: t('coreConcept') }),
      })[0],
    );

    fireEvent.change(screen.getByLabelText(t('coreConcept')), {
      target: { value: 'Updated concept summary' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: t('saveSection', { section: t('coreConcept') }),
      }),
    );

    expect(screen.getByText('Updated concept summary')).toBeInTheDocument();
  });

  it('copies the latest prompt text after editing and keeps the preview panel visible', () => {
    const copySpy = vi.fn();
    render(<ConceptHarness copySpy={copySpy} />);

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('editSection', { section: t('aiVisualPrompt') }),
      })[0],
    );

    fireEvent.change(screen.getByLabelText(t('aiVisualPrompt')), {
      target: { value: 'Updated prompt body' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: t('saveSection', { section: t('aiVisualPrompt') }),
      }),
    );

    fireEvent.click(screen.getAllByRole('button', { name: t('copyPrompt') })[0]);

    expect(copySpy).toHaveBeenCalledWith('Updated prompt body');
    expect(screen.getByText(t('optimizedFor3D'))).toBeInTheDocument();
  });

  it('renders the generated preview image inside the content stage when available', () => {
    render(<ConceptHarness initialGeneratedImage="data:image/png;base64,abc" />);

    expect(screen.getByAltText(t('mascotPreviewAlt'))).toBeInTheDocument();
    expect(screen.getByText(t('previewReady'))).toBeInTheDocument();
  });
});
