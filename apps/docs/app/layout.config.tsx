import NavbarToggle from "@/components/navbar-toggle";
import RootToggleIcon from "@/components/root-toggle-icon";
import { RootToggle } from "fumadocs-ui/components/layout/root-toggle";
import { type HomeLayoutProps } from "fumadocs-ui/home-layout";
import { type DocsLayoutProps } from "fumadocs-ui/layout";
import {
  Blocks,
  Book,
  Library,
  type LucideIcon,
  SquareTerminal,
} from "lucide-react";
import { source } from "./source";

type RootToggleOption = Parameters<typeof RootToggle>[0]["options"][number];
type RootTogglePage = Omit<RootToggleOption, "icon"> & {
  icon: LucideIcon;
  className?: string;
};

export const rootTogglePages: RootTogglePage[] = [
  {
    title: "Core",
    description: "Core library",
    url: "/docs/core",
    icon: Library,
    className: "bg-amber-600/50 dark:bg-amber-500/50",
  },
  {
    title: "CLI",
    description: "Command line program",
    url: "/docs/cli",
    icon: SquareTerminal,
    className: "bg-sky-600/50 dark:bg-sky-500/50",
  },
  {
    title: "Providers",
    description: "Supported DNS providers",
    url: "/docs/providers",
    icon: Blocks,
    className: "bg-purple-600/50 dark:bg-purple-500/50",
  },
];

export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <span className="font-accent text-xl font-medium">
        <span className="text-amber-600 dark:text-amber-500">Poly</span>DNS
      </span>
    ),
    transparentMode: "top",
  },
  githubUrl: "https://github.com/moductor/polydns",
  links: [],
};

export const homeOptions: HomeLayoutProps = {
  ...baseOptions,
  nav: {
    ...baseOptions.nav,
    children: <NavbarToggle />,
  },
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    banner: (
      <RootToggle
        options={rootTogglePages.map(({ icon, className, ...p }) => ({
          ...p,
          icon: <RootToggleIcon icon={icon} className={className} />,
        }))}
      />
    ),
  },
  links: [
    {
      icon: <Book />,
      text: "Documentation",
      url: "/docs/core",
      active: "none",
    },
  ],
};
