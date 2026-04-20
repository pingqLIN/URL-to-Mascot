import { useEffect, useState } from 'react';
import { IMAGE_MODELS, MODELS } from '../constants';
import type { KeySource, ProviderApiKeyMap } from '../types';

type ApiConfigType = 'text' | 'image';

const INITIAL_PROVIDER: Record<ApiConfigType, string> = {
  text: 'google',
  image: 'google',
};

const INITIAL_MODEL: Record<ApiConfigType, string> = {
  text: 'gemini-2.5-flash',
  image: 'gemini-2.5-flash-image',
};

function getModelMap(type: ApiConfigType) {
  return type === 'text' ? MODELS : IMAGE_MODELS;
}

function resolveDefaultKeySource(
  provider: string,
  builtInApiKeys: ProviderApiKeyMap,
  isAiStudioEnvironment: boolean,
) {
  if (provider === 'google' && !isAiStudioEnvironment) {
    return 'custom';
  }

  return builtInApiKeys[provider as keyof ProviderApiKeyMap] ? 'builtin' : 'custom';
}

export function useApiKeyConfig(
  type: ApiConfigType,
  builtInApiKeys: ProviderApiKeyMap,
  hasPaidKey: boolean,
  isAiStudioEnvironment: boolean,
) {
  const [provider, setProvider] = useState(INITIAL_PROVIDER[type]);
  const [model, setModel] = useState(INITIAL_MODEL[type]);
  const [apiKey, setApiKey] = useState('');
  const [keySource, setKeySource] = useState<KeySource>(
    resolveDefaultKeySource(INITIAL_PROVIDER[type], builtInApiKeys, isAiStudioEnvironment),
  );

  useEffect(() => {
    const models = getModelMap(type);
    setModel(models[provider][0]);
  }, [provider, type]);

  useEffect(() => {
    if (provider !== 'google') {
      setKeySource(resolveDefaultKeySource(provider, builtInApiKeys, isAiStudioEnvironment));
      return;
    }

    if (!isAiStudioEnvironment) {
      setKeySource('custom');
      return;
    }

    if (!builtInApiKeys.google) {
      setKeySource((current) => (current === 'builtin' ? 'custom' : current));
    }
  }, [builtInApiKeys, isAiStudioEnvironment, provider]);

  useEffect(() => {
    if (hasPaidKey) return;

    setKeySource((current) => {
      if (current !== 'selected') return current;
      return builtInApiKeys.google && isAiStudioEnvironment ? 'builtin' : 'custom';
    });
  }, [builtInApiKeys.google, hasPaidKey, isAiStudioEnvironment]);

  return {
    provider,
    setProvider,
    model,
    setModel,
    apiKey,
    setApiKey,
    keySource,
    setKeySource,
  };
}
