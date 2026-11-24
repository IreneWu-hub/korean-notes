import fs from 'fs';
import path from 'path';
import type { LoadContext, Plugin } from '@docusaurus/types';

export interface LessonSearchSection {
  title: string;
  content: string;
}

export interface LessonMetaItem {
  id: string;
  number: number;
  label: string;
  date: string;
  summary: string;
  lessonPath: string;
  homeworkPath?: string;
  practicePath?: string;
}

export interface LessonSearchIndexData {
  lessons: Record<string, LessonSearchSection[]>;
  lessonMeta: LessonMetaItem[];
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&emsp;': ' ',
};

function decodeEntities(str: string): string {
  return str
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp|emsp);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripTagsToText(htmlFragment: string): string {
  return decodeEntities(
    htmlFragment
      // 移除非內容區塊與互動控制項文字
      .replace(/<(script|style|nav|svg|button)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      // 塊級與換行標籤轉為空白，避免前後字詞黏在一起
      .replace(/<\/?(?:br|p|div|li|tr|td|th|h[1-6]|section|header|footer|ul|ol|table|thead|tbody)[^>]*>/gi, ' ')
      // 移除其餘 HTML 標籤
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSectionsFromHtml(html: string): LessonSearchSection[] {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const body = (bodyMatch ? bodyMatch[1] : html)
    .replace(/<(script|style|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');

  const h2Regex = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches = [...body.matchAll(h2Regex)];
  const sections: LessonSearchSection[] = [];

  if (matches.length === 0) {
    const content = stripTagsToText(body);
    if (content) {
      sections.push({ title: '課堂內容', content });
    }
    return sections;
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const title = stripTagsToText(current[1]);
    // 略過頁首副標或空標題
    if (!title || title === '(I.S)의 한국어 수업') {
      continue;
    }
    const startIdx = (current.index ?? 0) + current[0].length;
    const endIdx = next?.index ?? body.length;
    const content = stripTagsToText(body.slice(startIdx, endIdx));
    if (content) {
      sections.push({ title, content });
    }
  }

  return sections;
}

function extractLessonMeta(siteDir: string): LessonMetaItem[] {
  const lessonsDocDir = path.resolve(siteDir, 'docs/lessons');
  const homeworkDocDir = path.resolve(siteDir, 'docs/homework');
  const practiceDocDir = path.resolve(siteDir, 'docs/practice');

  if (!fs.existsSync(lessonsDocDir)) {
    return [];
  }

  const files = fs
    .readdirSync(lessonsDocDir)
    .filter((f) => /^lesson.*\.mdx?$/i.test(f));

  const items: LessonMetaItem[] = files.map((file) => {
    const id = file.replace(/\.mdx?$/i, '');
    const number = parseInt(id.replace(/\D+/g, ''), 10) || 0;
    const raw = fs.readFileSync(path.join(lessonsDocDir, file), 'utf8');

    const titleMatch = raw.match(/^title:\s*(.+)$/m);
    const fullTitle = titleMatch ? titleMatch[1].trim() : `Lesson ${String(number).padStart(2, '0')}`;
    const dateMatch = fullTitle.match(/\((\d{4}\.\d{2}\.\d{2})\)/);
    const date = dateMatch ? dateMatch[1] : '';
    const label = fullTitle.replace(/\s*\(\d{4}\.\d{2}\.\d{2}\)/, '').trim();

    // 提取「課堂進度範圍」摘要
    let summary = '';
    const inlineScope = raw.match(/課堂進度範圍\*\*：([^\r\n]+)/);
    if (inlineScope && inlineScope[1].trim()) {
      summary = inlineScope[1].trim();
    } else {
      const bulletScopes = [...raw.matchAll(/^\s{2}-\s+(?!作業與複習)(.+)$/gm)]
        .map((m) => m[1].trim())
        .filter(Boolean);
      summary = bulletScopes.join(' · ');
    }

    const hasHomework =
      fs.existsSync(path.join(homeworkDocDir, `${id}.md`)) ||
      fs.existsSync(path.join(homeworkDocDir, `${id}.mdx`));
    const hasPractice =
      fs.existsSync(path.join(practiceDocDir, `${id}.md`)) ||
      fs.existsSync(path.join(practiceDocDir, `${id}.mdx`));

    return {
      id,
      number,
      label,
      date,
      summary,
      lessonPath: `/docs/lessons/${id}`,
      ...(hasHomework ? { homeworkPath: `/docs/homework/${id}` } : {}),
      ...(hasPractice ? { practicePath: `/docs/practice/${id}` } : {}),
    };
  });

  // 依課堂編號由新到舊排序
  items.sort((a, b) => b.number - a.number);
  return items;
}

/**
 * 自動掃描 static/lessons/lesson-*.html 並擷取各單元標題與純文字，
 * 同時彙整 docs/lessons、homework、practice 中繼資料，供站內搜尋與首頁儀表板使用。
 */
export default function lessonSearchIndexPlugin(
  context: LoadContext,
): Plugin<LessonSearchIndexData> {
  return {
    name: 'lesson-search-index',

    async loadContent(): Promise<LessonSearchIndexData> {
      const lessonsDir = path.resolve(context.siteDir, 'static/lessons');
      const lessons: Record<string, LessonSearchSection[]> = {};

      if (fs.existsSync(lessonsDir)) {
        const files = fs
          .readdirSync(lessonsDir)
          .filter((f) => /^lesson.*\.html$/i.test(f))
          .sort();

        for (const file of files) {
          const html = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
          const sections = extractSectionsFromHtml(html);
          if (sections.length > 0) {
            lessons[file] = sections;
          }
        }
      }

      const lessonMeta = extractLessonMeta(context.siteDir);
      return { lessons, lessonMeta };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
