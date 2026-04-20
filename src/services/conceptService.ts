import { GoogleGenAI, Type } from '@google/genai';
import type { Locale } from '../i18n/messages';
import type { ConceptResult, SectionKey, TFunction, TextProvider } from '../types';

type BuildSystemPromptParams = {
  analysisLanguage: string;
  mascotInstruction: string;
  t: TFunction;
  url: string;
};

type DemoConceptParams = {
  locale: Locale;
  url: string;
};

type FetchConceptParams = {
  apiKey: string;
  model: string;
  provider: TextProvider;
  systemPrompt: string;
  t: TFunction;
  url: string;
};

type FetchRegeneratedPromptParams = {
  apiKey: string;
  mascotInstruction: string;
  model: string;
  provider: TextProvider;
  result: ConceptResult;
  t: TFunction;
  url: string;
};

type FetchRegeneratedSectionParams = {
  apiKey: string;
  model: string;
  provider: TextProvider;
  result: ConceptResult;
  section: SectionKey;
  t: TFunction;
  url: string;
};

function buildConceptResponseSchema(t: TFunction) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'],
    properties: {
      section1: {
        type: 'object',
        additionalProperties: false,
        required: ['content', 'keywords'],
        properties: {
          content: { type: 'string', description: t('schemaSection1Content') },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: t('schemaSection1Keywords'),
          },
        },
      },
      section2: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: { content: { type: 'string', description: t('schemaSection2Content') } },
      },
      section3: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: { content: { type: 'string', description: t('schemaSection3Content') } },
      },
      section4: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: { content: { type: 'string', description: t('schemaSection4Content') } },
      },
      section5: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: { content: { type: 'string', description: t('schemaSection5Content') } },
      },
      section6: {
        type: 'object',
        additionalProperties: false,
        required: ['content'],
        properties: { content: { type: 'string', description: t('schemaSection6Content') } },
      },
    },
  } as const;
}

function buildPromptResponseSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', minLength: 1 },
    },
  } as const;
}

function buildSectionResponseSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1 },
    },
  } as const;
}

function buildGoogleConceptResponseSchema(t: TFunction) {
  return {
    type: Type.OBJECT,
    properties: {
      section1: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: t('schemaSection1Content') },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: t('schemaSection1Keywords'),
          },
        },
      },
      section2: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING, description: t('schemaSection2Content') } },
      },
      section3: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING, description: t('schemaSection3Content') } },
      },
      section4: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING, description: t('schemaSection4Content') } },
      },
      section5: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING, description: t('schemaSection5Content') } },
      },
      section6: {
        type: Type.OBJECT,
        properties: { content: { type: Type.STRING, description: t('schemaSection6Content') } },
      },
    },
  };
}

function buildPromptRewriteSystemPrompt({
  mascotInstruction,
  result,
  t,
  url,
}: Pick<FetchRegeneratedPromptParams, 'mascotInstruction' | 'result' | 't' | 'url'>) {
  return `
${t('regenPromptRole')}
${t('regenPromptTask')}

1. ${t('coreConcept')}: ${result.section1.content}
2. ${t('characterSubject')}: ${result.section2.content}
3. ${t('equipment')}: ${result.section3.content}
4. ${t('environment')}: ${result.section4.content}
5. ${t('lighting')}: ${result.section5.content}

- ${t('systemPromptRule3', { mascotInstruction })}
- ${t('systemPromptRule4', { url })}
- ${t('systemPromptRule5')}
- ${t('systemPromptRule6')}
`.trim();
}

function buildSectionRewritePrompt({ result, section, t, url }: Pick<FetchRegeneratedSectionParams, 'result' | 'section' | 't' | 'url'>) {
  const sectionTitleKeyMap: Record<SectionKey, 'coreConcept' | 'characterSubject' | 'equipment' | 'environment' | 'lighting' | 'aiVisualPrompt'> = {
    section1: 'coreConcept',
    section2: 'characterSubject',
    section3: 'equipment',
    section4: 'environment',
    section5: 'lighting',
    section6: 'aiVisualPrompt',
  };
  const sectionTitleKey = sectionTitleKeyMap[section];

  return {
    instruction: t('regenSectionTask', { section: t(sectionTitleKey) }),
    systemPrompt: `
${t('systemPromptRole')}
${t('regenSectionTask', { section: t(sectionTitleKey) })}

Current Concept Context:
1. ${t('coreConcept')}: ${result.section1.content}
2. ${t('characterSubject')}: ${result.section2.content}
3. ${t('equipment')}: ${result.section3.content}
4. ${t('environment')}: ${result.section4.content}
5. ${t('lighting')}: ${result.section5.content}

Target URL: ${url}
`.trim(),
  };
}

function extractJsonObject<T>(rawText: string) {
  try {
    return JSON.parse(rawText) as T;
  } catch {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');

    if (start >= 0 && end > start) {
      return JSON.parse(rawText.slice(start, end + 1)) as T;
    }

    throw new Error(rawText);
  }
}

async function readApiPayload(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function toApiError(payload: unknown, fallbackMessage: string) {
  if (typeof payload === 'string' && payload) {
    return new Error(payload);
  }

  if (payload) {
    return new Error(JSON.stringify(payload));
  }

  return new Error(fallbackMessage);
}

function extractOpenAiOutputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const directText = (payload as { output_text?: unknown }).output_text;
  if (typeof directText === 'string' && directText.trim()) {
    return directText;
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return '';
  }

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }

      const textType = (part as { type?: unknown }).type;
      const text = (part as { text?: unknown }).text;

      if ((textType === 'output_text' || textType === 'text') && typeof text === 'string' && text.trim()) {
        return text;
      }
    }
  }

  return '';
}

function extractAnthropicToolInput<T>(payload: unknown, toolName: string) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Anthropic returned an empty response.');
  }

  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    throw new Error(JSON.stringify(payload));
  }

  for (const block of content) {
    if (!block || typeof block !== 'object') {
      continue;
    }

    const maybeToolUse = block as { type?: unknown; name?: unknown; input?: unknown };
    if (maybeToolUse.type === 'tool_use' && maybeToolUse.name === toolName && maybeToolUse.input) {
      return maybeToolUse.input as T;
    }
  }

  throw new Error(JSON.stringify(payload));
}

export function buildSystemPrompt({
  analysisLanguage,
  mascotInstruction,
  t,
  url,
}: BuildSystemPromptParams) {
  return `
${t('systemPromptRole')}
${t('systemPromptTask')}

${t('systemPromptJson')}

${t('systemPromptRules')}
1. ${t('systemPromptRule1', { language: analysisLanguage })}
2. ${t('systemPromptRule2')}
3. ${t('systemPromptRule3', { mascotInstruction })}
4. ${t('systemPromptRule4', { url })}
5. ${t('systemPromptRule5')}
6. ${t('systemPromptRule6')}
`.trim();
}

export function buildDemoConceptResult({ locale, url }: DemoConceptParams): ConceptResult {
  return {
    section1: {
      content:
        locale === 'zh-TW'
          ? `以 ${url} 為核心，主打「信任、速度、未來感」三大支柱，塑造可立即辨識的品牌人格。`
          : `Built around ${url}, the concept focuses on trust, speed, and futuristic clarity to create an instantly recognizable mascot identity.`,
      keywords:
        locale === 'zh-TW'
          ? ['可信賴', '流線速度', '數位未來', '品牌識別']
          : ['trustworthy', 'streamlined speed', 'digital future', 'brand identity'],
    },
    section2: {
      content:
        locale === 'zh-TW'
          ? '角色採用圓潤幾何比例與友善表情，眼部有發光 HUD 介面語彙，整體形象偏高端科技吉祥物。'
          : 'The character uses soft geometric proportions with a friendly face, featuring glowing HUD-inspired eyes and a premium tech-mascot silhouette.',
    },
    section3: {
      content:
        locale === 'zh-TW'
          ? '搭配發光手環、懸浮徽章與品牌符號化背包，強化任務導向與服務感。'
          : 'It includes luminous wrist gear, floating badges, and a symbolic utility pack to reinforce a mission-ready service personality.',
    },
    section4: {
      content:
        locale === 'zh-TW'
          ? '場景為半透明數位舞台，漂浮網址字樣與資訊面板環繞，呈現沉浸式品牌入口。'
          : 'The scene is a translucent digital stage with floating URL lettering and orbiting UI panels, presenting an immersive brand gateway.',
    },
    section5: {
      content:
        locale === 'zh-TW'
          ? '主光偏暖、邊緣輪廓光偏冷，背景以柔霧體積光襯托角色，形成高質感展示氛圍。'
          : 'Warm key light, cool rim light, and soft volumetric haze in the background create a polished showcase atmosphere.',
    },
    section6: {
      content: `A highly detailed, realistic 3D cartoon mascot representing the website "${url}", premium cinematic advertising composition, charming and trustworthy character design, glowing holographic UI accents, floating neon URL signage, stylized digital stage, physically based materials, depth of field, dramatic key and rim lighting, Unreal Engine 5, Octane render, ray tracing, 8k.`,
    },
  };
}

export async function fetchConcept({
  apiKey,
  model,
  provider,
  systemPrompt,
  t,
  url,
}: FetchConceptParams): Promise<ConceptResult> {
  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: systemPrompt,
        input: `${t('targetUrlPrefix')}${url}`,
        text: {
          format: {
            type: 'json_schema',
            name: 'url_hero_concept',
            strict: true,
            schema: buildConceptResponseSchema(t),
          },
        },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGenerateContent'));
    }

    const outputText = extractOpenAiOutputText(payload);
    if (!outputText) {
      throw new Error(t('errorGenerateContent'));
    }

    return extractJsonObject<ConceptResult>(outputText);
  }

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: `${t('targetUrlPrefix')}${url}` }],
          },
        ],
        tools: [
          {
            name: 'record_concept',
            description: 'Return the mascot concept as a structured six-section JSON object.',
            input_schema: buildConceptResponseSchema(t),
          },
        ],
        tool_choice: { type: 'tool', name: 'record_concept' },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGenerateContent'));
    }

    return extractAnthropicToolInput<ConceptResult>(payload, 'record_concept');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: `${t('targetUrlPrefix')}${url}`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: buildGoogleConceptResponseSchema(t),
    },
  });

  if (!response.text) throw new Error(t('errorGenerateContent'));
  return JSON.parse(response.text) as ConceptResult;
}

export async function fetchRegeneratedPrompt({
  apiKey,
  mascotInstruction,
  model,
  provider,
  result,
  t,
  url,
}: FetchRegeneratedPromptParams): Promise<string> {
  const systemPrompt = buildPromptRewriteSystemPrompt({ mascotInstruction, result, t, url });

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: systemPrompt,
        input: t('regenPromptInstruction'),
        text: {
          format: {
            type: 'json_schema',
            name: 'url_hero_prompt',
            strict: true,
            schema: buildPromptResponseSchema(),
          },
        },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGeneratePrompt'));
    }

    const outputText = extractOpenAiOutputText(payload);
    if (!outputText) {
      throw new Error(t('errorGeneratePrompt'));
    }

    return extractJsonObject<{ prompt: string }>(outputText).prompt.trim();
  }

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: [{ type: 'text', text: t('regenPromptInstruction') }] }],
        tools: [
          {
            name: 'rewrite_prompt',
            description: 'Return one rewritten English image-generation prompt.',
            input_schema: buildPromptResponseSchema(),
          },
        ],
        tool_choice: { type: 'tool', name: 'rewrite_prompt' },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGeneratePrompt'));
    }

    return extractAnthropicToolInput<{ prompt: string }>(payload, 'rewrite_prompt').prompt.trim();
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: t('regenPromptInstruction'),
    config: { systemInstruction: systemPrompt },
  });

  if (!response.text) throw new Error(t('errorGeneratePrompt'));
  return response.text.trim();
}

export async function fetchRegeneratedSection({
  apiKey,
  model,
  provider,
  result,
  section,
  t,
  url,
}: FetchRegeneratedSectionParams): Promise<string> {
  const { instruction, systemPrompt } = buildSectionRewritePrompt({ result, section, t, url });

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: systemPrompt,
        input: instruction,
        text: {
          format: {
            type: 'json_schema',
            name: 'url_hero_section',
            strict: true,
            schema: buildSectionResponseSchema(),
          },
        },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGenerateContent'));
    }

    const outputText = extractOpenAiOutputText(payload);
    if (!outputText) {
      throw new Error(t('errorGenerateContent'));
    }

    return extractJsonObject<{ content: string }>(outputText).content.trim();
  }

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: [{ type: 'text', text: instruction }] }],
        tools: [
          {
            name: 'rewrite_section',
            description: 'Return one rewritten section body as plain text.',
            input_schema: buildSectionResponseSchema(),
          },
        ],
        tool_choice: { type: 'tool', name: 'rewrite_section' },
      }),
    });

    const payload = await readApiPayload(response);
    if (!response.ok) {
      throw toApiError(payload, t('errorGenerateContent'));
    }

    return extractAnthropicToolInput<{ content: string }>(payload, 'rewrite_section').content.trim();
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: instruction,
    config: { systemInstruction: systemPrompt },
  });

  if (!response.text) throw new Error(t('errorGenerateContent'));
  return response.text.trim();
}
