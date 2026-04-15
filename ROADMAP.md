# URL-HERO 開發路線圖

> 此檔案供 **Roadmap Dev** Agent 讀取，逐項實作功能單元。
> 標記說明：`[ ]` 未完成 · `[x]` 已完成 · `[-]` 暫緩

---

## Phase 1：核心功能完善

- [ ] 1.1 — 錯誤處理優化：統一 API 錯誤訊息格式，加入重試機制
- [ ] 1.2 — Loading 狀態改善：加入骨架屏（skeleton）替代純 spinner
- [x] 1.3 — URL 驗證：前端輸入時即時驗證 URL 格式合法性
- [x] 1.4 — 結果快取：相同 URL 在同一 session 內不重複呼叫 API

## Phase 2：使用者體驗

- [ ] 2.1 — 深色/淺色主題切換
- [x] 2.2 — 行動裝置響應式優化
- [x] 2.3 — 鍵盤快捷鍵支援（Enter 送出、Esc 關閉面板）
- [ ] 2.4 — 圖片下載按鈕（支援 PNG 格式匯出）

## Phase 3：進階功能

- [ ] 3.1 — 歷史紀錄：儲存最近 10 筆生成結果到 localStorage
- [ ] 3.2 — 分享功能：產生可分享的結果連結
- [ ] 3.3 — 批次處理：支援一次輸入多個 URL
- [ ] 3.4 — Prompt 模板：預設幾組常用的 prompt 風格模板

## Phase 4：技術債清理

- [x] 4.1 — 拆分 App.tsx：將各區塊抽成獨立元件（SectionCardsGrid、SettingsPanel）
- [x] 4.2 — 自訂 hooks：抽出 workflow / key / background orchestration，並將 API 邏輯下沉到 services
- [x] 4.3 — 型別整理：集中管理 types 到 src/types.ts
- [x] 4.4 — 測試覆蓋：加入 hooks / services 基礎測試

---

## 使用方式

在 VS Code 聊天面板選擇 **@Roadmap Dev**，然後輸入：

- `實作下一個功能` — 自動找到下一個 `[ ]` 項目並實作
- `實作 2.3` — 指定實作某一項
- `目前進度` — 回報 roadmap 狀態
