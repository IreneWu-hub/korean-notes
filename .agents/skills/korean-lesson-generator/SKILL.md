---
name: korean-lesson-generator
description: >-
  將韓語上課原始筆記轉換為標準化的繁體中文互動複習網頁 (HTML) 與 Docusaurus 筆記頁面 (.md)。
  依據當堂課的實際內容靈活分類與排版，風格與視覺質感比照 lesson-008.html，
  包含 Web Speech TTS 發音按鈕、Tailwind CSS 排版、A4 列印優化與初學者友善拆解。
---

# 韓語上課筆記生成 Skill (Korean Lesson Generator)

本 Skill 的核心目標是：**「將零散的課堂筆記，轉化為邏輯清晰、易於複習、排版精美且具備點擊發音的筆記網頁」**。

> 💡 **核心原則：靈活編排，不生搬硬套**  
> 每堂課的主題與教學重心不同（可能著重於特定文法、日常情境會話、主題單字、文化差異或發音音變）。  
> **請務必根據用戶輸入的「實際課堂內容」自由調整主題分類與章節結構**，將 Lesson 008 視為**「視覺風格與元件庫範本」**，靈活挑選最適合當堂內容的元件進行組合！

---

## 🛠️ 執行流程與產出檔案

1. **分析輸入內容**：
   - 提取或推算課堂編號（如 `Lesson 09`，預設為 `static/lessons/` 最大編號 + 1，補足三位數如 `lesson-009`）。
   - 課堂日期（如 `2026.10.08`）與主題名稱。
   - **進度範圍（教材/頁數）**：若使用者筆記有提及課本章節或頁碼（如 `kpop旅遊韓語 Day 1-3 (48-49頁)`），一併提取；若無則保留空白供後續填寫。
   - 分析內容重點：這堂課的重心是「核心文法」、「生活情境對話」、「單字分類」還是「特殊發音」？

2. **動態規劃最適章節分類（依內容彈性配置 2~5 個大單元）**：
   - **必備頁首**：
     - **標題格式固定為**：`Lesson N 旅遊韓語會話馬上開口說`（例如：`Lesson 09 旅遊韓語會話馬上開口說`）。
     - **無列印按鈕**：從 `lesson-009` 起，HTML 內部拔除右上角的列印匯出按鈕。
     - **本堂學習重點**：標題為 `🎯 本堂學習重點`（**不加** `(Lesson Highlights)` 括號內容）。內部文字必須用 `<div class="flex-1 leading-relaxed text-sm sm:text-base">` 包覆，避免 flexbox 跑版。
   - **字體大小規範**：
     - 補充說明或次要註釋文字**不要使用過小的 `text-xs`**，應使用 `text-sm`（14px）以保持清晰易讀，並確保間距與排版整齊不壅擠。
   - **彈性主體章節**（依內容自由挑選與組合）：
     - 遇到文法 ➔ 規劃為「文法深度解析」，附公式、有/無收音變化、助詞提醒。
     - 遇到長句或難句 ➔ 適時插入「初學者拆解專區（單字 + 助詞 + 動詞原型變化）」。
     - 遇到對比文法或句型 ➔ 使用「雙欄對比卡片」或「語句拆解網格」。
     - 遇到會話或情境模擬 ➔ 使用「情境對話卡片（`가`/`나` 徽章、音變標註）」。
     - 遇到單字群或口語短句 ➔ 使用「主題分類表格（含縮寫、敬語/半語備註）」。
     - 遇到容易唸錯或音變現象 ➔ 補充「發音特別解析（連音、硬音化、代表音推導）」。
     - 遇到文化背景（如台韓飲食、稱謂差異） ➔ 補充「文化小知識卡片」。

3. **產出雙份檔案**：
   - `static/lessons/lesson-{NUM}.html`（三位數，如 `lesson-009.html`）
   - `docs/lessons/lesson-{NUM}.md`（封裝 `<LessonViewer ... />`，並在上方加入「課堂進度範圍」卡片欄位）

---

## 🎨 視覺風格系統與元件積木庫 (Design System)

所有產生的 HTML 請遵循以下標準規範與樣式元件：

### 1. 頁面基礎結構與 Web Speech TTS
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson #{NUM} 旅遊韓語會話馬上開口說 (I.S)의 한국어 수업 [{DATE}]</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', 'Noto Sans KR', sans-serif; background-color: #f8fafc; color: #1e293b; }
        @media print {
            @page { size: A4 portrait; margin: 1.2cm; }
            body { background-color: white; }
            .no-print { display: none !important; }
            .page-break-avoid { page-break-inside: avoid; }
            .print-no-shadow { box-shadow: none !important; border: 1px solid #e2e8f0; }
        }
    </style>
    <script>
        function speakKorean(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ko-KR';
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            } else {
                alert('您的瀏覽器不支援語音發音功能。');
            }
        }
    </script>
</head>
<body class="antialiased pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <!-- 頁首 (無列印按鈕) -->
        <div class="mb-8 border-b-2 border-indigo-600 pb-4">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Lesson #{NUM} <br class="sm:hidden">旅遊韓語會話馬上開口說
            </h1>
            <p class="text-lg text-indigo-700 font-semibold mt-2">
                (I.S)의 한국어 수업 <span class="text-gray-500 font-normal ml-2">{DATE}</span>
            </p>
        </div>
```

### 2. 萬用點擊發音按鈕（重要：所有韓語句子與單字旁皆加上）
```html
<!-- 單字／短片語發音按鈕 -->
<button onclick="speakKorean('{韓文}')" class="no-print inline-flex items-center justify-center p-1 ml-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors" title="點擊發音">
    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
</button>

<!-- 全句朗讀按鈕（文字標籤版） -->
<button onclick="speakKorean('{韓文全句}')" class="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-colors self-start md:self-center mt-2 md:mt-0" title="點擊聆聽全句發音">
    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    朗讀
</button>
```

### 3. 可選積木庫（依當堂內容靈活選用）

- **積木 A：本堂學習重點**
  `bg-indigo-50 rounded-xl p-6 mb-8 border-l-4 border-indigo-500`，標題使用 `🎯 本堂學習重點`（不加括號說明），清單項目以 `<li class="flex items-start gap-3">` 搭配 `<div class="flex-1 leading-relaxed text-sm sm:text-base">` 排版。
- **積木 B：文法與句型解析卡片**
  `bg-blue-50` 或其他主題色，內部包含規則說明、收音變化卡片、例句列表。說明文字請維持 `text-sm`。
- **積木 C：初學者超詳細拆解專區**
  `bg-indigo-50 border border-indigo-200`，白底小卡片逐一標註「單字意義 + 助詞功能 + 動詞原形與縮寫變化推導」。
- **積木 D：文法規則對比 / 雙欄卡片**
  `grid grid-cols-1 md:grid-cols-2 gap-6`，例如頂部紅色邊框 `border-t-4 border-red-400` vs 綠色邊框 `border-t-4 border-green-400`。
- **積木 E：公式拆解網格**
  如 `grid grid-cols-4 gap-2`，將長句按成分拆分為 4 欄（副詞、動詞、連接詞、語尾）。
- **積木 F：情境對話 (Dialogue)**
  `bg-white rounded-xl shadow-sm border border-gray-200`，圓形說話者頭像 `가` (藍色 `bg-blue-100 text-blue-800`) 與 `나` (綠色 `bg-green-100 text-green-800`)，中間虛線分隔線 `border-dashed`。
- **積木 G：分類單字表格**
  `bg-white rounded-xl overflow-hidden border border-gray-200`，頂部色塊標題（橘色 `bg-orange-50`、綠色 `bg-teal-50` 等），表格具備 hover 效果與單字發音按鈕。
- **積木 H：課外發音或文化補充**
  外框為灰底漸層或虛線 `border-2 border-dashed border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100`，包含問題、音變推導步驟（連音、硬音化等）與成果發音按鈕。

---

## 📄 Docusaurus 筆記頁面 (`docs/lessons/lesson-{NUM}.md`)

同步建立對應 Markdown 檔案，頁面頂部**必須包含「課堂進度範圍」欄位**供記錄每堂課的進度範圍：
```markdown
---
title: Lesson #{NUM} ({DATE})
sidebar_label: Lesson #{NUM} ({DATE})
---

- **📚 課堂進度範圍**：{若有提及教材/頁數則填寫，無則留空供後續記錄}

import LessonViewer from '@site/src/components/LessonViewer';

<LessonViewer
  src="/korean-notes/lessons/lesson-{NUM}.html"
  title="Lesson #{NUM}"
/>
```

> 💡 **自動最新課堂跳轉說明**：  
> 網站頂部導航列「最新課堂 🚀」與首頁「開始閱讀課堂筆記 📖」均連接至動態重定向路由 `/latest`，系統會自動解析 `docs/lessons/` 中最新的一堂課並即時跳轉，生成新課堂時無需手動修改導航設定或首頁連結。

