import { createSignal, onCleanup, onMount } from 'solid-js'
import { browser } from '#imports'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import App from '@/entrypoints/popup/App'
import type { FixVideosMessage } from '@/lib/messages'

type SheetAppProps = {
  anchor: HTMLElement
}
/**
 * SheetApp component that wraps the App in a Sheet overlay
 * Listens for messages to open/close the sheet
 */
export default function SheetApp(props: SheetAppProps) {
  const [isOpen, setIsOpen] = createSignal(false)

  /**
   * Listen for messages to open/close the sheet
   */
  onMount(() => {
    const messageListener = (
      msg: FixVideosMessage,
      _sender: Browser.runtime.MessageSender,
      // biome-ignore lint/suspicious/noExplicitAny: need
      sendResponse: (response: any) => void,
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
    <Sheet
      open={isOpen()}
      onOpenChange={setIsOpen}
    >
      <SheetContent
        position='right'
        class='w-full sm:max-w-lg'
        anchor={props.anchor}
      >
        <App />
      </SheetContent>
    </Sheet>
  )
}
