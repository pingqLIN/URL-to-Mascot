import { useMemo, useState } from 'react';
import { buildDemoConceptResult, buildSystemPrompt, fetchConcept, fetchRegeneratedPrompt } from '../services/conceptService';
import { getReadableApiError } from '../services/errorService';
import { generateImage } from '../services/imageService';
import type { Locale } from '../i18n/messages';
import type { ConceptResult, MascotType, SectionKey, TFunction, WorkflowStage } from '../types';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

type ApiConfig = {
  apiKey: string;
  keySource: 'builtin' | 'custom' | 'selected';
  model: string;
  provider: string;
};

type UseMascotWorkflowParams = {
  bgResultFlash: string;
  builtInGeminiKey: string;
  clearBgTimers: () => void;
  demoMode: boolean;
  demoImages: {
    animal: string;
    human: string;
    object: string;
    auto: string;
  };
  flashBackground: (flashImage: string, durationMs?: number) => Promise<void>;
  imageConfig: ApiConfig;
  locale: Locale;
  setWorkflowStage: (stage: WorkflowStage) => void;
  t: TFunction;
  textConfig: ApiConfig;
};

function buildMascotInstruction(mascotType: MascotType) {
  switch (mascotType) {
    case 'animal':
      return 'The mascot must be an animal character. Do not choose a human or an anthropomorphic object.';
    case 'human':
      return 'The mascot must be a human or humanoid character. Do not choose an animal or an anthropomorphic object.';
    case 'object':
      return 'The mascot must be an anthropomorphized object. Do not choose an animal or a human character.';
    default:
      return 'Choose the mascot archetype that best fits the website meaning and brand signal.';
  }
}

function addPromptConstraints(prompt: string, mascotType: MascotType, includeText: boolean, imageText: string) {
  let nextPrompt = prompt;

  if (includeText && imageText.trim()) {
    nextPrompt += `\n\nTypography Instruction: The image MUST prominently feature the text "${imageText.trim()}" integrated into the design.`;
  }

  if (mascotType === 'animal') {
    nextPrompt += '\n\nCharacter Constraint: The mascot must clearly read as an animal character.';
  } else if (mascotType === 'human') {
    nextPrompt += '\n\nCharacter Constraint: The mascot must clearly read as a human or humanoid character.';
  } else if (mascotType === 'object') {
    nextPrompt += '\n\nCharacter Constraint: The mascot must clearly read as an anthropomorphized object.';
  }

  return nextPrompt;
}

export function useMascotWorkflow({
  bgResultFlash,
  builtInGeminiKey,
  clearBgTimers,
  demoMode,
  demoImages,
  flashBackground,
  imageConfig,
  locale,
  setWorkflowStage,
  t,
  textConfig,
}: UseMascotWorkflowParams) {
  const [url, setUrl] = useState('');
  const [mascotType, setMascotType] = useState<MascotType>('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [manualPrompt, setManualPrompt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [regeneratingPrompt, setRegeneratingPrompt] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [includeText, setIncludeText] = useState(false);
  const [imageText, setImageText] = useState('');

  const analysisLanguage = locale === 'zh-TW' ? 'Traditional Chinese used in Taiwan' : 'English';
  const mascotInstruction = useMemo(() => buildMascotInstruction(mascotType), [mascotType]);
  const promptText = result ? result.section6.content : manualPrompt;
  const entryMorphProgress = Math.max(0, Math.min(1, (url.trim().length - 2) / 6));
  const urlValidationError = useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (!trimmed.includes('.') && !trimmed.includes(':')) return t('errorInvalidUrlFormat');
    return '';
  }, [t, url]);

  const resolveGoogleTextKey = () =>
    textConfig.keySource === 'custom' ? textConfig.apiKey.trim() : builtInGeminiKey;
  const resolveGoogleImageKey = () =>
    imageConfig.keySource === 'custom' ? imageConfig.apiKey.trim() : builtInGeminiKey;

  const resetConceptState = () => {
    clearBgTimers();
    setLoading(true);
    setError('');
    setResult(null);
    setGeneratedImage('');
    setManualPrompt('');
    setCopied(false);
    setWorkflowStage('brief');
  };

  const handleEnterBriefStage = () => {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      setError(t('errorNoUrl'));
      return;
    }

    if (!normalizedUrl.includes('.') && !normalizedUrl.includes(':')) {
      setError(t('errorInvalidUrlFormat'));
      return;
    }

    setError('');
    setWorkflowStage('brief');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch((copyError) => {
        console.error(t('errorCopy'), copyError);
        setError(t('errorCopy'));
      });
  };

  const handleContentChange = (section: SectionKey, newContent: string) => {
    setResult((previous) =>
      previous ? { ...previous, [section]: { ...previous[section], content: newContent } } : previous,
    );
  };

  const handleGenerateConcept = async () => {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      setError(t('errorNoUrl'));
      return;
    }

    if (!normalizedUrl.includes('.') && !normalizedUrl.includes(':')) {
      setError(t('errorInvalidUrlFormat'));
      return;
    }

    const cachedResult = sessionStorage.getItem(`url-hero-cache-${normalizedUrl}`);
    if (cachedResult && !demoMode) {
      try {
        setResult(JSON.parse(cachedResult));
        setGeneratedImage('');
        setManualPrompt('');
        setError('');
        setWorkflowStage('analysis');
        return;
      } catch {
        // Ignore cache parse errors and continue with live generation.
      }
    }

    resetConceptState();

    try {
      if (demoMode) {
        await delay(520);
        await flashBackground(bgResultFlash);
        await delay(1000);
        setResult(buildDemoConceptResult({ locale, url: normalizedUrl }));
        setWorkflowStage('analysis');
        return;
      }

      if (textConfig.provider !== 'google') {
        throw new Error(t('errorCors'));
      }

      const apiKey = resolveGoogleTextKey();
      if (!apiKey) {
        throw new Error(t('errorNoApiKey'));
      }

      const nextResult = await fetchConcept({
        apiKey,
        model: textConfig.model,
        systemPrompt: buildSystemPrompt({
          analysisLanguage,
          mascotInstruction,
          t,
          url: normalizedUrl,
        }),
        t,
        url: normalizedUrl,
      });

      await flashBackground(bgResultFlash);
      await delay(1000);
      setResult(nextResult);
      setWorkflowStage('analysis');

      try {
        sessionStorage.setItem(`url-hero-cache-${normalizedUrl}`, JSON.stringify(nextResult));
      } catch {
        // Ignore cache write failures.
      }
    } catch (generationError) {
      setError(
        getReadableApiError({
          err: generationError,
          fallbackMessage: t('errorGenerateContent'),
          permissionMessage: t('errorPermissionDenied'),
          t,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePrompt = async () => {
    if (!result) return;

    setRegeneratingPrompt(true);
    setError('');

    try {
      if (demoMode) {
        await delay(320);
        setResult((previous) =>
          previous
            ? {
                ...previous,
                section6: {
                  ...previous.section6,
                  content: `${previous.section6.content} Cinematic close-up variation, stronger character silhouette readability, premium product-ad framing.`,
                },
              }
            : previous,
        );
        setWorkflowStage('prompt');
        return;
      }

      if (textConfig.provider !== 'google') {
        throw new Error(t('errorCors'));
      }

      const apiKey = resolveGoogleTextKey();
      if (!apiKey) {
        throw new Error(t('errorNoApiKey'));
      }

      const nextPrompt = await fetchRegeneratedPrompt({
        apiKey,
        mascotInstruction,
        model: textConfig.model,
        result,
        t,
        url: url.trim(),
      });

      setResult((previous) =>
        previous ? { ...previous, section6: { ...previous.section6, content: nextPrompt } } : previous,
      );
      setWorkflowStage('prompt');
    } catch (promptError) {
      setError(
        getReadableApiError({
          err: promptError,
          fallbackMessage: t('errorGeneratePrompt'),
          permissionMessage: t('errorPermissionDenied'),
          t,
        }),
      );
    } finally {
      setRegeneratingPrompt(false);
    }
  };

  const handleGeneratePreviewImage = async () => {
    if (!promptText) {
      setError(t('errorNoPrompt'));
      return;
    }

    const promptToUse = addPromptConstraints(promptText, mascotType, includeText, imageText);

    setGeneratingImage(true);
    setError('');
    clearBgTimers();

    try {
      if (demoMode) {
        await delay(460);
        const demoImage =
          mascotType === 'animal'
            ? demoImages.animal
            : mascotType === 'human'
              ? demoImages.human
              : mascotType === 'object'
                ? demoImages.object
                : demoImages.auto;

        await flashBackground(bgResultFlash);
        await delay(1000);
        setGeneratedImage(demoImage);
        setWorkflowStage('preview');
        return;
      }

      if (imageConfig.provider === 'google') {
        const apiKey = resolveGoogleImageKey();
        if (!apiKey) {
          throw new Error(t('errorNoApiKey'));
        }

        const nextImage = await generateImage({
          apiKey,
          aspectRatio,
          model: imageConfig.model,
          prompt: promptToUse,
          provider: 'google',
          t,
        });

        await flashBackground(bgResultFlash);
        await delay(1000);
        setGeneratedImage(nextImage);
        setWorkflowStage('preview');
        return;
      }

      if (!imageConfig.apiKey.trim()) {
        throw new Error(t('errorOpenAiKey'));
      }

      const nextImage = await generateImage({
        apiKey: imageConfig.apiKey.trim(),
        aspectRatio,
        model: imageConfig.model,
        prompt: promptToUse,
        provider: 'openai',
        t,
      });

      await flashBackground(bgResultFlash);
      await delay(1000);
      setGeneratedImage(nextImage);
      setWorkflowStage('preview');
    } catch (imageError) {
      setError(
        getReadableApiError({
          err: imageError,
          fallbackMessage: t('errorImageGenerate'),
          permissionMessage: t('errorImagePermissionDenied'),
          t,
        }),
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  return {
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
    manualPrompt,
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
  };
}
