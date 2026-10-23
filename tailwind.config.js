/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gk: {
          50: "#f0f7ff",
          100: "#e0eaff",
          200: "#c7d9ff",
          300: "#a5c4ff",
          400: "#82adff",
          500: "#6386ff",
          600: "#4f46e5",
          700: "#3f3dc9",
          800: "#322e9f",
          900: "#28257d",
          950: "#1c1a5c",
          'primary-light': "#eef2ff",
          'accent-light': "#d1fae5",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        surface: {
          light: "#ffffff",
          dark: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "gk": "12px",
        "gk-sm": "8px",
        "gk-lg": "16px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
}
