import type { Locale } from '../i18n/messages';
import type { MascotType } from '../types';

type ConceptCacheKeyParams = {
  locale: Locale;
  mascotType: MascotType;
  model: string;
  provider: string;
  url: string;
};

const CACHE_VERSION = 'v2';
const PROTOCOL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;
const NON_HTTP_SCHEME_PATTERN = /^[a-z][a-z\d+\-.]*:(?!\d)/i;
const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function hasSupportedHostname(hostname: string) {
  return hostname === 'localhost' || hostname.includes('.') || IPV4_PATTERN.test(hostname);
}

function buildUrlCandidate(value: string) {
  return PROTOCOL_PATTERN.test(value) ? value : `https://${value}`;
}

export function normalizeUrlInput(value: string) {
  return value.trim().replace(/^https?:\/\//i, '');
}

export function canonicalizeTargetUrl(value: string) {
  const normalized = normalizeUrlInput(value);
  if (!normalized) return '';

  try {
    const parsed = new URL(buildUrlCandidate(normalized));
    const protocol = parsed.protocol.toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') {
      return normalized;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hasSupportedHostname(hostname)) {
      return normalized;
    }

    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
    const port = parsed.port ? `:${parsed.port}` : '';

    return `${hostname}${port}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return normalized;
  }
}

export function isValidTargetUrl(value: string) {
  const normalized = normalizeUrlInput(value);
  if (!normalized) return false;
  if (!PROTOCOL_PATTERN.test(normalized) && NON_HTTP_SCHEME_PATTERN.test(normalized)) return false;

  try {
    const parsed = new URL(buildUrlCandidate(normalized));
    const protocol = parsed.protocol.toLowerCase();

    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    return hasSupportedHostname(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function buildConceptCacheKey({ locale, mascotType, model, provider, url }: ConceptCacheKeyParams) {
  return ['url-hero-cache', CACHE_VERSION, locale, mascotType, provider, model, canonicalizeTargetUrl(url)].join(':');
}
