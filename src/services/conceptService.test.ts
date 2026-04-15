import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages';
import { buildDemoConceptResult, buildSystemPrompt } from './conceptService';

const t = (key: keyof typeof messages.en, vars?: Record<string, string | number>) => {
  const template = messages.en[key];
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, token) => String(vars[token] ?? ''));
};

describe('conceptService helpers', () => {
  it('builds a system prompt with the selected language and URL constraints', () => {
    const prompt = buildSystemPrompt({
      analysisLanguage: 'English',
      mascotInstruction: 'Choose an animal.',
      t,
      url: 'example.com',
    });

    expect(prompt).toContain('Sections 1 to 5 must be written in English.');
    expect(prompt).toContain('Choose an animal.');
    expect(prompt).toContain('example.com');
  });

  it('returns localized demo content', () => {
    const zhDemo = buildDemoConceptResult({ locale: 'zh-TW', url: 'example.com' });
    const enDemo = buildDemoConceptResult({ locale: 'en', url: 'example.com' });

    expect(zhDemo.section1.content).toContain('example.com');
    expect(zhDemo.section1.keywords).toContain('可信賴');
    expect(enDemo.section1.keywords).toContain('trustworthy');
  });
});
