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

  it('converts OpenAI image URLs into stable data URLs before returning them', async () => {
    const fileReaderEvents = new Map<FileReader, { loadend?: () => void; error?: () => void }>();

    class MockFileReader {
      static lastResult = 'data:image/png;base64,downloaded';
      result: string | ArrayBuffer | null = null;
      error: DOMException | null = null;

      set onloadend(handler: (() => void) | null) {
        const events = fileReaderEvents.get(this as unknown as FileReader) ?? {};
        events.loadend = handler ?? undefined;
        fileReaderEvents.set(this as unknown as FileReader, events);
      }

      set onerror(handler: (() => void) | null) {
        const events = fileReaderEvents.get(this as unknown as FileReader) ?? {};
        events.error = handler ?? undefined;
        fileReaderEvents.set(this as unknown as FileReader, events);
      }

      readAsDataURL(_blob: Blob) {
        this.result = MockFileReader.lastResult;
        fileReaderEvents.get(this as unknown as FileReader)?.loadend?.();
      }
    }

    const imageBlob = new Blob(['image-bytes'], { type: 'image/png' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: 'https://example.com/generated-image.png' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => imageBlob,
      });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('FileReader', MockFileReader);

    await expect(
      generateImage({
        apiKey: 'openai-key',
        aspectRatio: '1:1',
        model: 'gpt-image-1.5',
        prompt: 'Render a mascot.',
        provider: 'openai',
        t,
      }),
    ).resolves.toBe('data:image/png;base64,downloaded');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.openai.com/v1/images/generations',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://example.com/generated-image.png');
  });
});
