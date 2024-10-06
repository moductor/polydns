import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-fd-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90",
        outline:
          "border border-fd-border bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground",
        secondary:
          "bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-secondary/80",
        ghost: "hover:bg-fd-accent hover:text-fd-accent-foreground",
        link: "text-fd-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export default function Button({
  asChild,
  variant,
  size,
  className,
  ...props
}: JSX.IntrinsicElements["button"] &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={buttonVariants({ variant, size, className })} {...props} />
  );
}
