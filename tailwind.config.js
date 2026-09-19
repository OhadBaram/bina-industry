/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // חשוב במיוחד כי App.tsx שלך נמצא בשורש
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        assistant: ['Assistant', 'sans-serif'],
      },
    },
  },
  plugins: [],
}