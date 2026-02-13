import '@/assets/tailwind.css'

import { render } from 'solid-js/web'
import SheetApp from '@/components/sheet-app'

// TODO: not working yet. i think bc when trying sora is in a dialog already.
/**
 * Content script that injects the Sheet overlay into the page.
 * Replaces the sidepanel API with a more flexible overlay.
 * Listens for OPEN_SHEET/CLOSE_SHEET messages (handled by SheetApp).
 */
// export default defineContentScript({
//   matches: ['<all_urls>'],
//   runAt: 'document_idle',
//   /** Required for createShadowRootUi so Tailwind/styles inject into the shadow root */
//   cssInjectionMode: 'ui',

//   async main(ctx) {
//     const ui = await createShadowRootUi(ctx, {
//       name: 'sora-better-sheet',
//       position: 'modal',
//       zIndex: 2147483647,
//       anchor: 'body',
//       onMount(bodyContainer) {
//         const dispose = render(() => <SheetApp anchor={bodyContainer} />, bodyContainer)
//         return dispose
//       },
//       onRemove(dispose) {
//         dispose?.()
//       },
//     })

//     ui.mount()
//   },
// })
