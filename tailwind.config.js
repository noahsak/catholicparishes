/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media", // or 'class' if you use a manual toggle
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
