import { render } from 'solid-js/web'
import '@/assets/tailwind.css'
import SheetApp from '@/components/sheet-app'

/**
 * Content script that injects the Sheet overlay into the page
 * This replaces the sidepanel API with a more flexible overlay
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main(_ctx) {
    // Wait for body to be available
    if (!document.body) {
      await new Promise((resolve) => {
        if (document.body) {
          resolve(undefined)
        } else {
          const observer = new MutationObserver(() => {
            if (document.body) {
              observer.disconnect()
              resolve(undefined)
            }
          })
          observer.observe(document.documentElement, { childList: true })
        }
      })
    }

    // Create a container for the sheet
    const container = document.createElement('div')
    container.id = 'sora-better-sheet-container'
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '999999'
    document.body.appendChild(container)

    // Render the SheetApp component
    const dispose = render(() => <SheetApp />, container)

    // Clean up on unload
    _ctx.onInvalidate(() => {
      dispose()
      container.remove()
    })
  },
})
