// tailwind.config.ts
import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "metlink-blue": "#0039A6", // Primary Metlink blue
        "metlink-dark-blue": "#002878", // Darker blue for hover states
        "metlink-green": "#78BE20", // Metlink green for CTAs
        "metlink-yellow": "#FDB913", // Metlink yellow for accents
      },
    },
  },
} as Config;