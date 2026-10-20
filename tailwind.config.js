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
          50: "#f0f4ff",
          100: "#e3eaff",
          200: "#c7d6ff",
          300: "#aabdff",
          400: "#8da2ff",
          500: "#6f86ff",
          600: "#5666e8",
          700: "#3f4bc9",
          800: "#2f39a3",
          900: "#242c7d",
        },
        surface: {
          light: "#f8fafc",
          dark: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "gk": "10px",
      },
    },
  },
  plugins: [],
}
