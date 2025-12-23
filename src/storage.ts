import type { VideoFlags } from '@/lib/shared'

/**
 * Default flag values with labels and descriptions
 */
export const defaultFlags: VideoFlags = {
  autoplay: {
    label: 'Disable Autoplay',
    description: 'Prevent videos from auto-playing',
    value: true,
  },
  loop: {
    label: 'Disable Loop',
    description: 'Prevent videos from looping',
    value: true,
  },
  playsinline: {
    label: 'Disable Plays Inline',
    description: 'Allow videos to play in fullscreen mode',
    value: true,
  },
  addControls: {
    label: 'Add Controls',
    description: 'Add video controls (play, pause, volume, etc.)',
    value: true,
  },
  enableDownload: {
    label: 'Enable Download',
    description: 'Allow downloading videos',
    value: true,
  },
  mute: {
    label: 'Mute',
    description: 'Mute videos',
    value: true,
  },
}

/**
 * Get flags from storage, merging with defaults
 */
export async function getFlags(): Promise<VideoFlags> {
  const stored = await browser.storage.sync.get('flags') as { flags?: VideoFlags }
  if (!stored.flags) {
    return defaultFlags
  }

  // Merge stored flags with defaults to ensure all flags exist
  const merged: VideoFlags = { ...defaultFlags }
  for (const key in stored.flags) {
    if (key in merged) {
      merged[key as keyof VideoFlags] = {
        ...defaultFlags[key as keyof VideoFlags],
        ...stored.flags[key as keyof VideoFlags],
      }
    }
  }
  return merged
}

/**
 * Save flags to storage
 */
export async function setFlags(flags: VideoFlags) {
  await browser.storage.local.set({ flags })
}