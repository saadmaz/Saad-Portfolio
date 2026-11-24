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
          DEFAULT: "rgb(var(--ink) / 0.07)",
          2: "rgb(var(--ink) / 0.11)",
          3: "rgb(var(--ink) / 0.2)",
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
        ink: ["Covered By Your Grace", "cursive"],
      },
      fontSize: {
        "display-xl": ["clamp(3.25rem, 8.6vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.05em" }],
        // Home hero: scales with height too, so the whole hero fits one screen.
        hero: ["min(12.5vw, 9.5svh, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.05em" }],
        // Desktop hero shares the row with the portrait, so it is also capped by column width.
        "hero-lg": ["min(7.2vw, 9.5svh, 6rem)", { lineHeight: "0.92", letterSpacing: "-0.05em" }],
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
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fill-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "word-in": {
          from: { transform: "translateY(105%)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "react-pop": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "35%": { transform: "scale(1.32) rotate(-8deg)" },
          "65%": { transform: "scale(0.94) rotate(2deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "count-in": {
          from: { opacity: "0", transform: "translateY(5px)", filter: "blur(2px)" },
          to: { opacity: "1", transform: "none", filter: "none" },
        },
      },
      animation: {
        rise: "rise 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fill-x": "fill-x 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "word-in": "word-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 48s linear infinite",
        "react-pop": "react-pop 450ms cubic-bezier(0.16, 1, 0.3, 1)",
        "count-in": "count-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
