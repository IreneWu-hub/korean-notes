# 🇰🇷 韓語課堂筆記自動生成器：Prompt & 使用指引

本指引與 Skill 旨在將每堂課的韓文雜記、零散單字、文法與例句，轉化為風格類似 **Lesson 008**、排版精美且具備點擊發音的互動筆記網頁。

> 💡 **靈活原則**：每堂課的主題與內容形式各異（可能是文法專題、旅遊情境、餐廳日常、主題單字、發音音變等）。  
> **不需要死板套用固定章節，而是根據你輸入的實際內容，由 AI 自行規劃最直覺易懂的 2~5 個複習分類，並選用最適合的卡片與表格風格！**

---

## 🚀 方式一：在 Antigravity 中直接使用（最推薦）

專案已內建 `.agents/skills/korean-lesson-generator/SKILL.md`。當你在 Antigravity 對話框中輸入課堂筆記時，AI 會自動偵測並調用此 Skill，依照你的內容動態排版，直接產出：
1. `static/lessons/lesson-{NUM}.html`（具備點擊發音、Tailwind CSS 排版、A4 列印優化）
2. `docs/lessons/lesson-{NUM}.md`（自動整合進 Docusaurus 側邊欄）

### 👉 輸入範例（隨興條列即可）：

```text
請幫我整理這堂課的韓文筆記：

【課堂編號】：Lesson 09（或不填，自動遞增）
【上課日期】：2026.10.08
【主題】：旅遊韓語：餐廳點餐與結帳
【筆記內容】：
- 文法：-(으)시겠어요? (您想要...嗎/客氣詢問), -(으)ㄹ게요 (我要.../意志)
- 句子：뭐 드시겠어요?, 비빔밥으로 할게요, 계산해 주세요, 따로따로 계산해 주세요
- 單字：메뉴판(菜單), 영수증(收據), 앞치마(圍裙), 포장(外帶)
- 老師提醒：따로따로 的發音與口語用法
```

---

## 📋 方式二：在外部 AI (ChatGPT / Claude / Gemini Web) 使用之 Master Prompt

如果你在其他 AI 平台使用，可複製以下這段「**動態靈活版 Master Prompt**」發送給 AI：

```markdown
你是一位資深的韓語教學專家兼現代網頁前端工程師。
請將我提供的「韓語課堂筆記」整理為一份易於複習、排版專業且具備互動發音功能的 HTML 學習筆記。
視覺風格與元件質感請比照以下標準，並根據我輸入的「實際內容」動態設計最合適的章節分類與編排，不需死板套用固定的主題分類。

### 🎨 核心規格與視覺規範：
1. **整體架構與列印優化**：
   - 繁體中文解析，使用 Tailwind CSS CDN 與 Google Fonts (Inter + Noto Sans KR)。
   - 內建 `@media print` 樣式（A4 直向、隱藏 `.no-print`、避免 `.page-break-avoid` 斷頁、列印移除陰影）。
   - 頁首包含標題、日期、`(I.S)의 한국어 수업` 副標題，以及「一鍵列印 / 匯出 PDF」按鈕 (`onclick="window.print()"`).

2. **Web Speech 互動發音 (TTS)**：
   - `<head>` 內建 `speakKorean(text)` 函式（語系 `ko-KR`，語速 `0.85`）。
   - **所有韓文句子、單字或變化型旁，皆需附上發音朗讀小按鈕** (`<button onclick="speakKorean('...')">` 附音響 SVG 圖示)。

3. **靈活動態分類（依當堂內容自主規劃 2~5 個單元）**：
   - **🎯 本堂學習重點 (Highlights)**：頁首頂端紫底卡片，濃縮 2~4 點當日核心收穫。
   - **主體內容（從以下積木庫中靈活選用最適合的呈現方式）**：
     - 若有文法句型 ➔ 主題色卡片深度解析（含公式、有/無收音變化、助詞小提醒）。
     - 若有複雜長句 ➔ 適時插入「💡 初學者必看拆解專區」（逐一拆解單字、助詞、動詞原型與縮寫推導）。
     - 若有文法對比 ➔ 使用「雙欄對比卡片」或「公式拆解網格」。
     - 若有對話練習 ➔ 使用「情境對話卡片」（`가` 藍色圓標、`나` 綠色圓標、發音小提醒、全句朗讀按鈕）。
     - 若有單字群/口語短句 ➔ 使用「主題分類表格」（表格列 hover 效果、口語縮寫標籤）。
     - 若有發音難點或音變 ➔ 使用灰底漸層虛線卡片補充「發音特別解析」（推導連音、硬音化、代表音等步驟）。
     - 若有文化背景 ➔ 適時補充文化小知識。

4. **輸出檔案要求**：
   - 請直接輸出完整、可獨立執行的 HTML 代碼。
   - 並附上 Docusaurus Markdown 封裝代碼：
     ```markdown
     ---
     title: Lesson {NUM} ({DATE})
     sidebar_label: Lesson {NUM} ({DATE})
     ---

     import LessonViewer from '@site/src/components/LessonViewer';

     <LessonViewer
       src="/korean-notes/lessons/lesson-{NUM}.html"
       title="Lesson {NUM}"
     />
     ```

---
【我的上課筆記內容如下】：
(在此貼上你的課堂筆記)
```

---

## 🧩 常用視覺元件庫速查

| 元件類型 | Tailwind 核心 Class | 適合內容 |
| :--- | :--- | :--- |
| **本堂學習重點** | `bg-indigo-50 border-l-4 border-indigo-500 rounded-xl p-6` | 每堂課開頭的 2~4 點核心摘要 |
| **文法解析盒** | `bg-blue-50 (或 purple/emerald) rounded-xl p-6 border` | 當堂的核心文法、句型公式與變化 |
| **初學者拆解專區** | `bg-indigo-50 border border-indigo-200 rounded-xl p-5` | 拆解「單字 + 助詞 + 動詞原形與語尾」 |
| **雙欄對照卡片** | `grid grid-cols-1 md:grid-cols-2 gap-6` | 義務 vs 許可、敬語 vs 半語、同/反義詞對照 |
| **情境對話** | `bg-white rounded-xl shadow-sm border border-gray-200` | 會話練習，`가`(藍)/`나`(綠) 圓形頭像徽章 |
| **單字表格** | `divide-y divide-gray-100 hover:bg-gray-50` | 詞彙群、口語縮寫（如 `이건`、`뭘`）、短句 |
| **發音音變補充** | `border-2 border-dashed border-gray-300 bg-gradient-to-r` | 連音、硬音化、雙收音推導與音標 |
