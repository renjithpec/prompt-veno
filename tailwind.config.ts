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
        card: "8px"
      }
    }
  },
  plugins: [animate]
};

export default config;
