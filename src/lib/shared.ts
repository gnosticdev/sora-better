/**
 * Video flag configuration type
 * Each flag has a label, description, and boolean value
 */
export type VideoFlags = {
  autoplay: {
    label: string
    description: string
    value: boolean
  }
  loop: {
    label: string
    description: string
    value: boolean
  }
  playsinline: {
    label: string
    description: string
    value: boolean
  }
  addControls: {
    label: string
    description: string
    value: boolean
  }
  enableDownload: {
    label: string
    description: string
    value: boolean
  }
  mute: {
    label: string
    description: string
    value: boolean
  }
}