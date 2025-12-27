import type { Component } from 'solid-js'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxControl } from '@/components/ui/checkbox'
import type { VideoDetails } from '@/entrypoints/content'
import { cn } from '@/lib/utils'

type VideoItemProps = {
  video: VideoDetails
  onDownload: (video: VideoDetails) => void
  onRemoveWatermark: () => void
  isRemovingWatermark?: boolean
  isSelected: boolean
  onToggleSelect: () => void
}
/**
 * Format duration in seconds to readable time string
 */
const formatDuration = (seconds: number): string => {
  if (!seconds || Number.isNaN(seconds)) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
/**
 * Video item component - displays video details with download button and selection checkbox
 */
export const VideoItem: Component<VideoItemProps> = (props) => {
  /**
   * Format file size from URL (if available)
   */
  const getVideoInfo = () => {
    const dimensions =
      props.video.width && props.video.height
        ? `${props.video.width}×${props.video.height}`
        : 'Unknown size'
    const duration = formatDuration(props.video.duration)
    return `${dimensions} • ${duration}`
  }

  /**
   * Get a short preview of the video URL
   */
  const getUrlPreview = () => {
    try {
      const url = new URL(props.video.src)
      return url.pathname.split('/').pop() || url.hostname
    } catch {
      return props.video.src.substring(0, 50) + (props.video.src.length > 50 ? '...' : '')
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: need
    // biome-ignore lint/a11y/useSemanticElements: need
    <div
      role='button'
      tabIndex={0}
      class={cn(
        'flex items-center justify-between gap-3 p-3 border rounded-lg transition-colors cursor-pointer',
        props.isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent/50',
      )}
      onClick={(e) => {
        // Don't toggle if clicking the download button
        if ((e.target as HTMLElement).closest('button')) return
        props.onToggleSelect()
      }}
    >
      <div class='flex items-center gap-2 flex-1 min-w-0'>
        <Checkbox
          checked={props.isSelected}
          onChange={props.onToggleSelect}
        >
          <CheckboxControl />
        </Checkbox>
        <div class='flex-1 min-w-0'>
          <p
            class='text-sm font-medium truncate'
            title={props.video.src}
          >
            Video {props.video.index + 1}
          </p>
          <p
            class='text-xs text-muted-foreground truncate'
            title={props.video.src}
          >
            {getUrlPreview()}
          </p>
          <p class='text-xs text-muted-foreground mt-1'>{getVideoInfo()}</p>
        </div>
      </div>
      <div class='flex gap-2'>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            props.onRemoveWatermark()
          }}
          size='sm'
          variant='outline'
          disabled={props.isRemovingWatermark}
          class='text-xs'
        >
          {props.isRemovingWatermark ? 'Removing...' : 'Remove Watermark'}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            props.onDownload(props.video)
          }}
          size='sm'
          variant='outline'
        >
          Download
        </Button>
      </div>
    </div>
  )
}
