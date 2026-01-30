import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        hashkey: {
          purple: "#9f6ffd",
          blue: "#2a64fb",
          black: "#000000",
          dark: "#17181e",
          surface: "#26272b",
          text: "#f4f4f5",
          muted: "#70707b",
          border: "#3f3f46",
          success: "#19bf86",
          error: "#f8495e",
          warning: "#ff9f2e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
