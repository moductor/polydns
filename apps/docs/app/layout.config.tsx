import { type HomeLayoutProps } from "fumadocs-ui/home-layout";
import { Book } from "lucide-react";

export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <span className="font-accent font-medium text-xl">
        <span className="text-amber-600 dark:text-amber-500">Poly</span>DNS
      </span>
    ),
    transparentMode: "top",
  },
  githubUrl: "https://github.com/moductor/polydns",
  links: [
    {
      icon: <Book />,
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
