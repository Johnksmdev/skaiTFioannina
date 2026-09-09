import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06090f",
        panel: "#0c1421",
        line: "#26333e",
        muted: "#64748b",
        "cyber-blue": "#06b6d4",
        "cyber-light": "#67e8f9",
        "cyber-purple": "#a855f7",
        "cyber-emerald": "#10b981",
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
