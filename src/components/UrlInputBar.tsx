import { ArrowRight, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { type CSSProperties, useState } from 'react';
import { STANDARD_EASE } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

const SEARCHBOX_PARAMS = {
  // Match the Chrome demo controls shown in the article screenshot.
  specularOpacity: 0.63,
  specularSaturation: 9,
  refractionLevel: 0.39,
  blurLevel: 8,
} as const;

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
  const [isFocused, setIsFocused] = useState(false);
  const [inputPulse, setInputPulse] = useState(0);

  return (
    <motion.div
      className="group fluid-input-stage"
      animate={{
        scale: isFocused ? 1.045 : 1,
        scaleX: inputPulse ? [1, 1.018, 0.996, 1] : 1,
        scaleY: inputPulse ? [1, 0.982, 1.008, 1] : 1,
        y: isFocused ? -2 : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 320, damping: 24 },
        scaleX: { duration: 0.28, ease: STANDARD_EASE },
        scaleY: { duration: 0.28, ease: STANDARD_EASE },
        y: { type: 'spring', stiffness: 260, damping: 24 },
      }}
    >
      <div
        className={`searchbox-liquid ${isHero ? 'searchbox-liquid--hero' : 'searchbox-liquid--panel'} ${
          isFocused ? 'searchbox-liquid--focused' : ''
        }`}
        style={
          {
            '--searchbox-specular-opacity': SEARCHBOX_PARAMS.specularOpacity,
            '--searchbox-specular-saturation': SEARCHBOX_PARAMS.specularSaturation,
            '--searchbox-refraction-level': SEARCHBOX_PARAMS.refractionLevel,
            '--searchbox-blur-level': SEARCHBOX_PARAMS.blurLevel,
          } as CSSProperties
        }
      >
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <defs>
            <filter id="searchbox-filter" colorInterpolationFilters="sRGB" x="-22%" y="-22%" width="144%" height="144%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={SEARCHBOX_PARAMS.blurLevel} result="blurred_source" />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.011 0.024"
                numOctaves="2"
                seed="11"
                result="displacement_noise"
              />
              <feDisplacementMap
                in="blurred_source"
                in2="displacement_noise"
                scale={SEARCHBOX_PARAMS.refractionLevel * 100}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feGaussianBlur in="displaced" stdDeviation="0.65" result="displaced_soft" />
              <feColorMatrix in="displaced_soft" type="saturate" values="1.04" result="displaced_saturated" />
              <feSpecularLighting
                in="displaced_soft"
                surfaceScale="2.85"
                specularConstant={SEARCHBOX_PARAMS.specularOpacity}
                specularExponent="28"
                lightingColor="white"
                result="specular"
              >
                <feDistantLight azimuth="-64" elevation="43" />
              </feSpecularLighting>
              <feColorMatrix
                in="specular"
                type="saturate"
                values={SEARCHBOX_PARAMS.specularSaturation}
                result="specular_saturated"
              />
              <feComposite in="specular_saturated" in2="displaced_saturated" operator="in" result="specular_masked" />
              <feBlend in="displaced_saturated" in2="specular_masked" mode="screen" />
            </filter>
          </defs>
        </svg>

        <div className="searchbox-liquid__backdrop" aria-hidden="true" />
        <div className="searchbox-liquid__highlight" aria-hidden="true" />

        <div className={`searchbox-liquid__content ${isHero ? 'px-5 py-3.5 sm:py-4' : 'px-5 py-3.5'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="fluid-input-icon-shell">
              <Globe className={`h-[17px] w-[17px] shrink-0 text-white/56 ${isHero ? 'sm:h-[18px] sm:w-[18px]' : ''}`} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value.replace(/^https?:\/\//, ''));
                if (error) onClearError();
                setInputPulse((value) => value + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit();
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('landingInputPlaceholder')}
              className={`fluid-input-field min-w-0 flex-1 bg-transparent text-white outline-none ${
                isHero ? 'text-sm sm:text-[0.98rem]' : 'text-sm'
              }`}
              aria-label={t('targetWebsite')}
            />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className={`fluid-input-submit relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden text-white transition-all active:scale-95 ${
              loading ? 'cursor-wait text-white/32' : ''
            } ${isHero ? 'sm:h-10 sm:w-10' : ''}`}
          >
            <span className="fluid-input-submit__halo" aria-hidden="true" />
            <span className="fluid-input-submit__core" aria-hidden="true" />
            {loading ? (
              <RefreshCw className="relative z-10 h-[18px] w-[18px] animate-spin" />
            ) : (
              <ArrowRight className="relative z-10 h-[18px] w-[18px]" />
            )}
          </button>
        </div>
        {(urlValidationError || (isHero && inlineError)) && (
          <div className="px-5 pb-3 pt-0">
            {urlValidationError ? <p className="text-[11px] text-amber-300/76">{urlValidationError}</p> : null}
            {isHero && inlineError ? (
              <p role="alert" aria-live="assertive" className="mt-1 text-[11px] text-red-300/86">
                {inlineError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default UrlInputBar;
