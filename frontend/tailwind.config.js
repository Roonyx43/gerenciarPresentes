/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: {
          50: "#fff5f7",
          100: "#ffeaf1",
          300: "#fbb6ce",
          500: "#ec4899",
          700: "#be185d",
        },
      },
    },
  },
  plugins: [],
};
