import type { CheckboxControlProps } from '@kobalte/core/checkbox'
import { Checkbox as CheckboxPrimitive } from '@kobalte/core/checkbox'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { ValidComponent, VoidProps } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export const CheckboxLabel = CheckboxPrimitive.Label
export const Checkbox = CheckboxPrimitive
export const CheckboxErrorMessage = CheckboxPrimitive.ErrorMessage
export const CheckboxDescription = CheckboxPrimitive.Description

type checkboxControlProps<T extends ValidComponent = 'div'> = VoidProps<
  CheckboxControlProps<T> & { class?: string }
>

/**
 * CheckboxControl component with shadcn-style styling
 * Supports checked, unchecked, indeterminate, disabled, and invalid states
 * Includes dark mode support and sophisticated focus/ring styles
 */
export const CheckboxControl = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, checkboxControlProps<T>>,
) => {
  const [local, rest] = splitProps(props as checkboxControlProps, ['class', 'children'])

  return (
    <>
      <CheckboxPrimitive.Input class='[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-[1.5px] [&:focus-visible+div]:ring-ring [&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background' />
      <CheckboxPrimitive.Control
        class={cn(
          // Base styles
          'relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background bg-clip-padding shadow-xs outline-none ring-ring transition-shadow',
          // Before pseudo-element for shadow effects
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-[3px]',
          // Unchecked state shadow (light mode)
          'not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)]',
          // Focus visible styles
          'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          // Invalid/error states
          'aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48',
          // Disabled state
          'data-disabled:opacity-64',
          // Responsive size
          'sm:size-4',
          // Dark mode styles
          'dark:not-data-checked:bg-input/32 dark:bg-clip-border dark:aria-invalid:ring-destructive/24',
          'dark:not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          // Remove shadow for disabled, checked, or invalid states
          '[[data-disabled],[data-checked],[aria-invalid]]:shadow-none',
          // Checked state
          'data-checked:bg-primary data-checked:text-primary-foreground',
          // Disabled cursor
          'data-disabled:cursor-not-allowed',
          local.class,
        )}
        data-slot='checkbox'
        {...rest}
      >
        <CheckboxPrimitive.Indicator
          class='-inset-px absolute flex items-center justify-center rounded-[4px] text-primary-foreground data-unchecked:hidden data-checked:bg-primary data-indeterminate:text-foreground'
          data-slot='checkbox-indicator'
        >
          {/* Indeterminate state icon */}
          <svg
            class='size-3.5 sm:size-3 hidden'
            fill='none'
            height='24'
            stroke='currentColor'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='3'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <title>Indeterminate</title>
            <path d='M5.252 12h13.496' />
          </svg>
          {/* Checked state icon */}
          <svg
            class='size-3.5 sm:size-3 hidden'
            fill='none'
            height='24'
            stroke='currentColor'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='3'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <title>Checked</title>
            <path d='M5.252 12.7 10.2 18.63 18.748 5.37' />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Control>
    </>
  )
}
