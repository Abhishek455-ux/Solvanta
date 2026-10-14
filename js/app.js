/**
 * ABHIVANTA - Core Application Bootstrapper
 * Global error monitoring, offline fallback warnings, and environment validation.
 */

window.AbhivantaApp = (() => {
  const APP_NAME = 'ABHIVANTA';
  const VERSION = '1.0.0';

  function init() {
    // Verify essential browser support
    if (!window.localStorage) {
      console.warn('Abhivanta: LocalStorage is not supported on this browser.');
    }

    // Safe error notification boundary for unhandled JS errors
    window.addEventListener('error', (e) => {
      // Ignore CDN script loading cross-origin issues
      if (e.message && e.message.includes('Script error')) return;
      console.error('Abhivanta runtime exception:', e);
    });

    // Check online status for CDNs
    window.addEventListener('offline', () => {
      if (window.AbhivantaUI) {
        AbhivantaUI.toast('Browser is offline. Cached assets and local storage are active.', 'warning', 'Offline Mode');
      }
    });

    window.addEventListener('online', () => {
      if (window.AbhivantaUI) {
        AbhivantaUI.toast('Internet connection restored. CDN assets active.', 'success', 'Online');
      }
    });
  }

  return {
    APP_NAME,
    VERSION,
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  AbhivantaApp.init();
});
