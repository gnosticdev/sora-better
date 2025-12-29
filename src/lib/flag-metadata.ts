import type { VideoFlags } from '@/lib/shared'

/**
 * Flag metadata (labels and descriptions) - these are static constants
 * Safe to import in any context (content scripts, popup, background, etc.)
 */
export const flagMetadata: Record<
	keyof VideoFlags,
	{ label: string; description: string }
> = {
	autoplay: {
		label: 'Disable Autoplay',
		description: 'Prevent videos from auto-playing',
	},
	loop: {
		label: 'Disable Loop',
		description: 'Prevent videos from looping',
	},
	playsinline: {
		label: 'Disable Plays Inline',
		description: 'Allow videos to play in fullscreen mode',
	},
	addControls: {
		label: 'Add Controls',
		description: 'Add video controls (play, pause, volume, etc.)',
	},
	enableDownload: {
		label: 'Enable Download',
		description: 'Allow downloading videos',
	},
	mute: {
		label: 'Mute',
		description: 'Mute videos',
	},
}

/**
 * Default flag values
 * Safe to import in any context
 */
export const defaultFlagValues: Record<keyof VideoFlags, boolean> = {
	autoplay: true,
	loop: true,
	playsinline: true,
	addControls: true,
	enableDownload: true,
	mute: true,
}

/**
 * Default flags object (for initial values in components)
 * Safe to import in any context
 */
export const defaultFlags: VideoFlags = {
	autoplay: {
		...flagMetadata.autoplay,
		value: defaultFlagValues.autoplay,
	},
	loop: {
		...flagMetadata.loop,
		value: defaultFlagValues.loop,
	},
	playsinline: {
		...flagMetadata.playsinline,
		value: defaultFlagValues.playsinline,
	},
	addControls: {
		...flagMetadata.addControls,
		value: defaultFlagValues.addControls,
	},
	enableDownload: {
		...flagMetadata.enableDownload,
		value: defaultFlagValues.enableDownload,
	},
	mute: {
		...flagMetadata.mute,
		value: defaultFlagValues.mute,
	},
}
