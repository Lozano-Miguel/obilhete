import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bilhete: {
          bg: "#0a0a0a",
          card: "#111111",
          accent: "#e8c547",
          muted: "#888888",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

