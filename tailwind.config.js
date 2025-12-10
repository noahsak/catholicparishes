/** @type {import('tailwindcss').Config} */
module.exports = {
  // UPDATED: Changed from "media" to "class" to align dark mode control
  // with the application's manual toggle, which sets the 'dark' class on the body.
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};