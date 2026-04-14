import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';
import LiquidGlass from './LiquidGlass';

type ErrorBannerProps = {
  message: string;
  tone?: 'error' | 'info';
  visible: boolean;
};

function ErrorBanner({ message, tone = 'error', visible }: ErrorBannerProps) {
  const isError = tone === 'error';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role={isError ? 'alert' : 'status'}
          aria-live={isError ? 'assertive' : 'polite'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: STANDARD_EASE }}
          className="mx-auto mt-6 max-w-3xl"
        >
          <LiquidGlass
            variant="compact"
            className={`flex items-start gap-3 p-4 ${isError ? 'border-red-500/22' : 'border-amber-500/22'}`}
          >
            <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? 'text-red-400' : 'text-amber-300'}`} />
            <p className={`text-xs leading-relaxed ${isError ? 'text-red-300/86' : 'text-amber-100/86'}`}>{message}</p>
          </LiquidGlass>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ErrorBanner;
