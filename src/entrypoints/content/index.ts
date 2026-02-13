import { defaultFlags } from '@/lib/flag-metadata'
import type { FixVideosMessage, VideoDetails } from '@/lib/messages'
import type { VideoFlags } from '@/lib/shared'

// Re-export for convenience
export type { FixVideosMessage, VideoDetails }

/**
 * Get flags from storage via message passing to avoid storage context issues
 * Falls back to default flags if message fails
 */
async function getFlags(): Promise<VideoFlags> {
	try {
		const response = await browser.runtime.sendMessage({
			type: 'GET_FLAGS',
		} satisfies FixVideosMessage)
		if (response && typeof response === 'object' && 'flags' in response) {
			return (response as { flags: VideoFlags }).flags
		}
	} catch (error) {
		console.warn('Failed to get flags from background:', error)
	}
	// Fallback to default flags
	return defaultFlags
}

/**
 * Apply video fixes based on flags from storage
 * Cycles through each flag and applies the corresponding fix
 */
async function fixVideos() {
	const vids = Array.from(document.querySelectorAll('video'))
	const flags = await getFlags()

	for (const v of vids) {
		try {
			v.pause()

			// Apply each flag conditionally
			if (flags.addControls.value) {
				v.controls = true
				v.setAttribute('controls', '')
			} else {
				v.controls = false
				v.removeAttribute('controls')
			}

			if (flags.autoplay.value) {
				// Disable autoplay
				v.autoplay = false
				v.removeAttribute('autoplay')
			} else {
				// Allow autoplay (restore if needed)
				v.autoplay = true
				v.setAttribute('autoplay', '')
			}

			if (flags.loop.value) {
				// Disable loop
				v.loop = false
				v.removeAttribute('loop')
			} else {
				// Allow loop
				v.loop = true
				v.setAttribute('loop', '')
			}

			if (flags.playsinline.value) {
				// Disable playsinline (allow fullscreen)
				v.removeAttribute('playsinline')
				v.removeAttribute('webkit-playsinline')
			} else {
				// Enable playsinline
				v.setAttribute('playsinline', '')
				v.setAttribute('webkit-playsinline', '')
			}

			if (flags.enableDownload.value) {
				// Enable download by removing nodownload from controlsList
				const cl = (v as HTMLVideoElement & { controlsList?: DOMTokenList })
					.controlsList
				cl?.remove?.('nodownload')
			} else {
				// Disable download by adding nodownload to controlsList
				const cl = (v as HTMLVideoElement & { controlsList?: DOMTokenList })
					.controlsList
				cl?.add?.('nodownload')
			}
		} catch {
			// ignore per-element failures
		}
	}

	return { count: vids.length }
}

/**
 * Get details of all videos on the page
 * Collects source URL, dimensions, duration, and other metadata
 */
function getVideoDetails(): { videos: VideoDetails[] } {
	const vids = Array.from(document.querySelectorAll('video'))
	const videos: VideoDetails[] = []

	vids.forEach((v, index) => {
		try {
			const video = v as HTMLVideoElement
			// Try multiple methods to get the video source
			let src = video.src || video.currentSrc || ''

			// If no direct src, check for <source> elements
			if (!src) {
				const source = video.querySelector('source')
				if (source) {
					src = source.src || ''
				}
			}

			// Skip if no valid source
			if (!src) return

			videos.push({
				src,
				poster: video.poster || undefined,
				duration: video.duration || 0,
				width: video.videoWidth || video.clientWidth || 0,
				height: video.videoHeight || video.clientHeight || 0,
				currentTime: video.currentTime || 0,
				index,
			})
		} catch {
			// ignore per-element failures
		}
	})

	return { videos }
}

/**
 * Highlight overlay elements - stores references to all highlight overlays
 */
const highlightOverlays: Map<number, HTMLDivElement> = new Map()

/**
 * Highlight multiple videos on the page with visual overlays
 * Creates borders/outlines around the video elements
 */
function highlightVideos(indices: number[]) {
	// Clear any existing highlights
	clearHighlights()

	const vids = Array.from(document.querySelectorAll('video'))
	const validIndices = indices.filter(
		(index) => index >= 0 && index < vids.length,
	)

	if (validIndices.length === 0) return

	const scrollX = window.scrollX || window.pageXOffset
	const scrollY = window.scrollY || window.pageYOffset

	// Create highlight overlays for each video
	validIndices.forEach((index) => {
		const video = vids[index] as HTMLVideoElement
		const rect = video.getBoundingClientRect()

		// Create highlight overlay
		const overlay = document.createElement('div')
		overlay.style.position = 'absolute'
		overlay.style.left = `${rect.left + scrollX}px`
		overlay.style.top = `${rect.top + scrollY}px`
		overlay.style.width = `${rect.width}px`
		overlay.style.height = `${rect.height}px`
		overlay.style.border = '4px solid #3b82f6' // Blue border
		overlay.style.borderRadius = '8px'
		overlay.style.boxShadow =
			'0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)'
		overlay.style.pointerEvents = 'none'
		overlay.style.zIndex = '999999'
		overlay.style.transition = 'all 0.2s ease'
		overlay.setAttribute('data-sora-better-highlight', 'true')
		overlay.setAttribute('data-video-index', index.toString())

		document.body.appendChild(overlay)
		highlightOverlays.set(index, overlay)

		// Update highlight position on scroll/resize
		const updatePosition = () => {
			const overlay = highlightOverlays.get(index)
			if (!overlay) return
			const newRect = video.getBoundingClientRect()
			const newScrollX = window.scrollX || window.pageXOffset
			const newScrollY = window.scrollY || window.pageYOffset
			overlay.style.left = `${newRect.left + newScrollX}px`
			overlay.style.top = `${newRect.top + newScrollY}px`
			overlay.style.width = `${newRect.width}px`
			overlay.style.height = `${newRect.height}px`
		}

		window.addEventListener('scroll', updatePosition, { passive: true })
		window.addEventListener('resize', updatePosition, { passive: true })

		// Store cleanup function
		;(overlay as any).__cleanup = () => {
			window.removeEventListener('scroll', updatePosition)
			window.removeEventListener('resize', updatePosition)
		}
	})

	// Scroll first selected video into view if needed
	if (validIndices.length > 0) {
		const firstVideo = vids[validIndices[0]] as HTMLVideoElement
		firstVideo.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}
}

/**
 * Get the video download URL from the <a> tag surrounding the video
 * This is needed for getting the public Sora video URL from profile/drafts pages
 */
function getVideoUrlFromAnchor(videoIndex: number): { url: string | null } {
	const vids = Array.from(document.querySelectorAll('video'))
	if (videoIndex < 0 || videoIndex >= vids.length) {
		return { url: null }
	}

	const video = vids[videoIndex]

	// Look for the closest <a> tag ancestor
	let element: HTMLElement | null = video
	while (element) {
		if (element.tagName.toLowerCase() === 'a') {
			const anchor = element as HTMLAnchorElement
			// Check if the href matches the required pattern /p/s_
			if (anchor.pathname && anchor.pathname.startsWith('/p/s_')) {
				return { url: `https://sora.chatgpt.com${anchor.pathname}` }
			}
			// If it's an <a> tag but doesn't match, keep looking up
		}
		element = element.parentElement
	}

	// If no valid anchor found by traversing up, look for any <a> that contains this video
	const allAnchors = document.querySelectorAll('a')
	for (const anchor of allAnchors) {
		if (anchor.contains(video)) {
			if (anchor.pathname && anchor.pathname.startsWith('/p/s_')) {
				return { url: `https://sora.chatgpt.com${anchor.pathname}` }
			}
		}
	}

	return { url: null }
}

/**
 * Clear all video highlights from the page
 */
function clearHighlights() {
	// Clean up all highlight overlays
	highlightOverlays.forEach((overlay) => {
		// Clean up event listeners
		if ((overlay as any).__cleanup) {
			;(overlay as any).__cleanup()
		}
		overlay.remove()
	})
	highlightOverlays.clear()

	// Also remove any orphaned highlights
	document.querySelectorAll('[data-sora-better-highlight]').forEach((el) => {
		el.remove()
	})
}

export default defineContentScript({
	matches: ['<all_urls>'],
	runAt: 'document_idle',
	async main(_ctx) {
		// Run automatically when the content script loads
		await fixVideos()
		// Re-run when popup requests it
		browser.runtime.onMessage.addListener(
			async (msg: FixVideosMessage, _sender, sendResponse) => {
				if (msg?.type === 'FIX_VIDEOS') {
					sendResponse(await fixVideos())
				} else if (msg?.type === 'GET_VIDEOS') {
					sendResponse(getVideoDetails())
				} else if (msg?.type === 'HIGHLIGHT_VIDEOS') {
					highlightVideos(msg.indices)
					sendResponse({ success: true })
				} else if (msg?.type === 'CLEAR_HIGHLIGHTS') {
					clearHighlights()
					sendResponse({ success: true })
				} else if (msg?.type === 'GET_VIDEO_URL_FROM_ANCHOR') {
					sendResponse(getVideoUrlFromAnchor(msg.videoIndex))
				}
				// OPEN_SHEET and CLOSE_SHEET are handled by content-sheet.tsx
			},
		)
	},
})
