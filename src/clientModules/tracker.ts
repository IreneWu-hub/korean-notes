import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import type {ClientModule} from '@docusaurus/types';

// Google Apps Script 接收端網址
const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxSM-klX3s_lda8qYtIW-Ld5eJ1-q_QTkk8V03BA4WwZzAsLGROiM_HE1hGe7uEJBZ3uQ/exec';

function getDeviceInfo(): string {
  if (typeof navigator === 'undefined') return '未知裝置';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS 裝置';
  if (/Android/i.test(ua)) return 'Android 手機';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac 電腦';
  if (/Windows/i.test(ua)) return 'Windows 電腦';
  if (/Linux/i.test(ua)) return 'Linux 電腦';
  return '其他裝置';
}

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem('korean_notes_visitor_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('korean_notes_visitor_id', id);
    }
    return id;
  } catch {
    return 'anon_' + Math.random().toString(36).substring(2, 6);
  }
}

function checkAdminHash() {
  if (!ExecutionEnvironment.canUseDOM) return;
  try {
    // 啟用管理員
    if (window.location.hash === '#admin') {
      localStorage.setItem('korean_notes_role', 'admin');
      alert('👑 已成功設定為管理員！此裝置今後的瀏覽都不會記錄進後台。');
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
      return;
    }
    // 取消管理員
    if (window.location.hash === '#admin-off') {
      localStorage.removeItem('korean_notes_role');
      alert('已取消管理員模式，恢復訪客追蹤。');
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
      return;
    }
  } catch {}
}

function trackCurrentPage(pathname: string) {
  if (!ExecutionEnvironment.canUseDOM) return;

  checkAdminHash();

  try {
    // 若為管理員則不記錄
    if (localStorage.getItem('korean_notes_role') === 'admin') {
      return;
    }

    const now = Date.now();
    const cleanPath = pathname || window.location.pathname;
    const lastTrackKey = 'last_track_' + cleanPath;
    const lastTrackTime = sessionStorage.getItem(lastTrackKey);

    // 45 秒內同頁面防重複記錄
    if (lastTrackTime && now - parseInt(lastTrackTime, 10) < 45000) {
      return;
    }
    sessionStorage.setItem(lastTrackKey, now.toString());

    const visitorId = getOrCreateVisitorId();
    const device = getDeviceInfo();

    // 稍微延遲讓 Docusaurus 更新頁面 document.title
    setTimeout(() => {
      const pageTitle = document.title || cleanPath;
      const query = new URLSearchParams({
        page: pageTitle,
        device: device,
        visitorId: visitorId,
      });

      fetch(`${GAS_URL}?${query.toString()}`, {
        mode: 'no-cors',
        cache: 'no-store',
      }).catch(() => {});
    }, 500);
  } catch {}
}

const clientModule: ClientModule = {
  onRouteDidUpdate({location, previousLocation}) {
    if (location.pathname !== previousLocation?.pathname) {
      trackCurrentPage(location.pathname);
    }
  },
};

export default clientModule;

