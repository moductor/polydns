import { cn } from "@/utils/cn";
import { forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground border-fd-border rounded-2xl border-2 shadow-lg",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, JSX.IntrinsicElements["h3"]>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  JSX.IntrinsicElements["p"]
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
