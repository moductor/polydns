import { createPreset } from "fumadocs-ui/tailwind-plugin";
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./mdx-components.{ts,tsx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  presets: [createPreset()],
  theme: {
    extend: {
      fontFamily: {
        accent: ["var(--font-kanit)", ...fontFamily.sans],
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
};
