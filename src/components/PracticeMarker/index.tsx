import React, { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import { KoreanAudio } from '@site/src/components/KoreanAudio';
import styles from './styles.module.css';

type MarkStatus = 'done' | 'weak';

interface MarkedItemInfo {
  id: string;
  label: string;
  audioText?: string;
  status: MarkStatus;
}

interface ParsedQuestion {
  id: string;
  elements: HTMLElement[];
  badgeHost: HTMLElement;
  label: string;
  audioText?: string;
}

const MARK_ATTR = 'data-pm-id';
const STATUS_ATTR = 'data-pm-status';

function extractAudioText(elements: HTMLElement[]): string | undefined {
  for (const el of elements) {
    const btn = el.querySelector<HTMLButtonElement>('button[aria-label^="聆聽發音:"]');
    if (btn) {
      const aria = btn.getAttribute('aria-label') || '';
      const text = aria.replace(/^聆聽發音:\s*/, '').trim();
      if (text) return text;
    }
  }
  return undefined;
}

function cleanTextContent(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('button, [data-pm-badge="true"]').forEach((node) => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function buildLabel(elements: HTMLElement[]): string {
  const parts = elements
    .map((el) => cleanTextContent(el))
    .filter((t) => t.length > 0 && t !== '-');
  const joined = parts.join(' — ');
  if (joined.length > 90) {
    return `${joined.slice(0, 88)}…`;
  }
  return joined;
}

function isDoublePairTable(table: HTMLTableElement): boolean {
  const headerCells = Array.from(table.querySelectorAll('thead tr th'));
  if (headerCells.length !== 4) return false;
  const h0 = (headerCells[0].textContent || '').trim();
  const h2 = (headerCells[2].textContent || '').trim();
  // 雙欄並列題庫（如「題目 (中文) | 韓語答案 | 題目 (中文) | 韓語答案」）
  return h0.length > 0 && h0 === h2;
}

function collectRoleAQuestions(container: HTMLElement): ParsedQuestion[] {
  const results: ParsedQuestion[] = [];
  const tabsContainers = Array.from(container.querySelectorAll<HTMLElement>('.tabs-container'));

  let qCounter = 0;

  tabsContainers.forEach((tabsEl, tIdx) => {
    const tabs = Array.from(tabsEl.querySelectorAll<HTMLElement>('[role="tab"]'));
    const panels = Array.from(tabsEl.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    if (tabs.length === 0 || panels.length === 0) return;

    // 找出角色 A（考官 / 引導者）對應的分頁索引，預設為第 0 個分頁
    let roleAIdx = tabs.findIndex((tab) => {
      const txt = tab.textContent || '';
      return txt.includes('角色 A') || txt.includes('考官') || txt.includes('引導者');
    });
    if (roleAIdx === -1) roleAIdx = 0;

    const panel = panels[roleAIdx];
    if (!panel) return;

    // 1. 表格題目
    const tables = Array.from(panel.querySelectorAll<HTMLTableElement>('table'));
    tables.forEach((table) => {
      const doublePair = isDoublePairTable(table);
      const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr'));

      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll<HTMLTableCellElement>('td'));
        if (cells.length === 0) return;

        if (doublePair && cells.length >= 4) {
          // 左側題目 (cell 0 + cell 1)
          const leftLabel = buildLabel([cells[0], cells[1]]);
          if (leftLabel) {
            qCounter += 1;
            results.push({
              id: `pm-t${tIdx}-q${qCounter}`,
              elements: [cells[0], cells[1]],
              badgeHost: cells[0],
              label: leftLabel,
              audioText: extractAudioText([cells[0], cells[1]]),
            });
          }
          // 右側題目 (cell 2 + cell 3)
          const rightLabel = buildLabel([cells[2], cells[3]]);
          if (rightLabel) {
            qCounter += 1;
            results.push({
              id: `pm-t${tIdx}-q${qCounter}`,
              elements: [cells[2], cells[3]],
              badgeHost: cells[2],
              label: rightLabel,
              audioText: extractAudioText([cells[2], cells[3]]),
            });
          }
        } else {
          const rowLabel = buildLabel(cells);
          if (rowLabel) {
            qCounter += 1;
            results.push({
              id: `pm-t${tIdx}-q${qCounter}`,
              elements: [row],
              badgeHost: cells[0],
              label: rowLabel,
              audioText: extractAudioText([row]),
            });
          }
        }
      });
    });

    // 2. 清單題目（只取葉節點 li，避免標到外層群組標題）
    const listItems = Array.from(panel.querySelectorAll<HTMLLIElement>('ol > li, ul > li'));
    listItems.forEach((li) => {
      if (li.querySelector('ol, ul')) return;
      const label = buildLabel([li]);
      if (!label) return;
      qCounter += 1;
      results.push({
        id: `pm-t${tIdx}-q${qCounter}`,
        elements: [li],
        badgeHost: li,
        label,
        audioText: extractAudioText([li]),
      });
    });
  });

  return results;
}

function getNextStatus(current: MarkStatus | undefined): MarkStatus | undefined {
  if (!current) return 'done';
  if (current === 'done') return 'weak';
  return undefined;
}

function updateBadgeElement(badge: HTMLElement, status: MarkStatus | undefined) {
  badge.setAttribute('data-pm-badge-status', status || 'none');
  if (status === 'done') {
    badge.textContent = '✓';
    badge.title = '已考過（再點一下改為待加強）';
  } else if (status === 'weak') {
    badge.textContent = '!';
    badge.title = '卡住待加強（再點一下取消標記）';
  } else {
    badge.textContent = '';
    badge.title = '點一下標記：已考過 ➔ 待加強';
  }
}

export default function PracticeMarker(): ReactNode {
  const { pathname } = useLocation();
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [questionMap, setQuestionMap] = useState<Record<string, ParsedQuestion>>({});
  const questionMapRef = useRef<Record<string, ParsedQuestion>>({});
  const marksRef = useRef<Record<string, MarkStatus>>({});

  useEffect(() => {
    marksRef.current = marks;
  }, [marks]);

  // 切換頁面時重置本輪標記
  useEffect(() => {
    setMarks({});
    setDrawerOpen(false);
  }, [pathname]);

  // 掃描並綁定角色 A 題目（支援非同步 chunk 載入重試）
  useEffect(() => {
    let cleanupFns: Array<() => void> = [];
    let retryTimer: number | null = null;
    let boundArticle: HTMLElement | null = null;
    let handleTabClick: ((e: MouseEvent) => void) | null = null;

    const bindQuestions = (attempt = 0) => {
      const article = document.querySelector<HTMLElement>('article');
      if (!article) {
        if (attempt < 5) {
          retryTimer = window.setTimeout(() => bindQuestions(attempt + 1), 150);
        }
        return;
      }

      const questions = collectRoleAQuestions(article);
      if (questions.length === 0 && attempt < 5) {
        retryTimer = window.setTimeout(() => bindQuestions(attempt + 1), 150);
        return;
      }

      boundArticle = article;
      const nextMap: Record<string, ParsedQuestion> = {};

      questions.forEach((q) => {
        nextMap[q.id] = q;

        // 在題目開頭插入極簡狀態圓點
        let badge = q.badgeHost.querySelector<HTMLSpanElement>(':scope > [data-pm-badge="true"]');
        if (!badge) {
          badge = document.createElement('span');
          badge.setAttribute('data-pm-badge', 'true');
          badge.className = styles.statusDot;
          q.badgeHost.insertBefore(badge, q.badgeHost.firstChild);
        }
        updateBadgeElement(badge, marksRef.current[q.id]);

        const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          // 點擊發音按鈕、連結或選取文字時不觸發標記
          if (target.closest('button, a')) return;
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) return;

          setMarks((prev) => {
            const nextStatus = getNextStatus(prev[q.id]);
            const updated = { ...prev };
            if (nextStatus) {
              updated[q.id] = nextStatus;
            } else {
              delete updated[q.id];
            }
            return updated;
          });
        };

        q.elements.forEach((el) => {
          el.setAttribute(MARK_ATTR, q.id);
          el.classList.add(styles.markableItem);
          el.addEventListener('click', handleClick);
          cleanupFns.push(() => {
            el.removeEventListener('click', handleClick);
            el.classList.remove(styles.markableItem);
            el.removeAttribute(MARK_ATTR);
            el.removeAttribute(STATUS_ATTR);
          });
        });
      });

      questionMapRef.current = nextMap;
      setQuestionMap(nextMap);

      // 若使用者切換成角色 B 分頁，自動收合結算面板避免劇透
      handleTabClick = (e: MouseEvent) => {
        const tab = (e.target as HTMLElement | null)?.closest('[role="tab"]');
        if (tab && (tab.textContent || '').includes('角色 B')) {
          setDrawerOpen(false);
        }
      };
      article.addEventListener('click', handleTabClick);
    };

    bindQuestions();

    return () => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
      if (boundArticle && handleTabClick) {
        boundArticle.removeEventListener('click', handleTabClick);
      }
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];
      if (boundArticle) {
        boundArticle.querySelectorAll('[data-pm-badge="true"]').forEach((node) => node.remove());
      }
    };
  }, [pathname]);

  // 同步 marks 狀態到 DOM 屬性與狀態圓點
  useEffect(() => {
    Object.values(questionMapRef.current).forEach((q) => {
      const status = marks[q.id];
      q.elements.forEach((el) => {
        if (status) {
          el.setAttribute(STATUS_ATTR, status);
        } else {
          el.removeAttribute(STATUS_ATTR);
        }
      });
      const badge = q.badgeHost.querySelector<HTMLSpanElement>(':scope > [data-pm-badge="true"]');
      if (badge) {
        updateBadgeElement(badge, status);
      }
    });
  }, [marks, questionMap]);

  const handleClearAll = useCallback(() => {
    setMarks({});
  }, []);

  const handleMarkDone = useCallback((id: string) => {
    setMarks((prev) => ({ ...prev, [id]: 'done' }));
  }, []);

  const handleJumpTo = useCallback((id: string) => {
    const q = questionMapRef.current[id];
    const el = q?.elements[0];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(styles.jumpHighlight);
    window.setTimeout(() => {
      el.classList.remove(styles.jumpHighlight);
    }, 1200);
    setDrawerOpen(false);
  }, []);

  const allEntries = Object.entries(marks);
  const doneCount = allEntries.filter(([, s]) => s === 'done').length;
  const weakItems: MarkedItemInfo[] = allEntries
    .filter(([, s]) => s === 'weak')
    .map(([id, status]) => {
      const q = questionMap[id];
      return {
        id,
        label: q?.label || id,
        audioText: q?.audioText,
        status,
      };
    });

  const totalMarked = doneCount + weakItems.length;

  return (
    <div className={styles.floatingWrap}>
      {drawerOpen && (
        <div className={styles.drawer} role="dialog" aria-label="本輪複習結算清單">
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitleGroup}>
              <strong className={styles.drawerTitle}>本輪結算清單</strong>
              <span className={styles.drawerMeta}>
                已考 {doneCount} 題 · 待加強 {weakItems.length} 題
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className={styles.closeBtn}
              aria-label="關閉結算清單">
              ✕
            </button>
          </div>

          <div className={styles.drawerBody}>
            {weakItems.length === 0 ? (
              <p className={styles.emptyText}>
                {doneCount > 0
                  ? '目前沒有卡住的題目，這輪表現很穩！'
                  : '在「角色 A」分頁直接點題目：點 1 下標記「已考過」、點 2 下標記「待加強」。'}
              </p>
            ) : (
              <ul className={styles.weakList}>
                {weakItems.map((item) => (
                  <li key={item.id} className={styles.weakItem}>
                    <div className={styles.weakItemMain}>
                      <span className={styles.weakLabel}>{item.label}</span>
                      {item.audioText && <KoreanAudio text={item.audioText} />}
                    </div>
                    <div className={styles.weakItemActions}>
                      <button
                        type="button"
                        onClick={() => handleJumpTo(item.id)}
                        className={styles.miniBtn}
                        title="跳回原題位置">
                        查看
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkDone(item.id)}
                        className={styles.miniBtnDone}
                        title="重練過關，改標為已考過">
                        過關 ✓
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.drawerFooter}>
            <span className={styles.hintText}>點題目循環：未考 ➔ 已考 ➔ 待加強</span>
            {totalMarked > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={styles.resetBtn}>
                換邊清空
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        className={`${styles.pillBtn} ${weakItems.length > 0 ? styles.pillBtnHasWeak : ''}`}
        aria-expanded={drawerOpen}>
        {totalMarked === 0 ? (
          <span>考官標記 · 點題目即可記</span>
        ) : (
          <>
            <span className={styles.pillStatDone}>已考 {doneCount}</span>
            <span className={styles.pillDivider}>·</span>
            <span
              className={
                weakItems.length > 0 ? styles.pillStatWeak : styles.pillStatMuted
              }>
              待加強 {weakItems.length}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
