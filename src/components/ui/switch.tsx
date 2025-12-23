import { cn } from "@/lib/utils";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type {
	SwitchControlProps,
	SwitchThumbProps,
} from "@kobalte/core/switch";
import { Switch as SwitchPrimitive } from "@kobalte/core/switch";
import type { ParentProps, ValidComponent, VoidProps } from "solid-js";
import { splitProps } from "solid-js";

/**
 * Switch component exports - re-exported from Kobalte primitives
 */
export const SwitchLabel = SwitchPrimitive.Label;
export const Switch = SwitchPrimitive;
export const SwitchErrorMessage = SwitchPrimitive.ErrorMessage;
export const SwitchDescription = SwitchPrimitive.Description;

/**
 * Props for SwitchControl component
 */
type switchControlProps<T extends ValidComponent = "input"> = ParentProps<
	SwitchControlProps<T> & { class?: string }
>;

/**
 * SwitchControl component - handles the switch track/container
 * Applies the root-level styles from the original component
 */
export const SwitchControl = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, switchControlProps<T>>,
) => {
	const [local, rest] = splitProps(props as switchControlProps, [
		"class",
		"children",
	]);

	return (
		<>
			<SwitchPrimitive.Input class="[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-[1.5px] [&:focus-visible+div]:ring-ring [&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background" />
			<SwitchPrimitive.Control
				class={cn(
					"group/switch inset-shadow-[0_1px_--theme(--color-black/4%)] inline-flex h-5.5 w-9.5 shrink-0 items-center rounded-full p-px outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64 sm:h-4.5 sm:w-7.5",
					local.class,
				)}
				data-slot="switch"
				{...rest}
			>
				{local.children}
			</SwitchPrimitive.Control>
		</>
	);
};

/**
 * Props for SwitchThumb component
 */
type switchThumbProps<T extends ValidComponent = "div"> = VoidProps<
	SwitchThumbProps<T> & { class?: string }
>;

/**
 * SwitchThumb component - handles the switch thumb/indicator
 * Applies the thumb-level styles from the original component
 */
export const SwitchThumb = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, switchThumbProps<T>>,
) => {
	const [local, rest] = splitProps(props as switchThumbProps, ["class"]);

	return (
		<SwitchPrimitive.Thumb
			class={cn(
				"pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-[translate,width] group-active/switch:not-data-disabled:w-5.5 data-checked:translate-x-4 data-unchecked:translate-x-0 data-checked:group-active/switch:translate-x-3.5 sm:size-4 sm:data-checked:translate-x-3 sm:group-active/switch:not-data-disabled:w-4.5 sm:data-checked:group-active/switch:translate-x-2.5",
				local.class,
			)}
			data-slot="switch-thumb"
			{...rest}
		/>
	);
};
