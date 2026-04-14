import type { ReactNode } from 'react';

type WorkspaceStageProps = {
  briefSection: ReactNode;
  conceptSection: ReactNode;
  previewSection: ReactNode;
};

function WorkspaceStage({ briefSection, conceptSection, previewSection }: WorkspaceStageProps) {
  const showConceptSection = Boolean(conceptSection);

  return (
    <section className={`mx-auto w-full ${showConceptSection ? 'max-w-7xl' : 'max-w-[360px]'}`}>
      <div
        className={`grid gap-4 ${
          showConceptSection ? 'xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] xl:items-start' : ''
        }`}
      >
        <aside className="space-y-4 xl:sticky xl:top-5">
          {briefSection}
          {previewSection}
        </aside>

        {showConceptSection ? <div className="min-w-0">{conceptSection}</div> : null}
      </div>
    </section>
  );
}

export default WorkspaceStage;
