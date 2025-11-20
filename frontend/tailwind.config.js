/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      boxShadow: {
        floating: "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
      },
      borderRadius: {
        hero: "32px",
      },
    },
  },
  plugins: [],
}
