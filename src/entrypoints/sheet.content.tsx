import '@/assets/tailwind.css'

//
import { render } from 'solid-js/web'
import SheetApp from '@/components/sheet-app'

/**
 * Content script that injects the Sheet overlay into the page
 * This replaces the sidepanel API with a more flexible overlay
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main(_ctx) {
    const ui = await createShadowRootUi(_ctx, {
      name: 'sora-better-sheet',
      position: 'inline',
      anchor: 'body',
      onMount(bodyContainer) {
        const unmount = () => render(() => <SheetApp />, bodyContainer)
        return unmount
      },
      onRemove(unmount) {
        unmount?.()
      },
    })

    ui.mount()
  },
})
