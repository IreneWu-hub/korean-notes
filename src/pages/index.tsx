import React, { useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import type {
  LessonMetaItem,
  LessonSearchIndexData,
} from '@site/src/plugins/lessonSearchIndex';
import styles from './index.module.css';

interface ReferenceCard {
  icon: string;
  title: string;
  badge: string;
  description: string;
  to: string;
}

const REFERENCE_CARDS: ReferenceCard[] = [
  {
    icon: '⚡',
    title: '動詞與時態變化',
    badge: '-아요 / -어요',
    description:
      '現在、過去與未來式、義務許可、冠形詞修飾與 ㅂ/ㅡ/르/ㄹ/ㄷ 五大不規則音變速查。',
    to: '/docs/reference/conjugation',
  },
  {
    icon: '🧭',
    title: '常用助詞速查',
    badge: '은/는 · 에/에서',
    description:
      '主題與主格辨析、場所移動 vs 動作地點、-만 與 -밖에 否定搭配、伴隨助詞與口語縮寫。',
    to: '/docs/reference/particles',
  },
  {
    icon: '🔢',
    title: '數詞與計量單位',
    badge: '하나 ➔ 한 개',
    description:
      '固有詞 1~10、量詞縮短形、生活單位、固有天數（하루～열흘）、耗時句型與一日時段。',
    to: '/docs/reference/numbers',
  },
  {
    icon: '🔊',
    title: '必備單字庫 (附發音)',
    badge: 'TOPIK 高頻精選',
    description:
      '問候、點餐、地鐵交通、空間方位、服飾購物、超商、核心動詞與味覺形容詞，點擊即聽發音。',
    to: '/docs/reference/vocabulary',
  },
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const pluginData = usePluginData('lesson-search-index') as
    | LessonSearchIndexData
    | undefined;
  const lessons: LessonMetaItem[] = pluginData?.lessonMeta ?? [];
  const [showAllLessons, setShowAllLessons] = useState(false);

  const latestLesson = lessons[0];
  const latestLessonPath =
    latestLesson?.lessonPath ||
    (siteConfig.customFields?.latestLessonPath as string) ||
    '/latest';

  const visibleLessons = showAllLessons ? lessons : lessons.slice(0, 6);

  return (
    <Layout
      title={siteConfig.title}
      description="旅遊韓語會話馬上開口說 - 課堂筆記、文法單字速查、課後作業與雙人複習儀表板">
      <header className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span>🇰🇷</span>
            <span>(I.S)의 한국어 수업 · 韓語複習儀表板</span>
          </div>

          <Heading as="h1" className={styles.heroTitle}>
            旅遊韓語會話馬上開口說
          </Heading>
          <p className={styles.heroSubtitle}>
            整合課堂互動筆記、中韓英全文搜尋、文法單字速查與課後雙人實戰練習
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} to={latestLessonPath}>
              🚀 閱讀最新課堂
              {latestLesson ? ` (${latestLesson.label})` : ''}
            </Link>
            {latestLesson?.homeworkPath && (
              <Link className={styles.secondaryCta} to={latestLesson.homeworkPath}>
                ✍️ 本課課後作業
              </Link>
            )}
            {latestLesson?.practicePath && (
              <Link className={styles.secondaryCta} to={latestLesson.practicePath}>
                👥 本課雙人複習
              </Link>
            )}
          </div>

          <p className={styles.searchHint}>
            🔍 小提示：按 <kbd>Ctrl</kbd> + <kbd>K</kbd>（Mac 按 <kbd>⌘</kbd> +{' '}
            <kbd>K</kbd>）可直接全文搜尋 <strong>中文與韓文單字</strong>（如{' '}
            <code>깻잎</code>、<code>사흘</code>、<code>明洞</code>）
          </p>
        </div>
      </header>

      <main className={styles.dashboardMain}>
        {/* 文法與單字速查專區 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <Heading as="h2" className={styles.sectionTitle}>
                📚 文法與單字速查庫
              </Heading>
              <p className={styles.sectionDesc}>
                依 TOPIK 高頻考點與日常實用度精選整理，全數支援點擊發音
              </p>
            </div>
            <Link className={styles.sectionLink} to="/docs/reference">
              查看總覽與進度 ➔
            </Link>
          </div>

          <div className={styles.refGrid}>
            {REFERENCE_CARDS.map((card) => (
              <Link key={card.to} to={card.to} className={styles.refCard}>
                <div className={styles.refCardTop}>
                  <span className={styles.refIcon}>{card.icon}</span>
                  <span className={styles.refBadge}>{card.badge}</span>
                </div>
                <Heading as="h3" className={styles.refCardTitle}>
                  {card.title}
                </Heading>
                <p className={styles.refCardDesc}>{card.description}</p>
                <span className={styles.refCardArrow}>前往速查 ➔</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 近期課堂與課後複習 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <Heading as="h2" className={styles.sectionTitle}>
                🗓️ 近期課堂與複習入口
              </Heading>
              <p className={styles.sectionDesc}>
                依開課時間由新到舊排列，快速直達課堂筆記、自我測驗與雙人互考
              </p>
            </div>
            {lessons.length > 0 && (
              <Link
                className={styles.sectionLink}
                to={lessons[lessons.length - 1].lessonPath}>
                從 Lesson 01 開始 ➔
              </Link>
            )}
          </div>

          <div className={styles.lessonGrid}>
            {visibleLessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={`${styles.lessonCard} ${
                  idx === 0 ? styles.lessonCardLatest : ''
                }`}>
                <div className={styles.lessonCardHeader}>
                  <div className={styles.lessonTitleGroup}>
                    <Link to={lesson.lessonPath} className={styles.lessonTitle}>
                      {lesson.label}
                    </Link>
                    {idx === 0 && <span className={styles.newTag}>最新</span>}
                  </div>
                  {lesson.date && (
                    <span className={styles.lessonDate}>{lesson.date}</span>
                  )}
                </div>

                <p className={styles.lessonSummary}>
                  {lesson.summary || '旅遊韓語會話課堂重點整理'}
                </p>

                <div className={styles.lessonActions}>
                  <Link to={lesson.lessonPath} className={styles.actionNote}>
                    📖 課堂筆記
                  </Link>
                  {lesson.homeworkPath && (
                    <Link
                      to={lesson.homeworkPath}
                      className={styles.actionHomework}>
                      ✍️ 作業
                    </Link>
                  )}
                  {lesson.practicePath && (
                    <Link
                      to={lesson.practicePath}
                      className={styles.actionPractice}>
                      👥 雙人複習
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {lessons.length > 6 && (
            <div className={styles.toggleWrap}>
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowAllLessons((prev) => !prev)}>
                {showAllLessons
                  ? '收合課程清單 ▴'
                  : `展開全部 ${lessons.length} 堂課堂筆記 ▾`}
              </button>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
