import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names with Tailwind CSS
 * Handles undefined values by filtering them out
 */
export const cn = (...classes: (string | undefined)[]) => {
  return twMerge(classes.filter((c): c is string => c !== undefined));
};