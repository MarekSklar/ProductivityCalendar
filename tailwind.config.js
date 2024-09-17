/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue"
  ],
  theme: {
    colors: {
      "red": {
        50: "#FFE5E5",
        100: "#FFCCCC",
        200: "#FF9999",
        300: "#FF6666",
        400: "#FF3333",
        500: "#FF0000",
        600: "#CC0000",
        700: "#990000",
        800: "#660000",
        900: "#330000",
        950: "#190000"
      },
      "desaturatedRed": {
        50: "#FFF5F5",
        100: "#FFE5E5",
        200: "#FFCCCC",
        300: "#FFB3B3",
        400: "#FF9999",
        500: "#FF8282",
        600: "#FF3333",
        700: "#E60000",
        800: "#990000",
        900: "#4D0000",
        950: "#290000"
      },
      "gray": {
        50: "#f6f6f6",
        100: "#e7e7e7",
        200: "#d1d1d1",
        300: "#b0b0b0",
        400: "#888888",
        500: "#6d6d6d",
        600: "#5d5d5d",
        700: "#4f4f4f",
        800: "#454545",
        900: "#3d3d3d",
        950: "#0f0f0f",
      },
      "dark": {
        50: "#F3F2F2",
        100: "#E6E5E5",
        200: "#D0CDCD",
        300: "#B7B3B3",
        400: "#9E9999",
        500: "#878181",
        600: "#6B6666",
        700: "#514D4D",
        800: "#373434",
        900: "#1A1919",
        950: "#0D0C0C"
      },
      "white": "#FFF",
      "black": "#000",
      "transparent": "transparent"
    },
    extend: {
      width: {
        "wfa": "-webkit-fill-available"
      },
      spacing: {
        "1px": "1px",
        112: "28rem",
        128: "32rem",
        160: "40rem",
        192: "48rem"
      }
    },
  },
  plugins: [],
}
