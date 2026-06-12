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
        background: "#050505",
        panel: "#090909",
        panel2: "#0D0D0D",
        accent: {
          DEFAULT: "#D6FF7F",
          bright: "#B8FF4F",
          deep: "#9EF01A"
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
