import { Languages, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';
import type { Locale } from '../i18n/messages';
import type { TFunction } from '../types';

type AppHeaderProps = {
  locale: Locale;
  onToggleLocale: () => void;
  t: TFunction;
};

function AppHeader({ locale, onToggleLocale, t }: AppHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: STANDARD_EASE }}
      className="mb-6 flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/8 bg-slate-950/26 px-4 py-3 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Sparkles className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/88">URL HERO</div>
          <div className="text-[11px] text-white/42">{t('subBrand')}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleLocale}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/68 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <Languages className="h-3.5 w-3.5" />
        {locale === 'en' ? t('traditionalChinese') : t('english')}
      </button>
    </motion.header>
  );
}

export default AppHeader;
