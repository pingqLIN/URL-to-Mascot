import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateImage, isOpenAiAspectRatioFallback, resolveOpenAiImageSize } from './imageService';

const t = (key: string) => key;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveOpenAiImageSize', () => {
  it('maps supported aspect ratios to OpenAI image sizes', () => {
    expect(resolveOpenAiImageSize('16:9')).toBe('1536x1024');
    expect(resolveOpenAiImageSize('9:16')).toBe('1024x1536');
    expect(resolveOpenAiImageSize('1:1')).toBe('1024x1024');
  });

  it('flags ratios that fall back to square output for OpenAI', () => {
    expect(isOpenAiAspectRatioFallback('4:3')).toBe(true);
    expect(isOpenAiAspectRatioFallback('3:4')).toBe(true);
    expect(isOpenAiAspectRatioFallback('16:9')).toBe(false);
  });
});

describe('generateImage', () => {
  it('supports OpenAI base64 image payloads', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ b64_json: 'abc123' }],
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      generateImage({
        apiKey: 'openai-key',
        aspectRatio: '4:3',
        model: 'gpt-image-1.5',
        prompt: 'Render a mascot.',
        provider: 'openai',
        t,
      }),
    ).resolves.toBe('data:image/png;base64,abc123');

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
