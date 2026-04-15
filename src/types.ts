import type { MessageKey } from './i18n/messages';

export type AiStudioBridge = {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
};

export type MascotType = 'auto' | 'animal' | 'human' | 'object';
export type KeySource = 'builtin' | 'custom' | 'selected';
export type SectionKey = 'section1' | 'section2' | 'section3' | 'section4' | 'section5' | 'section6';
export type OrbitPanelKey = 'text' | 'image' | null;
export type WorkspaceLayoutMode = 'classic' | 'analysis';
export type LayoutNavControl = 'prev' | 'next';
export type WorkflowStage = 'entry' | 'brief' | 'analysis' | 'prompt' | 'preview';

export type TFunction = (key: MessageKey, vars?: Record<string, string | number>) => string;

export type ConceptResult = {
  section1: { content: string; keywords: string[] };
  section2: { content: string };
  section3: { content: string };
  section4: { content: string };
  section5: { content: string };
  section6: { content: string };
};
