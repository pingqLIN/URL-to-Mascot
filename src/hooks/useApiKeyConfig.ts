import { useEffect, useState } from 'react';
import { IMAGE_MODELS, MODELS } from '../constants';
import type { KeySource } from '../types';

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

export function useApiKeyConfig(type: ApiConfigType, hasBuiltInGeminiKey: boolean, hasPaidKey: boolean) {
  const [provider, setProvider] = useState(INITIAL_PROVIDER[type]);
  const [model, setModel] = useState(INITIAL_MODEL[type]);
  const [apiKey, setApiKey] = useState('');
  const [authMethod, setAuthMethod] = useState<'apikey' | 'oauth'>('apikey');
  const [keySource, setKeySource] = useState<KeySource>(hasBuiltInGeminiKey ? 'builtin' : 'custom');

  useEffect(() => {
    const models = getModelMap(type);
    setModel(models[provider][0]);
  }, [provider, type]);

  useEffect(() => {
    if (provider !== 'google') {
      setKeySource('custom');
      return;
    }

    if (!hasBuiltInGeminiKey) {
      setKeySource((current) => (current === 'builtin' ? 'custom' : current));
    }
  }, [hasBuiltInGeminiKey, provider]);

  useEffect(() => {
    if (hasPaidKey) return;

    setKeySource((current) => {
      if (current !== 'selected') return current;
      return hasBuiltInGeminiKey ? 'builtin' : 'custom';
    });
  }, [hasBuiltInGeminiKey, hasPaidKey]);

  return {
    provider,
    setProvider,
    model,
    setModel,
    apiKey,
    setApiKey,
    authMethod,
    setAuthMethod,
    keySource,
    setKeySource,
  };
}
