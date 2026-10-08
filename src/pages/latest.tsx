import type {ReactNode} from 'react';
import React from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * 自動重定向至最新課堂筆記頁面
 * 使用 useBaseUrl 確保相容於子路徑 baseUrl (如 /korean-notes/)
 */
export default function LatestLesson(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const latestLessonPath =
    (siteConfig.customFields?.latestLessonPath as string) || '/docs/lessons/lesson-009';
  const targetUrl = useBaseUrl(latestLessonPath);

  return <Redirect to={targetUrl} />;
}
