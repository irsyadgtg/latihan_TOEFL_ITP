/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ini akan memindai semua file relevan di dalam folder src
  ],
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors : {
        primary: "#B6252A",
        secondary: "#EDC968",
        textHeader: "#8E8E8E",
        borderColor: "#FF6B6B",
      },
    },
  },
  plugins: [],
};
