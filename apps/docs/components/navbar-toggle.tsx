import { rootTogglePages } from "@/app/layout.config";
import Link from "next/link";

export default function NavbarToggle() {
  return (
    <div className="border-fd-foreground/5 bg-fd-foreground/5 flex gap-1 rounded-lg border-2 p-1 text-sm leading-none">
      {rootTogglePages.map((page, i) => (
        <Link
          href={page.url}
          className="hover:bg-fd-foreground/10 rounded-md px-1.5 py-1 opacity-60 transition-all hover:opacity-80"
        >
          {page.title}
        </Link>
      ))}
    </div>
  );
}
