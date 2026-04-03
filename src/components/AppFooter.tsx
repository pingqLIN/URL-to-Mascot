import type { TFunction } from '../types';

type AppFooterProps = {
  t: TFunction;
};

function AppFooter({ t }: AppFooterProps) {
  return (
    <footer className="mx-auto mt-10 max-w-7xl border-t border-white/8 py-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/22">
          {t('footerPoweredBy')}
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/22 transition-colors hover:text-white/42"
          >
            {t('docs')}
          </a>
          <a
            href="#"
            className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/22 transition-colors hover:text-white/42"
          >
            {t('privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
