import React, { useState, type ReactNode } from 'react';
import styles from './styles.module.css';

interface KoreanAudioProps {
  text: string;
  label?: string;
}

export function KoreanAudio({ text, label }: KoreanAudioProps): ReactNode {
  const [playing, setPlaying] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85; // Slightly slower for better clarity for learners
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      type="button"
      onClick={speak}
      className={`${styles.audioBtn} ${playing ? styles.playing : ''}`}
      title={`點擊聆聽韓語發音: ${text}`}
      aria-label={`聆聽發音: ${text}`}>
      {label && <span>{label}</span>}
      <svg
        className={styles.speakerIcon}
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>
  );
}

export function KoreanWord({
  ko,
  zh,
  rom,
}: {
  ko: string;
  zh?: string;
  rom?: string;
}): ReactNode {
  return (
    <span className={styles.wordWrapper}>
      <strong className={styles.koreanText}>{ko}</strong>
      <KoreanAudio text={ko} />
      {rom && <span className={styles.romanization}>[{rom}]</span>}
      {zh && <span className={styles.meaning}>{zh}</span>}
    </span>
  );
}

export interface VocabItem {
  ko: string;
  zh: string;
  rom?: string;
  ex?: string;
}

export function VocabTable({ items }: { items: VocabItem[] }): ReactNode {
  return (
    <div className={styles.tableResponsive}>
      <table className={styles.vocabTable}>
        <thead>
          <tr>
            <th style={{ width: '32%' }}>韓語 (點擊發音)</th>
            <th style={{ width: '28%' }}>中文意思</th>
            <th style={{ width: '18%' }}>羅馬拼音</th>
            {items.some((i) => i.ex) && <th>實用例句</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.tableKo}>{item.ko}</span>
                  <KoreanAudio text={item.ko} />
                </div>
              </td>
              <td>{item.zh}</td>
              <td>{item.rom || '-'}</td>
              {items.some((i) => i.ex) && (
                <td>
                  {item.ex ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.ex}</span>
                      <KoreanAudio text={item.ex} />
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface TransformItem {
  origin: string;
  originKo: string;
  transformed: string;
  examples: string[];
}

const DEFAULT_TRANSFORMS: TransformItem[] = [
  {
    origin: '하나 (1)',
    originKo: '하나',
    transformed: '한',
    examples: ['한 개', '한 잔', '한 명', '한 마리'],
  },
  {
    origin: '둘 (2)',
    originKo: '둘',
    transformed: '두',
    examples: ['두 개', '두 잔', '두 명', '두 마리'],
  },
  {
    origin: '셋 (3)',
    originKo: '셋',
    transformed: '세',
    examples: ['세 개', '세 잔', '세 명', '세 마리'],
  },
  {
    origin: '넷 (4)',
    originKo: '넷',
    transformed: '네',
    examples: ['네 개', '네 잔', '네 명', '네 병'],
  },
  {
    origin: '스물 (20)',
    originKo: '스물',
    transformed: '스무',
    examples: ['스무 살 (20歲)', '스무 개 (20個)'],
  },
];

export function NumberTransformGrid({
  items = DEFAULT_TRANSFORMS,
}: {
  items?: TransformItem[];
}): ReactNode {
  return (
    <div className={styles.transformGrid}>
      {items.map((item, idx) => (
        <div key={idx} className={styles.transformCard}>
          <div className={styles.transformHeader}>
            <div className={styles.originPill}>
              <span>{item.origin}</span>
              <KoreanAudio text={item.originKo} />
            </div>

            <div className={styles.arrowIndicator}>
              <span>接量詞</span>
              <span>➔</span>
            </div>

            <div className={styles.targetBox}>
              <span className={styles.targetText}>{item.transformed}</span>
              <KoreanAudio text={item.transformed} />
            </div>
          </div>

          <div className={styles.examplesWrap}>
            <span className={styles.exampleLabel}>常用搭配:</span>
            {item.examples.map((ex, eIdx) => (
              <span key={eIdx} className={styles.exampleBadge}>
                <span>{ex}</span>
                <KoreanAudio text={ex.split(' ')[0] + ' ' + (ex.split(' ')[1] || '')} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KoreanAudio;
