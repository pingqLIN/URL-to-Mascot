import { useEffect, useState } from 'react';
import type { AiStudioBridge } from '../types';

function getAiStudio(): AiStudioBridge | undefined {
  return (window as Window & { aistudio?: AiStudioBridge }).aistudio;
}

export function useKeyDetection(hasBuiltInKey: boolean) {
  const [demoMode, setDemoMode] = useState(false);
  const [hasPaidKey, setHasPaidKey] = useState(false);
  const [isAiStudioEnvironment, setIsAiStudioEnvironment] = useState(false);
  const [hasCheckedPaidKey, setHasCheckedPaidKey] = useState(false);
  const [hasInitializedDemoMode, setHasInitializedDemoMode] = useState(false);

  useEffect(() => {
    let active = true;

    const checkKey = async () => {
      const aistudio = getAiStudio();
      const nextHasPaidKey = aistudio ? await aistudio.hasSelectedApiKey() : false;

      if (!active) return;
      setIsAiStudioEnvironment(Boolean(aistudio));
      setHasPaidKey(nextHasPaidKey);
      setHasCheckedPaidKey(true);
    };

    void checkKey();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasCheckedPaidKey || hasInitializedDemoMode) return;

    setDemoMode(!hasBuiltInKey && !hasPaidKey);
    setHasInitializedDemoMode(true);
  }, [hasBuiltInKey, hasCheckedPaidKey, hasInitializedDemoMode, hasPaidKey]);

  const handleSelectKey = async () => {
    const aistudio = getAiStudio();
    if (!aistudio) return;

    await aistudio.openSelectKey();
    setHasPaidKey(true);
  };

  return {
    demoMode,
    setDemoMode,
    hasPaidKey,
    isAiStudioEnvironment,
    handleSelectKey,
  };
}
