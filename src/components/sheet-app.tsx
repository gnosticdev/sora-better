import { createSignal, onMount, onCleanup } from 'solid-js'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import App from '@/entrypoints/popup/App'
import type { FixVideosMessage } from '@/lib/messages'

/**
 * SheetApp component that wraps the App in a Sheet overlay
 * Listens for messages to open/close the sheet
 */
export default function SheetApp() {
  const [isOpen, setIsOpen] = createSignal(false)

  /**
   * Listen for messages to open/close the sheet
   */
  onMount(() => {
    const messageListener = (
      msg: FixVideosMessage,
      _sender: browser.runtime.MessageSender,
      sendResponse: browser.runtime.SendResponse,
    ) => {
      if (msg?.type === 'OPEN_SHEET') {
        setIsOpen(true)
        sendResponse({ success: true })
        return true // Indicates we will send a response asynchronously
      } else if (msg?.type === 'CLOSE_SHEET') {
        setIsOpen(false)
        sendResponse({ success: true })
        return true
      }
    }

    browser.runtime.onMessage.addListener(messageListener)

    // Clean up listener on unmount
    onCleanup(() => {
      browser.runtime.onMessage.removeListener(messageListener)
    })
  })

  return (
    <Sheet open={isOpen()} onOpenChange={setIsOpen}>
      <SheetContent position="right" class="w-full sm:max-w-lg">
        <App />
      </SheetContent>
    </Sheet>
  )
}
