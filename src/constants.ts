import type { ImageProvider, TextProvider, WorkflowStage } from './types';

// ─── Aspect ratios ──────────────────────────────────────────────────────────
export const ASPECT_RATIOS = [
  { id: '1:1', nameKey: 'aspectRatioSquare' },
  { id: '16:9', nameKey: 'aspectRatioLandscape' },
  { id: '9:16', nameKey: 'aspectRatioPortrait' },
  { id: '4:3', nameKey: 'aspectRatioStandard' },
  { id: '3:4', nameKey: 'aspectRatioVertical' },
] as const;

// ─── Provider & model configs ───────────────────────────────────────────────
export const PROVIDERS = [
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
] as const;

export const MODELS: Record<TextProvider, string[]> = {
  google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  openai: ['gpt-5.2', 'gpt-5.2-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o4-mini', 'o1'],
  anthropic: [
    'claude-sonnet-4-0',
    'claude-opus-4-1-20250805',
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
  ],
};

export const IMAGE_PROVIDERS = [
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'openai', name: 'OpenAI' },
] as const;

export const IMAGE_MODELS: Record<ImageProvider, string[]> = {
  google: ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'],
  openai: ['gpt-image-1.5', 'gpt-image-1', 'gpt-image-1-mini', 'dall-e-3'],
};

export const IMAGE_MODEL_NAMES: Record<string, string> = {
  'gemini-2.5-flash-image': 'Nano Banana (Gemini 2.5 Flash Image)',
  'gemini-3.1-flash-image-preview': 'Nano Banana 2 (Gemini 3.1 Flash Image)',
  'gemini-3-pro-image-preview': 'Nano Banana Pro (Gemini 3 Pro Image)',
  'gpt-image-1.5': 'GPT Image 1.5',
  'gpt-image-1': 'GPT Image 1',
  'gpt-image-1-mini': 'GPT Image 1 Mini',
  'dall-e-3': 'DALL-E 3',
};

export const WORKFLOW_STAGES: WorkflowStage[] = ['entry', 'brief', 'analysis', 'prompt', 'preview'];

// ─── Shared Tailwind class strings ──────────────────────────────────────────
export const INPUT_CLS =
  'w-full border-0 border-b border-white/12 bg-transparent px-0 py-2.5 text-sm text-white placeholder-white/25 transition-all duration-200 hover:border-white/22 focus:border-amber-300/55 focus:outline-none';
export const SELECT_CLS =
  'w-full appearance-none border-0 border-b border-white/12 bg-transparent px-0 py-2.5 text-sm text-white [color-scheme:dark] transition-all duration-200 hover:border-white/22 focus:border-white/28 focus:outline-none';
export const LABEL_CLS = 'text-[11px] font-medium uppercase tracking-widest text-white/40';
export const GLASS_PANEL_CLS = 'liquid-glass liquid-glass--panel';
export const GLASS_SUB_PANEL_CLS = 'liquid-glass liquid-glass--compact';
export const WORKSPACE_MASCOT_FRAME_CLS = 'relative h-[188px] w-[282px] sm:h-[224px] sm:w-[336px] lg:h-[clamp(205px,23vw,360px)] lg:w-[clamp(308px,35vw,540px)]';
export const WORKSPACE_MASCOT_IMG_CLS = 'pointer-events-none absolute inset-x-0 bottom-0 h-full w-full select-none object-contain object-bottom drop-shadow-[0_0_60px_rgba(250,204,21,0.22)]';

// ─── Animation timing ───────────────────────────────────────────────────────
export const WORKSPACE_PANEL_DELAY_MS = 260;
export const DEMO_TEXT_DELAY_MS = 520;
export const DEMO_REGEN_DELAY_MS = 320;
export const DEMO_IMAGE_DELAY_MS = 460;
export const STANDARD_EASE = [0.22, 1, 0.36, 1] as const;
