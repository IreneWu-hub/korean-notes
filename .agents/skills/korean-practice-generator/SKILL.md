---
name: korean-practice-generator
description: >-
  針對指定韓語課堂 (Lesson N) 生成「20分鐘精實版」雙人互助複習手冊 (docs/practice/lesson-{NUM}.md)。
  採用 Docusaurus Tabs 雙重視角 (角色 A 考官手握答案 / 角色 B 挑戰者無劇透盲測)，
  涵蓋旅遊主題句型抽測、核心文法攻防與情境實戰對話，風格簡潔有力、直球對決。
---

# 韓語雙人複習手冊生成 Skill (Korean Practice Generator)

本 Skill 專門用於為指定課堂（例如 `Lesson 13`）量身打造**「20分鐘高密度、直球對決、防劇透雙人互練」**的複習手冊頁面，協助兩位學習夥伴在課後連線或見面時進行高效互考與情境實戰。

---

## 🎯 核心原則與規範 (Core Principles)

1. **獨立放置，不入側邊欄 (No Sidebar)**：
   - 檔案統一存放於 **`docs/practice/lesson-{NUM}.md`**（例如 `docs/practice/lesson-013.md`）。
   - Frontmatter 必須包含 **`displayed_sidebar: null`**，使頁面維持乾淨的全寬無干擾介面，不打亂左側目錄。

2. **Docusaurus `<Tabs>` 雙重視角防劇透機制 (Anti-spoiler Dual Perspective)**：
   - 每一大題皆由 `<Tabs>` 包覆：
     - **角色 A（考官 / 答案）**：手握題目、標準答案、重點說明與 `<KoreanAudio />` 即時發音按鈕。
     - **角色 B（挑戰者 / 盲測）**：僅提供情境提示，**完全不顯示答案**，逼迫大腦在 3 秒內組織語言開口。
     - 每一題結束後，加上俐落換邊提示：`🔄 **換邊**：由角色 B 出題`。

3. **簡潔有力風格規範 (Concise & Punchy Tone)**：
   - 頁面一級標題固定為：`# Lesson {NUM} 雙人複習手冊 (20分鐘)`。
   - 拔除冗長的背景前言，只保留必要的出題提示、糾錯雷達與快速切換指引。
   - 頂部導覽一律使用：
     ```markdown
     :::info[📌 複習指南]
     * **對應內容**：[Lesson #{NUM} 課堂筆記](../lessons/lesson-{NUM}.md) ｜ [課後作業](../homework/lesson-{NUM}.md)
     * **進行方式**：一人選「角色 A（考官）」，一人選「角色 B（挑戰者）」，各題輪流互換。
     * **核心重點**：{當堂旅遊核心句型、重點文法、不規則變化}
     :::
     ```

4. **精準 20 分鐘三部曲架構 (20-Minute Tripartite Structure)**：

| 階段 | 項目 | 建議時間 | 設計重點 |
| :---: | :--- | :---: | :--- |
| **Part 1** | ✈️ **旅遊句型抽測** | 7 分鐘 (一人 3.5m) | 6 大當堂實戰核心短句（中翻韓 3 秒直覺反應，附口語習慣用法） |
| **Part 2** | ⏳ **核心文法攻防** | 7 分鐘 (一人 3.5m) | 當堂動詞時態接球（原形 ➔ 活用形）、名詞變化、不規則形容詞 |
| **Part 3** | 🎭 **情境實戰對話** | 6 分鐘 (一人 3m) | 依當堂旅遊情境（如超商、餐廳、買票）給予角色任務卡，全韓語無劇本對談 |
| **結算** | 🎯 **結算** | 1 分鐘 | 快速確認連音、硬音化、不規則音變盲點，附雙向跳轉連結 |

5. **流暢雙向跳轉串接 (Bi-directional Navigation)**：
   - **Lesson 筆記頁**（`docs/lessons/lesson-{NUM}.md`）：
     - 清單加入：`- [ ] **[👥 Lesson {NUM} 雙人複習手冊 (20分鐘)](../practice/lesson-{NUM}.md)**`
   - **Lesson HTML 頁**（`static/lessons/lesson-{NUM}.html`）：
     - 底部按鈕區加入綠色按鈕：`👥 雙人複習手冊 (20分鐘)`
   - **Homework 作業頁**（`docs/homework/lesson-{NUM}.md`）：
     - 底部加入跳轉：`👥 **[前往 Lesson {NUM} 雙人複習手冊 (20分鐘)](../practice/lesson-{NUM}.md)**`
   - **Practice 手冊頁**（`docs/practice/lesson-{NUM}.md`）：
     - 底部結算區提供返回課堂筆記與作業連結。

---

## 🛠️ 標準結構範本 (`docs/practice/lesson-{NUM}.md`)

```markdown
---
title: Lesson {NUM} 雙人複習手冊 (20分鐘)
displayed_sidebar: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { KoreanWord, KoreanAudio } from '@site/src/components/KoreanAudio';

# Lesson {NUM} 雙人複習手冊 (20分鐘)

:::info[📌 複習指南]
* **對應內容**：[Lesson #{NUM} 課堂筆記](../lessons/lesson-{NUM}.md) ｜ [課後作業](../homework/lesson-{NUM}.md)
* **進行方式**：一人選「角色 A（考官）」，一人選「角色 B（挑戰者）」，各題輪流互換。
* **核心重點**：{當堂核心項目}
:::

---

## ⏱️ 時間分配

| 階段 | 項目 | 時間 | 核心目標 |
| :---: | :--- | :---: | :--- |
| **Part 1** | ✈️ **旅遊句型抽測** | 7 分鐘 | {情境主題句型}（一人 3.5 分鐘） |
| **Part 2** | ⏳ **核心文法攻防** | 7 分鐘 | {核心文法與時態變形}（一人 3.5 分鐘） |
| **Part 3** | 🎭 **情境實戰對話** | 6 分鐘 | 全韓語情境模擬，雙方各演一次（一人 3 分鐘） |

---

## 一、 旅遊句型抽測 (7 分鐘)

> **規則**：考官唸中文，挑戰者 3 秒內說出韓語。完成後互換角色。

<Tabs>
<TabItem value="p1_role_a" label="👤 角色 A（考官 / 答案）" default>

1. **{題目中文}**  
   ➔ <KoreanAudio text="{韓文答案}" /> **{韓文答案}**  
   *(重點：{文法或地道口語提點})*

---
🔄 **換邊**：由角色 B 出題

</TabItem>
<TabItem value="p1_role_b" label="👤 角色 B（挑戰者 / 盲測）">

> 💡 **任務**：聽夥伴提示，3 秒內說出韓語：

1. **{情境提示 1}**

</TabItem>
</Tabs>

---

## 二、 核心文法攻防 (7 分鐘)

> **規則**：考官發球出題，挑戰者秒答過去式或口語變化。

<Tabs>
<TabItem value="p2_role_a" label="👤 角色 A（考官 / 答案）" default>

### 1. 動詞/形容詞變形接球
| 考官發球 (原形) | 挑戰者回擊 (活用形) | 糾錯重點 |
| :--- | :--- | :--- |
| **{原形}** | <KoreanAudio text="{活用形}" /> **{活用形}** | {連音/母音合流/不規則} |

---
🔄 **換邊**：由角色 B 出題

</TabItem>
<TabItem value="p2_role_b" label="👤 角色 B（挑戰者 / 盲測）">

> 💡 **任務**：聽題目快速回擊正確時態與變形：

* **變形接球**：`{原形1}` ➔ ？ ｜ `{原形2}` ➔ ？

</TabItem>
</Tabs>

---

## 三、 情境實戰對話 (6 分鐘)

> **規則**：不看劇本、全韓語模擬。第一輪 A/B；第二輪互換。

<Tabs>
<TabItem value="p3_role_a" label="🏪 角色 1（{身份}）" default>

1. **步驟 1**：<KoreanAudio text="{韓語}" /> **{韓語}**

</TabItem>
<TabItem value="p3_role_b" label="🎒 角色 2（{身份}）">

1. **任務 1**：{中文任務與關鍵字提示}

</TabItem>
</Tabs>

---

## 結算 (1 分鐘)

* **糾錯確認**：{確認當堂最易卡住的連音或音變}
* 📖 [返回 Lesson {NUM} 課堂筆記](../lessons/lesson-{NUM}.md) ｜ ✍️ [課後作業](../homework/lesson-{NUM}.md)
```

---

## 驗證清單
產出檔案後，必須執行以下驗證：
1. 確保 Docusaurus `<Tabs>` 標籤無未閉合錯誤。
2. 執行 `npm run build` 確認編譯成功且無破版或死鏈接。

