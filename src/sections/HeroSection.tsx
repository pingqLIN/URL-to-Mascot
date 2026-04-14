import { motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';
import type { ReactNode } from 'react';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type HeroSectionProps = {
  url: string;
  entryMorphProgress: number;
  heroIdle: string;
  heroActive: string;
  renderUrlInputBar: () => ReactNode;
  t: TranslateFn;
};

function HeroSection({ entryMorphProgress, heroIdle, heroActive, renderUrlInputBar, t }: HeroSectionProps) {
  return (
    <section className="app-hero-viewport relative flex w-full min-h-0 items-center justify-center py-1 sm:py-2">
      <div className="relative h-full min-h-0 w-full max-w-[920px] max-h-[720px]">
        <div className="hero-glass-orb hero-glass-orb--cyan absolute left-[8%] top-[14%] h-28 w-28 sm:h-36 sm:w-36" />
        <div className="hero-glass-orb hero-glass-orb--amber absolute right-[12%] top-[10%] h-24 w-24 sm:h-32 sm:w-32" />
        <div className="hero-glass-orb hero-glass-orb--violet absolute bottom-[28%] right-[16%] h-32 w-32 sm:h-44 sm:w-44" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: STANDARD_EASE }}
          className="absolute inset-x-0 bottom-[clamp(8px,4vh,40px)] z-20 flex justify-center"
        >
          <div className="relative mb-[clamp(52px,12vh,162px)] sm:mb-[clamp(68px,14vh,184px)]">
            <motion.div
              data-robot="true"
              aria-hidden="true"
              className="pointer-events-none relative select-none"
              animate={{ y: [0, -18, 0], rotate: [-1.8, 1.8, -1.8], scale: [1, 1.022, 1] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.img
                src={heroIdle}
                alt={t('mascotImageAlt')}
                draggable={false}
                animate={{ opacity: 1 - entryMorphProgress }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-none select-none h-[clamp(200px,42vh,500px)] w-auto max-w-none object-contain object-bottom"
              />
              <motion.img
                src={heroActive}
                alt={t('mascotImageAlt')}
                draggable={false}
                animate={{ opacity: entryMorphProgress }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-none select-none absolute inset-0 h-[clamp(200px,42vh,500px)] w-auto max-w-none object-contain object-bottom"
              />
            </motion.div>

            <div className="absolute left-1/2 top-[58%] z-20 w-[min(320px,calc(100vw-2rem))] -translate-x-1/2 sm:w-[400px]">
              {renderUrlInputBar()}
            </div>

            <div className="absolute bottom-3 left-1/2 h-4 w-28 -translate-x-1/2 rounded-[100%] bg-amber-300/16 blur-xl" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: STANDARD_EASE }}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-center"
        />
      </div>
    </section>
  );
}

export default HeroSection;
