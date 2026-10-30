import type { Config } from "tailwindcss";

// Tokens mirror the Figma "Color" and type variables. Colours are RGB channels
// in index.css so Tailwind's /opacity modifiers work.
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: rgb("--bg"),
        surface: { DEFAULT: rgb("--surface"), 2: rgb("--surface-2"), 3: rgb("--surface-3") },
        fg: { DEFAULT: rgb("--fg"), 2: rgb("--fg-2"), 3: rgb("--fg-3"), inverse: rgb("--fg-inverse") },
        accent: { DEFAULT: rgb("--accent"), hover: rgb("--accent-hover") },
        live: rgb("--live"),
        danger: rgb("--danger"),
        line: {
          DEFAULT: "rgb(255 255 255 / 0.07)",
          2: "rgb(255 255 255 / 0.11)",
          3: "rgb(255 255 255 / 0.2)",
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.25rem, 8.6vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.05em" }],
        // Home hero: scales with height too, so the whole hero fits one screen.
        hero: ["min(12.5vw, 9.5svh, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.05em" }],
        "display-l": ["clamp(3rem, 6.6vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.045em" }],
        "display-m": ["clamp(2.25rem, 4.4vw, 4rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        h1: ["clamp(2rem, 3.4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.625rem, 2.5vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        h3: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        h4: ["1.1875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-l": ["1.1875rem", { lineHeight: "1.6", letterSpacing: "-0.005em" }],
        label: ["0.75rem", { lineHeight: "1", letterSpacing: "0.06em" }],
        meta: ["0.8125rem", { lineHeight: "1.4" }],
      },
      maxWidth: { wrap: "1200px", prose: "680px" },
      borderRadius: { card: "16px", media: "20px" },
      transitionTimingFunction: { out: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
