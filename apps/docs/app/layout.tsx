import clsx from "clsx";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter, Kanit } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const kanit = Kanit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-kanit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={clsx(kanit.variable, inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
