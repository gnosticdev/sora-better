import { storage } from '#imports'
import {
	defaultFlags,
	defaultFlagValues,
	flagMetadata,
} from '@/lib/flag-metadata'
import type { VideoFlags } from '@/lib/shared'

// Re-export defaultFlags for convenience
export { defaultFlags }

/**
 * Individual storage items for each flag value
 * Using storage.defineItem for proper WXT storage management
 */
export const flagAutoplay = storage.defineItem<boolean>('local:flag:autoplay', {
	fallback: defaultFlagValues.autoplay,
})

export const flagLoop = storage.defineItem<boolean>('local:flag:loop', {
	fallback: defaultFlagValues.loop,
})

export const flagPlaysinline = storage.defineItem<boolean>(
	'local:flag:playsinline',
	{
		fallback: defaultFlagValues.playsinline,
	},
)

export const flagAddControls = storage.defineItem<boolean>(
	'local:flag:addControls',
	{
		fallback: defaultFlagValues.addControls,
	},
)

export const flagEnableDownload = storage.defineItem<boolean>(
	'local:flag:enableDownload',
	{
		fallback: defaultFlagValues.enableDownload,
	},
)

export const flagMute = storage.defineItem<boolean>('local:flag:mute', {
	fallback: defaultFlagValues.mute,
})

/**
 * Map of flag keys to their storage items
 */
const flagStorageItems: Record<
	keyof VideoFlags,
	ReturnType<typeof storage.defineItem<boolean>>
> = {
	autoplay: flagAutoplay,
	loop: flagLoop,
	playsinline: flagPlaysinline,
	addControls: flagAddControls,
	enableDownload: flagEnableDownload,
	mute: flagMute,
}

/**
 * Get all flags from storage, combining stored values with metadata
 */
export async function getFlags(): Promise<VideoFlags> {
	const [autoplay, loop, playsinline, addControls, enableDownload, mute] =
		await Promise.all([
			flagAutoplay.getValue(),
			flagLoop.getValue(),
			flagPlaysinline.getValue(),
			flagAddControls.getValue(),
			flagEnableDownload.getValue(),
			flagMute.getValue(),
		])

	return {
		autoplay: {
			...flagMetadata.autoplay,
			value: autoplay ?? defaultFlagValues.autoplay,
		},
		loop: {
			...flagMetadata.loop,
			value: loop ?? defaultFlagValues.loop,
		},
		playsinline: {
			...flagMetadata.playsinline,
			value: playsinline ?? defaultFlagValues.playsinline,
		},
		addControls: {
			...flagMetadata.addControls,
			value: addControls ?? defaultFlagValues.addControls,
		},
		enableDownload: {
			...flagMetadata.enableDownload,
			value: enableDownload ?? defaultFlagValues.enableDownload,
		},
		mute: {
			...flagMetadata.mute,
			value: mute ?? defaultFlagValues.mute,
		},
	}
}

/**
 * Save flags to storage (sets individual storage items)
 */
export async function setFlags(flags: VideoFlags) {
	await Promise.all([
		flagAutoplay.setValue(flags.autoplay.value),
		flagLoop.setValue(flags.loop.value),
		flagPlaysinline.setValue(flags.playsinline.value),
		flagAddControls.setValue(flags.addControls.value),
		flagEnableDownload.setValue(flags.enableDownload.value),
		flagMute.setValue(flags.mute.value),
	])
}

/**
 * Toggle a single flag value
 */
export async function toggleFlag(key: keyof VideoFlags) {
	const storageItem = flagStorageItems[key]
	const currentValue = await storageItem.getValue()
	await storageItem.setValue(!(currentValue ?? defaultFlagValues[key]))
}

/**
 * API Key storage for watermark removal service
 */
export const apiKey = storage.defineItem<string>('local:apiKey', {
	fallback: '',
})

/**
 * Get the stored API key
 */
export async function getApiKey(): Promise<string> {
	return (await apiKey.getValue()) ?? ''
}

/**
 * Set the API key
 */
export async function setApiKey(key: string): Promise<void> {
	await apiKey.setValue(key)
}
