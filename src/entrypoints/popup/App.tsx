import { Button } from '@/components/ui/button';
import type { FixVideosMessage } from '../content';
import { createSignal, For } from 'solid-js';
import { getFlags, setFlags as setLocalFlags } from '@/storage';
import type { VideoFlags } from '@/lib/shared';
import { Switch, SwitchControl, SwitchThumb } from '@/components/ui/switch';

const [flags, setFlags] = createSignal<VideoFlags>(await getFlags());

export default function App() {

  const run = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const res = await browser.tabs.sendMessage(tab.id, { type: 'FIX_VIDEOS' } satisfies FixVideosMessage)
      .catch(() => null);

    const count = (res as any)?.count ?? null;
    const el = document.getElementById('status');
    if (el) el.textContent = count == null ? 'No response (no content script on this page).' : `Processed ${count} video(s).`;
  };

  return (
    <main class='font-sans container'>
      <section class='p-8'>
      <h1 class='text-lg font-bold text-center'>Sora Better</h1>
      <div class='flex flex-col gap-3 mt-4'>
        <For each={Object.entries(flags())}>
          {(entry) => <Flag key={entry[0] as keyof VideoFlags} flag={entry[1]} />}
        </For>
      </div>
      <Button onClick={run} class='w-full mt-4'>
        Fix videos on this tab
      </Button>
      <div id="status" class='mt-2 text-sm' />
      </section>
    </main>
  );
}

/**
 * Flag component - renders a switch for each video flag
 */
function Flag({ key, flag }: { key: keyof VideoFlags, flag: VideoFlags[keyof VideoFlags] }) {
  const toggle = async () => {
    const current = flags();
    const next: VideoFlags = {
      ...current,
      [key]: {
        ...current[key],
        value: !current[key].value,
      },
    };
    setFlags(next);
    await setLocalFlags(next);
  };

  return (
    <div class='flex items-center gap-2'>
      <Switch checked={flag.value} onChange={toggle}>
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
      </Switch>
      <label for={key} class='text-sm cursor-pointer'>{flag.label}</label>
    </div>
  );
}