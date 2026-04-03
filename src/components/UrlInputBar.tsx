import { ArrowRight, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { STANDARD_EASE } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type UrlInputBarProps = {
  variant: 'hero' | 'panel';
  url: string;
  setUrl: (value: string) => void;
  loading: boolean;
  error: string;
  inlineError?: string;
  urlValidationError: string;
  onSubmit: () => void;
  onClearError: () => void;
  t: TranslateFn;
};

function UrlInputBar({
  variant,
  url,
  setUrl,
  loading,
  error,
  inlineError = '',
  urlValidationError,
  onSubmit,
  onClearError,
  t,
}: UrlInputBarProps) {
  const isHero = variant === 'hero';
  const glowActive = true;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-[1.9rem] border bg-slate-950/38 backdrop-blur-2xl transition-all duration-300 ${
        glowActive
          ? 'border-white/42 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_38px_rgba(255,255,255,0.12),0_20px_54px_rgba(15,23,42,0.22)]'
          : 'border-white/18 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_44px_rgba(15,23,42,0.16)]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-[1px] rounded-[calc(1.9rem-1px)] border border-white/18" />
        <div className="absolute -inset-px rounded-[1.9rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(250,204,21,0.08),transparent_70%)] opacity-85 blur-xl" />
      </div>
      <div className={`relative flex items-center gap-3 ${isHero ? 'px-4 py-3.5 sm:px-5 sm:py-4' : 'px-4 py-3.5'}`}>
        <Globe className={`h-[18px] w-[18px] shrink-0 text-white/34 ${isHero ? 'sm:h-[18px] sm:w-[18px]' : ''}`} />
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value.replace(/^https?:\/\//, ''));
            if (error) onClearError();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
          placeholder={t('landingInputPlaceholder')}
          className={`flex-1 bg-transparent text-white placeholder-white/24 outline-none ${
            isHero ? 'text-sm sm:text-[0.98rem]' : 'text-sm'
          }`}
          aria-label={t('targetWebsite')}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95 ${
            loading
              ? 'cursor-wait border border-white/10 bg-white/8 text-white/32'
              : 'bg-amber-700 shadow-[0_10px_28px_rgba(180,83,9,0.26)] hover:bg-amber-600'
          } ${isHero ? 'sm:h-10 sm:w-10' : ''}`}
        >
          {loading ? <RefreshCw className="h-[18px] w-[18px] animate-spin" /> : <ArrowRight className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {(urlValidationError || (isHero && inlineError)) && (
        <div className="px-5 pb-3 pt-0">
          {urlValidationError ? <p className="text-[11px] text-amber-400/70">{urlValidationError}</p> : null}
          {isHero && inlineError ? (
            <p role="alert" aria-live="assertive" className="mt-1 text-[11px] text-red-300/86">
              {inlineError}
            </p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

export default UrlInputBar;
