import { cva, type VariantProps } from "class-variance-authority";

export const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-[#f0eee4] p-1 text-gray-500",
  {
    variants: {
      variant: {
        default: "w-full grid grid-cols-2",
        // Add any other variants here if needed
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type TabsListVariantProps = VariantProps<typeof tabsListVariants>;
