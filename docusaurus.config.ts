import fs from 'fs';
import path from 'path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

function getLatestLessonPath(): string {
  try {
    const lessonsDir = path.resolve(__dirname, 'docs/lessons');
    if (fs.existsSync(lessonsDir)) {
      const files = fs.readdirSync(lessonsDir);
      // 支援任何以 lesson 為開頭的 markdown 檔案 (不分大小寫、支援任意位數數字如 009 或 09)
      const lessonFiles = files.filter(
        (file) => /^lesson/i.test(file) && /\.mdx?$/i.test(file),
      );
      if (lessonFiles.length > 0) {
        // 依照檔名中的數字數值進行自然數值排序 (例如 9 > 8, 10 > 9)
        lessonFiles.sort((a, b) => {
          const numA = parseInt(a.replace(/\D+/g, ''), 10) || 0;
          const numB = parseInt(b.replace(/\D+/g, ''), 10) || 0;
          if (numA !== numB) {
            return numA - numB;
          }
          return a.localeCompare(b);
        });
        const latestFile = lessonFiles[lessonFiles.length - 1];
        const lessonName = latestFile.replace(/\.mdx?$/i, '');
        return `/docs/lessons/${lessonName}`;
      }
    }
  } catch (e) {
    console.error('Failed to resolve latest lesson path:', e);
  }
  return '/docs/lessons/lesson-009';
}

const latestLessonPath = getLatestLessonPath();

const config: Config = {
  title: '旅遊韓語會話馬上開口說(I.S)의 한국어 수업 ',
  tagline: 'Korean Class Notes',
  favicon: 'img/favicon.svg',
  customFields: {
    latestLessonPath,
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://irenewu-hub.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/korean-notes/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'irenewu-hub', // Usually your GitHub org/user name.
  projectName: 'korean-notes', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/irenewu-hub/korean-notes/tree/main/',
        },
        blog: {
          showReadingTime: false,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/irenewu-hub/korean-notes/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'zh'],
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '旅遊韓語會話馬上開口說(I.S)의 한국어 수업 ',
      logo: {
        alt: 'Korean Notes Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'lessonsSidebar',
          position: 'left',
          label: '韓文課程',
        },
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: '文法與單字庫 📚',
        },
        {
          to: latestLessonPath,
          label: '最新課堂 🚀',
          position: 'left',
        },
        {
          href: 'https://github.com/irenewu-hub/korean-notes',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '課程與速查工具',
          items: [
            {
              label: '所有課程筆記',
              to: '/docs/lessons/lesson-001',
            },
            {
              label: '常用助詞速查 (은/는, 이/가...)',
              to: '/docs/reference/particles',
            },
            {
              label: '動詞時態變化 (-아요/어요)',
              to: '/docs/reference/conjugation',
            },
            {
              label: '旅遊日常單字庫 (點擊發音 🔊)',
              to: '/docs/reference/vocabulary',
            },
          ],
        },
        {
          title: '相關連結',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/irenewu-hub/korean-notes',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Irene Wu. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
