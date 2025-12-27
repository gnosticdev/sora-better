/**
 * Background script for Sora Better extension
 * Handles side panel activation on Sora pages
 */
export default defineBackground(() => {
  console.log('Sora Better background script loaded', { id: browser.runtime.id });

  /**
   * Enable side panel on Sora pages
   */
  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (!tab.url) return;

    try {
      const url = new URL(tab.url);

      // Enable side panel on Sora pages
      if (url.origin === 'https://sora.chatgpt.com' || url.hostname.includes('sora')) {
        browser.sidePanel
          .setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true,
          })
          .catch((error) => {
            console.error('Failed to enable side panel:', error);
          });
      } else {
        // Disable side panel on other pages
        browser.sidePanel
          .setOptions({
            tabId,
            enabled: false,
          })
          .catch((error) => {
            console.error('Failed to disable side panel:', error);
          });
      }
    } catch (error) {
      // Invalid URL, ignore
      console.debug('Invalid URL:', tab.url);
    }
  });

  /**
   * Handle extension icon click to open side panel
   */
  browser.action.onClicked.addListener((tab) => {
    if (!tab.id) return;

    browser.sidePanel
      .open({ tabId: tab.id })
      .catch((error) => {
        console.error('Failed to open side panel:', error);
      });
  });
});
