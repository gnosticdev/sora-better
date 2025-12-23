import { getFlags } from '@/storage';

export type FixVideosMessage = { type: 'FIX_VIDEOS' } | { type: 'GET_VIDEOS' };

/**
 * Video details type for popup display
 */
export type VideoDetails = {
  src: string;
  poster?: string;
  duration: number;
  width: number;
  height: number;
  currentTime: number;
  index: number;
};

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

/**
 * Get details of all videos on the page
 * Collects source URL, dimensions, duration, and other metadata
 */
function getVideoDetails(): { videos: VideoDetails[] } {
  const vids = Array.from(document.querySelectorAll('video'));
  const videos: VideoDetails[] = [];

  vids.forEach((v, index) => {
    try {
      const video = v as HTMLVideoElement;
      // Try multiple methods to get the video source
      let src = video.src || video.currentSrc || '';

      // If no direct src, check for <source> elements
      if (!src) {
        const source = video.querySelector('source');
        if (source) {
          src = source.src || '';
        }
      }

      // Skip if no valid source
      if (!src) return;

      videos.push({
        src,
        poster: video.poster || undefined,
        duration: video.duration || 0,
        width: video.videoWidth || video.clientWidth || 0,
        height: video.videoHeight || video.clientHeight || 0,
        currentTime: video.currentTime || 0,
        index,
      });
    } catch {
      // ignore per-element failures
    }
  });

  return { videos };
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
      } else if (msg?.type === 'GET_VIDEOS') {
        sendResponse(getVideoDetails());
      }
    });
  },
});