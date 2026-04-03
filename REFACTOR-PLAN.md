# App.tsx 拆分重構開發計畫

> 目標：將 `src/App.tsx`（1,647 行）拆分為職責清晰、可維護的模組  
> 策略：由外到內，先抽 render → 再抽 hooks → 最後抽 services  
> 原則：**每階段完成後必須 `npm run build` 通過，UI 行為零差異**

---

## 現況分析

| 區塊 | 行數 | 問題 |
|------|------|------|
| Imports + 常數 | ~60 | 尚可 |
| useState × 22 | ~30 | 文字 AI / 圖片 AI 設定大量重複 |
| useMemo × 7 | ~50 | 尚可 |
| useEffect × 8 | ~70 | key 偵測 / provider 切換邏輯混在一起 |
| 事件處理 / API 呼叫 | ~370 | `generateConcept` 107 行、`generatePreviewImage` 80 行 |
| **7 個 inline render 函式** | **~570** | 佔全檔 35%，每次 re-render 重建 |
| Return JSX | ~150 | Settings、Header、Stage 切換、Footer |

---

## Phase 1 — 抽出 Render 函式 → 獨立元件

> **目標行數減幅**：~570 行 → App.tsx 剩餘 ~1,080 行  
> **風險**：低（純 UI 搬移，不改邏輯）

### 1-A：`src/components/KeyConfigPanel.tsx`

- **來源**：`renderKeyConfig()`（L610–L735）
- **Props**：
  ```ts
  {
    isText: boolean;
    authMethod: 'apikey' | 'oauth';
    setAuthMethod: (v: 'apikey' | 'oauth') => void;
    provider: string;
    keySource: KeySource;
    setKeySource: (v: KeySource) => void;
    keyValue: string;
    setKeyValue: (v: string) => void;
    hasBuiltInGeminiKey: boolean;
    hasPaidKey: boolean;
    onSelectKey: () => void;
    t: (key: string, vars?: Record<string, string>) => string;
  }
  ```
- **注意**：已接收全部參數為 arguments，轉成 Props 即可

### 1-B：`src/components/WorkflowStepper.tsx`

- **來源**：`renderWorkflowStepper()`（L737–L789）
- **Props**：
  ```ts
  {
    steps: Array<{ id: WorkflowStage; title: string; desc: string }>;
    currentStage: WorkflowStage;
    stageIndex: number;
    hasResult: boolean;
    onJumpToStage: (stage: WorkflowStage) => void;
  }
  ```

### 1-C：`src/components/UrlInputBar.tsx`

- **來源**：`renderUrlInputBar()`（L791–L861）
- **Props**：
  ```ts
  {
    variant: 'hero' | 'panel';
    url: string;
    setUrl: (v: string) => void;
    loading: boolean;
    error: string;
    urlValidationError: string;
    onSubmit: () => void;
    onClearError: () => void;
    t: (key: string) => string;
  }
  ```

### 1-D：`src/sections/HeroSection.tsx`

- **來源**：`renderHeroStage()`（L863–L940）
- **Props**：
  ```ts
  {
    url: string;
    entryMorphProgress: number;
    heroIdle: string;
    heroActive: string;
    renderUrlInputBar: () => ReactNode;  // 暫時由 App 傳入，Phase 2 再解耦
    t: (key: string) => string;
  }
  ```
- **備註**：內含吉祥物漂浮動畫，完全自包含

### 1-E：`src/sections/BriefSection.tsx`

- **來源**：`renderBriefPanel()`（L942–L1,068）
- **Props**：
  ```ts
  {
    briefStageActive: boolean;
    workflowStageIndex: number;
    url: string;
    provider: string; setProvider: (v: string) => void;
    model: string; setModel: (v: string) => void;
    mascotType: MascotType; setMascotType: (v: MascotType) => void;
    loading: boolean;
    demoMode: boolean;
    panelVisibility: PanelVisibilityConfig;
    renderUrlInputBar: () => ReactNode;
    renderKeyConfig: () => ReactNode;
    onGenerate: () => void;
    t: (key: string) => string;
  }
  ```

### 1-F：`src/sections/ConceptSection.tsx`

- **來源**：`renderConceptPanel()`（L1,070–L1,199）
- **最大元件**（~135 行），包含：分析卡片區 + Prompt 編輯區 + 空狀態
- **Props**：
  ```ts
  {
    textStageActive: boolean;
    loading: boolean;
    result: ConceptResult | null;
    url: string;
    promptText: string;
    copied: boolean;
    regeneratingPrompt: boolean;
    panelVisibility: PanelVisibilityConfig;
    onContentChange: (section: SectionKey, content: string) => void;
    onManualPromptChange: (v: string) => void;
    onCopy: (text: string) => void;
    onRegeneratePrompt: () => void;
    renderWorkflowStepper: () => ReactNode;
    t: (key: string) => string;
  }
  ```

### 1-G：`src/sections/PreviewSection.tsx`

- **來源**：`renderPreviewPanel()`（L1,201–L1,400）
- **Props**：
  ```ts
  {
    previewStageActive: boolean;
    imageProvider: string; setImageProvider: (v: string) => void;
    imageModel: string; setImageModel: (v: string) => void;
    aspectRatio: string; setAspectRatio: (v: string) => void;
    includeText: boolean; setIncludeText: (v: boolean) => void;
    imageText: string; setImageText: (v: string) => void;
    generatingImage: boolean;
    generatedImage: string;
    promptText: string;
    demoMode: boolean;
    panelVisibility: PanelVisibilityConfig;
    renderKeyConfig: () => ReactNode;
    onGenerate: () => void;
    t: (key: string) => string;
  }
  ```

### Phase 1 驗收標準

- [x] 所有 7 個 render 函式搬移完成
- [x] `npm run build` 通過
- [ ] UI 外觀與互動行為完全一致
- [x] App.tsx 不再有 `render` 前綴的函式

---

## Phase 2 — 自訂 Hooks 整合狀態

> **目標行數減幅**：~150 行  
> **風險**：中（涉及狀態重新組織）

### 2-A：`src/hooks/useApiKeyConfig.ts`

- **整合**：文字 AI 與圖片 AI 的 5+5 個幾乎相同的 useState
- **API**：
  ```ts
  function useApiKeyConfig(type: 'text' | 'image') {
    return {
      provider, setProvider,
      model, setModel,
      apiKey, setApiKey,
      authMethod, setAuthMethod,
      keySource, setKeySource,
    };
  }
  ```
- **包含自動切換邏輯**：provider 改變時重設 model、keySource 的 useEffect

### 2-B：`src/hooks/useKeyDetection.ts`

- **整合**：`demoMode`、`hasCheckedPaidKey`、`hasInitializedDemoMode`、`hasPaidKey`
- **包含**：`getAiStudio()`、`handleSelectKey()`
- **API**：
  ```ts
  function useKeyDetection(hasBuiltInKey: boolean) {
    return { demoMode, setDemoMode, hasPaidKey, handleSelectKey };
  }
  ```

### 2-C：`src/hooks/useBgFlash.ts`

- **整合**：`bgOverride`、`bgTimerRef`、`clearBgTimers()`、`flashBackground()`
- **API**：
  ```ts
  function useBgFlash() {
    return { bgOverride, flashBackground, clearBgTimers };
  }
  ```

### 2-D：`src/hooks/useWorkflow.ts`

- **整合**：`workflowStage`、`workflowStageIndex`、`currentWorkflowStep`、`jumpToStage()`
- **API**：
  ```ts
  function useWorkflow(t: TFunction) {
    return {
      stage, setStage,
      stageIndex, currentStep,
      steps, jumpToStage,
    };
  }
  ```

### Phase 2 驗收標準

- [x] 4 個自訂 hooks 建立完成
- [x] App.tsx 的 useState 從 22 個降至 ~8 個
- [x] `npm run build` 通過
- [x] 所有 useEffect 從 App.tsx 消失或僅剩 1–2 個 orchestration 級別的

---

## Phase 3 — 抽出業務邏輯層

> **目標行數減幅**：~350 行  
> **風險**：中（需確保 API 呼叫 + 狀態更新的時序一致）

### 3-A：`src/services/conceptService.ts`

- **搬移**：
  - `buildSystemPrompt()` (~15 行)
  - `buildDemoConceptResult()` (~40 行)
  - `generateConcept()` 的核心 API 邏輯 (~60 行，不含 setState)
  - `regeneratePrompt()` 的核心 API 邏輯 (~40 行)
- **回傳純資料**，setState 保留在 App/hook 層
- **型別**：
  ```ts
  export async function fetchConcept(params: {
    url: string;
    model: string;
    apiKey: string;
    systemPrompt: string;
    t: TFunction;
  }): Promise<ConceptResult>;

  export async function fetchRegeneratedPrompt(params: {
    result: ConceptResult;
    model: string;
    apiKey: string;
    mascotInstruction: string;
    url: string;
    t: TFunction;
  }): Promise<string>;
  ```

### 3-B：`src/services/imageService.ts`

- **搬移**：
  - Google Gemini image generation (~30 行)
  - OpenAI DALL-E image generation (~25 行)
- **型別**：
  ```ts
  export async function generateImage(params: {
    provider: 'google' | 'openai';
    model: string;
    apiKey: string;
    prompt: string;
    aspectRatio: string;
    t: TFunction;
  }): Promise<string>; // base64 或 URL
  ```

### 3-C：`src/services/errorService.ts`

- **搬移**：`getReadableApiError()` (~42 行)
- **純函式**，無副作用

### Phase 3 驗收標準

- [x] 3 個 service 模組建立完成
- [x] App.tsx 不再直接 import `@google/genai`
- [x] `npm run build` 通過
- [ ] API 呼叫 / 快取 / 錯誤處理行為不變

---

## Phase 4 — 最終收束

> **目標**：App.tsx ≤ 350 行，僅負責組合與協調

### 4-A：清理 App.tsx

- 移除所有已遷出的 import
- 將 `WORKFLOW_STAGES`、`DEFAULT_PANEL_VISIBILITY` 搬到 `constants.ts`
- 確認 App.tsx 結構：
  ```
  import 區（~30 行）
  App()
  ├─ hooks 呼叫（~15 行）
  ├─ orchestration handlers（~40 行）
  ├─ SettingsPanel config（~30 行）
  └─ return JSX（~100 行）
  ```

### 4-B：更新 ROADMAP.md

- 勾選 `4.1 — 拆分 App.tsx` 的子項目
- 勾選 `4.2 — 自訂 hooks`

### Phase 4 驗收標準

- [x] App.tsx ≤ 350 行
- [x] `npm run build` 通過
- [x] 無 TypeScript 錯誤
- [x] 開發伺服器 `npm run dev` 正常運行
- [ ] 所有工作流程（entry → analysis → prompt → preview）正常

---

## 預計檔案結構

```
src/
├── App.tsx                          (~300 行，組合層)
├── constants.ts                     (新增 WORKFLOW_STAGES, DEFAULT_PANEL_VISIBILITY)
├── types.ts                         (不變)
├── main.tsx                         (不變)
├── index.css                        (不變)
├── vite-env.d.ts                    (不變)
├── components/
│   ├── SectionCardsGrid.tsx         (已存在)
│   ├── SettingsPanel.tsx            (已存在)
│   ├── KeyConfigPanel.tsx           (Phase 1-A)
│   ├── WorkflowStepper.tsx          (Phase 1-B)
│   └── UrlInputBar.tsx              (Phase 1-C)
├── sections/
│   ├── HeroSection.tsx              (Phase 1-D)
│   ├── BriefSection.tsx             (Phase 1-E)
│   ├── ConceptSection.tsx           (Phase 1-F)
│   └── PreviewSection.tsx           (Phase 1-G)
├── hooks/
│   ├── useApiKeyConfig.ts           (Phase 2-A)
│   ├── useKeyDetection.ts           (Phase 2-B)
│   ├── useBgFlash.ts               (Phase 2-C)
│   └── useWorkflow.ts              (Phase 2-D)
├── services/
│   ├── conceptService.ts            (Phase 3-A)
│   ├── imageService.ts              (Phase 3-B)
│   └── errorService.ts              (Phase 3-C)
└── i18n/
    ├── messages.ts                  (不變)
    └── useI18n.ts                   (不變)
```

---

## 執行順序與依賴

```
Phase 1（無依賴，可並行）
  ├── 1-A  KeyConfigPanel
  ├── 1-B  WorkflowStepper
  ├── 1-C  UrlInputBar
  ├── 1-D  HeroSection
  ├── 1-E  BriefSection
  ├── 1-F  ConceptSection
  └── 1-G  PreviewSection
         │
Phase 2（依賴 Phase 1 完成）
  ├── 2-A  useApiKeyConfig    ← 影響 1-E, 1-G
  ├── 2-B  useKeyDetection    ← 影響 1-A
  ├── 2-C  useBgFlash         ← 獨立
  └── 2-D  useWorkflow        ← 影響 1-B, 1-F
         │
Phase 3（依賴 Phase 2 完成）
  ├── 3-A  conceptService     ← 依賴 2-A
  ├── 3-B  imageService       ← 依賴 2-A
  └── 3-C  errorService       ← 獨立
         │
Phase 4（收束）
  └── 4-A  清理 App.tsx + 4-B 更新 Roadmap
```

---

## 風險與注意事項

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| render 函式閉包大量 App 狀態 | Props drilling 過深 | Phase 1 暫時接受，Phase 2 用 hooks 收攏 |
| `generateConcept` 混合 setState + API | 拆 service 時時序可能出錯 | service 只回傳資料，setState 保留在調用端 |
| UrlInputBar 被 Hero 和 BriefPanel 共用 | 兩處呈現邏輯微異 | 用 `variant` prop 控制差異（已有） |
| i18n `t` 函式到處傳遞 | 可考慮 Context | 專案規模小，Props 傳遞可接受 |
| bgFlash 涉及 setTimeout 清理 | 記憶體洩漏 | useBgFlash hook 封裝 cleanup |
