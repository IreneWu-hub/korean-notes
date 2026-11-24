import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import styles from './styles.module.css';

interface KoreanAudioProps {
  text: string;
  label?: string;
  forcePlaying?: boolean;
}

// 保留目前播放中的 Utterance 參考，避免瀏覽器 GC 回收導致長句中斷或漏觸發 onend
let activeUtterance: SpeechSynthesisUtterance | null = null;
let stopActivePlayback: (() => void) | null = null;

export function sanitizeSpeechText(raw: string): string {
  return raw
    .replace(/\s*[（(][^）)]*[）)]/g, '')
    .replace(/\s*\/\s*/g, ', ')
    .trim();
}

export function KoreanAudio({
  text,
  label,
  forcePlaying = false,
}: KoreanAudioProps): ReactNode {
  const [playing, setPlaying] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetPlaying = (val: boolean) => {
    if (mountedRef.current) {
      setPlaying(val);
    }
  };

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const cleanText = sanitizeSpeechText(text);
    if (!cleanText) return;

    stopActivePlayback?.();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtterance = utterance;
    const stopSelf = () => safeSetPlaying(false);
    stopActivePlayback = stopSelf;

    utterance.lang = 'ko-KR';
    utterance.rate = 0.85; // Slightly slower for better clarity for learners
    utterance.onstart = () => safeSetPlaying(true);

    const handleFinish = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      if (stopActivePlayback === stopSelf) {
        stopActivePlayback = null;
      }
      safeSetPlaying(false);
    };

    utterance.onend = handleFinish;
    utterance.onerror = handleFinish;
    window.speechSynthesis.speak(utterance);
  };

  const isPlaying = playing || forcePlaying;

  return (
    <button
      type="button"
      onClick={speak}
      className={`${styles.audioBtn} ${isPlaying ? styles.playing : ''}`}
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

type MaskMode = 'none' | 'ko' | 'zh';

function buildSequentialOrder(length: number): number[] {
  return Array.from({ length }, (_, idx) => idx);
}

function shuffleOrder(currentOrder: number[]): number[] {
  const next = [...currentOrder];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  // 確保洗牌後順序有實際變化（項目數 > 1 時）
  if (next.length > 1 && next.every((val, idx) => val === currentOrder[idx])) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}

export function VocabTable({ items }: { items: VocabItem[] }): ReactNode {
  const hasEx = items.some((i) => i.ex);
  const [maskMode, setMaskMode] = useState<MaskMode>('none');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<number[]>(() => buildSequentialOrder(items.length));
  const [isShuffled, setIsShuffled] = useState(false);
  const [playingRowPos, setPlayingRowPos] = useState<number | null>(null);

  const mountedRef = useRef(true);
  const playSessionRef = useRef(0);
  const nextTimerRef = useRef<number | null>(null);
  const stopSelfRef = useRef<(() => void) | null>(null);

  const clearNextTimer = useCallback(() => {
    if (nextTimerRef.current !== null) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, []);

  const stopSequential = useCallback(
    (cancelSpeech: boolean) => {
      playSessionRef.current += 1;
      clearNextTimer();
      if (stopActivePlayback === stopSelfRef.current) {
        stopActivePlayback = null;
      }
      if (cancelSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        activeUtterance = null;
      }
      if (mountedRef.current) {
        setPlayingRowPos(null);
      }
    },
    [clearNextTimer],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSequential(true);
    };
  }, [stopSequential]);

  useEffect(() => {
    setOrder(buildSequentialOrder(items.length));
    setIsShuffled(false);
    setRevealed({});
    stopSequential(false);
  }, [items.length, stopSequential]);

  const selectMask = (target: MaskMode) => {
    setMaskMode(target);
    setRevealed({});
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShuffle = () => {
    stopSequential(true);
    setOrder((prev) => shuffleOrder(prev));
    setIsShuffled(true);
    setRevealed({});
  };

  const handleResetOrder = () => {
    stopSequential(true);
    setOrder(buildSequentialOrder(items.length));
    setIsShuffled(false);
    setRevealed({});
  };

  const handleToggleAutoplay = () => {
    if (playingRowPos !== null) {
      stopSequential(true);
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (order.length === 0) return;

    stopActivePlayback?.();
    window.speechSynthesis.cancel();

    const sessionId = playSessionRef.current + 1;
    playSessionRef.current = sessionId;

    const stopSelf = () => stopSequential(false);
    stopSelfRef.current = stopSelf;
    stopActivePlayback = stopSelf;

    const playAt = (pos: number) => {
      if (!mountedRef.current || playSessionRef.current !== sessionId) return;
      if (pos >= order.length) {
        stopSequential(false);
        return;
      }

      const item = items[order[pos]];
      const cleanText = item ? sanitizeSpeechText(item.ko) : '';
      if (!cleanText) {
        playAt(pos + 1);
        return;
      }

      setPlayingRowPos(pos);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      activeUtterance = utterance;
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;

      const advance = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        if (!mountedRef.current || playSessionRef.current !== sessionId) return;
        if (pos + 1 >= order.length) {
          stopSequential(false);
          return;
        }
        nextTimerRef.current = window.setTimeout(() => {
          playAt(pos + 1);
        }, 1100);
      };

      utterance.onend = advance;
      utterance.onerror = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        if (playSessionRef.current === sessionId) {
          stopSequential(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    playAt(0);
  };

  return (
    <div className={styles.vocabSection}>
      <div className={styles.vocabToolbar} role="toolbar" aria-label="單字表練習工具">
        <div className={styles.segmentedGroup} role="group" aria-label="遮罩自測模式">
          <button
            type="button"
            onClick={() => selectMask('none')}
            className={`${styles.segmentBtn} ${maskMode === 'none' ? styles.segmentBtnActive : ''}`}
            aria-pressed={maskMode === 'none'}>
            全部
          </button>
          <button
            type="button"
            onClick={() => selectMask('ko')}
            className={`${styles.segmentBtn} ${maskMode === 'ko' ? styles.segmentBtnActive : ''}`}
            aria-pressed={maskMode === 'ko'}>
            遮韓文
          </button>
          <button
            type="button"
            onClick={() => selectMask('zh')}
            className={`${styles.segmentBtn} ${maskMode === 'zh' ? styles.segmentBtnActive : ''}`}
            aria-pressed={maskMode === 'zh'}>
            遮中文
          </button>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className={`${styles.toolBtn} ${isShuffled ? styles.toolBtnActive : ''}`}>
          <svg
            className={styles.toolIcon}
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          <span>{isShuffled ? '再洗一次' : '隨機洗牌'}</span>
        </button>

        {isShuffled && (
          <button
            type="button"
            onClick={handleResetOrder}
            className={styles.toolBtn}
            title="恢復原本順序">
            還原順序
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleAutoplay}
          className={`${styles.toolBtn} ${
            playingRowPos !== null ? styles.toolBtnPlaying : ''
          }`}>
          {playingRowPos !== null ? (
            <svg
              className={styles.toolIcon}
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="currentColor"
              aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              className={styles.toolIcon}
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="currentColor"
              aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
          <span>
            {playingRowPos !== null
              ? `停止連播 (${playingRowPos + 1}/${order.length})`
              : '連播本區'}
          </span>
        </button>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.vocabTable}>
          <thead>
            <tr>
              <th>韓語 (點擊發音)</th>
              <th>中文意思</th>
              {hasEx && <th>實用例句</th>}
            </tr>
          </thead>
          <tbody>
            {order.map((origIdx, rowPos) => {
              const item = items[origIdx];
              if (!item) return null;
              const isRowPlaying = playingRowPos === rowPos;
              const koKey = `${origIdx}:ko`;
              const zhKey = `${origIdx}:zh`;
              const exKey = `${origIdx}:ex`;
              const isKoMasked = maskMode === 'ko' && !revealed[koKey];
              const isZhMasked = maskMode === 'zh' && !revealed[zhKey];
              const isExMasked = maskMode === 'ko' && !revealed[exKey];

              return (
                <tr key={origIdx} className={isRowPlaying ? styles.activeRow : undefined}>
                  <td>
                    <div className={styles.cellFlex}>
                      {maskMode === 'ko' ? (
                        <button
                          type="button"
                          onClick={() => toggleReveal(koKey)}
                          className={isKoMasked ? styles.maskPill : styles.revealedTextBtn}
                          title={isKoMasked ? '點擊顯示韓文' : '點擊重新遮住'}>
                          {isKoMasked ? '點擊顯示' : (
                            <span className={styles.tableKo}>{item.ko}</span>
                          )}
                        </button>
                      ) : (
                        <span className={styles.tableKo}>{item.ko}</span>
                      )}
                      <KoreanAudio text={item.ko} forcePlaying={isRowPlaying} />
                    </div>
                  </td>
                  <td>
                    {maskMode === 'zh' ? (
                      <button
                        type="button"
                        onClick={() => toggleReveal(zhKey)}
                        className={isZhMasked ? styles.maskPill : styles.revealedTextBtn}
                        title={isZhMasked ? '點擊顯示中文' : '點擊重新遮住'}>
                        {isZhMasked ? '點擊顯示' : item.zh}
                      </button>
                    ) : (
                      item.zh
                    )}
                  </td>
                  {hasEx && (
                    <td>
                      {item.ex ? (
                        <div className={styles.cellFlex}>
                          {maskMode === 'ko' ? (
                            <button
                              type="button"
                              onClick={() => toggleReveal(exKey)}
                              className={isExMasked ? styles.maskPill : styles.revealedTextBtn}
                              title={isExMasked ? '點擊顯示例句' : '點擊重新遮住'}>
                              {isExMasked ? '點擊顯示例句' : item.ex}
                            </button>
                          ) : (
                            <span>{item.ex}</span>
                          )}
                          <KoreanAudio text={item.ex} />
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
                <KoreanAudio text={ex.replace(/\s*\(.*?\)/g, '').trim()} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KoreanAudio;
