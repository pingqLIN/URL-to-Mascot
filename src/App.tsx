import { AnimatePresence, motion } from 'motion/react';
import AppBackdrop from './components/AppBackdrop';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import ErrorBanner from './components/ErrorBanner';
import FloatingSettingsButton from './components/FloatingSettingsButton';
import KeyConfigPanel from './components/KeyConfigPanel';
import SettingsPanel from './components/SettingsPanel';
import UrlInputBar from './components/UrlInputBar';
import WorkflowStepper from './components/WorkflowStepper';
import BriefSection from './sections/BriefSection';
import ConceptSection from './sections/ConceptSection';
import HeroSection from './sections/HeroSection';
import PreviewSection from './sections/PreviewSection';
import WorkspaceStage from './sections/WorkspaceStage';
import { STANDARD_EASE } from './constants';
import { useBgFlash } from './hooks/useBgFlash';
import { useApiKeyConfig } from './hooks/useApiKeyConfig';
import { useKeyDetection } from './hooks/useKeyDetection';
import { useMascotWorkflow } from './hooks/useMascotWorkflow';
import { useWorkflow } from './hooks/useWorkflow';
import { useWorkspaceSettings } from './hooks/useWorkspaceSettings';
import { useI18n } from './i18n/useI18n';
import heroActive from '../HERO/AB.png';
import heroIdle from '../HERO/AA2.png';
import heroWorkspace from '../HERO/A.png';
import bgDepthMap from '../HERO/BG_00_Z.png';
import tb00 from '../HERO/TB_00.jpg';
import tb01 from '../HERO/TB_01.jpg';
import tb02 from '../HERO/TB_02.jpg';
import tb03 from '../HERO/TB_03.jpg';
import tb04 from '../HERO/TB_04.jpg';
import tb05 from '../HERO/TB_05.jpg';
import bgResultFlash from '../HERO/BG/M_BBX.jpg';

const builtInGeminiKey =
  (process.env as Record<string, string | undefined>).API_KEY ||
  (process.env as Record<string, string | undefined>).GEMINI_API_KEY ||
  '';

const hasBuiltInGeminiKey = Boolean(builtInGeminiKey);

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const { demoMode, setDemoMode, hasPaidKey, handleSelectKey } = useKeyDetection(hasBuiltInGeminiKey);
  const textConfig = useApiKeyConfig('text', hasBuiltInGeminiKey, hasPaidKey);
  const imageConfig = useApiKeyConfig('image', hasBuiltInGeminiKey, hasPaidKey);
  const { bgOverride, flashBackground, clearBgTimers } = useBgFlash();
  const {
    stage: workflowStage,
    setStage: setWorkflowStage,
    stageIndex: workflowStageIndex,
    currentStep,
    steps: workflowSteps,
    jumpToStage,
  } = useWorkflow(t);
  const { groups, panelVisibility, showSettings, setShowSettings } = useWorkspaceSettings({
    demoMode,
    setDemoMode,
    t,
  });
  const {
    aspectRatio,
    copied,
    entryMorphProgress,
    error,
    generatedImage,
    generatingImage,
    handleContentChange,
    handleCopy,
    handleEnterBriefStage,
    handleGenerateConcept,
    handleGeneratePreviewImage,
    handleRegeneratePrompt,
    imageText,
    includeText,
    loading,
    mascotType,
    promptText,
    regeneratingPrompt,
    result,
    setAspectRatio,
    setError,
    setImageText,
    setIncludeText,
    setManualPrompt,
    setMascotType,
    setUrl,
    url,
    urlValidationError,
  } = useMascotWorkflow({
    bgResultFlash,
    builtInGeminiKey,
    clearBgTimers,
    demoMode,
    demoImages: {
      animal: heroActive,
      human: heroWorkspace,
      object: heroIdle,
      auto: heroWorkspace,
    },
    flashBackground,
    imageConfig,
    locale,
    setWorkflowStage,
    t,
    textConfig,
  });

  const contentStageActive = workflowStage !== 'entry';
  const previewStageActive = workflowStage === 'preview';
  const briefStageActive = workflowStage === 'brief';
  const entryInlineError = error === t('errorNoUrl') || error === t('errorInvalidUrlFormat') ? error : '';
  const workspaceStageCopy =
    workflowStage === 'brief'
      ? t('workflowStepBriefDesc')
      : workflowStage === 'analysis'
      ? t('workflowStepAnalysisDesc')
      : workflowStage === 'prompt'
        ? t('workflowStepPromptDesc')
        : workflowStage === 'preview'
          ? t('workflowStepPreviewDesc')
          : t('workflowStepBriefDesc');

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-amber-500/30">
      <style>{`[data-temp-top="true"] { position: relative !important; z-index: 9999 !important; }`}</style>
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id="hero-glass-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
      </svg>

      <AppBackdrop bgDepthMap={bgDepthMap} bgOverride={bgOverride} bgSequence={[tb00, tb01, tb02, tb03, tb04, tb05]} />
      <FloatingSettingsButton onClick={() => setShowSettings(true)} t={t} />

      <AnimatePresence>
        <SettingsPanel
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          demoMode={demoMode}
          groups={groups}
          t={t}
        />
      </AnimatePresence>

      <main className="relative z-10 h-screen overflow-y-auto scrollbar-visible">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <AppHeader locale={locale} onToggleLocale={() => setLocale(locale === 'en' ? 'zh-TW' : 'en')} t={t} />

          <AnimatePresence mode="wait">
            {workflowStage === 'entry' ? (
              <motion.div
                key="entry"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: STANDARD_EASE }}
              >
                <HeroSection
                  url={url}
                  entryMorphProgress={entryMorphProgress}
                  heroIdle={heroIdle}
                  heroActive={heroActive}
                  renderUrlInputBar={() => (
                    <UrlInputBar
                      variant="hero"
                      url={url}
                      setUrl={setUrl}
                      loading={loading}
                      error={error}
                      inlineError={entryInlineError}
                      urlValidationError={urlValidationError}
                      onSubmit={handleEnterBriefStage}
                      onClearError={() => setError('')}
                      t={t}
                    />
                  )}
                  t={t}
                />
              </motion.div>
            ) : (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: STANDARD_EASE }}
              >
                <WorkspaceStage
                  currentStepTitle={currentStep.title}
                  heroSubtitle={t('heroSubtitle')}
                  stageCopy={workspaceStageCopy}
                  workflowStepper={
                    <WorkflowStepper
                      steps={workflowSteps}
                      currentStage={workflowStage}
                      stageIndex={workflowStageIndex}
                      hasResult={Boolean(result)}
                      onJumpToStage={jumpToStage}
                    />
                  }
                  briefSection={
                    <BriefSection
                      briefStageActive={briefStageActive}
                      workflowStageIndex={workflowStageIndex}
                      url={url}
                      provider={textConfig.provider}
                      setProvider={textConfig.setProvider}
                      model={textConfig.model}
                      setModel={textConfig.setModel}
                      mascotType={mascotType}
                      setMascotType={setMascotType}
                      loading={loading}
                      demoMode={demoMode}
                      panelVisibility={panelVisibility}
                      renderUrlInputBar={() => (
                        <UrlInputBar
                          variant="panel"
                          url={url}
                          setUrl={setUrl}
                          loading={loading}
                          error={error}
                          urlValidationError={urlValidationError}
                          onSubmit={handleGenerateConcept}
                          onClearError={() => setError('')}
                          t={t}
                        />
                      )}
                      renderKeyConfig={() => (
                        <KeyConfigPanel
                          isText
                          authMethod={textConfig.authMethod}
                          setAuthMethod={textConfig.setAuthMethod}
                          provider={textConfig.provider}
                          keySource={textConfig.keySource}
                          setKeySource={textConfig.setKeySource}
                          keyValue={textConfig.apiKey}
                          setKeyValue={textConfig.setApiKey}
                          hasBuiltInGeminiKey={hasBuiltInGeminiKey}
                          hasPaidKey={hasPaidKey}
                          onSelectKey={handleSelectKey}
                          t={t}
                        />
                      )}
                      onGenerate={handleGenerateConcept}
                      t={t}
                    />
                  }
                  conceptSection={
                    <ConceptSection
                      contentStageActive={contentStageActive}
                      loading={loading}
                      result={result}
                      url={url}
                      promptText={promptText}
                      copied={copied}
                      regeneratingPrompt={regeneratingPrompt}
                      generatingImage={generatingImage}
                      generatedImage={generatedImage}
                      imageModel={imageConfig.model}
                      panelVisibility={panelVisibility}
                      onContentChange={handleContentChange}
                      onManualPromptChange={setManualPrompt}
                      onCopy={handleCopy}
                      onRegeneratePrompt={handleRegeneratePrompt}
                      renderWorkflowStepper={() => (
                        <WorkflowStepper
                          steps={workflowSteps}
                          currentStage={workflowStage}
                          stageIndex={workflowStageIndex}
                          hasResult={Boolean(result)}
                          onJumpToStage={jumpToStage}
                        />
                      )}
                      t={t}
                    />
                  }
                  previewSection={
                    <PreviewSection
                      previewStageActive={previewStageActive}
                      imageProvider={imageConfig.provider}
                      setImageProvider={imageConfig.setProvider}
                      imageModel={imageConfig.model}
                      setImageModel={imageConfig.setModel}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      includeText={includeText}
                      setIncludeText={setIncludeText}
                      imageText={imageText}
                      setImageText={setImageText}
                      generatingImage={generatingImage}
                      generatedImage={generatedImage}
                      promptText={promptText}
                      demoMode={demoMode}
                      panelVisibility={panelVisibility}
                      renderKeyConfig={() => (
                        <KeyConfigPanel
                          isText={false}
                          authMethod={imageConfig.authMethod}
                          setAuthMethod={imageConfig.setAuthMethod}
                          provider={imageConfig.provider}
                          keySource={imageConfig.keySource}
                          setKeySource={imageConfig.setKeySource}
                          keyValue={imageConfig.apiKey}
                          setKeyValue={imageConfig.setApiKey}
                          hasBuiltInGeminiKey={hasBuiltInGeminiKey}
                          hasPaidKey={hasPaidKey}
                          onSelectKey={handleSelectKey}
                          t={t}
                        />
                      )}
                      onGenerate={handleGeneratePreviewImage}
                      t={t}
                    />
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
          <ErrorBanner error={error} visible={Boolean(error) && workflowStage !== 'entry'} />
          <AppFooter t={t} />
        </div>
      </main>
    </div>
  );
}
