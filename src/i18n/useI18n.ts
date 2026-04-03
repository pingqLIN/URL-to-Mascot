import { useEffect, useMemo, useState } from 'react';
import { messages, type Locale, type MessageKey } from './messages';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const saved = window.localStorage.getItem('app-locale');
  if (saved === 'en' || saved === 'zh-TW') return saved;

  return navigator.language.toLowerCase().includes('zh') ? 'zh-TW' : 'en';
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app-locale', locale);
    }
  }, [locale]);

  const dict = useMemo(() => messages[locale], [locale]);

  const t = (key: MessageKey, vars?: Record<string, string | number>) => {
    return interpolate(dict[key], vars);
  };

  return {
    locale,
    setLocale,
    t,
  };
}

export type { Locale };
