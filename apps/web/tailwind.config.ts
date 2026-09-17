import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f4efe4",
        ink: "#1c2a22",
        brand: "#e86f2d",
        "brand-dark": "#c9561f",
        clay: "#b84a32",
        card: "#fffaf2",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
