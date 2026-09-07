/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emergency: {
          DEFAULT: "#E11D2E",
          dark: "#B0121F",
          light: "#FF5A63",
        },
        navy: {
          DEFAULT: "#0B1220",
          light: "#1B2536",
        },
        safe: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warn: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
      },
    },
  },
  plugins: [],
};
