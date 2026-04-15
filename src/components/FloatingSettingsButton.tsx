import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { TFunction } from '../types';

type FloatingSettingsButtonProps = {
  onClick: () => void;
  t: TFunction;
};

function FloatingSettingsButton({ onClick, t }: FloatingSettingsButtonProps) {
  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.28 }}
        onClick={onClick}
        title={t('additionalSettings')}
        aria-label={t('additionalSettings')}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/80 bg-slate-900/92 shadow-[0_0_0_1px_rgba(252,211,77,0.2),0_0_28px_rgba(251,191,36,0.18),0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-200 hover:border-amber-200 hover:bg-slate-800"
      >
        <Sparkles className="h-4 w-4 text-white/55" />
      </motion.button>
    </AnimatePresence>
  );
}

export default FloatingSettingsButton;
