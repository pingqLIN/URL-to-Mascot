import type { ReactNode } from 'react';
import type { WorkflowStage } from '../types';

type WorkflowStep = {
  id: WorkflowStage;
  title: string;
};

type WorkflowStepperProps = {
  leadItem?: ReactNode;
  steps: WorkflowStep[];
  currentStage: WorkflowStage;
  stageIndex: number;
  hasResult: boolean;
  indexOffset?: number;
  columns?: number;
  onJumpToStage: (stage: WorkflowStage) => void;
};

function WorkflowStepper({
  leadItem,
  steps,
  currentStage,
  stageIndex,
  hasResult,
  indexOffset = 0,
  columns = 5,
  onJumpToStage,
}: WorkflowStepperProps) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {leadItem}
      {steps.map((step, index) => {
        const isActive = currentStage === step.id;
        const isComplete = stageIndex > index;
        const clickable = step.id === 'entry' || step.id === 'brief' || hasResult;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!clickable}
            onClick={() => onJumpToStage(step.id)}
            className={`group rounded-[1.35rem] border p-3 text-left transition-all duration-200 ${
              isActive
                ? 'border-white/28 bg-white/[0.08] shadow-[0_12px_32px_rgba(15,23,42,0.2)]'
                : isComplete
                  ? 'border-white/16 bg-white/[0.04] hover:border-white/24 hover:bg-white/[0.06]'
                  : 'border-white/10 bg-slate-950/30 opacity-90 hover:border-white/16 hover:bg-white/[0.04]'
            } ${!clickable ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/36">
                  {String(index + indexOffset + 1).padStart(2, '0')}
                </div>
                <div className={`mt-1 text-sm font-semibold ${isActive ? 'text-white' : 'text-white/72'}`}>
                  {step.title}
                </div>
              </div>
              <div
                className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                  isActive
                    ? 'bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.7)]'
                    : isComplete
                      ? 'bg-emerald-300/80'
                      : 'bg-white/18'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default WorkflowStepper;
