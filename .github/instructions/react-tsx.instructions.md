---
description: "Use when editing React components, TSX files, or TypeScript logic. Covers component patterns, Tailwind conventions, and Framer Motion usage in this project."
applyTo: "**/*.tsx"
---

# React/TSX 慣例

## 元件結構
- 函式元件（`function` 宣告，不用 arrow 匯出）
- 內部子元件直接定義在主元件函式內（如 `OrbitPanel`、`TextAnalysisPanel`）
- Props 型別用 inline object type，不另外定義 interface

## Tailwind 慣例
- 深色系：`bg-slate-800` / `bg-slate-900` / `bg-slate-950`
- 透明度用 Tailwind 語法：`bg-white/10`、`text-white/40`
- hover / focus 狀態都要加：`hover:border-white/18 focus:border-amber-500/55`
- 共用樣式用頂部常數：`INPUT_CLS`、`SELECT_CLS`、`LABEL_CLS`

## Framer Motion
- 進場動畫：`initial={{ opacity: 0, y: 18 }}` → `animate={{ opacity: 1, y: 0 }}`
- 標準 easing：`[0.22, 1, 0.36, 1]`
- 退場用 `AnimatePresence` + `exit` prop

## React 模式
```tsx
// State — 用 useState
const [value, setValue] = useState<Type>(initialValue);

// Side effects — useEffect，寫清楚 deps
useEffect(() => { /* ... */ }, [dep1, dep2]);

// Computed — useMemo
const computed = useMemo(() => /* ... */, [dep]);

// Event handler — const + 箭頭函式
const handleSomething = () => { /* ... */ };
```

## 從不
- 不用 class components
- 不用 Redux / Zustand / Jotai
- 不用 CSS Modules
- 不用 styled-components
