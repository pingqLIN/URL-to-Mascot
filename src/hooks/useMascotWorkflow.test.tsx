import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { messages } from '../i18n/messages';
import { buildDemoConceptResult } from '../services/conceptService';
import { buildConceptCacheKey } from '../utils/workflow';
import { useMascotWorkflow } from './useMascotWorkflow';

const { fetchConceptMock } = vi.hoisted(() => ({
  fetchConceptMock: vi.fn(),
}));

const { generateImageMock } = vi.hoisted(() => ({
  generateImageMock: vi.fn(),
}));

vi.mock('../services/conceptService', async () => {
  const actual = await vi.importActual<typeof import('../services/conceptService')>('../services/conceptService');

  return {
    ...actual,
    fetchConcept: fetchConceptMock,
  };
});

vi.mock('../services/imageService', () => ({
  generateImage: generateImageMock,
}));

const interpolate = (template: string, vars?: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars?.[key] ?? ''));

const t = (key: keyof typeof messages.en, vars?: Record<string, string | number>) => interpolate(messages.en[key], vars);

function createParams() {
  return {
    bgResultFlash: null,
    builtInGeminiKey: 'gemini-test-key',
    clearBgTimers: vi.fn(),
    demoMode: false,
    demoImages: {
      animal: 'animal.png',
      human: 'human.png',
      object: 'object.png',
      auto: 'auto.png',
    },
    flashBackground: vi.fn().mockResolvedValue(undefined),
    imageConfig: {
      apiKey: '',
      keySource: 'builtin' as const,
      model: 'gemini-2.5-flash-image',
      provider: 'google',
    },
    locale: 'en' as const,
    setWorkflowStage: vi.fn(),
    t,
    textConfig: {
      apiKey: '',
      keySource: 'builtin' as const,
      model: 'gemini-2.5-flash',
      provider: 'google',
    },
  };
}

describe('useMascotWorkflow', () => {
  beforeEach(() => {
    sessionStorage.clear();
    fetchConceptMock.mockReset();
    generateImageMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects incomplete target input before any live request is made', async () => {
    const { result } = renderHook(() => useMascotWorkflow(createParams()));

    act(() => {
      result.current.setUrl('not-a-domain');
    });

    await act(async () => {
      await result.current.handleGenerateConcept();
    });

    expect(result.current.error).toBe(t('errorInvalidUrlFormat'));
    expect(fetchConceptMock).not.toHaveBeenCalled();
  });

  it('loads matching cached results and surfaces a cache status message', async () => {
    const params = createParams();
    const cachedResult = buildDemoConceptResult({ locale: 'en', url: 'example.com' });

    sessionStorage.setItem(
      buildConceptCacheKey({
        locale: 'en',
        mascotType: 'auto',
        model: params.textConfig.model,
        provider: params.textConfig.provider,
        url: 'example.com',
      }),
      JSON.stringify(cachedResult),
    );

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setUrl('https://example.com');
    });

    await act(async () => {
      await result.current.handleGenerateConcept();
    });

    expect(result.current.url).toBe('example.com');
    expect(result.current.result).toEqual(cachedResult);
    expect(result.current.statusMessage).toBe(t('resultFromCache'));
    expect(params.setWorkflowStage).toHaveBeenCalledWith('analysis');
    expect(fetchConceptMock).not.toHaveBeenCalled();
  });

  it('ignores stale cache entries when the generation scope changes', async () => {
    vi.useFakeTimers();

    const params = createParams();
    const liveResult = buildDemoConceptResult({ locale: 'en', url: 'example.com' });
    fetchConceptMock.mockResolvedValue(liveResult);

    sessionStorage.setItem(
      buildConceptCacheKey({
        locale: 'en',
        mascotType: 'auto',
        model: params.textConfig.model,
        provider: params.textConfig.provider,
        url: 'example.com',
      }),
      JSON.stringify(buildDemoConceptResult({ locale: 'en', url: 'cached.com' })),
    );

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setUrl('example.com');
      result.current.setMascotType('animal');
    });

    await act(async () => {
      const pending = result.current.handleGenerateConcept();
      await vi.runAllTimersAsync();
      await pending;
    });

    expect(fetchConceptMock).toHaveBeenCalledOnce();
    expect(result.current.result).toEqual(liveResult);
    expect(result.current.statusMessage).toBe('');
    expect(
      sessionStorage.getItem(
        buildConceptCacheKey({
          locale: 'en',
          mascotType: 'animal',
          model: params.textConfig.model,
          provider: params.textConfig.provider,
          url: 'example.com',
        }),
      ),
    ).toBe(JSON.stringify(liveResult));
  });

  it('clears cache status when preview generation fails later', async () => {
    const params = createParams();
    params.imageConfig.provider = 'openai';
    params.imageConfig.apiKey = '';

    const cachedResult = buildDemoConceptResult({ locale: 'en', url: 'example.com' });
    sessionStorage.setItem(
      buildConceptCacheKey({
        locale: 'en',
        mascotType: 'auto',
        model: params.textConfig.model,
        provider: params.textConfig.provider,
        url: 'example.com',
      }),
      JSON.stringify(cachedResult),
    );

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setUrl('example.com');
    });

    await act(async () => {
      await result.current.handleGenerateConcept();
    });

    expect(result.current.statusMessage).toBe(t('resultFromCache'));

    await act(async () => {
      await result.current.handleGeneratePreviewImage();
    });

    expect(result.current.statusMessage).toBe('');
    expect(result.current.error).toBe(t('errorOpenAiKey'));
    expect(generateImageMock).not.toHaveBeenCalled();
  });

  it('switches to the preview stage immediately while image generation is pending', async () => {
    vi.useFakeTimers();

    const params = createParams();
    generateImageMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          window.setTimeout(() => resolve('data:image/png;base64,preview'), 120);
        }),
    );

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setManualPrompt('Prompt is ready');
    });

    await act(async () => {
      const pending = result.current.handleGeneratePreviewImage();
      expect(params.setWorkflowStage).toHaveBeenCalledWith('preview');
      await vi.runAllTimersAsync();
      await pending;
    });

    expect(result.current.generatedImage).toBe('data:image/png;base64,preview');
    expect(result.current.generatingImage).toBe(false);
  });

  it('injects aspect ratio and typography constraints into the image prompt', async () => {
    const params = createParams();
    generateImageMock.mockResolvedValue('data:image/png;base64,preview');

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setManualPrompt('Prompt is ready');
      result.current.setAspectRatio('16:9');
      result.current.setIncludeText(true);
      result.current.setImageText('HELLO WORLD');
    });

    await act(async () => {
      await result.current.handleGeneratePreviewImage();
    });

    expect(generateImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        aspectRatio: '16:9',
        prompt: expect.stringContaining('cinematic wide landscape frame (16:9)'),
      }),
    );
    expect(generateImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('The image MUST prominently feature the text "HELLO WORLD"'),
      }),
    );
  });

  it('adds a no-readable-text constraint when image text is disabled', async () => {
    const params = createParams();
    generateImageMock.mockResolvedValue('data:image/png;base64,preview');

    const { result } = renderHook(() => useMascotWorkflow(params));

    act(() => {
      result.current.setManualPrompt('Prompt is ready');
      result.current.setAspectRatio('3:4');
      result.current.setIncludeText(false);
    });

    await act(async () => {
      await result.current.handleGeneratePreviewImage();
    });

    expect(generateImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        aspectRatio: '3:4',
        prompt: expect.stringContaining('Do not include any readable words, letters, logos, UI copy, signage, or typographic elements'),
      }),
    );
    expect(generateImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('portrait-oriented layout'),
      }),
    );
  });
});
