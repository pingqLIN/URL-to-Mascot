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

function HeroSection({
  entryMorphProgress,
  heroIdle,
  heroActive,
  renderUrlInputBar,
  t,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-160px)] w-full items-center justify-center py-2">
      <div className="relative h-[clamp(360px,60vh,620px)] w-full max-w-[720px]">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: STANDARD_EASE }}
          className="pointer-events-none absolute inset-x-0 top-[clamp(72px,10vh,112px)] z-10 px-6 text-center select-none [@media(max-height:600px)]:hidden"
        >
          <div className="mx-auto w-full max-w-5xl">
            <h1 className="text-[clamp(4.4rem,18vw,11.5rem)] font-black uppercase leading-none tracking-[-0.06em]">
              <span className="relative inline-block">
                <motion.span
                  className="hero-title-glass-primary absolute inset-0 text-transparent"
                  animate={{ opacity: [0.72, 0.95, 0.72] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  URL HERO
                </motion.span>
                <span className="hero-title-glass-secondary absolute inset-0 text-transparent">URL HERO</span>
                <span className="hero-title-glass-base text-transparent">URL HERO</span>
              </span>
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: STANDARD_EASE }}
          className="absolute inset-x-0 bottom-[clamp(8px,4vh,40px)] flex justify-center"
        >
          <div className="relative mb-[clamp(76px,16vh,162px)] sm:mb-[clamp(92px,18vh,184px)]">
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
                className="pointer-events-none select-none h-[clamp(220px,50vh,500px)] w-auto max-w-none object-contain object-bottom"
              />
              <motion.img
                src={heroActive}
                alt={t('mascotImageAlt')}
                draggable={false}
                animate={{ opacity: entryMorphProgress }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-none select-none absolute inset-0 h-[clamp(220px,50vh,500px)] w-auto max-w-none object-contain object-bottom"
              />
            </motion.div>

            <div className="absolute left-1/2 top-[56%] z-20 w-[min(300px,calc(100vw-2rem))] -translate-x-1/2 sm:w-[380px]">
              {renderUrlInputBar()}
            </div>

            <div className="absolute bottom-3 left-1/2 h-4 w-28 -translate-x-1/2 rounded-[100%] bg-amber-300/20 blur-xl" />
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
