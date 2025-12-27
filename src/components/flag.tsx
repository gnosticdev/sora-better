import type { Component } from 'solid-js'
import { Switch, SwitchControl, SwitchThumb } from '@/components/ui/switch'
import type { VideoFlags } from '@/lib/shared'

/**
 * Flag component - renders a switch for each video flag
 */
export const Flag: Component<{
  key: keyof VideoFlags
  flag: VideoFlags[keyof VideoFlags]
  toggle: () => void
}> = (props) => {
  return (
    <div class='flex items-center gap-2'>
      <Switch
        checked={props.flag.value}
        onChange={props.toggle}
      >
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
      </Switch>
      <label
        for={props.key}
        class='text-sm cursor-pointer'
      >
        {props.flag.label}
      </label>
    </div>
  )
}
