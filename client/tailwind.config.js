/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        acme: ["Acme", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        "deep-purple-accent-400": "#7e57c2",
        "deep-purple-accent-700": "#512da8",
        "light-green": "#006833",
        "lighter-green" : "#BDFFB4",
        "primary-green" : "#006833",
        "secondary-green" : "#D6F8D1",
        "text-green" : "#006833"
      },
    },
  },
  plugins: [],
};
