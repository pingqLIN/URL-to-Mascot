import { useMemo, useState } from 'react';
import { WORKFLOW_STAGES } from '../constants';
import type { TFunction, WorkflowStage } from '../types';

export function useWorkflow(t: TFunction) {
  const [stage, setStage] = useState<WorkflowStage>('entry');

  const steps = useMemo(
    () => [
      { id: 'entry' as const, title: t('workflowStepBrief'), desc: t('workflowStepBriefDesc') },
      { id: 'brief' as const, title: t('workflowStepBrief'), desc: t('workflowStepBriefDesc') },
      { id: 'analysis' as const, title: t('workflowStepAnalysis'), desc: t('workflowStepAnalysisDesc') },
      { id: 'prompt' as const, title: t('workflowStepPrompt'), desc: t('workflowStepPromptDesc') },
      { id: 'preview' as const, title: t('workflowStepPreview'), desc: t('workflowStepPreviewDesc') },
    ],
    [t],
  );

  const stageIndex = Math.max(0, WORKFLOW_STAGES.indexOf(stage));
  const currentStep = steps[stageIndex];

  const jumpToStage = (nextStage: WorkflowStage) => {
    setStage(nextStage);
  };

  return {
    stage,
    setStage,
    stageIndex,
    currentStep,
    steps,
    jumpToStage,
  };
}
