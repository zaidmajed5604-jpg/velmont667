import type { Config } from "tailwindcss";

/**
 * VELMONT Design System
 *
 * Palette is deliberately restrained: warm neutrals only, no saturated
 * accent color. Hierarchy is carried by type scale, weight, and spacing —
 * not color. This is the "quiet luxury" contract: nothing shouts.
 */
const config: Config = {
  darkMode: undefined, // light theme only, by design brief
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F7F4EE",
          50: "#FEFDFB",
          100: "#F7F4EE",
          200: "#F0EBE0",
        },
        paper: "#FFFFFF",
        beige: {
          DEFAULT: "#E7DFCF",
          light: "#F1EBDE",
          dark: "#D9CDB4",
        },
        brown: {
          DEFAULT: "#7C6A57",
          light: "#9C8B77",
          dark: "#4A3C30",
          deep: "#2E241C",
        },
        ink: {
          DEFAULT: "#14120F",
          light: "#302B24",
          muted: "#5C5348",
        },
        border: {
          DEFAULT: "#E3DACB",
          dark: "#C9BCA4",
        },
        success: "#4B5D45",
        error: "#8C3B2E",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["6rem", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        "display-xl": ["4.5rem", { lineHeight: "1.04", letterSpacing: "-0.01em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.08", letterSpacing: "-0.005em" }],
        "display-md": ["2.5rem", { lineHeight: "1.12" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.2em" }],
      },
      letterSpacing: {
        widest2: "0.25em",
        widest3: "0.35em",
      },
      maxWidth: {
        content: "1440px",
        prose: "68ch",
      },
      spacing: {
        section: "8rem",
        "section-sm": "5rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "2px",
        md: "4px",
        lg: "6px",
        pill: "999px",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
        1200: "1200ms",
      },
      boxShadow: {
        soft: "0 2px 24px rgba(20, 18, 15, 0.06)",
        card: "0 1px 2px rgba(20, 18, 15, 0.04), 0 8px 32px rgba(20, 18, 15, 0.06)",
        lift: "0 20px 48px rgba(20, 18, 15, 0.12)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": { from: { width: "0%" }, to: { width: "100%" } },
      },
      animation: {
        "fade-in": "fade-in 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up": "fade-up 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "draw-line": "draw-line 1200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
