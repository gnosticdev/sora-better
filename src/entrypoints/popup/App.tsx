import { Button } from '@/components/ui/button';
import type { FixVideosMessage, VideoDetails } from '../content';
import { createSignal, For, Show, onMount } from 'solid-js';
import { getFlags, setFlags as setLocalFlags } from '@/storage';
import type { VideoFlags } from '@/lib/shared';
import { Switch, SwitchControl, SwitchThumb } from '@/components/ui/switch';

const [flags, setFlags] = createSignal<VideoFlags>(await getFlags());
const [videos, setVideos] = createSignal<VideoDetails[]>([]);
const [loadingVideos, setLoadingVideos] = createSignal(false);

export default function App() {
  const run = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const res = await browser.tabs.sendMessage(tab.id, { type: 'FIX_VIDEOS' } satisfies FixVideosMessage)
      .catch(() => null);

    const count = (res as any)?.count ?? null;
    const el = document.getElementById('status');
    if (el) el.textContent = count == null ? 'No response (no content script on this page).' : `Processed ${count} video(s).`;
  };

  /**
   * Fetch video details from the current tab
   */
  const fetchVideos = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    setLoadingVideos(true);
    try {
      const res = await browser.tabs.sendMessage(tab.id, { type: 'GET_VIDEOS' } satisfies FixVideosMessage)
        .catch(() => null);

      if (res && 'videos' in res) {
        setVideos((res as { videos: VideoDetails[] }).videos);
      } else {
        setVideos([]);
      }
    } finally {
      setLoadingVideos(false);
    }
  };

  /**
   * Download a video by its source URL
   */
  const downloadVideo = async (video: VideoDetails) => {
    try {
      // Fetch the video blob
      const response = await fetch(video.src);
      const blob = await response.blob();

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Extract filename from URL or use a default
      const urlPath = new URL(video.src).pathname;
      const filename = urlPath.split('/').pop() || `video-${video.index}.mp4`;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download video:', error);
      // Fallback: open in new tab
      browser.tabs.create({ url: video.src });
    }
  };

  // Automatically fetch videos when popup opens
  onMount(() => {
    fetchVideos();
  });

  return (
    <main class='font-sans container'>
      <section class='p-8'>
      <h1 class='text-lg font-bold text-center'>Sora Better</h1>
      <div class='flex flex-col gap-3 mt-4'>
        <For each={Object.entries(flags())}>
          {(entry) => <Flag key={entry[0] as keyof VideoFlags} flag={entry[1]} />}
        </For>
      </div>
      <Button onClick={run} class='w-full mt-4'>
        Fix videos on this tab
      </Button>
      <div id="status" class='mt-2 text-sm' />

      <div class='mt-6 border-t pt-4'>
        <div class='flex items-center justify-between mb-3'>
          <h2 class='text-base font-semibold'>Videos on Page</h2>
          <Button onClick={fetchVideos} size="sm" variant="outline" disabled={loadingVideos()}>
            {loadingVideos() ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        <Show when={videos().length > 0} fallback={
          <p class='text-sm text-muted-foreground text-center py-4'>
            No videos found. Click "Refresh" to scan the page.
          </p>
        }>
          <div class='flex flex-col gap-2 max-h-96 overflow-y-auto'>
            <For each={videos()}>
              {(video) => (
                <VideoItem video={video} onDownload={downloadVideo} />
              )}
            </For>
          </div>
        </Show>
      </div>
      </section>
    </main>
  );
}

/**
 * Flag component - renders a switch for each video flag
 */
function Flag({ key, flag }: { key: keyof VideoFlags, flag: VideoFlags[keyof VideoFlags] }) {
  const toggle = async () => {
    const current = flags();
    const next: VideoFlags = {
      ...current,
      [key]: {
        ...current[key],
        value: !current[key].value,
      },
    };
    setFlags(next);
    await setLocalFlags(next);
  };

  return (
    <div class='flex items-center gap-2'>
      <Switch checked={flag.value} onChange={toggle}>
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
      </Switch>
      <label for={key} class='text-sm cursor-pointer'>{flag.label}</label>
    </div>
  );
}

/**
 * Video item component - displays video details with download button
 */
function VideoItem({ video, onDownload }: { video: VideoDetails, onDownload: (video: VideoDetails) => void }) {
  /**
   * Format duration in seconds to readable time string
   */
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Format file size from URL (if available)
   */
  const getVideoInfo = () => {
    const dimensions = video.width && video.height ? `${video.width}×${video.height}` : 'Unknown size';
    const duration = formatDuration(video.duration);
    return `${dimensions} • ${duration}`;
  };

  /**
   * Get a short preview of the video URL
   */
  const getUrlPreview = () => {
    try {
      const url = new URL(video.src);
      return url.pathname.split('/').pop() || url.hostname;
    } catch {
      return video.src.substring(0, 50) + (video.src.length > 50 ? '...' : '');
    }
  };

  return (
    <div class='flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors'>
      <div class='flex-1 min-w-0'>
        <p class='text-sm font-medium truncate' title={video.src}>
          Video {video.index + 1}
        </p>
        <p class='text-xs text-muted-foreground truncate' title={video.src}>
          {getUrlPreview()}
        </p>
        <p class='text-xs text-muted-foreground mt-1'>
          {getVideoInfo()}
        </p>
      </div>
      <Button onClick={() => onDownload(video)} size="sm" variant="outline">
        Download
      </Button>
    </div>
  );
}