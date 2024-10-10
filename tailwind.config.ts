import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/screens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pcsprimary-01': 'var(--pcsprimary-01)',
        'pcsprimary-02': 'var(--pcsprimary-02)',
        'pcsprimary-03': 'var(--pcsprimary-03)',
        'pcsprimary-04': 'var(--pcsprimary-04)',
        'pcsprimary-05': 'var(--pcsprimary-05)',
        'pcsprimary-06': 'var(--pcsprimary-06)',
        'pcsprimary01-light': 'var(--pcsprimary01-light)',
        'pcsprimary02-light': 'var(--pcsprimary02-light)',
        'pcssecondary-01': 'var(--pcssecondary-01)',
        'pcssecondary-02': 'var(--pcssecondary-02)',
        'pcssecondary-03': 'var(--pcssecondary-03)',
        'pcssecondary-04': 'var(--pcssecondary-04)',
        'pcssecondary-05': 'var(--pcssecondary-05)',
        'pcssecondary-06': 'var(--pcssecondary-06)',
        'pcssecondary-07': 'var(--pcssecondary-07)',
        'pcssecondary-08': 'var(--pcssecondary-08)',
      },
    },
  },
  plugins: [],
};
export default config;
