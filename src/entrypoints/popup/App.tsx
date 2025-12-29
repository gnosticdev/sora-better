import { createResource, createSignal, For, onMount, Show } from 'solid-js'
import { Flag } from '@/components/flag'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VideoItem } from '@/components/video-item'
import type { VideoFlags } from '@/lib/shared'
import {
  defaultFlags,
  getApiKey,
  getFlags,
  setApiKey,
  toggleFlag as toggleFlagStorage,
} from '@/storage'
import type { FixVideosMessage, VideoDetails } from '@/lib/messages'

export default function App() {
  const [flags, { refetch }] = createResource<VideoFlags>(getFlags, {
    deferStream: true,
    initialValue: defaultFlags,
    name: 'flags',
  })
  const [videos, setVideos] = createSignal<VideoDetails[]>([])
  const [loadingVideos, setLoadingVideos] = createSignal(false)
  const [selectedVideos, setSelectedVideos] = createSignal<Set<number>>(new Set())
  const [apiKey, setApiKeyState] = createSignal('')
  const [apiKeyInput, setApiKeyInput] = createSignal('')
  const [removingWatermark, setRemovingWatermark] = createSignal<number | null>(null)
  const [showApiKeySettings, setShowApiKeySettings] = createSignal(false)

  // Load API key on mount
  onMount(async () => {
    const key = await getApiKey()
    setApiKeyState(key)
    setApiKeyInput(key)
  })

  /**
   * Toggle a flag and refresh the flags resource
   */
  const toggleFlag = async (key: keyof VideoFlags) => {
    await toggleFlagStorage(key)
    // Refetch flags to get the updated values
    await refetch()
  }

  const run = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    const res = await browser.tabs
      .sendMessage(tab.id, { type: 'FIX_VIDEOS' } satisfies FixVideosMessage)
      .catch(() => null)

    const count = (res as { count?: number } | null)?.count ?? null
    const el = document.getElementById('status')
    if (el)
      el.textContent =
        count == null
          ? 'No response (no content script on this page).'
          : `Processed ${count} video(s).`
  }

  /**
   * Fetch video details from the current tab
   */
  const fetchVideos = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    setLoadingVideos(true)
    try {
      const res = await browser.tabs
        .sendMessage(tab.id, { type: 'GET_VIDEOS' } satisfies FixVideosMessage)
        .catch(() => null)

      if (res && 'videos' in res) {
        setVideos((res as { videos: VideoDetails[] }).videos)
        // Clear selection and highlights when refreshing (indices may have changed)
        setSelectedVideos(new Set<number>())
        await clearHighlights()
      } else {
        setVideos([])
        setSelectedVideos(new Set<number>())
        await clearHighlights()
      }
    } finally {
      setLoadingVideos(false)
    }
  }

  /**
   * Highlight videos on the page by their indices
   */
  const highlightVideos = async (indices: number[]) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    await browser.tabs
      .sendMessage(tab.id, { type: 'HIGHLIGHT_VIDEOS', indices } satisfies FixVideosMessage)
      .catch(() => null)
  }

  /**
   * Clear all video highlights
   */
  const clearHighlights = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    await browser.tabs
      .sendMessage(tab.id, { type: 'CLEAR_HIGHLIGHTS' } satisfies FixVideosMessage)
      .catch(() => null)
  }

  /**
   * Toggle video selection and highlight all selected videos
   */
  const toggleVideoSelection = async (video: VideoDetails) => {
    const selected = new Set(selectedVideos())
    if (selected.has(video.index)) {
      selected.delete(video.index)
    } else {
      selected.add(video.index)
    }
    setSelectedVideos(selected)

    // Update highlights to show all selected videos
    if (selected.size > 0) {
      await highlightVideos(Array.from(selected))
    } else {
      await clearHighlights()
    }
  }

  /**
   * Download a video by its source URL
   */
  const downloadVideo = async (video: VideoDetails) => {
    try {
      // Fetch the video blob
      const response = await fetch(video.src)
      const blob = await response.blob()

      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extract filename from URL or use a default
      const urlPath = new URL(video.src).pathname
      const filename = urlPath.split('/').pop() || `video-${video.index}.mp4`
      a.download = filename

      // Trigger download
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download video:', error)
      // Fallback: open in new tab
      browser.tabs.create({ url: video.src })
    }
  }

  /**
   * Download all selected videos
   */
  const downloadSelectedVideos = async () => {
    const selected = selectedVideos()
    if (selected.size === 0) return

    const videosToDownload = videos().filter((v) => selected.has(v.index))

    // Download videos sequentially to avoid browser blocking multiple downloads
    for (const video of videosToDownload) {
      await downloadVideo(video)
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Clear selection after download
    setSelectedVideos(new Set<number>())
    await clearHighlights()
  }

  /**
   * Save API key to storage
   */
  const saveApiKey = async () => {
    await setApiKey(apiKeyInput())
    setApiKeyState(apiKeyInput())
    setShowApiKeySettings(false)
  }

  /**
   * Remove watermark from a video using the API
   */
  const removeWatermark = async (video: VideoDetails) => {
    const key = apiKey()
    if (!key) {
      alert('Please set your API key in settings first.')
      setShowApiKeySettings(true)
      return
    }

    // Get the current tab URL (Sora page URL)
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) {
      alert('Could not get current page URL.')
      return
    }

    setRemovingWatermark(video.index)
    try {
      const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'sora-watermark-remover',
          callBackUrl: '', // Empty callback URL as per your example
          input: {
            video_url: tab.url,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      import.meta.env.DEV && console.log('Watermark removal job created:', result)

      // Show success message
      alert(`Watermark removal job created successfully! Job ID: ${result.job_id || 'N/A'}`)
    } catch (error) {
      console.error('Failed to remove watermark:', error)
      alert(
        `Failed to remove watermark: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setRemovingWatermark(null)
    }
  }

  // Automatically fetch videos when popup opens
  onMount(() => {
    fetchVideos()
  })

  return (
    <main class='font-sans container w-full h-screen overflow-hidden'>
      <ScrollArea
        class='h-full w-full'
        style={{
          '--scrollbar-width': '6px',
        }}
      >
        <section class='p-8 flex flex-col'>
          <div class='flex items-center justify-between mb-2'>
            <h1 class='text-lg font-bold'>
              {import.meta.env.DEV ? 'Sora Better (Dev)' : 'Sora Better'}
            </h1>
            <Button
              onClick={() => setShowApiKeySettings(!showApiKeySettings())}
              size='sm'
              variant='outline'
            >
              {showApiKeySettings() ? 'Hide' : 'API Key'}
            </Button>
          </div>

          <Show when={showApiKeySettings()}>
            <div class='mb-4 p-3 border rounded-lg bg-accent/30'>
              <label
                for='api-key-input'
                class='text-sm font-medium mb-2 block'
              >
                Kie.ai API Key
              </label>
              <div class='flex gap-2'>
                <input
                  id='api-key-input'
                  type='password'
                  value={apiKeyInput()}
                  onInput={(e) => setApiKeyInput(e.currentTarget.value)}
                  placeholder='Enter your API key'
                  class='flex-1 px-3 py-2 text-sm border rounded-md bg-background'
                />
                <Button
                  onClick={saveApiKey}
                  size='sm'
                  variant='default'
                >
                  Save
                </Button>
              </div>
              <p class='text-xs text-muted-foreground mt-2'>
                Your API key is stored locally and used for watermark removal.
              </p>
            </div>
          </Show>

          <div class='flex flex-col gap-3 mt-4'>
            <For each={Object.entries(flags())}>
              {(entry) => (
                <Flag
                  key={entry[0] as keyof VideoFlags}
                  flag={entry[1]}
                  toggle={() => toggleFlag(entry[0] as keyof VideoFlags)}
                />
              )}
            </For>
          </div>
          <Button
            onClick={run}
            class='w-full mt-4'
          >
            Fix videos on this tab
          </Button>
          <div
            id='status'
            class='mt-2 text-sm'
          />

          <div class='mt-6 border-t pt-4 flex flex-col'>
            <div class='flex items-center justify-between mb-3 shrink-0'>
              <h2 class='text-base font-semibold'>Videos on Page</h2>
              <Button
                onClick={fetchVideos}
                size='sm'
                variant='outline'
                disabled={loadingVideos()}
              >
                {loadingVideos() ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            <Show
              when={videos().length > 0}
              fallback={
                <p class='text-sm text-muted-foreground text-center py-4'>
                  No videos found. Click "Refresh" to scan the page.
                </p>
              }
            >
              <div class='flex flex-col gap-2'>
                <Show when={selectedVideos().size > 0}>
                  <div class='flex items-center justify-between mb-2 p-2 bg-accent/50 rounded-lg shrink-0'>
                    <span class='text-sm font-medium'>
                      {selectedVideos().size} video{selectedVideos().size !== 1 ? 's' : ''} selected
                    </span>
                    <div class='flex gap-2'>
                      <Button
                        onClick={async () => {
                          setSelectedVideos(new Set<number>())
                          await clearHighlights()
                        }}
                        size='sm'
                        variant='ghost'
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={downloadSelectedVideos}
                        size='sm'
                        variant='default'
                      >
                        Download Selected
                      </Button>
                    </div>
                  </div>
                </Show>
                <div class='flex flex-col gap-2 pr-2'>
                  <For each={videos()}>
                    {(video) => (
                      <VideoItem
                        video={video}
                        onDownload={downloadVideo}
                        onRemoveWatermark={() => removeWatermark(video)}
                        isRemovingWatermark={removingWatermark() === video.index}
                        isSelected={selectedVideos().has(video.index)}
                        onToggleSelect={() => toggleVideoSelection(video)}
                      />
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </section>
      </ScrollArea>
    </main>
  )
}
