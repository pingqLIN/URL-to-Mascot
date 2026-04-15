import { describe, expect, it } from 'vitest';
import { buildConceptCacheKey, canonicalizeTargetUrl, isValidTargetUrl, normalizeUrlInput } from './workflow';

describe('workflow utils', () => {
  it('normalizes and canonicalizes HTTP-style input', () => {
    expect(normalizeUrlInput(' https://Example.com/path/ ')).toBe('Example.com/path/');
    expect(canonicalizeTargetUrl(' https://Example.com/path/?view=full#hero ')).toBe('example.com/path?view=full#hero');
  });

  it('accepts real hostnames and rejects incomplete targets', () => {
    expect(isValidTargetUrl('example.com')).toBe(true);
    expect(isValidTargetUrl('http://localhost:3000/demo')).toBe(true);
    expect(isValidTargetUrl('example')).toBe(false);
    expect(isValidTargetUrl('mailto:test@example.com')).toBe(false);
  });

  it('scopes concept cache keys by locale, mascot type, provider, model, and URL', () => {
    const base = {
      locale: 'en' as const,
      model: 'gemini-2.5-flash',
      provider: 'google',
      url: 'https://example.com',
    };

    const autoKey = buildConceptCacheKey({ ...base, mascotType: 'auto' });
    const zhKey = buildConceptCacheKey({ ...base, locale: 'zh-TW', mascotType: 'auto' });
    const animalKey = buildConceptCacheKey({ ...base, mascotType: 'animal' });
    const differentModelKey = buildConceptCacheKey({ ...base, mascotType: 'auto', model: 'gemini-2.5-pro' });

    expect(autoKey).toContain('url-hero-cache:v2');
    expect(autoKey).not.toBe(zhKey);
    expect(autoKey).not.toBe(animalKey);
    expect(autoKey).not.toBe(differentModelKey);
  });
});
