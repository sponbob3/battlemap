import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#1a1f2e",
        olive: "#3d4a2a",
        sand: "#c4a86b",
        "muted-red": "#8b3a3a",
        "muted-blue": "#3a5a8b",
      },
    },
  },
  plugins: [],
};

export default config;
