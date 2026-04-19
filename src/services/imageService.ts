import { GoogleGenAI } from '@google/genai';
import type { ImageProvider, TFunction } from '../types';

type GenerateImageParams = {
  apiKey: string;
  aspectRatio: string;
  model: string;
  prompt: string;
  provider: ImageProvider;
  t: TFunction;
};

export function resolveOpenAiImageSize(aspectRatio: string) {
  if (aspectRatio === '16:9') return '1536x1024';
  if (aspectRatio === '9:16') return '1024x1536';
  return '1024x1024';
}

export function isOpenAiAspectRatioFallback(aspectRatio: string) {
  return aspectRatio === '4:3' || aspectRatio === '3:4';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read image payload.'));
    };

    reader.onerror = () => reject(reader.error ?? new Error('Unable to read image payload.'));
    reader.readAsDataURL(blob);
  });
}

async function fetchImageUrlAsDataUrl(url: string, t: TFunction) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(t('errorImageGenerate'));
  }

  return blobToDataUrl(await response.blob());
}

export async function generateImage({
  apiKey,
  aspectRatio,
  model,
  prompt,
  provider,
  t,
}: GenerateImageParams): Promise<string> {
  if (provider === 'google') {
    const ai = new GoogleGenAI({ apiKey });
    const imageConfig: { aspectRatio: string; imageSize?: string } = { aspectRatio };

    if (model.includes('gemini-3')) {
      imageConfig.imageSize = '1K';
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { imageConfig },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData);

    if (!imagePart?.inlineData?.data) {
      throw new Error(t('errorImageGenerate'));
    }

    return `data:image/jpeg;base64,${imagePart.inlineData.data}`;
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      response_format: 'b64_json',
      size: resolveOpenAiImageSize(aspectRatio),
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message || t('errorImageGenerate'));
  }

  const data = await response.json();
  const imagePayload = data.data?.[0];

  if (imagePayload?.b64_json) {
    return `data:image/png;base64,${imagePayload.b64_json}`;
  }

  if (imagePayload?.url) {
    return fetchImageUrlAsDataUrl(imagePayload.url, t);
  }

  if (!imagePayload) {
    throw new Error(t('errorImageGenerate'));
  }

  throw new Error(t('errorImageGenerate'));
}
