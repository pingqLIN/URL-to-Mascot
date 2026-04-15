import { Key, ExternalLink } from 'lucide-react';
import type { KeySource } from '../types';
import { LABEL_CLS, SELECT_CLS, PROVIDERS, IMAGE_PROVIDERS } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type KeyConfigPanelProps = {
  isText: boolean;
  authMethod: 'apikey' | 'oauth';
  setAuthMethod: (value: 'apikey' | 'oauth') => void;
  provider: string;
  keySource: KeySource;
  setKeySource: (value: KeySource) => void;
  keyValue: string;
  setKeyValue: (value: string) => void;
  hasBuiltInGeminiKey: boolean;
  hasPaidKey: boolean;
  onSelectKey: () => void;
  t: TranslateFn;
};

function KeyConfigPanel({
  isText,
  authMethod,
  setAuthMethod,
  provider,
  keySource,
  setKeySource,
  keyValue,
  setKeyValue,
  hasBuiltInGeminiKey,
  hasPaidKey,
  onSelectKey,
  t,
}: KeyConfigPanelProps) {
  return (
    <div className="space-y-3 pt-1">
      <span className={LABEL_CLS}>{t('authentication')}</span>
      <select
        value={authMethod}
        onChange={(e) => setAuthMethod(e.target.value as 'apikey' | 'oauth')}
        className={SELECT_CLS}
        title={t('authentication')}
        aria-label={t('authentication')}
      >
        <option value="apikey">{t('apiKey')}</option>
        <option value="oauth">{t('oauth')}</option>
      </select>

      {authMethod === 'apikey' ? (
        provider === 'google' ? (
          <div className="space-y-2">
            <select
              value={keySource}
              onChange={(e) => setKeySource(e.target.value as KeySource)}
              className={SELECT_CLS}
              title={t('authentication')}
              aria-label={t('authentication')}
            >
              {hasBuiltInGeminiKey && <option value="builtin">{t('builtInKey')}</option>}
              <option value="custom">{t('customKey')}</option>
              <option value="selected">{t('selectedPaidKey')}</option>
            </select>
            {keySource === 'selected' && (
              <button
                type="button"
                onClick={onSelectKey}
                className="rounded-2xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
              >
                {hasPaidKey ? t('keySelected') : t('selectPaidKey')}
              </button>
            )}
            {keySource === 'custom' && (
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  placeholder={t('enterApiKey')}
                  aria-label={t('enterApiKey')}
                  className="w-full border-0 border-b border-white/12 bg-transparent py-2.5 pl-10 pr-0 font-mono text-xs text-white placeholder-white/25 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder={t('enterApiKey')}
              aria-label={t('enterApiKey')}
              className="w-full border-0 border-b border-white/12 bg-transparent py-2.5 pl-10 pr-0 font-mono text-xs text-white placeholder-white/25 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={() => window.alert(t('oauthAlert'))}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-700 py-2.5 text-white transition-colors hover:bg-amber-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {t('connectWith', {
              provider: (isText ? PROVIDERS : IMAGE_PROVIDERS).find((item) => item.id === provider)?.name || '',
            })}
          </span>
        </button>
      )}
    </div>
  );
}

export default KeyConfigPanel;
