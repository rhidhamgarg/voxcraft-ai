import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Base semantic tokens
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Premium Palette (Deep Charcoal, Warm Ivory, Slate, Deep Navy, Steel Blue)
        charcoal: {
          DEFAULT: "#17191F",
          50: "#2B2E37",
          100: "#252831",
          200: "#1F2229",
          300: "#1A1D23",
          400: "#17191F",
          500: "#13151A",
          600: "#0F1014",
        },
        offwhite: "#F7F6F2",
        ivory: {
          DEFAULT: "#EEECE5",
          light: "#F7F6F2",
          dark: "#E3E0D6",
        },
        slate: {
          DEFAULT: "#737783",
          muted: "#8B8F9A",
          dark: "#5A5D67",
        },
        navy: {
          DEFAULT: "#17263C",
          surface: "#1D2B3F",
          dark: "#121E2F",
        },
        steelblue: {
          DEFAULT: "#52677D",
          light: "#647A92",
          dark: "#415264",
        },
        silver: {
          DEFAULT: "#D9DCE1",
          subtle: "rgba(217, 220, 225, 0.08)",
          border: "rgba(217, 220, 225, 0.12)",
        },
        warmgrey: "#A6A39D",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        heading: [
          "Brockmann",
          "var(--font-heading)",
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.025em",
        snug: "-0.015em",
        normal: "-0.006em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      lineHeight: {
        display: "1.12",
        heading: "1.2",
        subheading: "1.3",
        body: "1.55",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        soundWave: {
          "0%": { height: "15%" },
          "100%": { height: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sound-wave": "soundWave 1.2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
