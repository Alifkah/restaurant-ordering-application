import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D9531E", // Deep Terracotta Accent
          hover: "#C04210",
          light: "#FFF3EB",
          dark: "#A73400",
          50: "#FFF6F0",
          100: "#FEEDDF",
          200: "#FDCDBA",
          300: "#FAA88C",
          400: "#F57953",
          500: "#D9531E",
          600: "#A73400",
          700: "#822700",
          800: "#5D1C00",
          900: "#390C00",
        },
        terracotta: {
          DEFAULT: "#D9531E",
          50: "#FFF6F0",
          100: "#FEEDDF",
          200: "#FDCDBA",
          300: "#FAA88C",
          400: "#F57953",
          500: "#D9531E",
          600: "#A73400",
          700: "#822700",
          800: "#5D1C00",
          900: "#390C00",
        },
        sand: {
          50: "#FCFAF7",
          100: "#F9F6F0", // Warm Sand Neutral Background
          200: "#F0EAE1",
          300: "#E3D9CB",
          400: "#CFC0AD",
          500: "#B8A38E",
        },
        kds: {
          bg: "#12161A", // Dark Slate Charcoal for KDS
          surface: "#1C2127", // Deep Slate ticket container
          card: "#222830",
          border: "#2D343E",
          text: "#F0F3F6",
          muted: "#94A3B8",
        },
        obsidian: {
          950: "#0A0D0F",
          900: "#12161A",
          800: "#1C2127",
          700: "#2A313A",
          600: "#3C4550",
          500: "#55606E",
        },
        status: {
          pending: "#3B82F6",
          confirmed: "#6366F1",
          preparing: "#F59E0B",
          ready: "#10B981",
          completed: "#059669",
          cancelled: "#BA1A1A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "8px",
        badge: "9999px",
      },
      boxShadow: {
        "elevation-1": "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        "elevation-2": "0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
        "elevation-3": "0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 6px 16px -4px rgba(0, 0, 0, 0.06)",
        "glow-terracotta": "0 0 24px -4px rgba(217, 83, 30, 0.35)",
        "glow-ready": "0 0 20px -3px rgba(16, 185, 129, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
