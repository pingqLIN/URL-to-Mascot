import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type WorkspaceStageProps = {
  briefSection: ReactNode;
  conceptSection: ReactNode;
  previewSection: ReactNode;
};

function WorkspaceStage({ briefSection, conceptSection, previewSection }: WorkspaceStageProps) {
  const showConceptSection = Boolean(conceptSection);

  return (
    <section className={`mx-auto w-full h-full ${showConceptSection ? 'max-w-7xl' : 'max-w-[360px]'}`}>
      <div
        className={`grid gap-4 h-full ${
          showConceptSection ? 'xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] xl:items-start' : ''
        }`}
      >
        <aside className="space-y-4 xl:sticky xl:top-0 flex flex-col max-h-full overflow-y-auto scrollbar-visible pr-2 pb-10 pt-2">
          <AnimatePresence mode="popLayout">
            {briefSection && (
              <motion.div
                key="brief"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {briefSection}
              </motion.div>
            )}
            {previewSection && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {previewSection}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <AnimatePresence mode="popLayout">
          {showConceptSection && (
            <motion.div
              key="concept"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-w-0 h-full max-h-full overflow-y-auto scrollbar-visible pr-2 pb-10 pt-2"
            >
              {conceptSection}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default WorkspaceStage;
