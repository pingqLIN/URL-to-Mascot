import { Download } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type FinalPreviewStageProps = {
  generatedImage: string;
  generatingImage: boolean;
  t: TranslateFn;
};

function FinalPreviewStage({ generatedImage, generatingImage, t }: FinalPreviewStageProps) {
  const showWaitingState = generatingImage || !generatedImage;

  const handleDownload = () => {
    if (!generatedImage || typeof document === 'undefined') {
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'url-hero-preview.png';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="flex h-full min-h-0 items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {showWaitingState ? (
          <motion.div
            key="preview-waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: STANDARD_EASE }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/18 px-6 py-4 backdrop-blur-sm">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-2.5 w-2.5 rounded-full bg-white/72"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.92, 1.08, 0.92] }}
                  transition={{
                    duration: 0.9,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: index * 0.18,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview-image"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: STANDARD_EASE }}
            className="relative flex h-full w-full items-center justify-center pb-[8vh]"
          >
            <button
              type="button"
              onClick={handleDownload}
              className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-amber-300/38 bg-amber-500/22 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,158,11,0.22)] backdrop-blur-md transition-all hover:border-amber-200/56 hover:bg-amber-400/32 hover:shadow-[0_22px_52px_rgba(245,158,11,0.3)]"
            >
              <Download className="h-4 w-4 text-amber-100" />
              <span>{t('downloadImage')}</span>
            </button>
            <img
              src={generatedImage}
              alt={t('mascotPreviewAlt')}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default FinalPreviewStage;
