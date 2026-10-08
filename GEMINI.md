# Korean Notes Assistant Guidelines

## 專案概述 (Project Overview)
本專案為韓語上課學習筆記網站，使用 Docusaurus 建立，並在 `static/lessons/` 提供具備互動語音 (TTS)、Tailwind CSS 排版與清晰易讀排版的課程筆記網頁。

## 筆記生成規範 (Lesson Generation Rule)
當用戶在此對話中輸入韓語課堂筆記、複習內容或單字文法時：
1. **風格與版面範本**：參考 [lesson-008.html](file:///c:/Users/Irene/Documents/KoreanNotes/korean-notes/static/lessons/lesson-008.html) 的**視覺風格、元件質感與互動功能**（Tailwind CSS、Web Speech 發音按鈕、初學者拆解機制）。
2. **標題與頁首規範**：
   - 標題格式統一為：`Lesson #N 旅遊韓語會話馬上開口說`（如 `Lesson #09 旅遊韓語會話馬上開口說`）。
   - 從 `lesson-009` 起，HTML 內部**拔掉列印匯出按鈕**。
3. **本堂學習重點規範**：
   - 標題為 `🎯 本堂學習重點`（**不加** `(Lesson Highlights)` 括號內容）。
   - 內部項目以 `<li class="flex items-start gap-3">` 搭配 `<div class="flex-1 leading-relaxed text-sm sm:text-base">` 包覆，避免 flexbox 跑版。
4. **字體大小與排版規範**：
   - 補充說明與次要註釋文字**不要使用過小的 `text-xs`**，應使用 `text-sm`（14px）確保易讀性與版面舒適度。
5. **靈活動態分類（不強制死板套用固定章節）**：
   - 根據**當堂課的實際筆記內容**，自主規劃 2~5 個最適合學生複習的分類單元。
   - 若當堂側重文法 ➔ 重點放在文法規則、收音變化、句型拆解與造句。
   - 若當堂側重會話 ➔ 重點放在情境對話（`가`/`나` 徽章）、口語縮寫、語氣與發音提醒。
   - 若當堂側重詞彙 ➔ 重點放在情境單字表格、常用搭配詞與例句。
   - 若涉及音變或文化 ➔ 適時補充發音解析（連音、硬音化、代表音等）或台韓文化差異。
6. **必備互動體驗**：
   - Web Speech 發音功能 (`speakKorean(text)`)，所有韓語句子與單字旁皆附發音按鈕。
   - 遇難句/長句適時提供「初學者拆解專區」（拆解單字、助詞與動詞原形變化）。
7. **產出雙檔案**：
   - `static/lessons/lesson-{NUM}.html`（三位數編號，如 `lesson-009.html`）
   - `docs/lessons/lesson-{NUM}.md`（封裝 `<LessonViewer ... />`，並在頂部附帶 `:::info 📚 課堂進度範圍` 供記錄教材範圍）
8. **詳細規範參考**：[.agents/skills/korean-lesson-generator/SKILL.md](file:///c:/Users/Irene/Documents/KoreanNotes/korean-notes/.agents/skills/korean-lesson-generator/SKILL.md)。
