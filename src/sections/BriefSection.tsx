import { Bot, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { MascotType, PanelVisibilityConfig } from '../types';
import { GLASS_PANEL_CLS, LABEL_CLS, MODELS, PROVIDERS, SELECT_CLS, STANDARD_EASE } from '../constants';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type BriefSectionProps = {
  briefStageActive: boolean;
  workflowStageIndex: number;
  url: string;
  provider: string;
  setProvider: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  mascotType: MascotType;
  setMascotType: (value: MascotType) => void;
  loading: boolean;
  demoMode: boolean;
  panelVisibility: PanelVisibilityConfig;
  renderKeyConfig: () => ReactNode;
  onGenerate: () => void;
  t: TranslateFn;
};

function BriefSection({
  briefStageActive,
  workflowStageIndex,
  url,
  provider,
  setProvider,
  model,
  setModel,
  mascotType,
  setMascotType,
  loading,
  demoMode,
  panelVisibility,
  renderKeyConfig,
  onGenerate,
  t,
}: BriefSectionProps) {
  const isSupportedTextProvider = (providerId: string) => providerId === 'google';

  return (
    <motion.section
      initial={false}
      animate={{ opacity: briefStageActive ? 1 : 0.93, y: briefStageActive ? 0 : 2 }}
      transition={{ duration: 0.5, ease: STANDARD_EASE }}
      className={`group ${GLASS_PANEL_CLS} overflow-hidden p-4 sm:p-5 ${
        briefStageActive ? 'border-white/24 shadow-[0_22px_64px_rgba(15,23,42,0.24)]' : 'border-white/10'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/75">
            {t('workflowStepSetup')}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white/92">{t('workflowStepSetup')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/42">{t('workflowStepSetupDesc')}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/40">
          {String(workflowStageIndex + 1).padStart(2, '0')} / 04
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-2">
            <span className={LABEL_CLS}>{t('textAnalysis')}</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              title={t('textAnalysis')}
              aria-label={t('textAnalysis')}
              className={SELECT_CLS}
            >
              {PROVIDERS.map((item) => (
                <option key={item.id} value={item.id} disabled={!isSupportedTextProvider(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="text-[10px] leading-relaxed text-white/45">{t('textProviderSupportHint')}</div>
          </div>

          <div className="space-y-2">
            <span className={LABEL_CLS}>{t('textModel')}</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              title={t('textModel')}
              aria-label={t('textModel')}
              className={SELECT_CLS}
            >
              {MODELS[provider].map((item) => (
                <option key={item} value={item}>
                  {item}
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

          {panelVisibility.mascotType && (
            <div className="space-y-2 border-t border-white/6 pt-3">
              <span className={LABEL_CLS}>{t('mascotType')}</span>
              <select
                value={mascotType}
                onChange={(e) => setMascotType(e.target.value as MascotType)}
                className={SELECT_CLS}
                title={t('mascotType')}
                aria-label={t('mascotType')}
              >
                <option value="auto">{t('mascotAuto')}</option>
                <option value="animal">{t('mascotAnimal')}</option>
                <option value="human">{t('mascotHuman')}</option>
                <option value="object">{t('mascotObject')}</option>
              </select>
              <div className="text-[10px] leading-relaxed text-white/45">{t('mascotTypeHint')}</div>
            </div>
          )}

          <motion.button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-colors duration-200 ${
              loading
                ? 'cursor-wait border border-amber-500/20 bg-amber-500/8 text-amber-300/60'
                : 'bg-amber-700 text-white shadow-lg shadow-amber-700/20 hover:bg-amber-600'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t('analyzing')}</span>
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 text-amber-300" />
                <span>{t('generateConcept')}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}

export default BriefSection;
