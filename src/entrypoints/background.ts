import type { FixVideosMessage } from '@/lib/messages'
import { getFlags } from '@/storage'

/**
 * Background script for Sora Better extension
 * Handles message passing for storage access and opening the sheet overlay
 */
export default defineBackground(() => {
	console.log('Sora Better background script loaded', {
		id: browser.runtime.id,
	})

	/**
	 * Handle messages from content scripts and other extension contexts
	 */
	browser.runtime.onMessage.addListener(
		async (message: FixVideosMessage, _sender, sendResponse) => {
			if (message?.type === 'GET_FLAGS') {
				try {
					const flags = await getFlags()
					sendResponse({ flags })
				} catch (error) {
					console.error('Failed to get flags:', error)
					sendResponse({ error: 'Failed to get flags' })
				}
				return true // Indicates we will send a response asynchronously
			}
		},
	)

	/**
	 * Handle extension icon click to open sheet overlay
	 */
	browser.action.onClicked.addListener(async (tab) => {
		if (!tab.id) return

		try {
			// Send message to content script to open the sheet
			await browser.tabs.sendMessage(tab.id, { type: 'OPEN_SHEET' } satisfies FixVideosMessage)
		} catch (error) {
			console.error('Failed to open sheet:', error)
			// If content script isn't loaded, try to inject it
			// This is a fallback - normally the content script should already be loaded
		}
	})
})
