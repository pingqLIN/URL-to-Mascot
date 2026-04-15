import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import type { ConceptResult, MascotType, SectionKey } from '../types';
import ConceptSection from './ConceptSection';

const interpolate = (template: string, vars?: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars?.[key] ?? ''));

const t = (key: keyof typeof messages.en, vars?: Record<string, string | number>) =>
  interpolate(messages.en[key], vars);

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
  copySpy = vi.fn(),
  regeneratePromptSpy = vi.fn().mockResolvedValue(undefined),
}: {
  initialResult?: ConceptResult | null;
  copySpy?: ReturnType<typeof vi.fn>;
  regeneratePromptSpy?: ReturnType<typeof vi.fn>;
}) {
  const [result, setResult] = useState<ConceptResult | null>(initialResult);
  const [mascotType, setMascotType] = useState<MascotType>('auto');

  const handleContentChange = (section: SectionKey, content: string) => {
    setResult((previous) =>
      previous ? { ...previous, [section]: { ...previous[section], content } } : previous,
    );
  };

  return (
    <ConceptSection
      contentStageActive
      mascotType={mascotType}
      setMascotType={setMascotType}
      loading={false}
      result={result}
      url="spotify.com"
      effectivePromptText={result?.section6.content ?? ''}
      promptText={result?.section6.content ?? ''}
      copied={false}
      regeneratingPrompt={false}
      onContentChange={handleContentChange}
      onManualPromptChange={vi.fn()}
      onCopy={copySpy}
      onRegeneratePrompt={regeneratePromptSpy}
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

    fireEvent.click(screen.getByRole('button', { name: /AI Visual Prompt/i }));
    expect(screen.getByText('Initial prompt body')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: t('editSection', { section: t('aiVisualPrompt') }),
      }),
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
    expect(screen.queryByText(t('optimizedFor3D'))).not.toBeInTheDocument();
  });

  it('shows concept cards in the first tab and keeps the preview block out of this section', () => {
    render(<ConceptHarness />);

    expect(screen.getByText('Initial concept summary')).toBeInTheDocument();
    expect(screen.queryByText(t('optimizedFor3D'))).not.toBeInTheDocument();
  });

  it('shows a save-and-regenerate action after tab 1 content changes and switches to the prompt tab', async () => {
    const regeneratePromptSpy = vi.fn().mockResolvedValue(undefined);
    render(<ConceptHarness regeneratePromptSpy={regeneratePromptSpy} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: t('editSection', { section: t('coreConcept') }),
      }),
    );

    fireEvent.change(screen.getByLabelText(t('coreConcept')), {
      target: { value: 'Updated concept summary' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: t('saveAndRegeneratePrompt'),
      }),
    );

    await waitFor(() => expect(regeneratePromptSpy).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Initial prompt body')).toBeInTheDocument();
  });
});
