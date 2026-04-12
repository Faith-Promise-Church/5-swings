import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./messages/**/*.json",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        "fp-slate": "#445557",
        "fp-teal": "#6F878D",
        "fp-lt-blue": "#A8CBD1",
        "fp-cream": "#F5F1EA",
        "fp-white": "#FFFFFF",
        "fp-line": "#E4DFD6",
        "fp-success": "#7A9B7E",
        "fp-error": "#B8665C",
      },
      borderRadius: {
        xl: "0.75rem",
        lg: "0.5rem",
        pill: "9999px",
      },
      boxShadow: {
        fp: "0 1px 3px rgba(68, 85, 87, 0.08), 0 1px 2px rgba(68, 85, 87, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
