import React, { useState, useEffect } from 'react';
import { 
  Link2, Key, Settings2, Sparkles, Image as ImageIcon, 
  Copy, Check, ExternalLink, Zap, Box, Paintbrush, 
  Map, Lightbulb, Bot, AlertCircle, RefreshCw, Edit2, Save
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion } from 'motion/react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [url, setUrl] = useState('tw.yahoo.com');
  
  // Text AI Settings
  const [provider, setProvider] = useState('google');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [textAuthMethod, setTextAuthMethod] = useState<'apikey' | 'oauth'>('apikey');
  
  // Image AI Settings
  const [imageProvider, setImageProvider] = useState('google');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
  const [imageApiKey, setImageApiKey] = useState('');
  const [imageAuthMethod, setImageAuthMethod] = useState<'apikey' | 'oauth'>('apikey');
  
  const [hasPaidKey, setHasPaidKey] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [copied, setCopied] = useState(false);
  
  // 算圖相關狀態
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  
  // 編輯與重新生成狀態
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [regeneratingPrompt, setRegeneratingPrompt] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasPaidKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasPaidKey(true);
    }
  };

  const providers = [
    { id: 'google', name: 'Google (Gemini)' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' }
  ];

  const models: Record<string, string[]> = {
    google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    openai: ['gpt-5.2', 'gpt-5.2-mini', 'gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
    anthropic: ['claude-4-6-sonnet', 'claude-4-5-opus', 'claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022']
  };

  const imageProviders = [
    { id: 'google', name: 'Google (Gemini)' },
    { id: 'openai', name: 'OpenAI (DALL-E)' },
  ];

  const imageModels: Record<string, string[]> = {
    google: ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'],
    openai: ['dall-e-3', 'dall-e-2'],
  };

  const imageModelNames: Record<string, string> = {
    'gemini-2.5-flash-image': 'Nano Banana (Gemini 2.5 Flash Image)',
    'gemini-3.1-flash-image-preview': 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    'gemini-3-pro-image-preview': 'Nano Banana Pro (Gemini 3 Pro Image)',
    'dall-e-3': 'DALL-E 3',
    'dall-e-2': 'DALL-E 2'
  };

  // 當切換供應商時，自動重置選擇的模型
  useEffect(() => {
    setModel(models[provider][0]);
  }, [provider]);

  useEffect(() => {
    setImageModel(imageModels[imageProvider][0]);
  }, [imageProvider]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('複製失敗:', err);
      setError('複製失敗，您的瀏覽器可能不支援此操作。');
    });
  };

  const toggleEdit = (section: string) => {
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleContentChange = (section: string, newContent: string) => {
    setResult((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        content: newContent
      }
    }));
  };

  const generateConcept = async () => {
    if (!url) {
      setError('請輸入目標網址');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setGeneratedImage('');
    setEditModes({});

    try {
      if (provider !== 'google') {
         throw new Error(`為了網站安全 (CORS 限制)，目前測試環境建議使用 Google (Gemini) 進行測試。`);
      }

      const systemPrompt = `
      你現在是一位頂尖的網站設計師、AI 視覺概念設計師與 AI 繪圖 Prompt 工程師。
      請深度分析使用者提供的網址 (可能包含字面意義、品牌意涵或服務內容)，並將其「擬人化/擬物化」轉化為一個具體的「3D 廣告卡通角色」概念。
      
      請嚴格以 JSON 格式輸出，不要包含其他文字或 Markdown 標記。

      重要規則：
      1. Section 1 到 5 請使用繁體中文（台灣用語）。
      2. Section 6 必須是純英文的繪圖 Prompt。
      3. Section 6 的開頭必須嚴格定調為：「A highly detailed, realistic 3D cartoon mascot representing the website "[目標網址]"...」
      4. Section 6 必須包含一段讓目標網址以「發光霓虹全像投影 (glowing neon hologram)」形式漂浮在畫面中的指令。
      5. Section 6 結尾必須放上渲染風格關鍵字（如 Unreal Engine 5, Octane render, ray tracing, 8k 等）。
      `;

      const keyToUse = apiKey.trim() || (process.env as any).API_KEY || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        throw new Error('請輸入 API Key 或確保系統已設定 GEMINI_API_KEY');
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });

      const response = await ai.models.generateContent({
        model: model,
        contents: `目標網址：${url}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              section1: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.STRING, description: "解構網址與服務，定義2-3個核心意涵的描述。" },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "風格關鍵字，需包含 3D realistic rendering, cinematic lighting 等" }
                }
              },
              section2: {
                type: Type.OBJECT,
                properties: { content: { type: Type.STRING, description: "設定最能代表該網站的「物種」（動物、機器、奇幻生物等）。詳細描述其頭部特徵（眼睛、表情）以及身體的材質質感（如毛髮、金屬、玻璃、科技材質）。" } }
              },
              section3: {
                type: Type.OBJECT,
                properties: { content: { type: Type.STRING, description: "設計能體現該網站功能性的服裝、工具配件或手持物件。請發揮創意，讓這些配件成為角色識別的關鍵。" } }
              },
              section4: {
                type: Type.OBJECT,
                properties: { content: { type: Type.STRING, description: "設定角色所在的空間場景，背景需包含能呼應網站主題的具體物件或 UI 介面元素。" } }
              },
              section5: {
                type: Type.OBJECT,
                properties: { content: { type: Type.STRING, description: "描述畫面的主光源、邊緣光與環境光氛圍，確保角色立體感強烈且從背景中凸顯出來。" } }
              },
              section6: {
                type: Type.OBJECT,
                properties: { content: { type: Type.STRING, description: "將上述設定翻譯成的英文 Prompt。" } }
              }
            }
          }
        }
      });

      const jsonText = response.text;
      if (jsonText) {
        setResult(JSON.parse(jsonText));
      } else {
        throw new Error('無法生成內容，請稍後再試。');
      }

    } catch (err: any) {
      if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
        setError('API Key 權限不足 (403 Permission Denied)。請確認您的 API Key 是否有效，或嘗試更換為其他模型（例如 gemini-2.5-flash）。部分進階模型可能需要付費專案權限。');
      } else {
        setError(err.message || '發生未知錯誤');
      }
    } finally {
      setLoading(false);
    }
  };

  const regeneratePrompt = async () => {
    if (!result) return;
    setRegeneratingPrompt(true);
    setError('');

    try {
      if (provider !== 'google') {
         throw new Error(`為了網站安全 (CORS 限制)，目前測試環境建議使用 Google (Gemini) 進行測試。`);
      }

      const systemPrompt = `
      你現在是一位頂尖的 AI 繪圖 Prompt 工程師。
      請根據以下使用者提供的角色設定，將其翻譯成「一段完整、流暢且細節豐富的英文 Prompt」。
      
      角色設定：
      1. 核心概念：${result.section1.content}
      2. 角色主體：${result.section2.content}
      3. 裝備配件：${result.section3.content}
      4. 環境背景：${result.section4.content}
      5. 光影渲染：${result.section5.content}

      重要規則：
      1. 必須是純英文的繪圖 Prompt。
      2. 開頭必須嚴格定調為：「A highly detailed, realistic 3D cartoon mascot representing the website "${url}"...」
      3. 必須包含一段讓目標網址以「發光霓虹全像投影 (glowing neon hologram)」形式漂浮在畫面中的指令。
      4. 結尾必須放上渲染風格關鍵字（如 Unreal Engine 5, Octane render, ray tracing, 8k 等）。
      `;

      const keyToUse = apiKey.trim() || (process.env as any).API_KEY || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        throw new Error('請輸入 API Key 或確保系統已設定 GEMINI_API_KEY');
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });

      const response = await ai.models.generateContent({
        model: model,
        contents: "請根據上述設定重新生成英文 Prompt",
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const newPrompt = response.text;
      if (newPrompt) {
        setResult((prev: any) => ({
          ...prev,
          section6: {
            ...prev.section6,
            content: newPrompt
          }
        }));
      } else {
        throw new Error('無法生成 Prompt，請稍後再試。');
      }

    } catch (err: any) {
      if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
        setError('API Key 權限不足 (403 Permission Denied)。請確認您的 API Key 是否有效，或嘗試更換為其他模型。');
      } else {
        setError(err.message || '發生未知錯誤');
      }
    } finally {
      setRegeneratingPrompt(false);
    }
  };

  const generatePreviewImage = async () => {
    if (!result || !result.section6.content) return;
    
    setGeneratingImage(true);
    setError('');

    try {
      if (imageProvider === 'google') {
        const keyToUse = imageApiKey.trim() || (process.env as any).API_KEY || process.env.GEMINI_API_KEY;
        if (!keyToUse) {
          throw new Error('請輸入 Gemini API Key 或確保系統已設定 GEMINI_API_KEY');
        }

        const ai = new GoogleGenAI({ apiKey: keyToUse });

        const imageConfig: any = {
          aspectRatio: "1:1",
        };

        if (imageModel.includes('gemini-3')) {
          imageConfig.imageSize = "1K";
        }

        const response = await ai.models.generateContent({
          model: imageModel,
          contents: result.section6.content,
          config: {
            imageConfig
          }
        });

        let foundImage = false;
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setGeneratedImage(`data:image/jpeg;base64,${base64EncodeString}`);
            foundImage = true;
            break;
          }
        }

        if (!foundImage) {
          throw new Error('算圖失敗，請稍後再試。');
        }
      } else if (imageProvider === 'openai') {
        if (!imageApiKey.trim()) {
          throw new Error('請輸入 OpenAI API Key');
        }
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${imageApiKey.trim()}`
          },
          body: JSON.stringify({
            model: imageModel,
            prompt: result.section6.content,
            n: 1,
            size: "1024x1024"
          })
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'OpenAI 算圖失敗');
        }
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setGeneratedImage(data.data[0].url);
        } else {
          throw new Error('算圖失敗，請稍後再試。');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
        setError('算圖 API Key 權限不足 (403 Permission Denied)。請確認您的 API Key 是否有效，或嘗試更換為其他繪圖模型（例如 gemini-2.5-flash-image）。如果您使用的是免費 Key，部分進階模型可能無法使用，建議點擊下方的「選取付費 API Key」按鈕。');
      } else {
        setError(err.message || '發生未知錯誤');
      }
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">URL to Mascot</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">AI Visual Concept Generator</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-6 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1.5 text-zinc-900" /> 3D Prompt</span>
            <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1.5 text-zinc-900" /> Gemini Engine</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Target URL Panel */}
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">1. Target Website</h2>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ''))}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all text-sm"
                  placeholder="e.g. spotify.com"
                />
              </div>
            </div>
          </section>

          {/* AI Engine Settings */}
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">2. Engine Configuration</h2>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-6">
              
              {/* Text Provider */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Text Analysis</label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all appearance-none text-sm font-medium"
                  >
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all appearance-none text-sm"
                  >
                    {models[provider].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Authentication</span>
                    {provider === 'google' && textAuthMethod === 'apikey' && (
                      <button 
                        onClick={handleSelectKey}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                      >
                        {hasPaidKey ? 'Key Selected' : 'Select Paid Key'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex bg-zinc-100 p-1 rounded-xl mb-3">
                    <button
                      onClick={() => setTextAuthMethod('apikey')}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${textAuthMethod === 'apikey' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      API Key
                    </button>
                    <button
                      onClick={() => setTextAuthMethod('oauth')}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${textAuthMethod === 'oauth' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      OAuth
                    </button>
                  </div>

                  {textAuthMethod === 'apikey' ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'google' ? (hasPaidKey ? "Using selected key" : "Default key") : "Enter API Key"}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all font-mono text-xs"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => alert('OAuth flow would initiate here. Please configure Client ID.')}
                      className="w-full bg-zinc-900 text-white rounded-xl py-2.5 flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Connect with {providers.find(p => p.id === provider)?.name}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="h-px bg-zinc-100 mx-1"></div>

              {/* Image Provider */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Image Generation</label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={imageProvider}
                    onChange={(e) => setImageProvider(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all appearance-none text-sm font-medium"
                  >
                    {imageProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all appearance-none text-sm"
                  >
                    {imageModels[imageProvider].map(m => (
                      <option key={m} value={m}>{imageModelNames[m] || m}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Authentication</span>
                    {imageProvider === 'google' && imageAuthMethod === 'apikey' && (
                      <button 
                        onClick={handleSelectKey}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                      >
                        {hasPaidKey ? 'Key Selected' : 'Select Paid Key'}
                      </button>
                    )}
                  </div>

                  <div className="flex bg-zinc-100 p-1 rounded-xl mb-3">
                    <button
                      onClick={() => setImageAuthMethod('apikey')}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${imageAuthMethod === 'apikey' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      API Key
                    </button>
                    <button
                      onClick={() => setImageAuthMethod('oauth')}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${imageAuthMethod === 'oauth' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      OAuth
                    </button>
                  </div>

                  {imageAuthMethod === 'apikey' ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <input
                        type="password"
                        value={imageApiKey}
                        onChange={(e) => setImageApiKey(e.target.value)}
                        placeholder={imageProvider === 'google' ? (hasPaidKey ? "Using selected key" : "Default key") : "Enter API Key"}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-zinc-400 transition-all font-mono text-xs"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => alert('OAuth flow would initiate here. Please configure Client ID.')}
                      className="w-full bg-zinc-900 text-white rounded-xl py-2.5 flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Connect with {imageProviders.find(p => p.id === imageProvider)?.name}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={generateConcept}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm
              ${loading 
                ? 'bg-zinc-100 text-zinc-400 cursor-wait' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
              }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Mascot Concept</span>
              </>
            )}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </motion.div>
          )}

        </div>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-8 space-y-8 relative">
          
          {!result && !loading && (
            <div className="h-full min-h-[500px] border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400 p-10">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <Box className="w-7 h-7 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-zinc-900">Ready to Create</h3>
              <p className="max-w-xs text-center text-sm leading-relaxed text-zinc-500">
                Enter a website URL to decompose its brand essence and transform it into a 3D mascot concept.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex items-center justify-center z-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-zinc-200 shadow-sm">
               <div className="flex flex-col items-center space-y-6">
                 <div className="relative w-16 h-16">
                   <div className="absolute inset-0 border-2 border-zinc-100 rounded-full"></div>
                   <div className="absolute inset-0 border-t-2 border-zinc-900 rounded-full animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-zinc-900 animate-pulse" />
                 </div>
                 <p className="text-zinc-500 font-medium tracking-widest text-[10px] uppercase">Extracting Brand Essence</p>
               </div>
            </div>
          )}

          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              
              {/* Output Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section 1 */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                        <Lightbulb className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Core Concept & Keywords</h3>
                    </div>
                    <button onClick={() => toggleEdit('section1')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {editModes['section1'] ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editModes['section1'] ? (
                    <textarea 
                      value={result.section1.content}
                      onChange={(e) => handleContentChange('section1', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 min-h-[100px]"
                    />
                  ) : (
                    <p className="text-zinc-600 leading-relaxed text-sm">{result.section1.content}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {result.section1.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                        <Bot className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Character Base</h3>
                    </div>
                    <button onClick={() => toggleEdit('section2')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {editModes['section2'] ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editModes['section2'] ? (
                    <textarea 
                      value={result.section2.content}
                      onChange={(e) => handleContentChange('section2', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 min-h-[120px]"
                    />
                  ) : (
                    <p className="text-zinc-600 leading-relaxed text-sm">{result.section2.content}</p>
                  )}
                </div>

                {/* Section 3 */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                        <Paintbrush className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Equipment & Gear</h3>
                    </div>
                    <button onClick={() => toggleEdit('section3')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {editModes['section3'] ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editModes['section3'] ? (
                    <textarea 
                      value={result.section3.content}
                      onChange={(e) => handleContentChange('section3', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 min-h-[120px]"
                    />
                  ) : (
                    <p className="text-zinc-600 leading-relaxed text-sm">{result.section3.content}</p>
                  )}
                </div>

                {/* Section 4 */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                        <Map className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Environment</h3>
                    </div>
                    <button onClick={() => toggleEdit('section4')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {editModes['section4'] ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editModes['section4'] ? (
                    <textarea 
                      value={result.section4.content}
                      onChange={(e) => handleContentChange('section4', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 min-h-[120px]"
                    />
                  ) : (
                    <p className="text-zinc-600 leading-relaxed text-sm">{result.section4.content}</p>
                  )}
                </div>

                {/* Section 5 */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                        <Sparkles className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Lighting & Rendering</h3>
                    </div>
                    <button onClick={() => toggleEdit('section5')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                      {editModes['section5'] ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editModes['section5'] ? (
                    <textarea 
                      value={result.section5.content}
                      onChange={(e) => handleContentChange('section5', e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 min-h-[120px]"
                    />
                  ) : (
                    <p className="text-zinc-600 leading-relaxed text-sm">{result.section5.content}</p>
                  )}
                </div>

              </div>

              {/* Section 6: AI Prompt Box */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">AI Visual Prompt</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Optimized for 3D Rendering</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={regeneratePrompt}
                      disabled={regeneratingPrompt}
                      className="flex items-center space-x-2 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl text-zinc-600 transition-all disabled:opacity-50 active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regeneratingPrompt ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                    <button 
                      onClick={() => handleCopy(result.section6.content)}
                      className="flex items-center space-x-2 text-[11px] font-bold bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl text-white transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                </div>
                
                {editModes['section6'] ? (
                  <textarea 
                    value={result.section6.content}
                    onChange={(e) => handleContentChange('section6', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl p-6 font-mono text-xs leading-relaxed focus:outline-none focus:border-zinc-400 min-h-[200px]"
                  />
                ) : (
                  <div className="relative group/prompt">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-zinc-600 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all">
                      {result.section6.content}
                    </div>
                    <button 
                      onClick={() => toggleEdit('section6')} 
                      className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 opacity-0 group-hover/prompt:opacity-100 transition-all shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 算圖預覽按鈕 */}
                <div className="pt-4 flex flex-col md:flex-row items-center gap-6">
                  <button
                    onClick={generatePreviewImage}
                    disabled={generatingImage}
                    className={`flex-1 w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm
                      ${generatingImage 
                        ? 'bg-zinc-100 text-zinc-400 cursor-wait' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
                      }`}
                  >
                    {generatingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Paintbrush className="w-4 h-4" />
                        <span>Generate Preview Image</span>
                      </>
                    )}
                  </button>
                </div>

                {generatedImage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 space-y-4"
                  >
                    <div className="relative group rounded-3xl overflow-hidden border border-zinc-200 shadow-md bg-zinc-100 aspect-square max-w-lg mx-auto">
                      <img 
                        src={generatedImage} 
                        alt="Mascot Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                    </div>
                    <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                      Preview generated using {imageModelNames[imageModel] || imageModel}
                    </p>
                  </motion.div>
                )}
              </div>

            </motion.div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest">
            Powered by Gemini & DALL-E • Designed with Clarity
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors font-medium uppercase tracking-widest">Documentation</a>
            <a href="#" className="text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors font-medium uppercase tracking-widest">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
