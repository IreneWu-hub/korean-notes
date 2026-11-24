import React, { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { usePluginData } from '@docusaurus/useGlobalData';
import type { LessonSearchIndexData } from '@site/src/plugins/lessonSearchIndex';
import styles from './styles.module.css';

interface LessonViewerProps {
  src: string;
  title: string;
}

const IFRAME_SCREEN_STYLE = `
@media screen {
  html, body {
    height: auto !important;
    min-height: 0 !important;
    overflow-y: hidden !important;
  }
  nav[aria-label="章節導覽"] {
    display: none !important;
  }
}
`;

export default function LessonViewer({ src, title }: LessonViewerProps): ReactNode {
  const resolvedSrc = useBaseUrl(src);
  const pluginData = usePluginData('lesson-search-index') as
    | LessonSearchIndexData
    | undefined;
  const lessonFileName = src.split('/').pop() ?? '';
  const searchSections = pluginData?.lessons?.[lessonFileName] ?? [];

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastHeightRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState<string>('85vh');

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const disconnectObserver = useCallback(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, []);

  const updateHeight = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      const doc = iframe?.contentWindow?.document;
      if (!doc?.body || !doc?.head) return;

      if (!doc.head.querySelector('style[data-iframe-autoheight]')) {
        const styleEl = doc.createElement('style');
        styleEl.setAttribute('data-iframe-autoheight', 'true');
        styleEl.textContent = IFRAME_SCREEN_STYLE;
        doc.head.appendChild(styleEl);
      }

      const nextHeight = Math.ceil(doc.body.getBoundingClientRect().height);
      if (nextHeight > 100 && Math.abs(nextHeight - lastHeightRef.current) > 2) {
        lastHeightRef.current = nextHeight;
        setHeight(`${nextHeight + 4}px`);
      }
    } catch {
      // 跨域或尚未載入完成時忽略
    }
  }, []);

  const handleLoad = useCallback(() => {
    clearTimers();
    disconnectObserver();
    lastHeightRef.current = 0;
    updateHeight();

    // 等待 Tailwind CDN 與字體載入完成後再次校正高度
    timersRef.current.push(
      window.setTimeout(updateHeight, 150),
      window.setTimeout(updateHeight, 500),
    );

    try {
      const doc = iframeRef.current?.contentWindow?.document;
      if (doc?.body && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          updateHeight();
        });
        ro.observe(doc.body);
        resizeObserverRef.current = ro;
      }
      if (doc && 'fonts' in doc && doc.fonts?.ready) {
        doc.fonts.ready.then(() => updateHeight()).catch(() => {});
      }
    } catch {
      // 忽略
    }
  }, [clearTimers, disconnectObserver, updateHeight]);

  useEffect(() => {
    let resizeTimer: number | undefined;

    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateHeight, 120);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      clearTimers();
      disconnectObserver();
    };
  }, [clearTimers, disconnectObserver, updateHeight]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      window.open(resolvedSrc, '_blank')?.print();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <a
          href={resolvedSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="button button--primary button--sm">
          在新分頁全螢幕開啟 ↗
        </a>
        <button
          type="button"
          onClick={handlePrint}
          className="button button--secondary button--sm">
          列印此筆記 🖨️
        </button>
      </div>
      <div className="lesson-iframe-container">
        <iframe
          ref={iframeRef}
          src={resolvedSrc}
          className="lesson-iframe"
          title={title}
          style={{ height }}
          onLoad={handleLoad}
        />
      </div>
      {searchSections.length > 0 && (
        <div className={styles.searchIndex} aria-hidden="true">
          {searchSections.map((section, idx) => (
            <React.Fragment key={idx}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
