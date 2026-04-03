import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type WorkspaceStageProps = {
  currentStepTitle: string;
  heroSubtitle: string;
  stageCopy: string;
  workflowStepper: ReactNode;
  briefSection: ReactNode;
  conceptSection: ReactNode;
  previewSection: ReactNode;
};

function WorkspaceStage({
  currentStepTitle,
  heroSubtitle,
  stageCopy,
  workflowStepper,
  briefSection,
  conceptSection,
  previewSection,
}: WorkspaceStageProps) {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] xl:items-start">
        <aside className="space-y-4 xl:sticky xl:top-5">
          <div className="rounded-[1.65rem] border border-white/10 bg-slate-950/34 p-4 backdrop-blur-xl sm:p-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/56">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {currentStepTitle}
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
                  {stageCopy}
                </h2>
                <p className="text-sm leading-6 text-white/52">{heroSubtitle}</p>
              </div>
            </div>

            <div className="mt-5">{workflowStepper}</div>
          </div>

          {briefSection}
          {previewSection}
        </aside>

        <div className="min-w-0">{conceptSection}</div>
      </div>
    </section>
  );
}

export default WorkspaceStage;
