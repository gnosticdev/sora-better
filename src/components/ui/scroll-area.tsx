import type { PolymorphicProps } from '@kobalte/core'
import type { ScrollbarsProps } from 'solid-custom-scrollbars'
import ScrollAreaPrimitive from 'solid-custom-scrollbars'
import type { ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

export type ScrollAreaProps = ScrollbarsProps

export const ScrollArea = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ScrollAreaProps>,
) => {
  const [local, rest] = splitProps(props, ['children'])

  return <ScrollAreaPrimitive {...rest}>{local.children}</ScrollAreaPrimitive>
}
