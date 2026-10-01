import React, { useRef } from 'react';
import styles from './styles.module.css';

interface LessonViewerProps {
  src: string;
  title: string;
}

export default function LessonViewer({ src, title }: LessonViewerProps): JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      window.open(src, '_blank')?.print();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <a
          href={src}
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
          src={src}
          className="lesson-iframe"
          title={title}
        />
      </div>
    </div>
  );
}
