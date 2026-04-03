import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';

type ErrorBannerProps = {
  error: string;
  visible: boolean;
};

function ErrorBanner({ error, visible }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: STANDARD_EASE }}
          className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-[1.5rem] border border-red-500/20 bg-slate-950/46 p-4 backdrop-blur-xl"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs leading-relaxed text-red-300/86">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ErrorBanner;
