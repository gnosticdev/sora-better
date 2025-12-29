/**
 * Message types for communication between extension contexts
 */

/**
 * Video details type for popup display
 */
export type VideoDetails = {
	src: string
	poster?: string
	duration: number
	width: number
	height: number
	currentTime: number
	index: number
}

/**
 * Messages that can be sent to content scripts
 */
export type FixVideosMessage =
	| { type: 'FIX_VIDEOS' }
	| { type: 'GET_VIDEOS' }
	| { type: 'HIGHLIGHT_VIDEOS'; indices: number[] }
	| { type: 'CLEAR_HIGHLIGHTS' }
	| { type: 'GET_FLAGS' }
	| { type: 'OPEN_SHEET' }
	| { type: 'CLOSE_SHEET' }