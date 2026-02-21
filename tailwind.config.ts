import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          primaryHover: "var(--brand-primary-hover)",
          secondary: "var(--brand-secondary)",
          base: "var(--brand-base)",
          text: "var(--brand-text)",
        },
        state: {
          positive: "var(--state-positive)",
          risk: "var(--state-risk)",
          warning: "var(--state-warning)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
