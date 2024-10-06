import { cn } from "@/utils/cn";
import { type LucideIcon } from "lucide-react";

export default function RootToggleIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "from-fd-background/80 mb-auto rounded-lg border-2 bg-gradient-to-t p-2 shadow-sm",
        className,
      )}
    >
      <Icon className="size-5" />
    </div>
  );
}
