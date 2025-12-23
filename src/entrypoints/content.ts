import { getFlags } from '@/storage';

export type FixVideosMessage = { type: 'FIX_VIDEOS' };

/**
 * Apply video fixes based on flags from storage
 * Cycles through each flag and applies the corresponding fix
 */
async function fixVideos() {
  const vids = Array.from(document.querySelectorAll('video'));
  const flags = await getFlags();

  for (const v of vids) {
    try {
      v.pause();

      // Apply each flag conditionally
      if (flags.addControls.value) {
        v.controls = true;
        v.setAttribute('controls', '');
      } else {
        v.controls = false;
        v.removeAttribute('controls');
      }

      if (flags.autoplay.value) {
        // Disable autoplay
        v.autoplay = false;
        v.removeAttribute('autoplay');
      } else {
        // Allow autoplay (restore if needed)
        v.autoplay = true;
        v.setAttribute('autoplay', '');
      }

      if (flags.loop.value) {
        // Disable loop
        v.loop = false;
        v.removeAttribute('loop');
      } else {
        // Allow loop
        v.loop = true;
        v.setAttribute('loop', '');
      }

      if (flags.playsinline.value) {
        // Disable playsinline (allow fullscreen)
        v.removeAttribute('playsinline');
        v.removeAttribute('webkit-playsinline');
      } else {
        // Enable playsinline
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
      }

      if (flags.enableDownload.value) {
        // Enable download by removing nodownload from controlsList
        const cl = (v as HTMLVideoElement & { controlsList?: DOMTokenList }).controlsList;
        cl?.remove?.('nodownload');
      } else {
        // Disable download by adding nodownload to controlsList
        const cl = (v as HTMLVideoElement & { controlsList?: DOMTokenList }).controlsList;
        cl?.add?.('nodownload');
      }
    } catch {
      // ignore per-element failures
    }
  }

  return { count: vids.length };
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    // Run automatically when the content script loads
    fixVideos();

    // Re-run when popup requests it
    browser.runtime.onMessage.addListener((msg: FixVideosMessage, _sender, sendResponse) => {
      if (msg?.type === 'FIX_VIDEOS') {
        sendResponse(fixVideos());
      }
    });
  },
});