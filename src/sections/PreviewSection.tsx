import { Paintbrush, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { PanelVisibilityConfig } from '../types';
import {
  ASPECT_RATIOS,
  IMAGE_MODELS,
  IMAGE_MODEL_NAMES,
  IMAGE_PROVIDERS,
  INPUT_CLS,
  LABEL_CLS,
  SELECT_CLS,
  GLASS_PANEL_CLS,
  STANDARD_EASE,
} from '../constants';
import { isOpenAiAspectRatioFallback } from '../services/imageService';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type PreviewSectionProps = {
  previewStageActive: boolean;
  imageProvider: string;
  setImageProvider: (value: string) => void;
  imageModel: string;
  setImageModel: (value: string) => void;
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  includeText: boolean;
  setIncludeText: (value: boolean) => void;
  imageText: string;
  setImageText: (value: string) => void;
  generatingImage: boolean;
  promptText: string;
  demoMode: boolean;
  panelVisibility: PanelVisibilityConfig;
  renderKeyConfig: () => ReactNode;
  onGenerate: () => void;
  t: TranslateFn;
};

function PreviewSection({
  previewStageActive,
  imageProvider,
  setImageProvider,
  imageModel,
  setImageModel,
  aspectRatio,
  setAspectRatio,
  includeText,
  setIncludeText,
  imageText,
  setImageText,
  generatingImage,
  promptText,
  demoMode,
  panelVisibility,
  renderKeyConfig,
  onGenerate,
  t,
}: PreviewSectionProps) {
  const previewStatusLabel = t('previewPending');
  const stageLabel = t('workflowStepPrompt');
  const stageDescription = t('workflowStepPromptDesc');
  const showOpenAiAspectRatioHint = imageProvider === 'openai' && isOpenAiAspectRatioFallback(aspectRatio);

  return (
    <motion.section
      initial={false}
      animate={{ opacity: previewStageActive ? 1 : 0.93, y: previewStageActive ? 0 : 2 }}
      transition={{ duration: 0.5, ease: STANDARD_EASE }}
      className={`group ${GLASS_PANEL_CLS} overflow-hidden p-4 sm:p-5 ${
        previewStageActive ? 'border-white/24 shadow-[0_22px_64px_rgba(15,23,42,0.24)]' : 'border-white/10'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/75">
            {stageLabel}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white/92">{stageLabel}</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/42">{stageDescription}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/46">
          {previewStatusLabel}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <span className={LABEL_CLS}>{t('imageGeneration')}</span>
            <select
              value={imageProvider}
              onChange={(e) => setImageProvider(e.target.value)}
              title={t('imageGeneration')}
              aria-label={t('imageGeneration')}
              className={SELECT_CLS}
            >
              {IMAGE_PROVIDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className={LABEL_CLS}>{t('imageModel')}</span>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              title={t('imageModel')}
              aria-label={t('imageModel')}
              className={SELECT_CLS}
            >
              {IMAGE_MODELS[imageProvider].map((item) => (
                <option key={item} value={item}>
                  {IMAGE_MODEL_NAMES[item] || item}
                </option>
              ))}
            </select>
          </div>

          {demoMode ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-100/82">
              {t('demoModeHint')}
            </div>
          ) : (
            renderKeyConfig()
          )}
        </div>

        {panelVisibility.imageControls && (
          <div className="space-y-3 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="space-y-2">
              <span className={LABEL_CLS}>{t('aspectRatio')}</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                title={t('aspectRatio')}
                aria-label={t('aspectRatio')}
                className={SELECT_CLS}
              >
                {ASPECT_RATIOS.map((ratio) => (
                  <option key={ratio.id} value={ratio.id}>
                    {t(ratio.nameKey)}
                  </option>
                ))}
              </select>
            </div>
            {showOpenAiAspectRatioHint ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-100/82">
                {t('openAiAspectRatioHint')}
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeTextInline"
                checked={includeText}
                onChange={(e) => setIncludeText(e.target.checked)}
                className="rounded border-white/20 bg-transparent text-amber-700 focus:ring-amber-500"
              />
              <label htmlFor="includeTextInline" className="cursor-pointer text-xs font-medium text-white/58">
                {t('includeTextInImage')}
              </label>
            </div>
            {includeText && (
              <input
                type="text"
                value={imageText}
                onChange={(e) => setImageText(e.target.value)}
                placeholder={t('textInImagePlaceholder')}
                aria-label={t('textInImagePlaceholder')}
                className={INPUT_CLS}
              />
            )}
          </div>
        )}

        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={generatingImage || !promptText}
          whileHover={!generatingImage && promptText ? { scale: 1.01, y: -1 } : {}}
          whileTap={!generatingImage && promptText ? { scale: 0.98 } : {}}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-colors duration-200 ${
            generatingImage || !promptText
              ? 'cursor-wait border border-amber-500/20 bg-amber-500/8 text-amber-300/60'
              : 'bg-amber-700 text-white shadow-lg shadow-amber-700/20 hover:bg-amber-600'
          }`}
        >
          {generatingImage ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{t('generating')}</span>
            </>
          ) : (
            <>
              <Paintbrush className="h-4 w-4 text-amber-300" />
              <span>{t('generatePreviewImage')}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.section>
  );
}

export default PreviewSection;
