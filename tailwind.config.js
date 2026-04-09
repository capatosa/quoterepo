/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#120f0d",
        paper: "#f7f2ea",
        accent: "#d97706",
        ink: "#221c18",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(217, 119, 6, 0.18)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        body: ['"Manrope"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
