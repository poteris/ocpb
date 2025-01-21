import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Generalized to include all necessary files in `src`
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        pcsprimary: {
          "01": "var(--pcsprimary-01)",
          "02": "var(--pcsprimary-02)",
          "03": "var(--pcsprimary-03)",
          "04": "var(--pcsprimary-04)",
          "05": "var(--pcsprimary-05)",
          "06": "var(--pcsprimary-06)",
          "01-light": "var(--pcsprimary01-light)",
        },
        // Secondary Colors
        pcssecondary: {
          "01": "var(--pcssecondary-01)",
          "02": "var(--pcssecondary-02)",
          "03": "var(--pcssecondary-03)",
          "04": "var(--pcssecondary-04)",
          "05": "var(--pcssecondary-05)",
          "06": "var(--pcssecondary-06)",
          "07": "var(--pcssecondary-07)",
          "08": "var(--pcssecondary-08)",
        },
      },
      fontFamily: {
        "roboto-slab": ["var(--font-roboto-slab)", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "media", 
};

export default config;
