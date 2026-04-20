import { Key } from 'lucide-react';
import type { KeySource, ProviderApiKeyMap } from '../types';
import { LABEL_CLS, SELECT_CLS } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type KeyConfigPanelProps = {
  isAiStudioEnvironment: boolean;
  provider: string;
  keySource: KeySource;
  setKeySource: (value: KeySource) => void;
  keyValue: string;
  setKeyValue: (value: string) => void;
  builtInApiKeys: ProviderApiKeyMap;
  hasPaidKey: boolean;
  onSelectKey: () => void;
  t: TranslateFn;
};

function KeyConfigPanel({
  isAiStudioEnvironment,
  provider,
  keySource,
  setKeySource,
  keyValue,
  setKeyValue,
  builtInApiKeys,
  hasPaidKey,
  onSelectKey,
  t,
}: KeyConfigPanelProps) {
  const hasBuiltInKey = Boolean(builtInApiKeys[provider as keyof ProviderApiKeyMap]);
  const showsGoogleAiStudioOptions = provider === 'google' && isAiStudioEnvironment;
  const showsKeySourceSelector = showsGoogleAiStudioOptions || (provider !== 'google' && hasBuiltInKey);
  const keySourceOptions =
    showsGoogleAiStudioOptions
      ? [
          ...(hasBuiltInKey ? [{ value: 'builtin', label: t('builtInKey') }] : []),
          { value: 'custom', label: t('customKey') },
          { value: 'selected', label: t('selectedPaidKey') },
        ]
      : [
          ...(hasBuiltInKey ? [{ value: 'builtin', label: t('builtInKey') }] : []),
          { value: 'custom', label: t('customKey') },
        ];

  return (
    <div className="space-y-3 pt-1">
      {showsKeySourceSelector ? (
        <>
          <span className={LABEL_CLS}>{t('keySource')}</span>
          {keySourceOptions.length > 1 ? (
            <select
              value={keySource}
              onChange={(e) => setKeySource(e.target.value as KeySource)}
              className={SELECT_CLS}
              title={t('keySource')}
              aria-label={t('keySource')}
            >
              {keySourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
          {showsGoogleAiStudioOptions && keySource === 'selected' ? (
            <button
              type="button"
              onClick={onSelectKey}
              className="rounded-2xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
            >
              {hasPaidKey ? t('keySelected') : t('selectPaidKey')}
            </button>
          ) : null}
          {keySource === 'custom' ? (
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
          ) : null}
        </>
      ) : (
        <>
          <span className={LABEL_CLS}>{t('apiKey')}</span>
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
        </>
      )}
    </div>
  );
}

export default KeyConfigPanel;
