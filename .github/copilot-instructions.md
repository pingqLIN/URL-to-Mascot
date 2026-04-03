# URL-HERO 專案指令

## 技術棧
- React 18 + TypeScript (ES2022 target)
- Vite (bundler)
- Tailwind CSS (dark glassmorphism style)
- Framer Motion (animations)
- Google GenAI SDK (`@google/genai`)

## 建置與驗證
- `npm run build` — Vite production build
- `npm run dev` — 開發伺服器

## 程式碼慣例

### 樣式
- 深色玻璃風格：`bg-slate-950/78 backdrop-blur-xl border-white/10`
- 共用樣式常數：`INPUT_CLS`、`SELECT_CLS`、`LABEL_CLS`（定義在 App.tsx 頂部）
- 圓角風格：面板用 `rounded-[1.75rem]`，輸入框用 `rounded-xl`
- 顏色主題：amber 系（主色）、白色/透明度（文字）

### 元件
- 所有面板元件都用 `OrbitPanel` 包裹
- 動畫用 Framer Motion 的 `motion.div` + `AnimatePresence`
- 圖示用 lucide-react

### i18n
- 翻譯檔：`src/i18n/messages.ts`
- hook：`src/i18n/useI18n.ts`
- key 命名：camelCase（如 `errorNoUrl`、`textAnalysis`）
- 插值語法：`{{variableName}}`
- **每個使用者可見文字都必須有 en + zh-TW 兩種翻譯**

### 型別
- 自訂型別定義在 `src/App.tsx` 頂部
- 使用 `as const` 確保字面量型別
- 避免 `any`，除非與外部 API 互動

### 狀態管理
- 純 React hooks（useState、useEffect、useMemo）
- 不使用外部狀態管理庫
