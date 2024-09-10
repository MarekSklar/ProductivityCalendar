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
      "green": {
        50: "#F3FCF4",
        100: "#E7F8EA",
        200: "#D0F1D4",
        300: "#B8EABF",
        400: "#A0E3A9",
        500: "#89DC94",
        600: "#71D57E",
        700: "#58CE68",
        800: "#2C963A",
        900: "#164B1D",
        950: "#0C270F"
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
        112: "28rem",
        128: "32rem",
        160: "40rem",
        192: "48rem"
      }
    },
  },
  plugins: [],
}
