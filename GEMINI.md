# Korean Notes Assistant Guidelines

## 專案概述 (Project Overview)
本專案為韓語上課學習筆記網站，使用 Docusaurus 建立，並在 `static/lessons/` 提供具備互動語音 (TTS)、Tailwind CSS 排版與清晰易讀排版的課程筆記網頁。

## 筆記生成規範 (Lesson Generation Rule)
當用戶在此對話中輸入韓語課堂筆記、複習內容或單字文法時：
1. **風格與版面範本**：參考 [lesson-008.html](file:///c:/Users/Irene/Documents/_Project/korean-notes/static/lessons/lesson-008.html) 的**視覺風格、元件質感與互動功能**（Tailwind CSS、Web Speech 發音按鈕、初學者拆解機制）。
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
   - `docs/lessons/lesson-{NUM}.md`（封裝 `<LessonViewer ... />`，並在頂部附帶俐落的「課堂進度範圍」清單，列出教材範圍、課後作業與雙人複習連結，不加重複的 `:::tip` 橫幅卡片）
8. **詳細規範參考**：[.agents/skills/korean-lesson-generator/SKILL.md](file:///c:/Users/Irene/Documents/_Project/korean-notes/.agents/skills/korean-lesson-generator/SKILL.md)。

## 課後作業生成規範 (Homework Generation Rules)
當用戶要求針對特定課堂製作課後複習作業或測驗時：
1. **存放路徑與無側欄規範**：
   - 存放於 `docs/homework/lesson-{NUM}.md`（如 `docs/homework/lesson-012.md`）。
   - Frontmatter 必須包含 `displayed_sidebar: null`，確保頁面不放入側邊欄，保持左側課程筆記目錄純粹整潔。
2. **雙向跳轉機制**：
   - 在 `docs/lessons/lesson-{NUM}.md` 的「作業與複習」清單中提供直達連結。
   - 在 `static/lessons/lesson-{NUM}.html` 底部作業區塊加入跳轉按鈕。
   - 在 `docs/homework/lesson-{NUM}.md` 底部提供返回 Lesson 筆記與雙人複習手冊連結。
3. **Admonition 中括號語法規範**：
   - 提示卡片標題**必須以中括號包覆**（如 `:::info[標題]`、`:::tip[標題]`、`:::note[標題]`），嚴禁寫成 `:::tip 標題`，避免 Docusaurus v3/v4 解析器視為普通段落而印出三個冒號。
4. **題型設計原則（深度複習、拒絕簡單死背）**：
   - 刪除過於機械的基礎單選題與純詞彙挖空，針對當堂課重點設計：情境中翻韓造句、委婉對話應答、核心文法語氣辨析（如 `-만` vs `-밖에`）、數量時間發音陷阱（如 `두 시간`、`닷새`、連音）。
   - 每一大題後附帶 `<details><summary>` 折疊式參考解析。
5. **口頭發表作業不引導原則**：
   - 若當堂課有口頭發表作業（`숙제: 발표`），**嚴禁代寫示範講稿或範例短文**，僅提供「自主構思思考維度框架表格」，保留空白讓學生自由創作。
6. **側邊大綱欄 (TOC) 防重複規範**：
   - Docusaurus 會自動將頁面中的 `##` 與 `###` 標題抓取為右側文章大綱目錄（On-page TOC）。
   - 折疊答案區 (`<details>`) 內部**嚴禁使用 `##` 或 `###` 標題語法**，以防答案項目重複被收錄進側邊目錄中；折疊內部的小標題一律使用加粗文字（如 `**【解析 1】...**` 或 `**1. ...**`）。
7. **詳細規範參考**：[.agents/skills/korean-homework-generator/SKILL.md](file:///c:/Users/Irene/Documents/_Project/korean-notes/.agents/skills/korean-homework-generator/SKILL.md)。

## 雙人複習手冊生成規範 (Practice Playbook Generation Rules)
當用戶要求針對特定課堂製作雙人互助複習手冊時：
1. **存放路徑與無側欄規範**：
   - 存放於 `docs/practice/lesson-{NUM}.md`（如 `docs/practice/lesson-013.md`）。
   - Frontmatter 必須包含 `displayed_sidebar: null`，保持全寬無側欄介面。
2. **Docusaurus `<Tabs>` 雙重視角防劇透機制**：
   - 每一大題均以 `<Tabs>` 分割：
     - **角色 A（考官 / 答案）**：附題目、標準答案、重點說明與 `<KoreanAudio />` 即時發音按鈕。
     - **角色 B（挑戰者 / 盲測）**：僅提供情境提示，無韓文答案，逼迫在 3 秒內反射開口。
   - 每一大題結束後加上乾脆的換邊提示：`🔄 **換邊**：由角色 B 出題`。
3. **精準 20 分鐘三部曲架構**：
   - 一級標題統一為：`# Lesson {NUM} 雙人複習手冊 (20分鐘)`
   - **Part 1：旅遊句型抽測 (7 分鐘)**（當堂實戰核心短句中翻韓）
   - **Part 2：核心文法攻防 (7 分鐘)**（動詞過去式變形接球、名詞時態、不規則變化）
   - **Part 3：情境實戰對話 (6 分鐘)**（無劇本情境任務卡全韓語對談，各演一次）
   - **結算 (1 分鐘)**（音變糾錯與雙向連結）
4. **用語風格**：
   - 簡潔有力、直球對決，拔除多餘贅詞說明。
5. **詳細規範參考**：[.agents/skills/korean-practice-generator/SKILL.md](file:///c:/Users/Irene/Documents/_Project/korean-notes/.agents/skills/korean-practice-generator/SKILL.md)。

## 文法與單字庫統整規範 (Reference Database Rules)
1. **收錄路徑**：`docs/reference/`
   - `index.mdx`：總覽首頁與進度追蹤看板（包含統整狀態、待更新範圍、分類導覽）
   - `conjugation.mdx`：動詞、形容詞活用與時態句型
   - `particles.mdx`：格助詞、副詞格助詞、輔助詞
   - `numbers.mdx`：韓語固有數詞、量詞單位與指示系統
   - `vocabulary.mdx`：依生活與旅遊情境分類的高頻單字庫（搭配 `<VocabTable />` 支援點擊即時發音）
2. **目前資料庫統整進度**：
   - **已統整收錄課堂**：**Lesson 01 ~ Lesson 13**
   - **待更新收錄課堂**：**暫無（累積數堂課後再進行下一批次統整）**
   - 每隔數堂課進行批次抽精華更新時，必須同步更新 `docs/reference/index.mdx` 與本段進度紀錄。
3. **詳細規範參考**：[.agents/skills/korean-reference-updater/SKILL.md](file:///c:/Users/Irene/Documents/_Project/korean-notes/.agents/skills/korean-reference-updater/SKILL.md)。

