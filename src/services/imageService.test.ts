import { describe, expect, it } from 'vitest';
import { resolveOpenAiImageSize } from './imageService';

describe('resolveOpenAiImageSize', () => {
  it('maps supported aspect ratios to OpenAI image sizes', () => {
    expect(resolveOpenAiImageSize('16:9')).toBe('1792x1024');
    expect(resolveOpenAiImageSize('9:16')).toBe('1024x1792');
    expect(resolveOpenAiImageSize('1:1')).toBe('1024x1024');
  });
});
