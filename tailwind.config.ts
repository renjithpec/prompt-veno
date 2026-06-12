import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        panel: "hsl(var(--panel) / <alpha-value>)",
        panel2: "hsl(var(--panel2) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
        }
      },
      boxShadow: {
        glow: "0 0 45px rgba(184,255,79,0.22)"
      },
      borderRadius: {
        card: "24px"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"]
      },
      keyframes: {
        "logo-spin": {
          "0%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
          "50%": { transform: "rotateY(180deg) scale(0.88)", opacity: "0.7" },
          "100%": { transform: "rotateY(360deg) scale(1)", opacity: "1" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        }
      },
      animation: {
        "logo-spin": "logo-spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        shimmer: "shimmer 2s infinite",
        blob: "blob 7s infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
