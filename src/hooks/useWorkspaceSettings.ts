import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { DEFAULT_PANEL_VISIBILITY } from '../constants';
import type { PanelVisibilityConfig, TFunction } from '../types';

type UseWorkspaceSettingsParams = {
  demoMode: boolean;
  setDemoMode: Dispatch<SetStateAction<boolean>>;
  t: TFunction;
};

export function useWorkspaceSettings({ demoMode, setDemoMode, t }: UseWorkspaceSettingsParams) {
  const [showSettings, setShowSettings] = useState(false);
  const [panelVisibility, setPanelVisibility] = useState<PanelVisibilityConfig>(DEFAULT_PANEL_VISIBILITY);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groups = useMemo(
    () => [
      {
        title: t('settingsDisplayGroup'),
        description: t('additionalSettingsHint'),
        items: [
          {
            label: t('showAnalysisCards'),
            value: panelVisibility.analysisCards,
            setter: () => setPanelVisibility((previous) => ({ ...previous, analysisCards: !previous.analysisCards })),
          },
          {
            label: t('showPromptPanel'),
            value: panelVisibility.promptPanel,
            setter: () => setPanelVisibility((previous) => ({ ...previous, promptPanel: !previous.promptPanel })),
          },
          {
            label: t('showImageControls'),
            value: panelVisibility.imageControls,
            setter: () => setPanelVisibility((previous) => ({ ...previous, imageControls: !previous.imageControls })),
          },
          {
            label: t('showMascotType'),
            value: panelVisibility.mascotType,
            setter: () => setPanelVisibility((previous) => ({ ...previous, mascotType: !previous.mascotType })),
          },
        ],
      },
      {
        title: t('settingsRuntimeGroup'),
        description: t('demoModeHint'),
        items: [{ label: t('demoMode'), value: demoMode, setter: () => setDemoMode((previous) => !previous) }],
      },
    ],
    [demoMode, panelVisibility, setDemoMode, t],
  );

  return {
    groups,
    panelVisibility,
    setPanelVisibility,
    showSettings,
    setShowSettings,
  };
}
