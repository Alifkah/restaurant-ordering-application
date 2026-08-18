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
          DEFAULT: "#D9531E", // Deep Warm Terracotta / Amber
          hover: "#C04210",
          light: "#FFF3EB",
          dark: "#A3340A",
          50: "#FFF6F0",
          100: "#FEEDDF",
          200: "#FDCDBA",
          300: "#FAA88C",
          400: "#F57953",
          500: "#D9531E",
          600: "#C04210",
          700: "#9A320A",
          800: "#7C2A0E",
          900: "#65250E",
        },
        sand: {
          50: "#FCFAF7",
          100: "#F9F6F0", // Neutral Background Warm Sand
          200: "#F0EAE1",
          300: "#E3D9CB",
          400: "#CFC0AD",
          500: "#B8A38E",
        },
        obsidian: {
          900: "#0C0F12",
          800: "#12161A", // Clean Slate Charcoal for KDS / Dark mode
          700: "#1A2026",
          600: "#262F38",
          500: "#374350",
        },
        status: {
          pending: "#9CA3AF",
          confirmed: "#3B82F6",
          preparing: "#F59E0B",
          ready: "#10B981",
          completed: "#059669",
          cancelled: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "var(--font-plus-jakarta)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        button: "10px",
        badge: "8px",
      },
      boxShadow: {
        "elevation-1": "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        "elevation-2": "0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
        "elevation-3": "0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 6px 16px -4px rgba(0, 0, 0, 0.06)",
        "glow-terracotta": "0 0 24px -4px rgba(217, 83, 30, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
